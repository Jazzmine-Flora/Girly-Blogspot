import { useState, useEffect, useRef } from "react";
import styled from "styled-components";
import { theme } from "../../styles/theme";
import { usePosts } from "../../hooks/usePosts";
import { PostCard } from "../Posts/PostCard";
import { PostComposerModal } from "../Posts/PostComposerModal";
import { Button } from "../ui";

const Page = styled.main`
  max-width: 600px;
  margin: 0 auto;
  padding: ${theme.spacing.xl} ${theme.spacing.lg};
  padding-bottom: ${theme.spacing["3xl"]};
`;

const Header = styled.header`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: ${theme.spacing.xl};
  flex-wrap: wrap;
  gap: ${theme.spacing.md};
`;

const Title = styled.h1`
  margin: 0;
  font-size: ${theme.typography.sizes["2xl"]};
  font-weight: ${theme.typography.weights.bold};
  color: ${theme.colors.text};
`;

const StatusBadge = styled.span`
  display: inline-flex;
  align-items: center;
  gap: ${theme.spacing.xs};
  font-size: ${theme.typography.sizes.xs};
  color: ${theme.colors.textMuted};
  padding: ${theme.spacing.xs} ${theme.spacing.sm};
  background: ${theme.colors.surfaceHover};
  border-radius: ${theme.radii.full};

  &::before {
    content: "";
    width: 6px;
    height: 6px;
    border-radius: 50%;
    background: ${({ $connected }) => ($connected ? theme.colors.success : theme.colors.textMuted)};
  }
`;

const EmptyState = styled.div`
  text-align: center;
  padding: ${theme.spacing["3xl"]};
  color: ${theme.colors.textMuted};

  p {
    margin: 0 0 ${theme.spacing.lg};
    font-size: ${theme.typography.sizes.lg};
  }
`;

const ErrorBanner = styled.div`
  padding: ${theme.spacing.md};
  background: rgba(239, 68, 68, 0.1);
  border-radius: ${theme.radii.md};
  color: ${theme.colors.error};
  margin-bottom: ${theme.spacing.lg};
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

export function FeedPage() {
  const { posts, loading, loadingMore, hasMore, error, posting, socketConnected, addPost, refresh, loadMore, deletePostById } =
    usePosts();
  const [composerOpen, setComposerOpen] = useState(false);
  const sentinelRef = useRef(null);

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

  return (
    <Page>
      <Header>
        <Title>Feed</Title>
        <div style={{ display: "flex", alignItems: "center", gap: theme.spacing.md }}>
          <StatusBadge $connected={socketConnected}>
            {socketConnected ? "Live" : "Offline"}
          </StatusBadge>
          <Button onClick={() => setComposerOpen(true)}>New Post</Button>
        </div>
      </Header>

      {error && (
        <ErrorBanner>
          {error}
          <Button variant="ghost" size="sm" onClick={refresh} style={{ marginLeft: theme.spacing.md }}>
            Retry
          </Button>
        </ErrorBanner>
      )}

      {loading ? (
        <LoadingText>Loading posts…</LoadingText>
      ) : posts.length === 0 ? (
        <EmptyState>
          <p>No posts yet.</p>
        </EmptyState>
      ) : (
        <>
          {posts.map((post) => (
            <PostCard key={post._id} post={post} onDelete={deletePostById} />
          ))}
          {hasMore && <LoadMoreSentinel ref={sentinelRef} />}
          {loadingMore && <LoadMoreText>Loading more…</LoadMoreText>}
          {!hasMore && posts.length > 0 && (
            <LoadMoreText>You've seen all posts.</LoadMoreText>
          )}
        </>
      )}

      {composerOpen && (
        <PostComposerModal
          onClose={() => setComposerOpen(false)}
          onSubmit={addPost}
          loading={posting}
        />
      )}
    </Page>
  );
}
