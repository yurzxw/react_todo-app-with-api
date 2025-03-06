import React from 'react';
import { USER_ID } from '../api/todos';
import * as todosService from '../api/todos';
import classNames from 'classnames';

type Props = {
  onError: () => void;
  onTodos: () => void;
  onQuery: () => void;
  query: string;
  onToggleAll: () => void;
  completed: () => boolean;
};
export const Header: React.FC<Props> = ({
  onError,
  onTodos,
  onQuery,
  query,
  onToggleAll,
  completed,
}) => {
  const handleSubmit = event => {
    event.preventDefault();
    if (query === '') {
      onError('Title should not be empty');

      return;
    }

    todosService
      .postTodo({
        userId: USER_ID,
        title: query,
        completed: false,
      })
      .then(newTodo => {
        onTodos(currentTodos => [...currentTodos, newTodo]);
      })
      .catch(() => onError('Unable to add a todo'));

    onQuery('');
  };

  return (
    <header className="todoapp__header">
      {/* this button should have `active` class only if all todos are completed */}
      <button
        type="button"
        className={classNames('todoapp__toggle-all', { active: completed() })}
        data-cy="ToggleAllButton"
        onClick={onToggleAll}
      />

      {/* Add a todo on form submit */}
      <form
        onSubmit={event => {
          handleSubmit(event);
        }}
      >
        <input
          data-cy="NewTodoField"
          type="text"
          className="todoapp__new-todo"
          placeholder="What needs to be done?"
          value={query}
          onChange={event => onQuery(event.target.value)}
          autoFocus
        />
      </form>
    </header>
  );
};
