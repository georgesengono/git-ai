import {abort, run, chat, stop, serve} from "./ollama/ollama"

/*******************  Ollama API *******************/

let model = "llama2"

export async function setModel(msg: string) {
    model = msg;
}
  
export async function getModel() {
    return model;
}

export async function runOllamaModel() {
    await run(model, (chunk: any) => {
        console.log(chunk);
    });
}

export async function sendChat(msg: string): Promise<any> {
    await chat(model, msg, (chunk: any) => {
        process.stdout.write(chunk.message.content);
    }).then(() => {
        process.stdout.write("\n");
    });
}

export async function stopChat() {
    await abort();
}


export async function serveOllama() {  
    await serve();
}

/**
 * Stops the Ollama server.
 */
export function stopOllama() {
    stop();
}