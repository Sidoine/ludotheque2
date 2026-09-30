"use client";

import styled from "@emotion/styled";
import {
  ArrowRight,
  CalendarDays,
  Clock3,
  MapPin,
  Pencil,
  Trophy,
} from "lucide-react";
import { PARIS_TIME_ZONE } from "@/lib/date-time";
import { Avatar, GameImage, GameLink } from "../shared/primitives";
import { Empty, Eyebrow, SecondaryButton } from "../shared/ui";
import type { Play } from "../types";

const PlayDetailsPanel = styled.div`
  padding: 25px;
  border: 1px solid var(--line);
  border-radius: 13px;
  background: var(--paper);
`;
const PlayDetailsToolbar = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 24px;
`;
const PlayDetailsBack = styled.button`
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 6px 0;
  border: 0;
  color: var(--muted);
  background: transparent;
  font-size: 11px;
  font-weight: 700;
  cursor: pointer;
  &:hover {
    color: var(--forest);
  }
  svg {
    transform: rotate(180deg);
  }
`;
const PlayDetailsHero = styled.div`
  display: grid;
  grid-template-columns: 145px minmax(0, 1fr);
  align-items: center;
  gap: 24px;
  padding-bottom: 24px;
  border-bottom: 1px solid var(--line);
  h2 {
    margin: 5px 0 8px;
    font-family: var(--serif);
    font-size: 27px;
    font-weight: 500;
  }
  @media (max-width: 700px) {
    grid-template-columns: 88px minmax(0, 1fr);
    gap: 14px;
    h2 {
      font-size: 20px;
    }
  }
`;
const PlayDetailsBody = styled.div`
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 18px;
  margin-top: 22px;
  @media (max-width: 800px) {
    grid-template-columns: minmax(0, 1fr);
  }
`;
const PlayDetailsSection = styled.section`
  min-width: 0;
  padding: 19px;
  border: 1px solid var(--line);
  border-radius: 11px;
  background: #fffefa;
  h3 {
    margin: 0 0 15px;
    font-family: var(--serif);
    font-size: 16px;
    font-weight: 500;
  }
`;
const PlayFacts = styled.div`
  display: grid;
  gap: 14px;
`;
const PlayFact = styled.div`
  display: flex;
  align-items: flex-start;
  gap: 10px;
  color: var(--forest);
  & > span {
    display: flex;
    min-width: 0;
    flex-direction: column;
    gap: 3px;
  }
  small {
    color: var(--muted);
    font-size: 9px;
  }
  strong {
    color: var(--ink);
    font-size: 11px;
    font-weight: 600;
    overflow-wrap: anywhere;
  }
`;
const PlayParticipants = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
`;
const PlayParticipant = styled.button`
  min-height: 38px;
  display: inline-flex;
  align-items: center;
  gap: 7px;
  padding: 4px 9px 4px 5px;
  border: 1px solid var(--line);
  border-radius: 20px;
  color: var(--ink);
  background: white;
  font-size: 10px;
  cursor: pointer;
  &:hover {
    border-color: #b8c9be;
    background: var(--forest-soft);
  }
  svg {
    color: var(--gold);
  }
`;
const PlayOutcome = styled.div<{ $lost: boolean }>`
  display: flex;
  align-items: center;
  gap: 7px;
  margin-top: 18px;
  padding: 11px 12px;
  border-radius: 8px;
  color: ${({ $lost }) => ($lost ? "#a35341" : "var(--forest)")};
  background: ${({ $lost }) => ($lost ? "#f5e2db" : "var(--forest-soft)")};
  font-size: 11px;
  font-weight: 700;
`;
const PlayNotes = styled.div`
  margin-top: 18px;
  padding-top: 14px;
  border-top: 1px solid var(--line);
  h4 {
    margin: 0 0 6px;
    color: var(--muted);
    font-size: 9px;
    font-weight: 750;
    text-transform: uppercase;
  }
  p {
    margin: 0;
    color: var(--ink);
    font-size: 11px;
    line-height: 1.6;
    white-space: pre-wrap;
    overflow-wrap: anywhere;
  }
`;

