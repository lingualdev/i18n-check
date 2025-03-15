/**
 *
 * i18next specific invalid translations check
 *
 *
 */

import { parse, MessageFormatElement } from "./i18NextParser";
import { Translation } from "../types";

export const findInvalid18nTranslations = (
  source: Translation,
  targets: Record<string, Translation>
) => {
  let differences = {};
  if (Object.keys(targets).length === 0) {
    return differences;
  }

  for (const [lang, file] of Object.entries(targets)) {
    const result = compareTranslationFiles(source, file);

    if (result.length > 0) {
      differences = Object.assign(differences, { [lang]: result });
    }
  }

  return differences;
};

export const compareTranslationFiles = (a: Translation, b: Translation) => {
  let diffs: unknown[] = [];
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

const lookUp: Record<MessageFormatElement["type"], number> = {
  text: 0,
  interpolation: 1,
  interpolation_unescaped: 2,
  nesting: 3,
  plural: 4,
  tag: 5,
};

const sortParsedKeys = (a: MessageFormatElement, b: MessageFormatElement) => {
  if (a.type === b.type && a.type !== "tag" && b.type !== "tag") {
    return a.content < b.content ? -1 : 1;
  }

  if (a.type === "tag" && b.type === "tag") {
    return a.raw < b.raw ? -1 : 1;
  }

  return lookUp[a.type] - lookUp[b.type];
};

export const hasDiff = (
  a: MessageFormatElement[],
  b: MessageFormatElement[]
) => {
  const compA = a
    .filter((element) => element.type !== "text")
    .sort(sortParsedKeys);
  const compB = b
    .filter((element) => element.type !== "text")
    .sort(sortParsedKeys);

  if (compA.length !== compB.length) {
    return true;
  }

  const hasErrors = compA.some((formatElementA, index) => {
    const formatElementB = compB[index];

    if (formatElementA.type !== formatElementB.type) {
      return true;
    }

    if (formatElementA.type === "tag" && formatElementB.type === "tag") {
      return (
        formatElementA.raw !== formatElementB.raw ||
        formatElementA.voidElement !== formatElementB.voidElement
      );
    }

    if (
      (formatElementA.type === "interpolation" &&
        formatElementB.type === "interpolation") ||
      (formatElementA.type === "interpolation_unescaped" &&
        formatElementB.type === "interpolation_unescaped") ||
      (formatElementA.type === "nesting" &&
        formatElementB.type === "nesting") ||
      (formatElementA.type === "plural" && formatElementB.type === "plural")
    ) {
      const optionsA = formatElementA.variable
        .split(",")
        .map((value) => value.trim())
        .sort()
        .join("-")
        .trim();
      const optionsB = formatElementB.variable
        .split(",")
        .map((value) => value.trim())
        .sort()
        .join("-")
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
    .filter((element) => element.type !== "text")
    .sort(sortParsedKeys);
  const compB = b
    .filter((element) => element.type !== "text")
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
    if (formatElementA.type !== formatElementB.type) {
      return acc;
    }

    if (formatElementA.type === "tag" && formatElementB.type === "tag") {
      if (
        formatElementA.raw !== formatElementB.raw ||
        formatElementA.voidElement !== formatElementB.voidElement
      ) {
        return acc;
      }
    }

    if (
      (formatElementA.type === "interpolation" &&
        formatElementB.type === "interpolation") ||
      (formatElementA.type === "interpolation_unescaped" &&
        formatElementB.type === "interpolation_unescaped") ||
      (formatElementA.type === "nesting" &&
        formatElementB.type === "nesting") ||
      (formatElementA.type === "plural" && formatElementB.type === "plural")
    ) {
      const optionsA = formatElementA.variable
        .split(",")
        .map((value) => value.trim())
        .sort()
        .join("-")
        .trim();
      const optionsB = formatElementB.variable
        .split(",")
        .map((value) => value.trim())
        .sort()
        .join("-")
        .trim();

      if (optionsA !== optionsB) {
        return acc;
      }

      if (formatElementA.prefix !== formatElementA.prefix) {
        return acc;
      }

      if (formatElementA.suffix !== formatElementA.suffix) {
        return acc;
      }
    }

    return acc;
  }, [] as string[]);

  return errors.join(", ");
};
