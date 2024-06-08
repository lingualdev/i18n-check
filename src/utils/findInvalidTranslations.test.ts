import {
  compareTranslationFiles,
  findInvalidTranslations,
} from "./findInvalidTranslations";
import { flattenTranslations } from "./flattenTranslations";

const sourceFile = require("../../translations/messageExamples/en-us.json");
const secondaryFile = require("../../translations/messageExamples/de-de.json");

describe("findInvalidTranslations:compareTranslationFiles", () => {
  it("should return empty array if files are identical", () => {
    expect(
      compareTranslationFiles(
        flattenTranslations(sourceFile),
        flattenTranslations(sourceFile)
      )
    ).toEqual([]);
  });

  it("should return the invalid keys in the target file", () => {
    expect(
      compareTranslationFiles(
        flattenTranslations({
          ...sourceFile,
          "ten.eleven.twelve": "ten eleven twelve",
        }),
        flattenTranslations(secondaryFile)
      )
    ).toEqual(["multipleVariables"]);
  });

  it("should return empty array if placeholders are identical but in different positions", () => {
    expect(
      compareTranslationFiles(
        {
          basic: "added {this} and {that} should work.",
        },
        {
          basic: "It is {this} with different position {that}",
        }
      )
    ).toEqual([]);
  });
});

describe("findInvalidTranslations", () => {
  it("should return an empty object if all files have no invalid keys", () => {
    expect(findInvalidTranslations(sourceFile, { de: sourceFile })).toEqual({});
  });

  it("should return an object containing the keys for the missing language", () => {
    expect(
      findInvalidTranslations(
        { ...sourceFile, "ten.eleven.twelve": "ten eleven twelve" },
        { de: secondaryFile }
      )
    ).toEqual({ de: ["multipleVariables"] });
  });

  it("should return an object containing the keys for every language with missing key", () => {
    expect(
      findInvalidTranslations(
        { ...sourceFile, "ten.eleven.twelve": "ten eleven twelve" },
        {
          de: secondaryFile,
          fr: {
            "four.five.six": "four five six",
            "seven.eight.nine": "seven eight nine",
            "message.text-format": "yo,<p><b>John</b></p>!",
          },
        }
      )
    ).toEqual({
      de: ["multipleVariables"],
      fr: ["message.text-format"],
    });
  });
});
