import { getEncoding } from "js-tiktoken";


/**
 * Get the number of token in a text chunk.
 * 
 * This function uses js-tiktoken to count the number of tokens in a text chunk.
 * Link to repo: https://github.com/dqbd/tiktoken/tree/main/js
 */
export function countTokens(text: string): number {
    if (!text) {
        return 0;
    }

    const encoding = getEncoding("cl100k_base");
    const tokens = encoding.encode(text);

    return tokens.length;
}
