import React from 'react';
import { useEffect, useState } from 'react';
import { getUserProfile, getUserPosts } from '../../api'; // Assume these API functions are defined

const ProfilePage = () => {
    const [user, setUser] = useState(null);
    const [posts, setPosts] = useState([]);

    useEffect(() => {
        const fetchData = async () => {
            const userProfile = await getUserProfile(); // Fetch user profile
            const userPosts = await getUserPosts(); // Fetch user posts
            setUser(userProfile);
            setPosts(userPosts);
        };

        fetchData();
    }, []);

    if (!user) {
        return <div>Loading...</div>; // Loading state
    }

    return (
        <div className="profile-page">
            <h1>{user.username}'s Profile</h1>
            <img src={user.profilePicture} alt={`${user.username}'s profile`} />
            <p>{user.bio}</p>
            <h2>Your Posts</h2>
            <ul>
                {posts.map(post => (
                    <li key={post.id}>
                        <h3>{post.title}</h3>
                        <p>{post.content}</p>
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default ProfilePage;