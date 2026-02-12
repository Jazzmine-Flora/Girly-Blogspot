import { Link, useNavigate } from "react-router-dom";
import { useState, useEffect, useRef } from "react";
import styled from "styled-components";
import { theme } from "../../styles/theme";
import { useAuth } from "../../context/AuthContext";
import { Button, Avatar } from "../ui";
import { getUserProfile } from "../../api";

const Nav = styled.nav`
  position: sticky;
  top: 0;
  z-index: 100;
  background: ${theme.colors.surface};
  border-bottom: 1px solid ${theme.colors.borderLight};
  box-shadow: ${theme.shadows.sm};
  backdrop-filter: blur(8px);
`;

const NavContainer = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: ${theme.spacing.md} ${theme.spacing.xl};
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: ${theme.spacing.lg};

  @media (max-width: ${theme.breakpoints.sm}) {
    padding: ${theme.spacing.md} ${theme.spacing.md};
  }
`;

const Logo = styled(Link)`
  font-size: ${theme.typography.sizes.xl};
  font-weight: ${theme.typography.weights.bold};
  background: linear-gradient(135deg, ${theme.colors.primary}, ${theme.colors.accent});
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  text-decoration: none;
  display: flex;
  align-items: center;
  gap: ${theme.spacing.sm};
  transition: opacity ${theme.transitions.fast};

  &:hover {
    opacity: 0.8;
  }
`;

const NavLinks = styled.div`
  display: flex;
  align-items: center;
  gap: ${theme.spacing.lg};

  @media (max-width: ${theme.breakpoints.sm}) {
    gap: ${theme.spacing.md};
  }
`;

const IconButton = styled(Link)`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  border-radius: ${theme.radii.full};
  color: ${theme.colors.textSecondary};
  text-decoration: none;
  font-size: 20px;
  transition: all ${theme.transitions.fast};
  position: relative;

  &:hover {
    color: ${theme.colors.primary};
    background: ${theme.colors.surfaceHover};
  }

  &.active {
    color: ${theme.colors.primary};
    background: ${theme.colors.primaryLight}20;
  }
`;

const UserMenuButton = styled.button`
  display: flex;
  align-items: center;
  gap: ${theme.spacing.sm};
  padding: ${theme.spacing.xs};
  border: none;
  background: transparent;
  border-radius: ${theme.radii.full};
  cursor: pointer;
  transition: background ${theme.transitions.fast};

  &:hover {
    background: ${theme.colors.surfaceHover};
  }
`;

const DropdownMenu = styled.div`
  position: absolute;
  top: calc(100% + ${theme.spacing.sm});
  right: 0;
  min-width: 200px;
  background: ${theme.colors.surface};
  border: 1px solid ${theme.colors.borderLight};
  border-radius: ${theme.radii.lg};
  box-shadow: ${theme.shadows.lg};
  overflow: hidden;
  opacity: ${({ $isOpen }) => ($isOpen ? 1 : 0)};
  visibility: ${({ $isOpen }) => ($isOpen ? "visible" : "hidden")};
  transform: translateY(${({ $isOpen }) => ($isOpen ? "0" : "-10px")});
  transition: all ${theme.transitions.normal};
`;

const DropdownItem = styled(Link)`
  display: flex;
  align-items: center;
  gap: ${theme.spacing.md};
  padding: ${theme.spacing.md} ${theme.spacing.lg};
  color: ${theme.colors.text};
  text-decoration: none;
  font-size: ${theme.typography.sizes.sm};
  transition: background ${theme.transitions.fast};

  &:hover {
    background: ${theme.colors.surfaceHover};
  }

  span {
    font-size: 18px;
  }
`;

const DropdownButton = styled.button`
  display: flex;
  align-items: center;
  gap: ${theme.spacing.md};
  width: 100%;
  padding: ${theme.spacing.md} ${theme.spacing.lg};
  border: none;
  background: transparent;
  color: ${theme.colors.error};
  text-decoration: none;
  font-size: ${theme.typography.sizes.sm};
  cursor: pointer;
  transition: background ${theme.transitions.fast};
  text-align: left;

  &:hover {
    background: ${theme.colors.surfaceHover};
  }

  span {
    font-size: 18px;
  }
`;

const UserMenuWrapper = styled.div`
  position: relative;
`;

export function Navbar() {
  const { isAuthenticated, logout, userId } = useAuth();
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [user, setUser] = useState(null);
  const menuRef = useRef(null);

  useEffect(() => {
    if (isAuthenticated && userId) {
      getUserProfile(userId).then(setUser).catch(() => {});
    }
  }, [isAuthenticated, userId]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setIsMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = () => {
    logout();
    setIsMenuOpen(false);
    navigate("/signin");
  };

  const profilePic = user?.profilePicture?.startsWith("data:")
    ? user.profilePicture
    : user?.profilePicture
    ? `/${user.profilePicture}`
    : null;

  return (
    <Nav>
      <NavContainer>
        <Logo to="/">✨ Girly Blog</Logo>
        <NavLinks>
          {isAuthenticated ? (
            <>
              <IconButton to="/feed" title="Home Feed">
                🏠
              </IconButton>
              <UserMenuWrapper ref={menuRef}>
                <UserMenuButton onClick={() => setIsMenuOpen(!isMenuOpen)}>
                  <Avatar src={profilePic} name={user?.username || "User"} size="36px" />
                </UserMenuButton>
                <DropdownMenu $isOpen={isMenuOpen}>
                  <DropdownItem to={userId ? `/profile/${userId}` : "/profile"} onClick={() => setIsMenuOpen(false)}>
                    <span>👤</span> My Profile
                  </DropdownItem>
                  <DropdownItem to="/edit-profile" onClick={() => setIsMenuOpen(false)}>
                    <span>⚙️</span> Edit Profile
                  </DropdownItem>
                  <DropdownButton onClick={handleLogout}>
                    <span>🚪</span> Log out
                  </DropdownButton>
                </DropdownMenu>
              </UserMenuWrapper>
            </>
          ) : (
            <>
              <Button variant="ghost" size="sm" as={Link} to="/signin">
                Sign In
              </Button>
              <Button size="sm" as={Link} to="/signup">
                Sign Up
              </Button>
            </>
          )}
        </NavLinks>
      </NavContainer>
    </Nav>
  );
}
