import { peek,
        count,
        create,
        deleteChromaCollection,
        insert,
        query,
        pullChromaImage,
        runChromaImage,
        stopChromaImage,
        linkChromaFolder } from "../chroma/chroma";

import { constants } from "../../common/types";


/*******************  CHROMA API *******************/
let openai_api = constants.OPENAI_AI_API_KEY;
if (!openai_api || openai_api.length === 0) {
    console.error("Please set your OpenAI API key in the OPENAI_AI_API_KEY environment variable form the src/common/types.ts");
    process.exit(1);
}

let gitCommands = "git-commands";

export async function queryCollection(q: string, collectionName: string = gitCommands) {
    return query(collectionName, q, openai_api);
}

export async function peekCollection(collectionName: string = gitCommands) {
    return peek(collectionName, openai_api);
}

export async function countCollection(collectionName: string = gitCommands) {
    return count(collectionName, openai_api);
}

export async function createCollection(collectionName: string = gitCommands) {
    await create(collectionName, openai_api);
}

export async function deleteCollection(collectionName: string) {
    await deleteChromaCollection(collectionName, openai_api);
}

export async function insertCollection(ids: string[], metadatas: any[], documents: string[], collectionName: string = gitCommands) {
    await insert(collectionName, ids, metadatas, documents, openai_api);
}

export async function pullChroma() {
    await pullChromaImage(openai_api);
}

export async function linkChroma() {
    await linkChromaFolder(openai_api);
}

export async function runChroma() {
    await runChromaImage(openai_api);
}

export async function stopChroma() {
    await stopChromaImage(openai_api);
}