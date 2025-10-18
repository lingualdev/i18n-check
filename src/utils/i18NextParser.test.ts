import { describe, it, expect } from 'vitest';
import { parse } from './i18NextParser';

describe('i18NextParser', () => {
  it('should parse interpolation', () => {
    expect(
      parse(
        'test {{val}} text {{- encoded}} with {{val, format}} some $t{nesting} help'
      )
    ).toEqual([
      {
        type: 'text',
        content: 'test ',
      },
      {
        type: 'interpolation',
        raw: '{{val}}',
        prefix: '{{',
        suffix: '}}',
        content: 'val',
        variable: 'val',
      },
      {
        type: 'text',
        content: ' text ',
      },
      {
        type: 'interpolation_unescaped',
        raw: '{{- encoded}}',
        prefix: '{{-',
        suffix: '}}',
        content: ' encoded',
        variable: 'encoded',
      },
      {
        type: 'text',
        content: ' with ',
      },
      {
        type: 'interpolation',
        raw: '{{val, format}}',
        prefix: '{{',
        suffix: '}}',
        content: 'val, format',
        variable: 'val, format',
      },
      {
        type: 'text',
        content: ' some ',
      },
      {
        type: 'nesting',
        raw: '$t{nesting}',
        prefix: '$t{',
        suffix: '}',
        content: 'nesting',
        variable: 'nesting',
      },
      {
        type: 'text',
        content: ' help',
      },
    ]);
  });

  it('should parse plural translations', () => {
    expect(
      parse('(1)[one item];(2-7)[a few items];(7-inf)[a lot of items];')
    ).toEqual([
      {
        type: 'plural',
        raw: '(1)',
        prefix: '(',
        suffix: ')',
        content: '1',
        variable: '1',
      },
      { type: 'text', content: '[one item];' },
      {
        type: 'plural',
        raw: '(2-7)',
        prefix: '(',
        suffix: ')',
        content: '2-7',
        variable: '2-7',
      },
      { type: 'text', content: '[a few items];' },
      {
        type: 'plural',
        raw: '(7-inf)',
        prefix: '(',
        suffix: ')',
        content: '7-inf',
        variable: '7-inf',
      },
      { type: 'text', content: '[a lot of items];' },
    ]);
  });

  it('should not parse plural translations if regular text inside parenthesis', () => {
    expect(parse('(This is a regular text inside parenthesis)')).toEqual([
      { type: 'text', content: '(This is a regular text inside parenthesis)' },
    ]);
  });

  it('should parse translations with nesting', () => {
    expect(parse('1 $t(nesting2)')).toEqual([
      {
        type: 'text',
        content: '1 ',
      },
      {
        type: 'nesting',
        raw: '$t(nesting2)',
        prefix: '$t(',
        suffix: ')',
        content: 'nesting2',
        variable: 'nesting2',
      },
    ]);
  });

  it('should parse translations with tags', () => {
    expect(
      parse('This is some <b>bold text</b> and some <i>italic</i> text.')
    ).toEqual([
      { type: 'text', content: 'This is some ' },
      { type: 'tag', raw: '<b>', voidElement: false },
      { type: 'text', content: 'bold text' },
      { type: 'tag', raw: '</b>', voidElement: false },
      { type: 'text', content: ' and some ' },
      { type: 'tag', raw: '<i>', voidElement: false },
      { type: 'text', content: 'italic' },
      { type: 'tag', raw: '</i>', voidElement: false },
      { type: 'text', content: ' text.' },
    ]);
  });

  it('should parse translations with nested tags', () => {
    expect(
      parse('This is some <b>bold text and some <i>nested italic</i> text</b>!')
    ).toEqual([
      { type: 'text', content: 'This is some ' },
      { type: 'tag', raw: '<b>', voidElement: false },
      { type: 'text', content: 'bold text and some ' },
      { type: 'tag', raw: '<i>', voidElement: false },
      { type: 'text', content: 'nested italic' },
      { type: 'tag', raw: '</i>', voidElement: false },
      { type: 'text', content: ' text' },
      { type: 'tag', raw: '</b>', voidElement: false },
      { type: 'text', content: '!' },
    ]);
  });

  it('should parse translations with self closing tags', () => {
    expect(
      parse(
        'This is some <b>bold text and some </b> and some random self closing tag <img /> as well.'
      )
    ).toEqual([
      { type: 'text', content: 'This is some ' },
      { type: 'tag', raw: '<b>', voidElement: false },
      { type: 'text', content: 'bold text and some ' },
      { type: 'tag', raw: '</b>', voidElement: false },
      { type: 'text', content: ' and some random self closing tag ' },
      { type: 'tag', raw: '<img />', voidElement: true },
      { type: 'text', content: ' as well.' },
    ]);
  });
});
