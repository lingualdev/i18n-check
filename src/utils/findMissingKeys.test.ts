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
});
