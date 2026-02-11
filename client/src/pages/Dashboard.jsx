import React, { useState } from "react";
import useLocalStorage from "use-local-storage";
import Sidebar from "./components/Sidebar";
import "./Dashboard.css";
import About from "./elements/About";
import Project from "./elements/Project";

function App() {
  const [isDark, setIsDark] = useLocalStorage("isDark", false);
  const [activePage, setActivePage] = useState("home");
  const [isOpen, setIsOpen] = useState(true);

  return (
    <div className="App" data-theme={isDark ? "dark" : "light"}>
      <Sidebar isDark={isDark} handleChange={() => setIsDark(!isDark)} setActivePage={setActivePage} isOpen={isOpen} setIsOpen={setIsOpen}/>
      <main className={`content ${isDark ? "dark" : "light"}  ${isOpen ? "expanded" : "collapsed"}`}>
        {/*{activePage ==="home" && <Home />} */}
        {activePage ==="about" && <About />}
        {activePage ==="project" && <Project />}
      </main>
    </div>
  );
}

export default App;