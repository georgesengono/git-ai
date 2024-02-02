import { TextChunk } from "../../src/common/types";
import { countTokens, splitSentences, groupSentencesWithOverlap, splitText } from "../../src/common/utils";

test("splitSentences", () => {
    expect(splitSentences("")).toStrictEqual([]);
    expect(splitSentences(" ")).toStrictEqual([]);
    expect(splitSentences("Hello World")).toStrictEqual(["Hello World"]);
    expect(splitSentences("Hello World!")).toStrictEqual(["Hello World!"]);
    expect(splitSentences("Hello World! ")).toStrictEqual(["Hello World!"]);
    expect(splitSentences(" Hello World! ")).toStrictEqual(["Hello World!"]);
    expect(splitSentences(" Hello World!")).toStrictEqual(["Hello World!"]);
    expect(splitSentences("Hello")).toStrictEqual(["Hello"]);
    expect(splitSentences("Hello.")).toStrictEqual(["Hello."]);
    expect(splitSentences("Hello.\nWorld.")).toStrictEqual(["Hello.", "World."]);

    // Test with multiple sentences
    const sampleText = "Hello World! This is a test. I am testing the sentence splitter.";
    const expectedSentences = ["Hello World!", "This is a test.", "I am testing the sentence splitter."];
    expect(splitSentences(sampleText)).toStrictEqual(expectedSentences);
});

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

function createSentences(count: number): string[] {
    const sentences: string[] = [];
    for (let i = 0; i < count; i++) {
        sentences.push(`S${i}.`);
    }
    return sentences;
}

test("groupSentencesWithOverlap", () => {
    expect(groupSentencesWithOverlap([], 5)).toStrictEqual([]);
    expect(groupSentencesWithOverlap([], 2)).toStrictEqual([]);

    expect(groupSentencesWithOverlap(["S0."], 5)).toStrictEqual(["S0."]);
    expect(groupSentencesWithOverlap(createSentences(5), 1, 0)).toStrictEqual(["S0.", "S1.", "S2.", "S3.", "S4."]);

    expect(groupSentencesWithOverlap(createSentences(5), 10)).toStrictEqual(["S0. S1. S2. S3. S4."]);

    expect(groupSentencesWithOverlap(createSentences(10), 1, 0)).toStrictEqual(createSentences(10));
    expect(groupSentencesWithOverlap(createSentences(10), 1, 1)).toStrictEqual(createSentences(10));
    expect(groupSentencesWithOverlap(createSentences(10), 5, 0)).toStrictEqual(["S0. S1. S2. S3. S4.","S5. S6. S7. S8. S9."]);
    expect(groupSentencesWithOverlap(createSentences(10), 2, 1)).toStrictEqual(["S0. S1.", "S1. S2.", "S2. S3.", "S3. S4.", "S4. S5.", "S5. S6.", "S6. S7.", "S7. S8.", "S8. S9."]);
    expect(groupSentencesWithOverlap(createSentences(10), 5, 2)).toStrictEqual(["S0. S1. S2. S3. S4.","S3. S4. S5. S6. S7.","S6. S7. S8. S9."]);
});

