import { Translation } from "../types";

export const findMissingKeys = (
  source: Translation,
  targets: Record<string, Translation>
) => {
  let differences: Record<string, string[]> = {};
  for (const [lang, file] of Object.entries(targets)) {
    const result = compareTranslationFiles(source, file);
    if (result.length > 0) {
      differences[lang] = result;
    }
  }

  return differences;
};

export const compareTranslationFiles = (a: Translation, b: Translation) => {
  let diffs: string[] = [];
  for (const key in a) {
    const counterKey = b[key];
    if (!counterKey) {
      diffs.push(key);
    }
  }
  return diffs;
};
