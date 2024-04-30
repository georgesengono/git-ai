### Revolutionizing Version Control: An AI-Powered Approach to Simplifying Git ###

[*For now, GIT-AI will only work on Mac OS , support for windows and linux will be added later*]

**Link to Final Report**

<ADD_LINK_TO_WEBSITE >

**The following frameworks are required to run GIT-AI:**

- [Ollama](https://ollama.com/download) : Ollama allows you to run open-source large language models, such as Llama 2, locally

- [Docker](https://www.docker.com/products/docker-desktop/) : Docker is *a platform designed to help developers build, share, and run container applications*.

  

**How to test**

You need to setup an OPEN_AI_API_KEY THAT will be used for the embedding function in the src/common/types.ts file.

The setup script needs to be executed at least once prior to running the project.

`npx ts-node src/setupDB.ts`

This script, will setup the ChromaDB locally and populate it with relevant data.

From the CLI of a git project, run the following commands:

1. `sudo npm install -g`  (only once)
2. `npm run build`
3. `git-ai`  (This will start the "AI")



