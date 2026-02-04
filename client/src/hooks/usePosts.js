import { useState, useEffect, useCallback, useRef } from "react";
import { getFeedPosts, createPost } from "../api";
import { getSocket, disconnectSocket } from "../services/socket";
import { useAuth } from "../context/AuthContext";

/**
 * usePosts - Feed with optimistic updates + real-time sync via Socket.IO
 */
const PAGE_SIZE = 20;

export function usePosts() {
  const { token, isAuthenticated } = useAuth();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [error, setError] = useState(null);
  const [posting, setPosting] = useState(false);
  const [socketConnected, setSocketConnected] = useState(false);

  const fetchPosts = useCallback(async (reset = true, skipOverride = 0) => {
    if (!isAuthenticated) {
      setPosts([]);
      setError(null);
      setLoading(false);
      setLoadingMore(false);
      return;
    }
    if (reset) {
      setLoading(true);
      setError(null);
    }
    try {
      const skip = reset ? 0 : skipOverride;
      const data = await getFeedPosts(PAGE_SIZE, skip);
      const arr = Array.isArray(data) ? data : [];
      setPosts((prev) => {
        if (reset) return arr;
        const ids = new Set(prev.map((p) => p._id));
        const newPosts = arr.filter((p) => !ids.has(p._id));
        return [...prev, ...newPosts];
      });
      setHasMore(arr.length === PAGE_SIZE);
      setError(null);
    } catch (err) {
      const msg =
        err.response?.data?.message ||
        err.message ||
        (err.code === "ERR_NETWORK" ? "Cannot reach server. Is it running?" : "Failed to load posts");
      setError(msg);
      if (reset) setPosts([]);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    fetchPosts(true);
  }, [fetchPosts]);

  const postsRef = useRef([]);
  useEffect(() => {
    postsRef.current = posts;
  }, [posts]);

  const loadMore = useCallback(() => {
    if (!hasMore || loadingMore || loading) return;
    setLoadingMore(true);
    fetchPosts(false, postsRef.current.length);
  }, [hasMore, loadingMore, loading, fetchPosts]);

  // Socket.IO real-time sync
  useEffect(() => {
    if (!isAuthenticated || !token) {
      disconnectSocket();
      setSocketConnected(false);
      return;
    }

    const socket = getSocket(token);
    if (!socket) return;

    const onConnect = () => setSocketConnected(true);
    const onDisconnect = () => setSocketConnected(false);
    const onConnectError = (err) => {
      setSocketConnected(false);
      if (err.message?.includes("Invalid") || err.message?.includes("Authentication")) {
        window.dispatchEvent(new CustomEvent("auth:unauthorized"));
      }
    };
    const onPostCreated = (newPost) => {
      setPosts((prev) => {
        if (prev.some((p) => p._id === newPost._id)) return prev;
        return [newPost, ...prev];
      });
    };

    socket.on("connect", onConnect);
    socket.on("disconnect", onDisconnect);
    socket.on("connect_error", onConnectError);
    socket.on("post:created", onPostCreated);

    if (socket.connected) setSocketConnected(true);

    return () => {
      socket.off("connect", onConnect);
      socket.off("disconnect", onDisconnect);
      socket.off("connect_error", onConnectError);
      socket.off("post:created", onPostCreated);
    };
  }, [isAuthenticated, token]);

  const addPost = useCallback(
    async (payload) => {
      const { title = "", content = "", images = [], video = null } =
        typeof payload === "object" ? payload : { title: payload?.title || "", content: payload?.content || "" };
      const hasText = title?.trim() || content?.trim();
      const hasMedia = images?.length > 0 || video;
      if (!hasText && !hasMedia) return;

      setPosting(true);

      const tempId = `temp-${Date.now()}`;
      const mediaType = images?.length > 0 ? "image" : video ? "video" : null;
      const mediaUrls =
        mediaType === "image"
          ? images.map((f) => URL.createObjectURL(f))
          : mediaType === "video"
            ? [URL.createObjectURL(video)]
            : [];

      const optimisticPost = {
        _id: tempId,
        title: title?.trim() || (mediaType === "image" ? "Photo" : mediaType === "video" ? "Video" : "Post"),
        content: content?.trim() || "",
        author: { _id: "me", username: "You" },
        createdAt: new Date().toISOString(),
        likes: 0,
        comments: [],
        mediaType,
        mediaUrls,
        _optimistic: true,
      };

      setPosts((prev) => [optimisticPost, ...prev]);

      try {
        let data;
        if (images?.length > 0 || video) {
          const form = new FormData();
          if (title?.trim()) form.append("title", title.trim());
          if (content?.trim()) form.append("content", content.trim());
          if (images?.length) images.forEach((f) => form.append("images", f));
          if (video) form.append("video", video);
          const res = await createPost(form);
          data = res.data;
        } else {
          const res = await createPost({
            title: title?.trim() || "Post",
            content: content?.trim() || "",
          });
          data = res.data;
        }

        setPosts((prev) => {
          // Remove optimistic + any duplicate from Socket (which may have arrived first)
          const withoutTempAndDuplicates = prev.filter((p) => p._id !== tempId && p._id !== data._id);
          return [{ ...data, author: data.author || { username: "You" } }, ...withoutTempAndDuplicates];
        });
        setError(null);
        return data;
      } catch (err) {
        mediaUrls.forEach((url) => URL.revokeObjectURL(url));
        setPosts((prev) => prev.filter((p) => p._id !== tempId));
        setError(err.response?.data?.message || "Failed to create post");
        throw err;
      } finally {
        setPosting(false);
      }
    },
    []
  );

  const refresh = useCallback(() => fetchPosts(true), [fetchPosts]);

  return {
    posts,
    loading,
    loadingMore,
    hasMore,
    error,
    posting,
    socketConnected,
    addPost,
    refresh,
    loadMore,
  };
}
