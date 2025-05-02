export type Translation = Record<string, unknown>;

export type CheckResult = Record<string, string[]>;

export type InvalidTranslationEntry = { key: string; msg: string };

export type InvalidTranslationsResult = Record<
  string,
  InvalidTranslationEntry[]
>;

export type TranslationFile = {
  reference: string | null;
  name: string;
  content: Translation;
};

export type FileInfo = { file: string; name: string; path: string[] };
