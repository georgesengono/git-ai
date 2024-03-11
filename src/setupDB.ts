import { ChromaWrapper } from "./common/chroma-client"; 
import { OpenAIWrapper } from "./common/openai-wrapper";
import { splitText } from "./common/utils";
import fs from "fs";

//////////////// Setup the database with the git-commands.txt file //////////////////////

const api_key = process.env.OPENAI_API_KEY;

if (!api_key) {
    throw new Error("No OpenAI API key found");
}

const chroma = new ChromaWrapper(api_key as string);

const collectionName = "git-commands";

let text = fs.readFileSync('data/git-commands.txt', 'utf8');
const textChunks = splitText(text);

console.log("Inserting text chunks into the database...");
chroma.insertChunks(collectionName, textChunks);
console.log("Done!");
