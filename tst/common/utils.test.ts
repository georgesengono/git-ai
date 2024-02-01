import { countTokens } from "../../src/common/utils";

test("countTokens", () => {
    const sampleText = 
        `But I must explain to you how all this mistaken idea of denouncing pleasure and praising pain was born and I will give you a complete account of the system, and expound the actual teachings of the great explorer of the truth, the master-builder of human happiness. No one rejects, dislikes, or avoids pleasure itself, because it is pleasure, but because those who do not know how to pursue pleasure rationally encounter consequences (3) that are extremely painful.`
    const expectedTokenCount = 92; // Value taken from https://platform.openai.com/tokenizer

    expect(countTokens("Hello World")).toBe(2);
    expect(countTokens("Hello World!")).toBe(3);
    expect(countTokens("Hello World! ")).toBe(4);
    expect(countTokens(" Hello World! ")).toBe(4);
    expect(countTokens(" Hello World!")).toBe(3);
    expect(countTokens("Hello")).toBe(1);
    expect(countTokens("Hello ")).toBe(2);
    expect(countTokens(" Hello ")).toBe(2);
    expect(countTokens("")).toBe(0);
    expect(countTokens(" ")).toBe(1);
    expect(countTokens(sampleText)).toBe(expectedTokenCount);
});
