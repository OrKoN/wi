import { h } from '../../src/wi.js';
import classNames from 'classnames';
import { Utils, ALL_TODOS, ACTIVE_TODOS, COMPLETED_TODOS } from './utils.js';

export const TodoFooter = ({
  completedCount,
  nowShowing,
  count,
  onClearCompleted,
  showAll,
  showActive,
  showCompleted,
}) => {
  return (
    <footer k="footer" className="footer">
      <span k="todo-count" className="todo-count">
        <strong k="strong">{count}</strong> {Utils.pluralize(count, 'item')}{' '}
        left
      </span>
      <ul k="filters" className="filters">
        <li k="1">
          <a
            k="a"
            href="#"
            onClick={showAll}
            className={classNames({ selected: nowShowing === ALL_TODOS })}
          >
            All
          </a>
        </li>{' '}
        <li k="2">
          <a
            k="a"
            href="#"
            onClick={showActive}
            className={classNames({
              selected: nowShowing === ACTIVE_TODOS,
            })}
          >
            Active
          </a>
        </li>{' '}
        <li k="3">
          <a
            k="a"
            href="#"
            onClick={showCompleted}
            className={classNames({
              selected: nowShowing === COMPLETED_TODOS,
            })}
          >
            Completed
          </a>
        </li>
      </ul>
      {completedCount > 0 && (
        <button className="clear-completed" onClick={onClearCompleted}>
          Clear completed
        </button>
      )}
    </footer>
  );
};
