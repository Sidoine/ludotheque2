"use client";

import { LogIn } from "lucide-react";
import type { FormEvent } from "react";
import { useState } from "react";
import { ActionButton } from "./action-button";
import { Modal, ModalActions, ModalContent } from "./modal";
import { FormField, Spinner } from "./modal-form";
export function LoginModal({
  onClose,
  onAuthenticated,
  onToast,
}: {
  onClose: () => void;
  onAuthenticated: (name: string) => void;
  onToast: (message: string, error?: boolean) => void;
}) {
  const [loading, setLoading] = useState(false);
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    const password = new FormData(event.currentTarget).get("password");
    const response = await fetch("/api/auth", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password }),
    });
    const payload = await response.json();
    setLoading(false);
    if (!response.ok)
      return onToast(payload.error || "Connexion impossible.", true);
    onAuthenticated(payload.name);
    onClose();
  }

  return (
    <Modal
      title="Connexion administrateur"
      subtitle="Les visiteurs peuvent consulter la ludothèque en lecture seule."
      onClose={onClose}
      onSubmit={submit}
    >
      <ModalContent>
        <FormField>
          <span>Mot de passe</span>
          <input autoFocus required name="password" type="password" />
        </FormField>
      </ModalContent>
      <ModalActions>
        <ActionButton $variant="ghost" type="button" onClick={onClose}>
          Annuler
        </ActionButton>
        <ActionButton disabled={loading}>
          {loading ? <Spinner size={17} /> : <LogIn size={17} />} Se connecter
        </ActionButton>
      </ModalActions>
    </Modal>
  );
}
