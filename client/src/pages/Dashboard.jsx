import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import useDarkmode from "../components/Darkmode";
import Sidebar from "../components/Sidebar";
import "./Dashboard.css";
import About from "../elements/About"
import Project from "../elements/Project";
import Logout from "../elements/Logout";
import Home from "../elements/Home";
import Notification from "../elements/Notification";
import ProjectBoard from "../pages/ProjectBoard";
//console.log("React version:", React.version);

function Dashboard() {
  const [isDark, setIsDark] = useDarkmode("isDark", false);
  const [isOpen, setIsOpen] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();
  const activePage = new URLSearchParams(location.search).get("page") || "home";
  const selectedProjectId = new URLSearchParams(location.search).get("projectId");

  const setActivePage = (page, projectId) => {
    const searchParams = new URLSearchParams();
    searchParams.set("page", page);

    if (projectId) {
      searchParams.set("projectId", projectId);
    } else if (page === "board" && selectedProjectId) {
      searchParams.set("projectId", selectedProjectId);
    }

    navigate(`/dashboard?${searchParams.toString()}`);
  };

  return (
    <div className="App" data-theme={isDark ? "dark" : "light"}>
      <Sidebar isDark={isDark} handleChange={() => setIsDark(!isDark)} setActivePage={setActivePage} isOpen={isOpen} setIsOpen={setIsOpen}/>
      <main className={`content ${isDark ? "dark" : "light"}  ${isOpen ? "expanded" : "collapsed"}`}>
        {activePage ==="home" && <Home />}
        {activePage ==="about" && <About />}
        {activePage === "project" && <Project setActivePage={setActivePage} />}
        {activePage === "board" && <ProjectBoard projectId={selectedProjectId} />}
        {activePage ==="notification" && <Notification />}
        {activePage ==="logout" && <Logout />}
      </main>
    </div>
  );
}

export default Dashboard;