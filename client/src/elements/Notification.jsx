import { useEffect, useState } from "react";
import { collection, query, orderBy, updateDoc, doc, onSnapshot } from "firebase/firestore";
import { db } from "../config/firebase";
import { useAuth } from "../contexts/AuthContext";
import {toast, ToastContainer} from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';


function Notification() {
    const { user } = useAuth();
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!user) { setLoading(false); return; }

        const q = query(
            collection(db, "users", user.uid, "notifications"),
            orderBy("createdAt", "desc")
        );

        const unsubscribe = onSnapshot(q, (snapshot) => {
            snapshot.docChanges().forEach((change) => {
                if (change.type === "added") {
                    const notif = change.doc.data();
                    if (!notif.read){
                        toast(notif.title || "New Notification", { type: "info" });
                    }
                }
            });
            setNotifications(snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
            setLoading(false);
        });

        return () => unsubscribe();
    }, [user]);

    const markAsRead = async (id) => {
        updateDoc(doc(db, "users", user.uid, "notifications", id), { read: true });
    };

    const markAllAsRead = async () => {
        Promise.all(notifications
            .filter(notif => !notif.read)
            .map(notif => updateDoc(doc(db, "users", user.uid, "notifications", notif.id), { read: true }))
        );
    }

    const unreadCount = notifications.filter(notif => !notif.read).length;
    if (loading) return <div>Loading...</div>;

    const handleDelete = (notifId, projectName) => {
    if (window.confirm("Are you sure you want to delete this notification?")) {
      deleteNotification(notifId, projectName);
    }
  }

    const deleteNotification = async (notifId, projectName) => {
      try {
        await deleteDoc(doc(db, "projects", notifId));
        setProjects((prev) => prev.filter((p) => p.id !== notifId));
        await sendNotification(
        "Project Deleted",
        `Project "${projectName}" has been deleted.`
        );
      } catch (err) {
          console.error("Failed to delete project:", err);
      }
    }

    return (
    <div className="notification-page">
      <ToastContainer position="top-right" />

      <div className="notification-header">
        <h3>
          Notifications
          {unreadCount > 0 && <span className="notif-badge">{unreadCount}</span>}
        </h3>
        {unreadCount > 0 && <button onClick={markAllAsRead}>Mark all as read</button>}
      </div>

      {notifications.length === 0 ? (
        <p className="notif-empty">You're all caught up!</p>
      ) : (
        <ul className="notif-list">
          {notifications.map((notif) => (
            <li
              key={notif.id}
              className={`notif-item ${notif.read ? "read" : "unread"}`}
              onClick={() => !notif.read && markAsRead(notif.id)}
            >
              <div className="notif-title">{notif.title}</div>
              <div className="notif-body">{notif.body}</div>
              <div className="notif-time">{notif.createdAt?.toDate().toLocaleString()}</div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default Notification;