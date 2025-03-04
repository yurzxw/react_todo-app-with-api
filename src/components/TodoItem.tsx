import { useState } from 'react';
import { Todo } from '../types/Todo';
import classNames from 'classnames';
import * as todosService from '../api/todos';
type Props = {
  todo: Todo;
  onToggle: (id: number) => void;
  onDeleteTodo: (id: number) => void;
  loading: boolean;
  ID: number;
  onError: () => void;
  onEditTodo: (id: number, title: string) => void;
};
export const TodoItem: React.FC<Props> = ({
  todo,
  onToggle,
  onDeleteTodo,
  loading,
  ID,
  onError,
  onEditTodo,
}) => {
  const { title, completed, id } = todo;

  const [selectedTodo, setSelectedTodo] = useState(false);
  const [selectedTodoId, setSelectedTodoId] = useState(0);
  const [newTitle, setNewTitle] = useState(title);

  if (!todo) {
    return null; // або покажіть заглушку
  }

  return (
    <div
      data-cy="Todo"
      key={id}
      className={classNames('todo', { completed: completed })}
      onDoubleClick={() => {
        setSelectedTodo(true);
        setSelectedTodoId(id);
      }}
    >
      <label className="todo__status-label">
        <input
          id={id}
          data-cy="TodoStatus"
          type="checkbox"
          className="todo__status"
          checked={completed}
          onChange={() => onToggle(id)}
        />
        <span className="hidden" style={{ display: 'none' }}>
          *
        </span>
      </label>

      {selectedTodo && selectedTodoId === id ? (
        <form
          onSubmit={event => {
            event.preventDefault();
            if (newTitle === title) {
              setSelectedTodo(false);
            }

            if (newTitle === '') {
              setSelectedTodo(false);
              onDeleteTodo(id);
              onError('Title should not be empty');
            } else {
              todosService
                .patchTodo(id, { title: newTitle })
                .catch(() => onError('Unable to update a todo'))
                .then(() => {
                  onEditTodo(id, newTitle);
                  setSelectedTodo(false);
                  setSelectedTodoId(0);
                });
            }
          }}
        >
          <input
            onKeyUp={e => {
              if (e.key === 'Escape') {
                setSelectedTodo(false);
              }
            }}
            onBlur={() => {
              if (newTitle === '') {
                setSelectedTodo(false);
                onDeleteTodo(id);
                onError('Title should not be empty');
              } else {
                todosService
                  .patchTodo(id, { title: newTitle })
                  .catch(() => onError('Unable to update a todo'))
                  .then(() => {
                    onEditTodo(id, newTitle);
                    setSelectedTodo(false);
                    setSelectedTodoId(0);
                  });
              }
            }}
            autoFocus
            data-cy="TodoTitleField"
            type="text"
            className="todo__title-field"
            placeholder="Empty todo will be deleted"
            value={newTitle}
            onChange={e => setNewTitle(e.target.value)}
          />
        </form>
      ) : (
        <>
          {' '}
          <span data-cy="TodoTitle" className="todo__title">
            {title}
          </span>
          {/* Remove button appears only on hover */}
          <button
            type="button"
            className="todo__remove"
            data-cy="TodoDelete"
            onClick={() => {
              onDeleteTodo(id);
            }}
          >
            ×
          </button>
          {/* overlay will cover the todo while it is being deleted or updated */}
          <div
            data-cy="TodoLoader"
            className={classNames('modal', 'overlay', {
              'is-active': loading && ID === id,
            })}
          >
            <div className="modal-background has-background-white-ter" />
            <div className="loader" />
          </div>{' '}
        </>
      )}
    </div>
  );
};
