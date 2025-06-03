import React, { useState } from "react";
import { signup } from "../../api";

const SignUp = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [bio, setBio] = useState("");
  const [message, setMessage] = useState("");
  const [age, setAge] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      console.log({ username, password, bio, age });
      if (!username || !password || !age) {
        setMessage("Username, password, and age are required.");
        return;
      }
      if (age < 13) {
        setMessage("You must be at least 13 years old to sign up.");
        return;
      }
      await signup({ username, password, bio, age: parseInt(age) });
      setMessage("Signup successful! You can now sign in.");
    } catch (err) {
      setMessage("Signup failed.");
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <h2>Sign Up</h2>
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
      />
      <input
        type="number"
        value={age}
        onChange={(e) => setAge(e.target.value)}
        placeholder="Age"
        required
      />
      <input
        value={bio}
        onChange={(e) => setBio(e.target.value)}
        placeholder="Bio (optional)"
      />
      <button type="submit">Sign Up</button>
      {message && <p>{message}</p>}
    </form>
  );
};

export default SignUp;
