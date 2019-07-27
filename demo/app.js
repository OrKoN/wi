import { h, renderApp } from '../src/wi.js';

function App({ state, actions }) {
  return (
    <div k="app" id="app" didMount={actions.didMount}>
      <input
        k="counter"
        id="counter"
        value={state.counter}
        onInput={actions.handleInput}
      />
      <button k="incr" id="incr" onClick={actions.increment}>
        Add 1
      </button>
      <button k="decr" id="decr" onClick={actions.decrement}>
        Minus 1
      </button>
      <div k="c1">{state.counter}</div>
      {state.counter > 2 && (
        <div
          k="c2"
          className="test"
          didUpdate={actions.didUpdate}
          willUnmount={actions.willUnmount}
        >
          {state.counter}
        </div>
      )}
      <div
        k="img"
        dangerouslySetInnerHTML={{
          __html:
            '<img src="https://pluralsight.imgix.net/paths/path-icons/nodejs-601628d09d.png" />',
        }}
      />
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
    willUnmount: (ref) => {
      console.log('willUnmount', ref);
    },
    didUpdate: (ref) => {
      console.log('didUpdate', ref);
      return false;
    },
    increment: (e) => {
      store.state.counter++;
      return true;
    },
    decrement: (e) => {
      store.state.counter--;
      setTimeout(() => {
        store.flush();
      }, 500);
    },
    handleInput: (e) => {
      store.state.counter = e.target.value;
      return true;
    },
  };
};

renderApp(<App />, document.getElementById('mount'), initialState, actions);
