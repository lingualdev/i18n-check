import {
  compareTranslationFiles,
  findInvalid18nTranslations,
} from "./findInvalidi18nTranslations";
import { flattenTranslations } from "./flattenTranslations";

const sourceFile = require("../../translations/i18NextMessageExamples/en-us.json");
const targetFile = require("../../translations/i18NextMessageExamples/de-de.json");

describe("findInvalid18nTranslations:compareTranslationFiles", () => {
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
        flattenTranslations(targetFile)
      )
    ).toEqual(["key_with_broken_de", "intlNumber_broken_de"]);
  });

  it("should return an empty array if the strings contain paranthesis that have different content", () => {
    expect(
      compareTranslationFiles(
        flattenTranslations({
          keyText: "Key(s)",
        }),
        flattenTranslations({ keyText: "Taste(n)" })
      )
    ).toEqual([]);
  });

  it("should return empty array if placeholders are identical but in different positions", () => {
    expect(
      compareTranslationFiles(
        {
          basic: "added {{this}} and {{that}} should work.",
        },
        {
          basic: "It is {{this}} with different position {{that}}",
        }
      )
    ).toEqual([]);
  });

  it("should return the invalid key if tags are not identical", () => {
    expect(
      compareTranslationFiles(
        {
          tag: "This is some <b>bold text</b> and some <i>italic</i> text.",
        },
        {
          tag: "There is some <b>bold text</b> and some other <span>italic</span> text.",
        }
      )
    ).toEqual(["tag"]);
  });

  it("should return empty array if tags are identical", () => {
    expect(
      compareTranslationFiles(
        {
          tag: "This is some <b>bold text</b> and some <i>italic</i> text.",
        },
        {
          tag: "There is some <b>bold text</b> and some other <i>italic</i> text.",
        }
      )
    ).toEqual([]);
  });
});

describe("findInvalidTranslations", () => {
  it("should return an empty object if all files have no invalid keys", () => {
    expect(findInvalid18nTranslations(sourceFile, { de: sourceFile })).toEqual(
      {}
    );
  });

  it("should return an object containing the keys for the missing language", () => {
    expect(
      findInvalid18nTranslations(
        { ...sourceFile, "ten.eleven.twelve": "ten eleven twelve" },
        { de: targetFile }
      )
    ).toEqual({ de: ["key_with_broken_de", "intlNumber_broken_de"] });
  });

  it("should return an object containing the keys for every language with missing key", () => {
    expect(
      findInvalid18nTranslations(
        { ...sourceFile, "ten.eleven.twelve": "ten eleven twelve" },
        {
          de: targetFile,
          fr: {
            key_with_broken_de:
              "Some format {{value, formatname}} and some other format {{value, formatname}}",
          },
        }
      )
    ).toEqual({
      de: ["key_with_broken_de", "intlNumber_broken_de"],
      fr: ["key_with_broken_de"],
    });
  });

  it("should find invalid interval", () => {
    expect(
      findInvalid18nTranslations(
        {
          key1_interval:
            "(1)[one item];(2-7)[a few items];(7-inf)[a lot of items];",
        },
        {
          de: {
            key1_interval:
              "(1-2)[one or two items];(3-7)[a few items];(7-inf)[a lot of items];",
          },
        }
      )
    ).toEqual({
      de: ["key1_interval"],
    });
  });

  it("should find invalid nested interpolation", () => {
    expect(
      findInvalid18nTranslations(
        {
          "tree.one": "added {{something}}",
        },
        {
          de: {
            "tree.one": "added {{somethings}}",
          },
        }
      )
    ).toEqual({
      de: ["tree.one"],
    });
  });

  it("should find invalid relative time formatting", () => {
    expect(
      findInvalid18nTranslations(
        {
          intlRelativeTimeWithOptionsExplicit:
            "Lorem {{val, relativetime(range: quarter; style: narrow;)}}",
        },
        {
          de: {
            intlRelativeTimeWithOptionsExplicit:
              "Lorem {{val, relativetime(range: quarter; style: long;)}}",
          },
        }
      )
    ).toEqual({
      de: ["intlRelativeTimeWithOptionsExplicit"],
    });
  });

  it("should find invalid key with options", () => {
    expect(
      findInvalid18nTranslations(
        {
          keyWithOptions:
            "Some format {{value, formatname(option1Name: option1Value; option2Name: option2Value)}}",
        },
        {
          de: {
            keyWithOptions:
              "Some format {{value, formatname(option3Name: option3Value; option4Name: option4Value)}}",
          },
        }
      )
    ).toEqual({
      de: ["keyWithOptions"],
    });
  });

  it("should find invalid nesting", () => {
    expect(
      findInvalid18nTranslations(
        {
          nesting1: "1 $t(nesting2)",
        },
        {
          de: {
            nesting1: "1 $t(nesting3)",
          },
        }
      )
    ).toEqual({
      de: ["nesting1"],
    });
  });

  it("should find invalid tags", () => {
    expect(
      findInvalid18nTranslations(
        {
          tag: "This is some <b>bold text</b> and some <i>italic</i> text.",
        },
        {
          de: {
            tag: "There is some <b>bold text</b> and some other <span>text inside a span</span>!",
          },
        }
      )
    ).toEqual({
      de: ["tag"],
    });
  });

  it("should recognize special characters", () => {
    expect(
      findInvalid18nTranslations(
        {
          key: "Test < {{a}} and > {{max_a}}",
        },
        {
          de: {
            key: "Test < {{a}} und > {{max_a}}",
          },
        }
      )
    ).toEqual({});
  });
});
