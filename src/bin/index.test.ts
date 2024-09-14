import { exec } from "child_process";

describe("CLI", () => {
  it("should return the missing keys for single folder translations", (done) => {
    exec(
      "node dist/bin/index.js -s translations/flattenExamples/en-us.json -t translations/flattenExamples",
      (_error, stdout, _stderr) => {
        const result = stdout.split("Done")[0];
        expect(result).toEqual(`i18n translations checker
Source file(s): translations/flattenExamples/en-us.json

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
      "node dist/bin/index.js -t translations/folderExample/ -s translations/folderExample/en-US/",
      (_error, stdout, _stderr) => {
        const result = stdout.split("Done")[0];
        expect(result).toEqual(`i18n translations checker
Source file(s): translations/folderExample/en-US/

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
      "node dist/bin/index.js -t translations/multipleFilesFolderExample/ -s translations/multipleFilesFolderExample/en-US/",
      (_error, stdout, _stderr) => {
        const result = stdout.split("Done")[0];
        expect(result).toEqual(`i18n translations checker
Source file(s): translations/multipleFilesFolderExample/en-US/

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
});
