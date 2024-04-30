import { countTokens } from "./utils";

/**
 * Constants
 */
export const constants = {
    TEXT_CHUNK_NUMBER_OF_SENTENCES: 5, // The number of sentences in a text chunk
    TEXT_CHUNK_OVERLAP: 2, // The number of sentences to overlap between chunks
    CONTEXT_LENGTH_LIMIT: 2048, // The maximum length of the context for the OpenAI APIs
    TOKEN_LIMIT: 8192, // The maximum number of tokens for the OpenAI APIs
    OPENAI_AI_API_KEY: "", // <YOUR_API_KEY> The OpenAI API key
};

/**
 * A segmented chunk of text.
 */
export interface TextChunk {
    text: string;
    tokens: number;
    type: 'text' | 'code' | 'example';
    index: number;
}

//////////////////////// OPENAI RELATED TYPES ////////////////////////

export type EmbeddingModel = "text-embedding-3-large" | "text-embedding-3-small" | "text-embedding-ada-002";
export type EmbeddingFormat = "float" | "base64" | undefined;

/**
 * A request to create an embedding vector representing the input text.
 * More information: https://platform.openai.com/docs/api-reference/embeddings/create
 * 
 * @param input The input text or texts to create an embedding for.
 * @param model The model to use for the embedding.
 * @param encoding_format The format to return the embeddings in. Can be either float or base64.
 * @param dimensions The number of dimensions the resulting output embeddings should have.
 * @param user_id A unique identifier representing your end-user, which can help OpenAI to monitor and detect abuse.
 */
export class CreateEmbeddingRequest {
    input: string | string[] | number[] | number[][];
    model: string;
    encoding_format?: EmbeddingFormat;
    dimensions?: number | undefined;
    user_id?: string | undefined;
    
    public constructor(input: string | string[] | number[] | number[][], model: EmbeddingModel,
         encoding_format?: EmbeddingFormat, dimensions?: number, user_id?: string) {
        this.input = this.validateInput(input);
        this.model = model;
        this.encoding_format = encoding_format;
        this.dimensions = dimensions;
        this.user_id = user_id;
    }

    /**
     * The input must not exceed the max input tokens for the model (8192 tokens for text-embedding-ada-002),
     * cannot be an empty string, and any array must be 2048 dimensions or less.
     * 
     * @param input 
     * @returns the input or throws an error if the input is invalid
     */
    private validateInput(input: string | string[] | number[] | number[][]): string | string[] | number[] | number[][] {
        if (typeof input === 'string' && input.length > 0 && countTokens(input) <= constants.TOKEN_LIMIT) {
            return input;
        }
        else if (Array.isArray(input) &&  input.length > 0 && input.length <= constants.CONTEXT_LENGTH_LIMIT) {
            return input;
        }
        
        throw new Error("Invalid input. The input must not exceed the max input tokens for the model, cannot be an empty string, and any array must be 2048 dimensions or less.");
    }
}

/**
 * Represents an embedding vector returned by embedding endpoint.
 * More information: https://platform.openai.com/docs/api-reference/embeddings/object
 * 
 * @param index The index of the embedding in the list of embeddings.
 * @param emedding The embedding vector, which is a list of floats. 
 * @param object The type of object, which is always "embedding".
 */
export interface EmbeddingObject {
    index: number;
    emedding: number[];
    object: "embedding";
}

/**
 * Represents the response returned by the embedding endpoint.
 * 
 * @param object The type of object, which is always "embedding".
 * @param data The list of embeddings using the EmbeddingObject.
 * @param model The model used to generate the embeddings.
 * @param usage The usage of the tokens in the request.
 */
export interface CreateEmbeddingResponse {
    object: string;
    data: EmbeddingObject[];
    model: string;
    usage: {
        prompt_tokens: number;
        total_tokens: number;
    }
}