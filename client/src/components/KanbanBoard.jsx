import {
  DndContext,
  closestCenter
} from "@dnd-kit/core";
import {
  SortableContext,
  useSortable,
  verticalListSortingStrategy
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

import {
  collection,
  query,
  orderBy,
  onSnapshot,
  doc,
  updateDoc
} from "firebase/firestore";

import { useEffect, useState } from "react";
import { db } from "../config/firebase";

function KanbanBoard({ projectId }) {
  const [columns, setColumns] = useState([]);
  const [tasks, setTasks] = useState([]);

  // 🔥 Load Columns (real-time)
  useEffect(() => {
    const q = query(
      collection(db, `projects/${projectId}/columns`),
      orderBy("order")
    );

    return onSnapshot(q, (snapshot) => {
      setColumns(
        snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data()
        }))
      );
    });
  }, [projectId]);

  // 🔥 Load Tasks (single listener)
  useEffect(() => {
    const q = query(
      collection(db, `projects/${projectId}/tasks`),
      orderBy("order")
    );

    return onSnapshot(q, (snapshot) => {
      setTasks(
        snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data()
        }))
      );
    });
  }, [projectId]);

  // 🧠 Floating order algorithm
  function getNewOrder(columnTasks, index) {
    if (columnTasks.length === 0) return 1000;

    if (index === 0) return columnTasks[0].order / 2;

    if (index >= columnTasks.length)
      return columnTasks[columnTasks.length - 1].order + 1000;

    const prev = columnTasks[index - 1].order;
    const next = columnTasks[index].order;

    return (prev + next) / 2;
  }

  async function handleDragEnd(event) {
    const { active, over } = event;
    if (!over) return;

    const activeId = active.id;
    const overId = over.id;

    const activeTask = tasks.find((t) => t.id === activeId);
    if (!activeTask) return;

    const overTask = tasks.find((t) => t.id === overId);

    const destinationColumnId = overTask
      ? overTask.columnId
      : overId;

    const destinationTasks = tasks
      .filter((t) => t.columnId === destinationColumnId)
      .sort((a, b) => a.order - b.order);

    const index = overTask
      ? destinationTasks.findIndex((t) => t.id === overId)
      : destinationTasks.length;

    const newOrder = getNewOrder(destinationTasks, index);

    // Optimistic UI update
    setTasks((prev) =>
      prev.map((task) =>
        task.id === activeId
          ? { ...task, columnId: destinationColumnId, order: newOrder }
          : task
      )
    );

    const taskRef = doc(
      db,
      `projects/${projectId}/tasks/${activeId}`
    );

    await updateDoc(taskRef, {
      columnId: destinationColumnId,
      order: newOrder,
      updatedAt: new Date()
    });
  }

  return (
    <DndContext
      collisionDetection={closestCenter}
      onDragEnd={handleDragEnd}
    >
      <div style={{ display: "flex", gap: 16 }}>
        {columns.map((column) => {
          const columnTasks = tasks
            .filter((t) => t.columnId === column.id)
            .sort((a, b) => a.order - b.order);

          return (
            <Column
              columnId={column.id}
              title={column.name}
              tasks={tasksByColumn[column.id]}
              members={members}
              currentUserId={user?.uid}
              onToggleAssignment={toggleMemberAssignment}
              onDelete={deleteTask}
            />
          );
        })}
      </div>
    </DndContext>
  );
}

function Column({ column, tasks }) {
  return (
    <div
      style={{
        width: 300,
        background: "#f4f5f7",
        padding: 12,
        borderRadius: 8
      }}
    >
      <h3>{column.name}</h3>

      <SortableContext
        items={tasks.map((t) => t.id)}
        strategy={verticalListSortingStrategy}
      >
        {tasks.map((task) => (
          <TaskCard key={task.id} task={task} />
        ))}
      </SortableContext>
    </div>
  );
}

function TaskCard({ task }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition
  } = useSortable({ id: task.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    padding: 12,
    marginBottom: 8,
    background: "white",
    borderRadius: 6,
    boxShadow: "0 1px 2px rgba(0,0,0,0.1)",
    cursor: "grab"
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
    >
      {task.title}
    </div>
  );
}

export default KanbanBoard;