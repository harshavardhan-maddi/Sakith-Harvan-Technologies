import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase, upsertTask, deleteTask } from './supabaseClient';

// Create Task Context
const TaskContext = createContext();

export const useTask = () => useContext(TaskContext);

export const TaskProvider = ({ children }) => {
  const [tasks, setTasks] = useState([]);

  // Load initial tasks from Supabase
  useEffect(() => {
    const fetchTasks = async () => {
      const { data, error } = await supabase.from('assigned_tasks').select('*');
      if (!error && data) {
        setTasks(data);
      }
    };
    fetchTasks();
  }, []);

  // Subscribe to realtime changes
  useEffect(() => {
    const channel = supabase
      .channel('public:assigned_tasks')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'assigned_tasks' }, (payload) => {
        const newTask = payload.new;
        setTasks((prev) => {
          const idx = prev.findIndex((t) => t.id === newTask.id);
          if (idx > -1) {
            const updated = [...prev];
            updated[idx] = newTask;
            return updated;
          }
          return [newTask, ...prev];
        });
      })
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const addTask = async (task) => {
    const saved = await upsertTask(task);
    if (saved) setTasks((prev) => [saved, ...prev]);
  };

  const updateTask = async (id, updates) => {
    const updated = await upsertTask({ id, ...updates });
    if (updated) {
      setTasks((prev) => prev.map((t) => (t.id === id ? updated : t)));
    }
  };

  const removeTask = async (id) => {
    const success = await deleteTask(id);
    if (success) setTasks((prev) => prev.filter((t) => t.id !== id));
  };

  return (
    <TaskContext.Provider value={{ tasks, addTask, updateTask, removeTask }}>
      {children}
    </TaskContext.Provider>
  );
};
