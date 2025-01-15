//  Based on https://github.com/i18next/i18next-translation-parser/blob/v1.0.0/src/parse.js

export type MessageFormatElement =
  | {
      type: "text";
      content: string;
    }
  | {
      type: "interpolation";
      raw: string;
      prefix: string;
      suffix: string;
      content: string;
      variable: string;
    }
  | {
      type: "interpolation_unescaped";
      raw: string;
      prefix: string;
      suffix: string;
      content: string;
      variable: string;
    }
  | {
      type: "nesting";
      raw: string;
      prefix: string;
      suffix: string;
      content: string;
      variable: string;
    }
  | {
      type: "plural";
      raw: string;
      prefix: string;
      suffix: string;
      content: string;
      variable: string;
    }
  | {
      type: "tag";
      raw: string;
      voidElement: boolean;
    };

const REGEXP = new RegExp(
  "({{[^}]+}}|\\$t{[^}]+}|\\$t\\([^\\)]+\\)|\\([0-9\\-inf]+\\)(?=\\[)|<[^>]+>)",
  "g"
);

const DOUBLE_BRACE = "{{";
const $_T_BRACE = "$t{";
const $_T_PARENTHESIS = "$t(";
const OPEN_PARENTHESIS = "(";
const OPEN_TAG = "<";
const CLOSE_TAG = "</";

export const parse = (input: string) => {
  let ast: MessageFormatElement[] = [];

  ast = parseInput([input]);

  return ast;
};

const parseInput = (input: string[]): MessageFormatElement[] => {
  if (input.length === 0) {
    return [];
  }
  let ast: MessageFormatElement[] = [];
  input.forEach((element) => {
    const elements = element.split(REGEXP).filter((element) => element !== "");
    const result = elements.reduce((acc, match) => {
      if (match.indexOf("{{-") === 0) {
        const content = match.substring(3, match.length - 2);
        acc.push({
          type: "interpolation_unescaped",
          raw: match,
          prefix: "{{-",
          suffix: "}}",
          content,
          variable: content.trim(),
        });
      } else if (match.indexOf(DOUBLE_BRACE) === 0) {
        const content = match.substring(2, match.length - 2);
        acc.push({
          type: "interpolation",
          raw: match,
          prefix: "{{",
          suffix: "}}",
          content,
          variable: content.trim(),
        });
      } else if (match.indexOf($_T_BRACE) === 0) {
        const content = match.substring(3, match.length - 1);
        acc.push({
          type: "nesting",
          raw: match,
          prefix: "$t{",
          suffix: "}",
          content,
          variable: content.trim(),
        });
      } else if (match.indexOf($_T_PARENTHESIS) === 0) {
        const content = match.substring(3, match.length - 1);
        acc.push({
          type: "nesting",
          raw: match,
          prefix: "$t(",
          suffix: ")",
          content,
          variable: content.trim(),
        });
      } else if (
        match.indexOf(OPEN_PARENTHESIS) === 0 &&
        /\([0-9\-inf]+\)/.test(match)
      ) {
        const content = match.substring(1, match.length - 1);
        acc.push({
          type: "plural",
          raw: match,
          prefix: "(",
          suffix: ")",
          content,
          variable: content.trim(),
        });
      } else if (match.indexOf(CLOSE_TAG) === 0) {
        acc.push({
          type: "tag",
          raw: match,
          voidElement: match.substring(match.length - 2) === "/>",
        });
      } else if (match.indexOf(OPEN_TAG) === 0) {
        acc.push({
          type: "tag",
          raw: match,
          voidElement: match.substring(match.length - 2) === "/>",
        });
      } else {
        acc.push({ type: "text", content: match });
      }

      return acc;
    }, [] as MessageFormatElement[]);
    ast = ast.concat(result);
  });

  return ast;
};
