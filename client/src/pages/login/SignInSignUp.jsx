// src/pages/login/SignInSignUp.jsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import styles from "../../styles/SignInSignUp.module.css";
import AuthService from "../../services/AuthService";

const SignInSignUp = ({ onLogin }) => {
  const [isSignUp, setIsSignUp] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [role, setRole] = useState("farmer");
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    const username = e.target.username.value;
    const password = e.target.password.value;

    try {
      const result = await AuthService.login(username, password);
      if (result.success) {
        onLogin(result.user);
        
        // Role-based redirect
        const role = result.user.role;
        switch (role) {
          case 'farmer':
            navigate("/");
            break;
          case 'engineer':
            navigate("/");
            break;
          case 'manager':
            navigate("/");
            break;
          case 'it':
            navigate("/");
            break;
          default:
            navigate("/");
        }
      } else {
        setError(result.message);
      }
    } catch (error) {
      setError("Login failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignup = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    const username = e.target.username.value;
    const phone = e.target.phone.value;
    const password = e.target.password.value;

    try {
      const result = await AuthService.signup(username, phone, password);
      if (result.success) {
        alert("Sign up successful. Please log in.");
        setIsSignUp(false);
        setError("");
      } else {
        setError(result.message);
      }
    } catch (error) {
      setError("Registration failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={`${styles.container} ${isSignUp ? styles["sign-up-mode"] : ""}`}>
      <div className={styles["forms-container"]}>
        <div className={styles["signin-signup"]}>
          {/* Sign In Form */}
          <form className={styles["sign-in-form"]} onSubmit={handleLogin}>
            <h2 className={styles.title}>Sign in</h2>
            {error && <div className={styles.error}>{error}</div>}
            <div className={styles["input-field"]}>
              <i className="fas fa-user"></i>
              <input name="username" type="text" placeholder="Username" required />
            </div>
            <div className={styles["input-field"]}>
              <i className="fas fa-lock"></i>
              <input name="password" type="password" placeholder="Password" required />
            </div>
            <input 
              type="submit" 
              value={isLoading ? "Logging in..." : "Login"} 
              className={`${styles.btn} ${styles.solid}`}
              disabled={isLoading}
            />
          </form>

          {/* Sign Up Form */}
          <form className={styles["sign-up-form"]} onSubmit={handleSignup}>
            <h2 className={styles.title}>Sign up</h2>
            {error && <div className={styles.error}>{error}</div>}
            <div className={styles["input-field"]}>
              <i className="fas fa-user"></i>
              <input name="username" type="text" placeholder="Username" required />
            </div>
            <div className={styles["input-field"]}>
              <i className="fas fa-phone"></i>
              <input name="phone" type="tel" placeholder="Phone" required />
            </div>
            <div className={styles["input-field"]}>
              <i className="fas fa-lock"></i>
              <input name="password" type="password" placeholder="Password" required />
            </div>
            <input 
              type="submit" 
              value={isLoading ? "Signing up..." : "Sign up"} 
              className={styles.btn}
              disabled={isLoading}
            />
          </form>
        </div>
      </div>

      {/* Panels */}
      <div className={styles["panels-container"]}>
        <div className={styles.panel + " " + styles["left-panel"]}>
          <div className={styles.content}>
            <h3>New here ?</h3>
            <p>Register now and get access to the chatbot diagnosis system.</p>
            <button 
              className={`${styles.btn} ${styles.transparent}`} 
              onClick={() => setIsSignUp(true)}
              disabled={isLoading}
            >
              Sign up
            </button>
          </div>
        </div>
        <div className={styles.panel + " " + styles["right-panel"]}>
          <div className={styles.content}>
            <h3>Already have an account?</h3>
            <p>Login now to continue using the system.</p>
            <button 
              className={`${styles.btn} ${styles.transparent}`} 
              onClick={() => setIsSignUp(false)}
              disabled={isLoading}
            >
              Sign in
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SignInSignUp;
