import { useEffect } from "react";
import { useAuth } from "../contexts/AuthContext";

function Logout() {
  const { logout } = useAuth();

  useEffect(() => {
    const handleLogout = async () => {
      await logout();
      window.location.href = "/"; 
    };

    handleLogout();
  }, []);

  return null;
}

export default Logout;

