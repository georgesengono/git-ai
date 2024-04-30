import { ChromaClient } from "chromadb";
import { OpenAIEmbeddingFunction } from "chromadb"; 
import { TextChunk } from "../../common/types";
import { exec, ChildProcess, spawn } from "child_process";

// TO add private keys (watch this video): https://www.youtube.com/watch?v=61kaK-e3Owc
class Chroma {
    static instance: Chroma | null = null;
    private client: ChromaClient;
    private OPENAI_API_KEY: string;
    private embedder: OpenAIEmbeddingFunction;
    private childProcess: ChildProcess | null = null;
    private ChromaContainerName: string = "GITAI_CHROMA_CONTAINER";

    constructor(openai_api_key: string) {
        this.childProcess = null;
        this.client = new ChromaClient({ path: "http://0.0.0.0:8000" });
        this.OPENAI_API_KEY = openai_api_key
        this.embedder = new OpenAIEmbeddingFunction({
            openai_api_key: this.OPENAI_API_KEY,
        });
    }

    /**
     * Get the Chroma instance.
     * 
     * @param openai_api_key the Open
     */
    static async getChroma(openai_api_key: string) {
        if (this.instance === null) {
            this.instance = new this(openai_api_key);
        }

        return this.instance;
    }
     
    /**
     * Pull Chroma Docker image.
     */
    async pullChroma(): Promise<void>{
        // Pull the chroma docker image
        console.log("Pulling Chroma image...");
        this.childProcess = exec("docker pull chromadb/chroma", (error, stdout, stderr) => {
            if (error) {
                console.error(`exec error: ${error}`);
                return;
            }
            if (stderr) {
                console.error(`stderr: ${stderr}`);
                return;
            }

            // console.log(`stdout: ${stdout}`);
        });
                
        // wait for the process to exit to resolve the promise
        await new Promise<void>((resolve) => {
            this.childProcess?.on('exit', (code) => {
            if (code === 0) {
                console.log("Chroma image pulled successfully ✅");
                this.childProcess?.kill();
                this.childProcess = null;
            }
            resolve();
            });
        });
    }

    async linkChromaFolder() {
        console.log("Linking Chroma folder...");
        const currentPath = process.cwd().replace("/src", "/chroma");
        this.childProcess = spawn("docker run -d --name " + this.ChromaContainerName + " -p 8000:8000 -v " + this.cleanPath(currentPath) + ":/chroma/chroma chromadb/chroma", {shell: true});
        
        this.childProcess.stdout?.on('data', (data) => {
            // console.log(`stdout: ${data}`);
        });

        this.childProcess.stderr?.on('data', (data) => {
            console.error(`stderr: ${data}`);
        });

        await new Promise((resolve) => setTimeout(resolve, 5000)).then(() => {
            this.childProcess?.kill();
            this.childProcess = null;
            console.log("Chroma folder linked successfully ✅");
        });
    }

    /**
     * Run Chroma Docker image.
     */
    async runChroma() {
        // Run the chroma docker image
        console.log("Running Chroma image...");
        this.childProcess = await exec("docker start " + this.ChromaContainerName, (error, stdout, stderr) => {
            if (error) {
                console.error(`exec error: ${error}`);
                return;
            }
            if (stderr) {
                console.error(`stderr: ${stderr}`);
                return;
            }

            // console.log(`stdout: ${stdout}`);
        });

        await new Promise<void>((resolve) => {
            this.childProcess?.on('exit', (code) => {
                if (code === 0) {
                    console.log("Chroma image started successfully ✅");
                    this.childProcess?.kill();
                    this.childProcess = null;
                }
                resolve();
            });
        });
    }

    /**
     * Replace spaces in a path with a pattern to avoid issues with the exec command.
     * @param path 
     * @returns 
     */
    cleanPath(path: string): string {
        const patternToRemove = "@&@"

        while (path.includes(" ")) {
            path = path.replace(" ", `\\${patternToRemove}`);
        }

        while (path.includes(patternToRemove)) {
            path = path.replace(patternToRemove, " ");
        }

        return path;
    }

