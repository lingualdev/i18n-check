import { exec } from "child_process";

describe("CLI", () => {
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

  it("should return the missing and invalid keys for folder per locale with single file", (done) => {
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

  it("should return the missing and invalid keys for folder per locale with multiple files", (done) => {
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
│  translations/multipleFilesFolderExample/de-DE/two.json  │  test.drive.four      │
│  translations/multipleFilesFolderExample/de-DE/one.json  │  message.text-format  │
└──────────────────────────────────────────────────────────┴───────────────────────┘



Found invalid keys!
┌────────────────────────────────────────────────────────────┬─────────────────────┐
│ file                                                       │ key                 │
├────────────────────────────────────────────────────────────┼─────────────────────┤
│  translations/multipleFilesFolderExample/de-DE/three.json  │  multipleVariables  │
│  translations/multipleFilesFolderExample/de-DE/one.json    │  message.select     │
└────────────────────────────────────────────────────────────┴─────────────────────┘



`);
        done();
      }
    );
  });

  it("should return the missing keys for all files in the provided locale folders", (done) => {
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
});
