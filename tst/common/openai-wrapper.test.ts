import { OpenAIWrapper } from "../../src/common/openai-wrapper";

test('OpenAIWrapper is defined', () => {
    expect(OpenAIWrapper).toBeDefined();
});

test('valid API key', () => {
    expect(() => new OpenAIWrapper("")).toThrow(Error);
    expect(() => new OpenAIWrapper(undefined)).toThrow(Error);
});


test('create OpenAIWrapper', () => {
    jest.mock('openai');
    // mock the OpenAI client used in the OpenAIWrapper
    const mockOpenAI = jest.fn();
    const mockOpenAIInstance = jest.fn();
    mockOpenAI.mockReturnValue(mockOpenAIInstance);
    const apiKey = "1234";
    const openaiClient = new OpenAIWrapper(apiKey);
    expect(openaiClient).toBeDefined();
});

test('createEmbedding', async () => {
    // TO COMPLETE
});
