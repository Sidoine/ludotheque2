"use client";

import styled from "@emotion/styled";
import {
  Check,
  Link2,
  Loader2,
  LogIn,
  MapPin,
  Plus,
  Search,
  Sparkles,
  Trophy,
  Upload,
  UserPlus,
  X,
} from "lucide-react";
import type { FormEvent } from "react";
import { useEffect, useState } from "react";
import { getParisDateTime } from "@/lib/date-time";
import type { Game, Person, Play } from "../types";
import { ActionButton } from "./action-button";
import { Modal, ModalActions, ModalContent } from "./modal";

const FormGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 13px;
`;
export const FormField = styled.label<{
  $wide?: boolean;
}>`
  grid-column: ${({ $wide }) => ($wide ? "span 2" : "auto")};
  display: flex;
  flex-direction: column;
  gap: 6px;
  & > span,
  legend {
    color: #56635c;
    font-size: 9px;
    font-weight: 750;
  }
  & > span small {
    color: #a0a5a2;
    font-weight: 400;
  }
  input,
  select,
  textarea {
    width: 100%;
    min-height: 40px;
    padding: 0 11px;
    border: 1px solid #dcdad2;
    border-radius: 8px;
    outline: 0;
    color: var(--ink);
    background: white;
    font-size: 11px;
    transition:
      border 0.15s,
      box-shadow 0.15s;
    &:focus {
      border-color: #91aa9c;
      box-shadow: 0 0 0 3px rgba(49, 95, 77, 0.07);
    }
  }
  textarea {
    resize: vertical;
    padding-top: 10px;
    line-height: 1.4;
  }
  @media (max-width: 700px) {
    grid-column: auto;
  }
`;
export const Spinner = styled(Loader2)`
  animation: modal-spin 0.9s linear infinite;
  @keyframes modal-spin {
    to {
      transform: rotate(360deg);
    }
  }
`;
const BggHelper = styled.div`
  display: flex;
  flex-direction: column;
  gap: 10px;
  padding: 13px;
  border-radius: 11px;
  background: #edf2ee;
  b {
    font-size: 10px;
  }
  small {
    margin: 2px 0 6px;
    color: var(--muted);
    font-size: 8px;
  }
`;
const BggLinkRow = styled.div`
  display: grid;
  grid-template-columns: 35px minmax(0, 1fr) auto;
  align-items: end;
  gap: 10px;
  & > span {
    width: 35px;
    height: 35px;
    display: grid;
    place-items: center;
    align-self: center;
    border-radius: 9px;
    color: var(--forest);
    background: white;
  }
  label {
    min-width: 0;
    display: flex;
    flex-direction: column;
  }
  input {
    min-width: 0;
    height: 35px;
    padding: 0 10px;
    border: 1px solid #d5ddd7;
    border-radius: 7px;
    outline: 0;
    background: white;
    font-size: 9px;
  }
  @media (max-width: 700px) {
    grid-template-columns: 32px 1fr;
    & > button {
      grid-column: 1 / -1;
    }
  }
`;
const BggSearchHelper = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 0 13px;
  & > div {
    display: flex;
    flex-direction: column;
    gap: 2px;
  }
  small {
    color: var(--muted);
    font-size: 8px;
  }
`;
const BggResults = styled.div`
  display: grid;
  grid-template-columns: minmax(0, 1fr);
  gap: 5px;
  width: 100%;
  max-height: 190px;
  overflow-y: auto;
  padding: 0 13px;
`;
const BggResult = styled.button`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 8px 10px;
  border: 1px solid var(--line);
  border-radius: 7px;
  color: var(--ink);
  background: white;
  text-align: left;
  cursor: pointer;
  &:hover {
    border-color: var(--forest);
    background: var(--forest-soft);
  }
  span {
    min-width: 0;
    overflow: hidden;
    font-size: 10px;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
  small {
    flex: 0 0 auto;
    color: var(--muted);
    font-size: 9px;
  }
`;
const CoverUpload = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;
  small {
    color: var(--muted);
    font-size: 11px;
  }
