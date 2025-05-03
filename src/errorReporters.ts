import { CheckResult, InvalidTranslationsResult } from './types';

export type StandardReporter = {
  file: string;
  key: string;
  msg?: string;
};

export const CheckOptions = [
  'invalidKeys',
  'missingKeys',
  'unused',
  'undefined',
];

export type Context = (typeof CheckOptions)[number];

export const contextMapping: Record<Context, string> = {
  invalidKeys: 'invalid',
  missingKeys: 'missing',
  unused: 'unused',
  undefined: 'undefined',
};

export function formatSummaryTable<T>(result: Record<string, T[]>) {
  return formatTable(getSummaryRows(result));
}

const getSummaryRows = <T>(checkResult: Record<string, T[]>): string[][][] => {
  const rows: string[][] = [];
  for (const [file, keys] of Object.entries(checkResult)) {
    rows.push([truncate(file), String(keys.length)]);
  }
  return [[['file', 'total']], rows];
};

export function formatTable(rowGroups: string[][][], lineSep = '\n') {
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

  lines.push(formatSeparatorRow(colWidths, '┌┬┐'));

  for (const rows of rowGroups) {
    for (const row of rows) {
      lines.push(formatRow(row, colWidths));
    }

    lines.push(formatSeparatorRow(colWidths, '├┼┤'));
  }

  lines[lines.length - 1] = formatSeparatorRow(colWidths, '└┴┘');

  return lines.join(lineSep);
}

function formatSeparatorRow(widths: number[], [left, middle, right]: string) {
  return (
    left + widths.map((width) => ''.padEnd(width, '─')).join(middle) + right
  );
}

function formatRow(values: string[], widths: number[]) {
  return (
    `│` +
    values
      .map((val, index) => ` ${val} `.padEnd(widths[index], ' '))
      .join('│') +
    `│`
  );
}

const truncate = (chars: string, len = 80) =>
  chars.length > 80 ? `${chars.substring(0, len)}...` : chars;

export function formatCheckResultTable(result: CheckResult) {
  return formatTable([
    [['file', 'key']],
    Object.entries(result).flatMap(([file, keys]) =>
      keys.map((key) => [truncate(file), truncate(key)])
    ),
  ]);
}

export function formatInvalidTranslationsResultTable(
  result: InvalidTranslationsResult
) {
  return formatTable([
    [['info', 'result']],
    ...Object.entries(result).flatMap(([file, errors]) =>
      errors.map(({ key, msg }) => [
        ['file', truncate(file)],
        ['key', truncate(key)],
        ['msg', truncate(msg, 120)],
      ])
    ),
  ]);
}
