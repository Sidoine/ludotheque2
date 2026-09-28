"use client";

import {
  Check,
  CircleDollarSign,
  FileArchive,
  HandHeart,
  Info,
  Loader2,
  Tag,
  Upload,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useRef, useState } from "react";
import type { DashboardData } from "@/lib/data";
import { EmptyState, GameImage, SectionHeading } from "./primitives";
import type { Game } from "./types";

const frDate = new Intl.DateTimeFormat("fr-FR", {
  day: "numeric",
  month: "long",
  year: "numeric",
});
export function LoansView({ games }: { games: Game[] }) {
  const loaned = games.filter((game) => game.activeLoan);
  return (
    <div className="content-panel">
      <div className="info-banner">
        <Info size={19} />
        <div>
          <strong>Une mémoire pour vos étagères</strong>
          <p>
            Enregistrez ce que vous prêtez et ce que vos amis vous confient.
          </p>
        </div>
      </div>
      <div className="loan-columns">
        <section>
          <SectionHeading title={`Empruntés (${loaned.length})`} />
          {loaned.map((game) => (
            <article className="loan-card" key={game.id}>
              <GameImage game={game} />
              <div>
                <span className="pill pill-gold">Chez vous</span>
                <h3>{game.title}</h3>
                <p>
                  Prêté par{" "}
                  <strong>{game.activeLoan?.lender?.name ?? "un ami"}</strong>
                </p>
                <small>
                  Depuis le{" "}
                  {game.activeLoan
                    ? frDate.format(
                        new Date(`${game.activeLoan.borrowedAt}T12:00:00`),
                      )
                    : "—"}
                </small>
              </div>
              <button type="button">Marquer rendu</button>
            </article>
          ))}
        </section>
        <section>
          <SectionHeading title="Prêtés (0)" />{" "}
          <EmptyState
            icon={HandHeart}
            title="Aucun jeu prêté"
            text="Toutes vos boîtes sont actuellement à la maison."
          />
        </section>
      </div>
    </div>
  );
}

export function SaleView({ games }: { games: Game[] }) {
  const saleGames = games.filter((game) => game.forSale);
  const total = saleGames.reduce(
    (sum, game) => sum + Number(game.salePrice ?? 0),
    0,
  );
  return (
    <div className="content-panel">
      <div className="sale-summary">
        <span>
          <CircleDollarSign size={24} />
        </span>
        <div>
          <p>Valeur de votre sélection</p>
          <strong>{total.toLocaleString("fr-FR")} €</strong>
        </div>
        <small>
          {saleGames.length} jeu{saleGames.length > 1 ? "x" : ""} cherche
          {saleGames.length > 1 ? "nt" : ""} une nouvelle maison
        </small>
      </div>
      <div className="games-grid sale-grid">
        {saleGames.map((game) => (
          <article className="sale-card" key={game.id}>
            <GameImage game={game} />
            <div>
              <p>{game.categories[0] || "Jeu de société"}</p>
              <h3>{game.title}</h3>
              <span>
                {game.salePrice
                  ? `${Number(game.salePrice)} €`
                  : "Prix à définir"}
              </span>
              <button type="button">Marquer comme vendu</button>
            </div>
          </article>
        ))}
      </div>
      {!saleGames.length && (
        <EmptyState
          icon={Tag}
          title="Rien à vendre"
          text="Vous tenez encore à toutes vos boîtes."
        />
      )}
    </div>
  );
}

