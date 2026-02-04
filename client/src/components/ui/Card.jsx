import styled from "styled-components";
import { theme } from "../../styles/theme";

export const Card = styled.div`
  background: ${theme.colors.surface};
  border-radius: ${theme.radii.lg};
  box-shadow: ${theme.shadows.sm};
  border: 1px solid ${theme.colors.borderLight};
  overflow: hidden;
  transition: box-shadow ${theme.transitions.fast};

  &:hover {
    box-shadow: ${theme.shadows.md};
  }
`;

export const CardHeader = styled.div`
  padding: ${theme.spacing.lg};
  border-bottom: 1px solid ${theme.colors.borderLight};
`;

export const CardBody = styled.div`
  padding: ${theme.spacing.lg};
`;

export const CardFooter = styled.div`
  padding: ${theme.spacing.md} ${theme.spacing.lg};
  border-top: 1px solid ${theme.colors.borderLight};
  background: ${theme.colors.background};
`;
