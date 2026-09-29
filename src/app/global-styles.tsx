"use client";

import { css, Global } from "@emotion/react";

const styles = css`
  :root {
    --forest: #315f4d;
    --forest-dark: #264c3e;
    --forest-soft: #e6eee9;
    --ink: #26332e;
    --muted: #78817c;
    --cream: #f5f3ed;
    --paper: #fffefa;
    --line: #e5e2d9;
    --terracotta: #bd6951;
    --gold: #d4a44f;
    --blue: #668095;
    --plum: #776b87;
    --serif: "Trebuchet MS", "Segoe UI", sans-serif;
    --shadow: 0 10px 30px rgba(43, 57, 49, 0.06);
  }

  *,
  *::before,
  *::after {
    box-sizing: border-box;
  }

  html {
    background: var(--cream);
    scroll-behavior: smooth;
  }

  body {
    margin: 0;
    color: var(--ink);
    background: var(--cream);
    font-family:
      "Trebuchet MS", "Segoe UI", ui-sans-serif, system-ui, sans-serif;
    font-size: 14px;
  }

  button,
  input,
  select,
  textarea {
    font: inherit;
  }

  button,
  a {
    -webkit-tap-highlight-color: transparent;
  }

  button {
    color: inherit;
  }

  button:focus-visible,
  a:focus-visible,
  input:focus-visible,
  select:focus-visible,
  textarea:focus-visible {
    outline: 3px solid rgba(49, 95, 77, 0.2);
    outline-offset: 2px;
  }

  ::selection {
    background: #cdded4;
  }
`;

export function GlobalStyles() {
  return <Global styles={styles} />;
}
