#! /usr/bin/env node

import { glob } from "glob";
import chalk from "chalk";
import fs from "fs";
import { exit } from "process";
import { program } from "commander";
import { CheckResult, TranslationFile } from "../types";
import { checkTranslations, checkUnusedKeys } from "..";
import { Context, standardReporter, summaryReporter } from "../errorReporters";
import { flattenTranslations } from "../utils/flattenTranslations";

program
  .version("0.3.0")
  .option(
    "-l, --locales <locales...>",
    "name of the directory containing the locales to validate"
  )
  .option(
    "-s, --source [source locale]",
    "the source locale to validate against"
  )
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
  .option(
    "-u, --unused [folder]",
    "define the source path to find all unused keys"
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

const getSourcePath = (source: string, fileName: string) => {
  return fileName.toLowerCase().includes(source.toLowerCase());
};

/* const getLocalesPath = (paths: string[], source: string, fileName: string) => {
  const basePath = paths.find((path: string) => {
    return fileName.includes(path);
  });

  return basePath;
}; */

const toArray = (input: string): string[] => {
  return input
    .trim()
    .split(",")
    .filter((a: string) => a);
};

const main = async () => {
  const start = performance.now();
  const srcPath = program.getOptionValue("source");
  const localePath = program.getOptionValue("locales");
  const format = program.getOptionValue("format");
  const exclude = program.getOptionValue("exclude");
  const unusedSrcPath = program.getOptionValue("unused");

  if (!srcPath) {
    console.log(
      chalk.red(
        "Source not found. Please provide a valid source locale, i.e. -s en-US"
      )
    );
    exit(1);
  }

  if (!localePath || localePath.length === 0) {
    console.log(
      chalk.red(
        "Locale file(s) not found. Please provide valid locale file(s), i.e. -locales translations/"
      )
    );
    exit(1);
  }

  const excludedPaths = exclude ? toArray(exclude) : [];
  const localePathFolders: string[] = localePath;

  const isMultiFolders = localePathFolders.length > 1;

  let srcFiles: TranslationFile[] = [];
  let localeFiles: TranslationFile[] = [];

  const pattern = isMultiFolders
    ? `{${localePath.join(",").trim()}}/**/*.json`
    : `${localePath.join(",").trim()}/**/*.json`;

  const files = await glob(pattern, {
    ignore: ["node_modules/**"].concat(excludedPaths),
  });

  console.log("i18n translations checker");
  console.log(chalk.gray(`Source: ${srcPath}`));

  if (format) {
    console.log(chalk.blackBright(`Selected format is: ${format}`));
  }

  const options = {
    checks: getCheckOptions(),
    format: format ?? undefined,
  };

  const fileInfos: { file: string; name: string; path: string[] }[] = [];

  files.forEach((file) => {
    const path = file.split("/");
    const name = path.pop() ?? "";

    fileInfos.push({
      file,
      path,
      name,
    });
  });

  fileInfos.forEach(({ file, name, path }) => {
    const rawContent = JSON.parse(fs.readFileSync(file, "utf-8"));
    const content = flattenTranslations(rawContent);
    const sourcePath = getSourcePath(srcPath, file);
    if (sourcePath) {
      srcFiles.push({
        reference: null,
        name: file,
        content,
      });
    } else {
      const fullPath = path.join("-");
      const reference = fileInfos.find((fileInfo) => {
        if (
          !fileInfo.file.toLocaleLowerCase().includes(srcPath.toLowerCase())
        ) {
          return false;
        }
        return fileInfo.path.join("-") === fullPath || fileInfo.name === name;
      });

      if (reference) {
        localeFiles.push({
          reference: reference.file,
          name: file,
          content,
        });
      }
    }
  });

  if (srcFiles.length === 0) {
    console.log(
      chalk.red(
        "Source not found. Please provide a valid source locale, i.e. -s en-US"
      )
    );
    exit(1);
  }

  if (localeFiles.length === 0) {
    console.log(
      chalk.red(
        "Locale file(s) not found. Please provide valid locale file(s), i.e. --locales translations/"
      )
    );
    exit(1);
  }
  try {
    const result = checkTranslations(srcFiles, localeFiles, options);

    printTranslationResult(result);

    if (unusedSrcPath) {
      const unusedKeys = await checkUnusedKeys(
        srcFiles,
        unusedSrcPath,
        options
      );
      printUnusedKeysResult({ unusedKeys });
    }

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

const printTranslationResult = ({
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

const printUnusedKeysResult = ({
  unusedKeys,
}: {
  unusedKeys: CheckResult | undefined;
}) => {
  const reporter = program.getOptionValue("reporter");

  const isSummary = reporter === "summary";

  if (unusedKeys && Object.keys(unusedKeys).length > 0) {
    console.log(chalk.red("\nFound unused keys!"));
    if (isSummary) {
      console.log(chalk.red(summaryReporter(getSummaryRows(unusedKeys))));
    } else {
      console.log(chalk.red(standardReporter(getStandardRows(unusedKeys))));
    }
  } else if (unusedKeys) {
    console.log(chalk.green("\nNo unused found!"));
  }
};

const truncate = (chars: string) =>
  chars.length > 80 ? `${chars.substring(0, 80)}...` : chars;

const getSummaryRows = (checkResult: CheckResult) => {
  const formattedRows = [];

  for (const [file, keys] of Object.entries<string[]>(checkResult)) {
    formattedRows.push({
      file: truncate(file),
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
        file: truncate(file),
        key: truncate(key),
      });
    }
  }
  return formattedRows;
};

main();
