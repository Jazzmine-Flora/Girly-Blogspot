import React, { useState } from "react";
import { login } from "../../api";
import { useHistory } from "react-router-dom";

const SignIn = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const history = useHistory();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await login({ username, password });
      localStorage.setItem("token", res.data.token);
      localStorage.setItem("userId", res.data.userId);
      setMessage("Login successful!");
      history.push("/profile"); // or wherever you want to redirect
    } catch (err) {
      setMessage("Login failed. Check your credentials.");
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <h2>Sign In</h2>
      <input
        value={username}
        onChange={(e) => setUsername(e.target.value)}
        placeholder="Username"
        required
      />
      <input
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder="Password"
        required
        autoComplete="current-password"
      />
      <button type="submit">Sign In</button>
      {message && <p>{message}</p>}
    </form>
  );
};

export default SignIn;
