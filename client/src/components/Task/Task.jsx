import React from "react";
import  "./Task.css";

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

export const Task = ({
  id,
  title,
  assignedUserIds = [],
  members = [],
  currentUserId,
  onToggleAssignment
}) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition
  } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition
  };

  const normalizedAssignedUserIds = Array.isArray(assignedUserIds)
    ? assignedUserIds
    : [];
  const isAssignedToCurrentUser = Boolean(
    currentUserId && normalizedAssignedUserIds.includes(currentUserId)
  );

  const assignedMembers = normalizedAssignedUserIds.map((assignedUserId) => {
    const member = members.find((item) => item.id === assignedUserId);

    return {
      id: assignedUserId,
      label:
        member?.username ||
        member?.email ||
        (assignedUserId === currentUserId ? "You" : assignedUserId)
    };
  });

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className="task"
    >
      <input type="checkbox" className="checkbox" />
      <div className="task-content">
        <div className="task-meta">Task ID: {id}</div>
        <div className="task-title">{title}</div>
        <div className="task-assignees">
          {assignedMembers.length > 0 ? (
            assignedMembers.map((assignedMember) => (
              <span key={assignedMember.id} className="assignee-pill">
                {assignedMember.label}
              </span>
            ))
          ) : (
            <span className="task-unassigned">No assignees</span>
          )}
        </div>
        <button
          type="button"
          className="assign-button"
          onPointerDown={(event) => event.stopPropagation()}
          onClick={(event) => {
            event.stopPropagation();
            onToggleAssignment?.(id);
          }}
          disabled={!currentUserId}
        >
          {isAssignedToCurrentUser ? "Remove me" : "Assign me"}
        </button>
      </div>
    </div>
  );
};