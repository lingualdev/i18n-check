import {
  formatCheckResultTable,
  formatInvalidTranslationsResultTable,
  formatTable,
} from "./errorReporters";

describe("formatTable", () => {
  test("single col and row", () => {
    expect(formatTable([[["lorem ipsum"]]])).toEqual(
      `
┌─────────────┐
│ lorem ipsum │
└─────────────┘
  `.trim()
    );
  });

  test("single col and two rows", () => {
    expect(formatTable([[["lorem ipsum"], ["foo bar"]]])).toEqual(
      `
┌─────────────┐
│ lorem ipsum │
│ foo bar     │
└─────────────┘
    `.trim()
    );
  });

  test("with two columns and two row groups", () => {
    expect(
      formatTable([
        [["col1", "col2"]],
        [
          ["lorem ipsum dolor", "foobar"],
          ["baz", "more text"],
        ],
      ])
    ).toEqual(
      `
┌───────────────────┬───────────┐
│ col1              │ col2      │
├───────────────────┼───────────┤
│ lorem ipsum dolor │ foobar    │
│ baz               │ more text │
└───────────────────┴───────────┘
`.trim()
    );
  });

  test("with two columns and three row groups", () => {
    expect(
      formatTable([
        [["one", "two"]],
        [
          ["lorem ipsum dolor", "foobar"],
          ["baz", "more text"],
        ],
        [["hello world", "here is more text for testing"]],
      ])
    ).toEqual(
      `
┌───────────────────┬───────────────────────────────┐
│ one               │ two                           │
├───────────────────┼───────────────────────────────┤
│ lorem ipsum dolor │ foobar                        │
│ baz               │ more text                     │
├───────────────────┼───────────────────────────────┤
│ hello world       │ here is more text for testing │
└───────────────────┴───────────────────────────────┘
  `.trim()
    );
  });
});

describe("formatCheckResultTable", () => {
  test("with one file and two keys", () => {
    expect(
      formatCheckResultTable({
        "some/file.json": ["key.one", "key.two"],
      })
    ).toEqual(
      `
┌────────────────┬─────────┐
│ file           │ key     │
├────────────────┼─────────┤
│ some/file.json │ key.one │
│ some/file.json │ key.two │
└────────────────┴─────────┘
`.trim()
    );
  });

  test("with two files and three keys", () => {
    expect(
      formatCheckResultTable({
        "some/de.json": ["key.one", "key.two"],
        "some/en.json": ["key.three"],
      })
    ).toEqual(
      `
┌──────────────┬───────────┐
│ file         │ key       │
├──────────────┼───────────┤
│ some/de.json │ key.one   │
│ some/de.json │ key.two   │
│ some/en.json │ key.three │
└──────────────┴───────────┘
`.trim()
    );
  });
});

describe("formatInvalidTranslationsResultTable", () => {
  test("with one file and one key", () => {
    expect(
      formatInvalidTranslationsResultTable({
        "some/en.json": [{ key: "key.one", msg: "key one error msg" }],
      })
    ).toEqual(
      `
┌──────┬───────────────────┐
│ info │ result            │
├──────┼───────────────────┤
│ file │ some/en.json      │
│ key  │ key.one           │
│ msg  │ key one error msg │
└──────┴───────────────────┘
`.trim()
    );
  });

  test("with two files and three keys", () => {
    expect(
      formatInvalidTranslationsResultTable({
        "some/en-US.json": [
          { key: "key.one", msg: "key one error msg" },
          { key: "key.two", msg: "another msg" },
        ],
        "some/de.json": [{ key: "key.three", msg: "key three msg" }],
      })
    ).toEqual(
      `
┌──────┬───────────────────┐
│ info │ result            │
├──────┼───────────────────┤
│ file │ some/en-US.json   │
│ key  │ key.one           │
│ msg  │ key one error msg │
├──────┼───────────────────┤
│ file │ some/en-US.json   │
│ key  │ key.two           │
│ msg  │ another msg       │
├──────┼───────────────────┤
│ file │ some/de.json      │
│ key  │ key.three         │
│ msg  │ key three msg     │
└──────┴───────────────────┘
`.trim()
    );
  });
});
