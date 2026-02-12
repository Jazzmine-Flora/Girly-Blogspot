import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import styled from "styled-components";
import { theme } from "../../styles/theme";
import { login } from "../../api";
import { useAuth } from "../../context/AuthContext";
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

export function SignInPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const { login: authLogin } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || "/feed";

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");
    setLoading(true);
    try {
      const { data } = await login({ username, password });
      authLogin(data.token, data.userId);
      navigate(from, { replace: true });
    } catch {
      setMessage("Invalid username or password.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Page>
      <StyledCard>
        <CardBody>
          <Title>Sign In</Title>
          <Form onSubmit={handleSubmit}>
            <Input
              label="Username"
              placeholder="Enter your username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              autoComplete="username"
            />
            <Input
              label="Password"
              type="password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="current-password"
            />
            {message && <Message $error={message.includes("Invalid")}>{message}</Message>}
            <Button type="submit" disabled={loading}>
              {loading ? "Signing in…" : "Sign In"}
            </Button>
          </Form>
          <Footer>
            Don't have an account? <Link to="/signup">Sign up</Link>
          </Footer>
        </CardBody>
      </StyledCard>
    </Page>
  );
}
