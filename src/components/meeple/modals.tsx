"use client";

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
import { Modal, ModalActions, ModalContent } from "./modal";
import { Avatar } from "./primitives";
import type { Game, Person, Play } from "./types";
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
    >
      <form className="modal-form" onSubmit={submit}>
        <ModalContent>
          <label className="field">
            <span>Mot de passe</span>
            <input autoFocus required name="password" type="password" />
          </label>
        </ModalContent>
        <ModalActions>
          <button type="button" className="ghost-button" onClick={onClose}>
            Annuler
          </button>
          <button className="primary-button" disabled={loading}>
            {loading ? (
              <Loader2 className="spin" size={17} />
            ) : (
              <LogIn size={17} />
            )}{" "}
            Se connecter
          </button>
        </ModalActions>
      </form>
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

  async function selectBggResult(bggId: string) {
    setLoadingBgg(true);
    const response = await fetch(`/api/bgg?url=${bggId}`);
    const payload = await response.json();
    setLoadingBgg(false);
    if (!response.ok) return onToast(payload.error, true);
    setForm((current) => ({
      ...current,
      title: payload.title || current.title,
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
      wide
    >
      <form className="modal-form" onSubmit={submit}>
        <ModalContent>
          <div className="bgg-helper">
            <div className="bgg-link-row">
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
              <button
                className="secondary-button"
                type="button"
                onClick={fetchBgg}
                disabled={loadingBgg}
              >
                {loadingBgg ? (
                  <Loader2 className="spin" size={16} />
                ) : (
                  <Sparkles size={16} />
                )}{" "}
                Récupérer
              </button>
            </div>
            <div className="bgg-search-helper">
              <div>
                <b>Ou rechercher par nom</b>
                <small>Utilise le nom saisi dans la fiche.</small>
              </div>
              <button
                className="secondary-button"
                type="button"
                onClick={searchBgg}
                disabled={searchingBgg}
              >
                {searchingBgg ? (
                  <Loader2 className="spin" size={16} />
                ) : (
                  <Search size={16} />
                )}{" "}
                {searchingBgg ? "Recherche…" : "Rechercher"}
              </button>
            </div>
            {bggResults.length > 0 && (
              <div className="bgg-results" aria-label="Résultats BoardGameGeek">
                {bggResults.map((result) => (
                  <button
                    type="button"
                    key={result.id}
                    onClick={() => selectBggResult(result.id)}
                    disabled={loadingBgg}
                  >
                    <span>{result.name}</span>
                    {result.year && <small>{result.year}</small>}
                  </button>
                ))}
              </div>
            )}
          </div>
          <div className="form-grid two">
            <label className="field span-2">
              <span>Nom du jeu *</span>
              <input
                required
                value={form.title}
                onChange={(event) => update("title", event.target.value)}
                placeholder="Ex. Harmonies"
              />
            </label>
            <div className="field span-2">
              <span>Image de couverture</span>
              <div className="cover-upload">
                <label className="cover-upload-button" htmlFor="game-cover">
                  <Upload size={16} /> Importer une couverture
                </label>
                <input
                  id="game-cover"
                  className="cover-upload-input"
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
              </div>
              {coverPreview && (
                <img
                  className="cover-upload-preview"
                  src={coverPreview}
                  alt="Prévisualisation de la couverture"
                />
              )}
            </div>
            <label className="field">
              <span>Année</span>
              <input
                type="number"
                value={form.year}
                onChange={(event) => update("year", event.target.value)}
                placeholder="2024"
              />
            </label>
            <label className="field">
              <span>Durée moyenne</span>
              <div className="input-suffix">
                <input
                  type="number"
                  value={form.playingTime}
                  onChange={(event) =>
                    update("playingTime", event.target.value)
                  }
                  placeholder="45"
                />
                <i>min</i>
              </div>
            </label>
            <label className="field">
              <span>Joueurs min.</span>
              <input
                type="number"
                min="1"
                value={form.minPlayers}
                onChange={(event) => update("minPlayers", event.target.value)}
              />
            </label>
            <label className="field">
              <span>Joueurs max.</span>
              <input
                type="number"
                min="1"
                value={form.maxPlayers}
                onChange={(event) => update("maxPlayers", event.target.value)}
              />
            </label>
            <label className="field span-2">
              <span>Catégories</span>
              <input
                value={form.categories}
                onChange={(event) => update("categories", event.target.value)}
                placeholder="Stratégie, Cartes, Famille…"
              />
            </label>
          </div>
          <fieldset className="choice-field">
            <legend>
              Propriétaires <small>Plusieurs choix possibles</small>
            </legend>
            <div className="person-choices owners">
              {people.map((person) => (
                <button
                  type="button"
                  className={
                    form.ownerIds.includes(person.id) ? "selected" : ""
                  }
                  key={person.id}
                  onClick={() => toggleOwner(person.id)}
                >
                  <Avatar person={person} small /> {person.name}
                  <Check size={14} />
                </button>
              ))}
            </div>
          </fieldset>
          <label className="switch-line">
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
          </label>
          <input type="hidden" name="bggId" value={form.bggId} />
        </ModalContent>
        <ModalActions>
          <button type="button" className="ghost-button" onClick={onClose}>
            Annuler
          </button>
          <button className="primary-button" disabled={saving}>
            {saving ? (
              <Loader2 className="spin" size={17} />
            ) : editingGame ? (
              <Check size={17} />
            ) : (
              <Plus size={17} />
            )}{" "}
            {editingGame
              ? "Enregistrer les modifications"
              : "Ajouter à la ludothèque"}
          </button>
        </ModalActions>
      </form>
    </Modal>
  );
}

function todayString() {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
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
    const playedAt = new Date(initialPlay.playedAt);
    return {
      date: `${playedAt.getFullYear()}-${String(playedAt.getMonth() + 1).padStart(2, "0")}-${String(playedAt.getDate()).padStart(2, "0")}`,
      time: `${String(playedAt.getHours()).padStart(2, "0")}:${String(playedAt.getMinutes()).padStart(2, "0")}`,
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
      wide
    >
      <form className="modal-form" onSubmit={(event) => submit(event, false)}>
        <ModalContent>
          <div className="form-grid two">
            <label className="field span-2">
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
            </label>
            <label className="field">
              <span>Date *</span>
              <input
                name="date"
                type="date"
                required
                defaultValue={defaults.date}
              />
            </label>
            <label className="field">
              <span>Heure</span>
              <input name="time" type="time" defaultValue={defaults.time} />
            </label>
            <label className="field span-2">
              <span>Lieu *</span>
              <div className="input-icon">
                <MapPin size={16} />
                <input
                  name="location"
                  required
                  defaultValue={defaults.location}
                  placeholder="À la maison, chez Marc…"
                />
              </div>
            </label>
          </div>
          <fieldset className="choice-field">
            <legend>Participants *</legend>
            <div className="person-choices">
              {people.map((person) => (
                <button
                  type="button"
                  className={participants.has(person.id) ? "selected" : ""}
                  key={person.id}
                  onClick={() =>
                    toggle(setParticipants, participants, person.id)
                  }
                >
                  <Avatar person={person} small /> {person.name}
                  <Check size={14} />
                </button>
              ))}
            </div>
          </fieldset>
          {selectedGame?.cooperative ? (
            <fieldset className="choice-field">
              <legend>Résultat du groupe</legend>
              <div className="result-choice">
                <button
                  type="button"
                  className={groupWon === true ? "selected win" : ""}
                  onClick={() => setGroupWon(true)}
                >
                  <Trophy size={17} /> Victoire
                </button>
                <button
                  type="button"
                  className={groupWon === false ? "selected lose" : ""}
                  onClick={() => setGroupWon(false)}
                >
                  <X size={17} /> Défaite
                </button>
              </div>
            </fieldset>
          ) : (
            <fieldset className="choice-field">
              <legend>
                Gagnant·e·s <small>Plusieurs choix possibles</small>
              </legend>
              <div className="person-choices winners">
                {people
                  .filter((person) => participants.has(person.id))
                  .map((person) => (
                    <button
                      type="button"
                      className={winners.has(person.id) ? "selected" : ""}
                      key={person.id}
                      onClick={() => toggle(setWinners, winners, person.id)}
                    >
                      <Trophy size={14} /> {person.name}
                      <Check size={14} />
                    </button>
                  ))}
              </div>
            </fieldset>
          )}
          <label className="field">
            <span>Notes de partie</span>
            <textarea
              name="notes"
              rows={3}
              defaultValue={initialPlay?.notes ?? ""}
              placeholder="Étape de la campagne, scénario, moments mémorables…"
            />
          </label>
        </ModalContent>
        <ModalActions split>
          <button type="button" className="ghost-button" onClick={onClose}>
            Annuler
          </button>
          <div>
            {!initialPlay && (
              <button
                type="submit"
                name="another"
                value="yes"
                className="secondary-button"
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
              </button>
            )}
            <button className="primary-button" disabled={saving}>
              {saving ? (
                <Loader2 className="spin" size={17} />
              ) : (
                <Check size={17} />
              )}{" "}
              {initialPlay ? "Enregistrer les modifications" : "Enregistrer"}
            </button>
          </div>
        </ModalActions>
      </form>
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
    >
      <form className="modal-form" onSubmit={submit}>
        <ModalContent>
          <label className="field">
            <span>Prénom ou nom *</span>
            <input
              autoFocus
              required
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder="Ex. Camille"
            />
          </label>
          <label className="field">
            <span>
              Email <small>facultatif</small>
            </span>
            <input
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="camille@exemple.com"
            />
          </label>
          <label className="switch-line">
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
          </label>
        </ModalContent>
        <ModalActions>
          <button type="button" className="ghost-button" onClick={onClose}>
            Annuler
          </button>
          <button className="primary-button" disabled={saving}>
            {saving ? (
              <Loader2 className="spin" size={17} />
            ) : editingPerson ? (
              <Check size={17} />
            ) : (
              <UserPlus size={17} />
            )}{" "}
            {editingPerson ? "Enregistrer" : "Ajouter"}
          </button>
        </ModalActions>
      </form>
    </Modal>
  );
}
