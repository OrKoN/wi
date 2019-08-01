import { h, render } from './wi';

/** @jsx h */

const obj = expect.objectContaining;

describe('render', () => {
  let scratch = null;

  beforeEach(() => {
    scratch = setupScratch();
  });

  it('renders nothing node given null', () => {
    render(null, scratch);
    expect(scratch.childNodes.length).toEqual(0);
  });

  it('renders an empty text node given an empty string', () => {
    render('', scratch);
    let c = scratch.childNodes;
    expect(c).toHaveLength(1);
    expect(c[0].data).toEqual('');
    expect(c[0].nodeName).toEqual('#text');
  });

  it('allows re-render from scratch', () => {
    render(<span>Bad</span>, scratch);
    render(<div>Good</div>, scratch);
    expect(scratch.innerHTML).toEqual(`<div>Good</div>`);
  });

  it('does not render when detecting JSON-injection', () => {
    const vnode = JSON.parse('{"t":"span","children":"Malicious"}');
    render(vnode, scratch);
    expect(scratch.firstChild).toEqual(null);
  });

  it('creates empty nodes (<* />)', () => {
    render(<div />, scratch);
    expect(scratch.childNodes).toHaveLength(1);
    expect(scratch.childNodes[0].nodeName).toEqual('DIV');

    scratch.parentNode.removeChild(scratch);
    scratch = document.createElement('div');
    (document.body || document.documentElement).appendChild(scratch);

    render(<span />, scratch);
    expect(scratch.childNodes).toHaveLength(1);
    expect(scratch.childNodes[0].nodeName).toEqual('SPAN');
  });

  it('supports custom tag names', () => {
    render(<foo />, scratch);
    expect(scratch.childNodes).toHaveLength(1);
    expect(scratch.firstChild.nodeName).toEqual('FOO');

    scratch.parentNode.removeChild(scratch);
    scratch = document.createElement('div');
    (document.body || document.documentElement).appendChild(scratch);

    render(<x-bar />, scratch);
    expect(scratch.childNodes).toHaveLength(1);
    expect(scratch.firstChild.nodeName).toEqual('X-BAR');
  });

  it('allows node reuse', () => {
    let reused = <div class="reuse">Hello World!</div>;
    render(
      <div>
        {reused}
        <span />
        {reused}
      </div>,
      scratch,
    );
    expect(scratch.innerHTML).toEqual(
      `<div><div class="reuse">Hello World!</div><span></span><div class="reuse">Hello World!</div></div>`,
    );

    render(
      <div>
        <span />
        {reused}
      </div>,
      scratch,
    );
    expect(scratch.innerHTML).toEqual(
      `<div><span></span><div class="reuse">Hello World!</div></div>`,
    );
  });

  it('nests empty nodes', () => {
    render(
      <div>
        <span />
        <foo />
        <x-bar />
      </div>,
      scratch,
    );

    expect(scratch.childNodes).toHaveLength(1);
    expect(scratch.childNodes[0].nodeName).toEqual('DIV');

    let c = scratch.childNodes[0].childNodes;
    expect(c).toHaveLength(3);
    expect(c[0].nodeName).toEqual('SPAN');
    expect(c[1].nodeName).toEqual('FOO');
    expect(c[2].nodeName).toEqual('X-BAR');
  });

  it('does not render falsy values', () => {
    render(
      <div>
        {null},{undefined},{false},{0},{NaN}
      </div>,
      scratch,
    );
    expect(scratch.firstChild.innerHTML).toEqual(',,,0,NaN');
  });

  it('does not render null', () => {
    render(null, scratch);
    expect(scratch.innerHTML).toEqual('');
  });

  it('does not render undefined', () => {
    render(undefined, scratch);
    expect(scratch.innerHTML).toEqual('');
  });

  it('does not render boolean true', () => {
    render(true, scratch);
    expect(scratch.innerHTML).toEqual('');
  });

  it('does not render boolean false', () => {
    render(false, scratch);
    expect(scratch.innerHTML).toEqual('');
  });

  it('does not render children when using function children', () => {
    render(<div>{() => {}}</div>, scratch);
    expect(scratch.innerHTML).toEqual('<div></div>');
  });

  it('renders NaN as text content', () => {
    render(NaN, scratch);
    expect(scratch.innerHTML).toEqual('NaN');
  });

  it('renders numbers (0) as text content', () => {
    render(0, scratch);
    expect(scratch.innerHTML).toEqual('0');
  });

  it('renders numbers (42) as text content', () => {
    render(42, scratch);
    expect(scratch.innerHTML).toEqual('42');
  });

  it('renders strings as text content', () => {
    render('Testing, huh! How is it going?', scratch);
    expect(scratch.innerHTML).toEqual('Testing, huh! How is it going?');
  });

  it('renders arrays of mixed elements', () => {
    render(getMixedArray(), scratch);
    expect(scratch.innerHTML).toEqual(mixedArrayHTML);
  });

  it('clears falsy attributes', () => {
    render(
      <div
        anull="anull"
        aundefined="aundefined"
        afalse="afalse"
        anan="aNaN"
        a0="a0"
      />,
      scratch,
    );

    render(
      <div
        anull={null}
        aundefined={undefined}
        afalse={false}
        anan={NaN}
        a0={0}
      />,
      scratch,
    );

    expect(getAttributes(scratch.firstChild)).toEqual({
      a0: '0',
      anan: 'NaN',
    });
  });

  it('does not render falsy attributes on hydrate', () => {
    render(
      <div
        anull={null}
        aundefined={undefined}
        afalse={false}
        anan={NaN}
        a0={0}
      />,
      scratch,
    );

    expect(getAttributes(scratch.firstChild)).toEqual({
      a0: '0',
      anan: 'NaN',
    });
  });

  it('sets value inside the specified range', () => {
    render(
      <input type="range" value={0.5} min="0" max="1" step="0.05" />,
      scratch,
    );
    expect(scratch.firstChild.value).toEqual('0.5');
  });

  // Test for preactjs/preact#651
  it('sets enumerable boolean attribute', () => {
    render(<input spellcheck={false} />, scratch);
    expect(scratch.firstChild.spellcheck).toEqual(false);
  });

  it('does not set tagName', () => {
    expect(() => render(<input tagName="div" />, scratch)).not.toThrow();
  });

  it('applies string attributes', () => {
    render(<div foo="bar" data-foo="databar" />, scratch);
    expect(serializeHtml(scratch)).toEqual(
      '<div data-foo="databar" foo="bar"></div>',
    );
  });

  it('does not serialize function props as attributes', () => {
    render(<div click={function a() {}} ONCLICK={function b() {}} />, scratch);

    let div = scratch.childNodes[0];
    expect(div.attributes.length).toEqual(0);
  });
});

