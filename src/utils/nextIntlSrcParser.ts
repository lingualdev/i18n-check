import fs from "node:fs";
import * as ts from "typescript";

const USE_TRANSLATIONS = "useTranslations";
const GET_TRANSLATIONS = "getTranslations";
const COMMENT_CONTAINS_STATIC_KEY_REGEX = /t\((["'])(.*?[^\\])(["'])\)/;

export const extract = (filesPaths: string[]) => {
  return filesPaths.flatMap(getKeys).sort((a, b) => {
    return a > b ? 1 : -1;
  });
};

const getKeys = (path: string) => {
  const content = fs.readFileSync(path, "utf-8");
  const sourceFile = ts.createSourceFile(
    path,
    content,
    ts.ScriptTarget.Latest,
    true
  );

  const foundKeys: { key: string; meta: { file: string } }[] = [];
  let namespaces: string[] = [];
  let variable = "t";

  const getCurrentNamespace = () => {
    if (namespaces.length > 0) {
      return namespaces[namespaces.length - 1];
    }
    return null;
  };

  const pushNamespace = (name: string) => {
    namespaces.push(name);
  };

  const removeNamespace = () => {
    if (namespaces.length > 0) {
      namespaces.pop();
    }
  };

  const visit = (node: ts.Node) => {
    let key: string | null = null;
    let current = namespaces.length;

    if (node === undefined) {
      return;
    }

    if (ts.isVariableDeclaration(node)) {
      if (node.initializer && ts.isCallExpression(node.initializer)) {
        if (ts.isIdentifier(node.initializer.expression)) {
          // Search for `useTranslations` calls and extract the namespace
          // Additionally check for assigned variable name, as it might differ
          // from the default `t`, i.e.: const other = useTranslations("namespace1");
          if (node.initializer.expression.text === USE_TRANSLATIONS) {
            const [argument] = node.initializer.arguments;
            if (argument && ts.isStringLiteral(argument)) {
              pushNamespace(argument.text);
            } else if (argument === undefined) {
              pushNamespace("");
            }
            if (ts.isIdentifier(node.name)) {
              variable = node.name.text;
            }
          }
        }
      }

      // Search for `getTranslations` calls and extract the namespace
      // There are two different ways `getTranslations` can be used:
      //
      // import {getTranslations} from 'next-intl/server';
      // const t = await getTranslations(namespace?);
      // const t = await getTranslations({locale, namespace});
      //
      // Additionally check for assigned variable name, as it might differ
      // from the default `t`, i.e.: const other = getTranslations("namespace1");
      // Simplified usage in async components
      if (node.initializer && ts.isAwaitExpression(node.initializer)) {
        if (
          ts.isCallExpression(node.initializer.expression) &&
          ts.isIdentifier(node.initializer.expression.expression)
        ) {
          if (
            node.initializer.expression.expression.text === GET_TRANSLATIONS
          ) {
            const [argument] = node.initializer.expression.arguments;
            if (argument && ts.isObjectLiteralExpression(argument)) {
              argument.properties.forEach((property) => {
                if (
                  property &&
                  ts.isPropertyAssignment(property) &&
                  property.name &&
                  ts.isIdentifier(property.name) &&
                  property.name.text === "namespace" &&
                  ts.isStringLiteral(property.initializer)
                ) {
                  pushNamespace(property.initializer.text);
                }
              });
            } else if (argument && ts.isStringLiteral(argument)) {
              pushNamespace(argument.text);
            } else if (argument === undefined) {
              pushNamespace("");
            }

            if (ts.isIdentifier(node.name)) {
              variable = node.name.text;
            }
          }
        }
      }
    }

    // Search for `t()` calls
    if (
      getCurrentNamespace() !== null &&
      ts.isCallExpression(node) &&
      ts.isIdentifier(node.expression)
    ) {
      const expressionName = node.expression.text;
      if (expressionName === variable) {
        const [argument] = node.arguments;
        if (argument && ts.isStringLiteral(argument)) {
          key = argument.text;
        }
      }
    }

    // Search for `t.*()` calls, i.e. t.html() or t.rich()
    if (
      getCurrentNamespace() !== null &&
      ts.isCallExpression(node) &&
      ts.isPropertyAccessExpression(node.expression) &&
      ts.isIdentifier(node.expression.expression)
    ) {
      const expressionName = node.expression.expression.text;
      if (expressionName === variable) {
        const [argument] = node.arguments;
        if (argument && ts.isStringLiteral(argument)) {
          key = argument.text;
        }
      }
    }

    if (key) {
      const namespace = getCurrentNamespace();
      foundKeys.push({
        key: namespace ? `${namespace}.${key}` : key,
        meta: { file: path },
      });
    }

    // Search for single-line comments that contain the static values of a dynamic key
    // Example:
    // const someKeys = messages[selectedOption];
    // Define as a single-line comment all the possible static keys for that dynamic key
    // t('some.static.key.we.want.to.extract');
    // t('some.other.key.we.want.to.extract.without.semicolons')
    const commentRanges = ts.getLeadingCommentRanges(
      sourceFile.getFullText(),
      node.getFullStart()
    );

    if (commentRanges?.length && commentRanges.length > 0) {
      commentRanges.forEach((range) => {
        const comment = sourceFile.getFullText().slice(range.pos, range.end);
        // parse the string and check if it includes the following format:
        // t('someString')
        const hasStaticKeyComment =
          COMMENT_CONTAINS_STATIC_KEY_REGEX.test(comment);

        if (hasStaticKeyComment) {
          // capture the string comment
          const commentKey =
            COMMENT_CONTAINS_STATIC_KEY_REGEX.exec(comment)?.[2];
          if (commentKey) {
            const namespace = getCurrentNamespace();
            foundKeys.push({
              key: namespace ? `${namespace}.${commentKey}` : commentKey,
              meta: { file: path },
            });
          }
        }
      });
    }

    ts.forEachChild(node, visit);

    if (ts.isFunctionLike(node) && namespaces.length > current) {
      removeNamespace();
    }
  };

  ts.forEachChild(sourceFile, visit);

  return foundKeys;
};
