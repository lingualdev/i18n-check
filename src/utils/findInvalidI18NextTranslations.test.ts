import {
  compareTranslationFiles,
  findInvalidI18NextTranslations,
} from './findInvalidI18NextTranslations';
import { flattenTranslations } from './flattenTranslations';

const sourceFile = require('../../translations/i18NextMessageExamples/en-us.json');
const targetFile = require('../../translations/i18NextMessageExamples/de-de.json');

describe('findInvalid18nTranslations:compareTranslationFiles', () => {
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
        flattenTranslations(targetFile)
      )
    ).toEqual([
      {
        key: 'key_with_broken_de',
        msg: 'Error in interpolation: Expected value but received val',
      },
      {
        key: 'intlNumber_broken_de',
        msg: 'Missing element interpolation',
      },
    ]);
  });

  it('should return an empty array if the strings contain paranthesis that have different content', () => {
    expect(
      compareTranslationFiles(
        flattenTranslations({
          keyText: 'Key(s)',
        }),
        flattenTranslations({ keyText: 'Taste(n)' })
      )
    ).toEqual([]);
  });

  it('should return empty array if placeholders are identical but in different positions', () => {
    expect(
      compareTranslationFiles(
        {
          basic: 'added {{this}} and {{that}} should work.',
        },
        {
          basic: 'It is {{this}} with different position {{that}}',
        }
      )
    ).toEqual([]);
  });

  it('should return the invalid key if tags are not identical', () => {
    expect(
      compareTranslationFiles(
        {
          tag: 'This is some <b>bold text</b> and some <i>italic</i> text.',
        },
        {
          tag: 'There is some <b>bold text</b> and some other <span>italic</span> text.',
        }
      )
    ).toEqual([
      {
        key: 'tag',
        msg: 'Expected tag "</i>" but received "</span>", Expected tag "<i>" but received "<span>"',
      },
    ]);
  });

  it('should return empty array if tags are identical', () => {
    expect(
      compareTranslationFiles(
        {
          tag: 'This is some <b>bold text</b> and some <i>italic</i> text.',
        },
        {
          tag: 'There is some <b>bold text</b> and some other <i>italic</i> text.',
        }
      )
    ).toEqual([]);
  });
});

describe('findInvalidTranslations', () => {
  it('should return an empty object if all files have no invalid keys', () => {
    expect(
      findInvalidI18NextTranslations(sourceFile, { de: sourceFile })
    ).toEqual({});
  });

  it('should return an object containing the keys for the missing language', () => {
    expect(
      findInvalidI18NextTranslations(
        { ...sourceFile, 'ten.eleven.twelve': 'ten eleven twelve' },
        { de: targetFile }
      )
    ).toEqual({
      de: [
        {
          key: 'key_with_broken_de',
          msg: 'Error in interpolation: Expected value but received val',
        },
        {
          key: 'intlNumber_broken_de',
          msg: 'Missing element interpolation',
        },
      ],
    });
  });

  it('should return an object containing the keys for every language with missing key', () => {
    expect(
      findInvalidI18NextTranslations(
        { ...sourceFile, 'ten.eleven.twelve': 'ten eleven twelve' },
        {
          de: targetFile,
          fr: {
            key_with_broken_de:
              'Some format {{value, formatname}} and some other format {{value, formatname}}',
          },
        }
      )
    ).toEqual({
      de: [
        {
          key: 'key_with_broken_de',
          msg: 'Error in interpolation: Expected value but received val',
        },
        {
          key: 'intlNumber_broken_de',
          msg: 'Missing element interpolation',
        },
      ],
      fr: [
        {
          key: 'key_with_broken_de',
          msg: 'Unexpected interpolation element',
        },
      ],
    });
  });

  it('should find invalid interval', () => {
    expect(
      findInvalidI18NextTranslations(
        {
          key1_interval:
            '(1)[one item];(2-7)[a few items];(7-inf)[a lot of items];',
        },
        {
          de: {
            key1_interval:
              '(1-2)[one or two items];(3-7)[a few items];(7-inf)[a lot of items];',
          },
        }
      )
    ).toEqual({
      de: [
        {
          key: 'key1_interval',
          msg: 'Error in plural: Expected 1 but received 1-2, Error in plural: Expected 2-7 but received 3-7',
        },
      ],
    });
  });

  it('should find invalid nested interpolation', () => {
    expect(
      findInvalidI18NextTranslations(
        {
          'tree.one': 'added {{something}}',
        },
        {
          de: {
            'tree.one': 'added {{somethings}}',
          },
        }
      )
    ).toEqual({
      de: [
        {
          key: 'tree.one',
          msg: 'Error in interpolation: Expected something but received somethings',
        },
      ],
    });
  });

  it('should find invalid relative time formatting', () => {
    expect(
      findInvalidI18NextTranslations(
        {
          intlRelativeTimeWithOptionsExplicit:
            'Lorem {{val, relativetime(range: quarter; style: narrow;)}}',
        },
        {
          de: {
            intlRelativeTimeWithOptionsExplicit:
              'Lorem {{val, relativetime(range: quarter; style: long;)}}',
          },
        }
      )
    ).toEqual({
      de: [
        {
          key: 'intlRelativeTimeWithOptionsExplicit',
          msg: 'Error in interpolation: Expected relativetime(range: quarter; style: narrow;) but received relativetime(range: quarter; style: long;)',
        },
      ],
    });
  });

  it('should find invalid key with options', () => {
    expect(
      findInvalidI18NextTranslations(
        {
          keyWithOptions:
            'Some format {{value, formatname(option1Name: option1Value; option2Name: option2Value)}}',
        },
        {
          de: {
            keyWithOptions:
              'Some format {{value, formatname(option3Name: option3Value; option4Name: option4Value)}}',
          },
        }
      )
    ).toEqual({
      de: [
        {
          key: 'keyWithOptions',
          msg: 'Error in interpolation: Expected formatname(option1Name: option1Value; option2Name: option2Value) but received formatname(option3Name: option3Value; option4Name: option4Value)',
        },
      ],
    });
  });

  it('should find invalid nesting', () => {
    expect(
      findInvalidI18NextTranslations(
        {
          nesting1: '1 $t(nesting2)',
        },
        {
          de: {
            nesting1: '1 $t(nesting3)',
          },
        }
      )
    ).toEqual({
      de: [
        {
          key: 'nesting1',
          msg: 'Error in nesting: Expected nesting2 but received nesting3',
        },
      ],
    });
  });

  it('should find invalid tags', () => {
    expect(
      findInvalidI18NextTranslations(
        {
          tag: 'This is some <b>bold text</b> and some <i>italic</i> text.',
        },
        {
          de: {
            tag: 'There is some <b>bold text</b> and some other <span>text inside a span</span>!',
          },
        }
      )
    ).toEqual({
      de: [
        {
          key: 'tag',
          msg: 'Expected tag "</i>" but received "</span>", Expected tag "<i>" but received "<span>"',
        },
      ],
    });
  });

  it('should recognize special characters', () => {
    expect(
      findInvalidI18NextTranslations(
        {
          key: 'Test < {{a}} and > {{max_a}}',
        },
        {
          de: {
            key: 'Test < {{a}} und > {{max_a}}',
          },
        }
      )
    ).toEqual({});
  });
});
