/* eslint-disable @typescript-eslint/no-unused-vars */

import { Todo } from '../types/Todo';
import classNames from 'classnames';
import { useState } from 'react';
import * as todosService from '../api/todos';
import { useRef, useEffect } from 'react';
import { TodoStatus } from '../types/TodoStatus';

type Props = {
  todo: Todo;
  onToggle: (id: number) => void;
  onDeleteTodo: (id: number) => void;
  loading: boolean;
  selected: number;
  setSelectedTodo: (todoId: number) => void;
  onEditTodo: (id: number, title: string) => void;
  onLoading: (is: boolean) => void;
  onError: (message: string) => void;
  onUpdateTodoTitle: (id: number, newTitle: string) => void;
};
export const TodoItem: React.FC<Props> = ({
  todo,
  onToggle,
  onDeleteTodo,
  loading,
  setSelectedTodo,
  onEditTodo,
  onLoading,
  onError,
}) => {
  const { title, completed, id } = todo;

  const [selectedTodoForEdit, setSelectedTodoForEdit] = useState(false);
  const [selectedTodoId, setSelectedTodoId] = useState(0);
  const [newTitle, setNewTitle] = useState(title);

  const [todoStatus, setTodoStatus] = useState<TodoStatus>('idle');
  const renameInputRef = useRef<HTMLInputElement | null>(null);

  const handleSubmitForChange = async (event: React.FormEvent) => {
    event.preventDefault();
    const trimmedTitle = newTitle.trim();

    if (todoStatus !== 'editing' || trimmedTitle === title) {
      setTodoStatus('idle');

      return;
    }

    setTodoStatus('updating');
    onLoading(true);

    if (trimmedTitle === '') {
      try {
        await onDeleteTodo(id);
      } catch {
        onError('Unable to delete a todo');
        onLoading(false);
        setTodoStatus('editing'); //  Поле залишається відкритим
        renameInputRef.current?.focus(); //  Фокусуємо інпут

        return;
      }

      return;
    }

    try {
      await todosService.patchTodo(id, { title: trimmedTitle });
      onEditTodo(id, trimmedTitle);
      setNewTitle(trimmedTitle);
      setTodoStatus('idle');
    } catch {
      onError('Unable to update a todo');
      setTodoStatus('editing'); //  Поле залишається відкритим при помилці
      renameInputRef.current?.focus(); //  Фокусуємо інпут
    } finally {
      onLoading(false);
    }
  };

  useEffect(() => {
    if (todoStatus === 'editing' && renameInputRef.current) {
      renameInputRef.current.focus();
    }
  }, [todoStatus]);

  const handleKeyUp = e => {
    if (e.key === 'Escape') {
      setTodoStatus('idle');
    }
  };

  const handleBlur = async () => {
    if (newTitle.trim() === '') {
      setTodoStatus('idle');
      try {
        onDeleteTodo(id);
      } catch {
        setTodoStatus('editing');
      }

      onError('Title should not be empty');
    } else {
      todosService
        .patchTodo(id, { title: newTitle })
        .catch(() => {
          onError('Unable to update a todo');
          setTodoStatus('editing');
        })
        .then(() => {
          onEditTodo(id, newTitle);
          setTodoStatus('idle');
          setSelectedTodoId(0);
        });
    }
  };

  if (!todo) {
    return null; // або покажіть заглушку
  }

  return (
    <div
      data-cy="Todo"
      key={todo.id}
      className={classNames('todo', { completed: completed })}
      onDoubleClick={() => {
        setSelectedTodoForEdit(true);
        setSelectedTodoId(id);
        setTodoStatus('editing');
      }}
    >
      <label className="todo__status-label">
        <input
          id={id}
          data-cy="TodoStatus"
          type="checkbox"
          className="todo__status"
          checked={completed}
          onChange={() => {
            onToggle(id);
            setSelectedTodo(id);
          }}
        />
        <span className="hidden" style={{ display: 'none' }}>
          *
        </span>
      </label>

      {todoStatus === 'editing' ? (
        <form
          onSubmit={event => {
            handleSubmitForChange(event);
          }}
        >
          <input
            ref={renameInputRef}
            onKeyUp={e => {
              handleKeyUp(e);
            }}
            onBlur={handleBlur}
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
              setSelectedTodo(id);
              onDeleteTodo(id);
            }}
          >
            ×
          </button>
          {/* overlay will cover the todo while it is being deleted or updated */}
          <div
            data-cy="TodoLoader"
            className={classNames('modal', 'overlay', {
              'is-active': loading || todoStatus === 'updating',
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
