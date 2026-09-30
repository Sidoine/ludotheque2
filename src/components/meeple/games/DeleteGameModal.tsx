"use client";

import styled from "@emotion/styled";
import { Trash2 } from "lucide-react";
import { ActionButton } from "../shared/action-button";
import { Modal, ModalActions, ModalContent } from "../shared/modal";
import type { Game } from "../types";

const DeleteModalLayout = styled.div`
  flex: 1;
  min-height: 0;
  display: flex;
  flex-direction: column;
  gap: 16px;
  overflow: hidden;
  padding: 22px 27px 25px;

  @media (max-width: 680px) {
    padding: 19px;
  }
`;

const DeletePrompt = styled.div`
  display: flex;
  align-items: flex-start;
  gap: 12px;
  padding: 14px;
  border-radius: 10px;
  color: #8c3f30;
  background: #f5e2db;

  & > span {
    flex: 0 0 auto;
    display: grid;
    width: 34px;
    height: 34px;
    place-items: center;
    border-radius: 9px;
    background: rgba(255, 255, 255, 0.65);
  }

  p {
    margin: 0;
    font-size: 12px;
    line-height: 1.5;
  }
`;

const DeleteConfirmButton = styled(ActionButton)`
  border-color: #a33f2b;
  background: #a33f2b;

  &:hover:not(:disabled) {
    background: #873526;
  }
`;

export function DeleteGameModal({
  game,
  pending,
  onCancel,
  onConfirm,
}: {
  game: Game;
  pending: boolean;
  onCancel: () => void;
  onConfirm: () => void;
}) {
  return (
    <Modal
      title="Supprimer ce jeu ?"
      subtitle={`« ${game.title} » sera retiré de votre ludothèque.`}
      onClose={() => {
        if (!pending) onCancel();
      }}
    >
      <DeleteModalLayout>
        <ModalContent>
          <DeletePrompt>
            <span>
              <Trash2 size={18} />
            </span>
            <p>Cette action est définitive. Confirmez-vous la suppression ?</p>
          </DeletePrompt>
        </ModalContent>
        <ModalActions>
          <ActionButton
            $variant="secondary"
            type="button"
            disabled={pending}
            onClick={onCancel}
          >
            Annuler
          </ActionButton>
          <DeleteConfirmButton
            $variant="primary"
            type="button"
            disabled={pending}
            onClick={onConfirm}
          >
            <Trash2 size={16} />
            {pending ? "Suppression…" : "Supprimer"}
          </DeleteConfirmButton>
        </ModalActions>
      </DeleteModalLayout>
    </Modal>
  );
}
