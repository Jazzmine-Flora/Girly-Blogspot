import React, { useState, useEffect } from "react";
import { Link, useHistory } from "react-router-dom";

const Navbar = () => {
  const history = useHistory();
  const [isLoggedIn, setIsLoggedIn] = useState(!!localStorage.getItem("token"));

  useEffect(() => {
    // Listen for storage changes (in case of multi-tab)
    const onStorage = () => setIsLoggedIn(!!localStorage.getItem("token"));
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("userId");
    setIsLoggedIn(false); // Update state immediately
    history.push("/signin");
  };

  return (
    <nav>
      <Link to="/" style={{ marginRight: "1rem" }}>
        Home
      </Link>
      {!isLoggedIn && (
        <>
          <Link to="/signup" style={{ marginRight: "1rem" }}>
            Sign Up
          </Link>
          <Link to="/signin" style={{ marginRight: "1rem" }}>
            Sign In
          </Link>
        </>
      )}
      {isLoggedIn && (
        <>
          <Link to="/profile" style={{ marginRight: "1rem" }}>
            Profile
          </Link>

          <Link to="/edit-profile" style={{ marginRight: "1rem" }}>
            Edit Profile
          </Link>
          <Link to="/create-post" style={{ marginRight: "1rem" }}>
            Create Post
          </Link>
          <button onClick={handleLogout}>Logout</button>
        </>
      )}
    </nav>
  );
};

export default Navbar;
