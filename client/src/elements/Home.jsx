import { useEffect, useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../config/firebase";
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
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
  const [value, onChange] = useState(new Date());

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
      {loadingUsername ? (
        <h2>Loading...</h2>  
      ) : (
        <h2>{getGreeting()}, {username || "User"}!</h2>
      )}
      <h6>Here is your agenda for today</h6>
      <div className="calendar-wrapper">
        <Calendar onChange={onChange} value={value} />
      </div>
      <h6>Project Directory</h6>
    </div>
  );
}

export default Home;