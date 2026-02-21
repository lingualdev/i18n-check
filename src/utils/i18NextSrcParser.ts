/**
 *
 * Based on the original [i18next-parser](https://github.com/i18next/i18next-parser)
 *
 */

import * as ts from 'typescript';

const USE_TRANSLATION = 'useTranslation';
const WITH_TRANSLATION = 'withTranslation';
const TRANSLATION_TYPE = 'TFunction';

type Options = {
  attr: string;
  componentFunctions: string[];
  functions: string[];
  namespaceFunctions: string[];
  parseGenerics: boolean;
  transSupportBasicHtmlNodes: boolean;
  transIdentityFunctionsToIgnore: string[];
  typeMap: Record<string, unknown>;
  translationFunctionsWithArgs: Record<
    string,
    {
      pos: number;
      storeGlobally: boolean;
      keyPrefix?: string;
      ns?: string;
    }
  >;
  keyPrefix?: string;
  defaultNamespace?: string;
  transKeepBasicHtmlNodesFor: string[];
  omitAttributes: string[];
};

type FoundKey = {
  key: string;
  ns?: string;
  namespace?: string;
  functionName?: string;
  defaultValue?: string;
  [key: string]: unknown;
};

export const getKeys = (
  path: string,
  options: Partial<Options>,
  content: string
) => {
  const sourceFile = ts.createSourceFile(
    path,
    content,
    ts.ScriptTarget.Latest,
    true
  );

  const defaultOptions: Options = {
    attr: 'i18nKey',
    componentFunctions: ['Trans'],
    functions: ['t'],
    namespaceFunctions: [USE_TRANSLATION, WITH_TRANSLATION],
    parseGenerics: false,
    transSupportBasicHtmlNodes: false,
    transIdentityFunctionsToIgnore: [],
    typeMap: {},
    translationFunctionsWithArgs: {},
    transKeepBasicHtmlNodesFor: ['br', 'strong', 'i', 'p'],
    omitAttributes: ['ns', 'defaults'],
  };

  const parserOptions = { ...defaultOptions, ...options };
  parserOptions.omitAttributes = [
    parserOptions.attr,
    ...parserOptions.omitAttributes,
  ];

  let foundKeys: FoundKey[] = [];

  const visit = (node: ts.Node) => {
    if (ts.isVariableDeclaration(node)) {
      extractFromVariableDeclaration(node, parserOptions);
    }

    if (ts.isCallExpression(node)) {
      const keys = extractFromExpression(node, parserOptions);
      if (keys) {
        foundKeys = foundKeys.concat(keys);
      }
    }

    if (ts.isTaggedTemplateExpression(node)) {
      const key = extractFromTaggedTemplateExpression(node, parserOptions);
      if (key) {
        foundKeys.push(key);
      }
    }

    if (ts.isJsxElement(node) || ts.isJsxSelfClosingElement(node)) {
      const key = extractFromJsx(node, content, parserOptions);
      if (key) {
        foundKeys.push(key);
      }
    }

    if (ts.isArrowFunction(node) || ts.isFunctionDeclaration(node)) {
      extractFromFunction(node, parserOptions);
    }

    // Collect all keys defined in comments
    const commentKeys: FoundKey[] = [];
    ts.forEachLeadingCommentRange(
      content,
      node.getFullStart(),
      (pos, end, kind) => {
        if (
          kind === ts.SyntaxKind.MultiLineCommentTrivia ||
          kind === ts.SyntaxKind.SingleLineCommentTrivia
        ) {
          const text = content.slice(pos, end);
          const functionPattern =
            '(?:' + parserOptions.functions.join('|').replace('.', '\\.') + ')';

          const callPattern = '(?<=^|\\s|\\.)' + functionPattern + '\\(.*\\)';
          const regexp = new RegExp(callPattern, 'g');
          const expressions = text.match(regexp);

          if (!expressions) {
            return null;
          }

          const foundKeys: FoundKey[] = [];
          expressions.forEach((expression) => {
            const expressionKeys = getKeys('', {}, expression);
            if (expressionKeys) {
              commentKeys.push(...expressionKeys);
            }
          });
          if (foundKeys) {
            commentKeys.push(...foundKeys);
          }
        }
      }
    );
    if (commentKeys) {
      commentKeys.forEach((key) => {
        if (!foundKeys.find((k) => k.key === key.key)) {
          foundKeys.push(key);
        }
      });
    }

    ts.forEachChild(node, visit);
  };

  ts.forEachChild(sourceFile, visit);

  return foundKeys;
};

