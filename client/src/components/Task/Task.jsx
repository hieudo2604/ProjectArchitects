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
  onToggleAssignment
}) => {
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
    <div ref={setNodeRef} style={style} {...attributes} {...listeners} className="task">
      <input type="checkbox" className="checkbox" />
      <div className="task-content">
        <div className="task-meta">Task ID: {id}</div>
        <div className="task-title">{title}</div>

        {/* Assigned member pills */}
        <div className="task-assignees">
          {assignedMembers.length > 0 ? (
            assignedMembers.map((assignedMember) => (
              <span key={assignedMember.id} className="assignee-pill">
                {assignedMember.label}
                {/* Click × to unassign */}
                <button
                  type="button"
                  onPointerDown={(e) => e.stopPropagation()}
                  onClick={(e) => {
                    e.stopPropagation();
                    onToggleAssignment?.(id, assignedMember.id);
                  }}
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
        <select
          value={selectedMember}
          onPointerDown={(e) => e.stopPropagation()}
          onChange={(e) => {
            e.stopPropagation();
            const memberId = e.target.value;
            if (memberId && !isProcessing.current) {  // ← guard here
              isProcessing.current = true;
              onToggleAssignment?.(id, memberId);
              setSelectedMember("");
              setTimeout(() => { isProcessing.current = false; }, 100);  // ← reset after
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
          {members.map((member) => {
            const isAssigned = normalizedAssignedUserIds.includes(member.id);
            return (
              <option key={member.id} value={member.id} disabled={isAssigned}>
                {isAssigned ? "✓ " : ""}{member.username || member.email}
              </option>
            );
          })}
        </select>
      </div>
    </div>
  );
};