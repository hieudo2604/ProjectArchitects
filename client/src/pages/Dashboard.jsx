import React, { useState } from "react";
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
  const [activePage, setActivePage] = useState("home");
  const [isOpen, setIsOpen] = useState(true);

  return (
    <div className="App" data-theme={isDark ? "dark" : "light"}>
      <Sidebar isDark={isDark} handleChange={() => setIsDark(!isDark)} setActivePage={setActivePage} isOpen={isOpen} setIsOpen={setIsOpen}/>
      <main className={`content ${isDark ? "dark" : "light"}  ${isOpen ? "expanded" : "collapsed"}`}>
        {activePage ==="home" && <Home />}
        {activePage ==="about" && <About />}
        {activePage === "project" && <Project setActivePage={setActivePage} />}
        {activePage === "board" && <ProjectBoard />}
        {activePage ==="notification" && <Notification />}
        {activePage ==="logout" && <Logout />}
      </main>
    </div>
  );
}

export default Dashboard;