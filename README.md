# wi

A small (1KB gzipped) library for building small embedded apps with API similar
to React with some differences:

- recommended for small apps where one person can understand all details (not
  recommended for bigger apps)
- supports only function components
- offers mutable and directly accessible state accessible to all components
- no support for `style` attribute, only `className`
- `k` is used instead of `key` to unique identify elements
- manual control of re-renders
- diff algorithm is very simple (recommended to use `k` always)
- no SVG support yet
- no SSR support yet

_Note: the lib is in very early stage. It might not work properly at all_

```jsx
import { h, renderApp } from '../../src/wi.js';

function App({ state, actions }) {
  return (
    <div id="app" didMount={actions.didMount}>
      <div>{state.counter}</div>
      <button onClick={actions.increment}>Add 1</button>
      <button onClick={actions.decrement}>Minus 1</button>
    </div>
  );
}

const initialState = {
  counter: 0,
};

const actions = (store) => {
  return {
    didMount: (ref) => {
      console.log('didMount', ref);
    },
    increment: (e) => {
      store.state.counter++;
    },
    decrement: (e) => {
      store.state.counter--;
    },
  };
};

renderApp(<App />, document.getElementById('mount'), initialState, actions);
```

## Examples

There are two more complete examples:

- [Counter app](demo/counter)
- [TodoMVC app](demo/todomvc)
