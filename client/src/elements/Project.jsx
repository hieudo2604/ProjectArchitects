import React from 'react';
import ProjectModal from '../components/ProjectModal';
import { useDrag } from "react-dnd";
function Project(){
    // Return a message indicating that there are no projects available.
    return(
        <div>
            <h1>Projects</h1>
            <p>No projects are available. Create a new project to get started.</p>
        </div>
    );
}

export default Project;