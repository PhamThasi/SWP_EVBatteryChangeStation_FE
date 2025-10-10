import { useState } from "react";
import Button from "../../../components/button";
import "./signIn.css";
import { Link } from "react-router-dom";
const SignIn = () => {
  // const[email, setEmail] = useState("");
  // const[password, setPassword] = useState("");
  return (
    <div className="signIn">
      <div className="header-signIn">
        <h1>WELCOME BACK!</h1>
        <p>Please login to your account</p>
      </div>
      <form className="signIn-Group">
        <div className="signIn-block">
          <label for="email">Email Address:</label>
          <input
            id="email"
            type="text"
            name="email"
            placeholder="Email Address"
          />
        </div>
        <div className="signIn-block">
          <label for="password">Password:</label>
          <input
            id="password"
            type="password"
            name="password"
            placeholder="Password"
          />
        </div>
        <div className="butt">
          <Button>Sign in</Button>
        </div>
        <div className="footer-text">
          <p>
            Don't have an account yet?
            <Link to="/signUp" rel="stylesheet" href="">
              Create an account
            </Link>{" "}
          </p>
        </div>
      </form>
    </div>
  );
};

export default SignIn;