`;
const CoverUploadButton = styled.label`
  min-height: 40px;
  display: inline-flex;
  align-items: center;
  gap: 7px;
  padding: 0 12px;
  border: 1px solid #dcdad2;
  border-radius: 8px;
  color: var(--forest);
  background: #eef3ed;
  font-size: 12px;
  font-weight: 700;
  cursor: pointer;
  &:hover {
    border-color: var(--forest);
    background: #e3eee5;
  }
`;
const HiddenFileInput = styled.input`
  position: absolute;
  width: 1px;
  height: 1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
`;
const CoverPreview = styled.img`
  display: block;
  width: 78px;
  height: 96px;
  margin-top: 10px;
  border: 1px solid var(--line);
  border-radius: 6px;
  object-fit: cover;
  box-shadow: 0 4px 12px rgba(24, 39, 30, 0.12);
`;
const InputWithSuffix = styled.div`
  position: relative;
  i {
    position: absolute;
    top: 12px;
    right: 10px;
    color: var(--muted);
    font-size: 9px;
    font-style: normal;
  }
  input {
    padding-right: 36px;
  }
`;
const InputWithIcon = styled.div`
  position: relative;
  svg {
    position: absolute;
    top: 12px;
    left: 11px;
    color: #89938e;
  }
  input {
    padding-left: 34px;
  }
`;
const ChoiceField = styled.fieldset`
  min-width: 0;
  margin: 0;
  padding: 0;
  border: 0;
  legend {
    margin-bottom: 7px;
    color: #56635c;
    font-size: 9px;
    font-weight: 750;
    small {
      margin-left: 5px;
      color: #a0a5a2;
      font-weight: 400;
    }
  }
`;
const ChoiceList = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
`;
const ChoiceButton = styled.button<{
  $selected: boolean;
  $winner?: boolean;
}>`
  min-height: 36px;
  display: flex;
  align-items: center;
  gap: 5px;
  padding: 4px ${({ $winner }) => ($winner ? "10px" : "9px 9px 4px 5px")};
  border: 1px solid
    ${({ $selected }) => ($selected ? "#9fb8aa" : "var(--line)")};
  border-radius: 20px;
  color: ${({ $selected }) => ($selected ? "var(--forest)" : "inherit")};
  background: ${({ $selected }) =>
    $selected ? "var(--forest-soft)" : "white"};
  font-size: 9px;
  font-weight: ${({ $selected }) => ($selected ? 700 : 400)};
  cursor: pointer;
  & > svg:last-child {
    display: ${({ $selected }) => ($selected ? "block" : "none")};
  }
`;
const ResultChoice = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 9px;
`;
const ResultButton = styled.button<{
  $selected: boolean;
  $won: boolean;
}>`
  min-height: 42px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 7px;
  border: 1px solid
    ${({ $selected, $won }) =>
      $selected ? ($won ? "#90ad9d" : "#d7aa9e") : "var(--line)"};
  border-radius: 9px;
  color: ${({ $selected, $won }) =>
    $selected ? ($won ? "var(--forest)" : "#a35341") : "inherit"};
  background: ${({ $selected, $won }) =>
    $selected ? ($won ? "var(--forest-soft)" : "#f6e7e2") : "white"};
  font-size: 10px;
  cursor: pointer;
`;
export const SwitchField = styled.label`
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 12px;
  border: 1px solid var(--line);
  border-radius: 10px;
  cursor: pointer;
  & > input {
    position: absolute;
    opacity: 0;
    pointer-events: none;
  }
  & > span {
    width: 31px;
    height: 18px;
    display: flex;
    align-items: center;
    padding: 2px;
    border-radius: 10px;
    color: white;
    background: #c8cbc8;
    transition: 0.15s;
  }
  & > span svg {
    width: 14px;
    height: 14px;
    padding: 2px;
    border-radius: 50%;
    color: transparent;
    background: white;
    transition: 0.15s;
  }
  & > input:checked + span {
    justify-content: flex-end;
    background: var(--forest);
  }
  & > input:checked + span svg {
    color: var(--forest);
  }
  div {
    display: flex;
    flex-direction: column;
  }
  b {
    font-size: 10px;
  }
  small {
    margin-top: 2px;
    color: var(--muted);
    font-size: 8px;
  }
