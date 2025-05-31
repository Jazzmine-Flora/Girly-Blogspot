import React, { useState, useEffect } from 'react';
import axios from 'axios';

const EditProfile = () => {
    const [profileData, setProfileData] = useState({
        username: '',
        bio: '',
        profilePicture: ''
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Fetch current user profile data
        const fetchProfileData = async () => {
            try {
                const response = await axios.get('/api/users/profile'); // Adjust the endpoint as needed
                setProfileData(response.data);
                setLoading(false);
            } catch (error) {
                console.error('Error fetching profile data:', error);
                setLoading(false);
            }
        };

        fetchProfileData();
    }, []);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setProfileData({
            ...profileData,
            [name]: value
        });
    };

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setProfileData({
                    ...profileData,
                    profilePicture: reader.result
                });
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await axios.put('/api/users/profile', profileData); // Adjust the endpoint as needed
            alert('Profile updated successfully!');
        } catch (error) {
            console.error('Error updating profile:', error);
            alert('Failed to update profile.');
        }
    };

    if (loading) {
        return <div>Loading...</div>;
    }

    return (
        <div className="edit-profile">
            <h2>Edit Profile</h2>
            <form onSubmit={handleSubmit}>
                <div>
                    <label>Username:</label>
                    <input
                        type="text"
                        name="username"
                        value={profileData.username}
                        onChange={handleChange}
                        required
                    />
                </div>
                <div>
                    <label>Bio:</label>
                    <textarea
                        name="bio"
                        value={profileData.bio}
                        onChange={handleChange}
                    />
                </div>
                <div>
                    <label>Profile Picture:</label>
                    <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageChange}
                    />
                    {profileData.profilePicture && (
                        <img
                            src={profileData.profilePicture}
                            alt="Profile Preview"
                            style={{ width: '100px', height: '100px' }}
                        />
                    )}
                </div>
                <button type="submit">Save Changes</button>
            </form>
        </div>
    );
};

export default EditProfile;