// Taken from: https://github.com/i18next/i18next-parser/blob/6c10a2b66ebadb8250039d078ad2a53e52753a6e/src/lexers/jsx-lexer.js#L74
const extractFromJsx = (
  node: ts.JsxElement | ts.JsxSelfClosingElement,
  content: string,
  options: Options
) => {
  const tagNode = ts.isJsxElement(node) ? node.openingElement : node;

  const getKey = (node: ts.JsxSelfClosingElement | ts.JsxOpeningElement) =>
    getPropertyValue(node, options.attr);

  if (options.componentFunctions.includes(expressionToName(tagNode.tagName))) {
    const entry: FoundKey = { key: getKey(tagNode) ?? '' };

    const namespace = getPropertyValue(tagNode, 'ns');
    if (namespace) {
      entry.namespace = namespace;
    }

    tagNode.attributes.properties.forEach((property) => {
      if (property.kind === ts.SyntaxKind.JsxSpreadAttribute) {
        return;
      }

      const propertyName = property.name.getText();

      if (options.omitAttributes.includes(propertyName)) {
        return;
      }

      if (property.initializer) {
        if (
          ts.isJsxExpression(property.initializer) &&
          property.initializer.expression
        ) {
          if (
            property.initializer.expression.kind === ts.SyntaxKind.TrueKeyword
          ) {
            entry[propertyName] = true;
          } else if (
            property.initializer.expression.kind === ts.SyntaxKind.FalseKeyword
          ) {
            entry[propertyName] = false;
          } else {
            entry[propertyName] = `{${cleanMultiLineCode(
              content.slice(
                property.initializer.expression.pos,
                property.initializer.expression.end
              )
            )}}`;
          }
        } else if (ts.isStringLiteral(property.initializer)) {
          entry[propertyName] = property.initializer.text;
        }
      } else {
        entry[propertyName] = true;
      }
    });

    const nodeAsString = nodeToString(node, content, options);
    const defaultsProp = getPropertyValue(tagNode, 'defaults');
    let defaultValue = defaultsProp || nodeAsString;

    if (entry.shouldUnescape !== true) {
      defaultValue = unescape(defaultValue);
    }
    if (defaultValue !== '') {
      entry.defaultValue = defaultValue;

      if (!entry.key) {
        entry.key = unescape(nodeAsString) || entry.defaultValue || '';
      }
    }

    return entry.key ? entry : null;
  } else if (tagNode.tagName.getText() === 'Interpolate') {
    const entry: FoundKey = { key: getKey(tagNode) ?? '' };
    return entry.key ? entry : null;
  } else if (tagNode.tagName.getText() === 'Translation') {
    const namespace = getPropertyValue(tagNode, 'ns');
    if (namespace) {
      options.defaultNamespace = namespace;
    }
  }
};

// Taken from: https://github.com/i18next/i18next-parser/blob/6c10a2b66ebadb8250039d078ad2a53e52753a6e/src/lexers/jsx-lexer.js#L77
const getPropertyValue = (
  node: ts.JsxSelfClosingElement | ts.JsxOpeningElement,
  attr: string
) => {
  const attribute = node.attributes.properties.find(
    (attribute: ts.JsxAttributeLike) => {
      return attribute.name !== undefined && attribute.name.getText() === attr;
    }
  );

  if (!attribute) {
    return undefined;
  }

  if (
    !ts.isJsxAttribute(attribute) ||
    !attribute.initializer ||
    (ts.isJsxExpression(attribute.initializer) &&
      attribute.initializer?.expression &&
      ts.isIdentifier(attribute.initializer?.expression))
  ) {
    return undefined;
  }

  if (ts.isStringLiteral(attribute.initializer)) {
    return attribute.initializer.text;
  }

  if (
    ts.isJsxExpression(attribute.initializer) &&
    attribute.initializer?.expression &&
    (ts.isStringLiteral(attribute.initializer?.expression) ||
      ts.isNoSubstitutionTemplateLiteral(attribute.initializer.expression))
  ) {
    return attribute.initializer.expression.text;
  }

  return undefined;
};

