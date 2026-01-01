import { describe, it, expect } from 'vitest';
import { extract } from './nextIntlSrcParser';
import path from 'node:path';

const srcPath = './translations/codeExamples/next-intl/src/';

const basicFile = path.join(srcPath, 'Basic.tsx');
const counterFile = path.join(srcPath, 'Counter.tsx');
const clientCounterFile = path.join(srcPath, 'ClientCounter.tsx');
const nestedExampleFile = path.join(srcPath, 'NestedExample.tsx');
const asyncExampleFile = path.join(srcPath, 'AsyncExample.tsx');
const asyncPromiseAllExampleFile = path.join(
  srcPath,
  'AsyncPromiseAllExample.tsx'
);
const dynamicKeysExampleFile = path.join(srcPath, 'DynamicKeysExample.tsx');
const strictTypesExample = path.join(srcPath, 'StrictTypesExample.tsx');
const advancedExample = path.join(srcPath, 'AdvancedExample.tsx');
const generateMetaDataExample = path.join(
  srcPath,
  'GenerateMetadataExample.tsx'
);
const commentsExample = path.join(srcPath, 'comments.ts');
const indirectFunctionCallExample = path.join(
  srcPath,
  'IndirectFunctionCalls.tsx'
);

describe('nextIntlSrcParser', () => {
  it('should find all the translation keys', () => {
    const keys = extract([basicFile, counterFile, clientCounterFile]);

    expect(keys).toEqual([
      {
        key: 'ClientCounter.count',
        meta: {
          file: clientCounterFile,
          namespace: 'ClientCounter',
        },
      },
      {
        key: 'ClientCounter.increment',
        meta: {
          file: clientCounterFile,
          namespace: 'ClientCounter',
        },
      },
      {
        key: 'ClientCounter2.count',
        meta: {
          file: clientCounterFile,
          namespace: 'ClientCounter2',
        },
      },
      {
        key: 'ClientCounter2.increment',
        meta: {
          file: clientCounterFile,
          namespace: 'ClientCounter2',
        },
      },
      {
        key: 'Counter.count',
        meta: {
          file: counterFile,
          namespace: 'Counter',
        },
      },
      {
        key: 'Counter.increment',
        meta: {
          file: counterFile,
          namespace: 'Counter',
        },
      },
      {
        key: 'Navigation.about',
        meta: {
          file: basicFile,
          namespace: 'Navigation',
        },
      },
      {
        key: 'Navigation.client',
        meta: {
          file: basicFile,
          namespace: 'Navigation',
        },
      },
      {
        key: 'Navigation.home',
        meta: {
          file: basicFile,
          namespace: 'Navigation',
        },
      },
      {
        key: 'Navigation.nested',
        meta: {
          file: basicFile,
          namespace: 'Navigation',
        },
      },
      {
        key: 'Navigation.news',
        meta: {
          file: basicFile,
          namespace: 'Navigation',
        },
      },
      {
        key: 'message.argument',
        meta: {
          file: basicFile,
          namespace: 'message',
        },
      },
      {
        key: 'message.select',
        meta: {
          file: basicFile,
          namespace: 'message',
        },
      },
      {
        key: 'message.simple',
        meta: {
          file: basicFile,
          namespace: 'message',
        },
      },
      {
        key: 'testKeyWithoutNamespace',
        meta: {
          file: basicFile,
          namespace: '',
        },
      },
    ]);
  });

  it('should find all the nested translation keys', () => {
    const keys = extract([nestedExampleFile]);

    expect(keys).toEqual([
      {
        key: 'deepNested.level1.one',
        meta: {
          file: nestedExampleFile,
          namespace: 'deepNested.level1',
        },
      },
      {
        key: 'deepNested.level2.two',
        meta: {
          file: nestedExampleFile,
          namespace: 'deepNested.level2',
        },
      },
      {
        key: 'deepNested.level3.three',
        meta: {
          file: nestedExampleFile,
          namespace: 'deepNested.level3',
        },
      },
      {
        key: 'deepNested.level4.four',
        meta: {
          file: nestedExampleFile,
          namespace: 'deepNested.level4',
        },
      },
      {
        key: 'nested.nested.two.nestedTwoKey',
        meta: {
          file: nestedExampleFile,
          namespace: 'nested.nested.two',
        },
      },
      {
        key: 'nested.one.nestedKey',
        meta: {
          file: nestedExampleFile,
          namespace: 'nested.one',
        },
      },
      {
        key: 'nested.one.regularKey',
        meta: {
          file: nestedExampleFile,
          namespace: 'nested.one',
        },
      },
      {
        key: 'nested.three.basicKey',
        meta: {
          file: nestedExampleFile,
          namespace: 'nested.three',
        },
      },
      {
        key: 'nested.three.hasKeyCheck',
        meta: {
          file: nestedExampleFile,
          namespace: 'nested.three',
        },
      },
      {
        key: 'nested.three.htmlKey',
        meta: {
          file: nestedExampleFile,
          namespace: 'nested.three',
        },
      },
      {
        key: 'nested.three.markupKey',
        meta: {
          file: nestedExampleFile,
          namespace: 'nested.three',
        },
      },
      {
        key: 'nested.three.richTextKey',
        meta: {
          file: nestedExampleFile,
          namespace: 'nested.three',
        },
      },
      {
        key: 'nested.two.nestedKey',
        meta: {
          file: nestedExampleFile,
          namespace: 'nested.two',
        },
      },
      {
        key: 'nested.two.regularKey',
        meta: {
          file: nestedExampleFile,
          namespace: 'nested.two',
        },
      },
    ]);
  });

  it('should find all the async translation keys', () => {
    const keys = extract([asyncExampleFile]);

    expect(keys).toEqual([
      {
        key: 'Async.title',
        meta: {
          file: asyncExampleFile,
          namespace: 'Async',
        },
      },
      {
        key: 'async.two.title',
        meta: {
          file: asyncExampleFile,
          namespace: 'async.two',
        },
      },
    ]);
  });

  it('should find all the async translation keys when using promise.all', () => {
    const keys = extract([asyncPromiseAllExampleFile]);

    expect(keys).toEqual([
      {
        key: 'asyncPromiseAll.subtitle',
        meta: {
          file: asyncPromiseAllExampleFile,
          namespace: 'asyncPromiseAll',
        },
      },
      {
        key: 'asyncPromiseAll.title',
        meta: {
          file: asyncPromiseAllExampleFile,
          namespace: 'asyncPromiseAll',
        },
      },
    ]);
  });

  it('should find all dynamic keys defined as comments', () => {
    const keys = extract([dynamicKeysExampleFile]);

    expect(keys).toEqual([
      {
        key: 'dynamic',
        meta: {
          dynamic: true,
          file: dynamicKeysExampleFile,
          namespace: 'dynamic',
        },
      },
      {
        key: 'dynamic.four',
        meta: {
          dynamic: true,
          file: dynamicKeysExampleFile,
          namespace: 'dynamic.four',
        },
      },
      {
        key: 'dynamic.four.nameFour',
        meta: {
          file: dynamicKeysExampleFile,
          namespace: 'dynamic.four',
        },
      },
      {
        key: 'dynamic.four.nameOne',
        meta: {
          file: dynamicKeysExampleFile,
          namespace: 'dynamic.four',
        },
      },
      {
        key: 'dynamic.four.nameThree',
        meta: {
          file: dynamicKeysExampleFile,
          namespace: 'dynamic.four',
        },
      },
      {
        key: 'dynamic.four.nameTwo',
        meta: {
          file: dynamicKeysExampleFile,
          namespace: 'dynamic.four',
        },
      },
    ]);
  });

  it('should find all strict typed keys', () => {
    const keys = extract([strictTypesExample]);

    expect(keys).toEqual([
      {
        key: 'About.lastUpdated',
        meta: {
          file: strictTypesExample,
          namespace: 'About',
        },
      },
      {
        key: 'About.lastUpdated',
        meta: {
          file: strictTypesExample,
          namespace: 'About',
        },
      },
      {
        key: 'About.title',
        meta: {
          file: strictTypesExample,
          namespace: undefined,
        },
      },
      {
        key: 'About.title',
        meta: {
          file: strictTypesExample,
          namespace: 'About',
        },
      },
      {
        key: 'About.title',
        meta: {
          file: strictTypesExample,
          namespace: undefined,
        },
      },
      {
        key: 'About.title',
        meta: {
          file: strictTypesExample,
          namespace: 'About',
        },
      },
      {
        key: 'About.unknown',
        meta: {
          file: strictTypesExample,
          namespace: 'About',
        },
      },
      {
        key: 'About.unknown',
        meta: {
          file: strictTypesExample,
          namespace: 'About',
        },
      },
      {
        key: 'Navigation.about',
        meta: {
          file: strictTypesExample,
          namespace: undefined,
        },
      },
      {
        key: 'Navigation.about',
        meta: {
          file: strictTypesExample,
          namespace: 'Navigation',
        },
      },
      {
        key: 'Navigation.about',
        meta: {
          file: strictTypesExample,
          namespace: undefined,
        },
      },
      {
        key: 'Navigation.about',
        meta: {
          file: strictTypesExample,
          namespace: 'Navigation',
        },
      },
      {
        key: 'NotFound.title',
        meta: {
          file: strictTypesExample,
          namespace: 'NotFound',
        },
      },
      {
        key: 'NotFound.title',
        meta: {
          file: strictTypesExample,
          namespace: 'NotFound',
        },
      },
      {
        key: 'PageLayout.pageTitle',
        meta: {
          file: strictTypesExample,
          namespace: 'PageLayout',
        },
      },
      {
        key: 'PageLayout.pageTitle',
        meta: {
          file: strictTypesExample,
          namespace: 'PageLayout',
        },
      },
      {
        key: 'StrictTypes.nested.another.level',
        meta: {
          file: strictTypesExample,
          namespace: 'StrictTypes.nested',
        },
      },
      {
        key: 'StrictTypes.nested.another.level',
        meta: {
          file: strictTypesExample,
          namespace: 'StrictTypes.nested',
        },
      },
      {
        key: 'StrictTypes.nested.hello',
        meta: {
          file: strictTypesExample,
          namespace: 'StrictTypes',
        },
      },
      {
        key: 'StrictTypes.nested.hello',
        meta: {
          file: strictTypesExample,
          namespace: 'StrictTypes',
        },
      },
      {
        key: 'Test.title',
        meta: {
          file: strictTypesExample,
          namespace: 'Test',
        },
      },
      {
        key: 'Test.title',
        meta: {
          file: strictTypesExample,
          namespace: 'Test',
        },
      },
      {
        key: 'title',
        meta: {
          file: strictTypesExample,
          namespace: undefined,
        },
      },
      {
        key: 'title',
        meta: {
          file: strictTypesExample,
          namespace: undefined,
        },
      },
      {
        key: 'unknown',
        meta: {
          file: strictTypesExample,
          namespace: undefined,
        },
      },
      {
        key: 'unknown',
        meta: {
          file: strictTypesExample,
          namespace: undefined,
        },
      },
      {
        key: 'unknown.unknown',
        meta: {
          file: strictTypesExample,
          namespace: 'unknown',
        },
      },
      {
        key: 'unknown.unknown',
        meta: {
          file: strictTypesExample,
          namespace: 'unknown',
        },
      },
    ]);
  });

  it('should find all the keys for multiple useTranslations aliases', () => {
    const keys = extract([advancedExample]);

    expect(keys).toEqual([
      {
        key: 'aliasNestedFour.four',
        meta: {
          file: advancedExample,
          namespace: 'aliasNestedFour',
        },
      },
      {
        key: 'aliasNestedOne.one',
        meta: {
          file: advancedExample,
          namespace: 'aliasNestedOne',
        },
      },
      {
        key: 'aliasNestedOne.threeOne',
        meta: {
          file: advancedExample,
          namespace: 'aliasNestedOne',
        },
      },
      {
        key: 'aliasNestedThree.three',
        meta: {
          file: advancedExample,
          namespace: 'aliasNestedThree',
        },
      },
      {
        key: 'aliasNestedThree.threeThree',
        meta: {
          file: advancedExample,
          namespace: 'aliasNestedThree',
        },
      },
      {
        key: 'aliasNestedTwo.threeTwo',
        meta: {
          file: advancedExample,
          namespace: 'aliasNestedTwo',
        },
      },
      {
        key: 'aliasNestedTwo.two',
        meta: {
          file: advancedExample,
          namespace: 'aliasNestedTwo',
        },
      },
      {
        key: 'aliasOne.keyOne',
        meta: {
          file: advancedExample,
          namespace: 'aliasOne',
        },
      },
      {
        key: 'aliasTwo.keyTwo',
        meta: {
          file: advancedExample,
          namespace: 'aliasTwo',
        },
      },
    ]);
  });

  it('should find all the keys definded in generateMetaData', () => {
    const keys = extract([generateMetaDataExample]);

    expect(keys).toEqual([
      {
        key: 'generate.meta.data.key',
        meta: {
          file: generateMetaDataExample,
          namespace: '',
        },
      },
      {
        key: 'generate.meta.data.otherKey',
        meta: {
          file: generateMetaDataExample,
          namespace: '',
        },
      },
      {
        key: 'generate.meta.data.title',
        meta: {
          file: generateMetaDataExample,
          namespace: 'generate',
        },
      },
    ]);
  });

  it('should find all the keys defined as comments', () => {
    const keys = extract([commentsExample]);

    expect(keys).toEqual([
      {
        key: 'some.key.as.comment',
        meta: {
          file: commentsExample,
          namespace: '',
        },
      },
      {
        key: 'some.key.inside.docblock',
        meta: {
          file: commentsExample,
          namespace: '',
        },
      },
    ]);
  });

  it('should find all the keys that are used inside indirect function calls', () => {
    const keys = extract([indirectFunctionCallExample]);

    expect(keys).toEqual([
      {
        key: 'Basic.basic',
        meta: {
          file: indirectFunctionCallExample,
          namespace: 'Basic',
        },
      },
      {
        key: 'Indirect1.indirect1',
        meta: {
          file: indirectFunctionCallExample,
          namespace: 'Indirect1',
        },
      },
      {
        key: 'Indirect2.indirect2',
        meta: {
          file: indirectFunctionCallExample,
          namespace: 'Indirect2',
        },
      },
      {
        key: 'Indirect3.indirect3',
        meta: {
          file: indirectFunctionCallExample,
          namespace: 'Indirect3',
        },
      },
      {
        key: 'Indirect4.indirect4',
        meta: {
          file: indirectFunctionCallExample,
          namespace: 'Indirect4',
        },
      },
      {
        key: 'indirectNoNamespaceKeyOne',
        meta: {
          file: indirectFunctionCallExample,
          namespace: '',
        },
      },
      {
        key: 'indirectNoNamespaceKeyTwo',
        meta: {
          file: indirectFunctionCallExample,
          namespace: '',
        },
      },
    ]);
  });
});
