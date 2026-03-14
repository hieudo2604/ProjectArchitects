import { useState } from "react";
import "./LoginModal.css";

function LoginModal({ onClose, onLogin, onForgotPassword }) {
  const [view, setView] = useState("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [resetEmail, setResetEmail] = useState("");
  const [error, setError] = useState(null);

  const validatePassword = (password) => {
  if (password.length < 8) return "At least 8 characters required.";
  if (!/[A-Z]/.test(password)) return "Must include an uppercase letter.";
  if (!/[0-9]/.test(password)) return "Must include a number.";
  return null;
};

  const handleSubmit = async (e) => {
  e.preventDefault();
  const validationError = validatePassword(password);
  if (validationError) {
    setError(validationError);
    return;
  }
  try {
    await onLogin(email, password);
    onClose();
  } catch (err) {          
    switch (err.code) {
      case "auth/weak-password":
        setError("Password is too weak. Use at least 8 characters.");
        break;
      case "auth/email-already-in-use":
        setError("This email is already registered.");
        break;
      case "auth/wrong-password":
        setError("Incorrect password.");
        break;
      case "auth/user-not-found":
        setError("No account found with this email.");
        break;
      default:
        setError("Something went wrong. Please try again.");
    }
  }
};

 const handleForgotPassword = async (e) => {
  e.preventDefault();
  try {
    await onForgotPassword?.(resetEmail);
    setView("sent");
  } catch (err) {          
    switch (err.code) {
      case "auth/user-not-found":
        setError("No account found with this email.");
        break;
      case "auth/invalid-email":
        setError("Please enter a valid email address.");
        break;
      default:
        setError("Something went wrong. Please try again.");
    }
  }
};

  const goToLogin = () => {
    setError(null);
    setView("login");
  };

  if (view === "forgot") {
    return (
      <div className="modal-backdrop">
        <div className="modal">
          <button className="back-btn" onClick={goToLogin}>← Back</button>
          <h2>Reset Password</h2>
          <p className="modal-subtitle">
            Enter your email and we'll send you a reset link.
          </p>
          {error && <p className="modal-error">{error}</p>}
          <form onSubmit={handleForgotPassword}>
            <input
              type="email"
              placeholder="Email"
              value={resetEmail}
              onChange={(e) => setResetEmail(e.target.value)}
              required
            />
            <div className="modal-actions">
              <button type="submit" className="btn btn-primary">
                Send Reset Link
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

  if (view === "sent") {
    return (
      <div className="modal-backdrop">
        <div className="modal modal-centered">
          <div className="sent-icon">✉️</div>
          <h2>Check your email</h2>
          <p className="modal-subtitle">
            A password reset link has been sent to <strong>{resetEmail}</strong>.
          </p>
          <div className="modal-actions modal-actions-center">
            <button className="btn btn-primary" onClick={onClose}>
              Done
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="modal-backdrop">
      <div className="modal">
        <h2>Log In</h2>

        <form onSubmit={handleSubmit}>
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

          <button
            type="button"
            className="forgot-link"
            onClick={() => { setError(null); setView("forgot"); }}
          >
            Forgot password?
          </button>

          <div className="modal-actions">
            <button type="submit" className="btn btn-primary">
              Log In
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

export default LoginModal;
