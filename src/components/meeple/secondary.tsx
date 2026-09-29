"use client";

import styled from "@emotion/styled";
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
const Panel = styled.div`
  padding: 25px;
  border: 1px solid var(--line);
  border-radius: 13px;
  background: var(--paper);
`;
const InfoBanner = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 22px;
  padding: 14px 16px;
  border-radius: 10px;
  color: var(--forest);
  background: var(--forest-soft);
  strong {
    display: block;
    font-size: 12px;
  }
  p {
    margin: 3px 0 0;
    color: var(--muted);
    font-size: 10px;
  }
`;
const LoanColumns = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 24px;
`;
const LoanCard = styled.article`
  display: grid;
  grid-template-columns: 70px 1fr auto;
  align-items: center;
  gap: 13px;
  padding: 13px 0;
  border-top: 1px solid var(--line);
  h3 {
    margin: 5px 0 4px;
    font-family: var(--serif);
    font-size: 14px;
  }
  p,
  small {
    color: var(--muted);
    font-size: 10px;
  }
  button {
    border: 0;
    color: var(--forest);
    background: transparent;
    font-size: 10px;
    cursor: pointer;
  }
`;
const Pill = styled.span`
  display: inline-flex;
  min-height: 18px;
  align-items: center;
  padding: 0 7px;
  border-radius: 10px;
  color: #806425;
  background: #f4e8bf;
  font-size: 8px;
  font-weight: 750;
`;
const SaleSummary = styled.div`
  display: flex;
  align-items: center;
  gap: 14px;
  min-height: 100px;
  margin-bottom: 20px;
  padding: 18px;
  border-radius: 12px;
  background: #f6eee0;
  & > span {
    display: grid;
    width: 45px;
    height: 45px;
    place-items: center;
    border-radius: 50%;
    color: #806425;
    background: #f4e8bf;
  }
  p {
    margin: 0 0 4px;
    color: var(--muted);
    font-size: 10px;
  }
  strong {
    font-family: var(--serif);
    font-size: 24px;
    font-weight: 500;
  }
  small {
    margin-left: auto;
    color: var(--muted);
    font-size: 10px;
  }
`;
const GamesGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px;
`;
const SaleCard = styled.article`
  overflow: hidden;
  border: 1px solid var(--line);
  border-radius: 12px;
  background: white;
  & > div {
    padding: 14px;
  }
  p {
    margin: 0 0 4px;
    color: var(--muted);
    font-size: 9px;
  }
  h3 {
    margin: 0 0 8px;
    font-family: var(--serif);
    font-size: 15px;
  }
  span {
    color: var(--terracotta);
    font-weight: 700;
  }
  button {
    display: block;
    margin-top: 12px;
    border: 0;
    color: var(--forest);
    background: transparent;
    font-size: 10px;
    cursor: pointer;
  }
`;
const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 18px;
`;
const RankingRow = styled.div`
  display: grid;
  grid-template-columns: 25px 50px 1fr 100px 28px;
  align-items: center;
  gap: 10px;
  padding: 10px 0;
  border-top: 1px solid var(--line);
  .rank {
    color: var(--muted);
  }
  strong {
    overflow: hidden;
    font-size: 11px;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
  b {
    font-size: 11px;
    text-align: right;
  }
`;
const Rank = styled.span`
  color: var(--muted);
`;
const RankBar = styled.div`
  height: 7px;
  overflow: hidden;
  border-radius: 5px;
  background: #edf0eb;
  i {
    display: block;
    height: 100%;
    border-radius: inherit;
    background: var(--forest);
  }
`;
const BigChart = styled(Panel)`
  h2 {
    margin: 0;
    font-family: var(--serif);
    font-weight: 500;
  }
`;
const BarChart = styled.div`
  height: 180px;
  display: flex;
  align-items: end;
  gap: 10px;
  margin-top: 25px;
`;
const BarSlot = styled.div`
  height: 100%;
  display: flex;
  flex: 1;
  flex-direction: column;
  align-items: center;
  justify-content: end;
  gap: 5px;
  color: var(--muted);
  font-size: 9px;
`;
const BarValue = styled.span``;
const BarTrack = styled.div`
  width: 100%;
  height: 100%;
  display: flex;
  align-items: end;
  border-radius: 6px;
  background: #edf0eb;
`;
const Bar = styled.div`
  width: 100%;
  border-radius: 6px;
  background: var(--forest);
`;
const ImportLayout = styled.div`
  display: grid;
  grid-template-columns: minmax(0, 1fr) 300px;
  gap: 18px;
`;
const ImportCard = styled(Panel)`
  text-align: center;
  & > p:not(:first-child) {
    color: var(--muted);
    font-size: 11px;
    line-height: 1.5;
  }
  h2 {
    font-family: var(--serif);
    font-weight: 500;
  }
`;
const ImportIllustration = styled.span`
  display: grid;
  width: 70px;
  height: 70px;
  place-items: center;
  margin: 0 auto 15px;
  border-radius: 50%;
  color: var(--forest);
  background: var(--forest-soft);
`;
const Dropzone = styled.button<{ $hasFile: boolean }>`
  width: 100%;
  min-height: 130px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 6px;
  margin: 20px 0;
  border: 1px dashed
    ${({ $hasFile }) => ($hasFile ? "var(--forest)" : "#bfc9c1")};
  border-radius: 12px;
  color: var(--forest);
  background: ${({ $hasFile }) =>
    $hasFile ? "var(--forest-soft)" : "#fafbf8"};
  cursor: pointer;
  strong {
    font-size: 12px;
  }
  span {
    color: var(--muted);
    font-size: 10px;
  }
`;
const PrimaryButton = styled.button`
  width: 100%;
  min-height: 40px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  border: 1px solid var(--forest);
  border-radius: 9px;
  color: white;
  background: var(--forest);
  font-weight: 700;
  cursor: pointer;
  &:disabled {
    opacity: 0.55;
    cursor: not-allowed;
  }
`;
const ImportResult = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  margin-top: 18px;
  padding: 12px;
  border-radius: 9px;
  color: var(--forest);
  background: var(--forest-soft);
  text-align: left;
  font-size: 10px;
