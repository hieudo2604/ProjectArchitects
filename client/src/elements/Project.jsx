import React, { useEffect, useState } from "react";
import { getCurrentUser } from "../contexts/AuthContext";
import { useNavigate } from "react-router-dom";
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

function Project() {
  const navigate = useNavigate();
  const currentUser = getCurrentUser();

  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);

  const [newProjectName, setNewProjectName] = useState("");
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState(null);

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


  // ➕ Create Project
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

      setNewProjectName(newProjectName.trim());
      setProjects((prev) => [...prev, { name: newProjectName.trim(), id: Date.now() }]);
      navigate(`/projectboard/${newProjectName.trim()}`);
      { setActivePage(`projectboard/${newProjectName.trim()}`) }
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

      {/* ➕ Create Project UI */}
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

      {/* 📋 Project List */}
      {projects.length > 0 ? (
        <ul style={{ listStyle: "none", padding: 0 }}>
          {projects.map((project) => (
            <li
              key={project.id}
              onClick={() => {
                navigate(`/projectboard/${project.name}`);
                setActivePage(`projectboard/${project.name}`);
              }}
              style={{
                padding: "12px",
                border: "1px solid #000000",
                borderRadius: "4px",
                marginBottom: "10px",
                cursor: "pointer",
                backgroundColor: "#f9f9f9"
              }}
            >
              {project.name}
            </li>
          ))}
        </ul>

      ) : (
        <p>No projects available. Create one to get started.</p>
      )}
    </div>
  );
}

export default Project;