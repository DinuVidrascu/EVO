import { useState, useEffect } from 'react';

// Safe localStorage helpers cu try/catch (rezistent la modul privat / storage plin)
const safeGet = (key, fallback = null) => {
  try {
    const val = localStorage.getItem(key);
    if (!val) return fallback;
    const parsed = JSON.parse(val);
    return parsed;
  } catch {
    console.warn(`[useTasks] Nu s-a putut citi "${key}" din localStorage.`);
    return fallback;
  }
};

const safeSet = (key, value) => {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (e) {
    console.warn(`[useTasks] Nu s-a putut salva "${key}" în localStorage:`, e.message);
  }
};

// Validare minimă a unui task (previne corupția datelor)
const isValidTask = (t) =>
  t &&
  typeof t === 'object' &&
  typeof t.id !== 'undefined' &&
  typeof t.title === 'string';

export const useTasks = () => {
  const [tasks, setTasks] = useState(() => {
    const saved = safeGet('evotrack_tasks', []);
    // Filtrează task-urile invalide/corupte
    if (Array.isArray(saved)) {
      return saved.filter(isValidTask);
    }
    return [];
  });

  useEffect(() => {
    safeSet('evotrack_tasks', tasks);
  }, [tasks]);

  const addTask = (task) => {
    if (!isValidTask(task)) {
      console.warn('[useTasks] Task invalid, nu s-a adăugat:', task);
      return;
    }
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
