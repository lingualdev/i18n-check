#! /usr/bin/env node

import fs from 'node:fs';
import { exit } from 'node:process';
import chalk from 'chalk';
import { program } from 'commander';
import { glob, globSync } from 'glob';
import yaml from 'js-yaml';
import { checkTranslations, checkUndefinedKeys, checkUnusedKeys } from '..';
import {
  CheckOptions,
  Context,
  formatCheckResultTable,
  formatInvalidTranslationsResultTable,
  formatSummaryTable,
} from '../errorReporters';
import {
  CheckResult,
  FileInfo,
  InvalidTranslationsResult,
  TranslationFile,
} from '../types';
import { flattenTranslations } from '../utils/flattenTranslations';
import path from 'node:path';
import { CheckError } from '../utils/findInvalidTranslations';

const version = require('../../package.json').version;

program
  .version(version)
  .option(
    '-l, --locales <locales...>',
    'name of the directory containing the locales to validate'
  )
  .option('-s, --source <locale>', 'the source locale to validate against')
  .option(
    '-f, --format <type>',
    'define the specific format: i18next, react-intl or next-intl'
  )
  .option(
    '-c, --check <checks...>',
    'this option is deprecated - use -o or --only instead'
  )
  .option(
    '-o, --only <only...>',
    'define the specific checks you want to run: invalidKeys, missingKeys, unused, undefined. By default the check will validate against missing and invalid keys, i.e. --only invalidKeys,missingKeys'
  )
  .option(
    '-r, --reporter <style>',
    'define the reporting style: standard or summary'
  )
  .option(
    '-e, --exclude <exclude...>',
    'define the file(s) and/or folders(s) that should be excluded from the check'
  )
  .option(
    '-i, --ignore <ignore...>',
    'define the key(s) or group of keys (i.e. `some.namespace.*`) that should be excluded from the check'
  )
  .option(
    '-u, --unused <paths...>',
    'define the source path(s) to find all unused and undefined keys'
  )
  .option(
    '--parser-component-functions <components...>',
    'a list of component names to parse when using the --unused option'
  )
  .parse();

const getCheckOptions = (): Context[] => {
  const checkOption =
    program.getOptionValue('only') || program.getOptionValue('check');

  if (program.getOptionValue('check')) {
    console.log(
      chalk.yellow(
        'The --check option has been deprecated, use the --only option instead.'
      )
    );
  }

  if (!checkOption) {
    return CheckOptions;
  }

  const checks = checkOption.filter((check: string) =>
    CheckOptions.includes(check.trim())
  );

  return checks.length > 0 ? checks : CheckOptions;
};

const isSource = (fileInfo: FileInfo, srcPath: string) => {
  return (
    fileInfo.path.some(
      (path) => path.toLowerCase() === srcPath.toLowerCase()
    ) || fileInfo.name.toLowerCase().slice(0, -5) === srcPath.toLowerCase()
  );
};

