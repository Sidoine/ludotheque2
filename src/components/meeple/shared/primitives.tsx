"use client";

import styled from "@emotion/styled";
import { ChevronRight, Dices } from "lucide-react";
import { useRouter } from "next/navigation";
import type { ReactNode } from "react";
import type { Game, Person } from "../types";

const shortDate = new Intl.DateTimeFormat("fr-FR", {
  day: "numeric",
  month: "short",
});

const AvatarInitials = styled.span`
  flex: 0 0 auto;
  max-width: 2em;
  opacity: 1;
  transition:
    max-width 120ms ease,
    opacity 120ms ease;
`;

const AvatarName = styled.span`
  flex: 0 0 auto;
  max-width: 0;
  overflow: hidden;
  opacity: 0;
  transition:
    max-width 180ms ease,
    opacity 120ms ease;
`;

const AvatarBase = styled.span<{ $small: boolean }>`
  width: ${({ $small }) => ($small ? "25px" : "35px")};
  min-width: ${({ $small }) => ($small ? "25px" : "35px")};
  height: ${({ $small }) => ($small ? "25px" : "35px")};
  ${({ $small }) => $small && "max-width: 25px; margin-left: -5px;"}
  display: inline-flex;
  place-items: center;
  justify-content: center;
  gap: 5px;
  overflow: hidden;
  border: 2px solid rgba(255, 255, 255, 0.85);
  border-radius: 50%;
  color: white;
  font-size: ${({ $small }) => ($small ? "7px" : "9px")};
  font-weight: 800;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.08);
  transition:
    width 180ms ease,
    border-radius 180ms ease,
    box-shadow 180ms ease,
    transform 180ms ease;
  interpolate-size: allow-keywords;
  white-space: nowrap;

  &:hover,
  &:focus-visible {
    width: fit-content;
    min-width: 0;
    max-width: calc(100vw - 24px);
    padding-inline: 8px;
    border-radius: 999px;
    justify-content: flex-start;
    z-index: 3;

    ${AvatarName} {
      max-width: calc(100vw - 64px);
      opacity: 1;
    }

    ${AvatarInitials} {
      max-width: 0;
      opacity: 0;
    }
  }
`;

const AvatarButton = AvatarBase.withComponent("button");

const AvatarMore = styled(AvatarBase)`
  color: #68736d;
  background: #e8e8e2 !important;
`;

const AvatarStackContainer = styled.span`
  display: inline-flex;
  align-items: center;
  padding-left: 5px;
`;

const GameImageBase = styled.img<{
  $variant: Exclude<GameImageVariant, "fallback">;
}>`
  display: block;
  width: ${({ $variant }) =>
    ({
      row: "51px",
      activity: "50px",
      detail: "110px",
      card: "100%",
      fallback: "100%",
    })[$variant]};
  height: ${({ $variant }) =>
    ({
      row: "62px",
      activity: "64px",
      detail: "140px",
      card: "100%",
      fallback: "100%",
    })[$variant]};
  flex: 0 0 auto;
  object-fit: cover;
  border-radius: 8px;
  background: #e7e8e1;
`;

const GameImageFallback = styled.div<{ $variant: GameImageVariant }>`
  width: ${({ $variant }) =>
    ({
      row: "51px",
      activity: "50px",
      detail: "110px",
      card: "100%",
      fallback: "100%",
    })[$variant]};
  height: ${({ $variant }) =>
    ({
      row: "62px",
      activity: "64px",
      detail: "140px",
      card: "100%",
      fallback: "100%",
    })[$variant]};
  flex: 0 0 auto;
  display: flex;
  flex-direction: column;
  border-radius: 8px;
  align-items: center;
  justify-content: center;
  gap: 6px;
  padding: 6px;
  color: rgba(255, 255, 255, 0.9);
  background: linear-gradient(145deg, #5d826e, #2f5544);
  text-align: center;

  span {
    font-family: var(--serif);
    font-size: 10px;
    line-height: 1.1;
  }
`;

const GameLinkButton = styled.button`
  display: block;
  overflow: hidden;
  width: 100%;
  padding: 0;
  border: 0;
  color: inherit;
  font: inherit;
  text-align: left;
  text-overflow: ellipsis;
  white-space: nowrap;
  background: transparent;
  cursor: pointer;

  &:hover {
    color: var(--forest);
    text-decoration: underline;
  }
`;

const SectionHeadingContainer = styled.div`
  min-height: 25px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 15px;
  margin-bottom: 15px;

  h2 {
    margin: 0;
    font-family: var(--serif);
    font-size: 18px;
    font-weight: 500;
    letter-spacing: -0.2px;
  }
`;

