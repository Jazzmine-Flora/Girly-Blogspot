import { useEffect } from "react";
import styled from "styled-components";
import { theme } from "../../styles/theme";
import { Button } from "./Button";

const Overlay = styled.div`
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: ${theme.spacing.lg};
  animation: fadeIn 0.2s ease;

  @keyframes fadeIn {
    from { opacity: 0; }
    to { opacity: 1; }
  }
`;

const ModalBox = styled.div`
  background: ${theme.colors.surface};
  border-radius: ${theme.radii.xl};
  box-shadow: ${theme.shadows.xl};
  max-width: 500px;
  width: 100%;
  max-height: 90vh;
  overflow-y: auto;
  animation: slideUp 0.25s ease;

  @keyframes slideUp {
    from {
      opacity: 0;
      transform: translateY(20px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
`;

const ModalHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: ${theme.spacing.lg};
  border-bottom: 1px solid ${theme.colors.borderLight};
`;

const ModalTitle = styled.h2`
  margin: 0;
  font-size: ${theme.typography.sizes.xl};
  font-weight: ${theme.typography.weights.semibold};
  color: ${theme.colors.text};
`;

const CloseBtn = styled.button`
  background: none;
  border: none;
  padding: ${theme.spacing.sm};
  cursor: pointer;
  color: ${theme.colors.textMuted};
  font-size: 1.5rem;
  line-height: 1;
  border-radius: ${theme.radii.sm};
  transition: color ${theme.transitions.fast}, background ${theme.transitions.fast};

  &:hover {
    color: ${theme.colors.text};
    background: ${theme.colors.surfaceHover};
  }
`;

const ModalBody = styled.div`
  padding: ${theme.spacing.lg};
`;

export function Modal({ title, children, onClose, showClose = true }) {
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === "Escape") onClose?.();
    };
    document.addEventListener("keydown", handleEscape);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.body.style.overflow = "";
    };
  }, [onClose]);

  return (
    <Overlay onClick={(e) => e.target === e.currentTarget && onClose?.()}>
      <ModalBox onClick={(e) => e.stopPropagation()}>
        <ModalHeader>
          <ModalTitle>{title}</ModalTitle>
          {showClose && (
            <CloseBtn onClick={onClose} aria-label="Close">
              ×
            </CloseBtn>
          )}
        </ModalHeader>
        <ModalBody>{children}</ModalBody>
      </ModalBox>
    </Overlay>
  );
}
