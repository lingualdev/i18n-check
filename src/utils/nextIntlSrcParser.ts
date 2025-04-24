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

  type Namespace = { name: string; variable: string };
  const foundKeys: { key: string; meta: { file: string } }[] = [];
  let namespaces: Namespace[] = [];

  const getCurrentNamespaces = (range = 1) => {
    if (namespaces.length > 0) {
      return namespaces.slice(namespaces.length - range);
    }
    return null;
  };

  const getCurrentNamespaceForIdentifier = (name: string) => {
    return [...namespaces].reverse().find((namespace) => {
      return namespace.variable === name;
    });
  };

  const pushNamespace = (namespace: Namespace) => {
    namespaces.push(namespace);
  };

  const removeNamespaces = (range = 1) => {
    if (namespaces.length > 0) {
      namespaces = namespaces.slice(0, namespaces.length - range);
    }
  };

  const visit = (node: ts.Node) => {
    let key: { name: string; identifier: string } | null = null;
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

            const variable = ts.isIdentifier(node.name) ? node.name.text : "t";
            if (argument && ts.isStringLiteral(argument)) {
              pushNamespace({ name: argument.text, variable });
            } else if (argument === undefined) {
              pushNamespace({ name: "", variable });
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
            const variable = ts.isIdentifier(node.name) ? node.name.text : "t";
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
                  pushNamespace({ name: property.initializer.text, variable });
                }
              });
            } else if (argument && ts.isStringLiteral(argument)) {
              pushNamespace({ name: argument.text, variable });
            } else if (argument === undefined) {
              pushNamespace({ name: "", variable });
            }
          }
        }
      }
    }

    // Search for direct inline calls and extract namespace and key
    //
    // useTranslations("ns1")("one")
    // useTranslations("ns1").rich("one");
    // useTranslations("ns1").raw("one");
    if (ts.isExpressionStatement(node)) {
      let inlineNamespace = null;
      if (node.expression && ts.isCallExpression(node.expression)) {
        // Search: useTranslations("ns1")("one")
        if (
          ts.isCallExpression(node.expression.expression) &&
          ts.isIdentifier(node.expression.expression.expression)
        ) {
          if (node.expression.expression.expression.text === USE_TRANSLATIONS) {
            const [argument] = node.expression.expression.arguments;
            if (argument && ts.isStringLiteral(argument)) {
              inlineNamespace = argument.text;
            }
          }
        }
        // Search: useTranslations("ns1").*("one")
        if (
          ts.isPropertyAccessExpression(node.expression.expression) &&
          ts.isCallExpression(node.expression.expression.expression) &&
          ts.isIdentifier(node.expression.expression.expression.expression)
        ) {
          if (
            node.expression.expression.expression.expression.text ===
            USE_TRANSLATIONS
          ) {
            const [argument] = node.expression.expression.expression.arguments;
            if (argument && ts.isStringLiteral(argument)) {
              inlineNamespace = argument.text;
            }

            const [callArgument] = node.expression.arguments;
            if (callArgument && ts.isStringLiteral(callArgument)) {
              const key = callArgument.text;
              if (key) {
                foundKeys.push({
                  key: inlineNamespace ? `${inlineNamespace}.${key}` : key,
                  meta: { file: path },
                });
              }
            }
          }
        }
      }
    }

    // Search for `t()` calls
    if (
      getCurrentNamespaces() !== null &&
      ts.isCallExpression(node) &&
      ts.isIdentifier(node.expression)
    ) {
      const expressionName = node.expression.text;
      const namespace = getCurrentNamespaceForIdentifier(expressionName);
      if (namespace) {
        const [argument] = node.arguments;
        if (argument && ts.isStringLiteral(argument)) {
          key = { name: argument.text, identifier: expressionName };
        }
      }
    }

    // Search for `t.*()` calls, i.e. t.html() or t.rich()
    if (
      getCurrentNamespaces() !== null &&
      ts.isCallExpression(node) &&
      ts.isPropertyAccessExpression(node.expression) &&
      ts.isIdentifier(node.expression.expression)
    ) {
      const expressionName = node.expression.expression.text;
      const namespace = getCurrentNamespaceForIdentifier(expressionName);
      if (namespace) {
        const [argument] = node.arguments;
        if (argument && ts.isStringLiteral(argument)) {
          key = { name: argument.text, identifier: expressionName };
        }
      }
    }

    if (key) {
      const namespace = getCurrentNamespaceForIdentifier(key.identifier);
      const namespaceName = namespace ? namespace.name : "";
      foundKeys.push({
        key: namespaceName ? `${namespaceName}.${key.name}` : key.name,
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
            const namespace = getCurrentNamespaces();
            const namespaceName = namespace ? namespace[0]?.name : "";

            foundKeys.push({
              key: namespaceName
                ? `${namespaceName}.${commentKey}`
                : commentKey,
              meta: { file: path },
            });
          }
        }
      });
    }

    ts.forEachChild(node, visit);

    if (ts.isFunctionLike(node) && namespaces.length > current) {
      removeNamespaces(namespaces.length - current);
    }
  };

  ts.forEachChild(sourceFile, visit);

  return foundKeys;
};
