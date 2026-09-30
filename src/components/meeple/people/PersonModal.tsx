"use client";

import { Check, UserPlus } from "lucide-react";
import type { FormEvent } from "react";
import { useState } from "react";
import { ActionButton } from "../shared/action-button";
import { Modal, ModalActions, ModalContent } from "../shared/modal";
import { FormField, Spinner, SwitchField } from "../shared/modal-form";
import type { Person } from "../types";
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
  const [isHousehold, setIsHousehold] = useState(
    editingPerson?.isHousehold ?? false,
  );
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    const response = await fetch("/api/people", {
      method: editingPerson ? "PATCH" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: editingPerson?.id, name, email, isHousehold }),
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
