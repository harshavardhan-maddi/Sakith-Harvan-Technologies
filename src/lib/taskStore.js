import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase, saveTaskToSupabase, updateTaskInSupabase, deleteTaskFromSupabase } from './supabaseClient';

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
    const channelId = `public:assigned_tasks_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const channel = supabase
      .channel(channelId)
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
    const saved = await saveTaskToSupabase(task);
    if (saved) setTasks((prev) => [saved, ...prev]);
  };

  const updateTask = async (id, updates) => {
    const updated = await updateTaskInSupabase(id, updates);
    if (updated) {
      // Refetch tasks or update local state based on realtime; here we rely on realtime channel
      // No direct state update needed
    }
  };

  const removeTask = async (id) => {
    const success = await deleteTaskFromSupabase(id);
    if (success) setTasks((prev) => prev.filter((t) => t.id !== id));
  };

  // Helper to replace entire task list (used for bulk sync)
  const setAllTasks = (newTasks) => setTasks(newTasks);
  return React.createElement(
    TaskContext.Provider,
    { value: { tasks, addTask, updateTask, removeTask, setAllTasks } },
    children
  );
};
