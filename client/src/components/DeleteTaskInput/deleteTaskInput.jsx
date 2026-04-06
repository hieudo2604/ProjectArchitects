import { useState } from "react";
import "./deleteTaskInput.css";

export const DeleteTaskInput = ({ onDelete }) => {
    const [taskId, setTaskId] = useState("");
    const handleDelete = (e) => {
        e.preventDefault();
        if (taskId.trim()) {
            onDelete(taskId);
            setTaskId("");
        }
    };

    return (
        <div className="delete-container">
            <form onSubmit={handleDelete}>
                <input
                    type="text"
                    className="delete-input"
                    value={taskId}
                    onChange={(e) => setTaskId(e.target.value)}
                    placeholder="Enter task ID to delete..."
                />
                <br></br>
                <button type="submit" className="delete-button">Delete Task</button>
            </form>
        </div>
    );
}