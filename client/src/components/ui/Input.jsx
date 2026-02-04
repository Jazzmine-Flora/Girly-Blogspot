import styled from "styled-components";
import { theme } from "../../styles/theme";

const StyledInput = styled.input`
  width: 100%;
  padding: ${theme.spacing.md};
  font-size: ${theme.typography.sizes.base};
  color: ${theme.colors.text};
  background: ${theme.colors.surface};
  border: 1px solid ${theme.colors.border};
  border-radius: ${theme.radii.md};
  transition: border-color ${theme.transitions.fast}, box-shadow ${theme.transitions.fast};

  &::placeholder {
    color: ${theme.colors.textMuted};
  }

  &:focus {
    outline: none;
    border-color: ${theme.colors.primary};
    box-shadow: 0 0 0 3px ${theme.colors.primaryLight}40;
  }

  &:disabled {
    background: ${theme.colors.surfaceHover};
    cursor: not-allowed;
    opacity: 0.7;
  }

  ${({ $error }) =>
    $error &&
    `
    border-color: ${theme.colors.error};
    &:focus {
      border-color: ${theme.colors.error};
      box-shadow: 0 0 0 3px rgba(239, 68, 68, 0.2);
    }
  `}
`;

const StyledTextarea = styled(StyledInput).attrs({ as: "textarea" })`
  min-height: 120px;
  resize: vertical;
`;

const Label = styled.label`
  display: block;
  font-size: ${theme.typography.sizes.sm};
  font-weight: ${theme.typography.weights.medium};
  color: ${theme.colors.text};
  margin-bottom: ${theme.spacing.xs};
`;

const ErrorText = styled.span`
  display: block;
  font-size: ${theme.typography.sizes.xs};
  color: ${theme.colors.error};
  margin-top: ${theme.spacing.xs};
`;

const Wrapper = styled.div`
  margin-bottom: ${theme.spacing.md};
`;

export function Input({ label, error, ...props }) {
  return (
    <Wrapper>
      {label && <Label>{label}</Label>}
      <StyledInput $error={!!error} {...props} />
      {error && <ErrorText>{error}</ErrorText>}
    </Wrapper>
  );
}

export function Textarea({ label, error, ...props }) {
  return (
    <Wrapper>
      {label && <Label>{label}</Label>}
      <StyledTextarea $error={!!error} {...props} />
      {error && <ErrorText>{error}</ErrorText>}
    </Wrapper>
  );
}
