import { h, renderApp } from '../src/wi.js';

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
      {state.counter > 2 && (
        <div didUpdate={actions.didUpdate} willUnmount={actions.willUnmount}>
          {state.counter}
        </div>
      )}
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
      return true;
    },
    handleInput: (e) => {
      store.state.counter = e.target.value;
      return true;
    },
  };
};

renderApp(<App />, document.getElementById('mount'), initialState, actions);
