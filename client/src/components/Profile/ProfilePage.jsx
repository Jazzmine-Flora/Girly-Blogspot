import React, { useEffect, useState } from "react";
import { useHistory } from "react-router-dom";
import { getUserProfile, getUserPosts } from "../../api";
import "./ProfilePage.css";

const ProfilePage = () => {
  const [user, setUser] = useState(null);
  const [posts, setPosts] = useState([]);
  const history = useHistory();

  // Redirect to signin if not authenticated
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      history.push("/signin");
      return;
    }

    const fetchData = async () => {
      try {
        const userId = localStorage.getItem("userId");
        if (!userId) {
          setUser(null);
          setPosts([]);
          return;
        }
        const userProfile = await getUserProfile(userId);
        let userPosts = [];
        try {
          userPosts = await getUserPosts();
          // If the backend returns { message: ... } on error, set to []
          if (!Array.isArray(userPosts)) userPosts = [];
        } catch {
          userPosts = [];
        }
        setUser(userProfile);
        setPosts(userPosts);
      } catch (err) {
        setUser(null);
        setPosts([]);
        console.error("Failed to load profile:", err);
      }
    };

    fetchData();
  }, [history]);

  if (!user) {
    return <div>Loading...</div>; // Loading state
  }

  return (
    <div className="profile-page">
      <h1>{user.username ? user.username : "User"}'s Profile</h1>
      <img
        className="profile-avatar"
        src={
          user.profilePicture
            ? user.profilePicture.startsWith("data:")
              ? user.profilePicture
              : `/${user.profilePicture}`
            : ""
        }
        alt={`${user.username ? user.username : "User"}'s profile`}
      />
      <p>{user.bio || "No bio yet."}</p>
      <h2>Your Posts</h2>
      <ul>
        {posts.map((post) => (
          <li key={post._id || post.id}>
            <h3>{post.title}</h3>
            <p>{post.content}</p>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default ProfilePage;
