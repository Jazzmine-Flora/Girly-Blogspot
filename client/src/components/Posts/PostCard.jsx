import { Link } from "react-router-dom";
import styled from "styled-components";
import { theme } from "../../styles/theme";
import { Card, CardBody, Button } from "../ui";
import { Avatar } from "../ui";
import { useAuth } from "../../context/AuthContext";

const StyledCard = styled(Card)`
  margin-bottom: ${theme.spacing.lg};
`;

const PostHeader = styled.div`
  display: flex;
  align-items: center;
  gap: ${theme.spacing.md};
  margin-bottom: ${theme.spacing.md};
`;

const PostActions = styled.div`
  margin-left: auto;
  display: flex;
  align-items: center;
  gap: ${theme.spacing.sm};
`;

const AuthorInfo = styled.div`
  flex: 1;
  min-width: 0;
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

const Title = styled.h3`
  margin: 0 0 ${theme.spacing.sm};
  font-size: ${theme.typography.sizes.lg};
  font-weight: ${theme.typography.weights.semibold};
  color: ${theme.colors.text};
  line-height: 1.3;
`;

const Content = styled.p`
  margin: 0;
  font-size: ${theme.typography.sizes.base};
  color: ${theme.colors.textSecondary};
  line-height: 1.6;
  white-space: pre-wrap;
  word-break: break-word;
`;

const StyledLink = styled(Link)`
  color: inherit;
  text-decoration: none;

  &:hover ${Title} {
    color: ${theme.colors.primary};
  }
`;

const MediaContainer = styled.div`
  margin: ${theme.spacing.md} 0;
  border-radius: ${theme.radii.md};
  overflow: hidden;
  background: ${theme.colors.borderLight};
`;

const MediaImage = styled.img`
  width: 100%;
  max-height: 400px;
  object-fit: cover;
  display: block;
`;

const MediaImageGrid = styled.div`
  display: grid;
  gap: 2px;
  grid-template-columns: repeat(${({ $count }) => ($count >= 2 ? 2 : 1)}, 1fr);
  max-height: 400px;

  img {
    width: 100%;
    height: 100%;
    min-height: 120px;
    object-fit: cover;
    display: block;
  }
`;

const MediaVideo = styled.video`
  width: 100%;
  max-height: 400px;
  display: block;
`;

function getAuthorName(post) {
  if (!post.author) return "Anonymous";
  return typeof post.author === "object" ? post.author.username : post.author;
}

function getAuthorId(post) {
  if (!post.author) return null;
  return typeof post.author === "object" ? post.author._id : null;
}

function getAuthorIsAdmin(post) {
  if (!post.author || typeof post.author !== "object") return false;
  return !!post.author.isAdmin;
}

function getAuthorProfilePicture(post) {
  if (!post.author || typeof post.author !== "object") return null;
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

const AuthorLink = styled(Link)`
  display: flex;
  align-items: center;
  gap: ${theme.spacing.md};
  text-decoration: none;
  color: inherit;
  flex: 1;
  min-width: 0;

  &:hover ${AuthorName} {
    color: ${theme.colors.primary};
  }
`;

export function PostCard({ post, onDelete }) {
  const { userId, isAdmin } = useAuth();
  const authorName = getAuthorName(post);
  const authorId = getAuthorId(post);
  const authorIsAdmin = getAuthorIsAdmin(post);
  const authorPic = getAuthorProfilePicture(post);
  const canDelete = !!(isAdmin || (authorId && userId && authorId === userId));
  const createdAt = post.createdAt
    ? new Date(post.createdAt).toLocaleDateString(undefined, {
        month: "short",
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
    <StyledCard>
      <CardBody>
        <PostHeader>
          {authorId ? (
            <AuthorLink to={`/profile/${authorId}`}>
              <Avatar src={authorPic} name={authorName} size="44px" />
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
              <Avatar src={authorPic} name={authorName} size="44px" />
              <AuthorInfo>
                <AuthorName>
                  {authorName}
                  {authorIsAdmin && <AdminBadge>Admin</AdminBadge>}
                </AuthorName>
                <PostDate>{createdAt}</PostDate>
              </AuthorInfo>
            </>
          )}
          {canDelete && typeof onDelete === "function" && (
            <PostActions>
              <Button
                variant="danger"
                size="sm"
                onClick={() => {
                  if (window.confirm("Delete this post?")) onDelete(post._id);
                }}
              >
                Delete
              </Button>
            </PostActions>
          )}
        </PostHeader>
        <StyledLink to={`/post/${post._id}`}>
          <Title>{post.title}</Title>
        </StyledLink>
        {hasMedia && (
          <MediaContainer>
            {mediaType === "image" &&
              (mediaUrls.length === 1 ? (
                <MediaImage src={getMediaUrl(mediaUrls[0])} alt="" loading="lazy" />
              ) : (
                <MediaImageGrid $count={mediaUrls.length}>
                  {mediaUrls.slice(0, 4).map((url, i) => (
                    <img key={i} src={getMediaUrl(url)} alt="" loading="lazy" />
                  ))}
                </MediaImageGrid>
              ))}
            {mediaType === "video" && (
              <MediaVideo src={getMediaUrl(mediaUrls[0])} controls muted playsInline />
            )}
          </MediaContainer>
        )}
        <Content>
          {post.content?.slice(0, 200)}
          {post.content?.length > 200 ? "…" : ""}
        </Content>
      </CardBody>
    </StyledCard>
  );
}
