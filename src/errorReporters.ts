import { Console } from "console";
import { Transform } from "stream";

export type Context = "missingKeys" | "invalidKeys";

export const contextMapping: Record<Context, string> = {
  invalidKeys: "invalid",
  missingKeys: "missing",
};

export const standardReporter = (
  result: {
    file: string;
    key: string;
  }[]
) => {
  return createTable(result.map(({ file, key }) => ({ file, key })));
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
  for (let line of table.split(/[\r\n]+/)) {
    output += `${line
      .replace(/[^┬]*┬/, "┌")
      .replace(/^├─*┼/, "├")
      .replace(/│[^│]*/, "")
      .replace(/^└─*┴/, "└")
      .replace(/'/g, " ")}\n`;
  }

  return output.replace(/\n\n$/, "");
};
