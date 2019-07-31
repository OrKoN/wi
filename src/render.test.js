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
});

function setupScratch() {
  const scratch = document.createElement('div');
  scratch.id = 'scratch';
  (document.body || document.documentElement).appendChild(scratch);
  return scratch;
}

const Foo = () => 'd';
const getMixedArray = () =>
  // Make it a function so each test gets a new copy of the array
  [0, 'a', 'b', <span>c</span>, <Foo />, null, undefined, false, ['e', 'f'], 1];
const mixedArrayHTML = '0ab<span>c</span>def1';
