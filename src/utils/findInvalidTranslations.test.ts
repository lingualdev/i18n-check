import {
  compareTranslationFiles,
  findInvalidTranslations,
} from './findInvalidTranslations';
import { flattenTranslations } from './flattenTranslations';

const sourceFile = require('../../translations/messageExamples/en-us.json');
const secondaryFile = require('../../translations/messageExamples/de-de.json');

describe('findInvalidTranslations:compareTranslationFiles', () => {
  it('should return empty array if files are identical', () => {
    expect(
      compareTranslationFiles(
        flattenTranslations(sourceFile),
        flattenTranslations(sourceFile)
      )
    ).toEqual([]);
  });

  it('should return the invalid keys in the target file', () => {
    expect(
      compareTranslationFiles(
        flattenTranslations({
          ...sourceFile,
          'ten.eleven.twelve': 'ten eleven twelve',
        }),
        flattenTranslations(secondaryFile)
      )
    ).toEqual([{ key: 'multipleVariables', msg: 'Unexpected date element' }]);
  });

  it('should return empty array if placeholders are identical but in different positions', () => {
    expect(
      compareTranslationFiles(
        {
          basic: 'added {this} and {that} should work.',
        },
        {
          basic: 'It is {this} with different position {that}',
        }
      )
    ).toEqual([]);
  });
});

describe('findInvalidTranslations', () => {
  it('should return an empty object if all files have no invalid keys', () => {
    expect(findInvalidTranslations(sourceFile, { de: sourceFile })).toEqual({});
  });

  it('should return an object containing the keys for the missing language', () => {
    expect(
      findInvalidTranslations(
        { ...sourceFile, 'ten.eleven.twelve': 'ten eleven twelve' },
        { de: secondaryFile }
      )
    ).toEqual({
      de: [{ key: 'multipleVariables', msg: 'Unexpected date element' }],
    });
  });

  it('should return an object containing the keys for every language with missing key', () => {
    expect(
      findInvalidTranslations(
        { ...sourceFile, 'ten.eleven.twelve': 'ten eleven twelve' },
        {
          de: secondaryFile,
          fr: {
            'four.five.six': 'four five six',
            'seven.eight.nine': 'seven eight nine',
            'message.text-format': 'yo,<p><b>John</b></p>!',
          },
        }
      )
    ).toEqual({
      de: [{ key: 'multipleVariables', msg: 'Unexpected date element' }],
      fr: [
        {
          key: 'message.text-format',
          msg: 'Expected tag to contain "b" but received "p"',
        },
      ],
    });
  });

  it('should allow for different types of keys per locale', () => {
    expect(
      findInvalidTranslations(sourceFile, {
        de: {
          ...secondaryFile,
          'message.plural': '{count, plural, other {# of {total} items}}',
        },
      })
    ).toEqual({
      de: [
        {
          key: 'multipleVariables',
          msg: 'Unexpected date element',
        },
      ],
    });
  });

  it('should fail if a variable is changed in one of the translations', () => {
    expect(
      findInvalidTranslations(sourceFile, {
        de: {
          ...secondaryFile,
          'message.plural': '{count, plural, other {# of {cargado} items}}',
        },
      })
    ).toEqual({
      de: [
        {
          key: 'message.plural',
          msg: 'Error in plural: Expected argument to contain "total" but received "cargado"',
        },
        { key: 'multipleVariables', msg: 'Unexpected date element' },
      ],
    });
  });
});
