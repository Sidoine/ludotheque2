"use client";

import styled from "@emotion/styled";
import { Pencil, UserPlus } from "lucide-react";
import { Avatar, relativeDate } from "../shared/primitives";
import { Eyebrow, SecondaryButton } from "../shared/ui";
import type { Person, Play } from "../types";

const ContentPanel = styled.div`
  padding: 25px;
  border: 1px solid var(--line);
  border-radius: 13px;
  background: var(--paper);
`;
const PeopleIntro = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 18px;
  margin-bottom: 24px;
  h2 {
    margin: 0;
    font-family: var(--serif);
    font-size: 21px;
    font-weight: 500;
  }

  @media (max-width: 700px) {
    align-items: stretch;
    flex-direction: column;

    h2 {
      font-size: 18px;
    }
  }
`;
const PeopleGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 14px;

  @media (max-width: 1050px) {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  @media (max-width: 600px) {
    grid-template-columns: 1fr;
  }
`;
const PersonCard = styled.article`
  position: relative;
  display: grid;
  grid-template-columns: auto 1fr auto;
  align-items: center;
  gap: 11px;
  padding: 16px;
  border: 1px solid var(--line);
  border-radius: 12px;
  background: #fffefa;
  cursor: pointer;
  &:hover {
    border-color: #b8c9be;
    box-shadow: var(--shadow);
  }
  h3 {
    margin: 0 0 4px;
    font-family: var(--serif);
    font-size: 14px;
  }
  h3 span {
    margin-left: 5px;
    color: var(--forest);
    font-family: inherit;
    font-size: 8px;
  }
  p {
    margin: 0;
    color: var(--muted);
    font-size: 10px;
  }
  dl {
    grid-column: 1 / -1;
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    margin: 10px 0 0;
    padding-top: 10px;
    border-top: 1px solid var(--line);
  }
  dl div {
    display: flex;
    flex-direction: column;
    gap: 3px;
  }
  dt {
    color: var(--muted);
    font-size: 8px;
  }
  dd {
    margin: 0;
    color: var(--ink);
    font-size: 11px;
    font-weight: 700;
  }
`;
const PersonEdit = styled.button`
  display: grid;
  place-items: center;
  width: 28px;
  height: 28px;
  border: 0;
  border-radius: 7px;
  color: var(--muted);
  background: transparent;
  cursor: pointer;
  &:hover {
    color: var(--forest);
    background: var(--forest-soft);
  }
`;

export function PeopleView({
  people,
  plays,
  onAdd,
  onEdit,
  onOpenPerson,
  canEdit,
}: {
  people: Person[];
  plays: Play[];
  onAdd: () => void;
  onEdit: (person: Person) => void;
  onOpenPerson: (personId: number) => void;
  canEdit: boolean;
}) {
  return (
    <ContentPanel>
      <PeopleIntro>
        <div>
          <Eyebrow>Votre tablée</Eyebrow>
          <h2>{people.length} personnes avec qui partager de bons moments</h2>
        </div>
        {canEdit && (
          <SecondaryButton type="button" onClick={onAdd}>
            <UserPlus size={17} /> Ajouter quelqu’un
          </SecondaryButton>
        )}
      </PeopleIntro>
      <PeopleGrid>
        {people.map((person) => {
          const personPlays = plays.filter((play) =>
            play.participants.some((item) => item.personId === person.id),
          );
          const wins = personPlays.filter((play) =>
            play.participants.some(
              (item) => item.personId === person.id && item.isWinner,
            ),
          ).length;
          return (
            <PersonCard
              key={person.id}
              role="button"
              tabIndex={0}
              onClick={() => onOpenPerson(person.id)}
              onKeyDown={(event) => {
                if (event.key === "Enter" || event.key === " ") {
                  event.preventDefault();
                  onOpenPerson(person.id);
                }
              }}
            >
              <Avatar person={person} />
              <div>
                <h3>
                  {person.name}
                  {person.isHousehold && <span>Maison</span>}
                </h3>
                <p>{person.email || "Partenaire de jeu"}</p>
              </div>
              {canEdit && (
                <PersonEdit
                  type="button"
                  aria-label={`Modifier ${person.name}`}
                  onClick={(event) => {
                    event.stopPropagation();
                    onEdit(person);
                  }}
                >
                  <Pencil size={15} />
                </PersonEdit>
              )}
              <dl>
                <div>
                  <dt>Parties</dt>
                  <dd>{personPlays.length}</dd>
                </div>
                <div>
                  <dt>Victoires</dt>
                  <dd>{wins}</dd>
                </div>
                <div>
                  <dt>Dernière</dt>
                  <dd>
                    {personPlays[0]
                      ? relativeDate(personPlays[0].playedAt)
                      : "—"}
                  </dd>
                </div>
              </dl>
            </PersonCard>
          );
        })}
      </PeopleGrid>
    </ContentPanel>
  );
}
