export type Context = "missingKeys" | "invalidKeys";
export type ErrorReporter = (result: string[], context: Context) => void;

export const contextMapping: Record<Context, string> = {
  invalidKeys: "invalid",
  missingKeys: "missing",
};

export const standardReporter: ErrorReporter = (result) => {
  return result.map((key) => `◯ ${key}`).join("\n");
};

export const summaryReporter: ErrorReporter = (result, context) => {
  const count = result.length;
  return `Found ${count} ${contextMapping[context]} ${
    count === 1 ? "key" : "keys"
  }.`;
};
