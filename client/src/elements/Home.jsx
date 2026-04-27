import { useEffect, useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import { doc, getDoc, collection, query, where, orderBy, onSnapshot } from "firebase/firestore";
import { db } from "../config/firebase";
//import Calendar from 'react-calendar';
//import 'react-calendar/dist/Calendar.css';
import "./Home.css";

function getGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) return "Good Morning";
  if (hour < 18) return "Good Afternoon";
  return "Good Evening";
}

function Home() {
  const { user } = useAuth();
  const [username, setUsername] = useState("");
  const [loadingUsername, setLoadingUsername] = useState(true);
  //const [value, onChange] = useState(new Date());
  const [projects, setProjects] = useState([]);
  const [loadingProjects, setLoadingProjects] = useState(true);
  const [membersByProject, setMembersByProject] = useState({});

  useEffect(() => {
  if (!user) { setLoadingProjects(false); return; }

  const q = query(
    collection(db, "projects"),
    where("memberIds", "array-contains", user.uid),
    orderBy("createdAt", "desc")
  );

  const unsubscribe = onSnapshot(q, async (snapshot) => {
    const fetched = snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
    setProjects(fetched);
    setLoadingProjects(false);

    // ← add this block to fetch members for each project
    const membersMap = {};
    await Promise.all(
      fetched.map(async (project) => {
        const memberIds = Array.isArray(project.memberIds) ? project.memberIds : [];
        const memberDocs = await Promise.all(
          memberIds.map((memberId) => getDoc(doc(db, "users", memberId)))
        );
        membersMap[project.id] = memberDocs
          .filter((d) => d.exists())
          .map((d) => ({ id: d.id, ...d.data() }));
      })
    );
    setMembersByProject(membersMap);  // ← update state
  });

  return unsubscribe;
}, [user]);

  useEffect(() => {
    const fetchUsername = async () => {
      if (!user) {
        setLoadingUsername(false);
        return;
      }

      try {
        const docRef = doc(db, "users", user.uid);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          setUsername(docSnap.data().username);
        } else {
          console.log("No username found in Firestore");
        }
      } catch (err) {
        console.error("Error fetching username:", err);
      } finally {
        setLoadingUsername(false); 
      }
    };

    fetchUsername();
  }, [user]);


  return (
    <div>
      <>
      {loadingUsername ? (
        <h2>Loading...</h2>  
      ) : (
        <h2>{getGreeting()}, {username || "User"}!</h2>
      )}
      <hr></hr>
      {/*
      <h6>Here is your agenda for today</h6>
      <div className="calendar-wrapper">
        <Calendar onChange={onChange} value={value} />
      </div>
      */}
      {loadingProjects ? (
        <div className="projects-container">
          <p className="projects-empty">Loading projects...</p>
        </div>
      ) : projects.length === 0 ? (
        <div className="projects-container">
          <p className="projects-empty">No projects yet. Create one to get started.</p>
        </div>
      ) : (
        <div style={{ border: "1px solid #444", borderRadius: "5px", padding: "10px", width: "320px", height: "auto" }}>
          <h6 style={{ marginTop: 0 }}>Projects</h6>
          <ul style={{paddingLeft: "20px"}}>
            {projects.map((project) => (
              <li
                key={project.id}
                style={{

                }}  
              >
                {project.name}
              </li>
            ))}
          </ul>
        </div>
      )}
      </>
      <br></br>
      <div style={{ border: "1px solid #444", borderRadius: "5px", padding: "10px", width: "320px", height: "auto" }}>
        <h6 style={{ marginTop: 0 }}>Board Members</h6>
        {(() => {
          const allMembers = Object.values(membersByProject)
            .flat()
            .filter((member, index, self) =>
              self.findIndex((m) => m.id === member.id) === index
            );
          return allMembers.length === 0 ? (
            <p style={{ color: "#000" }}>No members found.</p>
          ) : (
            <ul style={{ paddingLeft: "20px", margin: 0, color: "#000" }}>
              {allMembers.map((member) => (
                <li key={member.id}>
                  {member.username || member.email || member.id}
                </li>
              ))}
            </ul>
          );
        })()}
      </div>
    </div>
  );
}

export default Home;
