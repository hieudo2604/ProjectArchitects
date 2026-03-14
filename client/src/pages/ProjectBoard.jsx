import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import {
  doc,
  getDoc
} from "firebase/firestore";
import { db } from "../config/firebase";
import { getCurrentUser } from "../contexts/AuthContext";
import KanbanBoard from "../components/KanbanBoard";

function ProjectBoard() {
  const { projectId } = useParams();
  const { currentUser } = getCurrentUser();

  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [unauthorized, setUnauthorized] = useState(false);

  useEffect(() => {
    const fetchProject = async () => {
      if (!projectId || !currentUser) return;

      try {
        const projectRef = doc(db, "projects", projectId);
        const projectSnap = await getDoc(projectRef);

        if (!projectSnap.exists()) {
          setUnauthorized(true);
          setLoading(false);
          return;
        }

        const projectData = projectSnap.data();

        // 🔐 Validate membership
        if (!projectData.memberIds.includes(currentUser.uid)) {
          setUnauthorized(true);
        } else {
          setProject({ id: projectSnap.id, ...projectData });
        }
      } catch (err) {
        console.error(err);
        setUnauthorized(true);
      } finally {
        setLoading(false);
      }
    };

    fetchProject();
  }, [projectId, currentUser]);

  if (loading) return <p>Loading project...</p>;
  if (unauthorized) return <p>You do not have access to this project.</p>;

  return (
    <div>
      <h1>{project.name}</h1>

      {/* 🔥 Kanban Board */}
      <KanbanBoard projectId={projectId} />
    </div>
  );
}

export default ProjectBoard;