// Taken from: https://github.com/i18next/i18next-parser/blob/6c10a2b66ebadb8250039d078ad2a53e52753a6e/src/lexers/javascript-lexer.js#L165
const extractFromTaggedTemplateExpression = (
  node: ts.TaggedTemplateExpression,
  options: Options
): FoundKey | undefined => {
  const { tag, template } = node;

  if (
    !options.functions.includes(tag.getText()) &&
    !(
      ts.isPropertyAccessExpression(tag) &&
      options.functions.includes(tag.name.text)
    )
  ) {
    return undefined;
  }

  if (ts.isNoSubstitutionTemplateLiteral(template)) {
    return { key: template.text };
  }

  return undefined;
};

// Taken from: https://github.com/i18next/i18next-parser/blob/6c10a2b66ebadb8250039d078ad2a53e52753a6e/src/lexers/javascript-lexer.js#L75
const extractFromVariableDeclaration = (
  node: ts.VariableDeclaration,
  options: Options
) => {
  if (ts.isIdentifier(node.name)) {
    return undefined;
  }
  const [firstElement] = node.name.elements;

  if (!ts.isBindingElement(firstElement)) {
    return undefined;
  }
  const firstElementName = firstElement?.propertyName ?? firstElement.name;

  if (
    hasEscapedText(firstElementName) &&
    firstElementName?.escapedText === 't' &&
    hasEscapedText(firstElement.name) &&
    options.functions.includes(firstElement?.name?.escapedText.toString()) &&
    node.initializer &&
    ts.isCallExpression(node.initializer) &&
    ts.isIdentifier(node.initializer.expression) &&
    options.namespaceFunctions.includes(
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      node.initializer?.expression?.escapedText
    )
  ) {
    options.translationFunctionsWithArgs[
      firstElement.name.escapedText.toString()
    ] = {
      pos: node.initializer.pos,
      storeGlobally: !(
        firstElement.propertyName &&
        hasEscapedText(firstElement.propertyName) &&
        firstElement.propertyName?.escapedText
      ),
    };
  }
};

// Taken from: https://github.com/i18next/i18next-parser/blob/6c10a2b66ebadb8250039d078ad2a53e52753a6e/src/lexers/javascript-lexer.js#L138
const extractFromFunction = (
  node: ts.FunctionLikeDeclaration,
  options: Options
) => {
  const tFnParam =
    node.parameters &&
    node.parameters.find(
      (param) =>
        param.name &&
        ts.isIdentifier(param.name) &&
        options.functions.includes(param.name.text)
    );

  if (
    tFnParam &&
    tFnParam.type &&
    ts.isTypeReferenceNode(tFnParam.type) &&
    tFnParam.type.typeName &&
    ts.isIdentifier(tFnParam.type.typeName) &&
    tFnParam.type.typeName.text === TRANSLATION_TYPE
  ) {
    if (tFnParam.type.typeArguments && tFnParam.type.typeArguments.length > 0) {
      const [firstArgument] = tFnParam.type.typeArguments;

      if (
        ts.isLiteralTypeNode(firstArgument) &&
        ts.isStringLiteral(firstArgument.literal)
      ) {
        options.defaultNamespace = firstArgument.literal.text;
      }
    }
  }
};

