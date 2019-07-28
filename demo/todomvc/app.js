import { h, renderApp } from '../../src/wi.js';
import { ALL_TODOS, ACTIVE_TODOS, COMPLETED_TODOS } from './utils';
import { TodoItem } from './item';
import { TodoFooter } from './footer';
import { TodoModel } from './model';

function App({ state, actions }) {
  var todos = state.model.todos;

  var shownTodos = todos.filter((todo) => {
    switch (state.nowShowing) {
      case ACTIVE_TODOS:
        return !todo.completed;
      case COMPLETED_TODOS:
        return todo.completed;
      default:
        return true;
    }
  });

  var activeTodoCount = todos.reduce((accum, todo) => {
    return todo.completed ? accum : accum + 1;
  }, 0);

  var completedCount = todos.length - activeTodoCount;

  console.log(state.newTodo);

  return (
    <div k="todoapp">
      <header k="header" className="header">
        <h1 k="h1">todos</h1>
        <input
          k="inpt"
          className="new-todo"
          placeholder="What needs to be done?"
          value={state.newTodo}
          onKeyDown={actions.handleNewTodoKeyDown}
          onInput={actions.handleChange}
          autoFocus={true}
        />
      </header>
      {todos.length && (
        <section k="main" className="main">
          <input
            k="toggle-all"
            id="toggle-all"
            className="toggle-all"
            type="checkbox"
            onChange={actions.toggleAll}
            checked={activeTodoCount === 0}
          />
          <label k="toggle-all-label" htmlFor="toggle-all" />
          <ul k="todo-list" className="todo-list">
            {shownTodos.map((todo) => (
              <TodoItem
                k={todo.id}
                editing={state.editing === todo.id}
                onDestroy={() => actions.destroy(todo)}
                onEdit={() => actions.edit(todo)}
                onSave={() => actions.save(todo)}
                onEditInput={(e) => actions.onEditInput(e, todo)}
                onEditSubmit={(e) => actions.onEditSubmit(e, todo)}
                onEditKeydown={(e) => actions.onEditKeydown(e, todo)}
                onToggle={() => actions.toggle(todo)}
                todo={todo}
              />
            ))}
          </ul>
        </section>
      )}
      {(activeTodoCount || completedCount) && (
        <TodoFooter
          completedCount={completedCount}
          count={activeTodoCount}
          nowShowing={state.nowShowing}
          onClearCompleted={actions.clearCompleted}
          showActive={actions.showActive}
          showAll={actions.showAll}
          showCompleted={actions.showCompleted}
        />
      )}
    </div>
  );
}

const initialState = {
  nowShowing: ALL_TODOS,
  editing: null,
  newTodo: '',
  model: new TodoModel('todomvc'),
};

var ENTER_KEY = 13;

const actions = (store) => {
  return {
    handleNewTodoKeyDown(e) {
      if (e.keyCode !== ENTER_KEY) {
        return;
      }
      e.preventDefault();
      var val = store.state.newTodo.trim();
      if (val) {
        store.state.model.addTodo(val);
        store.state.newTodo = '';
      }
    },
    handleChange(e) {
      store.state.newTodo = e.target.value;
    },
    showAll() {
      store.state.nowShowing = ALL_TODOS;
    },
    showActive() {
      store.state.nowShowing = ACTIVE_TODOS;
    },
    showCompleted() {
      store.state.nowShowing = COMPLETED_TODOS;
    },
    toggle(todoToToggle) {
      store.state.model.toggle(todoToToggle);
    },
    destroy(todoToDestroy) {
      store.state.model.destroy(todoToDestroy);
    },
    clearCompleted() {
      store.state.model.clearCompleted();
    },
    edit(todo) {
      store.state.editing = todo.id;
      todo.editText = todo.title;
    },
    onEditSubmit(e, todo) {
      todo.title = todo.editText;
      store.state.editing = false;
      store.state.model.inform();
    },
    onEditKeydown(e, todo) {
      var ESCAPE_KEY = 27;
      var ENTER_KEY = 13;
      if (e.which === ESCAPE_KEY) {
        todo.editText = todo.title;
        store.state.editing = false;
      }
      if (e.which === ENTER_KEY) {
        return this.onEditSubmit(e, todo);
      }
    },
    onEditInput(e, todo) {
      todo.editText = e.target.value;
    },
  };
};

renderApp(<App />, document.getElementById('todoapp'), initialState, actions);
