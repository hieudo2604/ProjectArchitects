import React from "react";
import { useState } from "react";
import "./Input.css";


export const Input = ({ onSubmit }) => {
    const [input, setInput] = useState("");

    const handleSubmit = (e) => {
        e.preventDefault();
        if (input.trim()) {
            onSubmit(input, "todo");
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
                <button type="submit" className="button">Add Task</button>
            </form>
        </div>
    );
}