const main = async () => {
  const start = performance.now();
  const srcPath = program.getOptionValue('source');
  const localePath = program.getOptionValue('locales');
  const format = program.getOptionValue('format');
  const exclude = program.getOptionValue('exclude');
  const ignore = program.getOptionValue('ignore');
  const unusedSrcPath = program.getOptionValue('unused');
  const componentFunctions = program.getOptionValue('parserComponentFunctions');

  if (!srcPath) {
    console.log(
      chalk.red(
        'Source not found. Please provide a valid source locale, i.e. -s en-US'
      )
    );
    exit(1);
  }

  if (!localePath || localePath.length === 0) {
    console.log(
      chalk.red(
        'Locale file(s) not found. Please provide valid locale file(s), i.e. -locales translations/'
      )
    );
    exit(1);
  }

  const excludedPaths = exclude ?? [];
  const localePathFolders: string[] = localePath;

  const isMultiFolders = localePathFolders.length > 1;

  const srcFiles: TranslationFile[] = [];
  const targetFiles: TranslationFile[] = [];

  const pattern = isMultiFolders
    ? `{${localePath.join(',').trim()}}/**/*.{json,yaml,yml}`
    : `${localePath.join(',').trim()}/**/*.{json,yaml,yml}`;

  const files = await glob(pattern, {
    ignore: ['node_modules/**'].concat(excludedPaths),
    windowsPathsNoEscape: true,
  });

  console.log('i18n translations checker');
  console.log(chalk.gray(`Source: ${srcPath}`));

  if (format) {
    console.log(chalk.blackBright(`Selected format is: ${format}`));
  }

  const options = {
    checks: getCheckOptions(),
    format: format ?? undefined,
    ignore,
  };

  const fileInfos: {
    extension: string;
    file: string;
    name: string;
    path: string[];
  }[] = [];

  files.sort().forEach((file) => {
    const filePath = file.split(path.sep);
    const name = filePath.pop() ?? '';
    const extension = name.split('.').pop() ?? 'json';

    fileInfos.push({
      extension,
      file,
      name,
      path: filePath,
    });
  });

  fileInfos.forEach(({ extension, file, name, path }) => {
    let rawContent;
    if (extension === 'yaml') {
      rawContent = yaml.load(fs.readFileSync(file, 'utf-8'));
    } else {
      rawContent = JSON.parse(fs.readFileSync(file, 'utf-8'));
    }
    const content = flattenTranslations(rawContent);
    if (isSource({ file, name, path }, srcPath)) {
      srcFiles.push({
        reference: null,
        name: file,
        content,
      });
    } else {
      const fullPath = path.join('-');
      const reference = fileInfos.find((fileInfo) => {
        if (!isSource(fileInfo, srcPath)) {
          return false;
        }
        if (fileInfo.path.join('-') === fullPath) {
          return true;
        }

        // Check if the folder path matches - ignoring the last folder
        // Then check if the file names are the same
        // Example folder structure:
        // path/to/locales/
        //   en-US/
        //      one.json
        //      two.json
        //      three.json
        //   de-DE/
        //      one.json
        //      two.json
        //      three.json
        //
        // Referencing: `path/to/locales/en-US/one.json`, `path/to/locales/de-DE/one.json`
        // Non Referencing: `path/to/locales/en-US/one.json`, `path/to/other/locales/de-DE/one.json`
        if (
          fileInfo.path.slice(0, fileInfo.path.length - 1).join('-') ===
          path.slice(0, path.length - 1).join('-')
        ) {
          return fileInfo.name === name;
        }

        return false;
      });

      if (reference) {
        targetFiles.push({
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
        'Source not found. Please provide a valid source locale, i.e. -s en-US'
      )
    );
    exit(1);
  }

  if (
    (options.checks.includes('missingKeys') ||
      options.checks.includes('invalidKeys')) &&
    targetFiles.length === 0
  ) {
    // Remove missingKeys and invalidKeys from checks since they require multiple files
    options.checks = options.checks.filter(
      (check) => check !== 'missingKeys' && check !== 'invalidKeys'
    );

    console.log(
      chalk.yellow(
        '\nOnly one locale file found. Skipping missingKeys and invalidKeys checks.\n'
      )
    );
  }
  try {
    const result = checkTranslations(srcFiles, targetFiles, options);
    let unusedKeyResult: CheckResult | undefined = undefined;
    let undefinedKeyResult: CheckResult | undefined = undefined;

    printTranslationResult(result);

    if (unusedSrcPath) {
      const isMultiUnusedFolders = unusedSrcPath.length > 1;
      const pattern = isMultiUnusedFolders
        ? `{${unusedSrcPath.join(',').trim()}}/**/*.{js,jsx,ts,tsx}`
        : `${unusedSrcPath.join(',').trim()}/**/*.{js,jsx,ts,tsx}`;
      const filesToParse = globSync(pattern, {
        ignore: ['node_modules/**'],
        windowsPathsNoEscape: true,
      });

      const unusedKeys = await checkUnusedKeys(
        srcFiles,
        filesToParse,
        options,
        componentFunctions
      );
      printUnusedKeysResult({ unusedKeys });
      unusedKeyResult = unusedKeys;

      const undefinedKeys = await checkUndefinedKeys(
        srcFiles,
        filesToParse,
        options,
        componentFunctions
      );
      printUndefinedKeysResult({
        undefinedKeys,
      });
      undefinedKeyResult = undefinedKeys;
    }

    const end = performance.now();

    console.log(
      chalk.green(
        `\nDone in ${Math.round(((end - start) * 100) / 1000) / 100}s.`
      )
    );
    if (
      (result.missingKeys && Object.keys(result.missingKeys).length > 0) ||
      (result.invalidKeys && Object.keys(result.invalidKeys).length > 0) ||
      (unusedKeyResult && hasKeys(unusedKeyResult)) ||
      (undefinedKeyResult && hasKeys(undefinedKeyResult))
    ) {
      exit(1);
    } else {
      exit(0);
    }
  } catch (e) {
    let errorMessage =
      "\nError: Can't validate translations. Check if the format is supported or specify the translation format i.e. -f i18next";

    // Use enhanced error message if available
    if (e instanceof CheckError) {
      errorMessage = `\n${e.message}`;

      // Check if the error has location information (from ICU parser)
      if (e.location) {
        errorMessage += `\nLocation: Line ${e.location.start.line}, Column ${e.location.start.column}`;
      }

      // Check if the error has originalMessage (from ICU parser)
      if (e.originalMessage != null) {
        errorMessage += `\nProblematic translation: "${e.originalMessage}"`;
      }
    }

    console.log(chalk.red(errorMessage));
    exit(1);
  }
};

const printTranslationResult = ({
  missingKeys,
  invalidKeys,
}: {
  missingKeys: CheckResult | undefined;
  invalidKeys: InvalidTranslationsResult | undefined;
}) => {
  const reporter = program.getOptionValue('reporter');

  const isSummary = reporter === 'summary';

  if (missingKeys && Object.keys(missingKeys).length > 0) {
    console.log(chalk.red('\nFound missing keys!'));
    if (isSummary) {
      console.log(chalk.red(formatSummaryTable(missingKeys)));
    } else {
      const table = formatCheckResultTable(missingKeys);
      console.log(chalk.red(table));
    }
  } else if (missingKeys) {
    console.log(chalk.green('\nNo missing keys found!'));
  }

  if (invalidKeys && Object.keys(invalidKeys).length > 0) {
    console.log(chalk.red('\nFound invalid keys!'));
    if (isSummary) {
      console.log(chalk.red(formatSummaryTable(invalidKeys)));
    } else {
      const table = formatInvalidTranslationsResultTable(invalidKeys);
      console.log(chalk.red(table));
    }
  } else if (invalidKeys) {
    console.log(chalk.green('\nNo invalid translations found!'));
  }
};

const printUnusedKeysResult = ({
  unusedKeys,
}: {
  unusedKeys: CheckResult | undefined;
}) => {
  const reporter = program.getOptionValue('reporter');

  const isSummary = reporter === 'summary';

  if (unusedKeys && hasKeys(unusedKeys)) {
    console.log(chalk.red('\nFound unused keys!'));
    if (isSummary) {
      console.log(chalk.red(formatSummaryTable(unusedKeys)));
    } else {
      console.log(chalk.red(formatCheckResultTable(unusedKeys)));
    }
  } else if (unusedKeys) {
    console.log(chalk.green('\nNo unused keys found!'));
  }
};

const printUndefinedKeysResult = ({
  undefinedKeys,
}: {
  undefinedKeys: CheckResult | undefined;
}) => {
  const reporter = program.getOptionValue('reporter');

  const isSummary = reporter === 'summary';

  if (undefinedKeys && hasKeys(undefinedKeys)) {
    console.log(chalk.red('\nFound undefined keys!'));
    if (isSummary) {
      console.log(chalk.red(formatSummaryTable(undefinedKeys)));
    } else {
      console.log(chalk.red(formatCheckResultTable(undefinedKeys)));
    }
  } else if (undefinedKeys) {
    console.log(chalk.green('\nNo undefined keys found!'));
  }
};

const hasKeys = (checkResult: CheckResult) => {
  for (const [_, keys] of Object.entries(checkResult)) {
    if (keys.length > 0) {
      return true;
    }
  }
  return false;
};

main();
