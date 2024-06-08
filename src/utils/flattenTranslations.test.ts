import { flattenEntry, flattenTranslations } from "./flattenTranslations";

const flatStructure = require("../../translations/en-us.json");
const nestedStructure = require("../../translations/flattenExamples/en-us.json");

const expectedFlatStructure = {
  "test.drive.one": "testing one",
  "test.drive.two": "testing two",
  "other.nested.three": "testing three",
  "other.nested.deep.more.final": "nested translation",
};

describe("flattenTranslations", () => {
  it("should do nothing if the file structure is flat", () => {
    expect(flattenTranslations(flatStructure)).toEqual(flatStructure);
  });
  describe("flattenEntry", () => {
    it("should flatten a nested object", () => {
      expect(
        flattenEntry({
          a: {
            b: { c: "one" },
          },
        })
      ).toEqual({ "a.b.c": "one" });
    });
  });

  it("should do nothing if the file structure is flat", () => {
    expect(flattenTranslations(nestedStructure)).toEqual(expectedFlatStructure);
  });
});
