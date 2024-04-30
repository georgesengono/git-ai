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

/*******************  CHROMA API *******************/
let openai_api = "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";//process.env.OPENAI_API_KEY as string;
if (!openai_api) {
    throw new Error("No OpenAI API key found");
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
    console.log(`Creating collection: ${collectionName}`)
    await create(collectionName, openai_api);
}

export async function deleteCollection(collectionName: string) {
    await deleteChromaCollection(collectionName, openai_api);
}

export async function insertCollection(ids: string[], metadatas: any[], documents: string[], collectionName: string = gitCommands) {
    console.log(`Inserting documents into collection: ${collectionName}`)
    await insert(collectionName, ids, metadatas, documents, openai_api);
}

export async function pullChroma() {
    await pullChromaImage();
}

export async function linkChroma() {
    await linkChromaFolder();
}

export async function runChroma() {
    await runChromaImage();
}

export async function stopChroma() {
    await stopChromaImage();
}