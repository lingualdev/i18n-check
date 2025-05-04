import { exec } from 'child_process';
import { formatTable } from '../errorReporters';
import path from 'path';

function tr(file: string) {
  return path.join('translations', file);
}

function multiFiles(file: string) {
  return path.join('translations/multipleFilesFolderExample', file);
}

function multiFolders(file: string) {
  return path.join('translations/multipleFoldersExample', file);
}

function codeEx(file: string) {
  return path.join('translations/codeExamples', file);
}

function ymlMultiFolders(file: string) {
  return path.join('translations/yaml/multipleFoldersExample', file);
}

function execAsync(cmd: string) {
  return new Promise<string>((resolve) => {
    exec(cmd, (error, stdout) => {
      resolve(stdout);
    });
  });
}

describe('CLI', () => {
  describe('JSON', () => {
    it('should return the missing keys for single folder translations', async () => {
      const stdout = await execAsync(
        'node dist/bin/index.js -s en-US -l translations/flattenExamples'
      );

      const result = stdout.split('Done')[0];

      const filePath = tr('flattenExamples/de-de.json');
      const table = formatTable([
        [['file', 'key']],
        [
          [filePath, 'other.nested.three'],
          [filePath, 'other.nested.deep.more.final'],
        ],
      ]);

      expect(result).toEqual(`i18n translations checker
Source: en-US

Found missing keys!
${table}

No invalid translations found!

`);
    });

    it('should return the missing/invalid keys for folder per locale with single file', async () => {
      const stdout = await execAsync(
        'node dist/bin/index.js -l translations/folderExample/ -s en-US'
      );

      const result = stdout.split('Done')[0];

      const missingKeysTable = formatTable([
        [['file', 'key']],
        [[tr('folderExample/de-DE/index.json'), 'message.text-format']],
      ]);

      const invalidKeysTable = formatTable([
        [['info', 'result']],
        [
          ['file', tr('folderExample/de-DE/index.json')],
          ['key', 'message.select'],
          [
            'msg',
            'Expected element of type "select" but received "argument", Unexpected date element, Unexpected date element...',
          ],
        ],
      ]);

      expect(result).toEqual(`i18n translations checker
Source: en-US

Found missing keys!
${missingKeysTable}

Found invalid keys!
${invalidKeysTable}

`);
    });

    it('should return the missing/invalid keys for folder per locale with multiple files', async () => {
      const stdout = await execAsync(
        'node dist/bin/index.js -l translations/multipleFilesFolderExample/ -s en-US'
      );

      const missingKeysTable = formatTable([
        [['file', 'key']],
        [
          [multiFiles('de-DE/one.json'), 'message.text-format'],
          [multiFiles('de-DE/two.json'), 'test.drive.four'],
        ],
      ]);

      const invalidKeysTable = formatTable([
        [['info', 'result']],
        [
          ['file', multiFiles('de-DE/one.json')],
          ['key', 'message.select'],
          [
            'msg',
            'Expected element of type "select" but received "argument", Unexpected date element, Unexpected date element...',
          ],
        ],
        [
          ['file', multiFiles('de-DE/three.json')],
          ['key', 'multipleVariables'],
          ['msg', 'Expected argument to contain "user" but received "name"  '],
        ],
      ]);

      const result = stdout.split('Done')[0];
      expect(result).toEqual(`i18n translations checker
Source: en-US

Found missing keys!
${missingKeysTable}

Found invalid keys!
${invalidKeysTable}

`);
    });

    it('should return the missing/invalid keys for folder containing multiple locale folders', async () => {
      const stdout = await execAsync(
        'node dist/bin/index.js -l translations/multipleFoldersExample -s en-US'
      );

      const result = stdout.split('Done')[0];
      expect(result).toEqual(`i18n translations checker
Source: en-US

Found missing keys!
${formatTable([
  [['file', 'key']],
  [
    [multiFolders('spaceOne/locales/de-DE/one.json'), 'message.text-format'],
    [multiFolders('spaceOne/locales/de-DE/two.json'), 'test.drive.four'],
    [multiFolders('spaceTwo/locales/de-DE/one.json'), 'message.plural'],
    [multiFolders('spaceTwo/locales/de-DE/two.json'), 'test.drive.two'],
  ],
])}

Found invalid keys!
${formatTable([
  [['info', 'result']],
  [
    ['file', multiFolders('spaceOne/locales/de-DE/one.json')],
    ['key', 'message.select'],
    [
      'msg',
      'Expected element of type "select" but received "argument", Unexpected date element, Unexpected date element...',
    ],
  ],
  [
    ['file', multiFolders('spaceOne/locales/de-DE/three.json')],
    ['key', 'multipleVariables'],
    ['msg', 'Expected argument to contain "user" but received "name"'],
  ],
  [
    ['file', multiFolders('spaceTwo/locales/de-DE/one.json')],
    ['key', 'message.text-format'],
    [
      'msg',
      'Expected element of type "tag" but received "number", Unexpected tag element',
    ],
  ],
  [
    ['file', multiFolders('spaceTwo/locales/de-DE/three.json')],
    ['key', 'numberFormat'],
    ['msg', 'Missing element number'],
  ],
])}

`);
    });

    it('should return the missing/invalid keys for multiple locale folders', async () => {
      const stdout = await execAsync(
        'node dist/bin/index.js -l translations/multipleFoldersExample/spaceOne translations/multipleFoldersExample/spaceTwo -s en-US'
      );

      const result = stdout.split('Done')[0];
      expect(result).toEqual(`i18n translations checker
Source: en-US

Found missing keys!
${formatTable([
  [['file', 'key']],
  [
    [multiFolders('spaceOne/locales/de-DE/one.json'), 'message.text-format'],
    [multiFolders('spaceOne/locales/de-DE/two.json'), 'test.drive.four'],
    [multiFolders('spaceTwo/locales/de-DE/one.json'), 'message.plural'],
    [multiFolders('spaceTwo/locales/de-DE/two.json'), 'test.drive.two'],
  ],
])}

Found invalid keys!
${formatTable([
  [['info', 'result']],
  [
    ['file', multiFolders('spaceOne/locales/de-DE/one.json')],
    ['key', 'message.select'],
    [
      'msg',
      'Expected element of type "select" but received "argument", Unexpected date element, Unexpected date element...',
    ],
  ],
  [
    ['file', multiFolders('spaceOne/locales/de-DE/three.json')],
    ['key', 'multipleVariables'],
    ['msg', 'Expected argument to contain "user" but received "name"'],
  ],
  [
    ['file', multiFolders('spaceTwo/locales/de-DE/one.json')],
    ['key', 'message.text-format'],
    [
      'msg',
      'Expected element of type "tag" but received "number", Unexpected tag element',
    ],
  ],
  [
    ['file', multiFolders('spaceTwo/locales/de-DE/three.json')],
    ['key', 'numberFormat'],
    ['msg', 'Missing element number'],
  ],
])}

`);
    });

    it('should return the missing/invalid keys for all files in the provided locale folders', async () => {
      const stdout = await execAsync(
        'node dist/bin/index.js --source en-US --locales translations/flattenExamples translations/messageExamples'
      );

      const result = stdout.split('Done')[0];
      expect(result).toEqual(`i18n translations checker
Source: en-US

Found missing keys!
${formatTable([
  [['file', 'key']],
  [
    [tr('flattenExamples/de-de.json'), 'other.nested.three'],
    [tr('flattenExamples/de-de.json'), 'other.nested.deep.more.final'],
    [tr('messageExamples/de-de.json'), 'richText'],
    [tr('messageExamples/de-de.json'), 'yo'],
    [tr('messageExamples/de-de.json'), 'nesting1'],
    [tr('messageExamples/de-de.json'), 'nesting2'],
    [tr('messageExamples/de-de.json'), 'nesting3'],
    [tr('messageExamples/de-de.json'), 'key1'],
  ],
])}

Found invalid keys!
${formatTable([
  [['info', 'result']],
  [
    ['file', tr('messageExamples/de-de.json')],
    ['key', 'multipleVariables'],
    ['msg', 'Unexpected date element'],
  ],
])}

`);
    });

    it('should return the missing/invalid keys for all files with source matching folder and source matching file', async () => {
      const stdout = await execAsync(
        'node dist/bin/index.js -l translations/multipleFilesFolderExample translations/flattenExamples -s en-US'
      );

      const result = stdout.split('Done')[0];
      expect(result).toEqual(`i18n translations checker
Source: en-US

Found missing keys!
${formatTable([
  [['file', 'key']],
  [
    [tr('flattenExamples/de-de.json'), 'other.nested.three'],
    [tr('flattenExamples/de-de.json'), 'other.nested.deep.more.final'],
    [multiFiles('de-DE/one.json'), 'message.text-format'],
    [multiFiles('de-DE/two.json'), 'test.drive.four'],
  ],
])}

Found invalid keys!
${formatTable([
  [['info', 'result']],
  [
    ['file', multiFiles('de-DE/one.json')],
    ['key', 'message.select'],
    [
      'msg',
      'Expected element of type "select" but received "argument", Unexpected date element, Unexpected date element...',
    ],
  ],
  [
    ['file', multiFiles('de-DE/three.json')],
    ['key', 'multipleVariables'],
    ['msg', 'Expected argument to contain "user" but received "name"'],
  ],
])}

`);
    });

    it('should ignore the excluded file', async () => {
      const stdout = await execAsync(
        'node dist/bin/index.js --source en-US --locales translations/flattenExamples translations/messageExamples --exclude translations/flattenExamples/de-de.json'
      );

      const result = stdout.split('Done')[0];
      expect(result).toEqual(`i18n translations checker
Source: en-US

Found missing keys!
${formatTable([
  [['file', 'key']],
  [
    [tr('messageExamples/de-de.json'), 'richText'],
    [tr('messageExamples/de-de.json'), 'yo'],
    [tr('messageExamples/de-de.json'), 'nesting1'],
    [tr('messageExamples/de-de.json'), 'nesting2'],
    [tr('messageExamples/de-de.json'), 'nesting3'],
    [tr('messageExamples/de-de.json'), 'key1'],
  ],
])}

Found invalid keys!
${formatTable([
  [['info', 'result']],
  [
    ['file', tr('messageExamples/de-de.json')],
    ['key', 'multipleVariables'],
    ['msg', 'Unexpected date element'],
  ],
])}

`);
    });

    it('should ignore the excluded folder', async () => {
      const stdout = await execAsync(
        'node dist/bin/index.js --source en-US --locales translations/flattenExamples translations/messageExamples --exclude translations/flattenExamples/*'
      );

      const result = stdout.split('Done')[0];
      expect(result).toEqual(`i18n translations checker
Source: en-US

Found missing keys!
${formatTable([
  [['file', 'key']],
  [
    [tr('messageExamples/de-de.json'), 'richText'],
    [tr('messageExamples/de-de.json'), 'yo'],
    [tr('messageExamples/de-de.json'), 'nesting1'],
    [tr('messageExamples/de-de.json'), 'nesting2'],
    [tr('messageExamples/de-de.json'), 'nesting3'],
    [tr('messageExamples/de-de.json'), 'key1'],
  ],
])}

Found invalid keys!
${formatTable([
  [['info', 'result']],
  [
    ['file', tr('messageExamples/de-de.json')],
    ['key', 'multipleVariables'],
    ['msg', 'Unexpected date element'],
  ],
])}

`);
    });

    it('should ignore the excluded multiple files', async () => {
      const stdout = await execAsync(
        'node dist/bin/index.js --source en-US --locales translations/flattenExamples translations/messageExamples --exclude translations/flattenExamples/de-de.json translations/messageExamples/de-de.json'
      );

      const result = stdout.split('Done')[0];
      expect(result).toEqual(`i18n translations checker
Source: en-US

No missing keys found!

No invalid translations found!

`);
    });

    it('should find unused and undefined keys for react-i18next applications', async () => {
      const stdout = await execAsync(
        'node dist/bin/index.js --source en --locales translations/codeExamples/reacti18next/locales -f i18next -u translations/codeExamples/reacti18next/src --parser-component-functions WrappedTransComponent'
      );

      const result = stdout.split('Done')[0];
      expect(result).toEqual(`i18n translations checker
Source: en
Selected format is: i18next

No missing keys found!

No invalid translations found!

Found unused keys!
${formatTable([
  [['file', 'key']],
  [
    [codeEx('reacti18next/locales/en/translation.json'), 'format.ebook'],
    [codeEx('reacti18next/locales/en/translation.json'), 'nonExistentKey'],
  ],
])}

Found undefined keys!
${formatTable([
  [['file', 'key']],
  [[codeEx('reacti18next/src/App.tsx'), 'some.key.that.is.not.defined']],
])}

`);
    });

    it('should find unused and undefined keys for react-i18next applications with multiple source folders', async () => {
      const stdout = await execAsync(
        'node dist/bin/index.js --source en --locales translations/codeExamples/reacti18next/locales -f i18next -u translations/codeExamples/reacti18next/src translations/codeExamples/reacti18next/secondSrcFolder --parser-component-functions WrappedTransComponent'
      );

      const result = stdout.split('Done')[0];
      expect(result).toEqual(`i18n translations checker
Source: en
Selected format is: i18next

No missing keys found!

No invalid translations found!

Found unused keys!
${formatTable([
  [['file', 'key']],
  [
    [codeEx('reacti18next/locales/en/translation.json'), 'format.ebook'],
    [codeEx('reacti18next/locales/en/translation.json'), 'nonExistentKey'],
  ],
])}

Found undefined keys!
${formatTable([
  [['file', 'key']],
  [
    [codeEx('reacti18next/src/App.tsx'), 'some.key.that.is.not.defined'],
    [
      codeEx('reacti18next/secondSrcFolder/Main.tsx'),
      'another.key.that.is.not.defined',
    ],
  ],
])}

`);
    });

    it('should find unused and undefined keys for react-intl applications', async () => {
      const stdout = await execAsync(
        'node dist/bin/index.js --source en-US --locales translations/codeExamples/react-intl/locales -f react-intl -u translations/codeExamples/react-intl/src'
      );

      const result = stdout.split('Done')[0];
      expect(result).toEqual(`i18n translations checker
Source: en-US
Selected format is: react-intl

No missing keys found!

No invalid translations found!

Found unused keys!
${formatTable([
  [['file', 'key']],
  [
    [codeEx('react-intl/locales/en-US/one.json'), 'message.number-format'],
    [codeEx('react-intl/locales/en-US/three.json'), 'multipleVariables'],
  ],
])}

Found undefined keys!
${formatTable([
  [['file', 'key']],
  [[codeEx('react-intl/src/App.tsx'), 'some.key.that.is.not.defined']],
])}

`);
    });

    it('should find unused and undefined keys for next-intl applications', async () => {
      const stdout = await execAsync(
        'node dist/bin/index.js --source en --locales translations/codeExamples/next-intl/locales/ -f next-intl -u translations/codeExamples/next-intl/src'
      );

      const result = stdout.split('Done')[0];
      expect(result).toEqual(`i18n translations checker
Source: en
Selected format is: next-intl

No missing keys found!

No invalid translations found!

Found unused keys!
${formatTable([
  [['file', 'key']],
  [
    [codeEx('next-intl/locales/en/translation.json'), 'message.plural'],
    [codeEx('next-intl/locales/en/translation.json'), 'notUsedKey'],
  ],
])}

Found undefined keys!
${formatTable([
  [['file', 'key']],
  [
    [codeEx('next-intl/src/StrictTypesExample.tsx'), 'About.unknown'],
    [codeEx('next-intl/src/StrictTypesExample.tsx'), 'About.unknown'],
    [codeEx('next-intl/src/StrictTypesExample.tsx'), 'Test.title'],
    [codeEx('next-intl/src/StrictTypesExample.tsx'), 'Test.title'],
    [codeEx('next-intl/src/StrictTypesExample.tsx'), 'title'],
    [codeEx('next-intl/src/StrictTypesExample.tsx'), 'title'],
    [codeEx('next-intl/src/StrictTypesExample.tsx'), 'unknown'],
    [codeEx('next-intl/src/StrictTypesExample.tsx'), 'unknown'],
    [codeEx('next-intl/src/StrictTypesExample.tsx'), 'unknown.unknown'],
    [codeEx('next-intl/src/StrictTypesExample.tsx'), 'unknown.unknown'],
    [codeEx('next-intl/src/Basic.tsx'), 'message.select'],
  ],
])}

`);
    });
  });

  describe('YAML', () => {
    it('should return the missing keys for single folder translations', async () => {
      const stdout = await execAsync(
        'node dist/bin/index.js -s en-US -l translations/yaml/flattenExamples'
      );

      const result = stdout.split('Done')[0];
      expect(result).toEqual(`i18n translations checker
Source: en-US

Found missing keys!
${formatTable([
  [['file', 'key']],
  [
    [tr('yaml/flattenExamples/de-de.yaml'), 'other.nested.three'],
    [tr('yaml/flattenExamples/de-de.yaml'), 'other.nested.deep.more.final'],
  ],
])}

No invalid translations found!

`);
    });

    it('should return the missing/invalid keys for folder per locale with single file', async () => {
      const stdout = await execAsync(
        'node dist/bin/index.js -l translations/yaml/folderExample/ -s en-US'
      );

      const result = stdout.split('Done')[0];
      expect(result).toEqual(`i18n translations checker
Source: en-US

Found missing keys!
${formatTable([
  [['file', 'key']],
  [[tr('yaml/folderExample/de-DE/index.yaml'), 'message.text-format']],
])}

Found invalid keys!
${formatTable([
  [['info', 'result']],
  [
    ['file', tr('yaml/folderExample/de-DE/index.yaml')],
    ['key', 'message.select'],
    [
      'msg',
      'Expected element of type "select" but received "argument", Unexpected date element, Unexpected date element...',
    ],
  ],
])}

`);
    });

    it('should return the missing/invalid keys for folder per locale with multiple files', async () => {
      const stdout = await execAsync(
        'node dist/bin/index.js -l translations/yaml/multipleFilesFolderExample/ -s en-US'
      );

      const result = stdout.split('Done')[0];
      expect(result).toEqual(`i18n translations checker
Source: en-US

Found missing keys!
${formatTable([
  [['file', 'key']],
  [
    [
      tr('yaml/multipleFilesFolderExample/de-DE/one.yaml'),
      'message.text-format',
    ],
    [tr('yaml/multipleFilesFolderExample/de-DE/two.yaml'), 'test.drive.four'],
  ],
])}

Found invalid keys!
${formatTable([
  [['info', 'result']],
  [
    ['file', tr('yaml/multipleFilesFolderExample/de-DE/one.yaml')],
    ['key', 'message.select'],
    [
      'msg',
      'Expected element of type "select" but received "argument", Unexpected date element, Unexpected date element...',
    ],
  ],
  [
    ['file', tr('yaml/multipleFilesFolderExample/de-DE/three.yaml')],
    ['key', 'multipleVariables'],
    ['msg', 'Expected argument to contain "user" but received "name"'],
  ],
])}

`);
    });

    it('should return the missing/invalid keys for folder containing multiple locale folders', async () => {
      const stdout = await execAsync(
        'node dist/bin/index.js -l translations/yaml/multipleFoldersExample -s en-US'
      );

      const result = stdout.split('Done')[0];
      expect(result).toEqual(`i18n translations checker
Source: en-US

Found missing keys!
${formatTable([
  [['file', 'key']],
  [
    [ymlMultiFolders('spaceOne/locales/de-DE/one.yaml'), 'message.text-format'],
    [ymlMultiFolders('spaceOne/locales/de-DE/two.yaml'), 'test.drive.four'],
    [ymlMultiFolders('spaceTwo/locales/de-DE/one.yaml'), 'message.plural'],
    [ymlMultiFolders('spaceTwo/locales/de-DE/two.yaml'), 'test.drive.two'],
  ],
])}

Found invalid keys!
${formatTable([
  [['info', 'result']],
  [
    ['file', ymlMultiFolders('spaceOne/locales/de-DE/one.yaml')],
    ['key', 'message.select'],
    [
      'msg',
      'Expected element of type "select" but received "argument", Unexpected date element, Unexpected date element...',
    ],
  ],
  [
    ['file', ymlMultiFolders('spaceOne/locales/de-DE/three.yaml')],
    ['key', 'multipleVariables'],
    ['msg', 'Expected argument to contain "user" but received "name"'],
  ],
  [
    ['file', ymlMultiFolders('spaceTwo/locales/de-DE/one.yaml')],
    ['key', 'message.text-format'],
    [
      'msg',
      'Expected element of type "tag" but received "number", Unexpected tag element',
    ],
  ],
  [
    ['file', ymlMultiFolders('spaceTwo/locales/de-DE/three.yaml')],
    ['key', 'numberFormat'],
    ['msg', 'Missing element number'],
  ],
])}

`);
    });

    it('should return the missing/invalid keys for multiple locale folders', async () => {
      const stdout = await execAsync(
        'node dist/bin/index.js -l translations/yaml/multipleFoldersExample/spaceOne translations/yaml/multipleFoldersExample/spaceTwo -s en-US'
      );

      const result = stdout.split('Done')[0];
      expect(result).toEqual(`i18n translations checker
Source: en-US

Found missing keys!
${formatTable([
  [['file', 'key']],
  [
    [ymlMultiFolders('spaceOne/locales/de-DE/one.yaml'), 'message.text-format'],
    [ymlMultiFolders('spaceOne/locales/de-DE/two.yaml'), 'test.drive.four'],
    [ymlMultiFolders('spaceTwo/locales/de-DE/one.yaml'), 'message.plural'],
    [ymlMultiFolders('spaceTwo/locales/de-DE/two.yaml'), 'test.drive.two'],
  ],
])}

Found invalid keys!
${formatTable([
  [['info', 'result']],
  [
    ['file', ymlMultiFolders('spaceOne/locales/de-DE/one.yaml')],
    ['key', 'message.select'],
    [
      'msg',
      'Expected element of type "select" but received "argument", Unexpected date element, Unexpected date element...',
    ],
  ],
  [
    ['file', ymlMultiFolders('spaceOne/locales/de-DE/three.yaml')],
    ['key', 'multipleVariables'],
    ['msg', 'Expected argument to contain "user" but received "name"'],
  ],
  [
    ['file', ymlMultiFolders('spaceTwo/locales/de-DE/one.yaml')],
    ['key', 'message.text-format'],
    [
      'msg',
      'Expected element of type "tag" but received "number", Unexpected tag element',
    ],
  ],
  [
    ['file', ymlMultiFolders('spaceTwo/locales/de-DE/three.yaml')],
    ['key', 'numberFormat'],
    ['msg', 'Missing element number'],
  ],
])}

`);
    });

    it('should return the missing/invalid keys for all files in the provided locale folders', async () => {
      const stdout = await execAsync(
        'node dist/bin/index.js --source en-US --locales translations/yaml/flattenExamples translations/yaml/messageExamples'
      );

      const result = stdout.split('Done')[0];
      expect(result).toEqual(`i18n translations checker
Source: en-US

Found missing keys!
${formatTable([
  [['file', 'key']],
  [
    [tr('yaml/flattenExamples/de-de.yaml'), 'other.nested.three'],
    [tr('yaml/flattenExamples/de-de.yaml'), 'other.nested.deep.more.final'],
    [tr('yaml/messageExamples/de-de.yaml'), 'richText'],
    [tr('yaml/messageExamples/de-de.yaml'), 'yo'],
    [tr('yaml/messageExamples/de-de.yaml'), 'nesting1'],
    [tr('yaml/messageExamples/de-de.yaml'), 'nesting2'],
    [tr('yaml/messageExamples/de-de.yaml'), 'nesting3'],
    [tr('yaml/messageExamples/de-de.yaml'), 'key1'],
  ],
])}

Found invalid keys!
${formatTable([
  [['info', 'result']],
  [
    ['file', tr('yaml/messageExamples/de-de.yaml')],
    ['key', 'multipleVariables'],
    ['msg', 'Unexpected date element'],
  ],
])}

`);
    });

    it('should return the missing/invalid keys for all files with source matching folder and source matching file', async () => {
      const stdout = await execAsync(
        'node dist/bin/index.js -l translations/yaml/multipleFilesFolderExample translations/yaml/flattenExamples -s en-US'
      );

      const result = stdout.split('Done')[0];
      expect(result).toEqual(`i18n translations checker
Source: en-US

Found missing keys!
${formatTable([
  [['file', 'key']],
  [
    [tr('yaml/flattenExamples/de-de.yaml'), 'other.nested.three'],
    [tr('yaml/flattenExamples/de-de.yaml'), 'other.nested.deep.more.final'],
    [
      tr('yaml/multipleFilesFolderExample/de-DE/one.yaml'),
      'message.text-format',
    ],
    [tr('yaml/multipleFilesFolderExample/de-DE/two.yaml'), 'test.drive.four'],
  ],
])}

Found invalid keys!
${formatTable([
  [['info', 'result']],
  [
    ['file', tr('yaml/multipleFilesFolderExample/de-DE/one.yaml')],
    ['key', 'message.select'],
    [
      'msg',
      'Expected element of type "select" but received "argument", Unexpected date element, Unexpected date element...',
    ],
  ],
  [
    ['file', tr('yaml/multipleFilesFolderExample/de-DE/three.yaml')],
    ['key', 'multipleVariables'],
    ['msg', 'Expected argument to contain "user" but received "name"'],
  ],
])}

`);
    });
  });
});
