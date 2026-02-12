import { Link } from "react-router-dom";
import styled from "styled-components";
import { theme } from "../../styles/theme";
import { useAuth } from "../../context/AuthContext";
import { Button } from "../ui";

const Hero = styled.section`
  min-height: 70vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  padding: ${theme.spacing["3xl"]} ${theme.spacing.lg};
`;

const Title = styled.h1`
  margin: 0 0 ${theme.spacing.lg};
  font-size: clamp(2rem, 5vw, 3.5rem);
  font-weight: ${theme.typography.weights.bold};
  color: ${theme.colors.text};
  line-height: 1.2;
`;

const Subtitle = styled.p`
  margin: 0 0 ${theme.spacing["2xl"]};
  font-size: ${theme.typography.sizes.xl};
  color: ${theme.colors.textSecondary};
  max-width: 480px;
  line-height: 1.6;
`;

const FeatureList = styled.ul`
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: ${theme.spacing.xl};
  margin: 0 0 ${theme.spacing["2xl"]};
  padding: 0;
`;

const Feature = styled.li`
  display: flex;
  align-items: center;
  gap: ${theme.spacing.sm};
  font-size: ${theme.typography.sizes.base};
  color: ${theme.colors.textSecondary};
`;

const CTA = styled.div`
  display: flex;
  gap: ${theme.spacing.md};
  flex-wrap: wrap;
  justify-content: center;
`;

export function HomePage() {
  const { isAuthenticated } = useAuth();

  return (
    <Hero>
      <Title>Share your stories, connect with others</Title>
      <Subtitle>
        A fun and supportive community where you can express yourself, create posts, and connect with like-minded people.
      </Subtitle>
      <FeatureList>
        <Feature>✨ Create and customize your posts</Feature>
        <Feature>💬 Comment and interact</Feature>
        <Feature>🌸 Personalize your profile</Feature>
      </FeatureList>
      <CTA>
        {isAuthenticated ? (
          <Button as={Link} to="/feed">
            Go to Feed
          </Button>
        ) : (
          <>
            <Button as={Link} to="/signin" variant="secondary">
              Sign In
            </Button>
            <Button as={Link} to="/signup">
              Sign Up
            </Button>
          </>
        )}
      </CTA>
    </Hero>
  );
}