    /**
     * Stop Chroma Docker image.
     */
    async stopChroma() {
        exec("docker stop " + this.ChromaContainerName, (error, stdout, stderr) => {
            if (error) {
                console.error(`exec error: ${error}`);
                return;
            }
            if (stderr) {
                console.error(`stderr: ${stderr}`);
                return;
            }

            // console.log(`stdout: ${stdout}`);
        });

        await new Promise<void>((resolve) => {
            this.childProcess?.on('exit', (code) => {
                if (code === 0) {
                    console.log("Chroma image stopped successfully ✅");
                    this.childProcess?.kill();
                    this.childProcess = null;
                }
                resolve();
            });
        });
    }

    /**
     * Creates a new collection in the database if the collection does not already exist.
     * 
     * @param collectionName the name of the collection to create.
     */
    async createCollection(collectionName: string) {
        if (!collectionName || collectionName.length === 0 || collectionName === undefined) {
            throw new Error("Invalid collection name");
        }

        await this.client.getOrCreateCollection({name: collectionName});
    }

    /**
     * Peeks at the first n elements of a collection.
     * 
     * @param collectionName the name of the collection to peek at.
     * @param n the number of elements to peek at.
     * @returns the first n elements of the collection.
     */
    async peek(collectionName: string) {
        const collection = await this.client.getCollection({name: collectionName, embeddingFunction: this.embedder});
        if (!collection) {
            throw new Error("Collection not found");
        }
        
        return collection.peek();;
    }

    /**
     * Counts the number of elements in a collection.
     * 
     * @param collectionName the name of the collection to count.
     * @returns the number of elements in the collection.
     */
    async count(collectionName: string) {
        const collection = await this.client.getCollection({name: collectionName, embeddingFunction: this.embedder});
        if (!collection) {
            throw new Error("Collection not found");
        }

        return collection.count();;
    }

    /**
     * Deletes a collection from the database.
     * 
     * @param collectionName 
     */
    async deleteCollection(collectionName: string) {
        await this.client.deleteCollection({name: collectionName});
    }

    /**
     * Inserts a list of text chunks into the vector database.
     * 
     * @param collectionName the name of the collection to insert the chunks into.
     * @param chunks the list of text chunks to insert.
     */
    async insert(collectionName: string, ids: string[], metadatas: any[], documents: string[]) {
        const collection = await this.client.getCollection({name: collectionName, embeddingFunction: this.embedder});
        if (!collection) {
            throw new Error("Collection not found");
        }

        const embeddings = await this.getEmbeddings(documents);

        await collection.add({
            ids: ids,
            metadatas: undefined,
            documents: documents,
            embeddings: embeddings,
        });
    }

    /**
     * Inserts a list of text chunks into the vector database.
     * 
     * @param collectionName the name of the collection to insert the chunks into.
     * @param chunks the list of text chunks to insert.
     */
    async insertChunks(collectionName: string, chunks: TextChunk[]) {
        const collection = await this.client.getCollection({name: collectionName, embeddingFunction: this.embedder});
        if (!collection) {
            throw new Error("Collection not found");
        }

        const failedChunks: TextChunk[] = [];

        let n = chunks.length / 20;
        let remainder = chunks.length % 20;

        for (let i = 0; i < n; i++) {
            let chunk = chunks.slice(i * 20, (i + 1) * 20);
            let documents = chunk.map((chunk) => chunk.text);
            let ids = chunk.map((chunk) => chunk.index.toString());
            try {
                await collection.add({
                    ids: ids,
                    metadatas: undefined,
                    documents: documents,
                });
            } catch (error) {
                failedChunks.push(...chunk);
            }

            console.log(`Progress: ${i * 20 / chunks.length * 100}%`);
        }

        let chunk = chunks.slice(n * 20, n * 20 + remainder);
        let documents = chunk.map((chunk) => chunk.text);
        let ids = chunk.map((chunk) => chunk.text);

        try {
            await collection.add({
                ids: ids,
                metadatas: undefined,
                documents: documents,
            });
        }
        catch (error) {
            failedChunks.push(...chunk);
        }
        
        console.log(failedChunks);
    }

