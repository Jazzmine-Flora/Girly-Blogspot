import { useEffect, useState, useRef, useCallback } from "react";
import { useNavigate, useParams } from "react-router-dom";
import styled from "styled-components";
import { theme } from "../../styles/theme";
import { Link } from "react-router-dom";
import { getUserProfile, getPostsByUser } from "../../api";
import { useAuth } from "../../context/AuthContext";
import { Card, CardBody, Avatar, Button } from "../ui";
import { PostCard } from "../Posts/PostCard";

const PAGE_SIZE = 20;

const Page = styled.main`
  max-width: 600px;
  margin: 0 auto;
  padding: ${theme.spacing.xl} ${theme.spacing.lg};
  padding-bottom: ${theme.spacing["3xl"]};
`;

const ProfileHeader = styled(Card)`
  margin-bottom: ${theme.spacing.xl};
`;

const HeaderContent = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  padding: ${theme.spacing["2xl"]};
`;

const Username = styled.h1`
  margin: ${theme.spacing.md} 0 ${theme.spacing.sm};
  font-size: ${theme.typography.sizes["2xl"]};
  font-weight: ${theme.typography.weights.bold};
  color: ${theme.colors.text};
`;

const AdminBadge = styled.span`
  display: inline-flex;
  align-items: center;
  gap: 4px;
  margin-left: ${theme.spacing.xs};
  padding: 2px 6px;
  font-size: ${theme.typography.sizes.xs};
  font-weight: ${theme.typography.weights.semibold};
  color: ${theme.colors.primary};
  background: rgba(59, 130, 246, 0.12);
  border: 1px solid rgba(59, 130, 246, 0.25);
  border-radius: ${theme.radii.full};
`;

const Bio = styled.p`
  margin: 0;
  font-size: ${theme.typography.sizes.base};
  color: ${theme.colors.textSecondary};
  line-height: 1.6;
`;

const EditButton = styled(Button)`
  margin-top: ${theme.spacing.md};
`;

const SectionTitle = styled.h2`
  margin: 0 0 ${theme.spacing.lg};
  font-size: ${theme.typography.sizes.lg};
  font-weight: ${theme.typography.weights.semibold};
  color: ${theme.colors.text};
`;

const LoadingText = styled.p`
  text-align: center;
  color: ${theme.colors.textMuted};
  padding: ${theme.spacing["2xl"]};
`;

const LoadMoreSentinel = styled.div`
  height: 1px;
  visibility: hidden;
  pointer-events: none;
`;

const LoadMoreText = styled.p`
  text-align: center;
  color: ${theme.colors.textMuted};
  font-size: ${theme.typography.sizes.sm};
  padding: ${theme.spacing.lg};
