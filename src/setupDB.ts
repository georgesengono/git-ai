import { createCollection, insertCollection, pullChroma, runChroma, stopChroma, linkChroma } from "./service/api/chromaApi";
import fs from "fs";

//////////////// Setup the chroma vector db file //////////////////////

const collectionName = "git-commands";

const file = fs.readFileSync("../data/git-commands.json", "utf8");
const data = JSON.parse(file);

const ids: string[] = [];
const metadatas: any[] = [];
const documents: any = [];

for (let i = 0; i < Object.keys(data).length; i++) {
    const key = Object.keys(data)[i];
    const doc = key + "\n" + data[key].join("\n");
    ids.push(i.toString());
    documents.push(doc);
}

async function setUpChromaDB() {   
    await pullChroma();

    await linkChroma();

    await runChroma();

    await createCollection(collectionName);

    await insertCollection(ids, metadatas, documents, collectionName);

    await stopChroma();
}

setUpChromaDB();
