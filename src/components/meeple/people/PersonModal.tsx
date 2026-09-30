"use client";

import styled from "@emotion/styled";
import { Check, UserPlus } from "lucide-react";
import type { FormEvent } from "react";
import { useState } from "react";
import { ActionButton } from "../shared/action-button";
import { Modal, ModalActions, ModalContent } from "../shared/modal";
import { FormField, Spinner, SwitchField } from "../shared/modal-form";
import type { Person } from "../types";

const personColors = [
  { name: "Vert", value: "#436F5B" },
  { name: "Terracotta", value: "#C1694F" },
  { name: "Bleu", value: "#5F6F9B" },
  { name: "Ocre", value: "#B77854" },
  { name: "Mauve", value: "#766A8F" },
  { name: "Rose", value: "#AE7A75" },
];

const ColorOptions = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 9px;
`;

const ColorField = styled.fieldset`
  margin: 0;
  padding: 0;
  border: 0;
  legend {
    margin-bottom: 7px;
    color: #56635c;
    font-size: 9px;
    font-weight: 750;
  }
`;

const ColorOption = styled.button<{ $selected: boolean; $color: string }>`
  display: grid;
  width: 30px;
  height: 30px;
  place-items: center;
  border: 2px solid white;
  border-radius: 50%;
  outline: 1px solid
    ${({ $selected }) => ($selected ? "var(--ink)" : "transparent")};
  color: white;
  background: ${({ $color }) => $color};
  cursor: pointer;
  &:focus-visible {
    outline: 2px solid var(--ink);
  }
`;

export function PersonModal({
  editingPerson,
  onClose,
  onSaved,
  onToast,
}: {
  editingPerson?: Person;
  onClose: () => void;
  onSaved: () => void;
  onToast: (message: string, error?: boolean) => void;
}) {
  const [saving, setSaving] = useState(false);
  const [name, setName] = useState(editingPerson?.name ?? "");
  const [email, setEmail] = useState(editingPerson?.email ?? "");
  const [color, setColor] = useState(
    editingPerson?.color ?? personColors[0].value,
  );
  const [isHousehold, setIsHousehold] = useState(
    editingPerson?.isHousehold ?? false,
  );
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    const response = await fetch("/api/people", {
      method: editingPerson ? "PATCH" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        id: editingPerson?.id,
        name,
        email,
        ...(editingPerson ? { color } : {}),
        isHousehold,
      }),
    });
    const payload = await response.json();
    setSaving(false);
    if (!response.ok) return onToast(payload.error, true);
    onToast(
      editingPerson
        ? `${payload.person.name} a été modifié`
        : `${payload.person.name} rejoint votre tablée`,
    );
    onSaved();
  }
  return (
    <Modal
      title={editingPerson ? "Modifier un joueur" : "Ajouter une personne"}
      subtitle="Un nouveau visage autour de la table."
      onClose={onClose}
      onSubmit={submit}
    >
      <ModalContent>
        <FormField>
          <span>Prénom ou nom *</span>
          <input
            autoFocus
            required
            value={name}
            onChange={(event) => setName(event.target.value)}
            placeholder="Ex. Camille"
          />
        </FormField>
        <FormField>
          <span>
            Email <small>facultatif</small>
          </span>
          <input
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder="camille@exemple.com"
          />
        </FormField>
        {editingPerson && (
          <ColorField>
            <legend>Couleur</legend>
            <ColorOptions>
              {personColors.map((option) => (
                <ColorOption
                  key={option.value}
                  type="button"
                  aria-label={option.name}
                  aria-pressed={color === option.value}
                  title={option.name}
                  $selected={color === option.value}
                  $color={option.value}
                  onClick={() => setColor(option.value)}
                >
                  {color === option.value && <Check size={14} />}
                </ColorOption>
              ))}
            </ColorOptions>
          </ColorField>
        )}
        <SwitchField>
          <input
            type="checkbox"
            checked={isHousehold}
            onChange={(event) => setIsHousehold(event.target.checked)}
          />
          <span>
            <Check size={13} />
          </span>
          <div>
            <b>Membre de la maison</b>
            <small>
              Cette personne peut posséder les jeux de votre collection.
            </small>
          </div>
        </SwitchField>
      </ModalContent>
      <ModalActions>
        <ActionButton $variant="ghost" type="button" onClick={onClose}>
          Annuler
        </ActionButton>
        <ActionButton disabled={saving}>
          {saving ? (
            <Spinner size={17} />
          ) : editingPerson ? (
            <Check size={17} />
          ) : (
            <UserPlus size={17} />
          )}{" "}
          {editingPerson ? "Enregistrer" : "Ajouter"}
        </ActionButton>
      </ModalActions>
    </Modal>
  );
}