export function StatsView({ data }: { data: DashboardData }) {
  const counts = data.games.toSorted((a, b) => b.playCount - a.playCount);
  const max = Math.max(...counts.map((game) => game.playCount), 1);
  const maxMonthlyCount = Math.max(...data.chart.map((item) => item.count), 1);
  return (
    <div className="stats-page-grid">
      <section className="panel ranking-panel">
        <SectionHeading title="Jeux les plus joués" />
        {counts.map((game, index) => (
          <div className="ranking-row" key={game.id}>
            <span className="rank">{index + 1}</span>
            <GameImage game={game} />
            <strong>{game.title}</strong>
            <div className="rank-bar">
              <i style={{ width: `${(game.playCount / max) * 100}%` }} />
            </div>
            <b>{game.playCount}</b>
          </div>
        ))}
      </section>
      <section className="panel big-chart">
        <p className="eyebrow">Sur 6 mois</p>
        <h2>{data.stats.playCount} souvenirs autour de la table</h2>
        <div className="bar-chart large">
          {data.chart.map((item) => (
            <div className="bar-slot" key={item.key}>
              <span className="bar-value">{item.count}</span>
              <div className="bar-track">
                <div
                  className="bar"
                  style={{
                    height: `${Math.max(8, (item.count / maxMonthlyCount) * 100)}%`,
                  }}
                />
              </div>
              <span>{item.label}</span>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

export function ImportView({
  onToast,
  canEdit,
}: {
  onToast: (message: string, error?: boolean) => void;
  canEdit: boolean;
}) {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{
    imported: number;
    skipped: number;
    kind: "games" | "plays";
  } | null>(null);

  async function upload() {
    if (!file) return;
    setLoading(true);
    const form = new FormData();
    form.append("file", file);
    const response = await fetch("/api/import/notion", {
      method: "POST",
      body: form,
    });
    const payload = await response.json();
    setLoading(false);
    if (!response.ok)
      return onToast(payload.error || "Import impossible", true);
    setResult(payload);
    const noun = payload.kind === "games" ? "jeu" : "partie";
    const importedSuffix =
      payload.imported > 1
        ? payload.kind === "games"
          ? "s"
          : "es"
        : payload.kind === "games"
          ? ""
          : "e";
    onToast(
      `${payload.imported} ${noun}${payload.imported > 1 ? "s" : ""} importé${importedSuffix}`,
    );
    router.refresh();
  }

  return (
    <div className="import-layout">
      <section className="panel import-card">
        <span className="import-illustration">
          <FileArchive size={32} />
        </span>
        <p className="eyebrow">Import Notion</p>
        <h2>Importez vos jeux ou vos parties</h2>
        <p>
          Utilisez le CSV de votre liste de jeux ou l’export CSV de vos parties.
          Les propriétaires et participants seront rattachés automatiquement.
        </p>
        <button
          className={`dropzone ${file ? "has-file" : ""}`}
          type="button"
          disabled={!canEdit}
          onClick={() => inputRef.current?.click()}
        >
          {file ? (
            <>
              <Check size={25} />
              <strong>{file.name}</strong>
              <span>{(file.size / 1024).toFixed(0)} Ko · Prêt à importer</span>
            </>
          ) : (
            <>
              <Upload size={25} />
              <strong>Choisir un fichier CSV</strong>
              <span>Liste de jeux ou export de parties Notion</span>
            </>
          )}
        </button>
        <input
          ref={inputRef}
          hidden
          type="file"
          accept=".csv,text/csv"
          onChange={(event) => {
            setFile(event.target.files?.[0] ?? null);
            setResult(null);
          }}
        />
        {!canEdit && (
          <p className="read-only-note">
            Connectez-vous pour importer des jeux ou des parties.
          </p>
        )}
        <button
          className="primary-button full"
          type="button"
          disabled={!canEdit || !file || loading}
          onClick={upload}
        >
          {loading ? (
            <Loader2 className="spin" size={17} />
          ) : (
            <FileArchive size={17} />
          )}{" "}
          Importer le CSV
        </button>
        {result && (
          <div className="import-result">
            <Check size={18} />
            <span>
              <strong>
                {result.imported} {result.kind === "games" ? "jeu" : "partie"}
                {result.imported > 1 ? "s" : ""} importé
                {result.imported > 1
                  ? result.kind === "games"
                    ? "s"
                    : "es"
                  : result.kind === "games"
                    ? ""
                    : "e"}
              </strong>
              {result.skipped
                ? `, ${result.skipped} ignorée${result.skipped > 1 ? "s" : ""}`
                : ", aucune erreur"}
            </span>
          </div>
        )}
      </section>
      <aside className="import-guide">
        <p className="eyebrow">Formats reconnus</p>
        <h3>Jeux ou parties</h3>
        <div className="code-sample">
          <strong>CSV jeux</strong>
          <span>
            Nom,Étiquettes,Note BGG,Possesseur,Durée,Nombre de parties
          </span>
          <span>CSV parties : Titre,Date,Lieu,Notes,Personne,Jeu,Gagnant</span>
          <span>Le nombre de parties est ignoré.</span>
        </div>
        <ul>
          <li>
            <Check size={15} /> Jeux créés s’ils sont absents
          </li>
          <li>
            <Check size={15} /> Propriétaires rattachés automatiquement
          </li>
          <li>
            <Check size={15} /> Nombre de parties ignoré dans le CSV
          </li>
        </ul>
      </aside>
    </div>
  );
}
