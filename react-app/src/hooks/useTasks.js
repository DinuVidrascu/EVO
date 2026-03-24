import { useState, useEffect } from 'react';

export const useTasks = () => {
  const [tasks, setTasks] = useState(() => {
    const saved = localStorage.getItem('evotrack_tasks');
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    localStorage.setItem('evotrack_tasks', JSON.stringify(tasks));
  }, [tasks]);

  const addTask = (task) => {
    setTasks(prev => [...prev, task]);
  };

  const updateTask = (id, updates) => {
    setTasks(prev => prev.map(t => t.id === id ? { ...t, ...updates } : t));
  };

  const toggleTaskStatus = (id) => {
    let completedStatus = false;
    setTasks(prev => prev.map(t => {
      if (t.id === id) {
        completedStatus = !t.completed;
        return { ...t, completed: completedStatus };
      }
      return t;
    }));
    return completedStatus;
  };

  const deleteTask = (id) => {
    setTasks(prev => prev.filter(t => t.id !== id));
  };

  return { tasks, addTask, updateTask, toggleTaskStatus, deleteTask };
};
