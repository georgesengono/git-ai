#!/usr/bin/env node

import { input, confirm } from "@inquirer/prompts";
import { sendChat, serveOllama, stopOllama, runOllamaModel } from "./service/api/ollamaApi";
import { runChroma, stopChroma } from "./service/api/chromaApi";

async function main() {
    // start the chroma db
    await runChroma();

    // Start the Ollama server
    await serveOllama();

    // Run the Ollama model
    await runOllamaModel();

    while (true) {
        const query = await input({ message: "user : ", theme: {prefix: "😃"}});
        if (query === "exit") {
            break;
        }
        
        process.stdout.write("🤖 ai   : \n");
        const res = await sendChat(query);
    }

    // Stop the Ollama server
    confirm({ message: "Stop git-ai?", default: false }).then(async (answers) => {
        if (answers) {
            stopOllama();
            stopChroma();
        }
    });
}

main();