import { Ollama } from "ollama";
import { exec, ChildProcess } from "child_process";

const { logInfo, logErr } = require("../logger.js");

var OllamaServeType = {
    SYSTEM: "system", // ollama is installed on the system
    PACKAGED: "packaged", // ollama is packaged with the app
};

class OllamaClient {
    static instance: OllamaClient | null = null;
    childProcess: ChildProcess | null ;
    host: string;
    ollama: Ollama;

    constructor() {
        this.childProcess = null;
        this.host = "http://127.0.0.1:11434/";
        this.ollama = new Ollama({host: this.host});
    }
    
    /**
     * Get the Ollama instance.
     * 
     * @returns {OllamaClient} The Ollama instance.
     */
    static async getOllama() {
        if (this.instance === null) {
            this.instance = new this();
        }

        return this.instance;
    }

    /**
   * Starts Ollama to serve an LLM.
   *
   * @throws {Error}
   * @return {OllamaStatus} The status of the Ollama server.
   */
    async serve() {
        console.log("Starting Ollama server...");

        try {
            // see if ollama is already running
            await this.ping();
            return OllamaServeType.SYSTEM;
        } catch (e) {
            logInfo(`Ollama is not running: ${e}`);
        }

        try {
            // See if 'ollama serve' command is available on the system
            await this.execServe("ollama");
            return OllamaServeType.SYSTEM;
        } catch (e) {
            // For now, we only support macOS
            // TODO: Add support for other platforms
            throw new Error(`Ollama is not installed on the system. ${e}`);
        }
    }

    /**
     * Runs the serve command for Ollama.
     * 
     * @param {*} path 
     * @returns 
     */
    async execServe(path: string) {
        return new Promise<any>((resolve, reject) => {
            const env = {...process.env};

            this.childProcess = exec(path + " serve", {env}, (error, stdout, stderr) => {
                if (error) {
                    logErr(`exec error: ${error}`);
                    reject(error);
                }

                if (stderr) {
                    logErr(`ollama stderr: ${stderr}`);
                    reject(new Error(stderr));
                }

                reject(`ollama stdout: ${stdout}`);
            });

            this.waitForPing().then(() => {
                resolve("Ollama server is running.");
            }).catch((e) => {
                if (this.childProcess && !this.childProcess.killed) {
                    this.childProcess.kill();
                }

                reject(e);
            });
        });
    }

    /**
     * Pulls a model from the Ollama server.
     * 
     * @param model Model to pull.
     * @param fn Function to call on each chunk of the model.
     */
    async pull(model: string, fn: Function) {
        logInfo(`Pulling model: ${model}`);
        const stream = await this.ollama.pull({model: model, stream: true});
        for await (const chunk of stream) {
            fn(chunk);
        }
    }

    /**
     * Runs the Ollama client.
     * 
     * @param model The model to run.
     * @param fn The function to call on the loaded model.
     */
    async run(model: string, fn: Function) {
        try {
            await this.pull(model, fn);
        } catch (err: any) {
          logErr('failed to pull before run: ' + err);
          if (!err.message.includes("pull model manifest")) {
            throw err;
          }

          logInfo('git-ai is running offline, failed to pull');
        }

        // load the model
        const loaded = await this.ollama.chat({model: model});
        // all done, return the loaded event to the callback
        fn(loaded);
    }

    /**
     * Sends a ping request to the Ollama server to check if it is running.
     * 
     * @returns {boolean} True if the server is running, false otherwise.
     */
    async ping(): Promise<boolean> {
        const response = await fetch(this.host, {
            method: "GET", 
            cache: "no-cache",
        });

        if (response.status !== 200) {
            throw new Error(`Ollama is not running.`);
        }

        logInfo("Ollama is running.");

        return true;
    }

    /**
     * Waits for the Ollama server to start.
     * 
     * @param {number} delay The delay between retries in milliseconds.
     * @param {number} retries The number of retries.
     * @throws {Error} If the server does not start.
     */
    async waitForPing(delay = 1000, retries = 5): Promise<void> {
        for (let i = 0; i < retries; i++) {
            try {
                await this.ping();
                return;
            } catch (e) {
                logInfo(`Waiting for Ollama to start...`);
                await new Promise((resolve) => setTimeout(resolve, delay));
            }
        }

        throw new Error(`Ollama server did not start.`);
    }

    /**
     * Sends a chat request to the Ollama server.
     * 
     * @param {ChatRequest} request The chat request.
     * @returns {Promise<any>} The response from the server.
     */
    async chat(model: string, prompt: string, fn: Function) {
        // TODO: Add support for chat history

        const messages = [{role: "user", content: prompt}]
        const stream = await this.ollama.chat({model: model, messages: messages, stream: true});
        for await (const chunk of stream) {
            fn(chunk);
        }
    }

    /**
     * Stop the Ollama server.
     */
    stop() {
        console.log("Stopping Ollama server...");
        if (this.childProcess && !this.childProcess.killed) {
            this.childProcess.kill();
        }
    }

    /**
     * Aborts the current request.
     * 
     * @returns 
     */
    async abortRequest() {
        return this.ollama.abort();
    }
}

export async function run(model: string, fn: Function) {
    const ollama = await OllamaClient.getOllama();
    return ollama.run(model, fn);
}

export async function chat(model: string, prompt: string, fn: Function) {
    const ollama = await OllamaClient.getOllama();
    return ollama.chat(model, prompt, fn);
}

export async function abort() {
    const ollama = await OllamaClient.getOllama();
    return ollama.abortRequest();
}

export async function stop() {
    const ollama = await OllamaClient.getOllama();
    return ollama.stop();
}

export async function serve() {
    const ollama = await OllamaClient.getOllama();
    return ollama.serve();
}
