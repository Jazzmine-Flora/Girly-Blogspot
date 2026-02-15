import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import styled from "styled-components";
import { theme } from "../../styles/theme";
import { getPostById, deletePost } from "../../api";
import { useAuth } from "../../context/AuthContext";
import { Card, CardBody, Avatar } from "../ui";
import { Button } from "../ui";

const Page = styled.main`
  max-width: 600px;
  margin: 0 auto;
  padding: ${theme.spacing.xl} ${theme.spacing.lg};
`;

const BackButton = styled(Button)`
  margin-bottom: ${theme.spacing.lg};
`;

const Title = styled.h1`
  margin: 0 0 ${theme.spacing.md};
  font-size: ${theme.typography.sizes["2xl"]};
  font-weight: ${theme.typography.weights.bold};
  color: ${theme.colors.text};
  line-height: 1.3;
`;

const PostHeader = styled.div`
  display: flex;
  align-items: center;
  gap: ${theme.spacing.md};
  margin-bottom: ${theme.spacing.lg};
`;

const PostActions = styled.div`
  margin-left: auto;
  display: flex;
  align-items: center;
  gap: ${theme.spacing.sm};
`;

const AuthorInfo = styled.div``;

const AuthorLink = styled(Link)`
  display: flex;
  align-items: center;
  gap: ${theme.spacing.md};
  text-decoration: none;
  color: inherit;

  &:hover span {
    color: ${theme.colors.primary};
  }
`;

const AuthorName = styled.span`
  font-weight: ${theme.typography.weights.semibold};
  color: ${theme.colors.text};
  display: block;
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

const PostDate = styled.span`
  font-size: ${theme.typography.sizes.xs};
  color: ${theme.colors.textMuted};
`;

const Content = styled.p`
  margin: 0;
  font-size: ${theme.typography.sizes.base};
  color: ${theme.colors.textSecondary};
  line-height: 1.7;
  white-space: pre-wrap;
  word-break: break-word;
`;

const MediaContainer = styled.div`
  margin: ${theme.spacing.lg} 0;
  border-radius: ${theme.radii.md};
  overflow: hidden;
  background: ${theme.colors.borderLight};
`;

const MediaImage = styled.img`
  width: 100%;
  max-height: 500px;
  object-fit: contain;
  display: block;
`;

const MediaImageGrid = styled.div`
  display: grid;
  gap: 2px;
  grid-template-columns: repeat(${({ $count }) => ($count >= 2 ? 2 : 1)}, 1fr);
  max-height: 500px;

  img {
    width: 100%;
    height: 100%;
    min-height: 150px;
    object-fit: cover;
    display: block;
  }
`;

const MediaVideo = styled.video`
  width: 100%;
  max-height: 500px;
  display: block;
`;

function getAuthorName(post) {
  if (!post?.author) return "Anonymous";
  return typeof post.author === "object" ? post.author.username : post.author;
}

function getAuthorId(post) {
  if (!post?.author) return null;
  return typeof post.author === "object" ? post.author._id : null;
}

function getAuthorIsAdmin(post) {
  if (!post?.author || typeof post.author !== "object") return false;
  return !!post.author.isAdmin;
}

function getAuthorProfilePicture(post) {
  if (!post?.author || typeof post.author !== "object") return null;
  const pic = post.author.profilePicture;
  if (!pic) return null;
  // If it's a data URL (base64), return as-is
  if (pic.startsWith("data:")) return pic;
  // Otherwise, prepend base URL for relative paths
  const apiUrl = process.env.REACT_APP_API_URL || "/api";
  const base = apiUrl.replace(/\/api\/?$/, "");
  return base ? `${base}/${pic}` : `/${pic}`;
}

function getMediaUrl(url) {
  if (!url) return "";
  if (url.startsWith("blob:")) return url;
  const apiUrl = process.env.REACT_APP_API_URL || "/api";
  const base = apiUrl.replace(/\/api\/?$/, "");
  return base ? `${base}${url}` : url;
}

export function PostDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated, userId, isAdmin } = useAuth();
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/signin");
      return;
    }
    const fetchPost = async () => {
      try {
        const data = await getPostById(id);
        setPost(data);
      } catch {
        setError("Post not found.");
      } finally {
        setLoading(false);
      }
    };
    fetchPost();
  }, [id, isAuthenticated, navigate]);

  if (loading) return <p style={{ textAlign: "center", color: theme.colors.textMuted }}>Loading…</p>;
  if (error || !post)
    return (
      <p style={{ textAlign: "center", color: theme.colors.error }}>{error || "Post not found."}</p>
    );

  const authorName = getAuthorName(post);
  const authorId = getAuthorId(post);
  const authorIsAdmin = getAuthorIsAdmin(post);
  const authorPic = getAuthorProfilePicture(post);
  const canDelete = !!(isAdmin || (authorId && userId && authorId === userId));
  const createdAt = post.createdAt
    ? new Date(post.createdAt).toLocaleDateString(undefined, {
        month: "long",
        day: "numeric",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      })
    : "";
  const mediaType = post.mediaType;
  const mediaUrls = post.mediaUrls || [];
  const hasMedia = mediaType && mediaUrls.length > 0;

  return (
    <Page>
      <BackButton variant="ghost" size="sm" onClick={() => navigate(-1)}>
        ← Back
      </BackButton>
      <Card>
        <CardBody>
          <PostHeader>
            {authorId ? (
              <AuthorLink to={`/profile/${authorId}`}>
                <Avatar src={authorPic} name={authorName} size="48px" />
                <AuthorInfo>
                  <AuthorName>
                    {authorName}
                    {authorIsAdmin && <AdminBadge>Admin</AdminBadge>}
                  </AuthorName>
                  <PostDate>{createdAt}</PostDate>
                </AuthorInfo>
              </AuthorLink>
            ) : (
              <>
                <Avatar src={authorPic} name={authorName} size="48px" />
                <AuthorInfo>
                  <AuthorName>
                    {authorName}
                    {authorIsAdmin && <AdminBadge>Admin</AdminBadge>}
                  </AuthorName>
                  <PostDate>{createdAt}</PostDate>
                </AuthorInfo>
              </>
            )}
            {canDelete && (
              <PostActions>
                <Button
                  variant="danger"
                  size="sm"
                  disabled={deleting}
                  onClick={async () => {
                    if (!window.confirm("Delete this post?")) return;
                    setDeleting(true);
                    try {
                      await deletePost(post._id);
                      navigate("/feed", { replace: true });
                    } catch {
                      setError("Failed to delete post.");
                    } finally {
                      setDeleting(false);
                    }
                  }}
                >
                  {deleting ? "Deleting…" : "Delete"}
                </Button>
              </PostActions>
            )}
          </PostHeader>
          <Title>{post.title}</Title>
          {hasMedia && (
            <MediaContainer>
              {mediaType === "image" &&
                (mediaUrls.length === 1 ? (
                  <MediaImage src={getMediaUrl(mediaUrls[0])} alt="" />
                ) : (
                  <MediaImageGrid $count={mediaUrls.length}>
                    {mediaUrls.map((url, i) => (
                      <img key={i} src={getMediaUrl(url)} alt="" />
                    ))}
                  </MediaImageGrid>
                ))}
              {mediaType === "video" && (
                <MediaVideo src={getMediaUrl(mediaUrls[0])} controls playsInline />
              )}
            </MediaContainer>
          )}
          <Content>{post.content}</Content>
        </CardBody>
      </Card>
    </Page>
  );
}
