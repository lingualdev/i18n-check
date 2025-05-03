import { Translation } from '../types';

export const flattenTranslations = (translations: Translation) => {
  if (!hasNestedDefinitions(translations)) {
    return translations;
  }
  return flattenEntry(translations);
};

/**
 * Top level search for any objects
 */
const hasNestedDefinitions = (translations: Translation) => {
  return Object.values(translations).find(
    (translation) => typeof translation === 'object'
  );
};

const isTranslationObject = (entry: unknown): entry is Translation => {
  return typeof entry === 'object';
};

export const flattenEntry = (
  entry: Translation,
  keys: string[] = []
): Translation => {
  const result: Translation = {};
  if (!entry) {
    return result;
  }
  const entries = Object.entries(entry);
  for (const [k, v] of entries) {
    Object.assign(
      result,
      isTranslationObject(v)
        ? flattenEntry(v, [...keys, String(k)])
        : { [[...keys, String(k)].join('.')]: v }
    );
  }

  return result;
};
