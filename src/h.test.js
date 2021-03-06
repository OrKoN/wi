/**

The MIT License (MIT)

Copyright (c) 2015-present Jason Miller

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.

*/

/**
 tests adopted from preact codebase
*/

import { h } from './wi';

/** @jsx h */

const obj = expect.objectContaining;

describe('h', () => {
  it('returns a node', () => {
    expect(h('foo')).toEqual({
      t: 'foo',
      p: {},
      k: null,
    });
  });

  it('sets t property', () => {
    expect(<div />).toEqual(
      obj({
        t: 'div',
      }),
    );
    function Test() {
      return <div />;
    }
    expect(<Test />).toEqual(
      obj({
        t: Test,
      }),
    );
  });

  it('sets node.constructor property to prevent json injection', () => {
    const node = <span />;
    expect(node.constructor).toEqual(undefined);
  });

  it('sets p property', () => {
    const props = {};
    expect(h('div', props).p).toEqual(props);
  });

  it('sets k property', () => {
    expect(<div />).toHaveProperty('key', undefined);
    expect(<div a="a" />).toHaveProperty('key', undefined);
    expect(<div k="1" />).toHaveProperty('k', '1');
  });

  it('does not set l property', () => {
    expect(<div />).not.toHaveProperty('p.k');
    expect(<div k="1" />).not.toHaveProperty('p.k');
    expect(<div k={0} />).not.toHaveProperty('p.k');
    expect(<div k={''} />).not.toHaveProperty('p.k');
  });

  it('preserves raw props', () => {
    const props = { foo: 'bar', baz: 10, func: () => {} },
      r = h('foo', props);
    expect(r).toEqual(
      obj({
        p: obj(props),
      }),
    );
  });

  it('supports children', () => {
    const kid1 = h('bar');
    const kid2 = h('baz');
    const r = h('foo', null, kid1, kid2);

    expect(r).toEqual(
      obj({
        p: obj({
          children: [kid1, kid2],
        }),
      }),
    );
  });

  it('supports multiple element children, given as arg list', () => {
    let kid1 = h('bar');
    let kid3 = h('test');
    let kid2 = h('baz', null, kid3);

    let r = h('foo', null, kid1, kid2);

    expect(r).toEqual(
      obj({
        p: obj({
          children: [kid1, kid2],
        }),
      }),
    );
  });

  it('handles multiple element children, given as an array', () => {
    let kid1 = h('bar');
    let kid3 = h('test');
    let kid2 = h('baz', null, kid3);

    let r = h('foo', null, [kid1, kid2]);

    expect(r).toEqual(
      obj({
        p: obj({
          children: [kid1, kid2],
        }),
      }),
    );
  });

  it('supports nested children', () => {
    const m = (x) => h(x);
    expect(h('foo', null, m('a'), [m('b'), m('c')], m('d'))).toEqual(
      obj({
        p: obj({
          children: [m('a'), [m('b'), m('c')], m('d')],
        }),
      }),
    );

    expect(h('foo', null, [m('a'), [m('b'), m('c')], m('d')])).toEqual(
      obj({
        p: obj({
          children: [m('a'), [m('b'), m('c')], m('d')],
        }),
      }),
    );

    expect(h('foo', { children: [m('a'), [m('b'), m('c')], m('d')] })).toEqual(
      obj({
        p: obj({
          children: [m('a'), [m('b'), m('c')], m('d')],
        }),
      }),
    );

    expect(
      h('foo', { children: [[m('a'), [m('b'), m('c')], m('d')]] }),
    ).toEqual(
      obj({
        p: obj({
          children: [[m('a'), [m('b'), m('c')], m('d')]],
        }),
      }),
    );

    expect(h('foo', { children: m('a') })).toEqual(
      obj({
        p: obj({
          children: m('a'),
        }),
      }),
    );

    expect(h('foo', { children: 'a' })).toEqual(
      obj({
        p: obj({
          children: 'a',
        }),
      }),
    );
  });

  it('support texts children', () => {
    let r = h('foo', null, 'textstuff');

    expect(r).toEqual(
      obj({
        p: obj({
          children: ['textstuff'],
        }),
      }),
    );
  });

  it('does not merge adjacent text children', () => {
    let r = h(
      'foo',
      null,
      'one',
      'two',
      h('bar'),
      'three',
      h('baz'),
      h('baz'),
      'four',
      null,
      'five',
      'six',
    );

    expect(r).toEqual(
      obj({
        p: obj({
          children: [
            'one',
            'two',
            h('bar'),
            'three',
            h('baz'),
            h('baz'),
            'four',
            null,
            'five',
            'six',
          ],
        }),
      }),
    );
  });

  it('does not merge nested adjacent text children', () => {
    let r = h(
      'foo',
      null,
      'one',
      ['two', null, 'three'],
      null,
      ['four', null, 'five', null],
      'six',
      null,
    );

    expect(r).toEqual(
      obj({
        p: obj({
          children: [
            'one',
            ['two', null, 'three'],
            null,
            ['four', null, 'five', null],
            'six',
            null,
          ],
        }),
      }),
    );
  });

  it('does not merge children that are boolean values', () => {
    let r = h('foo', null, 'one', true, 'two', false, 'three');

    expect(r).toEqual(
      obj({
        p: obj({
          children: ['one', true, 'two', false, 'three'],
        }),
      }),
    );
  });

  it('does not merge children of components', () => {
    let Component = ({ children }) => children;
    let r = h(Component, null, 'x', 'y');

    expect(r).toEqual(
      obj({
        p: obj({
          children: ['x', 'y'],
        }),
      }),
    );
  });

  it('ignores p.children if children are manually specified', () => {
    expect(
      <div a children={['a', 'b']}>
        c
      </div>,
    ).toEqual(<div a>c</div>);
  });
});
