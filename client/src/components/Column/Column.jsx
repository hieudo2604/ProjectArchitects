import React from "react";
import "./Column.css";
import { SortableContext } from "@dnd-kit/sortable";
import { verticalListSortingStrategy } from "@dnd-kit/sortable";
import { useDroppable } from "@dnd-kit/core";
import { Task } from "../Task/Task";

export const Column = ({
  columnId,
  title,
  tasks = [],
  members = [],
  currentUserId,
  onToggleAssignment
}) => {
  const { setNodeRef } = useDroppable({ id: columnId });
  const taskCount = tasks.length;

  const statusClass = {
    todo: "badge-todo",
    "in-progress": "badge-in-progress",
    done: "badge-done"
  }[columnId] || "badge-default";

  return (
    <div ref={setNodeRef} className="column">
      <div className="column-header">
        <h2 className="column-title">{title}</h2>
        <div className="column-meta">
          <span className={`status-badge ${statusClass}`}>{title}</span>
          <span className="task-count">{taskCount}</span>
        </div>
      </div>
      <SortableContext
        items={tasks.map((task) => task.id)}
        strategy={verticalListSortingStrategy}
      >
        {tasks.map((task) => (
          <Task
            key={task.id}
            id={task.id}
            title={task.title}
            assignedUserIds={task.assignedUserIds}
            members={members}
            currentUserId={currentUserId}
            onToggleAssignment={onToggleAssignment}
          />
        ))}
      </SortableContext>
    </div>
  );
};