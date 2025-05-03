import {
  MessageFormatElement,
  isLiteralElement,
  isPluralElement,
  isPoundElement,
  isSelectElement,
  isTagElement,
  parse,
} from '@formatjs/icu-messageformat-parser';
import {
  InvalidTranslationEntry,
  InvalidTranslationsResult,
  Translation,
} from '../types';

export const findInvalidTranslations = (
  source: Translation,
  files: Record<string, Translation>
) => {
  const differences: InvalidTranslationsResult = {};
  if (Object.keys(files).length === 0) {
    return differences;
  }

  for (const [lang, file] of Object.entries(files)) {
    const result = compareTranslationFiles(source, file);

    if (result.length > 0) {
      differences[lang] = result;
    }
  }

  return differences;
};

const sortParsedKeys = (a: MessageFormatElement, b: MessageFormatElement) => {
  if (a.type === b.type) {
    return !isPoundElement(a) && !isPoundElement(b)
      ? a.value < b.value
        ? -1
        : 1
      : -1;
  }
  return a.type - b.type;
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

export const hasDiff = (
  a: MessageFormatElement[],
  b: MessageFormatElement[]
) => {
  const compA = a
    .filter((element) => !isLiteralElement(element))
    .sort(sortParsedKeys);

  const compB = b
    .filter((element) => !isLiteralElement(element))
    .sort(sortParsedKeys);
  if (compA.length !== compB.length) {
    return true;
  }

  const hasErrors = compA.some((formatElementA, index) => {
    const formatElementB = compB[index];

    if (
      formatElementA.type !== formatElementB.type ||
      formatElementA.location !== formatElementB.location
    ) {
      return true;
    }

    if (
      (isLiteralElement(formatElementA) && isLiteralElement(formatElementB)) ||
      (isPoundElement(formatElementA) && isPoundElement(formatElementB))
    ) {
      return false;
    }

    if (
      !isPoundElement(formatElementA) &&
      !isPoundElement(formatElementB) &&
      formatElementA.value !== formatElementB.value
    ) {
      return true;
    }

    if (isTagElement(formatElementA) && isTagElement(formatElementB)) {
      return hasDiff(formatElementA.children, formatElementB.children);
    }

    if (isSelectElement(formatElementA) && isSelectElement(formatElementB)) {
      const optionsA = Object.keys(formatElementA.options).sort();
      const optionsB = Object.keys(formatElementB.options).sort();

      if (optionsA.join('-') !== optionsB.join('-')) {
        return true;
      }
      return optionsA.some((key) => {
        return hasDiff(
          formatElementA.options[key].value,
          formatElementB.options[key].value
        );
      });
    }

    if (isPluralElement(formatElementA) && isPluralElement(formatElementB)) {
      const optionsA = Object.keys(formatElementA.options).sort();

      return optionsA.some((key) => {
        // We can only compare translations that have the same plural keys.
        // In English, we might have "one", "other", but in German, we might have "one", "few", "other".
        // Or, in Arabic it might just be "other".
        // So, we'll have to skip over the ones that don't have a one-to-one match.
        if (!formatElementB.options[key]) {
          return false;
        }
        return hasDiff(
          formatElementA.options[key].value,
          formatElementB.options[key].value
        );
      });
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
    .filter((element) => !isLiteralElement(element))
    .sort(sortParsedKeys);

  const compB = b
    .filter((element) => !isLiteralElement(element))
    .sort(sortParsedKeys);

  const errors = compA.reduce((acc, formatElementA, index) => {
    const formatElementB = compB[index];

    if (!formatElementB) {
      acc.push(`Missing element ${typeLookup[formatElementA.type]}`);
      return acc;
    }

    if (formatElementA.type !== formatElementB.type) {
      acc.push(
        `Expected element of type "${
          typeLookup[formatElementA.type]
        }" but received "${typeLookup[formatElementB.type]}"`
      );
      return acc;
    }

    if (formatElementA.location !== formatElementB.location) {
      acc.push(
        `Expected location to be ${formatElementA.location?.start?.line}:${formatElementA.location?.start?.column}`
      );
      return acc;
    }

    if (isPoundElement(formatElementA) && isPoundElement(formatElementB)) {
      return acc;
    }

    if (
      !isPoundElement(formatElementA) &&
      !isPoundElement(formatElementB) &&
      formatElementA.value !== formatElementB.value
    ) {
      acc.push(
        `Expected ${typeLookup[formatElementA.type]} to contain "${
          formatElementA.value
        }" but received "${formatElementB.value}"`
      );
      return acc;
    }

    if (isTagElement(formatElementA) && isTagElement(formatElementB)) {
      acc.push(
        `Error in pound element: ${getErrorMessage(
          formatElementA.children,
          formatElementB.children
        )}`
      );
      return acc;
    }

    if (isSelectElement(formatElementA) && isSelectElement(formatElementB)) {
      const optionsA = Object.keys(formatElementA.options).sort();

      const elementErrors: (string | null)[] = [];
      optionsA.forEach((key) => {
        if (formatElementB.options[key]) {
          elementErrors.push(
            getErrorMessage(
              formatElementA.options[key].value,
              formatElementB.options[key].value
            )
          );
        }
      });
      acc.push(
        `Error in select: ${elementErrors
          .flatMap((elementError) => elementError)
          .join(', ')}`
      );
      return acc;
    }

    if (isPluralElement(formatElementA) && isPluralElement(formatElementB)) {
      const optionsA = Object.keys(formatElementA.options).sort();
      const elementErrors: (string | null)[] = [];
      optionsA.forEach((key) => {
        if (formatElementB.options[key]) {
          elementErrors.push(
            getErrorMessage(
              formatElementA.options[key].value,
              formatElementB.options[key].value
            )
          );
        }
      });
      acc.push(
        `Error in plural: ${elementErrors
          .flatMap((elementError) => elementError)
          .join(', ')}`
      );
      return acc;
    }

    return acc;
  }, [] as string[]);

  if (compA.length < compB.length) {
    const unexpectedElements = compB
      .slice(compA.length)
      .reduce<string[]>((acc, formatElementB) => {
        acc.push(`Unexpected ${typeLookup[formatElementB.type]} element`);
        return acc;
      }, [])
      .join(', ');

    return [...errors, unexpectedElements].join(', ');
  }

  return errors.join(', ');
};

const typeLookup = {
  0: 'literal',
  1: 'argument',
  2: 'number',
  3: 'date',
  4: 'time',
  5: 'select',
  6: 'plural',
  7: 'pound',
  8: 'tag',
};
