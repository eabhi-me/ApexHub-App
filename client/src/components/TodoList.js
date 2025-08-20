import React from 'react';
import TodoItem from './TodoItem';

const TodoList = ({ todos }) => {
  if (todos.length === 0) {
    return null;
  }

  return (
    <div className="space-y-4">
      {todos.map(todo => (
        <TodoItem key={todo._id} todo={todo} />
      ))}
    </div>
  );
};

export default TodoList;