`;

export function ProfilePage() {
  const { userId: currentUserId } = useAuth();
  const { userId: paramUserId } = useParams();
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [error, setError] = useState(null);
  const [postsError, setPostsError] = useState(null);
  const postsRef = useRef([]);
  const sentinelRef = useRef(null);

  const profileUserId =
    (paramUserId || currentUserId || localStorage.getItem("userId"))?.trim() || null;
  const isOwnProfile =
    profileUserId &&
    (profileUserId === currentUserId || profileUserId === localStorage.getItem("userId"));

  const mountedRef = useRef(true);
  const fetchIdRef = useRef(0);

  const fetchProfile = useCallback(
    async (reset = true, skipOverride = 0) => {
      if (!profileUserId || profileUserId === "undefined") {
        setLoading(false);
        setError("User not found.");
        return;
      }
      const fetchId = ++fetchIdRef.current;
      if (reset) {
        setLoading(true);
        setError(null);
        setPostsError(null);
      }
      try {
        if (reset) {
          try {
            const userProfile = await getUserProfile(profileUserId);
            if (!mountedRef.current || fetchId !== fetchIdRef.current) return;
            setUser(userProfile);
            setError(null);
          } catch (err) {
            if (!mountedRef.current || fetchId !== fetchIdRef.current) return;
            setError(err.response?.data?.message || "Failed to load profile.");
            setUser(null);
            setPosts([]);
            setLoading(false);
            setLoadingMore(false);
            return;
          }
        }
        const skip = reset ? 0 : skipOverride;
        try {
          const userPosts = await getPostsByUser(profileUserId, PAGE_SIZE, skip);
          if (!mountedRef.current || fetchId !== fetchIdRef.current) return;
          setPostsError(null);
          setPosts((prev) => {
            if (reset) return userPosts;
            const ids = new Set(prev.map((p) => p._id));
            const newPosts = userPosts.filter((p) => !ids.has(p._id));
            return [...prev, ...newPosts];
          });
          setHasMore(userPosts.length === PAGE_SIZE);
        } catch (err) {
          if (!mountedRef.current || fetchId !== fetchIdRef.current) return;
          console.error("Error loading posts:", err);
          const errorMessage = err.response?.data?.message || err.message || "Failed to load posts.";
          setPostsError(errorMessage);
          if (reset) setPosts([]);
        }
      } finally {
        if (mountedRef.current && fetchId === fetchIdRef.current) {
          setLoading(false);
          setLoadingMore(false);
        }
      }
    },
    [profileUserId]
  );

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  const fetchProfileRef = useRef(fetchProfile);
  fetchProfileRef.current = fetchProfile;

  useEffect(() => {
    if (!localStorage.getItem("token")) {
      navigate("/signin");
      return;
    }
    const storedUserId = localStorage.getItem("userId");
    if (!paramUserId && storedUserId) {
      navigate(`/profile/${storedUserId}`, { replace: true });
      return;
    }
    if (!profileUserId) {
      setLoading(false);
      setError("Please log in to view profiles.");
      return;
    }
    fetchProfileRef.current(true);
  }, [profileUserId, paramUserId, navigate]);

  useEffect(() => {
    postsRef.current = posts;
  }, [posts]);

  const loadMore = useCallback(() => {
    if (!hasMore || loadingMore || loading) return;
    setLoadingMore(true);
    fetchProfile(false, postsRef.current.length);
  }, [hasMore, loadingMore, loading, fetchProfile]);

  useEffect(() => {
    if (!hasMore || loading || loadingMore) return;
    const el = sentinelRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) loadMore();
      },
      { rootMargin: "200px", threshold: 0 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [hasMore, loading, loadingMore, loadMore]);

  if (loading && !user) return <LoadingText>Loading profile…</LoadingText>;
  if (error && !user) return <LoadingText>{error}</LoadingText>;
  if (!user) return <LoadingText>User not found.</LoadingText>;

  const profilePic = user.profilePicture?.startsWith("data:")
    ? user.profilePicture
    : user.profilePicture
      ? `/${user.profilePicture}`
      : null;

  return (
    <Page>
      <ProfileHeader>
        <HeaderContent>
          <Avatar src={profilePic} name={user.username} size="96px" />
          <Username>
            {user.username || "User"}
            {user.isAdmin && <AdminBadge>Admin</AdminBadge>}
          </Username>
          <Bio>{user.bio || "No bio yet."}</Bio>
          {isOwnProfile && (
            <EditButton as={Link} to="/edit-profile" variant="secondary" size="sm">
              Edit Profile
            </EditButton>
          )}
        </HeaderContent>
      </ProfileHeader>

      <SectionTitle>{isOwnProfile ? "Your Posts" : "Posts"}</SectionTitle>
      {loading && posts.length === 0 && !postsError ? (
        <LoadingText>Loading posts…</LoadingText>
      ) : postsError ? (
        <Card>
          <CardBody>
            <p style={{ margin: 0, color: theme.colors.error, marginBottom: theme.spacing.md }}>
              {postsError}
            </p>
            <Button variant="secondary" size="sm" onClick={() => fetchProfile(true)}>
              Retry
            </Button>
          </CardBody>
        </Card>
      ) : posts.length === 0 ? (
        <Card>
          <CardBody>
            <p style={{ margin: 0, color: theme.colors.textMuted }}>
              {isOwnProfile ? "You haven't posted anything yet." : "No posts yet."}
            </p>
          </CardBody>
        </Card>
      ) : (
        <>
          {posts.map((post) => <PostCard key={post._id} post={post} />)}
          {hasMore && <LoadMoreSentinel ref={sentinelRef} />}
          {loadingMore && <LoadMoreText>Loading more…</LoadMoreText>}
          {!hasMore && posts.length > 0 && (
            <LoadMoreText>You've seen all posts.</LoadMoreText>
          )}
        </>
      )}
    </Page>
  );
}
