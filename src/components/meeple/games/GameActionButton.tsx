"use client";

import styled from "@emotion/styled";
export const GameActionButton = styled.button<{
  $primary?: boolean;
}>`
  min-height: 40px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 0 15px;
  border: 1px solid
    ${({ $primary }) => ($primary ? "var(--forest)" : "#d7d5ce")};
  border-radius: 9px;
  color: ${({ $primary }) => ($primary ? "white" : "#4e5b55")};
  background: ${({ $primary }) =>
    $primary ? "var(--forest)" : "rgba(255,255,255,.72)"};
  font-size: 12px;
  font-weight: 700;
  cursor: pointer;
  &:disabled {
    opacity: 0.55;
    cursor: not-allowed;
  }
`;
