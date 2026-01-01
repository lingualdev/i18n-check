import { findMissingKeys } from './utils/findMissingKeys';
import {
  CheckResult,
  InvalidTranslationsResult,
  Options,
  Translation,
  TranslationFile,
} from './types';
import { findInvalidTranslations } from './utils/findInvalidTranslations';
import { findInvalidI18NextTranslations } from './utils/findInvalidI18NextTranslations';
import { extract } from '@formatjs/cli-lib';
import { getKeys } from './utils/i18NextSrcParser';
import { extract as nextIntlExtract } from './utils/nextIntlSrcParser';
import fs from 'fs';
import path from 'path';
import { I18NEXT_PLURAL_SUFFIX } from './utils/constants';

const ParseFormats = ['react-intl', 'i18next', 'next-intl'];

export const checkInvalidTranslations = (
  source: Translation,
  targets: Record<string, Translation>,
  options: Options = { format: 'icu' }
): InvalidTranslationsResult => {
  return options.format === 'i18next'
    ? findInvalidI18NextTranslations(source, targets)
    : findInvalidTranslations(source, targets);
};

export const checkMissingTranslations = (
  source: Translation,
  targets: Record<string, Translation>,
  options: Options
): CheckResult => {
  return findMissingKeys(source, targets, options);
};

export const checkTranslations = (
  source: TranslationFile[],
  targets: TranslationFile[],
  options: Options = { format: 'icu', checks: ['invalidKeys', 'missingKeys'] }
): {
  missingKeys: CheckResult | undefined;
  invalidKeys: InvalidTranslationsResult | undefined;
} => {
  const { checks = ['invalidKeys', 'missingKeys'] } = options;

  const missingKeys: CheckResult = {};
  const invalidKeys: InvalidTranslationsResult = {};

  const hasMissingKeysCheck = checks.includes('missingKeys');
  const hasInvalidKeysCheck = checks.includes('invalidKeys');

  source.forEach(({ name, content }) => {
    const files = Object.fromEntries(
      targets
        .filter(({ reference }) => reference === name)
        .map(({ name, content }) => [name, content])
    );

    const filteredContent = filterKeys(content, options.ignore ?? []);

    if (hasMissingKeysCheck) {
      merge(
        missingKeys,
        checkMissingTranslations(filteredContent, files, options)
      );
    }

    if (hasInvalidKeysCheck) {
      merge(
        invalidKeys,
        checkInvalidTranslations(filteredContent, files, options)
      );
    }
  });

  return {
    missingKeys: hasMissingKeysCheck ? missingKeys : undefined,
    invalidKeys: hasInvalidKeysCheck ? invalidKeys : undefined,
  };
};

function merge<T>(left: Record<string, T[]>, right: Record<string, T[]>) {
  for (const [k, v] of Object.entries(right)) {
    left[k] = (left?.[k] ?? []).concat(v);
  }
}

export const checkUnusedKeys = async (
  translationFiles: TranslationFile[],
  filesToParse: string[],
  options: Options = {
    format: 'react-intl',
    checks: [],
  },
  componentFunctions: string[] = []
): Promise<CheckResult | undefined> => {
  if (!options.format || !ParseFormats.includes(options.format)) {
    return undefined;
  }

  if (!options.checks || !options.checks.includes('unused')) {
    return undefined;
  }

  const filteredTranslationFiles = translationFiles.map(
    ({ content, ...rest }) => ({
      ...rest,
      content: filterKeys(content, options.ignore),
    })
  );

  if (options.format === 'react-intl') {
    return findUnusedReactIntlTranslations(
      filteredTranslationFiles,
      filesToParse
    );
  } else if (options.format === 'i18next') {
    return findUnusedI18NextTranslations(
      filteredTranslationFiles,
      filesToParse,
      componentFunctions
    );
  } else if (options.format === 'next-intl') {
    return findUnusedNextIntlTranslations(
      filteredTranslationFiles,
      filesToParse
    );
  }
};

const findUnusedReactIntlTranslations = async (
  translationFiles: TranslationFile[],
  filesToParse: string[]
) => {
  const unusedKeys: Record<string, string[]> = {};

  const extracted = await extract(filesToParse, {});
  const extractedResultSet = new Set(Object.keys(JSON.parse(extracted)));

  translationFiles.forEach(({ name, content }) => {
    const keysInSource = Object.keys(content);
    const found: string[] = [];
    for (const keyInSource of keysInSource) {
      if (!extractedResultSet.has(keyInSource)) {
        found.push(keyInSource);
      }
    }
    unusedKeys[name] = found;
  });

  return unusedKeys;
};

