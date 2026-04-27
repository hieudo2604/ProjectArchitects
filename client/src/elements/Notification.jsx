import { useEffect, useState } from "react";
import { collection, query, orderBy, updateDoc, deleteDoc, doc, onSnapshot } from "firebase/firestore";
import { db } from "../config/firebase";
import { useAuth } from "../contexts/AuthContext";
import {toast, ToastContainer} from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import './Notification.css';

function Notification() {
    const { user } = useAuth();
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState(null);
  const [deletingAll, setDeletingAll] = useState(false);

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
        await Promise.all(notifications
            .filter(notif => !notif.read)
            .map(notif => updateDoc(doc(db, "users", user.uid, "notifications", notif.id), { read: true }))
        );
    };

    const deleteNotification = async (id) => {
        if (!window.confirm("Delete this notification?")) {
            return;
        }

        try {
            setDeletingId(id);
            await deleteDoc(doc(db, "users", user.uid, "notifications", id));
            setNotifications((current) => current.filter((notif) => notif.id !== id));
        } catch (err) {
            console.error("Failed to delete notification:", err);
        } finally {
            setDeletingId(null);
        }
    };

    const deleteAllNotifications = async () => {
        if (!notifications.length) {
            return;
        }

        if (!window.confirm("Delete all notifications?")) {
            return;
        }

        try {
            setDeletingAll(true);
            await Promise.all(
                notifications.map((notif) =>
                    deleteDoc(doc(db, "users", user.uid, "notifications", notif.id))
                )
            );
            setNotifications([]);
        } catch (err) {
            console.error("Failed to delete all notifications:", err);
        } finally {
            setDeletingAll(false);
        }
    };

    const unreadCount = notifications.filter(notif => !notif.read).length;
    if (loading) return <div>Loading...</div>;

    return (
    <div className="notification-page">
      <ToastContainer position="top-right" />

      <div className="notification-header">
        <h3>
          Notifications
          {unreadCount > 0 && <span className="notif-badge">{unreadCount}</span>}
        </h3>
        <div className="notification-actions">
          {unreadCount > 0 && <button onClick={markAllAsRead}>Mark all as read</button>}
          {notifications.length > 0 && (
            <button className="notif-danger-button" onClick={deleteAllNotifications} disabled={deletingAll}>
              {deletingAll ? "Deleting..." : "Delete all"}
            </button>
          )}
        </div>
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
              <div className="notif-content">
                <div className="notif-title">{notif.title}</div>
                <div className="notif-body">{notif.body}</div>
                <div className="notif-time">{notif.createdAt?.toDate().toLocaleString()}</div>
              </div>
              <button
                className="notif-delete-button"
                onClick={(event) => {
                  event.stopPropagation();
                  deleteNotification(notif.id);
                }}
                disabled={deletingId === notif.id}
                aria-label={`Delete notification ${notif.title || "item"}`}
              >
                {deletingId === notif.id ? "..." : "Delete"}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default Notification;