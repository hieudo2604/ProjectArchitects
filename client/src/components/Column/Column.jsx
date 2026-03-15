import React from "react";
import "./Column.css";
import { SortableContext } from "@dnd-kit/sortable";
import { verticalListSortingStrategy } from "@dnd-kit/sortable";
import { Task } from "../Task/Task";


export const Column = ({ tasks = [{ id: 1, title: "Task" }] }) => {
  return (
    <div className="column">
      <h2 className="column-title">{tasks[0]?.column || "Column"}</h2>
      <SortableContext items={tasks} strategy={verticalListSortingStrategy}>
        {tasks.map((task) => (
          <Task key={task.id} id={task.id} title={task.title} />
        ))}
      </SortableContext>
    </div>
  );
};