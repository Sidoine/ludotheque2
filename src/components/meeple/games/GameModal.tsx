"use client";

import { Check, Link2, Plus, Search, Sparkles, Upload } from "lucide-react";
import type { FormEvent } from "react";
import { useEffect, useState } from "react";
import { ActionButton } from "../shared/action-button";
import { Modal, ModalActions, ModalContent } from "../shared/modal";
import {
  ChoiceButton,
  ChoiceField,
  ChoiceList,
  FormField,
  FormGrid,
  Spinner,
  SwitchField,
} from "../shared/modal-form";
import type { Game, Person } from "../types";
import {
  BggHelper,
  BggLinkRow,
  BggResult,
  BggResults,
  BggSearchHelper,
  CoverPreview,
  CoverUpload,
  CoverUploadButton,
  HiddenFileInput,
  InputWithSuffix,
} from "./game-modal-styles";

type GameFormState = {
  title: string;
  bggUrl: string;
  bggId: string;
  imageUrl: string;
  year: string;
  minPlayers: string;
  maxPlayers: string;
  playingTime: string;
  complexity: string;
  bggRating: string;
  categories: string;
  cooperative: boolean;
  ownerIds: number[];
};

const emptyGameForm: GameFormState = {
  title: "",
  bggUrl: "",
  bggId: "",
  imageUrl: "",
  year: "",
  minPlayers: "",
  maxPlayers: "",
  playingTime: "",
  complexity: "",
  bggRating: "",
  categories: "",
  cooperative: false,
  ownerIds: [],
};

