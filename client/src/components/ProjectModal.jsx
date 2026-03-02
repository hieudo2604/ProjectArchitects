import React, { useState } from 'react';

export default function ProjectModal({ isOpen, onClose, onSubmit }) {
    const [projectName, setProjectName] = useState('');
    const [description, setDescription] = useState('');
    const [error, setError] = useState('');

    const handleSubmit = (e) => {
        e.preventDefault();
        setError('');
        
        if (!projectName.trim()) {
            setError('Project name is required');
            return;
        }
        if (description.trim().length > 500) {
            setError('Description cannot exceed 500 characters');
            return;
        }

        onSubmit({
            name: projectName,
            description: description,
        });

        setProjectName('');
        setDescription('');
    };

    if (!isOpen) return null;

    return (
        <div className="modal-overlay">
            <div className="modal-content">
                <h2>Create New Project</h2>
                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label htmlFor="projectName">Project Name *</label>
                        <input
                            id="projectName"
                            type="text"
                            value={projectName}
                            onChange={(e) => setProjectName(e.target.value)}
                            placeholder="Enter project name"
                        />
                    </div>
                    
                    <div className="form-group">
                        <label htmlFor="description">Description</label>
                        <textarea
                            id="description"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            placeholder="Enter project description"
                        />
                    </div>

                    {error && <p className="error">{error}</p>}

                    <div className="modal-actions">
                        <button type="button" onClick={onClose}>Cancel</button>
                        <button type="submit">Create Project</button>
                    </div>
                </form>
            </div>
        </div>
    );
}