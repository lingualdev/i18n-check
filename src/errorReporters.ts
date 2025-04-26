import { Console } from "console";
import { Transform } from "stream";

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
