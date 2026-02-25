import { useEffect, useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../config/firebase";

function Home() {
  const { user } = useAuth();
  const [username, setUsername] = useState("");
  const [loadingUsername, setLoadingUsername] = useState(true);

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
        <h1>Loading...</h1>  
      ) : (
        <h1>Welcome, {username || "User"}!</h1>
      )}
      <p>Here is your agenda for today</p>
    </div>
  );
}

export default Home;