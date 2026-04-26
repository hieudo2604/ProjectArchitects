import React, { useEffect, useState } from "react";
import { getCurrentUser } from "../contexts/AuthContext";
//import { useNavigate } from "react-router-dom";
import {
  collection,
  query,
  where,
  orderBy,
  onSnapshot,
  addDoc,
  serverTimestamp
} from "firebase/firestore";
import { db } from "../config/firebase";
import { doc, deleteDoc } from "firebase/firestore";

function Project({ setActivePage }) {
  const currentUser = getCurrentUser();

  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);

  const [newProjectName, setNewProjectName] = useState("");
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState(null);

  const sendNotification = async (title, body) => {
    await addDoc(collection(db, "users", currentUser.uid, "notifications"), {
      title,
      body,
      read: false,
      createdAt: serverTimestamp()
    });
  };

  const handleDelete = (projectId, projectName) => {
    if (window.confirm("Are you sure you want to delete this project?")) {
      deleteProject(projectId, projectName);
    }
  }

  const deleteProject = async (projectId, projectName) => {
    try {
      await deleteDoc(doc(db, "projects", projectId));
      setProjects((prev) => prev.filter((p) => p.id !== projectId));
      await sendNotification(
        "Project Deleted",
        `Project "${projectName}" has been deleted.`
      );
    } catch (err) {
      console.error("Failed to delete project:", err);
    }
  };

  // Retrieve projects from Firestore where current user is a member
  useEffect(() => {
    if (!currentUser) {
      setLoading(false);
      return;
    }

    const q = query(
      collection(db, "projects"),
      where("memberIds", "array-contains", currentUser.uid),
      orderBy("createdAt", "desc")
    );
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const projects = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data()
      }));
      setProjects(projects);
      setLoading(false);
    });

    return unsubscribe;
  }, [currentUser]);


  // Create Project
  const handleCreateProject = async () => {
    if (!newProjectName.trim()) {
      setError("Project name cannot be empty.");
      setCreating(false);
      return;
    }

    try {
      setCreating(true);
      setError(null);

      // Create new project in Firestore
      await addDoc(collection(db, "projects"), {
        name: newProjectName.trim(),
        ownerId: currentUser.uid,
        memberIds: [currentUser.uid],
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });

      await sendNotification(
        "Project Created",
        `Project "${newProjectName.trim()}" has been created successfully.`
      );

      setNewProjectName("");
      //setProjects((prev) => [...prev, { name: newProjectName.trim(), id: Date.now() }]);
      //goToProjectBoard(newProjectName.trim());
    } catch (err) {
      console.error("Error creating project:", err);
      setError("Failed to create project.");
    } finally {
      setCreating(false);
    }
  };


  return (
    <div style={{ maxWidth: "600px", margin: "0 auto" }}>
      <h1>Projects</h1>

      {/* Create Project UI */}
      <div style={{ marginBottom: "20px" }}>
        <input
          type="text"
          placeholder="Enter project name"
          value={newProjectName}
          onChange={(e) => setNewProjectName(e.target.value)}
          style={{
            padding: "8px",
            width: "70%",
            marginRight: "8px"
          }}
        />

        <button
          onClick={handleCreateProject}
          disabled={creating}
          style={{
            padding: "8px 12px",
            backgroundColor: creating ? "lightgray" : "lightblue",
            cursor: creating ? "not-allowed" : "pointer"
          }}
        >
          {creating ? "Creating..." : "Create"}
        </button>

        {error && (
          <p style={{ color: "red", marginTop: "8px" }}>{error}</p>
        )}
      </div>

      {/* Project List */}
      {loading ? (
        <p>Loading projects...</p>
      ) : projects.length === 0 ? (
        <p>No projects yet. Create one to get started.</p>
      ) : (
        <ul style={{ listStyle: "none", padding: 0 }}>
          {projects.map((project) => (
            <li
              key={project.id}
              onClick={() => setActivePage("board", project.id)}
              style={{
                position: "relative",
                padding: "12px",
                border: "1px solid #888",
                borderRadius: "4px",
                marginBottom: "10px",
                cursor: "pointer",
                backgroundColor: "transparent"
              }}
            >
              {project.name}
              <button
                onClick={(e) => {
                  e.stopPropagation(); 
                  handleDelete(project.id, project.name);
                }}
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
                title="Delete project"
              >
                ✕
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default Project;