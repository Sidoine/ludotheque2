"use client";

import styled from "@emotion/styled";
import { HandHeart, Loader2 } from "lucide-react";
import type { FormEvent } from "react";
import { useState } from "react";
import { Modal, ModalActions, ModalContent } from "../shared/modal";
import type { Game, Person } from "../types";
import { GameActionButton } from "./GameActionButton";

const LoanField = styled.label`
  display: flex;
  flex-direction: column;
  gap: 6px;
  color: #56635c;
  font-size: 9px;
  font-weight: 750;
  input,
  select {
    width: 100%;
    min-height: 40px;
    padding: 0 11px;
    border: 1px solid #dcdad2;
    border-radius: 8px;
    outline: 0;
    color: var(--ink);
    background: white;
    font-size: 11px;
    &:focus {
      border-color: #91aa9c;
      box-shadow: 0 0 0 3px rgba(49, 95, 77, 0.07);
    }
  }
  small {
    color: #a0a5a2;
    font-weight: 400;
  }
`;
const LoanSpinner = styled(Loader2)`
  animation: loan-spin 1s linear infinite;
  @keyframes loan-spin {
    to {
      transform: rotate(360deg);
    }
  }
`;

function todayString() {
  return new Date().toISOString().slice(0, 10);
}

export function GameLoanModal({
  game,
  people,
  onClose,
  onSaved,
  onToast,
}: {
  game: Game;
  people: Person[];
  onClose: () => void;
  onSaved: () => void;
  onToast: (message: string, error?: boolean) => void;
}) {
  const [borrowerId, setBorrowerId] = useState(people[0]?.id ?? 0);
  const [borrowedAt, setBorrowedAt] = useState(todayString());
  const [dueAt, setDueAt] = useState("");
  const [saving, setSaving] = useState(false);
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!borrowerId)
      return onToast("Choisissez la personne qui emprunte ce jeu.", true);
    setSaving(true);
    const response = await fetch("/api/loans", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        gameId: game.id,
        borrowerId,
        borrowedAt,
        dueAt: dueAt || null,
      }),
    });
    const payload = await response.json();
    setSaving(false);
    if (!response.ok)
      return onToast(
        payload.error || "Impossible d’enregistrer ce prêt.",
        true,
      );
    onToast(`${game.title} est maintenant emprunté`);
    onSaved();
  }
  return (
    <Modal
      title="Enregistrer un emprunt"
      subtitle="Indiquez qui emprunte cette boîte."
      onClose={onClose}
      onSubmit={submit}
    >
      <ModalContent>
        <LoanField>
          <span>Emprunté par *</span>
          <select
            value={borrowerId}
            onChange={(event) => setBorrowerId(Number(event.target.value))}
          >
            {people.map((person) => (
              <option key={person.id} value={person.id}>
                {person.name}
              </option>
            ))}
          </select>
        </LoanField>
        <LoanField>
          <span>Date d’emprunt *</span>
          <input
            type="date"
            required
            value={borrowedAt}
            onChange={(event) => setBorrowedAt(event.target.value)}
          />
        </LoanField>
        <LoanField>
          <span>
            Date de retour prévue <small>facultatif</small>
          </span>
          <input
            type="date"
            value={dueAt}
            onChange={(event) => setDueAt(event.target.value)}
          />
        </LoanField>
      </ModalContent>
      <ModalActions>
        <GameActionButton type="button" onClick={onClose}>
          Annuler
        </GameActionButton>
        <GameActionButton $primary disabled={saving}>
          {saving ? <LoanSpinner size={17} /> : <HandHeart size={17} />}{" "}
          Enregistrer l’emprunt
        </GameActionButton>
      </ModalActions>
    </Modal>
  );
}
