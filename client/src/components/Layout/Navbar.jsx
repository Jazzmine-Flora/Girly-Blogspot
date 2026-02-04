import { Link, useNavigate } from "react-router-dom";
import styled from "styled-components";
import { theme } from "../../styles/theme";
import { useAuth } from "../../context/AuthContext";
import { Button } from "../ui";

const Nav = styled.nav`
  position: sticky;
  top: 0;
  z-index: 100;
  background: ${theme.colors.surface};
  border-bottom: 1px solid ${theme.colors.borderLight};
  padding: ${theme.spacing.md} ${theme.spacing.xl};
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: ${theme.spacing.lg};
  flex-wrap: wrap;
`;

const Logo = styled(Link)`
  font-size: ${theme.typography.sizes.xl};
  font-weight: ${theme.typography.weights.bold};
  color: ${theme.colors.primary};
  text-decoration: none;

  &:hover {
    color: ${theme.colors.primaryHover};
  }
`;

const NavLinks = styled.div`
  display: flex;
  align-items: center;
  gap: ${theme.spacing.md};
`;

const NavLink = styled(Link)`
  font-size: ${theme.typography.sizes.sm};
  font-weight: ${theme.typography.weights.medium};
  color: ${theme.colors.textSecondary};
  text-decoration: none;
  padding: ${theme.spacing.sm} ${theme.spacing.md};
  border-radius: ${theme.radii.md};
  transition: color ${theme.transitions.fast}, background ${theme.transitions.fast};

  &:hover {
    color: ${theme.colors.text};
    background: ${theme.colors.surfaceHover};
  }
`;

export function Navbar() {
  const { isAuthenticated, logout, userId } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/signin");
  };

  return (
    <Nav>
      <Logo to="/">Girly Blog</Logo>
      <NavLinks>
        {isAuthenticated ? (
          <>
            <NavLink to="/feed">Feed</NavLink>
            <NavLink to={userId ? `/profile/${userId}` : "/profile"}>Profile</NavLink>
            <NavLink to="/edit-profile">Edit Profile</NavLink>
            <Button variant="ghost" size="sm" onClick={handleLogout}>
              Log out
            </Button>
          </>
        ) : (
          <>
            <NavLink to="/signin">Sign In</NavLink>
            <Button size="sm" as={Link} to="/signup">
              Sign Up
            </Button>
          </>
        )}
      </NavLinks>
    </Nav>
  );
}
