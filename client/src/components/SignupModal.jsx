import React, { useState } from 'react';
import { doc, setDoc } from 'firebase/firestore';
import { db } from '../config/firebase';
import './SignupModal.css';

function SignupModal({ onClose, onSignup }) {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);

  // Password validation
  const validatePassword = (password) => {
    if (password.length < 8) return "At least 8 characters required.";
    if (!/[A-Z]/.test(password)) return "Must include an uppercase letter.";
    if (!/[0-9]/.test(password)) return "Must include a number.";
    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (!username) {
      setError("Username is required");
      return;
    }

    // Run validation before hitting Firebase
    const validationError = validatePassword(password);
    if (validationError) {
      setError(validationError);
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
      // Firebase error codes instead of raw err.message
      switch (err.code) {
        case "auth/email-already-in-use":
          setError("This email is already registered.");
          break;
        case "auth/invalid-email":
          setError("Please enter a valid email address.");
          break;
        case "auth/weak-password":
          setError("Password is too weak. Use at least 8 characters.");
          break;
        default:
          setError("Something went wrong. Please try again.");
      }
    }
  };

  return (
    <div className="modal-backdrop">
      <div className="modal">
        <h2 className="w3-text-black">Sign Up</h2>
        {error && <p className="modal-error">{error}</p>} 
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
      </div>
    </div>
  );
}

export default SignupModal;
