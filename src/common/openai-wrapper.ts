import OpenAI from 'openai';
import { CreateEmbeddingRequest, CreateEmbeddingResponse, EmbeddingObject } from './types';

/**
 * A wrapper class for the OpenAI API.
 * 
 * This class provides a simple interface to the OpenAI API.
 */
export class OpenAIWrapper {
    private key: string;
    private client: OpenAI;

    constructor(apiKey: string | undefined) {
        this.key = this.validateApiKey(apiKey);
        try {
            this.client = new OpenAI({ apiKey: this.key});  
        } catch (error) {
            throw new Error("Unable to initialize OpenAI client.");
        }
    }

    private validateApiKey(apiKey: string | undefined): string {
        if (!apiKey || apiKey.length === 0 || apiKey === undefined) {
            throw new Error("Invalid API key");
        }
           
        return apiKey;
    }

    /**
     * Create an embedding vector representing the input text.
     * 
     * @param text The input text to create an embedding for.
     * @returns The embedding vector.
     */
    createEmbedding(text: string): Promise<EmbeddingObject> {
        if (!text) {
            throw new Error("Invalid input. The input must not be empty.");
        }

        const request = new CreateEmbeddingRequest(text, "text-embedding-ada-002");
        const response = this.client.embeddings.create(request) as unknown as Promise<CreateEmbeddingResponse>;
        return response.then((response) => {
            return response.data[0];
        });
    }
}