import { Console } from "console";
import { Transform } from "stream";
import { CheckResult, InvalidTranslationsResult } from "./types";

export type StandardReporter = {
  file: string;
  key: string;
  msg?: string;
};

export const CheckOptions = [
  "invalidKeys",
  "missingKeys",
  "unused",
  "undefined",
];

export type Context = (typeof CheckOptions)[number];

export const contextMapping: Record<Context, string> = {
  invalidKeys: "invalid",
  missingKeys: "missing",
  unused: "unused",
  undefined: "undefined",
};

export const standardReporter = (
  result: StandardReporter[],
  flatten = false
) => {
  if (flatten) {
    const data = result.reduce((acc, row) => {
      Object.entries(row).forEach(([info, result]) => {
        acc.push({ info, result });
      });
      return acc;
    }, [] as Record<string, unknown>[]);

    return createVerticalTable(data);
  }
  return createTable(result);
};

export const summaryReporter = (
  result: {
    file: string;
    total: number;
  }[]
) => {
  return createTable(result.map(({ file, total }) => ({ file, total })));
};

export const createTable = (input: unknown[]) => {
  // https://stackoverflow.com/a/67859384
  const ts = new Transform({
    transform(chunk, enc, cb) {
      cb(null, chunk);
    },
  });
  const logger = new Console({ stdout: ts });
  logger.table(input);
  const table = (ts.read() || "").toString();
  // https://stackoverflow.com/a/69874540
  let output = "";
  const lines = table.split(/[\r\n]+/);
  for (let line of lines) {
    output += `${line
      .replace(/[^┬]*┬/, "┌")
      .replace(/^├─*┼/, "├")
      .replace(/│[^│]*/, "")
      .replace(/^└─*┴/, "└")
      .replace(/'/g, " ")}\n`;
  }

  return output.replace(/\n\n$/, "");
};

export const createVerticalTable = (input: unknown[]) => {
  // https://stackoverflow.com/a/67859384
  const ts = new Transform({
    transform(chunk, enc, cb) {
      cb(null, chunk);
    },
  });
  const logger = new Console({ stdout: ts });
  logger.table(input);
  const table = (ts.read() || "").toString();
  // https://stackoverflow.com/a/69874540
  let output = "";
  let firstLine = "";
  let index = 0;
  const lines = table.split(/[\r\n]+/);
  for (let line of lines) {
    const transformedLine = `${line
      .replace(/[^┬]*┬/, "┌")
      .replace(/^├─*┼/, "├")
      .replace(/│[^│]*/, "")
      .replace(/^└─*┴/, "└")
      .replace(/'/g, " ")}\n`;
    output += transformedLine;

    if (index === 2) {
      firstLine = transformedLine;
    }
    if (index > 3 && (index + 1) % 3 === 0 && index !== lines.length - 3) {
      output += firstLine;
    }
    index++;
  }

  return output.replace(/\n\n$/, "");
};

export function formatSummaryTable(
  result: CheckResult | InvalidTranslationsResult
) {
  return summaryReporter(getSummaryRows(result));
}

const getSummaryRows = (
  checkResult: CheckResult | InvalidTranslationsResult
) => {
  const formattedRows: { file: string; total: number }[] = [];

  for (const [file, keys] of Object.entries(checkResult)) {
    formattedRows.push({
      file: truncate(file),
      total: keys.length,
    });
  }
  return formattedRows;
};

export function formatTable(rowGroups: string[][][], lineSep = "\n") {
  // +2 for whitespace padding left and right
  const padding = 2;
  const colWidths: number[] = [];

  for (const rows of rowGroups) {
    for (const row of rows) {
      for (let index = 0; index < row.length; ++index) {
        colWidths[index] = Math.max(
          colWidths[index] ?? 0,
          row[index].length + padding
        );
      }
    }
  }
  const lines: string[] = [];

  lines.push(formatSeparatorRow(colWidths, "┌┬┐"));

  for (const rows of rowGroups) {
    for (const row of rows) {
      lines.push(formatRow(row, colWidths));
    }

    lines.push(formatSeparatorRow(colWidths, "├┼┤"));
  }

  lines[lines.length - 1] = formatSeparatorRow(colWidths, "└┴┘");

  return lines.join(lineSep);
}

function formatSeparatorRow(widths: number[], [left, middle, right]: string) {
  return (
    left + widths.map((width) => "".padEnd(width, "─")).join(middle) + right
  );
}

function formatRow(values: string[], widths: number[]) {
  return (
    `│` +
    values
      .map((val, index) => ` ${val} `.padEnd(widths[index], " "))
      .join("│") +
    `│`
  );
}

const truncate = (chars: string, len = 80) =>
  chars.length > 80 ? `${chars.substring(0, len)}...` : chars;

export function formatCheckResultTable(result: CheckResult) {
  return formatTable([
    [["file", "key"]],
    Object.entries(result).flatMap(([file, keys]) =>
      keys.map((key) => [truncate(file), truncate(key)])
    ),
  ]);
}

export function formatInvalidTranslationsResultTable(
  result: InvalidTranslationsResult
) {
  return formatTable([
    [["info", "result"]],
    ...Object.entries(result).flatMap(([file, errors]) =>
      errors.map(({ key, msg }) => [
        ["file", truncate(file)],
        ["key", truncate(key)],
        ["msg", truncate(msg, 120)],
      ])
    ),
  ]);
}