const TextAction = styled.button`
  display: inline-flex;
  align-items: center;
  gap: 2px;
  padding: 3px;
  border: 0;
  color: var(--forest);
  background: transparent;
  font-size: 11px;
  cursor: pointer;
`;

const EmptyStateContainer = styled.div`
  min-height: 260px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 35px;
  color: var(--muted);
  text-align: center;

  h3 {
    margin: 0 0 6px;
    color: var(--ink);
    font-family: var(--serif);
    font-size: 17px;
  }

  p {
    max-width: 320px;
    margin: 0 0 16px;
    font-size: 10px;
    line-height: 1.5;
  }
`;

const EmptyIcon = styled.span`
  width: 51px;
  height: 51px;
  display: grid;
  place-items: center;
  margin-bottom: 13px;
  border-radius: 50%;
  color: var(--forest);
  background: var(--forest-soft);
`;

type GameImageVariant = "row" | "activity" | "card" | "detail" | "fallback";

export function initials(name: string) {
  return name
    .split(/\s+/)
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

export function relativeDate(value: string | Date) {
  const date = new Date(value);
  const delta = Math.floor((Date.now() - date.getTime()) / 86400000);
  if (delta <= 0) return "Aujourd’hui";
  if (delta === 1) return "Hier";
  if (delta < 7) return `Il y a ${delta} jours`;
  return shortDate.format(date);
}

export function Avatar({
  person,
  small = false,
}: {
  person: Pick<Person, "name" | "color"> & { id?: number };
  small?: boolean;
}) {
  const router = useRouter();
  const content = initials(person.name);
  const children = (
    <>
      <AvatarInitials>{content}</AvatarInitials>
      <AvatarName>{person.name}</AvatarName>
    </>
  );
  if (person.id !== undefined) {
    return (
      <AvatarButton
        $small={small}
        type="button"
        style={{ backgroundColor: person.color }}
        title={person.name}
        aria-label={`Ouvrir la fiche de ${person.name}`}
        onClick={(event) => {
          event.stopPropagation();
          router.push(`/people/${person.id}`);
        }}
      >
        {children}
      </AvatarButton>
    );
  }
  return (
    <AvatarBase
      $small={small}
      style={{ backgroundColor: person.color }}
      title={person.name}
    >
      {children}
    </AvatarBase>
  );
}

export function AvatarStack({
  people,
}: {
  people: Pick<Person, "id" | "name" | "color">[];
}) {
  return (
    <AvatarStackContainer>
      {people.slice(0, 4).map((person) => (
        <Avatar key={person.id} person={person} small />
      ))}
      {people.length > 4 && (
        <AvatarMore $small>+{people.length - 4}</AvatarMore>
      )}
    </AvatarStackContainer>
  );
}

export function GameImage({
  game,
  variant = "card",
}: {
  game: Pick<Game, "title" | "imageUrl">;
  variant?: Exclude<GameImageVariant, "fallback">;
}) {
  if (game.imageUrl) {
    return (
      <GameImageBase
        as="img"
        $variant={variant}
        src={game.imageUrl}
        alt={`Illustration de ${game.title}`}
      />
    );
  }
  return (
    <GameImageFallback $variant={variant}>
      <Dices size={28} />
      <span>{game.title}</span>
    </GameImageFallback>
  );
}

export function GameLink({
  game,
  onOpen,
}: {
  game: Pick<Game, "title">;
  onOpen: () => void;
}) {
  return (
    <GameLinkButton type="button" onClick={onOpen}>
      {game.title}
    </GameLinkButton>
  );
}

export function SectionHeading({
  title,
  action,
  onAction,
}: {
  title: string;
  action?: string;
  onAction?: () => void;
}) {
  return (
    <SectionHeadingContainer>
      <h2>{title}</h2>
      {action && (
        <TextAction type="button" onClick={onAction}>
          {action} <ChevronRight size={15} />
        </TextAction>
      )}
    </SectionHeadingContainer>
  );
}

export function EmptyState({
  icon: Icon,
  title,
  text,
  action,
}: {
  icon: typeof Dices;
  title: string;
  text: string;
  action?: ReactNode;
}) {
  return (
    <EmptyStateContainer>
      <EmptyIcon>
        <Icon size={25} />
      </EmptyIcon>
      <h3>{title}</h3>
      <p>{text}</p>
      {action}
    </EmptyStateContainer>
  );
}