// Taken from: https://github.com/i18next/i18next-parser/blob/6c10a2b66ebadb8250039d078ad2a53e52753a6e/src/lexers/javascript-lexer.js#L189
const extractFromExpression = (node: ts.CallExpression, options: Options) => {
  const entries: FoundKey[] = [{ key: '' }];

  const functionDefinition = Object.entries(
    options.translationFunctionsWithArgs
  ).find(([_name, translationFunc]) => translationFunc?.pos === node.pos);
  let storeGlobally = functionDefinition?.[1].storeGlobally ?? true;

  const isNamespaceFunction =
    (ts.isIdentifier(node.expression) &&
      node.expression.escapedText &&
      options.namespaceFunctions.includes(node.expression.escapedText)) ||
    options.namespaceFunctions.includes(expressionToName(node.expression));

  if (isNamespaceFunction && node.arguments.length > 0) {
    storeGlobally =
      storeGlobally ||
      (hasEscapedText(node.expression) &&
        node.expression.escapedText === WITH_TRANSLATION);
    const [namespaceArgument, optionsArgument] = node.arguments;

    const namespaces = ts.isArrayLiteralExpression(namespaceArgument)
      ? namespaceArgument.elements
      : [namespaceArgument];

    const namespace = namespaces.find(
      (namespace) =>
        ts.isStringLiteral(namespace) ||
        (ts.isIdentifier(namespace) && namespace.text === 'undefined')
    );

    if (!namespace) {
      // No namespace found - technically a warning could be logged here
    } else if (ts.isStringLiteral(namespace)) {
      if (storeGlobally) {
        options.defaultNamespace = namespace.text;
      }
      entries[0].ns = namespace.text;
    }

    if (optionsArgument && ts.isObjectLiteralExpression(optionsArgument)) {
      const keyPrefixNode = optionsArgument.properties.find(
        (p) =>
          p.name &&
          hasEscapedText(p.name) &&
          p.name?.escapedText === 'keyPrefix'
      );
      if (keyPrefixNode != null && ts.isPropertyAssignment(keyPrefixNode)) {
        if (storeGlobally) {
          options.keyPrefix = keyPrefixNode.initializer.getText();
        }
        entries[0].keyPrefix = keyPrefixNode.initializer.getText();
      }
    }
  }

  const isTranslationFunction =
    (ts.isStringLiteral(node.expression) &&
      node.expression.text &&
      options.functions.includes(node.expression.text)) ||
    (hasName(node.expression) &&
      node.expression.name &&
      hasText(node.expression.name) &&
      options.functions.includes(node.expression.name.text)) ||
    options.functions.includes(expressionToName(node.expression));

  if (isTranslationFunction) {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    const keyArgument = node.arguments.shift();

    if (!keyArgument) {
      return null;
    }

    if (
      ts.isStringLiteral(keyArgument) ||
      ts.isNoSubstitutionTemplateLiteral(keyArgument)
    ) {
      entries[0].key = keyArgument.text;
    } else if (ts.isBinaryExpression(keyArgument)) {
      const concatenatedString = concatenateString(keyArgument);
      if (!concatenatedString) {
        return null;
      }
      entries[0].key = concatenatedString;
    } else {
      return null;
    }

    if (options.parseGenerics && node.typeArguments) {
      const nodeTypeArguments = copyNodeArray(node.typeArguments);
      const typeArgument = nodeTypeArguments.shift();

      const parseTypeArgument = (typeNode: ts.TypeNode | undefined) => {
        if (!typeNode) {
          return;
        }
        if (ts.isTypeLiteralNode(typeNode)) {
          for (const member of typeNode.members) {
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-ignore
            entries[0][member.name?.text] = '';
          }
        } else if (
          ts.isTypeReferenceNode(typeNode) &&
          ts.isIdentifier(typeNode.typeName)
        ) {
          const typeName = typeNode.typeName.text;
          if (typeName in options.typeMap) {
            Object.assign(entries[0], options.typeMap[typeName]);
          }
        } else if (
          (ts.isUnionTypeNode(typeNode) ||
            ts.isIntersectionTypeNode(typeNode)) &&
          Array.isArray(typeNode.types)
        ) {
          typeNode.types.forEach((type) => parseTypeArgument(type));
        }
      };

      parseTypeArgument(typeArgument);
    }

    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    let optionsArgument = node.arguments.shift();

    if (
      optionsArgument &&
      (ts.isStringLiteral(optionsArgument) ||
        ts.isNoSubstitutionTemplateLiteral(optionsArgument))
    ) {
      entries[0].defaultValue = optionsArgument.text;
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      optionsArgument = node.arguments.shift();
    } else if (optionsArgument && ts.isBinaryExpression(optionsArgument)) {
      const concatenatedString = concatenateString(optionsArgument);
      if (!concatenatedString) {
        return null;
      }
      entries[0].defaultValue = concatenatedString;
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      optionsArgument = node.arguments.shift();
    }

    if (optionsArgument && ts.isObjectLiteralExpression(optionsArgument)) {
      for (const optionProperty of optionsArgument.properties) {
        if (ts.isSpreadAssignment(optionProperty)) {
          // Skip as this can't be processed. A warning could be logged at some point.
        } else if (ts.isPropertyAssignment(optionProperty)) {
          const propertyName = getNodeText(optionProperty.name);
          if (optionProperty.initializer.kind === ts.SyntaxKind.TrueKeyword) {
            entries[0][propertyName] = true;
          } else if (
            optionProperty.initializer.kind === ts.SyntaxKind.FalseKeyword
          ) {
            entries[0][propertyName] = false;
          } else if (ts.isCallExpression(optionProperty.initializer)) {
            const nestedEntries = extractFromExpression(
              optionProperty.initializer,
              options
            );
            if (nestedEntries) {
              entries.push(...nestedEntries);
            } else {
              entries[0][propertyName] =
                getNodeText(optionProperty.initializer) || '';
            }
          } else {
            entries[0][propertyName] =
              getNodeText(optionProperty.initializer) || '';
          }
        } else {
          entries[0][getNodeText(optionProperty.name)] = '';
        }
      }
    }

    if (entries[0].ns) {
      if (typeof entries[0].ns === 'string') {
        entries[0].namespace = entries[0].ns;
        // Need to double check if this is even needed
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
      } else if (Array.isArray(entries[0].ns) && entries[0].ns.length) {
        entries[0].namespace = entries[0].ns[0];
      }
    }
    entries[0].functionName = hasEscapedText(node.expression)
      ? node.expression.escapedText.toString()
      : node.expression.getText();

    return entries
      .map((entry) => {
        const namespace =
          entry.ns ??
          options.translationFunctionsWithArgs?.[entry.functionName ?? '']
            ?.ns ??
          options.defaultNamespace;
        return namespace
          ? {
              ...entry,
              namespace,
            }
          : entry;
      })
      .map(({ functionName, ...key }) => {
        const keyPrefix =
          options.translationFunctionsWithArgs?.[functionName ?? '']
            ?.keyPrefix ?? options.keyPrefix;
        return keyPrefix
          ? {
              ...key,
              keyPrefix,
            }
          : key;
      });
  }

  const isTranslationFunctionCreation =
    hasEscapedText(node.expression) &&
    node.expression.escapedText &&
    options.namespaceFunctions.includes(node.expression.escapedText);
  if (isTranslationFunctionCreation) {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    options.translationFunctionsWithArgs[functionDefinition?.[0] ?? ''] =
      entries[0];
  }
  return null;
};

