import { abort, run, chat, stop, serve } from "../ollama/ollama"
import { GitClient } from "../../common/git-client";
import { queryCollection } from "../api/chromaApi"

import fs from 'fs';

/*******************  Ollama API *******************/

let model = "llama3"

const prompt_message = `You are a git AI agent whose only purpose is to help answer git related questions. Be direct and concise in your responses.
If possible, directly give the git command that would solve the user's problem  without any additional information or context. 
If the user's question can be answered with the status of the local project, provide that information or mix it with the git command.
If you are unable to provide a git command, provide a brief explanation of the git concept.
# Below is some information that you can use.  This information was taken from a semenatic search of the git-commands.txt file.:
$INFORMATION$
# Use the following information that contains the current status of the local project if necessary.:
$STATUS$
# Below is the user query/question.
User: $MESSAGE$
AI: 
`;

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
    // 1. get the project status
    const gitClient = new GitClient();
    const status = await gitClient.executeGitScript();

    // 2. search git commands for best query
    const searchResult = await queryCollection(msg);

    // 3. create the chat message
    const chatMessage = prompt_message.replace("$STATUS$", status).replace("$MESSAGE$", msg).replace("$INFORMATION$", searchResult.documents[0].join());

    // save the chat message to a file
    fs.writeFileSync("chat-message.txt", chatMessage);

    await chat(model, chatMessage, (chunk: any) => {
        process.stdout.write(chunk.message.content);
    }).then(() => {
        process.stdout.write("\n\n");
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

// setModel, getModel, runOllamaModel, sendChat, stopChat, serveOllama, stopOllama