export function GameModal({
  people,
  editingGame,
  onClose,
  onSaved,
  onToast,
}: {
  people: Person[];
  editingGame?: Game;
  onClose: () => void;
  onSaved: () => void;
  onToast: (message: string, error?: boolean) => void;
}) {
  const [form, setForm] = useState(emptyGameForm);
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [coverPreview, setCoverPreview] = useState("");
  const [loadingBgg, setLoadingBgg] = useState(false);
  const [searchingBgg, setSearchingBgg] = useState(false);
  const [bggResults, setBggResults] = useState<
    { id: string; name: string; year: number | null }[]
  >([]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!coverFile) {
      setCoverPreview(form.imageUrl);
      return;
    }
    const previewUrl = URL.createObjectURL(coverFile);
    setCoverPreview(previewUrl);
    return () => URL.revokeObjectURL(previewUrl);
  }, [coverFile, form.imageUrl]);

  useEffect(() => {
    if (!editingGame) return;
    setForm({
      title: editingGame.title,
      bggUrl: editingGame.bggUrl ?? "",
      bggId: editingGame.bggId ?? "",
      imageUrl: editingGame.imageUrl ?? "",
      year: editingGame.year?.toString() ?? "",
      minPlayers: editingGame.minPlayers?.toString() ?? "",
      maxPlayers: editingGame.maxPlayers?.toString() ?? "",
      playingTime: editingGame.playingTime?.toString() ?? "",
      complexity: editingGame.complexity?.toString() ?? "",
      bggRating: editingGame.bggRating?.toString() ?? "",
      categories: editingGame.categories.join(", "),
      cooperative: editingGame.cooperative,
      ownerIds: editingGame.ownerships.map((item) => item.personId),
    });
  }, [editingGame]);

  function update<K extends keyof GameFormState>(
    key: K,
    value: GameFormState[K],
  ) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  async function fetchBgg() {
    if (!form.bggUrl) return onToast("Collez d’abord une URL BGG", true);
    setLoadingBgg(true);
    const response = await fetch(
      `/api/bgg?url=${encodeURIComponent(form.bggUrl)}`,
    );
    const payload = await response.json();
    setLoadingBgg(false);
    if (!response.ok) return onToast(payload.error, true);
    setForm({
      title: payload.title || "",
      bggUrl: payload.bggUrl || form.bggUrl,
      bggId: payload.bggId || "",
      imageUrl: payload.imageUrl || "",
      year: payload.year?.toString() || "",
      minPlayers: payload.minPlayers?.toString() || "",
      maxPlayers: payload.maxPlayers?.toString() || "",
      playingTime: payload.playingTime?.toString() || "",
      complexity: payload.complexity?.toFixed(2) || "",
      bggRating: payload.bggRating?.toFixed(2) || "",
      categories: payload.categories?.join(", ") || "",
      cooperative: Boolean(payload.cooperative),
      ownerIds: form.ownerIds,
    });
    onToast("Informations récupérées depuis BGG");
  }

  async function searchBgg() {
    if (!form.title.trim())
      return onToast("Saisissez le nom d’un jeu à rechercher.", true);
    setSearchingBgg(true);
    const response = await fetch(
      `/api/bgg?query=${encodeURIComponent(form.title.trim())}`,
    );
    const payload = await response.json();
    setSearchingBgg(false);
    if (!response.ok) return onToast(payload.error, true);
    setBggResults(payload.results ?? []);
    if (!payload.results?.length)
      onToast("Aucun jeu trouvé sur BoardGameGeek.", true);
  }

  async function selectBggResult(bggId: string, name: string) {
    setLoadingBgg(true);
    const response = await fetch(`/api/bgg?url=${bggId}`);
    const payload = await response.json();
    setLoadingBgg(false);
    if (!response.ok) return onToast(payload.error, true);
    setForm((current) => ({
      ...current,
      title: name || payload.title || current.title,
      bggUrl: payload.bggUrl || "",
      bggId: payload.bggId || "",
      imageUrl: payload.imageUrl || "",
      year: payload.year?.toString() || "",
      minPlayers: payload.minPlayers?.toString() || "",
      maxPlayers: payload.maxPlayers?.toString() || "",
      playingTime: payload.playingTime?.toString() || "",
      complexity: payload.complexity?.toFixed(2) || "",
      bggRating: payload.bggRating?.toFixed(2) || "",
      categories: payload.categories?.join(", ") || "",
      cooperative: Boolean(payload.cooperative),
    }));
    setBggResults([]);
    onToast("Informations récupérées depuis BGG");
  }

  function toggleOwner(personId: number) {
    setForm((current) => ({
      ...current,
      ownerIds: current.ownerIds.includes(personId)
        ? current.ownerIds.filter((id) => id !== personId)
        : [...current.ownerIds, personId],
    }));
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    const values = Object.fromEntries(new FormData(event.currentTarget));
    let imageUrl = form.imageUrl;
    if (coverFile) {
      const uploadData = new FormData();
      uploadData.append("file", coverFile);
      const uploadResponse = await fetch("/api/uploads", {
        method: "POST",
        body: uploadData,
      });
      const uploadPayload = await uploadResponse.json();
      if (!uploadResponse.ok) {
        setSaving(false);
        return onToast(
          uploadPayload.error || "Impossible d’envoyer cette image.",
          true,
        );
      }
      imageUrl = uploadPayload.url;
    }
    const response = await fetch("/api/games", {
      method: editingGame ? "PATCH" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...values,
        ...form,
        imageUrl,
        id: editingGame?.id,
        cooperative: form.cooperative,
      }),
    });
    const payload = await response.json();
    setSaving(false);
    if (!response.ok) return onToast(payload.error, true);
    onToast(
      editingGame
        ? `${form.title} a été modifié`
        : `${form.title} rejoint la ludothèque`,
    );
    onSaved();
  }

  return (
    <Modal
      title={editingGame ? "Modifier le jeu" : "Ajouter un jeu"}
      subtitle="Complétez la fiche à la main ou laissez BGG vous aider."
      onClose={onClose}
      onSubmit={submit}
      wide
    >
      <ModalContent>
        <BggHelper>
          <BggLinkRow>
            <span>
              <Link2 size={19} />
            </span>
            <label>
              <b>Lien BoardGameGeek</b>
              <small>
                Les informations peuvent être préremplies automatiquement.
              </small>
              <input
                value={form.bggUrl}
                onChange={(event) => update("bggUrl", event.target.value)}
                placeholder="https://boardgamegeek.com/boardgame/…"
              />
            </label>
            <ActionButton
              $variant="secondary"
              type="button"
              onClick={fetchBgg}
              disabled={loadingBgg}
            >
              {loadingBgg ? <Spinner size={16} /> : <Sparkles size={16} />}{" "}
              Récupérer
            </ActionButton>
          </BggLinkRow>
          <BggSearchHelper>
            <div>
              <b>Ou rechercher par nom</b>
              <small>Utilise le nom saisi dans la fiche.</small>
            </div>
            <ActionButton
              $variant="secondary"
              type="button"
              onClick={searchBgg}
              disabled={searchingBgg}
            >
              {searchingBgg ? <Spinner size={16} /> : <Search size={16} />}{" "}
              {searchingBgg ? "Recherche…" : "Rechercher"}
            </ActionButton>
          </BggSearchHelper>
          {bggResults.length > 0 && (
            <BggResults aria-label="Résultats BoardGameGeek">
              {bggResults.map((result) => (
                <BggResult
                  type="button"
                  key={result.id}
                  onClick={() => selectBggResult(result.id, result.name)}
                  disabled={loadingBgg}
                >
                  <span>{result.name}</span>
                  {result.year && <small>{result.year}</small>}
                </BggResult>
              ))}
            </BggResults>
          )}
        </BggHelper>
        <FormGrid>
          <FormField $wide>
            <span>Nom du jeu *</span>
            <input
              required
              value={form.title}
              onChange={(event) => update("title", event.target.value)}
              placeholder="Ex. Harmonies"
            />
          </FormField>
          <FormField as="div" $wide>
            <span>Image de couverture</span>
            <CoverUpload>
              <CoverUploadButton htmlFor="game-cover">
                <Upload size={16} /> Importer une couverture
              </CoverUploadButton>
              <HiddenFileInput
                id="game-cover"
                type="file"
                accept="image/jpeg,image/png,image/webp,image/gif"
                onChange={(event) =>
                  setCoverFile(event.target.files?.[0] ?? null)
                }
              />
              {coverFile ? (
                <small>{coverFile.name}</small>
              ) : (
                <small>JPG, PNG, WEBP ou GIF · 5 Mo maximum</small>
              )}
            </CoverUpload>
            {coverPreview && (
              <CoverPreview
                src={coverPreview}
                alt="Prévisualisation de la couverture"
              />
            )}
          </FormField>
          <FormField>
            <span>Année</span>
            <input
              type="number"
              value={form.year}
              onChange={(event) => update("year", event.target.value)}
              placeholder="2024"
            />
          </FormField>
          <FormField>
            <span>Durée moyenne</span>
            <InputWithSuffix>
              <input
                type="number"
                value={form.playingTime}
                onChange={(event) => update("playingTime", event.target.value)}
                placeholder="45"
              />
              <i>min</i>
            </InputWithSuffix>
          </FormField>
          <FormField>
            <span>Joueurs min.</span>
            <input
              type="number"
              min="1"
              value={form.minPlayers}
              onChange={(event) => update("minPlayers", event.target.value)}
            />
          </FormField>
          <FormField>
            <span>Joueurs max.</span>
            <input
              type="number"
              min="1"
              value={form.maxPlayers}
              onChange={(event) => update("maxPlayers", event.target.value)}
            />
          </FormField>
          <FormField $wide>
            <span>Catégories</span>
            <input
              value={form.categories}
              onChange={(event) => update("categories", event.target.value)}
              placeholder="Stratégie, Cartes, Famille…"
            />
          </FormField>
        </FormGrid>
        <ChoiceField>
          <legend>
            Propriétaires <small>Plusieurs choix possibles</small>
          </legend>
          <ChoiceList>
            {people.map((person) => (
              <ChoiceButton
                type="button"
                $selected={form.ownerIds.includes(person.id)}
                key={person.id}
                onClick={() => toggleOwner(person.id)}
              >
                {person.name}
                <Check size={14} />
              </ChoiceButton>
            ))}
          </ChoiceList>
        </ChoiceField>
        <SwitchField>
          <input
            type="checkbox"
            checked={form.cooperative}
            onChange={(event) => update("cooperative", event.target.checked)}
          />
          <span>
            <Check size={13} />
          </span>
          <div>
            <b>Jeu coopératif</b>
            <small>Le résultat sera enregistré pour tout le groupe.</small>
          </div>
        </SwitchField>
        <input type="hidden" name="bggId" value={form.bggId} />
      </ModalContent>
      <ModalActions>
        <ActionButton $variant="ghost" type="button" onClick={onClose}>
          Annuler
        </ActionButton>
        <ActionButton disabled={saving}>
          {saving ? (
            <Spinner size={17} />
          ) : editingGame ? (
            <Check size={17} />
          ) : (
            <Plus size={17} />
          )}{" "}
          {editingGame
            ? "Enregistrer les modifications"
            : "Ajouter à la ludothèque"}
        </ActionButton>
      </ModalActions>
    </Modal>
  );
}
