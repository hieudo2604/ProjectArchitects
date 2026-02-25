import React from 'react';
import './LandingPage.css';
import './Header.css';

export default function LandingPage() {
    return (
        <div className="landing-page">
            {/* Hero Section */}
            <section className="hero">
                <div className="hero-content">
                    <h2>Build Amazing Projects</h2>
                    <p>Collaborate, create, and deliver exceptional results with our platform!</p>
                </div>
            </section>

            <section className="features">
                <div className="feature">
                    <h3>Collaborate Seamlessly</h3>
                    <p>Work together with your team in real-time, no matter where you are.</p>
                </div>
                <div className="feature">
                    <h3>Organize Your Workflow</h3>
                    <p>Keep track of tasks, deadlines, and progress with our intuitive tools.</p>
                </div>
                <div className="feature">
                    <h3>Deliver Exceptional Results</h3>
                    <p>Focus on what matters most and let us handle the rest.</p>
                </div>
            </section>

            {/* Footer */}
            <footer className="footer">
                <p>&copy; 2026 Project Architects. All rights reserved.</p>
            </footer>
        </div>
    );
}