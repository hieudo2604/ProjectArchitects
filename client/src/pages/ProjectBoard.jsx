import React from "react";
import {
  collection,
  query,
  orderBy,
  onSnapshot,
  doc,
  updateDoc
} from "firebase/firestore";
import { Column } from "../components/Column/Column";
import { useEffect, useState } from "react";
import { db } from "../config/firebase";
import { DndContext, closestCorners } from "@dnd-kit/core";
import { arrayMove } from "@dnd-kit/sortable";
import { Input } from "../components/Input/Input";

export default function KanbanBoard() {
  const [tasks, setTasks] = useState([
    { id: "1", title: "Task 1", column: "Todo" },
    { id: "2", title: "Task 2", column: "In Progress" },
    { id: "3", title: "Task 3", column: "Done" }
  ]);

  const [columns, setColumns] = useState([
    { id: "1", name: "To Do", content: "Market Research"},
    { id: "2", name: "In Progress", content: "Design Wireframes"},
    { id: "3", name: "Done", content: "Review and Testing" }
  ]);

  const [activeColumns, setActiveColumns] = useState("todo");

  const addTask = (title, column) => {
    const newTask = {
      id: Date.now().toString(),
      title,
      column
    };
    setTasks((prev) => [...prev, newTask]);
  };

  const removeTask = (columnId, taskId) => {
    setTasks((prev) => prev.filter(task => task.id !== taskId));
  };

  const getTaskPos = (id) => tasks.findIndex(task => task.id === id);

  const handleDragEnd = (event) => {
    const { active, over } = event;
    
    if (active.id == over.id) return;
    
    setTasks((tasks) => {
      const orignalPos = getTaskPos(active.id);
      const newPos = getTaskPos(over.id);

      return arrayMove(tasks, orignalPos, newPos);
    });
  };

  return (
    <DndContext onDragEnd={handleDragEnd} collisionDetection={closestCorners}>
      <div style={{ display: "flex", gap: "16px", textAlign: "center" }}>
        <Input onSubmit={addTask} />
        <Column tasks={tasks} columns={columns} />
      </div>
    </DndContext>
  );
}