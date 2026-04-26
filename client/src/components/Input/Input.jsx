import React from "react";
import { useState } from "react";
import "./Input.css";


export const Input = ({ onSubmit }) => {
    const [input, setInput] = useState("");
    const [column, setColumn] = useState("todo");

    const handleSubmit = (e) => {
        e.preventDefault();
        if (input.trim()) {
            onSubmit(input, column);
            setInput("");
        }
    };


    return (
        <div className="container">
            <form onSubmit={handleSubmit}>
                <input
                    type="text"
                    className="input"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="Enter a new task..."
                />
                <select value={column} onChange={(e) => setColumn(e.target.value)} className="select">
                    <option value="todo">To-Do</option>
                    <option value="in-progress">In-Progress</option>
                    <option value="done">Done</option>
                </select>
                <button type="submit" className="button">Add Task</button>
            </form>
        </div>
    );
}