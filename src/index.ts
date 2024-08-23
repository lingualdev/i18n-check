import { findMissingKeys } from "./utils/findMissingKeys";
import { CheckResult, Translation, TranslationFile } from "./types";
import { findInvalidTranslations } from "./utils/findInvalidTranslations";
import { findInvalid18nTranslations } from "./utils/findInvalidi18nTranslations";
import { Context } from "./errorReporters";
import { globSync } from "glob";
import { extract } from "@formatjs/cli-lib";

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
  }
): Promise<CheckResult | undefined> => {
  if (!options.format || !["react-intl", "i18next"].includes(options.format)) {
    return undefined;
  }

  return options.format === "react-intl"
    ? findUnusedReactIntlTranslations(source, codebaseSrc)
    : undefined;
};

const findUnusedReactIntlTranslations = async (
  source: TranslationFile[],
  codebaseSrc: string
) => {
  let unusedKeys = {};

  // find any unused keys in a react-intl code base
  const unsuedKeysFiles = globSync(codebaseSrc, {
    ignore: ["node_modules/**"],
  });

  const extracted = await extract(unsuedKeysFiles, {});
  const extractedResultSet = new Set(Object.keys(JSON.parse(extracted)));

  source.forEach(({ name, content }) => {
    const keysInSource = Object.keys(content);
    const found = [];
    for (const keyInSource of keysInSource) {
      if (!extractedResultSet.has(keyInSource)) {
        found.push(keyInSource);
      }
    }

    Object.assign(unusedKeys, { [name]: found });
  });

  return unusedKeys;
};