`;
const ImportGuide = styled.aside`
  padding: 24px;
  border-radius: 13px;
  background: #f1eee5;
  h3 {
    margin: 0 0 14px;
    font-family: var(--serif);
    font-weight: 500;
  }
  ul {
    padding: 0;
    list-style: none;
    color: var(--muted);
    font-size: 10px;
    line-height: 2;
  }
`;
const CodeSample = styled.div`
  display: grid;
  gap: 8px;
  padding: 12px;
  border-radius: 8px;
  color: var(--muted);
  background: white;
  font-size: 9px;
`;
const Eyebrow = styled.p`
  margin: 0 0 5px;
  color: var(--terracotta);
  font-size: 9px;
  font-weight: 800;
  letter-spacing: 0.13em;
  text-transform: uppercase;
`;
const ReadOnlyNote = styled.p`
  color: var(--muted);
  font-size: 12px;
`;
export function LoansView({ games }: { games: Game[] }) {
  const loaned = games.filter((game) => game.activeLoan);
  return (
    <Panel>
      <InfoBanner>
        <Info size={19} />
        <div>
          <strong>Une mémoire pour vos étagères</strong>
          <p>
            Enregistrez ce que vous prêtez et ce que vos amis vous confient.
          </p>
        </div>
      </InfoBanner>
      <LoanColumns>
        <section>
          <SectionHeading title={`Empruntés (${loaned.length})`} />
          {loaned.map((game) => (
            <LoanCard key={game.id}>
              <GameImage game={game} variant="card" />
              <div>
                <Pill>Chez vous</Pill>
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
            </LoanCard>
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
      </LoanColumns>
    </Panel>
  );
}

export function SaleView({ games }: { games: Game[] }) {
  const saleGames = games.filter((game) => game.forSale);
  const total = saleGames.reduce(
    (sum, game) => sum + Number(game.salePrice ?? 0),
    0,
  );
  return (
    <Panel>
      <SaleSummary>
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
      </SaleSummary>
      <GamesGrid>
        {saleGames.map((game) => (
          <SaleCard key={game.id}>
            <GameImage game={game} variant="card" />
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
          </SaleCard>
        ))}
      </GamesGrid>
      {!saleGames.length && (
        <EmptyState
          icon={Tag}
          title="Rien à vendre"
          text="Vous tenez encore à toutes vos boîtes."
        />
      )}
    </Panel>
  );
}

export function StatsView({ data }: { data: DashboardData }) {
  const counts = data.games.toSorted((a, b) => b.playCount - a.playCount);
  const max = Math.max(...counts.map((game) => game.playCount), 1);
  const maxMonthlyCount = Math.max(...data.chart.map((item) => item.count), 1);
  return (
    <StatsGrid>
      <Panel>
        <SectionHeading title="Jeux les plus joués" />
        {counts.map((game, index) => (
          <RankingRow key={game.id}>
            <Rank>{index + 1}</Rank>
            <GameImage game={game} variant="card" />
            <strong>{game.title}</strong>
            <RankBar>
              <i style={{ width: `${(game.playCount / max) * 100}%` }} />
            </RankBar>
            <b>{game.playCount}</b>
          </RankingRow>
        ))}
      </Panel>
      <BigChart>
        <Eyebrow>Sur 6 mois</Eyebrow>
        <h2>{data.stats.playCount} souvenirs autour de la table</h2>
        <BarChart>
          {data.chart.map((item) => (
            <BarSlot key={item.key}>
              <BarValue>{item.count}</BarValue>
              <BarTrack>
                <Bar
                  style={{
                    height: `${Math.max(8, (item.count / maxMonthlyCount) * 100)}%`,
                  }}
                />
              </BarTrack>
              <span>{item.label}</span>
            </BarSlot>
          ))}
        </BarChart>
      </BigChart>
    </StatsGrid>
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
    <ImportLayout>
      <ImportCard>
        <ImportIllustration>
          <FileArchive size={32} />
        </ImportIllustration>
        <Eyebrow>Import Notion</Eyebrow>
        <h2>Importez vos jeux ou vos parties</h2>
        <p>
          Utilisez le CSV de votre liste de jeux ou l’export CSV de vos parties.
          Les propriétaires et participants seront rattachés automatiquement.
        </p>
        <Dropzone
          $hasFile={Boolean(file)}
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
        </Dropzone>
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
          <ReadOnlyNote>
            Connectez-vous pour importer des jeux ou des parties.
          </ReadOnlyNote>
        )}
        <PrimaryButton
          type="button"
          disabled={!canEdit || !file || loading}
          onClick={upload}
        >
          {loading ? <Loader2 size={17} /> : <FileArchive size={17} />} Importer
          le CSV
        </PrimaryButton>
        {result && (
          <ImportResult>
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
          </ImportResult>
        )}
      </ImportCard>
      <ImportGuide>
        <Eyebrow>Formats reconnus</Eyebrow>
        <h3>Jeux ou parties</h3>
        <CodeSample>
          <strong>CSV jeux</strong>
          <span>
            Nom,Étiquettes,Note BGG,Possesseur,Durée,Nombre de parties
          </span>
          <span>CSV parties : Titre,Date,Lieu,Notes,Personne,Jeu,Gagnant</span>
          <span>Le nombre de parties est ignoré.</span>
        </CodeSample>
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
      </ImportGuide>
    </ImportLayout>
  );
}
