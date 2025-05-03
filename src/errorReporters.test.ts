import { formatTable } from "./errorReporters";

test("format table single col and row", () => {
  expect(formatTable([[["lorem ipsum"]]])).toEqual(
    `
┌─────────────┐
│ lorem ipsum │
└─────────────┘
  `.trim()
  );
});

test("format table single col and two rows", () => {
  expect(formatTable([[["lorem ipsum"], ["foo bar"]]])).toEqual(
    `
┌─────────────┐
│ lorem ipsum │
│ foo bar     │
└─────────────┘
    `.trim()
  );
});

test("format table with two columns and two row groups", () => {
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

test("format table with two columns and three row groups", () => {
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
