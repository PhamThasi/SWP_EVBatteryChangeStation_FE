import { Link } from "react-router-dom";
import Button from "../../../components/button";
import "./signUp.css";

const SignUp = () => {
  return (
    <div className="signUp">
      <div className="signUp-header">
        <h1>Sign Up</h1>
        <p>Please login to your account</p>
      </div>
      <div className="form-group">
        <div className="form-block">
          <label htmlFor="Email">Email</label>
          <input
            type="text"
            id="Email"
            name="Email"
            placeholder="Enter email address"
          />
        </div>
        <div className="form-block">
          <label htmlFor="password">Password</label>
          <input
            type="password"
            id="password"
            name="password"
            placeholder="Password"
          />
        </div>
        <div className="form-block">
          <label htmlFor="confirmPassword">Confirm password</label>
          <input
            type="password"
            id="confirmPassword"
            name="confirmPassword"
            placeholder="Confirm password"
          />
        </div>
      </div>
      <div className="btn-signUp">
        <Button>Sign up</Button>
        <div className="divider">
          <h6>or</h6>
        </div>

        <Button className="btn-google">Sign up with Google</Button>
      </div>
      <div className="footer-signUp">
        <p>
          You already have an account{" "}
          <Link to="/login">
            Sign In
          </Link>
        </p>
      </div>
    </div>
  );
};

export default SignUp;
