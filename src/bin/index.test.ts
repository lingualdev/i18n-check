import { exec } from "child_process";

describe("CLI", () => {
  describe("JSON", () => {
    it("should return the missing keys for single folder translations", (done) => {
      exec(
        "node dist/bin/index.js -s en-US -l translations/flattenExamples",
        (_error, stdout, _stderr) => {
          const result = stdout.split("Done")[0];
          expect(result).toEqual(`i18n translations checker
Source: en-US

Found missing keys!
┌───────────────────────────────────────────┬────────────────────────────────┐
│ file                                      │ key                            │
├───────────────────────────────────────────┼────────────────────────────────┤
│  translations/flattenExamples/de-de.json  │  other.nested.three            │
│  translations/flattenExamples/de-de.json  │  other.nested.deep.more.final  │
└───────────────────────────────────────────┴────────────────────────────────┘

No invalid translations found!

`);
          done();
        }
      );
    });

    it("should return the missing/invalid keys for folder per locale with single file", (done) => {
      exec(
        "node dist/bin/index.js -l translations/folderExample/ -s en-US",
        (_error, stdout, _stderr) => {
          const result = stdout.split("Done")[0];
          expect(result).toEqual(`i18n translations checker
Source: en-US

Found missing keys!
┌───────────────────────────────────────────────┬───────────────────────┐
│ file                                          │ key                   │
├───────────────────────────────────────────────┼───────────────────────┤
│  translations/folderExample/de-DE/index.json  │  message.text-format  │
└───────────────────────────────────────────────┴───────────────────────┘

Found invalid keys!
┌───────────────────────────────────────────────┬──────────────────┐
│ file                                          │ key              │
├───────────────────────────────────────────────┼──────────────────┤
│  translations/folderExample/de-DE/index.json  │  message.select  │
└───────────────────────────────────────────────┴──────────────────┘

`);
          done();
        }
      );
    });

    it("should return the missing/invalid keys for folder per locale with multiple files", (done) => {
      exec(
        "node dist/bin/index.js -l translations/multipleFilesFolderExample/ -s en-US",
        (_error, stdout, _stderr) => {
          const result = stdout.split("Done")[0];
          expect(result).toEqual(`i18n translations checker
Source: en-US

Found missing keys!
┌──────────────────────────────────────────────────────────┬───────────────────────┐
│ file                                                     │ key                   │
├──────────────────────────────────────────────────────────┼───────────────────────┤
│  translations/multipleFilesFolderExample/de-DE/one.json  │  message.text-format  │
│  translations/multipleFilesFolderExample/de-DE/two.json  │  test.drive.four      │
└──────────────────────────────────────────────────────────┴───────────────────────┘

Found invalid keys!
┌────────────────────────────────────────────────────────────┬─────────────────────┐
│ file                                                       │ key                 │
├────────────────────────────────────────────────────────────┼─────────────────────┤
│  translations/multipleFilesFolderExample/de-DE/one.json    │  message.select     │
│  translations/multipleFilesFolderExample/de-DE/three.json  │  multipleVariables  │
└────────────────────────────────────────────────────────────┴─────────────────────┘

`);
          done();
        }
      );
    });

    it("should return the missing/invalid keys for folder containing multiple locale folders", (done) => {
      exec(
        "node dist/bin/index.js -l translations/multipleFoldersExample -s en-US",
        (_error, stdout, _stderr) => {
          const result = stdout.split("Done")[0];
          expect(result).toEqual(`i18n translations checker
Source: en-US

Found missing keys!
┌───────────────────────────────────────────────────────────────────────┬───────────────────────┐
│ file                                                                  │ key                   │
├───────────────────────────────────────────────────────────────────────┼───────────────────────┤
│  translations/multipleFoldersExample/spaceOne/locales/de-DE/one.json  │  message.text-format  │
│  translations/multipleFoldersExample/spaceOne/locales/de-DE/two.json  │  test.drive.four      │
│  translations/multipleFoldersExample/spaceTwo/locales/de-DE/one.json  │  message.plural       │
│  translations/multipleFoldersExample/spaceTwo/locales/de-DE/two.json  │  test.drive.two       │
└───────────────────────────────────────────────────────────────────────┴───────────────────────┘

Found invalid keys!
┌─────────────────────────────────────────────────────────────────────────┬───────────────────────┐
│ file                                                                    │ key                   │
├─────────────────────────────────────────────────────────────────────────┼───────────────────────┤
│  translations/multipleFoldersExample/spaceOne/locales/de-DE/one.json    │  message.select       │
│  translations/multipleFoldersExample/spaceOne/locales/de-DE/three.json  │  multipleVariables    │
│  translations/multipleFoldersExample/spaceTwo/locales/de-DE/one.json    │  message.text-format  │
│  translations/multipleFoldersExample/spaceTwo/locales/de-DE/three.json  │  numberFormat         │
└─────────────────────────────────────────────────────────────────────────┴───────────────────────┘

`);
          done();
        }
      );
    });

    it("should return the missing/invalid keys for multiple locale folders", (done) => {
      exec(
        "node dist/bin/index.js -l translations/multipleFoldersExample/spaceOne translations/multipleFoldersExample/spaceTwo -s en-US",
        (_error, stdout, _stderr) => {
          const result = stdout.split("Done")[0];
          expect(result).toEqual(`i18n translations checker
Source: en-US

Found missing keys!
┌───────────────────────────────────────────────────────────────────────┬───────────────────────┐
│ file                                                                  │ key                   │
├───────────────────────────────────────────────────────────────────────┼───────────────────────┤
│  translations/multipleFoldersExample/spaceOne/locales/de-DE/one.json  │  message.text-format  │
│  translations/multipleFoldersExample/spaceOne/locales/de-DE/two.json  │  test.drive.four      │
│  translations/multipleFoldersExample/spaceTwo/locales/de-DE/one.json  │  message.plural       │
│  translations/multipleFoldersExample/spaceTwo/locales/de-DE/two.json  │  test.drive.two       │
└───────────────────────────────────────────────────────────────────────┴───────────────────────┘

Found invalid keys!
┌─────────────────────────────────────────────────────────────────────────┬───────────────────────┐
│ file                                                                    │ key                   │
├─────────────────────────────────────────────────────────────────────────┼───────────────────────┤
│  translations/multipleFoldersExample/spaceOne/locales/de-DE/one.json    │  message.select       │
│  translations/multipleFoldersExample/spaceOne/locales/de-DE/three.json  │  multipleVariables    │
│  translations/multipleFoldersExample/spaceTwo/locales/de-DE/one.json    │  message.text-format  │
│  translations/multipleFoldersExample/spaceTwo/locales/de-DE/three.json  │  numberFormat         │
└─────────────────────────────────────────────────────────────────────────┴───────────────────────┘

`);
          done();
        }
      );
    });

    it("should return the missing/invalid keys for all files in the provided locale folders", (done) => {
      exec(
        "node dist/bin/index.js --source en-US --locales translations/flattenExamples translations/messageExamples",
        (_error, stdout, _stderr) => {
          const result = stdout.split("Done")[0];
          expect(result).toEqual(`i18n translations checker
Source: en-US

Found missing keys!
┌───────────────────────────────────────────┬────────────────────────────────┐
│ file                                      │ key                            │
├───────────────────────────────────────────┼────────────────────────────────┤
│  translations/flattenExamples/de-de.json  │  other.nested.three            │
│  translations/flattenExamples/de-de.json  │  other.nested.deep.more.final  │
│  translations/messageExamples/de-de.json  │  richText                      │
│  translations/messageExamples/de-de.json  │  yo                            │
│  translations/messageExamples/de-de.json  │  nesting1                      │
│  translations/messageExamples/de-de.json  │  nesting2                      │
│  translations/messageExamples/de-de.json  │  nesting3                      │
│  translations/messageExamples/de-de.json  │  key1                          │
└───────────────────────────────────────────┴────────────────────────────────┘

Found invalid keys!
┌───────────────────────────────────────────┬─────────────────────┐
│ file                                      │ key                 │
├───────────────────────────────────────────┼─────────────────────┤
│  translations/messageExamples/de-de.json  │  multipleVariables  │
└───────────────────────────────────────────┴─────────────────────┘

`);
          done();
        }
      );
    });

    it("should return the missing/invalid keys for all files with source matching folder and source matching file", (done) => {
      exec(
        "node dist/bin/index.js -l translations/multipleFilesFolderExample translations/flattenExamples -s en-US",
        (_error, stdout, _stderr) => {
          const result = stdout.split("Done")[0];
          expect(result).toEqual(`i18n translations checker
Source: en-US

Found missing keys!
┌──────────────────────────────────────────────────────────┬────────────────────────────────┐
│ file                                                     │ key                            │
├──────────────────────────────────────────────────────────┼────────────────────────────────┤
│  translations/flattenExamples/de-de.json                 │  other.nested.three            │
│  translations/flattenExamples/de-de.json                 │  other.nested.deep.more.final  │
│  translations/multipleFilesFolderExample/de-DE/one.json  │  message.text-format           │
│  translations/multipleFilesFolderExample/de-DE/two.json  │  test.drive.four               │
└──────────────────────────────────────────────────────────┴────────────────────────────────┘

Found invalid keys!
┌────────────────────────────────────────────────────────────┬─────────────────────┐
│ file                                                       │ key                 │
├────────────────────────────────────────────────────────────┼─────────────────────┤
│  translations/multipleFilesFolderExample/de-DE/one.json    │  message.select     │
│  translations/multipleFilesFolderExample/de-DE/three.json  │  multipleVariables  │
└────────────────────────────────────────────────────────────┴─────────────────────┘

`);
          done();
        }
      );
    });

    it("should ignore the excluded file", (done) => {
      exec(
        "node dist/bin/index.js --source en-US --locales translations/flattenExamples translations/messageExamples --exclude translations/flattenExamples/de-de.json",
        (_error, stdout, _stderr) => {
          const result = stdout.split("Done")[0];
          expect(result).toEqual(`i18n translations checker
Source: en-US

Found missing keys!
┌───────────────────────────────────────────┬────────────┐
│ file                                      │ key        │
├───────────────────────────────────────────┼────────────┤
│  translations/messageExamples/de-de.json  │  richText  │
│  translations/messageExamples/de-de.json  │  yo        │
│  translations/messageExamples/de-de.json  │  nesting1  │
│  translations/messageExamples/de-de.json  │  nesting2  │
│  translations/messageExamples/de-de.json  │  nesting3  │
│  translations/messageExamples/de-de.json  │  key1      │
└───────────────────────────────────────────┴────────────┘

Found invalid keys!
┌───────────────────────────────────────────┬─────────────────────┐
│ file                                      │ key                 │
├───────────────────────────────────────────┼─────────────────────┤
│  translations/messageExamples/de-de.json  │  multipleVariables  │
└───────────────────────────────────────────┴─────────────────────┘

`);
          done();
        }
      );
    });

    it("should ignore the excluded folder", (done) => {
      exec(
        "node dist/bin/index.js --source en-US --locales translations/flattenExamples translations/messageExamples --exclude translations/flattenExamples/*",
        (_error, stdout, _stderr) => {
          const result = stdout.split("Done")[0];
          expect(result).toEqual(`i18n translations checker
Source: en-US

Found missing keys!
┌───────────────────────────────────────────┬────────────┐
│ file                                      │ key        │
├───────────────────────────────────────────┼────────────┤
│  translations/messageExamples/de-de.json  │  richText  │
│  translations/messageExamples/de-de.json  │  yo        │
│  translations/messageExamples/de-de.json  │  nesting1  │
│  translations/messageExamples/de-de.json  │  nesting2  │
│  translations/messageExamples/de-de.json  │  nesting3  │
│  translations/messageExamples/de-de.json  │  key1      │
└───────────────────────────────────────────┴────────────┘

Found invalid keys!
┌───────────────────────────────────────────┬─────────────────────┐
│ file                                      │ key                 │
├───────────────────────────────────────────┼─────────────────────┤
│  translations/messageExamples/de-de.json  │  multipleVariables  │
└───────────────────────────────────────────┴─────────────────────┘

`);
          done();
        }
      );
    });

    it("should ignore the excluded multiple files", (done) => {
      exec(
        "node dist/bin/index.js --source en-US --locales translations/flattenExamples translations/messageExamples --exclude translations/flattenExamples/de-de.json translations/messageExamples/de-de.json",
        (_error, stdout, _stderr) => {
          const result = stdout.split("Done")[0];
          expect(result).toEqual(`i18n translations checker
Source: en-US

No missing keys found!

No invalid translations found!

`);
          done();
        }
      );
    });

    it("should find unused and undefined keys for react-i18next applications", (done) => {
      exec(
        "node dist/bin/index.js --source en --locales translations/codeExamples/reacti18next/locales -f i18next -u translations/codeExamples/reacti18next/src --parser-component-functions WrappedTransComponent",
        (_error, stdout, _stderr) => {
          const result = stdout.split("Done")[0];
          expect(result).toEqual(`i18n translations checker
Source: en
Selected format is: i18next

No missing keys found!

No invalid translations found!

Found unused keys!
┌──────────────────────────────────────────────────────────────────────┬──────────────────┐
│ file                                                                 │ key              │
├──────────────────────────────────────────────────────────────────────┼──────────────────┤
│  translations/codeExamples/reacti18next/locales/en/translation.json  │  format.ebook    │
│  translations/codeExamples/reacti18next/locales/en/translation.json  │  nonExistentKey  │
└──────────────────────────────────────────────────────────────────────┴──────────────────┘

Found undefined keys!
┌──────────────────────────────────────────────────────┬────────────────────────────────┐
│ file                                                 │ key                            │
├──────────────────────────────────────────────────────┼────────────────────────────────┤
│  translations/codeExamples/reacti18next/src/App.tsx  │  some.key.that.is.not.defined  │
└──────────────────────────────────────────────────────┴────────────────────────────────┘

`);
          done();
        }
      );
    });

    it("should find unused and undefined keys for react-intl applications", (done) => {
      exec(
        "node dist/bin/index.js --source en-US --locales translations/codeExamples/react-intl/locales -f react-intl -u translations/codeExamples/react-intl/src",
        (_error, stdout, _stderr) => {
          const result = stdout.split("Done")[0];
          expect(result).toEqual(`i18n translations checker
Source: en-US
Selected format is: react-intl

No missing keys found!

No invalid translations found!

Found unused keys!
┌─────────────────────────────────────────────────────────────────┬─────────────────────────┐
│ file                                                            │ key                     │
├─────────────────────────────────────────────────────────────────┼─────────────────────────┤
│  translations/codeExamples/react-intl/locales/en-US/one.json    │  message.number-format  │
│  translations/codeExamples/react-intl/locales/en-US/three.json  │  multipleVariables      │
└─────────────────────────────────────────────────────────────────┴─────────────────────────┘

Found undefined keys!
┌────────────────────────────────────────────────────┬────────────────────────────────┐
│ file                                               │ key                            │
├────────────────────────────────────────────────────┼────────────────────────────────┤
│  translations/codeExamples/react-intl/src/App.tsx  │  some.key.that.is.not.defined  │
└────────────────────────────────────────────────────┴────────────────────────────────┘

`);
          done();
        }
      );
    });

    it("should find unused and undefined keys for next-intl applications", (done) => {
      exec(
        "node dist/bin/index.js --source en --locales translations/codeExamples/next-intl/locales/ -f next-intl -u translations/codeExamples/next-intl/src",
        (_error, stdout, _stderr) => {
          const result = stdout.split("Done")[0];
          expect(result).toEqual(`i18n translations checker
Source: en
Selected format is: next-intl

No missing keys found!

No invalid translations found!

Found unused keys!
┌───────────────────────────────────────────────────────────────────┬──────────────────┐
│ file                                                              │ key              │
├───────────────────────────────────────────────────────────────────┼──────────────────┤
│  translations/codeExamples/next-intl/locales/en/translation.json  │  message.plural  │
│  translations/codeExamples/next-intl/locales/en/translation.json  │  notUsedKey      │
└───────────────────────────────────────────────────────────────────┴──────────────────┘

Found undefined keys!
┌──────────────────────────────────────────────────────────────────┬───────────────────┐
│ file                                                             │ key               │
├──────────────────────────────────────────────────────────────────┼───────────────────┤
│  translations/codeExamples/next-intl/src/StrictTypesExample.tsx  │  About.unknown    │
│  translations/codeExamples/next-intl/src/StrictTypesExample.tsx  │  About.unknown    │
│  translations/codeExamples/next-intl/src/StrictTypesExample.tsx  │  Test.title       │
│  translations/codeExamples/next-intl/src/StrictTypesExample.tsx  │  Test.title       │
│  translations/codeExamples/next-intl/src/StrictTypesExample.tsx  │  title            │
│  translations/codeExamples/next-intl/src/StrictTypesExample.tsx  │  title            │
│  translations/codeExamples/next-intl/src/StrictTypesExample.tsx  │  unknown          │
│  translations/codeExamples/next-intl/src/StrictTypesExample.tsx  │  unknown          │
│  translations/codeExamples/next-intl/src/StrictTypesExample.tsx  │  unknown.unknown  │
│  translations/codeExamples/next-intl/src/StrictTypesExample.tsx  │  unknown.unknown  │
│  translations/codeExamples/next-intl/src/Basic.tsx               │  message.select   │
└──────────────────────────────────────────────────────────────────┴───────────────────┘

`);
          done();
        }
      );
    });
  });

  describe("YAML", () => {
    it("should return the missing keys for single folder translations", (done) => {
      exec(
        "node dist/bin/index.js -s en-US -l translations/yaml/flattenExamples",
        (_error, stdout, _stderr) => {
          const result = stdout.split("Done")[0];
          expect(result).toEqual(`i18n translations checker
Source: en-US

Found missing keys!
┌────────────────────────────────────────────────┬────────────────────────────────┐
│ file                                           │ key                            │
├────────────────────────────────────────────────┼────────────────────────────────┤
│  translations/yaml/flattenExamples/de-de.yaml  │  other.nested.three            │
│  translations/yaml/flattenExamples/de-de.yaml  │  other.nested.deep.more.final  │
└────────────────────────────────────────────────┴────────────────────────────────┘

No invalid translations found!

`);
          done();
        }
      );
    });

    it("should return the missing/invalid keys for folder per locale with single file", (done) => {
      exec(
        "node dist/bin/index.js -l translations/yaml/folderExample/ -s en-US",
        (_error, stdout, _stderr) => {
          const result = stdout.split("Done")[0];
          expect(result).toEqual(`i18n translations checker
Source: en-US

Found missing keys!
┌────────────────────────────────────────────────────┬───────────────────────┐
│ file                                               │ key                   │
├────────────────────────────────────────────────────┼───────────────────────┤
│  translations/yaml/folderExample/de-DE/index.yaml  │  message.text-format  │
└────────────────────────────────────────────────────┴───────────────────────┘

Found invalid keys!
┌────────────────────────────────────────────────────┬──────────────────┐
│ file                                               │ key              │
├────────────────────────────────────────────────────┼──────────────────┤
│  translations/yaml/folderExample/de-DE/index.yaml  │  message.select  │
└────────────────────────────────────────────────────┴──────────────────┘

`);
          done();
        }
      );
    });

    it("should return the missing/invalid keys for folder per locale with multiple files", (done) => {
      exec(
        "node dist/bin/index.js -l translations/yaml/multipleFilesFolderExample/ -s en-US",
        (_error, stdout, _stderr) => {
          const result = stdout.split("Done")[0];
          expect(result).toEqual(`i18n translations checker
Source: en-US

Found missing keys!
┌───────────────────────────────────────────────────────────────┬───────────────────────┐
│ file                                                          │ key                   │
├───────────────────────────────────────────────────────────────┼───────────────────────┤
│  translations/yaml/multipleFilesFolderExample/de-DE/one.yaml  │  message.text-format  │
│  translations/yaml/multipleFilesFolderExample/de-DE/two.yaml  │  test.drive.four      │
└───────────────────────────────────────────────────────────────┴───────────────────────┘

Found invalid keys!
┌─────────────────────────────────────────────────────────────────┬─────────────────────┐
│ file                                                            │ key                 │
├─────────────────────────────────────────────────────────────────┼─────────────────────┤
│  translations/yaml/multipleFilesFolderExample/de-DE/one.yaml    │  message.select     │
│  translations/yaml/multipleFilesFolderExample/de-DE/three.yaml  │  multipleVariables  │
└─────────────────────────────────────────────────────────────────┴─────────────────────┘

`);
          done();
        }
      );
    });

    it("should return the missing/invalid keys for folder containing multiple locale folders", (done) => {
      exec(
        "node dist/bin/index.js -l translations/yaml/multipleFoldersExample -s en-US",
        (_error, stdout, _stderr) => {
          const result = stdout.split("Done")[0];
          expect(result).toEqual(`i18n translations checker
Source: en-US

Found missing keys!
┌────────────────────────────────────────────────────────────────────────────┬───────────────────────┐
│ file                                                                       │ key                   │
├────────────────────────────────────────────────────────────────────────────┼───────────────────────┤
│  translations/yaml/multipleFoldersExample/spaceOne/locales/de-DE/one.yaml  │  message.text-format  │
│  translations/yaml/multipleFoldersExample/spaceOne/locales/de-DE/two.yaml  │  test.drive.four      │
│  translations/yaml/multipleFoldersExample/spaceTwo/locales/de-DE/one.yaml  │  message.plural       │
│  translations/yaml/multipleFoldersExample/spaceTwo/locales/de-DE/two.yaml  │  test.drive.two       │
└────────────────────────────────────────────────────────────────────────────┴───────────────────────┘

Found invalid keys!
┌──────────────────────────────────────────────────────────────────────────────┬───────────────────────┐
│ file                                                                         │ key                   │
├──────────────────────────────────────────────────────────────────────────────┼───────────────────────┤
│  translations/yaml/multipleFoldersExample/spaceOne/locales/de-DE/one.yaml    │  message.select       │
│  translations/yaml/multipleFoldersExample/spaceOne/locales/de-DE/three.yaml  │  multipleVariables    │
│  translations/yaml/multipleFoldersExample/spaceTwo/locales/de-DE/one.yaml    │  message.text-format  │
│  translations/yaml/multipleFoldersExample/spaceTwo/locales/de-DE/three.yaml  │  numberFormat         │
└──────────────────────────────────────────────────────────────────────────────┴───────────────────────┘

`);
          done();
        }
      );
    });

    it("should return the missing/invalid keys for multiple locale folders", (done) => {
      exec(
        "node dist/bin/index.js -l translations/yaml/multipleFoldersExample/spaceOne translations/yaml/multipleFoldersExample/spaceTwo -s en-US",
        (_error, stdout, _stderr) => {
          const result = stdout.split("Done")[0];
          expect(result).toEqual(`i18n translations checker
Source: en-US

Found missing keys!
┌────────────────────────────────────────────────────────────────────────────┬───────────────────────┐
│ file                                                                       │ key                   │
├────────────────────────────────────────────────────────────────────────────┼───────────────────────┤
│  translations/yaml/multipleFoldersExample/spaceOne/locales/de-DE/one.yaml  │  message.text-format  │
│  translations/yaml/multipleFoldersExample/spaceOne/locales/de-DE/two.yaml  │  test.drive.four      │
│  translations/yaml/multipleFoldersExample/spaceTwo/locales/de-DE/one.yaml  │  message.plural       │
│  translations/yaml/multipleFoldersExample/spaceTwo/locales/de-DE/two.yaml  │  test.drive.two       │
└────────────────────────────────────────────────────────────────────────────┴───────────────────────┘

Found invalid keys!
┌──────────────────────────────────────────────────────────────────────────────┬───────────────────────┐
│ file                                                                         │ key                   │
├──────────────────────────────────────────────────────────────────────────────┼───────────────────────┤
│  translations/yaml/multipleFoldersExample/spaceOne/locales/de-DE/one.yaml    │  message.select       │
│  translations/yaml/multipleFoldersExample/spaceOne/locales/de-DE/three.yaml  │  multipleVariables    │
│  translations/yaml/multipleFoldersExample/spaceTwo/locales/de-DE/one.yaml    │  message.text-format  │
│  translations/yaml/multipleFoldersExample/spaceTwo/locales/de-DE/three.yaml  │  numberFormat         │
└──────────────────────────────────────────────────────────────────────────────┴───────────────────────┘

`);
          done();
        }
      );
    });

    it("should return the missing/invalid keys for all files in the provided locale folders", (done) => {
      exec(
        "node dist/bin/index.js --source en-US --locales translations/yaml/flattenExamples translations/yaml/messageExamples",
        (_error, stdout, _stderr) => {
          const result = stdout.split("Done")[0];
          expect(result).toEqual(`i18n translations checker
Source: en-US

Found missing keys!
┌────────────────────────────────────────────────┬────────────────────────────────┐
│ file                                           │ key                            │
├────────────────────────────────────────────────┼────────────────────────────────┤
│  translations/yaml/flattenExamples/de-de.yaml  │  other.nested.three            │
│  translations/yaml/flattenExamples/de-de.yaml  │  other.nested.deep.more.final  │
│  translations/yaml/messageExamples/de-de.yaml  │  richText                      │
│  translations/yaml/messageExamples/de-de.yaml  │  yo                            │
│  translations/yaml/messageExamples/de-de.yaml  │  nesting1                      │
│  translations/yaml/messageExamples/de-de.yaml  │  nesting2                      │
│  translations/yaml/messageExamples/de-de.yaml  │  nesting3                      │
│  translations/yaml/messageExamples/de-de.yaml  │  key1                          │
└────────────────────────────────────────────────┴────────────────────────────────┘

Found invalid keys!
┌────────────────────────────────────────────────┬─────────────────────┐
│ file                                           │ key                 │
├────────────────────────────────────────────────┼─────────────────────┤
│  translations/yaml/messageExamples/de-de.yaml  │  multipleVariables  │
└────────────────────────────────────────────────┴─────────────────────┘

`);
          done();
        }
      );
    });

    it("should return the missing/invalid keys for all files with source matching folder and source matching file", (done) => {
      exec(
        "node dist/bin/index.js -l translations/yaml/multipleFilesFolderExample translations/yaml/flattenExamples -s en-US",
        (_error, stdout, _stderr) => {
          const result = stdout.split("Done")[0];
          expect(result).toEqual(`i18n translations checker
Source: en-US

Found missing keys!
┌───────────────────────────────────────────────────────────────┬────────────────────────────────┐
│ file                                                          │ key                            │
├───────────────────────────────────────────────────────────────┼────────────────────────────────┤
│  translations/yaml/flattenExamples/de-de.yaml                 │  other.nested.three            │
│  translations/yaml/flattenExamples/de-de.yaml                 │  other.nested.deep.more.final  │
│  translations/yaml/multipleFilesFolderExample/de-DE/one.yaml  │  message.text-format           │
│  translations/yaml/multipleFilesFolderExample/de-DE/two.yaml  │  test.drive.four               │
└───────────────────────────────────────────────────────────────┴────────────────────────────────┘

Found invalid keys!
┌─────────────────────────────────────────────────────────────────┬─────────────────────┐
│ file                                                            │ key                 │
├─────────────────────────────────────────────────────────────────┼─────────────────────┤
│  translations/yaml/multipleFilesFolderExample/de-DE/one.yaml    │  message.select     │
│  translations/yaml/multipleFilesFolderExample/de-DE/three.yaml  │  multipleVariables  │
└─────────────────────────────────────────────────────────────────┴─────────────────────┘

`);
          done();
        }
      );
    });
  });
});
