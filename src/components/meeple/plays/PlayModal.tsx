"use client";

import { Check, MapPin, Plus, Trophy, X } from "lucide-react";
import type { FormEvent } from "react";
import { useState } from "react";
import { ActionButton } from "../shared/action-button";
import { Modal, ModalActions, ModalContent } from "../shared/modal";
import {
  ChoiceButton,
  ChoiceField,
  ChoiceList,
  FormField,
  FormGrid,
  ResultButton,
  ResultChoice,
  Spinner,
} from "../shared/modal-form";
import type { Game, Person, Play } from "../types";
import { InputWithIcon } from "./play-modal-styles";

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
