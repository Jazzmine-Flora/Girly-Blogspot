import styled from "styled-components";
import { theme } from "../../styles/theme";

const StyledButton = styled.button`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: ${theme.spacing.sm};
  padding: ${theme.spacing.sm} ${theme.spacing.lg};
  font-size: ${theme.typography.sizes.sm};
  font-weight: ${theme.typography.weights.semibold};
  border: none;
  border-radius: ${theme.radii.full};
  cursor: pointer;
  transition: all ${theme.transitions.fast};
  white-space: nowrap;

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }

  ${({ variant }) => {
    switch (variant) {
      case "secondary":
        return `
          background: ${theme.colors.surface};
          color: ${theme.colors.text};
          border: 1px solid ${theme.colors.border};
          &:hover:not(:disabled) {
            background: ${theme.colors.surfaceHover};
            border-color: ${theme.colors.textMuted};
          }
        `;
      case "ghost":
        return `
          background: transparent;
          color: ${theme.colors.textSecondary};
          &:hover:not(:disabled) {
            background: ${theme.colors.surfaceHover};
            color: ${theme.colors.text};
          }
        `;
      case "danger":
        return `
          background: ${theme.colors.error};
          color: white;
          &:hover:not(:disabled) {
            filter: brightness(1.1);
          }
        `;
      default:
        return `
          background: ${theme.colors.primary};
          color: white;
          &:hover:not(:disabled) {
            background: ${theme.colors.primaryHover};
          }
        `;
    }
  }}

  ${({ size }) => {
    switch (size) {
      case "sm":
        return `padding: ${theme.spacing.xs} ${theme.spacing.md}; font-size: ${theme.typography.sizes.xs};`;
      case "lg":
        return `padding: ${theme.spacing.md} ${theme.spacing.xl}; font-size: ${theme.typography.sizes.base};`;
      default:
        return "";
    }
  }}
`;

export function Button({ children, variant = "primary", size, ...props }) {
  return (
    <StyledButton variant={variant} size={size} {...props}>
      {children}
    </StyledButton>
  );
}
