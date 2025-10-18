/**
 *
 * i18next specific invalid translations check
 *
 *
 */

import { parse, MessageFormatElement } from './i18NextParser';
import {
  InvalidTranslationEntry,
  InvalidTranslationsResult,
  Translation,
} from '../types';

export const findInvalidI18NextTranslations = (
  source: Translation,
  targets: Record<string, Translation>
) => {
  const differences: InvalidTranslationsResult = {};
  if (Object.keys(targets).length === 0) {
    return differences;
  }

  for (const [lang, file] of Object.entries(targets)) {
    const result = compareTranslationFiles(source, file);

    if (result.length > 0) {
      differences[lang] = result;
    }
  }

  return differences;
};

export const compareTranslationFiles = (a: Translation, b: Translation) => {
  const diffs: InvalidTranslationEntry[] = [];
  for (const key in a) {
    if (b[key] === undefined) {
      continue;
    }
    const parsedTranslationA = parse(String(a[key]));
    const parsedTranslationB = parse(String(b[key]));
    if (hasDiff(parsedTranslationA, parsedTranslationB)) {
      const msg = getErrorMessage(parsedTranslationA, parsedTranslationB);
      diffs.push({ key, msg });
    }
  }
  return diffs;
};

const lookUp: Record<MessageFormatElement['type'], number> = {
  text: 0,
  interpolation: 1,
  interpolation_unescaped: 2,
  nesting: 3,
  plural: 4,
  tag: 5,
};

const sortParsedKeys = (a: MessageFormatElement, b: MessageFormatElement) => {
  if (a.type === b.type && a.type !== 'tag' && b.type !== 'tag') {
    return a.content < b.content ? -1 : 1;
  }

  if (a.type === 'tag' && b.type === 'tag') {
    return a.raw < b.raw ? -1 : 1;
  }

  return lookUp[a.type] - lookUp[b.type];
};

export const hasDiff = (
  a: MessageFormatElement[],
  b: MessageFormatElement[]
) => {
  const compA = a
    .filter((element) => element.type !== 'text')
    .sort(sortParsedKeys);
  const compB = b
    .filter((element) => element.type !== 'text')
    .sort(sortParsedKeys);

  if (compA.length !== compB.length) {
    return true;
  }

  const hasErrors = compA.some((formatElementA, index) => {
    const formatElementB = compB[index];

    if (formatElementA.type !== formatElementB.type) {
      return true;
    }

    if (formatElementA.type === 'tag' && formatElementB.type === 'tag') {
      return (
        formatElementA.raw !== formatElementB.raw ||
        formatElementA.voidElement !== formatElementB.voidElement
      );
    }

    if (
      (formatElementA.type === 'interpolation' &&
        formatElementB.type === 'interpolation') ||
      (formatElementA.type === 'interpolation_unescaped' &&
        formatElementB.type === 'interpolation_unescaped') ||
      (formatElementA.type === 'nesting' &&
        formatElementB.type === 'nesting') ||
      (formatElementA.type === 'plural' && formatElementB.type === 'plural')
    ) {
      const optionsA = formatElementA.variable
        .split(',')
        .map((value) => value.trim())
        .sort()
        .join('-')
        .trim();
      const optionsB = formatElementB.variable
        .split(',')
        .map((value) => value.trim())
        .sort()
        .join('-')
        .trim();

      if (optionsA !== optionsB) {
        return true;
      }

      if (formatElementA.prefix !== formatElementA.prefix) {
        return true;
      }

      if (formatElementA.suffix !== formatElementA.suffix) {
        return true;
      }
    }

    return false;
  });

  return hasErrors;
};

const getErrorMessage = (
  a: MessageFormatElement[],
  b: MessageFormatElement[]
): string => {
  const compA = a
    .filter((element) => element.type !== 'text')
    .sort(sortParsedKeys);
  const compB = b
    .filter((element) => element.type !== 'text')
    .sort(sortParsedKeys);

  const errors = compA.reduce((acc, formatElementA, index) => {
    const formatElementB = compB[index];

    if (!formatElementB) {
      acc.push(`Missing element ${formatElementA.type}`);
      return acc;
    }

    if (formatElementA.type !== formatElementB.type) {
      acc.push(
        `Expected element of type "${formatElementA.type}" but received "${formatElementB.type}"`
      );
      return acc;
    }

    if (formatElementA.type === 'tag' && formatElementB.type === 'tag') {
      if (formatElementA.raw !== formatElementB.raw) {
        acc.push(
          `Expected tag "${formatElementA.raw}" but received "${formatElementB.raw}"`
        );
      } else if (
        formatElementA.voidElement !== formatElementB.voidElement &&
        formatElementA.voidElement === true
      ) {
        acc.push(`Expected a self-closing "${formatElementB.raw}" tag`);
        return acc;
      } else if (
        formatElementA.voidElement !== formatElementB.voidElement &&
        formatElementA.voidElement === false
      ) {
        acc.push(`Non expected self-closing "${formatElementB.raw}" tag`);
        return acc;
      }
    }

    if (
      (formatElementA.type === 'interpolation' &&
        formatElementB.type === 'interpolation') ||
      (formatElementA.type === 'interpolation_unescaped' &&
        formatElementB.type === 'interpolation_unescaped') ||
      (formatElementA.type === 'nesting' &&
        formatElementB.type === 'nesting') ||
      (formatElementA.type === 'plural' && formatElementB.type === 'plural')
    ) {
      if (formatElementA.prefix !== formatElementA.prefix) {
        acc.push(
          `Error in ${formatElementA.type}: Expected prefix "${formatElementA.prefix}" but received "${formatElementB.prefix}"`
        );
        return acc;
      }

      if (formatElementA.suffix !== formatElementA.suffix) {
        acc.push(
          `Error in ${formatElementA.type}: Expected suffix "${formatElementA.suffix}" but received "${formatElementB.suffix}"`
        );
        return acc;
      }

      const optionsA = formatElementA.variable
        .split(',')
        .map((value) => value.trim())
        .sort();
      const optionsB = formatElementB.variable
        .split(',')
        .map((value) => value.trim())
        .sort();

      const elementErrors: (string | null)[] = [];
      optionsA.forEach((key, index) => {
        if (key !== optionsB[index]) {
          elementErrors.push(`Expected ${key} but received ${optionsB[index]}`);
        }
      });
      if (elementErrors.length > 0) {
        acc.push(
          `Error in ${formatElementA.type}: ${elementErrors
            .flatMap((elementError) => elementError)
            .join(', ')}`
        );
      }
      return acc;
    }

    return acc;
  }, [] as string[]);

  if (compA.length < compB.length) {
    const unexpectedElements = compB
      .slice(compA.length)
      .reduce<string[]>((acc, formatElementB) => {
        acc.push(`Unexpected ${formatElementB.type} element`);
        return acc;
      }, [])
      .join(', ');

    return [...errors, unexpectedElements].join(', ');
  }

  return errors.join(', ');
};
