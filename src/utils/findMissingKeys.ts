import { Options, Translation } from '../types';
import { I18NEXT_PLURAL_SUFFIX } from './constants';

export const findMissingKeys = (
  source: Translation,
  targets: Record<string, Translation>,
  options: Options = {}
) => {
  const differences: Record<string, string[]> = {};
  for (const [lang, file] of Object.entries(targets)) {
    const result =
      options.format === 'i18next'
        ? compareI18nextTranslationFiles(source, file)
        : compareTranslationFiles(source, file);
    if (result.length > 0) {
      differences[lang] = result;
    }
  }

  return differences;
};

export const compareTranslationFiles = (
  src: Translation,
  target: Translation
) => {
  const diffs: string[] = [];
  for (const key in src) {
    const counterKey = target[key];
    if (!counterKey) {
      diffs.push(key);
    }
  }
  return diffs;
};

export const compareI18nextTranslationFiles = (
  src: Translation,
  target: Translation
) => {
  const diffs: string[] = [];

  const flattedSrc = Object.entries(src).reduce<Translation>((acc, [k, v]) => {
    const pluralSuffix = I18NEXT_PLURAL_SUFFIX.find((suffix) => {
      return k.endsWith(suffix);
    });
    const key = pluralSuffix ? k.replace(pluralSuffix, '') : k;
    acc[key] = v;
    return acc;
  }, {});

  const flattedTarget = Object.entries(target).reduce<Translation>(
    (acc, [k, v]) => {
      const pluralSuffix = I18NEXT_PLURAL_SUFFIX.find((suffix) => {
        return k.endsWith(suffix);
      });
      const key = pluralSuffix ? k.replace(pluralSuffix, '') : k;
      acc[key] = v;
      return acc;
    },
    {}
  );

  for (const key in flattedSrc) {
    const counterKey = flattedTarget[key];
    if (!counterKey) {
      diffs.push(key);
    }
  }
  return diffs;
};