// Taken from: https://github.com/i18next/i18next-parser/blob/6c10a2b66ebadb8250039d078ad2a53e52753a6e/src/lexers/javascript-lexer.js#L419
const concatenateString = (
  binaryExpression: ts.BinaryExpression,
  string = ''
) => {
  if (!ts.isPlusToken(binaryExpression.operatorToken)) {
    return;
  }

  if (ts.isBinaryExpression(binaryExpression.left)) {
    string += concatenateString(binaryExpression.left, string);
  } else if (ts.isStringLiteral(binaryExpression.left)) {
    string += binaryExpression.left.text;
  } else {
    return;
  }

  if (ts.isBinaryExpression(binaryExpression.right)) {
    string += concatenateString(binaryExpression.right, string);
  } else if (ts.isStringLiteral(binaryExpression.right)) {
    string += binaryExpression.right.text;
  } else {
    return;
  }

  return string;
};

// Taken from: https://github.com/i18next/i18next-parser/blob/6c10a2b66ebadb8250039d078ad2a53e52753a6e/src/lexers/jsx-lexer.js#L186
const nodeToString = (
  node: ts.JsxElement | ts.JsxFragment | ts.JsxSelfClosingElement,
  content: string,
  options: Options
) => {
  if (ts.isJsxSelfClosingElement(node)) {
    return '';
  }
  const elements = parseElements(node.children, content, options);

  const elementsToString = (elements: ParsedJsxElements[]): string =>
    elements
      .map((element, index) => {
        switch (element.type) {
          case 'js':
          case 'text':
            return element.content;
          case 'tag': {
            const useTagName =
              element.isBasic &&
              options.transSupportBasicHtmlNodes &&
              options.transKeepBasicHtmlNodesFor.includes(element.name);
            const elementName = useTagName ? element.name : index;
            const childrenString = elementsToString(element.children);
            return childrenString || !(useTagName && element.selfClosing)
              ? `<${elementName}>${childrenString}</${elementName}>`
              : `<${elementName} />`;
          }

          default:
          // Do nothing
        }
      })
      .join('');

  return elementsToString(elements);
};