export function PlayDetailsPage({
  play,
  canEdit,
  onBack,
  onEdit,
  onOpenGame,
  onOpenPerson,
}: {
  play: Play;
  canEdit: boolean;
  onBack: () => void;
  onEdit: (play: Play) => void;
  onOpenGame: (gameId: number) => void;
  onOpenPerson: (personId: number) => void;
}) {
  const winners = play.participants.filter(
    (participant) => participant.isWinner,
  );
  const result = play.game.cooperative
    ? play.groupWon === null
      ? "Résultat non noté"
      : play.groupWon
        ? "Victoire du groupe"
        : "Défaite du groupe"
    : winners.length
      ? `${winners.length > 1 ? "Vainqueurs" : "Vainqueur"} : ${winners.map((winner) => winner.person.name).join(", ")}`
      : "Aucun vainqueur renseigné";
  const playedAt = new Intl.DateTimeFormat("fr-FR", {
    dateStyle: "full",
    timeStyle: "short",
    timeZone: PARIS_TIME_ZONE,
  }).format(new Date(play.playedAt));

  return (
    <PlayDetailsPanel>
      <PlayDetailsToolbar>
        <PlayDetailsBack type="button" onClick={onBack}>
          <ArrowRight size={16} /> Mes parties
        </PlayDetailsBack>
        {canEdit && (
          <SecondaryButton type="button" onClick={() => onEdit(play)}>
            <Pencil size={16} /> Modifier
          </SecondaryButton>
        )}
      </PlayDetailsToolbar>
      <PlayDetailsHero>
        <GameImage game={play.game} variant="detail" />
        <div>
          <Eyebrow>Détail de la partie</Eyebrow>
          <h2>
            <GameLink
              game={play.game}
              onOpen={() => onOpenGame(play.game.id)}
            />
          </h2>
          <PlayFact>
            <MapPin size={15} />
            <span>
              <small>Lieu</small>
              <strong>{play.location}</strong>
            </span>
          </PlayFact>
        </div>
      </PlayDetailsHero>
      <PlayDetailsBody>
        <PlayDetailsSection>
          <Eyebrow>Informations</Eyebrow>
          <h3>La soirée</h3>
          <PlayFacts>
            <PlayFact>
              <CalendarDays size={16} />
              <span>
                <small>Date et heure</small>
                <strong>{playedAt}</strong>
              </span>
            </PlayFact>
            {play.duration !== null && (
              <PlayFact>
                <Clock3 size={16} />
                <span>
                  <small>Durée</small>
                  <strong>{play.duration} min</strong>
                </span>
              </PlayFact>
            )}
          </PlayFacts>
          {play.notes && (
            <PlayNotes>
              <h4>Notes</h4>
              <p>{play.notes}</p>
            </PlayNotes>
          )}
        </PlayDetailsSection>
        <PlayDetailsSection>
          <Eyebrow>À la table</Eyebrow>
          <h3>Participants ({play.participants.length})</h3>
          {play.participants.length ? (
            <PlayParticipants>
              {play.participants.map((participant) => (
                <PlayParticipant
                  key={participant.id}
                  type="button"
                  aria-label={`Voir la fiche de ${participant.person.name}`}
                  onClick={() => onOpenPerson(participant.person.id)}
                >
                  <Avatar person={participant.person} small />
                  {participant.person.name}
                  {participant.isWinner && (
                    <Trophy size={13} aria-label="Vainqueur" />
                  )}
                </PlayParticipant>
              ))}
            </PlayParticipants>
          ) : (
            <Empty>Aucun participant enregistré.</Empty>
          )}
          <PlayOutcome $lost={play.game.cooperative && play.groupWon === false}>
            <Trophy size={15} /> {result}
          </PlayOutcome>
        </PlayDetailsSection>
      </PlayDetailsBody>
    </PlayDetailsPanel>
  );
}
