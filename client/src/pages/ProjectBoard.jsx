import React from "react";
import { Column } from "../components/Column/Column";
import { useEffect, useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import { useParams } from "react-router-dom";
import { DndContext, closestCorners } from "@dnd-kit/core";
import { arrayMove } from "@dnd-kit/sortable";
import { Input } from "../components/Input/Input";
import { DeleteTaskInput } from "../components/DeleteTaskInput/deleteTaskInput";
import {
  arrayUnion,
  collection,
  doc,
  getDoc,
  getDocs,
  limit,
  onSnapshot,
  query,
  serverTimestamp,
  updateDoc,
  where,
  writeBatch
} from "firebase/firestore";
import { db } from "../config/firebase";

const KANBAN_COLUMNS = [
  { id: "todo", name: "To-Do" },
  { id: "in-progress", name: "In-Progress" },
  { id: "done", name: "Done" }
];

export default function KanbanBoard() {
  const { projectId } = useParams();
  const { user } = useAuth();
  const [tasksByColumn, setTasksByColumn] = useState({
    todo: [{ id: "1", title: "Task 1" }],
    "in-progress": [{ id: "2", title: "Task 2" }],
    done: [{ id: "3", title: "Task 3" }]
  });
  const [saving, setSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState("");
  const [memberEmail, setMemberEmail] = useState("");
  const [addingMember, setAddingMember] = useState(false);
  const [memberMessage, setMemberMessage] = useState("");
  const [members, setMembers] = useState([]);
  const [membersLoading, setMembersLoading] = useState(true);

  useEffect(() => {
    if (!projectId) {
      setMembers([]);
      setMembersLoading(false);
      return;
    }

    const projectRef = doc(db, "projects", projectId);
    const unsubscribe = onSnapshot(projectRef, async (projectSnapshot) => {
      if (!projectSnapshot.exists()) {
        setMembers([]);
        setMembersLoading(false);
        return;
      }

      const data = projectSnapshot.data();
      const memberIds = Array.isArray(data.memberIds) ? data.memberIds : [];

      if (memberIds.length === 0) {
        setMembers([]);
        setMembersLoading(false);
        return;
      }

      const memberDocs = await Promise.all(
        memberIds.map((memberId) => getDoc(doc(db, "users", memberId)))
      );

      setMembers(
        memberDocs
          .filter((memberDoc) => memberDoc.exists())
          .map((memberDoc) => ({
            id: memberDoc.id,
            ...memberDoc.data()
          }))
      );
      setMembersLoading(false);
    });

    return unsubscribe;
  }, [projectId]);

  const addTask = (title, column) => {
    const newTask = {
      id: Date.now().toString(),
      title
    };

    setTasksByColumn((prev) => ({
      ...prev,
      [column]: [...prev[column], newTask]
    }));
  };

  // Delete task function (not used in this snippet, but can be implemented similarly to addTask)
  const deleteTask = (taskId) => {
    setTasksByColumn((prev) => {
      const newState = { ...prev };
      for (const column in newState) {
        newState[column] = newState[column].filter((task) => task.id !== taskId);
      }
      return newState;
    });
  };

  const findTaskLocation = (taskId, state) => {
    for (const column of KANBAN_COLUMNS) {
      const index = state[column.id].findIndex((task) => task.id === taskId);
      if (index !== -1) {
        return { columnId: column.id, index };
      }
    }

    return null;
  };

  const isColumnId = (id) => KANBAN_COLUMNS.some((column) => column.id === id);

  const handleDragEnd = (event) => {
    const { active, over } = event;

    if (!over) return;

    const activeId = String(active.id);
    const overId = String(over.id);

    setTasksByColumn((prev) => {
      const source = findTaskLocation(activeId, prev);
      if (!source) return prev;

      let destinationColumnId = source.columnId;
      let destinationIndex = prev[source.columnId].length - 1;

      if (isColumnId(overId)) {
        destinationColumnId = overId;
        destinationIndex = prev[destinationColumnId].length;
      } else {
        const overLocation = findTaskLocation(overId, prev);
        if (!overLocation) return prev;
        destinationColumnId = overLocation.columnId;
        destinationIndex = overLocation.index;
      }

      if (source.columnId === destinationColumnId) {
        if (source.index === destinationIndex) return prev;

        return {
          ...prev,
          [source.columnId]: arrayMove(
            prev[source.columnId],
            source.index,
            destinationIndex
          )
        };
      }

      const sourceTasks = [...prev[source.columnId]];
      const destinationTasks = [...prev[destinationColumnId]];

      const [movedTask] = sourceTasks.splice(source.index, 1);
      destinationTasks.splice(destinationIndex, 0, movedTask);

      return {
        ...prev,
        [source.columnId]: sourceTasks,
        [destinationColumnId]: destinationTasks
      };
    });
  };

  const handleSaveBoard = async () => {
    if (!projectId) {
      setSaveMessage("Cannot save: missing project id.");
      return;
    }

    if (!user?.uid) {
      setSaveMessage("Cannot save: you must be logged in.");
      return;
    }

    try {
      setSaving(true);
      setSaveMessage("");

      const boardColumns = KANBAN_COLUMNS.map((column) => ({
        id: column.id,
        name: column.name,
        taskCount: tasksByColumn[column.id].length
      }));

      const flatTasks = KANBAN_COLUMNS.flatMap((column) =>
        tasksByColumn[column.id].map((task, index) => ({
          id: task.id,
          title: task.title,
          columnId: column.id,
          order: index,
          updatedBy: user.uid
        }))
      );

      const projectRef = doc(db, "projects", projectId);
      const tasksCollectionRef = collection(db, "projects", projectId, "tasks");
      const existingTasksSnapshot = await getDocs(tasksCollectionRef);

      const localTaskIds = new Set(flatTasks.map((task) => task.id));
      const batch = writeBatch(db);

      batch.set(
        projectRef,
        {
          boardState: {
            columns: boardColumns,
            taskIdsByColumn: KANBAN_COLUMNS.reduce((acc, column) => {
              acc[column.id] = tasksByColumn[column.id].map((task) => task.id);
              return acc;
            }, {}),
            totalTasks: flatTasks.length,
            lastSavedAt: serverTimestamp(),
            lastSavedBy: user.uid
          },
          updatedAt: serverTimestamp()
        },
        { merge: true }
      );

      for (const task of flatTasks) {
        const taskRef = doc(db, "projects", projectId, "tasks", task.id);
        batch.set(
          taskRef,
          {
            title: task.title,
            columnId: task.columnId,
            order: task.order,
            updatedAt: serverTimestamp(),
            updatedBy: task.updatedBy
          },
          { merge: true }
        );
      }

      existingTasksSnapshot.forEach((taskDoc) => {
        if (!localTaskIds.has(taskDoc.id)) {
          batch.delete(taskDoc.ref);
        }
      });

      await batch.commit();
      setSaveMessage("Board saved to Firestore.");
    } catch (error) {
      console.error("Error saving board:", error);
      setSaveMessage("Failed to save board.");
    } finally {
      setSaving(false);
    }
  };

  const handleAddMember = async () => {
    const normalizedEmail = memberEmail.trim().toLowerCase();

    if (!user?.uid) {
      setMemberMessage("Cannot add member: you must be logged in.");
      return;
    }

    if (!normalizedEmail) {
      setMemberMessage("Please enter an email address.");
      return;
    }

    try {
      setAddingMember(true);
      setMemberMessage("");

      const usersRef = collection(db, "users");
      const userQuery = query(
        usersRef,
        where("email", "==", normalizedEmail),
        limit(1)
      );
      const userSnapshot = await getDocs(userQuery);

      if (userSnapshot.empty) {
        setMemberMessage("No user found with that email.");
        return;
      }

      const memberUid = userSnapshot.docs[0].id;
      const projectRef = doc(db, "projects", projectId);

      await updateDoc(projectRef, {
        memberIds: arrayUnion(memberUid),
        updatedAt: serverTimestamp()
      });

      setMemberMessage("Member added to board.");
      setMemberEmail("");
    } catch (error) {
      console.error("Error adding member:", error);
      setMemberMessage("Failed to add member.");
    } finally {
      setAddingMember(false);
    }
  };

  return (
    <DndContext onDragEnd={handleDragEnd} collisionDetection={closestCorners}>
      <div style={{ marginBottom: "16px" }}>
        <div
          style={{
            display: "flex",
            gap: "12px",
            flexWrap: "wrap",
            alignItems: "flex-start"
          }}
        >
          <div style={{ flex: "1 1 260px", minWidth: "260px" }}>
            <Input onSubmit={addTask} />
          </div>
          <div style={{ flex: "1 1 260px", minWidth: "260px" }}>
            <DeleteTaskInput onDelete={deleteTask} />
          </div>
          <div
            style={{
              flex: "1 1 280px",
              minWidth: "280px",
              display: "flex",
              gap: "8px",
              alignItems: "center",
              marginBottom: "16px"
            }}
          >
            <input
              type="email"
              value={memberEmail}
              onChange={(e) => setMemberEmail(e.target.value)}
              placeholder="Member email"
              style={{
                flex: 1,
                padding: "8px",
                borderRadius: "6px",
                border: "1px solid #ccc"
              }}
            />
            <button
              type="button"
              onClick={handleAddMember}
              disabled={addingMember}
              style={{
                padding: "8px 12px",
                border: "none",
                borderRadius: "6px",
                backgroundColor: addingMember ? "#9aa0a6" : "#1d4ed8",
                color: "#ffffff",
                cursor: addingMember ? "not-allowed" : "pointer"
              }}
            >
              {addingMember ? "Adding..." : "Add Member"}
            </button>
          </div>
          <button
            type="button"
            onClick={handleSaveBoard}
            disabled={saving}
            style={{
              padding: "8px 12px",
              border: "none",
              borderRadius: "6px",
              backgroundColor: saving ? "#8aa4b3" : "#0f766e",
              color: "#ffffff",
              cursor: saving ? "not-allowed" : "pointer",
              height: "40px",
              marginBottom: "16px"
            }}
          >
            {saving ? "Saving..." : "Save Board"}
          </button>
        </div>
        {memberMessage ? <p style={{ marginTop: "8px" }}>{memberMessage}</p> : null}
        <div style={{ marginTop: "8px" }}>
          <strong>Board Members</strong>
          {membersLoading ? (
            <p>Loading members...</p>
          ) : members.length === 0 ? (
            <p>No members found.</p>
          ) : (
            <ul style={{ marginTop: "6px", paddingLeft: "18px" }}>
              {members.map((member) => (
                <li key={member.id}>
                  {member.username || member.email || member.id}
                  {member.email ? ` (${member.email})` : ""}
                </li>
              ))}
            </ul>
          )}
        </div>
        {saveMessage ? (
          <p style={{ marginTop: "8px" }}>{saveMessage}</p>
        ) : null}
      </div>

      <div style={{ display: "flex", gap: "16px", textAlign: "center" }}>
        {KANBAN_COLUMNS.map((column) => (
          <Column
            key={column.id}
            columnId={column.id}
            title={column.name}
            tasks={tasksByColumn[column.id]}
          />
        ))}
      </div>
    </DndContext>
  );
}