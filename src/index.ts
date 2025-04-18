import { findMissingKeys } from "./utils/findMissingKeys";
import { CheckResult, Translation, TranslationFile } from "./types";
import { findInvalidTranslations } from "./utils/findInvalidTranslations";
import { findInvalid18nTranslations } from "./utils/findInvalidi18nTranslations";
import { Context } from "./errorReporters";
import { extract } from "@formatjs/cli-lib";
import { extract as nextIntlExtract } from "./utils/nextIntlSrcParser";
import fs from "fs";

const ParseFormats = ["react-intl", "i18next", "next-intl"];

export type Options = {
  format?: "icu" | "i18next" | "react-intl" | "next-intl";
  checks?: Context[];
};

export const checkInvalidTranslations = (
  source: Translation,
  targets: Record<string, Translation>,
  options: Options = { format: "icu" }
): CheckResult => {
  return options.format === "i18next"
    ? findInvalid18nTranslations(source, targets)
    : findInvalidTranslations(source, targets);
};

export const checkMissingTranslations = (
  source: Translation,
  targets: Record<string, Translation>
): CheckResult => {
  return findMissingKeys(source, targets);
};

export const checkTranslations = (
  source: TranslationFile[],
  targets: TranslationFile[],
  options: Options = { format: "icu", checks: ["invalidKeys", "missingKeys"] }
): {
  missingKeys: CheckResult | undefined;
  invalidKeys: CheckResult | undefined;
} => {
  const { checks = ["invalidKeys", "missingKeys"] } = options;

  let missingKeys = {};
  let invalidKeys = {};

  const hasMissingKeys = checks.includes("missingKeys");
  const hasInvalidKeys = checks.includes("invalidKeys");

  source.forEach(({ name, content }) => {
    const files = targets
      .filter(({ reference }) => reference === name)
      .reduce((obj, { name: key, content }) => {
        return Object.assign(obj, { [key]: content });
      }, {});

    if (hasMissingKeys) {
      Object.assign(missingKeys, checkMissingTranslations(content, files));
    }

    if (hasInvalidKeys) {
      Object.assign(
        invalidKeys,
        checkInvalidTranslations(content, files, options)
      );
    }
  });

  return {
    missingKeys: hasMissingKeys ? missingKeys : undefined,
    invalidKeys: hasInvalidKeys ? invalidKeys : undefined,
  };
};

export const checkUnusedKeys = async (
  translationFiles: TranslationFile[],
  filesToParse: string[],
  options: Options = {
    format: "react-intl",
    checks: [],
  },
  componentFunctions = []
): Promise<CheckResult | undefined> => {
  if (!options.format || !ParseFormats.includes(options.format)) {
    return undefined;
  }

  if (!options.checks || !options.checks.includes("unused")) {
    return undefined;
  }

  if (options.format === "react-intl") {
    return findUnusedReactIntlTranslations(translationFiles, filesToParse);
  } else if (options.format === "i18next") {
    return findUnusedI18NextTranslations(
      translationFiles,
      filesToParse,
      componentFunctions
    );
  } else if (options.format === "next-intl") {
    return findUnusedNextIntlTranslations(translationFiles, filesToParse);
  }
};

const findUnusedReactIntlTranslations = async (
  translationFiles: TranslationFile[],
  filesToParse: string[]
) => {
  let unusedKeys = {};

  const extracted = await extract(filesToParse, {});
  const extractedResultSet = new Set(Object.keys(JSON.parse(extracted)));

  translationFiles.forEach(({ name, content }) => {
    const keysInSource = Object.keys(content);
    const found: string[] = [];
    for (const keyInSource of keysInSource) {
      if (!extractedResultSet.has(keyInSource)) {
        found.push(keyInSource);
      }
    }

    Object.assign(unusedKeys, { [name]: found });
  });

  return unusedKeys;
};

const findUnusedI18NextTranslations = async (
  source: TranslationFile[],
  filesToParse: string[],
  componentFunctions: string[] = []
) => {
  let unusedKeys = {};

  const { extractedResult, skippableKeys } = await getI18NextKeysInCode(
    filesToParse,
    componentFunctions
  );

  const extractedResultSet = new Set(extractedResult.map(({ key }) => key));

  source.forEach(({ name, content }) => {
    const keysInSource = Object.keys(content);
    const found: string[] = [];
    for (const keyInSource of keysInSource) {
      const isSkippable = skippableKeys.find((skippableKey) => {
        return keyInSource.includes(skippableKey);
      });
      if (isSkippable !== undefined) {
        continue;
      }
      if (!extractedResultSet.has(keyInSource)) {
        found.push(keyInSource);
      }
    }

    Object.assign(unusedKeys, { [name]: found });
  });

  return unusedKeys;
};

const findUnusedNextIntlTranslations = async (
  translationFiles: TranslationFile[],
  filesToParse: string[]
) => {
  let unusedKeys = {};

  const extracted = nextIntlExtract(filesToParse);
  const extractedResultSet = new Set(extracted.map(({ key }) => key));

  translationFiles.forEach(({ name, content }) => {
    const keysInSource = Object.keys(content);
    const found: string[] = [];
    for (const keyInSource of keysInSource) {
      if (!extractedResultSet.has(keyInSource)) {
        found.push(keyInSource);
      }
    }

    Object.assign(unusedKeys, { [name]: found });
  });

  return unusedKeys;
};

