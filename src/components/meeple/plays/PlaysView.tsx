"use client";

import styled from "@emotion/styled";
import { Dices, MapPin, Pencil, Plus, Trophy } from "lucide-react";
import { AvatarStack, GameImage, GameLink } from "../shared/primitives";
import type { Play } from "../types";

const PlaysLayout = styled.div`
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(200px, 250px);
  gap: 18px;

  @media (max-width: 900px) {
    grid-template-columns: minmax(0, 1fr);
  }
`;
const PlayHistory = styled.div`
  padding: 22px 25px;
  border: 1px solid var(--line);
  border-radius: 13px;
  background: var(--paper);
  section + section {
    margin-top: 25px;
  }
`;
const MonthTitle = styled.h2`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin: 0 0 8px;
  color: var(--ink);
  font-family: var(--serif);
  font-size: 17px;
  font-weight: 500;
  text-transform: capitalize;
  span {
    color: var(--muted);
    font-family: inherit;
    font-size: 10px;
  }
`;
const PlayRow = styled.article`
  display: grid;
  grid-template-columns: 38px 50px minmax(0, 1fr) auto auto;
  align-items: center;
  gap: 13px;
  min-height: 82px;
  padding: 12px 0;
  border-top: 1px solid #eeece6;
  &:first-of-type {
    border-top: 0;
  }

  @media (max-width: 700px) {
    position: relative;
    grid-template-columns: 34px 42px minmax(0, 1fr);
    gap: 8px;
    align-items: start;

    & > :nth-child(1) {
      grid-column: 1;
      grid-row: 1 / span 2;
    }

    & > :nth-child(2) {
      grid-column: 2;
      grid-row: 1 / span 2;
    }

    & > :nth-child(3) {
      grid-column: 3;
      grid-row: 1;
    }

    & > :nth-child(4) {
      grid-column: 3;
      grid-row: 2;
    }

    & > :nth-child(5) {
      grid-column: 3;
      grid-row: 3;
    }

    & > :nth-child(6) {
      position: absolute;
      top: 10px;
      right: 0;
      grid-row: 1;
    }
  }
`;
const PlayDate = styled.button`
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 0;
  border: 0;
  color: var(--muted);
  background: transparent;
  cursor: pointer;
  &:hover strong {
    text-decoration: underline;
    text-underline-offset: 3px;
  }
  strong {
    color: var(--forest);
    font-family: var(--serif);
    font-size: 22px;
    font-weight: 500;
  }
  span {
    font-size: 9px;
    text-transform: capitalize;
  }
`;
const PlayMain = styled.div`
  min-width: 0;
  h3 {
    margin: 0 0 6px;
    font-family: var(--serif);
    font-size: 14px;
  }
  p {
    display: flex;
    align-items: center;
    gap: 5px;
    overflow: hidden;
    margin: 0;
    color: var(--muted);
    font-size: 10px;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
  p i {
    width: 3px;
    height: 3px;
    flex: 0 0 auto;
    border-radius: 50%;
    background: var(--muted);
  }
`;
const PlayWinner = styled.div`
  display: flex;
  align-items: center;
  gap: 5px;
  max-width: 150px;
  color: var(--forest);
  font-size: 10px;
`;
const Muted = styled.span`
  color: var(--muted);
`;
const PlayEdit = styled.button`
  display: grid;
  place-items: center;
  width: 30px;
  height: 30px;
  border: 0;
  border-radius: 8px;
  color: var(--muted);
  background: transparent;
  cursor: pointer;
  &:hover {
    color: var(--forest);
    background: var(--forest-soft);
  }
`;
const SideTip = styled.aside`
  position: relative;
  align-self: start;
  padding: 27px 20px 20px;
  border-radius: 13px;
  color: var(--ink);
  background: #e8eee8;
  & > span {
    position: absolute;
    top: -14px;
    right: 20px;
    display: grid;
    width: 38px;
    height: 38px;
    place-items: center;
    border-radius: 50%;
    color: var(--forest-dark);
    background: #dfcf9c;
  }
  h3 {
    margin: 0 0 8px;
    font-family: var(--serif);
    font-size: 17px;
    font-weight: 500;
  }
  p {
    margin: 0;
    color: var(--muted);
    font-size: 10px;
    line-height: 1.55;
  }
  button {
    width: 100%;
    margin-top: 18px;
  }
`;
const PrimaryButton = styled.button`
  min-height: 40px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 0 15px;
  border: 1px solid var(--forest);
  border-radius: 9px;
  color: white;
  background: var(--forest);
  font-size: 12px;
  font-weight: 700;
  cursor: pointer;
`;
const ReadOnlyNote = styled.p`
  margin: 14px 0 0;
  color: var(--muted);
  font-size: 12px;
  line-height: 1.5;
`;