const findUnusedI18NextTranslations = async (
  source: TranslationFile[],
  filesToParse: string[],
  componentFunctions: string[] = []
) => {
  const unusedKeys: Record<string, string[]> = {};

  const { extractedResult, skippableKeys } = await getI18NextKeysInCode(
    filesToParse,
    componentFunctions
  );

  const extractedResultSet = new Set(
    extractedResult.map(({ key, namespace }) =>
      namespace ? `${namespace}.${key}` : key
    )
  );

  source.forEach(({ name, content }) => {
    const keysInSource = Object.keys(content)
      // Ensure that any plural definitiions like key_one, key_other etc.
      // are flatted into a single key
      .map((key) => {
        const pluralSuffix = I18NEXT_PLURAL_SUFFIX.find((suffix) => {
          return key.endsWith(suffix);
        });
        return pluralSuffix ? key.replace(pluralSuffix, '') : key;
      });

    const found: string[] = [];
    for (const keyInSource of keysInSource) {
      const isSkippable = skippableKeys.find((skippableKey) => {
        return keyInSource.includes(skippableKey);
      });
      if (isSkippable !== undefined) {
        continue;
      }

      // find the file name
      const [fileName] = (name.split(path.sep).pop() ?? '').split('.');

      if (
        !extractedResultSet.has(`${fileName}.${keyInSource}`) &&
        !extractedResultSet.has(keyInSource)
      ) {
        found.push(keyInSource);
      }
    }

    unusedKeys[name] = found;
  });

  return unusedKeys;
};

const findUnusedNextIntlTranslations = async (
  translationFiles: TranslationFile[],
  filesToParse: string[]
) => {
  const unusedKeys: Record<string, string[]> = {};

  const extracted = nextIntlExtract(filesToParse);
  const dynamicNamespaces = extracted.flatMap((namespace) => {
    if (namespace.meta.dynamic) {
      return [namespace.key];
    }
    return [];
  });
  const extractedResultSet = new Set(
    extracted.flatMap((namespace) => {
      if (!namespace.meta.dynamic) {
        return [namespace.key];
      }
      return [];
    })
  );

  translationFiles.forEach(({ name, content }) => {
    const keysInSource = Object.keys(content);
    const found: string[] = [];
    for (const keyInSource of keysInSource) {
      // Check if key is part of a dynamic namespace
      // Skip the key if it is part of the dynamic namespace
      const isDynamicNamespace = dynamicNamespaces.find((dynamicNamespace) => {
        const keyInSourceNamespaces = keyInSource.split('.');
        return dynamicNamespace.split('.').every((namePart, index) => {
          return namePart === keyInSourceNamespaces[index];
        });
      });
      if (isDynamicNamespace) {
        continue;
      }
      if (!extractedResultSet.has(keyInSource)) {
        found.push(keyInSource);
      }
    }

    unusedKeys[name] = found;
  });

  return unusedKeys;
};

export const checkUndefinedKeys = async (
  source: TranslationFile[],
  filesToParse: string[],
  options: Options = {
    format: 'react-intl',
    checks: [],
  },
  componentFunctions: string[] = []
): Promise<CheckResult | undefined> => {
  if (!options.format || !ParseFormats.includes(options.format)) {
    return undefined;
  }

  if (!options.checks || !options.checks.includes('undefined')) {
    return undefined;
  }

  if (options.format === 'react-intl') {
    return findUndefinedReactIntlKeys(source, filesToParse, options);
  } else if (options.format === 'i18next') {
    return findUndefinedI18NextKeys(
      source,
      filesToParse,
      options,
      componentFunctions
    );
  } else if (options.format === 'next-intl') {
    return findUndefinedNextIntlKeys(source, filesToParse, options);
  }
};

const findUndefinedReactIntlKeys = async (
  translationFiles: TranslationFile[],
  filesToParse: string[],
  options: Options = {
    ignore: [],
  }
) => {
  const sourceKeys = new Set(
    translationFiles.flatMap(({ content }) => {
      return Object.keys(content);
    })
  );

  const extractedResult = await extract(filesToParse, {
    extractSourceLocation: true,
  });

  const undefinedKeys: { [key: string]: string[] } = {};
  Object.entries(JSON.parse(extractedResult)).forEach(([key, meta]) => {
    if (!sourceKeys.has(key) && !isIgnoredKey(options.ignore ?? [], key)) {
      const data = meta as Record<PropertyKey, unknown>;
      if (!('file' in data) || typeof data.file !== 'string') {
        return;
      }
      const file = path.normalize(data.file);
      if (!undefinedKeys[file]) {
        undefinedKeys[file] = [];
      }
      undefinedKeys[file].push(key);
    }
  });

  return undefinedKeys;
};

