import {
  MessageFormatElement,
  isLiteralElement,
  isPluralElement,
  isPoundElement,
  isSelectElement,
  isTagElement,
  parse,
} from "@formatjs/icu-messageformat-parser";
import { Translation } from "../types";

export const findInvalidTranslations = (
  source: Translation,
  files: Record<string, Translation>
) => {
  let differences = {};
  if (Object.keys(files).length === 0) {
    return differences;
  }

  for (const [lang, file] of Object.entries(files)) {
    const result = compareTranslationFiles(source, file);

    if (result.length > 0) {
      differences = Object.assign(differences, { [lang]: result });
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
  let diffs = [];
  for (const key in a) {
    if (
      b[key] !== undefined &&
      hasDiff(parse(String(a[key])), parse(String(b[key])))
    ) {
      diffs.push(key);
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

    // @ts-ignore
    if (formatElementA.value !== formatElementB.value) {
      return true;
    }

    if (isTagElement(formatElementA) && isTagElement(formatElementB)) {
      return hasDiff(formatElementA.children, formatElementB.children);
    }

    if (
      (isSelectElement(formatElementA) && isSelectElement(formatElementB)) ||
      (isPluralElement(formatElementA) && isPluralElement(formatElementB))
    ) {
      const optionsA = Object.keys(formatElementA.options).sort();
      const optionsB = Object.keys(formatElementB.options).sort();

      if (optionsA.join("-") !== optionsB.join("-")) {
        return true;
      }
      return optionsA.some((key) => {
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