export const checkUndefinedKeys = async (
  source: TranslationFile[],
  filesToParse: string[],
  options: Options = {
    format: "react-intl",
    checks: [],
  },
  componentFunctions = []
): Promise<CheckResult | undefined> => {
  if (!options.format || !ParseFormats.includes(options.format)) {
    return undefined;
  }

  if (!options.checks || !options.checks.includes("undefined")) {
    return undefined;
  }

  if (options.format === "react-intl") {
    return findUndefinedReactIntlKeys(source, filesToParse);
  } else if (options.format === "i18next") {
    return findUndefinedI18NextKeys(source, filesToParse, componentFunctions);
  } else if (options.format === "next-intl") {
    return findUndefinedNextIntlKeys(source, filesToParse);
  }
};

const findUndefinedReactIntlKeys = async (
  translationFiles: TranslationFile[],
  filesToParse: string[]
) => {
  const sourceKeys = new Set(
    translationFiles.flatMap(({ content }) => {
      return Object.keys(content);
    })
  );

  const extractedResult = await extract(filesToParse, {
    extractSourceLocation: true,
  });

  let undefinedKeys: { [key: string]: string[] } = {};
  Object.entries(JSON.parse(extractedResult)).forEach(([key, meta]) => {
    if (!sourceKeys.has(key)) {
      // @ts-ignore
      const file = meta.file;
      if (!undefinedKeys[file]) {
        undefinedKeys[file] = [];
      }
      undefinedKeys[file].push(key);
    }
  });

  return undefinedKeys;
};

const findUndefinedI18NextKeys = async (
  source: TranslationFile[],
  filesToParse: string[],
  componentFunctions: string[] = []
) => {
  const { extractedResult, skippableKeys } = await getI18NextKeysInCode(
    filesToParse,
    componentFunctions
  );

  const sourceKeys = new Set(
    source.flatMap(({ content }) => {
      return Object.keys(content);
    })
  );

  let undefinedKeys: { [key: string]: string[] } = {};

  extractedResult.forEach(({ file, key }) => {
    const isSkippable = skippableKeys.find((skippableKey) => {
      return key.includes(skippableKey);
    });
    if (isSkippable === undefined && !sourceKeys.has(key)) {
      if (!undefinedKeys[file]) {
        undefinedKeys[file] = [];
      }
      undefinedKeys[file].push(key);
    }
  });

  return undefinedKeys;
};

const findUndefinedNextIntlKeys = async (
  translationFiles: TranslationFile[],
  filesToParse: string[]
) => {
  const sourceKeys = new Set(
    translationFiles.flatMap(({ content }) => {
      return Object.keys(content);
    })
  );

  const extractedResult = nextIntlExtract(filesToParse);

  let undefinedKeys: { [key: string]: string[] } = {};
  extractedResult.forEach(({ key, meta }) => {
    if (!sourceKeys.has(key)) {
      // @ts-ignore
      const file = meta.file;
      if (!undefinedKeys[file]) {
        undefinedKeys[file] = [];
      }
      undefinedKeys[file].push(key);
    }
  });

  return undefinedKeys;
};

const isRecord = (data: unknown): data is Record<string, unknown> => {
  return (
    typeof data === "object" &&
    !Array.isArray(data) &&
    data !== null &&
    data !== undefined
  );
};

const getI18NextKeysInCode = async (
  filesToParse: string[],
  componentFunctions: string[] = []
) => {
  // @ts-ignore
  const { transform } = await import("i18next-parser");

  const i18nextParser = new transform({
    lexers: {
      jsx: [
        {
          lexer: "JsxLexer",
          componentFunctions: componentFunctions.concat(["Trans"]),
        },
      ],
      tsx: [
        {
          lexer: "JsxLexer",
          componentFunctions: componentFunctions.concat(["Trans"]),
        },
      ],
    },
  });

  // Skip any parsed keys that have the `returnObjects` property set to true
  // As these are used dynamically, they will be skipped to prevent
  // these keys from being marked as unused.

  let extractedResult: { file: string; key: string }[] = [];

  const skippableKeys: string[] = [];

  filesToParse.forEach((file) => {
    const rawContent = fs.readFileSync(file, "utf-8");

    const entries = i18nextParser.parser.parse(rawContent, file);

    // Intermediate solution to retrieve all keys from the parser.
    // This will be built out to also include the namespace and check
    // the key against the namespace corresponding file.
    // The current implementation considers the key as used no matter the namespace.
    for (const entry of entries) {
      if (entry.returnObjects) {
        skippableKeys.push(entry.key);
      } else {
        extractedResult.push({ file, key: entry.key });
      }
    }
  });

  return { extractedResult, skippableKeys };
};

function flatten(
  object: Record<string, unknown>,
  prefix: string | null = null,
  result: Record<string, unknown> = {}
) {
  for (let key in object) {
    let propName = prefix ? `${prefix}.${key}` : key;
    const data = object[key];
    if (isRecord(data)) {
      flatten(data, propName, result);
    } else {
      result[propName] = data;
    }
  }
  return result;
}
