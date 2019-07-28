import { h } from '../../src/wi.js';
import classNames from 'classnames';

export const TodoItem = ({
  k,
  todo,
  editing,
  onToggle,
  onDestroy,
  onEdit,
  onEditInput,
  onEditSubmit,
  onEditKeydown,
}) => {
  return (
    <li
      k={k}
      className={classNames({
        completed: todo.completed,
        editing: editing,
      })}
    >
      <div k="view" className="view">
        <input
          k="input"
          className="toggle"
          type="checkbox"
          checked={todo.completed}
          onChange={onToggle}
        />
        <label k="label" ondblclick={onEdit}>
          {todo.title}
        </label>
        <button k="button" className="destroy" onClick={onDestroy} />
      </div>
      <input
        k="input"
        ref="editField"
        className="edit"
        value={todo.editText}
        onBlur={onEditSubmit}
        onInput={onEditInput}
        onKeyDown={onEditKeydown}
        didUpdate={(ref) => {
          if (editing) {
            ref.focus();
            ref.setSelectionRange(ref.value.length, ref.value.length);
          }
        }}
      />
    </li>
  );
};
