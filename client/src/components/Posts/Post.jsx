import React from 'react';

const Post = ({ post }) => {
    return (
        <div className="post">
            <h2 className="post-title">{post.title}</h2>
            <p className="post-content">{post.content}</p>
            <div className="post-meta">
                <span className="post-author">By: {post.author}</span>
                <span className="post-date">{new Date(post.createdAt).toLocaleDateString()}</span>
            </div>
            <div className="post-interactions">
                <button className="like-button">Like</button>
                <button className="comment-button">Comment</button>
            </div>
        </div>
    );
};

export default Post;