function setupScratch() {
  const scratch = document.createElement('div');
  scratch.id = 'scratch';
  (document.body || document.documentElement).appendChild(scratch);
  return scratch;
}

function getAttributes(node) {
  let attrs = {};
  for (let i = node.attributes.length; i--; ) {
    attrs[node.attributes[i].name] = node.attributes[i].value;
  }
  return attrs;
}

const VOID_ELEMENTS = /^(area|base|br|col|embed|hr|img|input|link|meta|param|source|track|wbr)$/;

function serializeHtml(node) {
  let str = '';
  let child = node.firstChild;
  while (child) {
    str += serializeDomTree(child);
    child = child.nextSibling;
  }
  return str;
}

/**
 * Serialize a DOM tree.
 * Uses deterministic sorting where necessary to ensure consistent tests.
 * @param {Element|Node} node The root node to serialize
 * @returns {string} html
 */
function serializeDomTree(node) {
  if (node.nodeType === 3) {
    return encodeEntities(node.data);
  } else if (node.nodeType === 8) {
    return '<!--' + encodeEntities(node.data) + '-->';
  } else if (node.nodeType === 1 || node.nodeType === 9) {
    let str = '<' + node.localName;
    const attrs = [];
    for (let i = 0; i < node.attributes.length; i++) {
      attrs.push(node.attributes[i].name);
    }
    attrs.sort();
    for (let i = 0; i < attrs.length; i++) {
      const name = attrs[i];
      let value = node.getAttribute(name);
      if (value == null) continue;
      if (!value && name === 'class') continue;
      str += ' ' + name;
      value = encodeEntities(value);

      // normalize svg <path d="value">
      if (node.localName === 'path' && name === 'd') {
        value = normalizePath(value);
      }
      str += '="' + value + '"';
    }
    str += '>';
    if (!VOID_ELEMENTS.test(node.localName)) {
      let child = node.firstChild;
      while (child) {
        str += serializeDomTree(child);
        child = child.nextSibling;
      }
      str += '</' + node.localName + '>';
    }
    return str;
  }
}

function encodeEntities(str) {
  return str.replace(/&/g, '&amp;');
}

const Foo = () => 'd';
const getMixedArray = () =>
  // Make it a function so each test gets a new copy of the array
  [0, 'a', 'b', <span>c</span>, <Foo />, null, undefined, false, ['e', 'f'], 1];
const mixedArrayHTML = '0ab<span>c</span>def1';
