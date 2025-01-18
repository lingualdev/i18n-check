import { findMissingKeys } from "./utils/findMissingKeys";
import { CheckResult, Translation, TranslationFile } from "./types";
import { findInvalidTranslations } from "./utils/findInvalidTranslations";
import { findInvalid18nTranslations } from "./utils/findInvalidi18nTranslations";
import { Context } from "./errorReporters";
import { globSync } from "glob";
import { extract } from "@formatjs/cli-lib";
import fs from "fs";
import Vinyl from "vinyl";

export type Options = {
  format?: "icu" | "i18next" | "react-intl" | "react-i18next";
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
  source: TranslationFile[],
  codebaseSrc: string,
  options: Options = {
    format: "react-intl",
  },
  componentFunctions = []
): Promise<CheckResult | undefined> => {
  if (!options.format || !["react-intl", "i18next"].includes(options.format)) {
    return undefined;
  }

  return options.format === "react-intl"
    ? findUnusedReactIntlTranslations(source, codebaseSrc)
    : findUnusedI18NextTranslations(source, codebaseSrc, componentFunctions);
};

const findUnusedReactIntlTranslations = async (
  source: TranslationFile[],
  codebaseSrc: string
) => {
  let unusedKeys = {};

  // find any unused keys in a react-intl code base
  const unusedKeysFiles = globSync(codebaseSrc, {
    ignore: ["node_modules/**"],
  });

  const extracted = await extract(unusedKeysFiles, {});
  const extractedResultSet = new Set(Object.keys(JSON.parse(extracted)));

  source.forEach(({ name, content }) => {
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
  codebaseSrc: string,
  componentFunctions: string[] = []
) => {
  let unusedKeys = {};

  // find any unused keys in a react-i18next code base
  const unusedKeysFiles = globSync(`${codebaseSrc}/**/*.tsx`, {
    ignore: ["node_modules/**"],
  });

  let extractedResult: string[] = [];

  // @ts-ignore
  const { transform } = await import("i18next-parser");

  unusedKeysFiles.forEach((file) => {
    const rawContent = fs.readFileSync(file);

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
    i18nextParser.once("data", (file: { contents: any }) => {
      extractedResult = extractedResult.concat(
        Object.keys(flatten(JSON.parse(file.contents)))
      );
    });

    i18nextParser.end(
      new Vinyl({
        contents: rawContent,
        path: file,
      })
    );
  });

  const extractedResultSet = new Set(extractedResult);

  source.forEach(({ name, content }) => {
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

const isRecord = (data: unknown): data is Record<string, unknown> => {
  return (
    typeof data === "object" &&
    !Array.isArray(data) &&
    data !== null &&
    data !== undefined
  );
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
