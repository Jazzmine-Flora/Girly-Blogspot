import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import styled from "styled-components";
import { theme } from "../../styles/theme";
import { signup } from "../../api";
import { Input, Button } from "../ui";
import { Card, CardBody } from "../ui";

const Page = styled.main`
  min-height: 60vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: ${theme.spacing.xl};
`;

const StyledCard = styled(Card)`
  max-width: 400px;
  width: 100%;
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: ${theme.spacing.md};
`;

const Title = styled.h1`
  margin: 0 0 ${theme.spacing.lg};
  font-size: ${theme.typography.sizes["2xl"]};
  font-weight: ${theme.typography.weights.bold};
  color: ${theme.colors.text};
`;

const Message = styled.p`
  margin: 0;
  font-size: ${theme.typography.sizes.sm};
  color: ${({ $error }) => ($error ? theme.colors.error : theme.colors.success)};
`;

const Footer = styled.p`
  margin: ${theme.spacing.lg} 0 0;
  font-size: ${theme.typography.sizes.sm};
  color: ${theme.colors.textSecondary};
  text-align: center;
`;

export function SignUpPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [bio, setBio] = useState("");
  const [age, setAge] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");
    if (!username?.trim() || !password || !age) {
      setMessage("Username, password, and age are required.");
      return;
    }
    const ageNum = parseInt(age, 10);
    if (isNaN(ageNum) || ageNum < 13) {
      setMessage("You must be at least 13 years old to sign up.");
      return;
    }
    setLoading(true);
    try {
      await signup({ username: username.trim(), password, bio: bio.trim() || undefined, age: ageNum });
      setMessage("Account created! Redirecting to sign in…");
      setTimeout(() => navigate("/signin"), 1500);
    } catch {
      setMessage("Sign up failed. Username may already be taken.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Page>
      <StyledCard>
        <CardBody>
          <Title>Sign Up</Title>
          <Form onSubmit={handleSubmit}>
            <Input
              label="Username"
              placeholder="Choose a username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              autoComplete="username"
            />
            <Input
              label="Password"
              type="password"
              placeholder="Create a password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="new-password"
            />
            <Input
              label="Age"
              type="number"
              placeholder="Your age"
              value={age}
              onChange={(e) => setAge(e.target.value)}
              min={13}
              required
            />
            <Input
              label="Bio (optional)"
              placeholder="Tell us about yourself"
              value={bio}
              onChange={(e) => setBio(e.target.value)}
            />
            {message && (
              <Message $error={!message.includes("created")}>{message}</Message>
            )}
            <Button type="submit" disabled={loading}>
              {loading ? "Creating account…" : "Sign Up"}
            </Button>
          </Form>
          <Footer>
            Already have an account? <Link to="/signin">Sign in</Link>
          </Footer>
        </CardBody>
      </StyledCard>
    </Page>
  );
}