`;
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

function todayString() {
  return getParisDateTime().date;
}

type EveningDefaults = {
  date: string;
  time: string;
  location: string;
  participantIds: number[];
};

function loadEveningDefaults(): EveningDefaults {
  const fallback = {
    date: todayString(),
    time: "20:00",
    location: "À la maison",
    participantIds: [],
  };
  if (typeof window === "undefined") return fallback;
  try {
    return {
      ...fallback,
      ...JSON.parse(localStorage.getItem("meeple-evening") || "{}"),
    };
  } catch {
    return fallback;
  }
}

export function PlayModal({
  games,
  people,
  initialGame,
  initialPlay,
  onClose,
  onSaved,
  onToast,
}: {
  games: Game[];
  people: Person[];
  initialGame?: Game;
  initialPlay?: Play;
  onClose: () => void;
  onSaved: () => void;
  onToast: (message: string, error?: boolean) => void;
}) {
  const [defaults, setDefaults] = useState<EveningDefaults>(() => {
    if (!initialPlay) return loadEveningDefaults();
    const playedAt = getParisDateTime(new Date(initialPlay.playedAt));
    return {
      date: playedAt.date,
      time: playedAt.time,
      location: initialPlay.location,
      participantIds: initialPlay.participants.map((item) => item.person.id),
    };
  });
  const [gameId, setGameId] = useState(
    initialPlay?.gameId ?? initialGame?.id ?? games[0]?.id ?? 0,
  );
  const [participants, setParticipants] = useState<Set<number>>(
    () =>
      new Set(
        initialPlay?.participants.map((item) => item.person.id) ??
          loadEveningDefaults().participantIds,
      ),
  );
  const [winners, setWinners] = useState<Set<number>>(
    () =>
      new Set(
        initialPlay?.participants
          .filter((item) => item.isWinner)
          .map((item) => item.person.id) ?? [],
      ),
  );
  const [groupWon, setGroupWon] = useState<boolean | null>(
    initialPlay?.groupWon ?? null,
  );
  const [saving, setSaving] = useState(false);
  const selectedGame = games.find((game) => game.id === gameId);

  function toggle(
    setter: (value: Set<number>) => void,
    current: Set<number>,
    id: number,
  ) {
    const next = new Set(current);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setter(next);
  }

  async function submit(event: FormEvent<HTMLFormElement>, addAnother = false) {
    event.preventDefault();
    if (!participants.size)
      return onToast("Choisissez au moins un participant", true);
    setSaving(true);
    const values = Object.fromEntries(new FormData(event.currentTarget));
    const evening = {
      date: String(values.date),
      time: String(values.time),
      location: String(values.location),
      participantIds: [...participants],
    };
    const response = await fetch("/api/plays", {
      method: initialPlay ? "PATCH" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...values,
        id: initialPlay?.id,
        gameId,
        participantIds: [...participants],
        winnerIds: [...winners],
        groupWon,
      }),
    });
    const payload = await response.json();
    setSaving(false);
    if (!response.ok) return onToast(payload.error, true);
    localStorage.setItem("meeple-evening", JSON.stringify(evening));
    onToast(
      initialPlay ? "Partie modifiée" : "Partie enregistrée — à la prochaine !",
    );
    if (addAnother) {
      setDefaults(evening);
      setWinners(new Set());
      setGroupWon(null);
      setGameId(games[0]?.id ?? 0);
      onSaved();
    } else onSaved();
  }

  return (
    <Modal
      title={initialPlay ? "Modifier la partie" : "Ajouter une partie"}
      subtitle={
        initialPlay
          ? "Mettez à jour les détails de cette soirée."
          : "Les détails de la soirée seront conservés pour la saisie suivante."
      }
      onClose={onClose}
      onSubmit={(event) => submit(event, false)}
      wide
    >
      <ModalContent>
        <FormGrid>
          <FormField $wide>
            <span>Jeu *</span>
            <select
              value={gameId}
              onChange={(event) => {
                setGameId(Number(event.target.value));
                setWinners(new Set());
                setGroupWon(null);
              }}
            >
              {games.map((game) => (
                <option key={game.id} value={game.id}>
                  {game.title}
                </option>
              ))}
            </select>
          </FormField>
          <FormField>
            <span>Date *</span>
            <input
              name="date"
              type="date"
              required
              defaultValue={defaults.date}
            />
          </FormField>
          <FormField>
            <span>Heure</span>
            <input name="time" type="time" defaultValue={defaults.time} />
          </FormField>
          <FormField $wide>
            <span>Lieu *</span>
            <InputWithIcon>
              <MapPin size={16} />
              <input
                name="location"
                required
                defaultValue={defaults.location}
                placeholder="À la maison, chez Marc…"
              />
            </InputWithIcon>
          </FormField>
        </FormGrid>
        <ChoiceField>
          <legend>Participants *</legend>
          <ChoiceList>
            {people.map((person) => (
              <ChoiceButton
                type="button"
                $selected={participants.has(person.id)}
                key={person.id}
                onClick={() => toggle(setParticipants, participants, person.id)}
              >
                {person.name}
                <Check size={14} />
              </ChoiceButton>
            ))}
          </ChoiceList>
        </ChoiceField>
        {selectedGame?.cooperative ? (
          <ChoiceField>
            <legend>Résultat du groupe</legend>
            <ResultChoice>
              <ResultButton
                type="button"
                $selected={groupWon === true}
                $won
                onClick={() => setGroupWon(true)}
              >
                <Trophy size={17} /> Victoire
              </ResultButton>
              <ResultButton
                type="button"
                $selected={groupWon === false}
                $won={false}
                onClick={() => setGroupWon(false)}
              >
                <X size={17} /> Défaite
              </ResultButton>
            </ResultChoice>
          </ChoiceField>
        ) : (
          <ChoiceField>
            <legend>
              Gagnant·e·s <small>Plusieurs choix possibles</small>
            </legend>
            <ChoiceList>
              {people
                .filter((person) => participants.has(person.id))
                .map((person) => (
                  <ChoiceButton
                    type="button"
                    $selected={winners.has(person.id)}
                    $winner
                    key={person.id}
                    onClick={() => toggle(setWinners, winners, person.id)}
                  >
                    <Trophy size={14} /> {person.name}
                    <Check size={14} />
                  </ChoiceButton>
                ))}
            </ChoiceList>
          </ChoiceField>
        )}
        <FormField as="label">
          <span>Notes de partie</span>
          <textarea
            name="notes"
            rows={3}
            defaultValue={initialPlay?.notes ?? ""}
            placeholder="Étape de la campagne, scénario, moments mémorables…"
          />
        </FormField>
      </ModalContent>
      <ModalActions split>
        <ActionButton $variant="ghost" type="button" onClick={onClose}>
          Annuler
        </ActionButton>
        <div>
          {!initialPlay && (
            <ActionButton
              $variant="secondary"
              type="submit"
              name="another"
              value="yes"
              disabled={saving}
              onClick={(event) => {
                event.preventDefault();
                const form = event.currentTarget.closest("form");
                if (form?.reportValidity())
                  void submit(
                    {
                      preventDefault: () => undefined,
                      currentTarget: form,
                    } as FormEvent<HTMLFormElement>,
                    true,
                  );
              }}
            >
              <Plus size={16} /> Enregistrer & continuer
            </ActionButton>
          )}
          <ActionButton disabled={saving}>
            {saving ? <Spinner size={17} /> : <Check size={17} />}{" "}
            {initialPlay ? "Enregistrer les modifications" : "Enregistrer"}
          </ActionButton>
        </div>
      </ModalActions>
    </Modal>
  );
}

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
