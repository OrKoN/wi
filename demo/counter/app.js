import { h, renderApp } from '../../src/wi.js';

function App({ state, actions }) {
  return (
    <div id="app" didMount={actions.didMount}>
      <input id="counter" value={state.counter} onInput={actions.handleInput} />
      <button id="incr" onClick={actions.increment}>
        Add 1
      </button>
      <button id="decr" onClick={actions.decrement}>
        Minus 1
      </button>
      <div>{state.counter}</div>
      {state.counter >= 1 && (
        <div
          id="c1"
          className="test"
          didUpdate={actions.didUpdate}
          willUnmount={actions.willUnmount}
        >
          {state.counter}
        </div>
      )}
      <div id="img2">
        <img src="https://pluralsight.imgix.net/paths/path-icons/nodejs-601628d09d.png" />
      </div>
      {state.counter >= 1 && <div id="c2">{state.counter}</div>}
      <div
        k="img"
        id="img"
        dangerouslySetInnerHTML={{
          __html:
            '<img src="https://pluralsight.imgix.net/paths/path-icons/nodejs-601628d09d.png" />',
        }}
      />
      {state.counter >= 1 && <div id="c3">{state.counter}</div>}
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
    },
    decrement: (e) => {
      store.state.counter--;
      setTimeout(() => {
        store.flush();
      }, 500);
      return false;
    },
    handleInput: (e) => {
      store.state.counter = e.target.value;
    },
  };
};

renderApp(<App />, document.getElementById('mount'), initialState, actions);