type ParsedJsxElements =
  | {
      type: 'text';
      content: string;
    }
  | {
      type: 'js';
      content: string;
    }
  | {
      type: 'tag';
      name: string;
      isBasic: boolean;
      selfClosing: boolean;
      children: ParsedJsxElements[];
    };

// Taken from: https://github.com/i18next/i18next-parser/blob/6c10a2b66ebadb8250039d078ad2a53e52753a6e/src/lexers/jsx-lexer.js#L226
const parseElements = (
  elements: ts.NodeArray<ts.JsxChild>,
  content: string,
  options: Options
): ParsedJsxElements[] => {
  if (!elements) {
    return [];
  }
  return elements
    .map(
      (
        elem:
          | ts.JsxChild
          | ts.AsExpression
          | (ts.Node & { expression: ts.Expression })
      ) => {
        if (ts.isJsxText(elem)) {
          return {
            type: 'text',
            content: cleanMultiLineCode(elem.text),
          } as const;
        } else if (ts.isJsxElement(elem) || ts.isJsxSelfClosingElement(elem)) {
          const element = ts.isJsxElement(elem) ? elem.openingElement : elem;
          const name = hasEscapedText(element.tagName)
            ? element.tagName.escapedText.toString()
            : element.tagName.getText();
          const isBasic = !element.attributes.properties.length;
          const hasDynamicChildren = element.attributes.properties.find(
            (prop) =>
              ts.isJsxAttribute(prop) &&
              hasEscapedText(prop.name) &&
              prop.name.escapedText === 'i18nIsDynamicList'
          );
          return {
            type: 'tag',
            children:
              hasDynamicChildren || !ts.isJsxElement(elem)
                ? []
                : parseElements(elem.children, content, options),
            name,
            isBasic,
            selfClosing: ts.isJsxSelfClosingElement(elem),
          } as const;
        } else if (ts.isJsxExpression(elem)) {
          if (!elem.expression) {
            return {
              type: 'text',
              content: '',
            } as const;
          }

          //Taken from: https://github.com/i18next/i18next-parser/blob/6c10a2b66ebadb8250039d078ad2a53e52753a6e/src/lexers/jsx-lexer.js#L265
          while (
            hasExpression(elem) &&
            elem.expression &&
            ts.isAsExpression(elem.expression)
          ) {
            elem = elem.expression;
          }

          if (
            hasExpression(elem) &&
            ts.isCallExpression(elem.expression) &&
            ts.isIdentifier(elem.expression.expression) &&
            options.transIdentityFunctionsToIgnore.includes(
              elem.expression.expression.escapedText.toString()
            ) &&
            elem.expression.arguments.length >= 1
          ) {
            // Taken from: https://github.com/i18next/i18next-parser/blob/6c10a2b66ebadb8250039d078ad2a53e52753a6e/src/lexers/jsx-lexer.js#L291
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-ignore
            elem = { expression: elem.expression.arguments[0] };
          }

          if (hasExpression(elem) && ts.isStringLiteral(elem.expression)) {
            return {
              type: 'text',
              content: elem.expression.text,
            } as const;
          } else if (
            hasExpression(elem) &&
            ts.isObjectLiteralExpression(elem.expression)
          ) {
            const nonFormatProperties = elem.expression.properties.filter(
              (prop) => prop.name?.getText() !== 'format'
            );
            const formatProperty = elem.expression.properties.find(
              (prop) => prop.name?.getText() === 'format'
            );

            if (nonFormatProperties.length > 1) {
              return {
                type: 'text',
                content: '',
              } as const;
            }

            const nonFormatPropertyName = nonFormatProperties[0]?.name
              ? getNodeText(nonFormatProperties[0].name)
              : '';

            const value =
              formatProperty && ts.isPropertyAssignment(formatProperty)
                ? `${nonFormatPropertyName}, ${getNodeText(formatProperty.initializer)}`
                : nonFormatPropertyName;

            return {
              type: 'js',
              content: `{{${value}}}`,
            } as const;
          }

          if (hasExpression(elem)) {
            const slicedExpression = content.slice(
              elem.expression.pos,
              elem.expression.end
            );

            return {
              type: 'js',
              content: `{${slicedExpression}}`,
            } as const;
          }
        }
      }
    )
    .filter((elem) => elem !== undefined)
    .filter((elem) => elem.type !== 'text' || elem.content);
};

