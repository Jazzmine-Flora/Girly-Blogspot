import styled from "styled-components";
import { theme } from "../../styles/theme";

const StyledAvatar = styled.div`
  width: ${({ $size }) => $size || "40px"};
  height: ${({ $size }) => $size || "40px"};
  border-radius: ${theme.radii.full};
  background: linear-gradient(135deg, ${theme.colors.primaryLight}, ${theme.colors.accent});
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  flex-shrink: 0;
  font-weight: ${theme.typography.weights.semibold};
  font-size: ${({ $size }) => {
    const num = parseInt($size, 10) || 40;
    return `${num * 0.45}px`;
  }};
  color: ${theme.colors.primary};

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
`;

export function Avatar({ src, alt, name, size = "40px" }) {
  const initials = name
    ?.split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <StyledAvatar $size={size}>
      {src ? <img src={src} alt={alt || name} /> : initials || "?"}
    </StyledAvatar>
  );
}
