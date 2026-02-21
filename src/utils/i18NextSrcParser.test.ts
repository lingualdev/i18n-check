/**
 *
 * To ensure full compatability with the deprecated `i18next-parser`
 * the internal `i18NextSrcParser`is tested against the `i18next-parser` lexer tests.
 *
 * Tests taken from:
 *  javascript-lexer:https://github.com/i18next/i18next-parser/blob/master/test/lexers/javascript-lexer.test.js
 *  jsx-lexer: https://github.com/i18next/i18next-parser/blob/master/test/lexers/jsx-lexer.test.js
 *
 */

import { describe, it, expect } from 'vitest';
import { getKeys } from './i18NextSrcParser';

describe('getKeys', () => {
  describe('supports JSX', () => {
    describe('<Interpolate>', () => {
      it('extracts keys from i18nKey attributes', () => {
        const content = '<Interpolate i18nKey="first" />';
        expect(getKeys('test.jsx', {}, content)).toEqual([{ key: 'first' }]);
      });
    });

    describe('<Translation>', () => {
      it('extracts keys from render prop', () => {
        const content = `<Translation>{(t) => <>{t("first", "Main")}{t("second")}</>}</Translation>`;
        expect(getKeys('test.jsx', {}, content)).toEqual([
          { defaultValue: 'Main', key: 'first' },
          { key: 'second' },
        ]);
      });

      it('sets ns (namespace) for expressions within render prop', () => {
        const content = `<Translation ns="foo">{(t) => t("first")}</Translation>`;
        expect(getKeys('test.jsx', {}, content)).toEqual([
          { key: 'first', namespace: 'foo' },
        ]);
      });
    });

    describe('<Trans>', () => {
      it('extracts keys from i18nKey attributes from closing tags', () => {
        const content = '<Trans i18nKey="first" count={count}>Yo</Trans>';
        expect(getKeys('test.jsx', {}, content)).toEqual([
          { key: 'first', defaultValue: 'Yo', count: '{count}' },
        ]);
      });

      it('extracts default value from string literal `defaults` prop', () => {
        const content =
          '<Trans i18nKey="first" defaults="test-value">should be ignored</Trans>';
        expect(getKeys('test.jsx', {}, content)).toEqual([
          { key: 'first', defaultValue: 'test-value' },
        ]);
      });

      it('extracts default value from interpolated expression statement `defaults` prop', () => {
        const content =
          '<Trans i18nKey="first" defaults={"test-value"}>should be ignored</Trans>';
        expect(getKeys('test.jsx', {}, content)).toEqual([
          { key: 'first', defaultValue: 'test-value' },
        ]);
      });

      it('extracts keys from user-defined key attributes from closing tags', () => {
        const content = '<Trans myIntlKey="first" count={count}>Yo</Trans>';
        expect(getKeys('test.jsx', { attr: 'myIntlKey' }, content)).toEqual([
          { key: 'first', defaultValue: 'Yo', count: '{count}' },
        ]);
      });

      it('extracts keys from i18nKey attributes from self-closing tags', () => {
        const content = '<Trans i18nKey="first" count={count} />';
        expect(getKeys('test.jsx', {}, content)).toEqual([
          { key: 'first', count: '{count}' },
        ]);
      });

      it('extracts keys from user-defined key attributes from self-closing tags', () => {
        const content = '<Trans myIntlKey="first" count={count} />';
        expect(getKeys('test.jsx', { attr: 'myIntlKey' }, content)).toEqual([
          { key: 'first', count: '{count}' },
        ]);
      });

      it('extracts custom attributes', () => {
        const content = '<Trans customAttribute="Youpi">Yo</Trans>';
        expect(getKeys('test.jsx', {}, content)).toEqual([
          { key: 'Yo', defaultValue: 'Yo', customAttribute: 'Youpi' },
        ]);
      });

      it('extracts boolean attributes', () => {
        const content =
          '<Trans ordinal customTrue={true} customFalse={false}>Yo</Trans>';
        expect(getKeys('test.jsx', {}, content)).toEqual([
          {
            key: 'Yo',
            defaultValue: 'Yo',
            ordinal: true,
            customTrue: true,
            customFalse: false,
          },
        ]);
      });

      it('extracts keys from Trans elements without an i18nKey', () => {
        const content = '<Trans count={count}>Yo</Trans>';
        expect(getKeys('test.jsx', {}, content)).toEqual([
          { key: 'Yo', defaultValue: 'Yo', count: '{count}' },
        ]);
      });

      it('extracts keys from Trans elements without an i18nKey, but with a defaults prop', () => {
        const content = '<Trans defaults="Steve">{{ name }}</Trans>';
        expect(getKeys('test.jsx', {}, content)).toEqual([
          { key: '{{name}}', defaultValue: 'Steve' },
        ]);
      });

      it('extracts keys from Trans elements without an i18nKey, with defaults, and without children', () => {
        // Based on https://react.i18next.com/latest/trans-component#alternative-usage-components-array
        const content = `
<Trans
  defaults="hello <0>{{what}}</0>"
  values={{
    what: "world"
  }}
  components={[<strong />]}
/>
`.trim();
        expect(getKeys('test.jsx', {}, content)).toEqual([
          {
            key: 'hello <0>{{what}}</0>',
            defaultValue: 'hello <0>{{what}}</0>',
            components: '{[<strong />]}',
            values: '{{ what: "world" }}',
          },
        ]);
      });

      it('extracts keys from Trans elements and ignores values of expressions and spaces', () => {
        const content = '<Trans count={count}>{{ key: property }}</Trans>';
        expect(getKeys('test.jsx', {}, content)).toEqual([
          { key: '{{key}}', defaultValue: '{{key}}', count: '{count}' },
        ]);
      });

      it('extracts formatted interpolations correctly', () => {
        const content =
          '<Trans count={count}>{{ key: property, format: "number" }}</Trans>';
        expect(getKeys('test.jsx', {}, content)).toEqual([
          {
            key: '{{key, number}}',
            defaultValue: '{{key, number}}',
            count: '{count}',
          },
        ]);
      });

      it('extracts keys from user-defined components', () => {
        const content = `<div>
      <Translate i18nKey="something">Something to translate.</Translate>
      <NotSupported i18nKey="jkl">asdf</NotSupported>
      <NotSupported.Translate i18nKey="jkl">asdf</NotSupported.Translate>
      <FooBar i18nKey="asdf">Lorum Ipsum</FooBar>
      <Namespace.A i18nKey="namespaced">Namespaced</Namespace.A>
      <Double.Namespace.B i18nKey="namespaced2">Namespaced2</Double.Namespace.B>
      </div>
      `;
        expect(
          getKeys(
            'test.jsx',
            {
              componentFunctions: [
                'Translate',
                'FooBar',
                'Namespace.A',
                'Double.Namespace.B',
              ],
            },
            content
          )
        ).toEqual([
          { key: 'something', defaultValue: 'Something to translate.' },
          { key: 'asdf', defaultValue: 'Lorum Ipsum' },
          { key: 'namespaced', defaultValue: 'Namespaced' },
          { key: 'namespaced2', defaultValue: 'Namespaced2' },
        ]);
      });

      it('extracts keys from single line comments', () => {
        const content = `
      // i18n.t('commentKey1')
      i18n.t('commentKey' + i)
      // i18n.t('commentKey2')
      i18n.t(\`commentKey\${i}\`)
      // Irrelevant comment
      // i18n.t('commentKey3')
      `;
        expect(getKeys('test.jsx', {}, content)).toEqual([
          { key: 'commentKey1' },
          { key: 'commentKey2' },
          { key: 'commentKey3' },
        ]);
      });

      it('extracts keys from multiline comments', () => {
        const content = `
      /*
        i18n.t('commentKey1')
        i18n.t('commentKey2')
      */
      i18n.t(\`commentKey\${i}\`)
      // Irrelevant comment
      /* i18n.t('commentKey3') */
      `;
        expect(getKeys('test.jsx', {}, content)).toEqual([
          { key: 'commentKey1' },
          { key: 'commentKey2' },
          { key: 'commentKey3' },
        ]);
      });

      it('invalid interpolation gets stripped', () => {
        const content =
          '<Trans count={count}>before{{ key1, key2 }}after</Trans>';
        expect(getKeys('test.jsx', {}, content)).toEqual([
          { key: 'beforeafter', defaultValue: 'beforeafter', count: '{count}' },
        ]);
      });

      it("doesn't add a blank key for self-closing or empty tags", () => {
        const emptyTag = '<Trans count={count}></Trans>';
        expect(getKeys('test.jsx', {}, emptyTag)).toEqual([]);

        const selfClosing = '<Trans count={count}/>';
        expect(getKeys('test.jsx', {}, selfClosing)).toEqual([]);
      });

      it('erases tags from content', () => {
        const content =
          '<Trans>a<b test={"</b>"}>c<c>z</c></b>{d}<br stuff={y}/></Trans>';
        expect(getKeys('test.jsx', {}, content)[0].defaultValue).toEqual(
          'a<1>c<1>z</1></1>{d}<3></3>'
        );
      });

      it('skips dynamic children', () => {
        const content =
          '<Trans>My dogs are named: <ul i18nIsDynamicList>{["rupert", "max"].map(dog => (<li>{dog}</li>))}</ul></Trans>';
        expect(getKeys('test.jsx', {}, content)[0].defaultValue).toEqual(
          'My dogs are named: <1></1>'
        );
      });

      it('handles spread attributes', () => {
        const content =
          '<Trans>My dog is named: <span {...styles}>Spot</span></Trans>';
        expect(getKeys('test.jsx', {}, content)[0].defaultValue).toEqual(
          'My dog is named: <1>Spot</1>'
        );
      });

      it('erases comment expressions', () => {
        const content = '<Trans>{/* some comment */}Some Content</Trans>';
        expect(getKeys('test.jsx', {}, content)[0].defaultValue).toEqual(
          'Some Content'
        );
      });

      it('handles jsx fragments', () => {
        const content = '<><Trans i18nKey="first" /></>';
        expect(getKeys('test.jsx', {}, content)).toEqual([{ key: 'first' }]);
      });

      it('interpolates literal string values', () => {
        const content = `<Trans>Some{' '}Interpolated {'Content'}</Trans>`;
        expect(getKeys('test.jsx', {}, content)[0].defaultValue).toEqual(
          'Some Interpolated Content'
        );
      });

      it('uses the ns (namespace) prop', () => {
        const content = `<Trans ns="foo">bar</Trans>`;
        expect(getKeys('test.jsx', {}, content)).toEqual([
          { key: 'bar', defaultValue: 'bar', namespace: 'foo' },
        ]);
      });

      it('uses the ns (namespace) prop with curly braces syntax', () => {
        const content = `<Trans ns={'foo'}>bar</Trans>`;
        expect(getKeys('test.jsx', {}, content)).toEqual([
          { key: 'bar', defaultValue: 'bar', namespace: 'foo' },
        ]);
      });
    });

    describe('supports TypeScript', () => {
      it('supports basic tsx syntax', () => {
        const content =
          '<Interpolate i18nKey="first" someVar={foo() as bar} />';
        expect(getKeys('test.jsx', {}, content)).toEqual([{ key: 'first' }]);
      });

      describe('<Interpolate>', () => {
        it('extracts keys from i18nKey attributes', () => {
          const content = '<Interpolate i18nKey="first" />';
          expect(getKeys('test.jsx', {}, content)).toEqual([{ key: 'first' }]);
        });
      });

      describe('<Trans>', () => {
        it('extracts keys from i18nKey attributes from closing tags', () => {
          const content = '<Trans i18nKey="first" count={count}>Yo</Trans>';
          expect(getKeys('test.jsx', {}, content)).toEqual([
            { key: 'first', defaultValue: 'Yo', count: '{count}' },
          ]);
        });

        it('extracts keys from user-defined key attributes from closing tags', () => {
          const content = '<Trans myIntlKey="first" count={count}>Yo</Trans>';
          expect(getKeys('test.jsx', { attr: 'myIntlKey' }, content)).toEqual([
            { key: 'first', defaultValue: 'Yo', count: '{count}' },
          ]);
        });

        it('extracts keys from i18nKey attributes from self-closing tags', () => {
          const content = '<Trans i18nKey="first" count={count} />';
          expect(getKeys('test.jsx', {}, content)).toEqual([
            { key: 'first', count: '{count}' },
          ]);
        });

        it('does not extract variable identifier from i18nKey as key', () => {
          const content = '<Trans i18nKey={variable} />';
          expect(getKeys('test.jsx', {}, content)).toEqual([]);
        });

        it('extracts keys from user-defined key attributes from self-closing tags', () => {
          const content = '<Trans myIntlKey="first" count={count} />';
          expect(getKeys('test.jsx', { attr: 'myIntlKey' }, content)).toEqual([
            { key: 'first', count: '{count}' },
          ]);
        });

        it('extracts keys from Trans elements without an i18nKey', () => {
          const content = '<Trans count={count}>Yo</Trans>';
          expect(getKeys('test.jsx', {}, content)).toEqual([
            { key: 'Yo', defaultValue: 'Yo', count: '{count}' },
          ]);
        });

        it('extracts keys from Trans elements and ignores values of expressions and spaces', () => {
          const content = '<Trans count={count}>{{ key: property }}</Trans>';
          expect(getKeys('test.jsx', {}, content)).toEqual([
            { key: '{{key}}', defaultValue: '{{key}}', count: '{count}' },
          ]);
        });

        it('strips invalid interpolation', () => {
          const content =
            '<Trans count={count}>before{{ key1, key2 }}after</Trans>';
          expect(getKeys('test.jsx', {}, content)).toEqual([
            {
              key: 'beforeafter',
              defaultValue: 'beforeafter',
              count: '{count}',
            },
          ]);
        });

        it("doesn't add a blank key for self-closing or empty tags", () => {
          const emptyTag = '<Trans count={count}></Trans>';
          expect(getKeys('test.jsx', {}, emptyTag)).toEqual([]);

          const selfClosing = '<Trans count={count}/>';
          expect(getKeys('test.jsx', {}, selfClosing)).toEqual([]);
        });

        it('erases tags from content', () => {
          const content =
            '<Trans>a<b test={"</b>"}>c<c>z</c></b>{d}<br stuff={y}/></Trans>';
          expect(getKeys('test.jsx', {}, content)[0].defaultValue).toEqual(
            'a<1>c<1>z</1></1>{d}<3></3>'
          );
        });

        it('erases comment expressions', () => {
          const content = '<Trans>{/* some comment */}Some Content</Trans>';
          expect(getKeys('test.jsx', {}, content)[0].defaultValue).toEqual(
            'Some Content'
          );
        });

        it('erases typecasts', () => {
          const content = '<Trans>{{ key: property } as any}</Trans>';
          expect(getKeys('test.jsx', {}, content)).toEqual([
            { key: '{{key}}', defaultValue: '{{key}}' },
          ]);
        });

        it('keeps self-closing tags untouched when transSupportBasicHtmlNodes is true', () => {
          const content = '<Trans>a<br />b</Trans>';
          expect(
            getKeys(
              'test.jsx',
              { transSupportBasicHtmlNodes: true },
              content
            )[0].defaultValue
          ).toEqual('a<br />b');
        });

        it('keeps empty tag untouched when transSupportBasicHtmlNodes is true', () => {
          const content = '<Trans>a<strong></strong>b</Trans>';
          expect(
            getKeys(
              'test.jsx',
              { transSupportBasicHtmlNodes: true },
              content
            )[0].defaultValue
          ).toEqual('a<strong></strong>b');
        });

        it('does not unescape i18nKey', () => {
          const content =
            '<Trans i18nKey="I&apos;m testing">I&apos;m Testing</Trans>';
          expect(getKeys('test.jsx', {}, content)[0].key).toEqual(
            'I&apos;m testing'
          );
        });

        it('unescapes key when i18nKey is not provided', () => {
          const content = '<Trans>I&apos;m Testing</Trans>';
          expect(getKeys('test.jsx', {}, content)[0].key).toEqual(
            "I'm Testing"
          );
        });

        it('supports the shouldUnescape options', () => {
          const content = '<Trans shouldUnescape>I&apos;m Testing</Trans>';
          const result = getKeys('test.jsx', {}, content)[0];
          expect(result.key).toEqual("I'm Testing");
          expect(result.defaultValue).toEqual('I&apos;m Testing');
        });

        it('supports multi-step casts', () => {
          const content =
            '<Trans>Hi, {{ name: "John" } as unknown as string}</Trans>';
          expect(getKeys('test.jsx', {}, content)[0].defaultValue).toEqual(
            'Hi, {{name}}'
          );
        });

        it('supports variables in identity functions', () => {
          const content = '<Trans>Hi, {funcCall({ name: "John" })}</Trans>';
          expect(
            getKeys(
              'test.jsx',
              {
                transIdentityFunctionsToIgnore: ['funcCall'],
              },
              content
            )[0].defaultValue
          ).toEqual('Hi, {{name}}');
        });
      });
    });
  });

  describe('supports JavaScript', () => {
    it('extracts keys from translation components', () => {
      const content = 'i18n.t("first")';
      expect(getKeys('test.jsx', {}, content)).toEqual([{ key: 'first' }]);
    });

    it('extracts the second argument string literal as defaultValue', () => {
      const content = 'i18n.t("first", "bla")';
      expect(getKeys('test.jsx', {}, content)).toEqual([
        { key: 'first', defaultValue: 'bla' },
      ]);
    });

    it('extracts the second argument template literal as defaultValue', () => {
      const content = 'i18n.t("first", `bla`)';
      expect(getKeys('test.jsx', {}, content)).toEqual([
        { key: 'first', defaultValue: 'bla' },
      ]);
    });

    it('extracts the second argument string concatenation as defaultValue', () => {
      const content = 'i18n.t("first", "bla" + "bla" + "bla")';
      expect(getKeys('test.jsx', {}, content)).toEqual([
        { key: 'first', defaultValue: 'blablabla' },
      ]);
    });

    it('extracts the defaultValue/context options', () => {
      const content =
        'i18n.t("first", {defaultValue: "foo", context: \'bar\'})';
      expect(getKeys('test.jsx', {}, content)).toEqual([
        { key: 'first', defaultValue: 'foo', context: 'bar' },
      ]);
    });

    it('emits a `warning` event if the option argument contains a spread operator', () => {
      const content = `{t('foo', { defaultValue: 'bar', ...spread })}`;
      expect(getKeys('test.jsx', {}, content)).toEqual([
        { key: 'foo', defaultValue: 'bar' },
      ]);
    });

    it('extracts the defaultValue/context on multiple lines', () => {
      const content =
        'i18n.t("first", {\ndefaultValue: "foo",\n context: \'bar\'})';
      expect(getKeys('test.jsx', {}, content)).toEqual([
        { key: 'first', defaultValue: 'foo', context: 'bar' },
      ]);
    });

    it('extracts the defaultValue/context options with quotation marks', () => {
      const content =
        'i18n.t("first", {context: "foo", "defaultValue": \'bla\'})';
      expect(getKeys('test.jsx', {}, content)).toEqual([
        { key: 'first', defaultValue: 'bla', context: 'foo' },
      ]);
    });

    it('extracts the defaultValue/context options with interpolated value', () => {
      const content =
        'i18n.t("first", {context: "foo", "defaultValue": \'{{var}} bla\'})';
      expect(getKeys('test.jsx', {}, content)).toEqual([
        { key: 'first', defaultValue: '{{var}} bla', context: 'foo' },
      ]);
    });

    it('supports multiline and concatenation', () => {
      const content = 'i18n.t("foo" + \n "bar")';
      expect(getKeys('test.jsx', {}, content)).toEqual([{ key: 'foobar' }]);
    });

    it('supports multiline template literal keys', () => {
      const content = 'i18n.t(`foo\nbar`)';
      expect(getKeys('test.jsx', {}, content)).toEqual([{ key: 'foo\nbar' }]);
    });

    it('extracts keys from single line comments', () => {
      const content = `
    // i18n.t('commentKey1')
    i18n.t('commentKey' + i)
    // i18n.t('commentKey2')
    i18n.t(\`commentKey\${i}\`)
    // Irrelevant comment
    // i18n.t('commentKey3')
    `;
      expect(getKeys('test.jsx', {}, content)).toEqual([
        { key: 'commentKey1' },
        { key: 'commentKey2' },
        { key: 'commentKey3' },
      ]);
    });

    it('extracts keys from multiline comments', () => {
      const content = `
    /*
      i18n.t('commentKey1')
      i18n.t('commentKey2')
    */
    i18n.t(\`commentKey\${i}\`)
    // Irrelevant comment
    /* i18n.t('commentKey3') */
    `;
      expect(getKeys('test.jsx', {}, content)).toEqual([
        { key: 'commentKey1' },
        { key: 'commentKey2' },
        { key: 'commentKey3' },
      ]);
    });

    it('parses namespace from `t` type argument', () => {
      const content = `
      const content = (t: TFunction<"foo">) => ({
        title: t("bar"),
      })
    `;
      expect(getKeys('test.jsx', {}, content)).toEqual([
        { key: 'bar', namespace: 'foo' },
      ]);
    });

    it("does not parse text with `doesn't` or isolated `t` in it", () => {
      const js =
        "// FIX this doesn't work and this t is all alone\nt('first')\nt = () => {}";
      expect(getKeys('test.jsx', {}, js)).toEqual([{ key: 'first' }]);
    });

    it('ignores functions that ends with a t', () => {
      const js = "ttt('first')";
      expect(getKeys('test.jsx', {}, js)).toEqual([]);
    });

    it('supports a `functions` option', () => {
      const content =
        'tt("first") + _e("second") + x.tt("third") + f.g("fourth")';
      expect(
        getKeys('test.jsx', { functions: ['tt', '_e', 'f.g'] }, content)
      ).toEqual([
        { key: 'first' },
        { key: 'second' },
        { key: 'third' },
        { key: 'fourth' },
      ]);
    });

    it('supports the spread operator', () => {
      const content =
        'const data = { text: t("foo"), ...rest }; const { text, ...more } = data;';
      expect(getKeys('test.jsx', {}, content)).toEqual([{ key: 'foo' }]);
    });

    it('supports the es7 syntax', () => {
      const content = '@decorator() class Test { test() { t("foo") } }';
      expect(getKeys('test.jsx', {}, content)).toEqual([{ key: 'foo' }]);
    });

    it('supports basic typescript syntax', () => {
      const content = 'i18n.t("first") as potato';
      expect(getKeys('test.jsx', {}, content)).toEqual([{ key: 'first' }]);
    });
    it('supports for t function in options', () => {
      const content =
        'i18n.t("first", {option: i18n.t("second",{option2: i18n.t("third")}), option3: i18n.t("fourth")})';
      expect(getKeys('test.jsx', {}, content)).toEqual([
        { key: 'first' },
        { key: 'second' },
        { key: 'third' },
        { key: 'fourth' },
      ]);
    });

    describe('useTranslation', () => {
      it('extracts default namespace', () => {
        const content = 'const {t} = useTranslation("foo"); t("bar");';
        expect(getKeys('test.jsx', {}, content)).toEqual([
          { namespace: 'foo', key: 'bar' },
        ]);
      });

      it('extracts the first valid namespace when it is an array', () => {
        const content =
          'const {t} = useTranslation([someVariable, "baz"]); t("bar");';
        expect(getKeys('test.jsx', {}, content)).toEqual([
          { namespace: 'baz', key: 'bar' },
        ]);
      });

      it('emits a `warning` event if the extracted namespace is not a string literal or undefined', () => {
        const content = 'const {t} = useTranslation(someVariable); t("bar");';
        expect(getKeys('test.jsx', {}, content)).toEqual([{ key: 'bar' }]);
      });

      it('leaves the default namespace unchanged if `undefined` is passed', () => {
        const content = 'const {t} = useTranslation(undefined); t("bar");';
        expect(getKeys('test.jsx', {}, content)).toEqual([{ key: 'bar' }]);
      });

      it('leaves the default namespace unchanged if `undefined` is passed in an array', () => {
        const content =
          'const {t} = useTranslation([someVariable, undefined]); t("bar");';
        expect(getKeys('test.jsx', {}, content)).toEqual([{ key: 'bar' }]);
      });

      it('uses namespace from t function with priority', () => {
        const content =
          'const {t} = useTranslation("foo"); t("bar", {ns: "baz"});';
        expect(getKeys('test.jsx', {}, content)).toEqual([
          { namespace: 'baz', key: 'bar', ns: 'baz' },
        ]);
      });

      it('extracts namespace with a custom hook', () => {
        const content =
          'const {t} = useCustomTranslationHook("foo"); t("bar");';
        expect(
          getKeys(
            '',
            { namespaceFunctions: ['useCustomTranslationHook'] },
            content
          )
        ).toEqual([{ namespace: 'foo', key: 'bar' }]);
      });

      it('extracts namespace with a custom hook defined as nested properties', () => {
        const content = 'const {t} = i18n.useTranslate("foo"); t("bar");';
        expect(
          getKeys(
            'test.jsx',
            { namespaceFunctions: ['i18n.useTranslate'] },
            content
          )
        ).toEqual([{ namespace: 'foo', key: 'bar' }]);
      });
    });

    describe('withTranslation', () => {
      it('extracts default namespace when it is a string', () => {
        const content =
          'const ExtendedComponent = withTranslation("foo")(MyComponent); t("bar");';
        expect(getKeys('test.jsx', {}, content)).toEqual([
          { namespace: 'foo', key: 'bar' },
        ]);
      });

      it('extracts first valid namespace when it is an array', () => {
        const content =
          'const ExtendedComponent = withTranslation([someVariable, "baz"])(MyComponent); t("bar");';
        expect(getKeys('test.jsx', {}, content)).toEqual([
          { namespace: 'baz', key: 'bar' },
        ]);
      });

      it('emits a `warning` event if the extracted namespace is not a string literal or undefined', () => {
        const content =
          'const ExtendedComponent = withTranslation(someVariable)(MyComponent); t("bar");';
        expect(getKeys('test.jsx', {}, content)).toEqual([{ key: 'bar' }]);
      });

      it('leaves the default namespace unchanged if `undefined` is passed', () => {
        const content =
          'const ExtendedComponent = withTranslation(undefined)(MyComponent); t("bar");';
        expect(getKeys('test.jsx', {}, content)).toEqual([{ key: 'bar' }]);
      });

      it('leaves the default namespace unchanged if `undefined` is passed in an array', () => {
        const content =
          'const ExtendedComponent = withTranslation([someVariable, undefined])(MyComponent); t("bar");';
        expect(getKeys('test.jsx', {}, content)).toEqual([{ key: 'bar' }]);
      });

      it('uses namespace from t function with priority', () => {
        const content =
          'const ExtendedComponent = withTranslation("foo")(MyComponent); t("bar", {ns: "baz"});';
        expect(getKeys('test.jsx', {}, content)).toEqual([
          { namespace: 'baz', key: 'bar', ns: 'baz' },
        ]);
      });
    });

    it('extracts custom options', () => {
      const content = 'i18n.t("headline", {description: "Fantastic key!"});';
      expect(getKeys('test.jsx', {}, content)).toEqual([
        {
          key: 'headline',
          description: 'Fantastic key!',
        },
      ]);
    });

    it('extracts boolean options', () => {
      const content = 'i18n.t("headline", {ordinal: true, custom: false});';
      expect(getKeys('test.jsx', {}, content)).toEqual([
        {
          key: 'headline',
          ordinal: true,
          custom: false,
        },
      ]);
    });

    it('ignores dynamic keys', () => {
      const content =
        'const bar = "bar"; i18n.t("foo"); i18n.t(bar); i18n.t(`foo.${bar}`); i18n.t(`babar`);';

      expect(getKeys('test.jsx', {}, content)).toEqual([
        {
          key: 'foo',
        },
        {
          key: 'babar',
        },
      ]);
    });

    it('extracts non-interpolated tagged templates', () => {
      const content = 'i18n.t`some-key`';
      expect(getKeys('test.jsx', {}, content)).toEqual([
        {
          key: 'some-key',
        },
      ]);
    });

    it('skips interpolated tagged templates', () => {
      const content = 'i18n.t`some-key${someVar}keykey`';
      expect(getKeys('test.jsx', {}, content)).toEqual([]);
    });

    it('extracts count options', () => {
      const content = 'i18n.t<{count: number}>("key_count");';
      expect(
        getKeys(
          'file.ts',
          { typeMap: { CountType: { count: '' } }, parseGenerics: true },
          content
        )
      ).toEqual([
        {
          key: 'key_count',
          count: '',
        },
      ]);

      const content2 = `type CountType = {count : number};
  i18n.t<CountType>("key_count");`;
      expect(
        getKeys(
          'file.ts',
          {
            typeMap: { CountType: { count: '' } },
            parseGenerics: true,
          },
          content2
        )
      ).toEqual([
        {
          count: '',
          key: 'key_count',
        },
      ]);

      const content3 = `type CountType = {count : number};
     i18n.t<CountType & {my_custom: number}>("key_count");`;
      expect(
        getKeys(
          'file.ts',
          {
            typeMap: { CountType: { count: '' } },
            parseGenerics: true,
          },
          content3
        )
      ).toEqual([
        {
          key: 'key_count',
          count: '',
          my_custom: '',
        },
      ]);

      const content4 = `type CountType = {count : number};
     i18n.t<CountType | {my_custom: number}>("key_count");`;
      expect(
        getKeys(
          'file.ts',
          {
            typeMap: { CountType: { count: '' } },
            parseGenerics: true,
          },
          content4
        )
      ).toEqual([
        {
          key: 'key_count',
          count: '',
          my_custom: '',
        },
      ]);
    });
  });
});
