import { useEffect, useState } from "react";
import { collection, query, onSnapshot } from "firebase/firestore";
import { db } from "../config/firebase";
import { useAuth } from "../contexts/AuthContext";
import "./Sidebar.css";

function Sidebar({ handleChange, isDark, setActivePage, isOpen, setIsOpen }) {

  const { user } = useAuth();
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (!user) return;
    const q = query(collection(db, "users", user.uid, "notifications"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setUnreadCount(snapshot.docs.filter((d) => !d.data().read).length);
    });
    return () => unsubscribe();
  }, [user]);

  return (
    <>
      <div className={`sidebar ${isOpen ? "open" : "closed"}`}>
        <div className="sidebar-header" onClick={() => setIsOpen(!isOpen)}>
          <h4 className="w3-padding-small">
            <span className="sidebar-title">{isOpen ? "Project Architects" : ""}</span>
            <i className="material-icons w3-hover-grey">menu</i>
          </h4>
        </div>

        <nav className="sidebar-nav">
          <ul className={`w3-ul w3-hoverable no-lines ${isOpen ? "" : "collapsed"}`}>

            <li className= "w3-hover-grey" onClick={() => setActivePage("home")}> 
              <i className="material-icons">home</i>
              <span className="sidebar-text">Home</span>
            </li>

            <li className= "w3-hover-grey" onClick={() => setActivePage("project")}>
              <i className="material-icons">folder</i>
              <span className="sidebar-text">Project</span>
            </li>

            <li className="w3-hover-grey" onClick={() => setActivePage("board")}>
              <i className="material-icons">view_kanban</i>
              <span className="sidebar-text">Board</span>
            </li>

            <li className= "w3-hover-grey" onClick={() => setActivePage("notification")}>
              <i className="material-icons">notifications</i>
              <span className="sidebar-text">Notification </span>
              {unreadCount > 0 && <span className="notif-badge">{unreadCount}</span>}
            </li>

            <li className= "w3-hover-grey" onClick={() => setActivePage("about")}>
              <i className="material-icons">info</i>
              <span className="sidebar-text">About</span>
            </li>

            <li className= "w3-hover-grey" onClick={() => setActivePage("logout")}>
              <i className="material-icons">logout</i>
              <span className="sidebar-text">Logout</span>
            </li>

          </ul>
          <hr></hr>
        </nav>

        <div className="toggle-container">
          <input
            type="checkbox"
            id="check"
            className="toggle" 
            onChange={handleChange}
            checked={isDark}
          />
          <label htmlFor="check" className="w3-large"> {isOpen ? "Dark Mode" : ""} </label>
        </div>
      </div>

      {isOpen && <div className="overlay" onClick={() => setIsOpen(false)} />}
    </>
  );
}

export default Sidebar;