export function PlaysView({
  plays,
  onAdd,
  onEdit,
  onOpenPlay,
  onOpenGame,
  canEdit,
}: {
  plays: Play[];
  onAdd: () => void;
  onEdit: (play: Play) => void;
  onOpenPlay: (playId: number) => void;
  onOpenGame: (gameId: number) => void;
  canEdit: boolean;
}) {
  const grouped = plays.reduce<Record<string, Play[]>>((result, play) => {
    const date = new Date(play.playedAt);
    const key = new Intl.DateTimeFormat("fr-FR", {
      month: "long",
      year: "numeric",
    }).format(date);
    result[key] = [...(result[key] ?? []), play];
    return result;
  }, {});
  return (
    <PlaysLayout>
      <PlayHistory>
        {Object.entries(grouped).map(([month, monthPlays]) => (
          <section key={month}>
            <MonthTitle>
              {month}
              <span>
                {monthPlays.length} partie{monthPlays.length > 1 ? "s" : ""}
              </span>
            </MonthTitle>
            {monthPlays.map((play) => {
              const winners = play.participants.filter((item) => item.isWinner);
              return (
                <PlayRow key={play.id}>
                  <PlayDate
                    type="button"
                    title="Afficher les détails de cette partie"
                    aria-label={`Afficher les détails de la partie du ${new Intl.DateTimeFormat("fr-FR", { dateStyle: "long" }).format(new Date(play.playedAt))}`}
                    onClick={() => onOpenPlay(play.id)}
                  >
                    <strong>{new Date(play.playedAt).getDate()}</strong>
                    <span>
                      {new Intl.DateTimeFormat("fr-FR", {
                        weekday: "short",
                      }).format(new Date(play.playedAt))}
                    </span>
                  </PlayDate>
                  <GameImage game={play.game} variant="activity" />
                  <PlayMain>
                    <h3>
                      <GameLink
                        game={play.game}
                        onOpen={() => onOpenGame(play.game.id)}
                      />
                    </h3>
                    <p>
                      <MapPin size={13} /> {play.location}
                      {play.notes ? (
                        <>
                          <i />
                          {play.notes}
                        </>
                      ) : null}
                    </p>
                  </PlayMain>
                  <AvatarStack
                    people={play.participants.map((item) => item.person)}
                  />
                  <PlayWinner>
                    {play.game.cooperative ? (
                      play.groupWon === true ? (
                        <>
                          <Trophy size={14} />
                          <span>Victoire du groupe</span>
                        </>
                      ) : play.groupWon === false ? (
                        <span>Défaite du groupe</span>
                      ) : null
                    ) : winners.length ? (
                      <>
                        <Trophy size={14} />
                        <span>
                          {winners.map((item) => item.person.name).join(" & ")}
                        </span>
                      </>
                    ) : (
                      <Muted>Résultat non noté</Muted>
                    )}
                  </PlayWinner>
                  {canEdit && (
                    <PlayEdit
                      type="button"
                      aria-label={`Modifier la partie de ${play.game.title}`}
                      onClick={() => onEdit(play)}
                    >
                      <Pencil size={15} />
                    </PlayEdit>
                  )}
                </PlayRow>
              );
            })}
          </section>
        ))}
      </PlayHistory>
      <SideTip>
        <span>
          <Dices size={24} />
        </span>
        <h3>Une partie de plus ?</h3>
        <p>
          La date, le lieu et les joueurs de votre dernière saisie sont gardés
          pour toute la soirée.
        </p>
        {canEdit ? (
          <PrimaryButton type="button" onClick={onAdd}>
            <Plus size={17} /> Ajouter une partie
          </PrimaryButton>
        ) : (
          <ReadOnlyNote>Connectez-vous pour ajouter une partie.</ReadOnlyNote>
        )}
      </SideTip>
    </PlaysLayout>
  );
}
