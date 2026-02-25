import React, { useState } from 'react';
import { doc, setDoc } from 'firebase/firestore';
import { db } from '../config/firebase';
import './SignupModal.css';

function SignupModal({ onClose, onSignup }) {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
  e.preventDefault();
  setError(null);

  if (!username) {
    setError("Username is required");
    return;
  }

  try {
    const userCredential = await onSignup(email, password);
    const user = userCredential.user;

    console.log("Auth user created:", user.uid);

    try {
      console.log("Attempting to save user to Firestore...");
      await setDoc(doc(db, "users", user.uid), {
        username: username,
        email: email,
        createdAt: new Date()
      });
      console.log("Saved user successfully!");
    } catch (firestoreError) {
      console.error("Error saving user to Firestore:", firestoreError);
    }

    //onClose();

  } catch (err) {
    console.error("Signup error:", err);
    setError(err.message);
  }
};

  return (
    <div className="modal-backdrop">
      <div className="modal">
        <h2>Sign Up</h2>
        <form onSubmit={handleSubmit}>
          <input
            type="text"
            placeholder="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <div className="modal-actions">
            <button type="submit" className="btn btn-primary">
              Sign Up
            </button>
            <button type="button" onClick={onClose} className="btn">
              Cancel
            </button>
          </div>
        </form>
        {error && <p className="error">{error}</p>}
      </div>
    </div>
  );
}

export default SignupModal;
