const express = require("express");
const mongoose = require("mongoose");
const multer = require("multer");
const router = express.Router();
const Post = require("../models/Post");
const auth = require("../middleware/auth");
const { uploadMedia } = require("../middleware/upload");

const getBaseUrl = (req) => {
  const forwardedProto = req.headers["x-forwarded-proto"]?.split(",")[0];
  const protocol = forwardedProto || req.protocol || "http";
  return `${protocol}://${req.get("host")}`;
};

const withAbsoluteMediaUrls = (post, baseUrl) => {
  if (!post || !Array.isArray(post.mediaUrls)) return post;
  const mediaUrls = post.mediaUrls.map((url) => {
    if (!url) return url;
    if (url.startsWith("http://") || url.startsWith("https://")) return url;
    return url.startsWith("/") ? `${baseUrl}${url}` : `${baseUrl}/${url}`;
  });
  return { ...post, mediaUrls };
};

const handleUploadError = (err, req, res, next) => {
  if (!err) return next();
  if (err instanceof multer.MulterError) {
    if (err.code === "LIMIT_FILE_SIZE") {
      return res.status(400).json({ message: "File too large. Images: 5MB max, Videos: 50MB max." });
    }
    if (err.code === "LIMIT_FILE_COUNT") {
      return res.status(400).json({ message: "Too many files. Max 5 images or 1 video." });
    }
  }
  return res.status(400).json({ message: err.message || "Upload error" });
};

// Create a new post (supports multipart/form-data: title, content, images[], video)
router.post("/", auth, (req, res, next) => {
  uploadMedia(req, res, (err) => {
    if (err) return handleUploadError(err, req, res, next);
    next();
  });
}, async (req, res) => {
  try {
    const title = req.body.title?.trim() || "";
    const content = req.body.content?.trim() || "";
    const files = req.files || {};
    const imageFiles = files.images || [];
    const videoFile = files.video?.[0];

    // Validate: must have text and/or media
    const hasText = title || content;
    const hasImages = imageFiles.length > 0;
    const hasVideo = !!videoFile;

    if (!hasText && !hasImages && !hasVideo) {
      return res.status(400).json({ message: "Post must have title, content, image(s), or video." });
    }
    if (hasImages && hasVideo) {
      return res.status(400).json({ message: "Cannot have both images and video in one post." });
    }
    const MAX_IMAGE_SIZE = 5 * 1024 * 1024; // 5MB
    if (hasImages && imageFiles.some((f) => f.size > MAX_IMAGE_SIZE)) {
      return res.status(400).json({ message: "Image too large. Max 5MB per image." });
    }

    let mediaType = null;
    let mediaUrls = [];

    if (hasImages) {
      mediaType = "image";
      mediaUrls = imageFiles.map((f) => `/uploads/${f.filename}`);
    } else if (hasVideo) {
      mediaType = "video";
      mediaUrls = [`/uploads/${videoFile.filename}`];
    }

    // Ensure author is stored as ObjectId (Mongoose will convert string automatically, but be explicit)
    const authorId = mongoose.Types.ObjectId.isValid(req.user.id) 
      ? new mongoose.Types.ObjectId(req.user.id)
      : req.user.id;
    
    const newPost = new Post({
      title: title || (hasImages ? "Photo" : hasVideo ? "Video" : "Post"),
      content,
      author: authorId,
      mediaType,
      mediaUrls,
      createdAt: new Date(),
    });
    await newPost.save();
    const populated = await Post.findById(newPost._id)
      .populate("author", "username profilePicture isAdmin")
      .lean();
    const baseUrl = getBaseUrl(req);
    const normalized = withAbsoluteMediaUrls(populated, baseUrl);
    const io = req.app.get("io");
    if (io) io.emit("post:created", normalized);
    res.status(201).json(normalized);
  } catch (error) {
    res.status(500).json({ message: "Error creating post", error: error.message });
  }
});

// Get all posts for the logged-in user (feed is at app level: GET /api/posts/feed)
router.get("/", auth, async (req, res) => {
  try {
    const posts = await Post.find({ author: req.user.id })
      .populate("author", "username profilePicture isAdmin")
      .sort({ createdAt: -1 })
      .lean();
    const baseUrl = getBaseUrl(req);
    const normalized = Array.isArray(posts)
      ? posts.map((p) => withAbsoluteMediaUrls(p, baseUrl))
      : [];
    res.status(200).json(normalized);
  } catch (error) {
    res.status(500).json({ message: "Error fetching posts", error: error.message });
  }
});

// NOTE: /user/:userId route is defined in app.js to ensure correct route ordering

// Get a single post by ID
router.get("/:id", auth, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id)
      .populate("author", "username profilePicture isAdmin")
      .lean();
    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }
    const baseUrl = getBaseUrl(req);
    res.status(200).json(withAbsoluteMediaUrls(post, baseUrl));
  } catch (error) {
    res.status(500).json({ message: "Error fetching post", error: error.message });
  }
});

// Update a post
router.put("/:id", auth, async (req, res) => {
  const { title, content } = req.body;
  try {
    const post = await Post.findById(req.params.id);
    if (!post || post.author.toString() !== req.user.id) {
      return res
        .status(403)
        .json({ message: "Not authorized to update this post" });
    }
    if (title !== undefined) post.title = title;
    if (content !== undefined) post.content = content;
    await post.save();
    res.status(200).json(post);
  } catch (error) {
    res.status(500).json({ message: "Error updating post", error: error.message });
  }
});

// Delete a post
router.delete("/:id", auth, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    const isOwner = post && post.author.toString() === req.user.id;
    const isAdmin = !!req.user.isAdmin;
    if (!post || (!isOwner && !isAdmin)) {
      return res
        .status(403)
        .json({ message: "Not authorized to delete this post" });
    }
    await post.deleteOne();
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ message: "Error deleting post", error: error.message });
  }
});

module.exports = router;
