export type Translation = Record<string, unknown>;

export type CheckResult = Record<string, string[]>;

export type TranslationFile = {
  reference: string | null;
  name: string;
  content: Translation;
};