const findUndefinedI18NextKeys = async (
  source: TranslationFile[],
  filesToParse: string[],
  options: Options = {
    ignore: [],
  },
  componentFunctions: string[] = []
) => {
  const { extractedResult, skippableKeys } = await getI18NextKeysInCode(
    filesToParse,
    componentFunctions
  );

  const sourceKeys = new Set(
    source
      .flatMap(({ content }) => {
        return Object.keys(content);
      })
      // Ensure that any plural definitiions like key_one, key_other etc.
      // are flatted into a single key
      .map((key) => {
        const pluralSuffix = I18NEXT_PLURAL_SUFFIX.find((suffix) => {
          return key.endsWith(suffix);
        });
        return pluralSuffix ? key.replace(pluralSuffix, '') : key;
      })
  );

  const undefinedKeys: { [key: string]: string[] } = {};

  extractedResult.forEach(({ file, key }) => {
    const isSkippable = skippableKeys.find((skippableKey) => {
      return key.includes(skippableKey);
    });
    if (
      isSkippable === undefined &&
      !sourceKeys.has(key) &&
      !isIgnoredKey(options.ignore ?? [], key)
    ) {
      if (!undefinedKeys[file]) {
        undefinedKeys[file] = [];
      }
      undefinedKeys[file].push(key);
    }
  });

  return undefinedKeys;
};

const findUndefinedNextIntlKeys = async (
  translationFiles: TranslationFile[],
  filesToParse: string[],
  options: Options = {
    ignore: [],
  }
) => {
  const sourceKeys = new Set(
    translationFiles.flatMap(({ content }) => {
      return Object.keys(content);
    })
  );

  const extractedResult = nextIntlExtract(filesToParse);

  const undefinedKeys: { [key: string]: string[] } = {};
  extractedResult.forEach(({ key, meta }) => {
    if (
      !meta.dynamic &&
      !sourceKeys.has(key) &&
      !isIgnoredKey(options.ignore ?? [], key)
    ) {
      const file = meta.file;
      if (!undefinedKeys[file]) {
        undefinedKeys[file] = [];
      }
      undefinedKeys[file].push(key);
    }
  });

  return undefinedKeys;
};

const isRecord = (data: unknown): data is Record<string, unknown> => {
  return (
    typeof data === 'object' &&
    !Array.isArray(data) &&
    data !== null &&
    data !== undefined
  );
};

const getI18NextKeysInCode = async (
  filesToParse: string[],
  componentFunctions: string[] = []
) => {
  // Skip any parsed keys that have the `returnObjects` property set to true
  // As these are used dynamically, they will be skipped to prevent
  // these keys from being marked as unused.

  const extractedResult: { file: string; key: string; namespace?: string }[] =
    [];

  const skippableKeys: string[] = [];

  filesToParse.forEach((file) => {
    const rawContent = fs.readFileSync(file, 'utf-8');
    const entries = getKeys(
      file,
      {
        componentFunctions: componentFunctions.concat(['Trans']),
      },
      rawContent
    );

    // Intermediate solution to retrieve all keys from the parser.
    // This will be built out to also include the namespace and check
    // the key against the namespace corresponding file.
    // The current implementation considers the key as used no matter the namespace.
    for (const entry of entries) {
      // check for namespace, i.e. `namespace:some.key`
      const [namespace, ...keyParts] = entry.key.split(':');
      // If there is a namespace make sure to assign the namespace
      // and update the key name
      // Ensure that the assumed key is not the default value
      if (keyParts.length > 0 && entry.key !== entry.defaultValue) {
        entry.namespace = namespace;
        // rebuild the key without the namespace
        entry.key = keyParts.join(':');
      }
      if (entry.returnObjects) {
        skippableKeys.push(entry.key);
      } else {
        extractedResult.push({
          file,
          key: entry.key,
          namespace: entry.namespace,
        });
      }
    }
  });

  return { extractedResult, skippableKeys };
};

const filterKeys = (content: Translation, keysToIgnore: string[] = []) => {
  if (keysToIgnore.length > 0) {
    return Object.entries(content).reduce((acc, [key, value]) => {
      if (isIgnoredKey(keysToIgnore, key)) {
        return acc;
      }
      acc[key] = value;
      return acc;
    }, {} as Translation);
  }

  return content;
};

const isIgnoredKey = (keysToIgnore: string[], key: string) => {
  return (
    keysToIgnore.find((ignoreKey) => {
      if (ignoreKey.endsWith('*')) {
        return key.includes(ignoreKey.slice(0, ignoreKey.length - 1));
      }
      return ignoreKey === key;
    }) !== undefined
  );
};

function _flatten(
  object: Record<string, unknown>,
  prefix: string | null = null,
  result: Record<string, unknown> = {}
) {
  for (const key in object) {
    const propName = prefix ? `${prefix}.${key}` : key;
    const data = object[key];
    if (isRecord(data)) {
      _flatten(data, propName, result);
    } else {
      result[propName] = data;
    }
  }
  return result;
}