// Taken from: https://github.com/i18next/i18next-parser/blob/6c10a2b66ebadb8250039d078ad2a53e52753a6e/src/lexers/jsx-lexer.js#L220
const cleanMultiLineCode = (text: string) => {
  return text
    .replace(/(^(\n|\r)\s*)|((\n|\r)\s*$)/g, '')
    .replace(/(\n|\r)\s*/g, ' ');
};

// Taken from: https://github.com/i18next/i18next-parser/blob/6c10a2b66ebadb8250039d078ad2a53e52753a6e/src/lexers/javascript-lexer.js#L447
const expressionToName = (
  expression: ts.Expression | ts.JsxTagNameExpression
): string => {
  if (!expression) {
    return '';
  }

  if (ts.isStringLiteral(expression) || ts.isIdentifier(expression)) {
    return expression.text;
  } else if (hasExpression(expression)) {
    return [
      expressionToName(expression.expression),
      expressionToName(expression.name),
    ]
      .filter((s) => s && s.length > 0)
      .join('.');
  }

  return '';
};

const hasExpression = (
  node: ts.Node
): node is ts.Node & { expression: ts.Expression } => {
  return (
    'expression' in node &&
    !!node.expression &&
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ts.isExpression((node as any).expression)
  );
};

const hasEscapedText = (node: ts.Node) => {
  return ts.isIdentifier(node) || ts.isPrivateIdentifier(node);
};

const hasName = (node: ts.Node): node is ts.NamedDeclaration => {
  return 'name' in node && node.name !== undefined;
};

function hasText(
  node: ts.Node
): node is
  | ts.StringLiteral
  | ts.NumericLiteral
  | ts.BigIntLiteral
  | ts.NoSubstitutionTemplateLiteral
  | ts.RegularExpressionLiteral
  | ts.Identifier {
  const result =
    node &&
    (ts.isStringLiteral(node) ||
      ts.isNumericLiteral(node) ||
      ts.isBigIntLiteral(node) ||
      ts.isNoSubstitutionTemplateLiteral(node) ||
      ts.isRegularExpressionLiteral(node) ||
      ts.isIdentifier(node));

  return result;
}

const getNodeText = (node: ts.Node): string => {
  if ('text' in node) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return (node as any).text;
  }
  return node.getText();
};

const copyNodeArray = <T extends ts.Node>(nodes: ts.NodeArray<T>): T[] => {
  return Array.from(nodes);
};

// Uses the original unescape code from i18next-parser
// to ensure that the found keys reflect the original parser implementation
// Taken from: https://github.com/i18next/i18next-parser/blob/6c10a2b66ebadb8250039d078ad2a53e52753a6e/src/helpers.js#L317
const unescape = (text: string) => {
  const matchHtmlEntity =
    /&(?:amp|#38|lt|#60|gt|#62|apos|#39|quot|#34|nbsp|#160|copy|#169|reg|#174|hellip|#8230|#x2F|#47);/g;
  const htmlEntities: Record<string, string> = {
    '&amp;': '&',
    '&#38;': '&',
    '&lt;': '<',
    '&#60;': '<',
    '&gt;': '>',
    '&#62;': '>',
    '&apos;': "'",
    '&#39;': "'",
    '&quot;': '"',
    '&#34;': '"',
    '&nbsp;': ' ',
    '&#160;': ' ',
    '&copy;': '©',
    '&#169;': '©',
    '&reg;': '®',
    '&#174;': '®',
    '&hellip;': '…',
    '&#8230;': '…',
    '&#x2F;': '/',
    '&#47;': '/',
  };

  const unescapeHtmlEntity = (m: string) => htmlEntities[m];

  return text.replace(matchHtmlEntity, unescapeHtmlEntity);
};