    /**
     * Generates embeddings for a given text.
     * 
     * @param text the text to generate embeddings for.
     * @returns the embeddings for the given text.
     */
    private async getEmbedding(text: string) {
        try {
            return this.embedder.generate([text]);
        } catch (error) {
            console.log(error);
            console.log("Unable to generate embeddings: ", text);
            throw new Error("Unable to generate embeddings");
        }
    }

    /**
     * Generates embeddings for a list of texts.
     * 
     * @param texts the list of texts to generate embeddings for.
     * @returns the embeddings for the given texts.
     */
    private async getEmbeddings(texts: string[]) {
        try {
            return this.embedder.generate(texts);
        } catch (error) {
            console.log(error);
            console.log("Unable to generate embeddings: ", texts);
            throw new Error("Unable to generate embeddings");
        }
    }

    /**
     * Queries the database for a given query.
     * 
     * @param collectionName the name of the collection to query.
     * @param q the query to search for.
     * @returns the result of the query.
     */
    async query(collectionName: string, q: string) {
        const collection = await this.client.getCollection({name: collectionName, embeddingFunction: this.embedder});
        if (!collection) {
            throw new Error("Collection not found");
        }

        let qEmbeddings = await this.getEmbedding(q);
        let result = collection.query({queryEmbeddings: qEmbeddings, queryTexts: [q], nResults: 1 });

        return result;
    }

    /**
     * Resets the database.
     * 
     * This method will reset the database. This operation is destructive and irreversible.
     * For this reason, it asks for user confirmation before proceeding.
     * 
     * @returns
     */
    async reset(askForConfirmation: boolean = true) {
        let userInput = process.stdin.read();
        if (userInput === "y") {
            await this.client.reset();
        } else {
            console.log("Operation cancelled");
        }
    }
}

export async function peek(collectionName: string, openai_api_key: string) {
    const chroma = await Chroma.getChroma(openai_api_key);
    return await chroma.peek(collectionName);
}

export async function count(collectionName: string, openai_api_key: string) {
    const chroma = await Chroma.getChroma(openai_api_key);
    return await chroma.count(collectionName);
}

export async function create(collectionName: string, openai_api_key: string) {
    const chroma = await Chroma.getChroma(openai_api_key);
    return await chroma.createCollection(collectionName);
}

export async function deleteChromaCollection(collectionName: string, openai_api_key: string) {
    const chroma = await Chroma.getChroma(openai_api_key);
    return await chroma.deleteCollection(collectionName);
}

export async function insert(collectionName: string, ids: string[], metadatas: any[], documents: string[], openai_api_key: string) {
    const chroma = await Chroma.getChroma(openai_api_key);
    return await chroma.insert(collectionName, ids, metadatas, documents);
}

export async function query(collectionName: string, q: string, openai_api_key: string) {
    const chroma = await Chroma.getChroma(openai_api_key);
    return await chroma.query(collectionName, q);
}

export async function pullChromaImage(openai_api_key: string) {
    const chroma = await Chroma.getChroma(openai_api_key);
    return await chroma.pullChroma();
}

export async function runChromaImage(openai_api_key: string) {
    const chroma = await Chroma.getChroma(openai_api_key);
    return await chroma.runChroma();
}

export async function stopChromaImage(openai_api_key: string) {
    const chroma = await Chroma.getChroma(openai_api_key);
    return await chroma.stopChroma();
}

export async function linkChromaFolder(openai_api_key: string) {
    const chroma = await Chroma.getChroma(openai_api_key);
    return await chroma.linkChromaFolder();
}