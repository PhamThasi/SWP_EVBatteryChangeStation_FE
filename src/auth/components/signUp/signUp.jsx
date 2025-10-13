import { Link } from "react-router-dom";
import Button from "../../../components/button";
import "./signUp.css";

const SignUp = () => {
  return (
    <div className="auth-signup-container">
      <div className="auth-signup-header">
        <h1>Sign Up</h1>
        <p>Create a new account</p>
      </div>

      <div className="auth-form-group">
        <div className="auth-form-block">
          <label htmlFor="email">Email</label>
          <input
            type="email"
            id="email"
            name="email"
            placeholder="Enter email address"
            required
          />
        </div>

        <div className="auth-form-block">
          <label htmlFor="password">Password</label>
          <input
            type="password"
            id="password"
            name="password"
            placeholder="Password"
            required
            minLength="6"
          />
        </div>

        <div className="auth-form-block">
          <label htmlFor="confirmPassword">Confirm Password</label>
          <input
            type="password"
            id="confirmPassword"
            name="confirmPassword"
            placeholder="Confirm password"
            required
            minLength="6"
          />
        </div>
      </div>

      <div className="auth-btn-group">
        <Button>Sign Up</Button>

        <div className="auth-divider">
          <h6>or</h6>
        </div>

        <Button className="auth-btn-google">Sign up with Google</Button>
      </div>

      <div className="auth-footer">
        <p>
          Already have an account? <Link to="/login">Sign In</Link>
        </p>
      </div>
    </div>
  );
};

export default SignUp;