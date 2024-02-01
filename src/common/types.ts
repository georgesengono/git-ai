/**
 * A segmented chunk of text.
 */
export interface TextChunk {
    text: string;
    tokens: number;
    type: 'text' | 'code' | 'example';
    index: number;
}


