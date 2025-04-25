import { extract } from "./nextIntlSrcParser";
import path from "node:path";

const srcPath = "./translations/codeExamples/next-intl/src/";

const basicFile = path.join(srcPath, "Basic.tsx");
const counterFile = path.join(srcPath, "Counter.tsx");
const clientCounterFile = path.join(srcPath, "ClientCounter.tsx");
const nestedExampleFile = path.join(srcPath, "NestedExample.tsx");
const asyncExampleFile = path.join(srcPath, "AsyncExample.tsx");
const dynamicKeysExampleFile = path.join(srcPath, "DynamicKeysExample.tsx");
const strictTypesExample = path.join(srcPath, "StrictTypesExample.tsx");
const advancedExample = path.join(srcPath, "AdvancedExample.tsx");

describe("nextIntlSrcParser", () => {
  it("should find all the translation keys", () => {
    const keys = extract([basicFile, counterFile, clientCounterFile]);

    expect(keys).toEqual([
      {
        key: "ClientCounter.count",
        meta: {
          file: clientCounterFile,
          namespace: "ClientCounter",
        },
      },
      {
        key: "ClientCounter.increment",
        meta: {
          file: clientCounterFile,
          namespace: "ClientCounter",
        },
      },
      {
        key: "ClientCounter2.count",
        meta: {
          file: clientCounterFile,
          namespace: "ClientCounter2",
        },
      },
      {
        key: "ClientCounter2.increment",
        meta: {
          file: clientCounterFile,
          namespace: "ClientCounter2",
        },
      },
      {
        key: "Counter.count",
        meta: {
          file: counterFile,
          namespace: "Counter",
        },
      },
      {
        key: "Counter.increment",
        meta: {
          file: counterFile,
          namespace: "Counter",
        },
      },
      {
        key: "Navigation.about",
        meta: {
          file: basicFile,
          namespace: "Navigation",
        },
      },
      {
        key: "Navigation.client",
        meta: {
          file: basicFile,
          namespace: "Navigation",
        },
      },
      {
        key: "Navigation.home",
        meta: {
          file: basicFile,
          namespace: "Navigation",
        },
      },
      {
        key: "Navigation.nested",
        meta: {
          file: basicFile,
          namespace: "Navigation",
        },
      },
      {
        key: "Navigation.news",
        meta: {
          file: basicFile,
          namespace: "Navigation",
        },
      },
      {
        key: "message.argument",
        meta: {
          file: basicFile,
          namespace: "message",
        },
      },
      {
        key: "message.select",
        meta: {
          file: basicFile,
          namespace: "message",
        },
      },
      {
        key: "message.simple",
        meta: {
          file: basicFile,
          namespace: "message",
        },
      },
      {
        key: "testKeyWithoutNamespace",
        meta: {
          file: basicFile,
          namespace: "",
        },
      },
    ]);
  });

  it("should find all the nested translation keys", () => {
    const keys = extract([nestedExampleFile]);

    expect(keys).toEqual([
      {
        key: "deepNested.level1.one",
        meta: {
          file: "translations/codeExamples/next-intl/src/NestedExample.tsx",
          namespace: "deepNested.level1",
        },
      },
      {
        key: "deepNested.level2.two",
        meta: {
          file: "translations/codeExamples/next-intl/src/NestedExample.tsx",
          namespace: "deepNested.level2",
        },
      },
      {
        key: "deepNested.level3.three",
        meta: {
          file: "translations/codeExamples/next-intl/src/NestedExample.tsx",
          namespace: "deepNested.level3",
        },
      },
      {
        key: "deepNested.level4.four",
        meta: {
          file: "translations/codeExamples/next-intl/src/NestedExample.tsx",
          namespace: "deepNested.level4",
        },
      },
      {
        key: "nested.nested.two.nestedTwoKey",
        meta: {
          file: "translations/codeExamples/next-intl/src/NestedExample.tsx",
          namespace: "nested.nested.two",
        },
      },
      {
        key: "nested.one.nestedKey",
        meta: {
          file: "translations/codeExamples/next-intl/src/NestedExample.tsx",
          namespace: "nested.one",
        },
      },
      {
        key: "nested.one.regularKey",
        meta: {
          file: "translations/codeExamples/next-intl/src/NestedExample.tsx",
          namespace: "nested.one",
        },
      },
      {
        key: "nested.three.basicKey",
        meta: {
          file: "translations/codeExamples/next-intl/src/NestedExample.tsx",
          namespace: "nested.three",
        },
      },
      {
        key: "nested.three.hasKeyCheck",
        meta: {
          file: "translations/codeExamples/next-intl/src/NestedExample.tsx",
          namespace: "nested.three",
        },
      },
      {
        key: "nested.three.htmlKey",
        meta: {
          file: "translations/codeExamples/next-intl/src/NestedExample.tsx",
          namespace: "nested.three",
        },
      },
      {
        key: "nested.three.markupKey",
        meta: {
          file: "translations/codeExamples/next-intl/src/NestedExample.tsx",
          namespace: "nested.three",
        },
      },
      {
        key: "nested.three.richTextKey",
        meta: {
          file: "translations/codeExamples/next-intl/src/NestedExample.tsx",
          namespace: "nested.three",
        },
      },
      {
        key: "nested.two.nestedKey",
        meta: {
          file: "translations/codeExamples/next-intl/src/NestedExample.tsx",
          namespace: "nested.two",
        },
      },
      {
        key: "nested.two.regularKey",
        meta: {
          file: "translations/codeExamples/next-intl/src/NestedExample.tsx",
          namespace: "nested.two",
        },
      },
    ]);
  });

  it("should find all the async translation keys", () => {
    const keys = extract([asyncExampleFile]);

    expect(keys).toEqual([
      {
        key: "Async.title",
        meta: {
          file: "translations/codeExamples/next-intl/src/AsyncExample.tsx",
          namespace: "Async",
        },
      },
      {
        key: "async.two.title",
        meta: {
          file: "translations/codeExamples/next-intl/src/AsyncExample.tsx",
          namespace: "async.two",
        },
      },
    ]);
  });

  it("should find all dynamic keys defined as comments", () => {
    const keys = extract([dynamicKeysExampleFile]);

    expect(keys).toEqual([
      {
        key: "dynamic",
        meta: {
          dynamic: true,
          file: "translations/codeExamples/next-intl/src/DynamicKeysExample.tsx",
          namespace: "dynamic",
        },
      },
      {
        key: "dynamic.four",
        meta: {
          dynamic: true,
          file: "translations/codeExamples/next-intl/src/DynamicKeysExample.tsx",
          namespace: "dynamic.four",
        },
      },
      {
        key: "dynamic.four.nameFour",
        meta: {
          file: "translations/codeExamples/next-intl/src/DynamicKeysExample.tsx",
          namespace: "dynamic.four",
        },
      },
      {
        key: "dynamic.four.nameOne",
        meta: {
          file: "translations/codeExamples/next-intl/src/DynamicKeysExample.tsx",
          namespace: "dynamic.four",
        },
      },
      {
        key: "dynamic.four.nameThree",
        meta: {
          file: "translations/codeExamples/next-intl/src/DynamicKeysExample.tsx",
          namespace: "dynamic.four",
        },
      },
      {
        key: "dynamic.four.nameTwo",
        meta: {
          file: "translations/codeExamples/next-intl/src/DynamicKeysExample.tsx",
          namespace: "dynamic.four",
        },
      },
    ]);
  });

  it("should find all strict typed keys", () => {
    const keys = extract([strictTypesExample]);

    expect(keys).toEqual([
      {
        key: "About.lastUpdated",
        meta: {
          file: "translations/codeExamples/next-intl/src/StrictTypesExample.tsx",
          namespace: "About",
        },
      },
      {
        key: "About.lastUpdated",
        meta: {
          file: "translations/codeExamples/next-intl/src/StrictTypesExample.tsx",
          namespace: "About",
        },
      },
      {
        key: "About.title",
        meta: {
          file: "translations/codeExamples/next-intl/src/StrictTypesExample.tsx",
          namespace: undefined,
        },
      },
      {
        key: "About.title",
        meta: {
          file: "translations/codeExamples/next-intl/src/StrictTypesExample.tsx",
          namespace: "About",
        },
      },
      {
        key: "About.title",
        meta: {
          file: "translations/codeExamples/next-intl/src/StrictTypesExample.tsx",
          namespace: undefined,
        },
      },
      {
        key: "About.title",
        meta: {
          file: "translations/codeExamples/next-intl/src/StrictTypesExample.tsx",
          namespace: "About",
        },
      },
      {
        key: "About.unknown",
        meta: {
          file: "translations/codeExamples/next-intl/src/StrictTypesExample.tsx",
          namespace: "About",
        },
      },
      {
        key: "About.unknown",
        meta: {
          file: "translations/codeExamples/next-intl/src/StrictTypesExample.tsx",
          namespace: "About",
        },
      },
      {
        key: "Navigation.about",
        meta: {
          file: "translations/codeExamples/next-intl/src/StrictTypesExample.tsx",
          namespace: undefined,
        },
      },
      {
        key: "Navigation.about",
        meta: {
          file: "translations/codeExamples/next-intl/src/StrictTypesExample.tsx",
          namespace: "Navigation",
        },
      },
      {
        key: "Navigation.about",
        meta: {
          file: "translations/codeExamples/next-intl/src/StrictTypesExample.tsx",
          namespace: undefined,
        },
      },
      {
        key: "Navigation.about",
        meta: {
          file: "translations/codeExamples/next-intl/src/StrictTypesExample.tsx",
          namespace: "Navigation",
        },
      },
      {
        key: "NotFound.title",
        meta: {
          file: "translations/codeExamples/next-intl/src/StrictTypesExample.tsx",
          namespace: "NotFound",
        },
      },
      {
        key: "NotFound.title",
        meta: {
          file: "translations/codeExamples/next-intl/src/StrictTypesExample.tsx",
          namespace: "NotFound",
        },
      },
      {
        key: "PageLayout.pageTitle",
        meta: {
          file: "translations/codeExamples/next-intl/src/StrictTypesExample.tsx",
          namespace: "PageLayout",
        },
      },
      {
        key: "PageLayout.pageTitle",
        meta: {
          file: "translations/codeExamples/next-intl/src/StrictTypesExample.tsx",
          namespace: "PageLayout",
        },
      },
      {
        key: "StrictTypes.nested.another.level",
        meta: {
          file: "translations/codeExamples/next-intl/src/StrictTypesExample.tsx",
          namespace: "StrictTypes.nested",
        },
      },
      {
        key: "StrictTypes.nested.another.level",
        meta: {
          file: "translations/codeExamples/next-intl/src/StrictTypesExample.tsx",
          namespace: "StrictTypes.nested",
        },
      },
      {
        key: "StrictTypes.nested.hello",
        meta: {
          file: "translations/codeExamples/next-intl/src/StrictTypesExample.tsx",
          namespace: "StrictTypes",
        },
      },
      {
        key: "StrictTypes.nested.hello",
        meta: {
          file: "translations/codeExamples/next-intl/src/StrictTypesExample.tsx",
          namespace: "StrictTypes",
        },
      },
      {
        key: "Test.title",
        meta: {
          file: "translations/codeExamples/next-intl/src/StrictTypesExample.tsx",
          namespace: "Test",
        },
      },
      {
        key: "Test.title",
        meta: {
          file: "translations/codeExamples/next-intl/src/StrictTypesExample.tsx",
          namespace: "Test",
        },
      },
      {
        key: "title",
        meta: {
          file: "translations/codeExamples/next-intl/src/StrictTypesExample.tsx",
          namespace: undefined,
        },
      },
      {
        key: "title",
        meta: {
          file: "translations/codeExamples/next-intl/src/StrictTypesExample.tsx",
          namespace: undefined,
        },
      },
      {
        key: "unknown",
        meta: {
          file: "translations/codeExamples/next-intl/src/StrictTypesExample.tsx",
          namespace: undefined,
        },
      },
      {
        key: "unknown",
        meta: {
          file: "translations/codeExamples/next-intl/src/StrictTypesExample.tsx",
          namespace: undefined,
        },
      },
      {
        key: "unknown.unknown",
        meta: {
          file: "translations/codeExamples/next-intl/src/StrictTypesExample.tsx",
          namespace: "unknown",
        },
      },
      {
        key: "unknown.unknown",
        meta: {
          file: "translations/codeExamples/next-intl/src/StrictTypesExample.tsx",
          namespace: "unknown",
        },
      },
    ]);
  });

  it("should find all the keys for multiple useTranslations aliases", () => {
    const keys = extract([advancedExample]);

    expect(keys).toEqual([
      {
        key: "aliasNestedFour.four",
        meta: {
          file: advancedExample,
          namespace: "aliasNestedFour",
        },
      },
      {
        key: "aliasNestedOne.one",
        meta: {
          file: advancedExample,
          namespace: "aliasNestedOne",
        },
      },
      {
        key: "aliasNestedOne.threeOne",
        meta: {
          file: advancedExample,
          namespace: "aliasNestedOne",
        },
      },
      {
        key: "aliasNestedThree.three",
        meta: {
          file: advancedExample,
          namespace: "aliasNestedThree",
        },
      },
      {
        key: "aliasNestedThree.threeThree",
        meta: {
          file: advancedExample,
          namespace: "aliasNestedThree",
        },
      },
      {
        key: "aliasNestedTwo.threeTwo",
        meta: {
          file: advancedExample,
          namespace: "aliasNestedTwo",
        },
      },
      {
        key: "aliasNestedTwo.two",
        meta: {
          file: advancedExample,
          namespace: "aliasNestedTwo",
        },
      },
      {
        key: "aliasOne.keyOne",
        meta: {
          file: advancedExample,
          namespace: "aliasOne",
        },
      },
      {
        key: "aliasTwo.keyTwo",
        meta: {
          file: advancedExample,
          namespace: "aliasTwo",
        },
      },
    ]);
  });
});
