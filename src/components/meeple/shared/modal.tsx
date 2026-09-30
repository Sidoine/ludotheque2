"use client";

import styled from "@emotion/styled";
import { X } from "lucide-react";
import type { FormEventHandler, ReactNode } from "react";
import { Eyebrow } from "./ui";

const ModalBackdrop = styled.div`
  position: fixed;
  z-index: 100;
  inset: 0;
  display: grid;
  place-items: center;
  padding: 25px;
  background: rgba(26, 39, 33, 0.54);
  backdrop-filter: blur(4px);
  animation: fade-in 0.18s ease-out;

  @media (max-width: 680px) {
    align-items: end;
    padding: 0;
  }
`;

const ModalSurface = styled.section<{ $wide: boolean }>`
  width: ${({ $wide }) => ($wide ? "min(690px, 100%)" : "min(470px, 100%)")};
  max-height: calc(100vh - 38px);
  display: flex;
  flex-direction: column;
  overflow: hidden;
  border-radius: 17px;
  background: var(--paper);
  box-shadow: 0 25px 70px rgba(20, 35, 28, 0.25);
  animation: modal-in 0.2s ease-out;

  @media (max-width: 680px) {
    width: 100%;
    max-height: 94vh;
    border-radius: 18px 18px 0 0;
  }
`;

const ModalHeader = styled.div`
  flex-shrink: 0;
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 20px;
  padding: 25px 27px 18px;
  border-bottom: 1px solid var(--line);

  h2 {
    margin: 0;
    font-family: var(--serif);
    font-size: 23px;
    font-weight: 500;
  }

  & > div > p:last-child:not(.eyebrow) {
    margin: 6px 0 0;
    color: var(--muted);
    font-size: 9px;
  }

  @media (max-width: 680px) {
    padding: 21px 19px 15px;
  }
`;

const CloseButton = styled.button`
  width: 35px;
  height: 35px;
  flex: 0 0 auto;
  display: grid;
  place-items: center;
  border: 1px solid var(--line);
  border-radius: 9px;
  color: #738078;
  background: white;
  cursor: pointer;
  transition: 0.16s;

  &:hover {
    color: var(--forest);
    border-color: #bfcfc6;
    background: var(--forest-soft);
  }
`;

const StyledModalContent = styled.div`
  flex: 1;
  min-height: 0;
  display: flex;
  flex-direction: column;
  gap: 16px;
  overflow-y: auto;
  overscroll-behavior: contain;
`;

const ModalForm = styled.form`
  flex: 1;
  min-height: 0;
  display: flex;
  flex-direction: column;
  gap: 16px;
  overflow: hidden;
  padding: 22px 27px 25px;

  @media (max-width: 700px) {
    padding: 19px;
  }
`;

const StyledModalActions = styled.div<{ $split: boolean }>`
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: ${({ $split }) => ($split ? "space-between" : "flex-end")};
  gap: 7px;
  margin: 3px -27px -25px;
  padding: 16px 27px;
  border-top: 1px solid var(--line);
  background: #faf9f5;

  & > div {
    display: ${({ $split }) => ($split ? "flex" : "block")};
    gap: 7px;
  }

  @media (max-width: 680px) {
    margin: 3px -19px -19px;
    padding: 14px 19px;

    ${({ $split }) =>
      $split
        ? `
      align-items: stretch;
      flex-direction: column-reverse;

      & > div {
        display: grid;
        grid-template-columns: 1fr 1fr;
      }
    `
        : ""}
  }
`;

export function ModalContent({ children }: { children: ReactNode }) {
  return <StyledModalContent>{children}</StyledModalContent>;
}

export function ModalActions({
  children,
  split = false,
}: {
  children: ReactNode;
  split?: boolean;
}) {
  return <StyledModalActions $split={split}>{children}</StyledModalActions>;
}

export function Modal({
  title,
  subtitle,
  onClose,
  children,
  wide = false,
  onSubmit,
}: {
  title: string;
  subtitle?: string;
  onClose: () => void;
  children: ReactNode;
  wide?: boolean;
  onSubmit?: FormEventHandler<HTMLFormElement>;
}) {
  return (
    <ModalBackdrop
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <ModalSurface
        $wide={wide}
        role="dialog"
        aria-modal="true"
        aria-label={title}
      >
        <ModalHeader>
          <div>
            <Eyebrow>Ludothèque</Eyebrow>
            <h2>{title}</h2>
            {subtitle && <p>{subtitle}</p>}
          </div>
          <CloseButton type="button" onClick={onClose} aria-label="Fermer">
            <X size={19} />
          </CloseButton>
        </ModalHeader>
        {onSubmit ? (
          <ModalForm onSubmit={onSubmit}>{children}</ModalForm>
        ) : (
          children
        )}
      </ModalSurface>
    </ModalBackdrop>
  );
}
