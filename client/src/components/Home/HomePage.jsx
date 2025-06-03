import React from "react";

const HomePage = () => (
  <div className="home-page" style={{ textAlign: "center", padding: "40px" }}>
    <h1>Welcome to Girly Blog Platform!</h1>
    <p>
      Share your stories, connect with others, and express yourself in a fun and
      supportive community.
    </p>
    <ul style={{ listStyle: "none", padding: 0 }}>
      <li>🌸 Create and customize your own blog posts</li>
      <li>💬 Comment and interact with other users</li>
      <li>✨ Personalize your profile</li>
    </ul>
    <p>
      <strong>Ready to get started?</strong>
      <br />
      <a href="/signup">Sign up</a> or <a href="/login">log in</a>!
    </p>
  </div>
);

export default HomePage;
