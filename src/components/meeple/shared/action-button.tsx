"use client";

import styled from "@emotion/styled";

export const ActionButton = styled.button<{
  $variant?: "primary" | "secondary" | "ghost";
}>`
  min-height: 40px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 0 15px;
  border: 1px solid
    ${({ $variant = "primary" }) =>
      $variant === "primary"
        ? "var(--forest)"
        : $variant === "secondary"
          ? "#d7d5ce"
          : "transparent"};
  border-radius: 9px;
  color: ${({ $variant = "primary" }) =>
    $variant === "primary"
      ? "white"
      : $variant === "secondary"
        ? "#4e5b55"
        : "var(--muted)"};
  background: ${({ $variant = "primary" }) =>
    $variant === "primary"
      ? "var(--forest)"
      : $variant === "secondary"
        ? "rgba(255,255,255,.72)"
        : "transparent"};
  font-size: 12px;
  font-weight: 700;
  cursor: pointer;
  transition:
    transform 0.15s,
    box-shadow 0.15s,
    background 0.15s;

  &:disabled {
    cursor: not-allowed;
    opacity: 0.55;
  }

  &:hover:not(:disabled) {
    background: ${({ $variant = "primary" }) =>
      $variant === "primary"
        ? "var(--forest-dark)"
        : $variant === "secondary"
          ? "white"
          : "#f3f2ed"};
  }
`;
