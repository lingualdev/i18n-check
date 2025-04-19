import { count } from "node:console";
import { extract } from "./nextIntlSrcParser";
import path from "node:path";

const srcPath = "./translations/codeExamples/next-intl/src/";

const basicFile = path.join(srcPath, "Basic.tsx");
const counterFile = path.join(srcPath, "Counter.tsx");
const clientCounterFile = path.join(srcPath, "ClientCounter.tsx");
const nestedExampleFile = path.join(srcPath, "NestedExample.tsx");
const asyncExampleFile = path.join(srcPath, "AsyncExample.tsx");
const dynamicKeysExamplFile = path.join(srcPath, "DynamicKeysExample.tsx");
const strictTypesExample = path.join(srcPath, "StrictTypesExample.tsx");

describe("nextIntlSrcParser", () => {
  it("should find all the translation keys", () => {
    const keys = extract([basicFile, counterFile, clientCounterFile]);

    expect(keys).toEqual([
      {
        key: "ClientCounter2.increment",
        meta: {
          file: clientCounterFile,
        },
      },
      {
        key: "ClientCounter2.count",
        meta: {
          file: clientCounterFile,
        },
      },
      {
        key: "ClientCounter.increment",
        meta: {
          file: clientCounterFile,
        },
      },
      {
        key: "ClientCounter.count",
        meta: {
          file: clientCounterFile,
        },
      },
      {
        key: "Counter.increment",
        meta: {
          file: counterFile,
        },
      },
      {
        key: "Counter.count",
        meta: {
          file: counterFile,
        },
      },
      {
        key: "testKeyWithoutNamespace",
        meta: {
          file: basicFile,
        },
      },
      {
        key: "message.argument",
        meta: {
          file: basicFile,
        },
      },
      {
        key: "message.select",
        meta: {
          file: basicFile,
        },
      },
      {
        key: "message.simple",
        meta: {
          file: basicFile,
        },
      },
      {
        key: "Navigation.news",
        meta: {
          file: basicFile,
        },
      },
      {
        key: "Navigation.nested",
        meta: {
          file: basicFile,
        },
      },
      {
        key: "Navigation.about",
        meta: {
          file: basicFile,
        },
      },
      {
        key: "Navigation.client",
        meta: {
          file: basicFile,
        },
      },
      {
        key: "Navigation.home",
        meta: {
          file: basicFile,
        },
      },
    ]);
  });

  it("should find all the nested translation keys", () => {
    const keys = extract([nestedExampleFile]);

    expect(keys).toEqual([
      {
        key: "nested.three.htmlKey",
        meta: {
          file: "translations/codeExamples/next-intl/src/NestedExample.tsx",
        },
      },
      {
        key: "nested.three.markupKey",
        meta: {
          file: "translations/codeExamples/next-intl/src/NestedExample.tsx",
        },
      },
      {
        key: "nested.three.richTextKey",
        meta: {
          file: "translations/codeExamples/next-intl/src/NestedExample.tsx",
        },
      },
      {
        key: "nested.three.hasKeyCheck",
        meta: {
          file: "translations/codeExamples/next-intl/src/NestedExample.tsx",
        },
      },
      {
        key: "nested.three.basicKey",
        meta: {
          file: "translations/codeExamples/next-intl/src/NestedExample.tsx",
        },
      },
      {
        key: "deepNested.level1.one",
        meta: {
          file: "translations/codeExamples/next-intl/src/NestedExample.tsx",
        },
      },
      {
        key: "deepNested.level2.two",
        meta: {
          file: "translations/codeExamples/next-intl/src/NestedExample.tsx",
        },
      },
      {
        key: "deepNested.level3.three",
        meta: {
          file: "translations/codeExamples/next-intl/src/NestedExample.tsx",
        },
      },
      {
        key: "deepNested.level4.four",
        meta: {
          file: "translations/codeExamples/next-intl/src/NestedExample.tsx",
        },
      },
      {
        key: "nested.two.regularKey",
        meta: {
          file: "translations/codeExamples/next-intl/src/NestedExample.tsx",
        },
      },
      {
        key: "nested.two.nestedKey",
        meta: {
          file: "translations/codeExamples/next-intl/src/NestedExample.tsx",
        },
      },
      {
        key: "nested.nested.two.nestedTwoKey",
        meta: {
          file: "translations/codeExamples/next-intl/src/NestedExample.tsx",
        },
      },
      {
        key: "nested.one.regularKey",
        meta: {
          file: "translations/codeExamples/next-intl/src/NestedExample.tsx",
        },
      },
      {
        key: "nested.one.nestedKey",
        meta: {
          file: "translations/codeExamples/next-intl/src/NestedExample.tsx",
        },
      },
    ]);
  });

  it("should find all the async translation keys", () => {
    const keys = extract([asyncExampleFile]);

    expect(keys).toEqual([
      {
        key: "async.two.title",
        meta: {
          file: "translations/codeExamples/next-intl/src/AsyncExample.tsx",
        },
      },
      {
        key: "Async.title",
        meta: {
          file: "translations/codeExamples/next-intl/src/AsyncExample.tsx",
        },
      },
    ]);
  });

  it("should find all dynamic keys defined as comments", () => {
    const keys = extract([dynamicKeysExamplFile]);

    expect(keys).toEqual([
      {
        key: "dynamic.three.value",
        meta: {
          file: "translations/codeExamples/next-intl/src/DynamicKeysExample.tsx",
        },
      },
      {
        key: "dynamic.three.title",
        meta: {
          file: "translations/codeExamples/next-intl/src/DynamicKeysExample.tsx",
        },
      },
      {
        key: "dynamic.two.value",
        meta: {
          file: "translations/codeExamples/next-intl/src/DynamicKeysExample.tsx",
        },
      },
      {
        key: "dynamic.two.title",
        meta: {
          file: "translations/codeExamples/next-intl/src/DynamicKeysExample.tsx",
        },
      },
      {
        key: "dynamic.one.value",
        meta: {
          file: "translations/codeExamples/next-intl/src/DynamicKeysExample.tsx",
        },
      },
      {
        key: "dynamic.one.title",
        meta: {
          file: "translations/codeExamples/next-intl/src/DynamicKeysExample.tsx",
        },
      },
      {
        key: "dynamic.four.four",
        meta: {
          file: "translations/codeExamples/next-intl/src/DynamicKeysExample.tsx",
        },
      },
      {
        key: "dynamic.four.three",
        meta: {
          file: "translations/codeExamples/next-intl/src/DynamicKeysExample.tsx",
        },
      },
      {
        key: "dynamic.four.two",
        meta: {
          file: "translations/codeExamples/next-intl/src/DynamicKeysExample.tsx",
        },
      },
      {
        key: "dynamic.four.one",
        meta: {
          file: "translations/codeExamples/next-intl/src/DynamicKeysExample.tsx",
        },
      },
      {
        key: "dynamic.four.nameFour",
        meta: {
          file: "translations/codeExamples/next-intl/src/DynamicKeysExample.tsx",
        },
      },
      {
        key: "dynamic.four.nameThree",
        meta: {
          file: "translations/codeExamples/next-intl/src/DynamicKeysExample.tsx",
        },
      },
      {
        key: "dynamic.four.nameTwo",
        meta: {
          file: "translations/codeExamples/next-intl/src/DynamicKeysExample.tsx",
        },
      },
      {
        key: "dynamic.four.nameOne",
        meta: {
          file: "translations/codeExamples/next-intl/src/DynamicKeysExample.tsx",
        },
      },
    ]);
  });

  it("should find all strict typed keys", () => {
    const keys = extract([strictTypesExample]);

    expect(keys).toEqual([
      {
        key: "unknown.unknown",
        meta: {
          file: "translations/codeExamples/next-intl/src/StrictTypesExample.tsx",
        },
      },
      {
        key: "About.unknown",
        meta: {
          file: "translations/codeExamples/next-intl/src/StrictTypesExample.tsx",
        },
      },
      {
        key: "unknown",
        meta: {
          file: "translations/codeExamples/next-intl/src/StrictTypesExample.tsx",
        },
      },
      {
        key: "Test.title",
        meta: {
          file: "translations/codeExamples/next-intl/src/StrictTypesExample.tsx",
        },
      },
      {
        key: "title",
        meta: {
          file: "translations/codeExamples/next-intl/src/StrictTypesExample.tsx",
        },
      },
      {
        key: "PageLayout.pageTitle",
        meta: {
          file: "translations/codeExamples/next-intl/src/StrictTypesExample.tsx",
        },
      },
      {
        key: "NotFound.title",
        meta: {
          file: "translations/codeExamples/next-intl/src/StrictTypesExample.tsx",
        },
      },
      {
        key: "Navigation.about",
        meta: {
          file: "translations/codeExamples/next-intl/src/StrictTypesExample.tsx",
        },
      },
      {
        key: "About.title",
        meta: {
          file: "translations/codeExamples/next-intl/src/StrictTypesExample.tsx",
        },
      },
      {
        key: "Navigation.about",
        meta: {
          file: "translations/codeExamples/next-intl/src/StrictTypesExample.tsx",
        },
      },
      {
        key: "About.lastUpdated",
        meta: {
          file: "translations/codeExamples/next-intl/src/StrictTypesExample.tsx",
        },
      },
      {
        key: "About.title",
        meta: {
          file: "translations/codeExamples/next-intl/src/StrictTypesExample.tsx",
        },
      },
      {
        key: "StrictTypes.nested.another.level",
        meta: {
          file: "translations/codeExamples/next-intl/src/StrictTypesExample.tsx",
        },
      },
      {
        key: "StrictTypes.nested.hello",
        meta: {
          file: "translations/codeExamples/next-intl/src/StrictTypesExample.tsx",
        },
      },
      {
        key: "unknown.unknown",
        meta: {
          file: "translations/codeExamples/next-intl/src/StrictTypesExample.tsx",
        },
      },
      {
        key: "About.unknown",
        meta: {
          file: "translations/codeExamples/next-intl/src/StrictTypesExample.tsx",
        },
      },
      {
        key: "unknown",
        meta: {
          file: "translations/codeExamples/next-intl/src/StrictTypesExample.tsx",
        },
      },
      {
        key: "Test.title",
        meta: {
          file: "translations/codeExamples/next-intl/src/StrictTypesExample.tsx",
        },
      },
      {
        key: "title",
        meta: {
          file: "translations/codeExamples/next-intl/src/StrictTypesExample.tsx",
        },
      },
      {
        key: "PageLayout.pageTitle",
        meta: {
          file: "translations/codeExamples/next-intl/src/StrictTypesExample.tsx",
        },
      },
      {
        key: "NotFound.title",
        meta: {
          file: "translations/codeExamples/next-intl/src/StrictTypesExample.tsx",
        },
      },
      {
        key: "Navigation.about",
        meta: {
          file: "translations/codeExamples/next-intl/src/StrictTypesExample.tsx",
        },
      },
      {
        key: "About.title",
        meta: {
          file: "translations/codeExamples/next-intl/src/StrictTypesExample.tsx",
        },
      },
      {
        key: "Navigation.about",
        meta: {
          file: "translations/codeExamples/next-intl/src/StrictTypesExample.tsx",
        },
      },
      {
        key: "About.lastUpdated",
        meta: {
          file: "translations/codeExamples/next-intl/src/StrictTypesExample.tsx",
        },
      },
      {
        key: "About.title",
        meta: {
          file: "translations/codeExamples/next-intl/src/StrictTypesExample.tsx",
        },
      },
      {
        key: "StrictTypes.nested.another.level",
        meta: {
          file: "translations/codeExamples/next-intl/src/StrictTypesExample.tsx",
        },
      },
      {
        key: "StrictTypes.nested.hello",
        meta: {
          file: "translations/codeExamples/next-intl/src/StrictTypesExample.tsx",
        },
      },
    ]);
  });
});
