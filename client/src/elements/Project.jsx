import React, { useEffect, useState } from "react";
import { useAuth } from "../contexts/AuthContext";
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
  const { currentUser } = useAuth();

  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);

  const [newProjectName, setNewProjectName] = useState("");
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState(null);

  // 🔥 Real-time project listener
  useEffect(() => {
    if (!currentUser) {
      setProjects([]);
      setLoading(false);
      return;
    }

    const q = query(
      collection(db, "projects"),
      where("memberIds", "array-contains", currentUser.uid),
      orderBy("updatedAt", "desc")
    );

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const results = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data()
        }));

        setProjects(results);
        setLoading(false);
      },
      (err) => {
        console.error("Error fetching projects:", err);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [currentUser]);

  // ➕ Create Project
  const handleCreateProject = async () => {
    if (!currentUser) return;
    if (!newProjectName.trim()) {
      setError("Project name cannot be empty.");
      return;
    }

    try {
      setCreating(true);
      setError(null);

      await addDoc(collection(db, "projects"), {
        name: newProjectName.trim(),
        ownerId: currentUser.uid,
        memberIds: [currentUser.uid],
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });

      setNewProjectName("");
    } catch (err) {
      console.error("Error creating project:", err);
      setError("Failed to create project.");
    } finally {
      setCreating(false);
    }
  };

  if (loading) return <p>Loading projects...</p>;

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
        <ul>
          {projects.map((project) => (
            <li key={project.id}>{project.name}</li>
          ))}
        </ul>
      ) : (
        <p>No projects available. Create one to get started.</p>
      )}
    </div>
  );
}

export default Project;