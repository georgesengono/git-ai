/**
 * Constants
 */
export const constants = {
    TEXT_CHUNK_NUMBER_OF_SENTENCES: 5, // The number of sentences in a text chunk
    TEXT_CHUNK_OVERLAP: 2, // The number of sentences to overlap between chunks
    CONTEXT_LENGTH_LIMIT: 2048, // The maximum length of the context for the OpenAI APIs
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


