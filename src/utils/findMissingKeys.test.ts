import { describe, it, expect } from 'vitest';
import { compareTranslationFiles, findMissingKeys } from './findMissingKeys';

const sourceFile = {
  'one.two.three': 'one two three',
  'four.five.six': 'four five six',
  'seven.eight.nine': 'seven eight nine',
};
const secondaryFile = {
  'one.two.three': 'one two three',
  'four.five.six': 'four five six',
  'seven.eight.nine': 'seven eight nine',
};

describe('findMissingKeys:compareTranslationFiles', () => {
  it('should return empty array if files are identical', () => {
    expect(compareTranslationFiles(sourceFile, secondaryFile)).toEqual([]);
  });

  it('should return the missing keys in the secondary file', () => {
    expect(
      compareTranslationFiles(
        { ...sourceFile, 'ten.eleven.twelve': 'ten eleven twelve' },
        secondaryFile
      )
    ).toEqual(['ten.eleven.twelve']);
  });
});

describe('findMissingKeys', () => {
  it('should return an empty object if all files have no missing keys', () => {
    expect(findMissingKeys(sourceFile, { de: secondaryFile })).toEqual({});
  });

  it('should return an object containing the keys for the missing language', () => {
    expect(
      findMissingKeys(
        { ...sourceFile, 'ten.eleven.twelve': 'ten eleven twelve' },
        { de: secondaryFile }
      )
    ).toEqual({ de: ['ten.eleven.twelve'] });
  });

  it('should return an object containing the keys for every language with missing key', () => {
    expect(
      findMissingKeys(
        { ...sourceFile, 'ten.eleven.twelve': 'ten eleven twelve' },
        {
          de: secondaryFile,
          fr: {
            'four.five.six': 'four five six',
            'seven.eight.nine': 'seven eight nine',
          },
        }
      )
    ).toEqual({
      de: ['ten.eleven.twelve'],
      fr: ['one.two.three', 'ten.eleven.twelve'],
    });
  });

  it('should treat i18next source keys with plural nouns as a single key', () => {
    expect(
      findMissingKeys(
        {
          ...sourceFile,
          count_one: '{{count}} entry',
          count_other: '{{count}} entries',
        },
        {
          de: {
            ...secondaryFile,
            count: '{{count}} entry',
          },
        },
        {
          format: 'i18next',
        }
      )
    ).toEqual({});
  });

  it('should treat i18next target keys with plural nowns as a single key', () => {
    expect(
      findMissingKeys(
        {
          ...sourceFile,
          count: '{{count}} entry',
        },
        {
          de: {
            ...secondaryFile,
            count_one: '{{count}} entry',
            count_interval:
              '(1)[one entry];(2-7)[a few entries];(7-inf)[a lot of entries];",',
          },
        },
        {
          format: 'i18next',
        }
      )
    ).toEqual({});
  });

  it('should treat i18next source and target keys with plural nowns as a single key', () => {
    expect(
      findMissingKeys(
        {
          ...sourceFile,
          key_zero: 'zero',
          key_one: 'singular',
          key_two: 'two',
          key_few: 'few',
          key_many: 'many',
          key_other: 'other',
          'ten.eleven.twelve': 'ten eleven twelve',
        },
        {
          de: {
            ...secondaryFile,
            key_zero: 'zero',
            key_one: 'singular',
            key_two: 'two',
            key_few: 'few',
            key_many: 'many',
            key_other: 'other',
          },
        },
        {
          format: 'i18next',
        }
      )
    ).toEqual({ de: ['ten.eleven.twelve'] });
  });
});
