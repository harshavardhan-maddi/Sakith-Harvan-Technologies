import React, { useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";
import "../styles/taskBar.css";

/**
 * TaskBar component – displays a solid colour progress bar for a given task.
 * Props:
 *   - taskId: string – the unique ID of the task.
 *   - title: string – task title (optional, displayed above the bar).
 *   - initialProgress: number (0‑100) – starting progress value.
 *   - initialStatus: string – initial status (e.g., 'Assigned', 'In Progress', 'Completed').
 *
 * The component subscribes to Supabase realtime changes on the `assigned_tasks`
 * table for the specific task ID. When the `progress` field updates, the bar animates
 * smoothly to the new value using CSS transitions.
 */
const TaskBar = ({ taskId, title = "", initialProgress = 0, initialStatus = "Assigned" }) => {
  const [progress, setProgress] = useState(initialProgress);
  const [status, setStatus] = useState(initialStatus);

  useEffect(() => {
    // Subscribe to realtime updates for this task only.
    const channel = supabase
      .channel(`task_${taskId}`)
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "assigned_tasks",
          filter: `id=eq.${taskId}`,
        },
        (payload) => {
          const newRecord = payload.new;
          if (newRecord) {
            if (newRecord.progress !== undefined) setProgress(newRecord.progress);
            if (newRecord.status) setStatus(newRecord.status);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [taskId]);

  // Determine bar colour based on status.
  const barColour = status === "Completed" ? "#4ade80" : "#3b82f6"; // green for completed, blue otherwise.

  return (
    <div className="task-bar-wrapper">
      {title && <div className="task-bar-title">{title}</div>}
      <div className="task-bar-bg">
        <div
          className="task-bar-fg"
          style={{ width: `${progress}%`, backgroundColor: barColour }}
        ></div>
      </div>
      <div className="task-bar-info">
        <span className="task-bar-perc">{progress}%</span>
        <span className="task-bar-status">{status}</span>
      </div>
    </div>
  );
};

export default TaskBar;
