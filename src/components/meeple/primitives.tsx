"use client";

import { ChevronRight, Dices } from "lucide-react";
import type { ReactNode } from "react";
import type { Game, Person } from "./types";

const shortDate = new Intl.DateTimeFormat("fr-FR", {
  day: "numeric",
  month: "short",
});

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
  onOpen,
}: {
  person: Pick<Person, "name" | "color">;
  small?: boolean;
  onOpen?: () => void;
}) {
  const className = `avatar ${small ? "avatar-sm" : ""}`;
  const content = initials(person.name);
  const children = (
    <>
      <span className="avatar-initials">{content}</span>
      <span className="avatar-name">{person.name}</span>
    </>
  );
  if (onOpen) {
    return (
      <button
        className={`${className} avatar-button`}
        type="button"
        style={{ backgroundColor: person.color }}
        title={person.name}
        aria-label={`Ouvrir la fiche de ${person.name}`}
        onClick={(event) => {
          event.stopPropagation();
          onOpen();
        }}
      >
        {children}
      </button>
    );
  }
  return (
    <span
      className={className}
      style={{ backgroundColor: person.color }}
      title={person.name}
    >
      {children}
    </span>
  );
}

export function AvatarStack({
  people,
  onOpenPerson,
}: {
  people: Pick<Person, "id" | "name" | "color">[];
  onOpenPerson?: (personId: number) => void;
}) {
  return (
    <span className="avatar-stack">
      {people.slice(0, 4).map((person) => (
        <Avatar
          key={person.id}
          person={person}
          small
          onOpen={onOpenPerson ? () => onOpenPerson(person.id) : undefined}
        />
      ))}
      {people.length > 4 && (
        <span className="avatar avatar-sm avatar-more">
          +{people.length - 4}
        </span>
      )}
    </span>
  );
}

export function GameImage({
  game,
  className = "",
}: {
  game: Pick<Game, "title" | "imageUrl">;
  className?: string;
}) {
  if (game.imageUrl) {
    return (
      <img
        className={`game-image ${className}`}
        src={game.imageUrl}
        alt={`Illustration de ${game.title}`}
      />
    );
  }
  return (
    <div className={`game-image game-image-fallback ${className}`}>
      <Dices size={28} />
      <span>{game.title}</span>
    </div>
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
    <button className="game-link" type="button" onClick={onOpen}>
      {game.title}
    </button>
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
    <div className="section-heading">
      <h2>{title}</h2>
      {action && (
        <button className="text-action" type="button" onClick={onAction}>
          {action} <ChevronRight size={15} />
        </button>
      )}
    </div>
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
    <div className="empty-state">
      <span className="empty-icon">
        <Icon size={25} />
      </span>
      <h3>{title}</h3>
      <p>{text}</p>
      {action}
    </div>
  );
}
