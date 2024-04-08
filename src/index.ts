#!/usr/bin/env node

import { input, confirm } from "@inquirer/prompts";
import { sendChat, serveOllama, stopOllama, runOllamaModel } from "./service/api";
import { run } from "./service/ollama/ollama";


async function main() {
    // Start the Ollama server and
    // await serveOllama();

    // // Run the Ollama model
    // await runOllamaModel();

    const answers = async () => {
        const query = await input({ message: "" , theme: {prefix: "🤖"}});
        return { query };
    };

    answers().then(async (answers) => {
        const { query } = answers;
        const res = await sendChat(query);
    });

    // Stop the Ollama server
    // confirm({ message: "Stop Ollama server?", default: false }).then(async (answers) => {
    //     if (answers) {
    //         stopOllama();
    //     }
    // });
}

main();



// Start the Ollama server and


// // Run the Ollama model
// runOllamaModel();

// const answers = async () => {
//     const query = await input({ message: "" , theme: {prefix: "🤖"}});
//     return { query };
// };

// answers().then(async (answers) => {
//     const { query } = answers;
//     const res = await sendChat(query);
//     console.log(res);
// });

// // Stop the Ollama server
// confirm({ message: "Stop Ollama server?", default: false }).then(async (answers) => {
//     if (answers) {
//         stopOllama();
//     }
// });