test("splitText", () => {
    const sampleText = `Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium, totam rem aperiam eaque ipsa, quae ab illo inventore veritatis et quasi architecto beatae vitae dicta sunt, explicabo. Nemo enim ipsam voluptatem, quia voluptas sit, aspernatur aut odit aut fugit, sed quia consequuntur magni dolores eos, qui ratione voluptatem sequi nesciunt, neque porro quisquam est, qui dolorem ipsum, quia dolor sit, amet, consectetur, adipisci velit, sed quia non numquam eius modi tempora incidunt, ut labore et dolore magnam aliquam quaerat voluptatem. Ut enim ad minima veniam, quis nostrum exercitationem ullam corporis suscipit laboriosam, nisi ut aliquid ex ea commodi consequatur? Quis autem vel eum iure reprehenderit, qui in ea voluptate velit esse, quam nihil molestiae consequatur, vel illum, qui dolorem eum fugiat, quo voluptas nulla pariatur? [33] At vero eos et accusamus et iusto odio dignissimos ducimus, qui blanditiis praesentium voluptatum deleniti atque corrupti, quos dolores et quas molestias excepturi sint, obcaecati cupiditate non provident, similique sunt in culpa, qui officia deserunt mollitia animi, id est laborum et dolorum fuga. Et harum quidem rerum facilis est et expedita distinctio. Nam libero tempore, cum soluta nobis est eligendi optio, cumque nihil impedit, quo minus id, quod maxime placeat, facere possimus, omnis voluptas assumenda est, omnis dolor repellendus. Temporibus autem quibusdam et aut officiis debitis aut rerum necessitatibus saepe eveniet, ut et voluptates repudiandae sint et molestiae non recusandae. Itaque earum rerum hic tenetur a sapiente delectus, ut aut reiciendis voluptatibus maiores alias consequatur aut perferendis doloribus asperiores repellat.`;
    const expectedChunks: TextChunk[] = [
        { text: "Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium, totam rem aperiam eaque ipsa, quae ab illo inventore veritatis et quasi architecto beatae vitae dicta sunt, explicabo. Nemo enim ipsam voluptatem, quia voluptas sit, aspernatur aut odit aut fugit, sed quia consequuntur magni dolores eos, qui ratione voluptatem sequi nesciunt, neque porro quisquam est, qui dolorem ipsum, quia dolor sit, amet, consectetur, adipisci velit, sed quia non numquam eius modi tempora incidunt, ut labore et dolore magnam aliquam quaerat voluptatem. Ut enim ad minima veniam, quis nostrum exercitationem ullam corporis suscipit laboriosam, nisi ut aliquid ex ea commodi consequatur? Quis autem vel eum iure reprehenderit, qui in ea voluptate velit esse, quam nihil molestiae consequatur, vel illum, qui dolorem eum fugiat, quo voluptas nulla pariatur? [33] At vero eos et accusamus et iusto odio dignissimos ducimus, qui blanditiis praesentium voluptatum deleniti atque corrupti, quos dolores et quas molestias excepturi sint, obcaecati cupiditate non provident, similique sunt in culpa, qui officia deserunt mollitia animi, id est laborum et dolorum fuga.", tokens: 331, type: "text", index: 0 },
        { text: "Quis autem vel eum iure reprehenderit, qui in ea voluptate velit esse, quam nihil molestiae consequatur, vel illum, qui dolorem eum fugiat, quo voluptas nulla pariatur? [33] At vero eos et accusamus et iusto odio dignissimos ducimus, qui blanditiis praesentium voluptatum deleniti atque corrupti, quos dolores et quas molestias excepturi sint, obcaecati cupiditate non provident, similique sunt in culpa, qui officia deserunt mollitia animi, id est laborum et dolorum fuga. Et harum quidem rerum facilis est et expedita distinctio. Nam libero tempore, cum soluta nobis est eligendi optio, cumque nihil impedit, quo minus id, quod maxime placeat, facere possimus, omnis voluptas assumenda est, omnis dolor repellendus. Temporibus autem quibusdam et aut officiis debitis aut rerum necessitatibus saepe eveniet, ut et voluptates repudiandae sint et molestiae non recusandae.", tokens: 248, type: "text", index: 1 },
        { text: "Nam libero tempore, cum soluta nobis est eligendi optio, cumque nihil impedit, quo minus id, quod maxime placeat, facere possimus, omnis voluptas assumenda est, omnis dolor repellendus. Temporibus autem quibusdam et aut officiis debitis aut rerum necessitatibus saepe eveniet, ut et voluptates repudiandae sint et molestiae non recusandae. Itaque earum rerum hic tenetur a sapiente delectus, ut aut reiciendis voluptatibus maiores alias consequatur aut perferendis doloribus asperiores repellat.", tokens: 141, type: "text", index: 2 }
    ];

    expect(splitText("")).toStrictEqual([]);
    expect(splitText(" ")).toStrictEqual([]);
    expect(splitText(sampleText)).toStrictEqual(expectedChunks);
});