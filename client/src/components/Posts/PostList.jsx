import React, { useEffect, useState } from 'react';
import Post from './Post';

const PostList = () => {
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchPosts = async () => {
            try {
                const response = await fetch('/api/posts');
                const data = await response.json();
                setPosts(data);
            } catch (error) {
                console.error('Error fetching posts:', error);
            } finally {
                setLoading(false);
            }
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
                posts.map(post => <Post key={post._id} post={post} />)
            )}
        </div>
    );
};

export default PostList;