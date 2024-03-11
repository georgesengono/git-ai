import { ChromaClient } from "chromadb";
import { OpenAIEmbeddingFunction } from "chromadb"; 
import { TextChunk } from "./types";

// Start the Chroma backend server: chroma run --path /db_path
// http://localhost:8000/api/v1/collections

// To update chroma to the latest version: docker pull chromadb/chroma
// To run chroma (in chroma folder): docker run -p 8000:8000 -v /Users/garthur007/Desktop/Université/Session\ VI/IFT\ 3150/chroma:/chroma/chroma chromadb/chroma

// TO add private keys (watch this video): https://www.youtube.com/watch?v=61kaK-e3Owc

export class ChromaWrapper {
    private client: ChromaClient;
    private OPENAI_API_KEY: string;
    private embedder: OpenAIEmbeddingFunction;

    constructor(openai_api_key: string) {
        if (!openai_api_key || openai_api_key.length === 0 || openai_api_key === undefined) {
            throw new Error("Invalid API key");
        }

        this.client = new ChromaClient({ path: "http://0.0.0.0:8000" });
        this.OPENAI_API_KEY = openai_api_key
        this.embedder = new OpenAIEmbeddingFunction({
            openai_api_key: this.OPENAI_API_KEY,
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
        console.log("Are you sure you want to delete the colletion: %s? (y/n)", collectionName );
        let userInput = await process.stdin.read();
        if (userInput === "y") {
            await this.client.deleteCollection({name: collectionName});
        } else {
            console.log("Operation cancelled");
        }
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

        collection.add({
            ids: ids,
            metadatas: metadatas,
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

    async delete() {
        // Delete the collection
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
        let result = collection.query({queryEmbeddings: qEmbeddings, queryTexts: [q], nResults: 1});

        return result;
    }

    /**
     * Resets the database.
     * 
     * This method will reset the database. This operation is destructive and irreversible.
     * For this reason, it asks for user confirmation before proceeding.
     * 
     * @param askForConfirmation If true, the method will ask for user confirmation before proceeding.
     * q                         The default value is true.
     * @returns
     */
    async reset(askForConfirmation: boolean = true) {
        if (!askForConfirmation) {
            await this.client.reset();
            return;
        }
        console.log("Are you sure you want to reset the database? (y/n)");
        let userInput = process.stdin.read();
        if (userInput === "y") {
            await this.client.reset();
        } else {
            console.log("Operation cancelled");
        }
    }
}