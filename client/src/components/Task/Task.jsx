import React, { useState, useRef } from "react";
import "./Task.css";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

export const Task = ({
  id,
  title,
  assignedUserIds = [],
  members = [],
  currentUserId,
  onToggleAssignment,
  onDelete
}) => {
  console.log("Task rendered, onDelete:", onDelete);
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id });
  const [selectedMember, setSelectedMember] = useState("");
  const isProcessing = useRef(false);

  const style = {
    transform: CSS.Transform.toString(transform),
    transition
  };

  const normalizedAssignedUserIds = Array.isArray(assignedUserIds) ? assignedUserIds : [];

  const assignedMembers = normalizedAssignedUserIds.map((assignedUserId) => {
    const member = members.find((item) => item.id === assignedUserId);
    return {
      id: assignedUserId,
      label: member?.username || member?.email || (assignedUserId === currentUserId ? "You" : assignedUserId)
    };
  });

  return (
  <div ref={setNodeRef} style={{ ...style, position: "relative" }} {...attributes} className="task">
    
    {/* Drag handle — only this triggers drag */}
    <div
      {...listeners}
      style={{ cursor: "grab", color: "#aaa", fontSize: "16px", marginBottom: "4px", userSelect: "none" }}
    >
      ⠿
    </div>

    <div className="task-content">
      {/*<div className="task-meta">Task ID: {id}</div>*/}
      <div className="task-title">{title}</div>

      {/* Delete button */}
      <button
        type="button"
        onClick={() => onDelete?.(id)}
        style={{
          position: "absolute",
          top: "8px",
          right: "8px",
          padding: "2px 8px",
          border: "1px solid #fca5a5",
          borderRadius: "4px",
          background: "#fee2e2",
          cursor: "pointer",
          fontSize: "12px",
          color: "#dc2626"
        }}
      >
        ×
      </button>

      {/* Assigned member pills */}
      <div className="task-assignees">
        {assignedMembers.length > 0 ? (
          assignedMembers.map((assignedMember) => (
            <span key={assignedMember.id} className="assignee-pill">
              {assignedMember.label}
              <button
                type="button"
                onClick={() => onToggleAssignment?.(id, assignedMember.id)}
                style={{
                  marginLeft: "4px",
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  fontWeight: "bold",
                  color: "#888"
                }}
              >
                ×
              </button>
            </span>
          ))
        ) : (
          <span className="task-unassigned">No assignees</span>
        )}
      </div>

      {/* Dropdown to assign a member */}
      {normalizedAssignedUserIds.length === 0 && (
        <select
          value={selectedMember}
          onChange={(e) => {
            const memberId = e.target.value;
            if (memberId && !isProcessing.current) {
              isProcessing.current = true;
              onToggleAssignment?.(id, memberId);
              setSelectedMember("");
              setTimeout(() => { isProcessing.current = false; }, 100);
            }
          }}
          style={{
            marginTop: "8px",
            width: "100%",
            padding: "4px 6px",
            borderRadius: "4px",
            border: "1px solid #ccc",
            fontSize: "12px",
            cursor: "pointer"
          }}
        >
          <option value="">Assign member...</option>
          {members.map((member) => (
            <option key={member.id} value={member.id}>
              {member.username || member.email}
            </option>
          ))}
        </select>
      )}
    </div>
  </div>
);
};