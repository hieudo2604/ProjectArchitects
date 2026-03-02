import React, { useState } from "react";
import useDarkmode from "../components/Darkmode";
import Sidebar from "../components/Sidebar";
import "./Dashboard.css";
import About from "../elements/About"
import Project from "../elements/Project";
import Logout from "../elements/Logout";
import MyCalendar from "../elements/MyCalendar";
import Home from "../elements/Home";
import { BrowserRouter as Router, Route, Switch } from "react-router-dom";
import express from 'express';
const app = express();

function Dashboard() {
    const [isDarkMode, toggleDarkMode] = useDarkmode();
    return (
        <Router>
            <div className={`dashboard ${isDarkMode ? 'dark' : 'light'}`}>
                <Sidebar toggleDarkMode={toggleDarkMode} />
                <div className="content">
                    <Switch>
                        <Route path="/home" component={Home} />
                        <Route path="/projects" component={Project} />
                        <Route path="/calendar" component={MyCalendar} />
                        <Route path="/about" component={About} />
                        <Route path="/logout" component={Logout} />
                    </Switch>
                </div>
            </div>
        </Router>
    );
}

export default Dashboard;