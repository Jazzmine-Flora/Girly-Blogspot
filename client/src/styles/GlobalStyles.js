import { createGlobalStyle } from "styled-components";
import { theme } from "./theme";

export const GlobalStyles = createGlobalStyle`
  *, *::before, *::after {
    box-sizing: border-box;
  }

  html {
    font-size: 16px;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
  }

  body {
    margin: 0;
    padding: 0;
    font-family: ${theme.typography.fontFamily};
    font-size: ${theme.typography.sizes.base};
    font-weight: ${theme.typography.weights.normal};
    color: ${theme.colors.text};
    background: ${theme.colors.background};
    line-height: 1.5;
    min-height: 100vh;
  }

  #root {
    min-height: 100vh;
  }

  a {
    color: ${theme.colors.primary};
    text-decoration: none;
    transition: color ${theme.transitions.fast};

    &:hover {
      color: ${theme.colors.primaryHover};
    }
  }

  button {
    font-family: inherit;
    cursor: pointer;
  }

  input, textarea {
    font-family: inherit;
  }

  img {
    max-width: 100%;
    height: auto;
    display: block;
  }

  ul, ol {
    margin: 0;
    padding: 0;
    list-style: none;
  }
`;
