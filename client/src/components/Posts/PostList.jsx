import React, { useEffect, useState } from "react";
import Post from "./Post";
import { getUserPosts } from "../../api";
const PostList = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const response = await getUserPosts();
        // Ensure posts is always an array
        setPosts(Array.isArray(response.data) ? response.data : []);
      } catch (err) {
        setPosts([]); // fallback to empty array on error
        // Optionally show an error message
      }
      setLoading(false);
    };
    fetchPosts();
  }, []);

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="post-list">
      {posts.length === 0 ? (
        <p>No posts available.</p>
      ) : (
        posts.map((post) => <Post key={post._id} post={post} />)
      )}
    </div>
  );
};

export default PostList;
