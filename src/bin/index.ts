#! /usr/bin/env node

import { glob } from "glob";
import chalk from "chalk";
import fs from "fs";
import { exit } from "process";
import { program } from "commander";
import { CheckResult, TranslationFile } from "../types";
import { checkTranslations } from "..";
import { Context, standardReporter, summaryReporter } from "../errorReporters";
import { flattenTranslations } from "../utils/flattenTranslations";

program
  .version("0.1.0")
  .option(
    "-t, --target [directory]",
    "name of the directory containing the JSON files to validate"
  )
  .option("-s, --source [source file(s)]", "path to the reference file(s)")
  .option(
    "-f, --format [format type]",
    "define the specific format, i.e. i18next"
  )
  .option(
    "-c, --check [checks]",
    "define the specific checks you want to run: invalid, missing. By default the check will validate against missing and invalid keys, i.e. --check invalidKeys,missingKeys"
  )
  .option(
    "-r, --reporter [error reporting style]",
    "define the reporting style: standard or summary"
  )
  .option(
    "-e, --exclude [file(s), folder(s)]",
    "define the file(s) and/or folders(s) that should be excluded from the check"
  )
  .parse();

const getCheckOptions = (): Context[] => {
  const checkOption = program.getOptionValue("check");

  if (!checkOption) {
    return ["invalidKeys", "missingKeys"];
  }

  const checks = checkOption
    .split(",")
    .filter((check: string) =>
      ["invalidKeys", "missingKeys"].includes(check.trim())
    );

  return checks.length > 0 ? checks : ["invalidKeys", "missingKeys"];
};

const getSourcePath = (sourcePaths: string[], fileName: string) => {
  return sourcePaths.find((basePathName: string) => {
    return fileName.includes(basePathName);
  });
};

const getTargetPath = (
  paths: string[],
  sourcePaths: string[],
  fileName: string
) => {
  const basePath = paths.find((path: string) => {
    return fileName.includes(path);
  });
  if (!basePath) {
    return null;
  }

  return sourcePaths.find((path) => path.includes(basePath));
};

const toArray = (input: string): string[] => {
  return input
    .trim()
    .split(",")
    .filter((a: string) => a);
};

const main = async () => {
  const start = performance.now();
  const srcPath = program.getOptionValue("source");
  const targetPath = program.getOptionValue("target");
  const format = program.getOptionValue("format");
  const exclude = program.getOptionValue("exclude");

  if (!srcPath) {
    console.log(
      chalk.red(
        "Source file(s) not found. Please provide valid source file(s), i.e. -s translations/en-us.json"
      )
    );
    exit(1);
  }

  if (!targetPath) {
    console.log(
      chalk.red(
        "Target file(s) not found. Please provide valid target file(s), i.e. -t translations/"
      )
    );
    exit(1);
  }

  const excludedPaths = exclude ? toArray(exclude) : [];
  const targetPathFolders: string[] = toArray(targetPath);
  const srcPaths: string[] = toArray(srcPath);

  const isMultiFolders = targetPathFolders.length > 1;

  let srcFiles: TranslationFile[] = [];
  let targetFiles: TranslationFile[] = [];

  const pattern = isMultiFolders
    ? `{${targetPath.trim()}}/**/*.json`
    : `${targetPath.trim()}/**/*.json`;

  const files = await glob(pattern, {
    ignore: ["node_modules/**"].concat(excludedPaths),
  });

  console.log("i18n translations checker");
  console.log(chalk.gray(`Source file(s): ${srcPath}`));

  if (format) {
    console.log(chalk.blackBright(`Selected format is: ${format}`));
  }

  const options = {
    checks: getCheckOptions(),
    format: format ?? undefined,
  };

  files.forEach((file) => {
    const content = JSON.parse(fs.readFileSync(file, "utf-8"));
    const sourcePath = getSourcePath(srcPaths, file);
    if (sourcePath) {
      srcFiles.push({
        reference: null,
        name: file,
        content: flattenTranslations(content),
      });
    } else {
      const targetPath = getTargetPath(targetPathFolders, srcPaths, file);
      const reference = targetPath?.includes(".json")
        ? targetPath
        : `${targetPath}${file.split("/").pop()}`;

      targetFiles.push({
        reference,
        name: file,
        content: flattenTranslations(content),
      });
    }
  });

  if (srcFiles.length === 0) {
    console.log(
      chalk.red(
        "Source file(s) not found. Please provide valid source file(s), i.e. -s translations/en-us.json"
      )
    );
    exit(1);
  }

  if (targetFiles.length === 0) {
    console.log(
      chalk.red(
        "Target file(s) not found. Please provide valid target file(s), i.e. -t translations/"
      )
    );
    exit(1);
  }

  try {
    const result = checkTranslations(srcFiles, targetFiles, options);

    print(result);

    const end = performance.now();

    console.log(
      chalk.green(
        `\nDone in ${Math.round(((end - start) * 100) / 1000) / 100}s.`
      )
    );
    if (
      (result.missingKeys && Object.keys(result.missingKeys).length > 0) ||
      (result.invalidKeys && Object.keys(result.invalidKeys).length > 0)
    ) {
      exit(1);
    } else {
      exit(0);
    }
  } catch (e) {
    console.log(
      chalk.red(
        "\nError: Can't validate translations. Check if the format is supported or specify the translation format i.e. -f i18next"
      )
    );
    exit(1);
  }
};

const print = ({
  missingKeys,
  invalidKeys,
}: {
  missingKeys: CheckResult | undefined;
  invalidKeys: CheckResult | undefined;
}) => {
  const reporter = program.getOptionValue("reporter");

  const isSummary = reporter === "summary";

  if (missingKeys && Object.keys(missingKeys).length > 0) {
    console.log(chalk.red("\nFound missing keys!"));
    if (isSummary) {
      console.log(chalk.red(summaryReporter(getSummaryRows(missingKeys))));
    } else {
      console.log(chalk.red(standardReporter(getStandardRows(missingKeys))));
    }
  } else if (missingKeys) {
    console.log(chalk.green("\nNo missing keys found!"));
  }

  if (invalidKeys && Object.keys(invalidKeys).length > 0) {
    console.log(chalk.red("\nFound invalid keys!"));
    if (isSummary) {
      console.log(chalk.red(summaryReporter(getSummaryRows(invalidKeys))));
    } else {
      console.log(chalk.red(standardReporter(getStandardRows(invalidKeys))));
    }
  } else if (invalidKeys) {
    console.log(chalk.green("\nNo invalid translations found!"));
  }
};

const getSummaryRows = (checkResult: CheckResult) => {
  const formattedRows = [];

  for (const [file, keys] of Object.entries<string[]>(checkResult)) {
    formattedRows.push({
      file,
      total: keys.length,
    });
  }
  return formattedRows;
};

const getStandardRows = (checkResult: CheckResult) => {
  const formattedRows = [];

  for (const [file, keys] of Object.entries<string[]>(checkResult)) {
    for (const key of keys) {
      formattedRows.push({
        file,
        key,
      });
    }
  }
  return formattedRows;
};

main();
