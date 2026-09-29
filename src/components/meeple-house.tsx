"use client";

import {
  BarChart3,
  Check,
  Dices,
  FileArchive,
  HandHeart,
  History,
  LayoutDashboard,
  LibraryBig,
  LogIn,
  Menu,
  MoreHorizontal,
  Plus,
  Sparkles,
  Tag,
  Upload,
  Users,
  X,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import type { DashboardData } from "@/lib/data";
import { DashboardView } from "./meeple/dashboard";
import { GameDetailsPage, GamesView } from "./meeple/library";
import { GameModal, LoginModal, PersonModal, PlayModal } from "./meeple/modals";
import { Avatar } from "./meeple/primitives";
import { ImportView, LoansView, SaleView, StatsView } from "./meeple/secondary";
import { PeopleView, PersonDetailsPage, PlaysView } from "./meeple/social";
import type { Game, Person, Play, View } from "./meeple/types";

type IconType = typeof LayoutDashboard;

const navMain: { id: View; label: string; icon: IconType }[] = [
  { id: "dashboard", label: "Vue d’ensemble", icon: LayoutDashboard },
  { id: "games", label: "Ma ludothèque", icon: LibraryBig },
  { id: "plays", label: "Mes parties", icon: History },
  { id: "people", label: "Joueurs & amis", icon: Users },
  { id: "loans", label: "Prêts & emprunts", icon: HandHeart },
  { id: "sale", label: "À vendre", icon: Tag },
];

const pageTitles: Record<View, { title: string; subtitle: string }> = {
  dashboard: {
    title: "Tableau de bord",
    subtitle: "Voici ce qui se passe dans votre ludothèque.",
  },
  games: {
    title: "Ma ludothèque",
    subtitle: "Tous vos jeux, ceux de la maison et ceux des amis.",
  },
  plays: {
    title: "Mes parties",
    subtitle: "Gardez une trace de chaque soirée autour de la table.",
  },
  people: {
    title: "Joueurs & amis",
    subtitle: "Votre cercle de joueurs et leurs dernières parties.",
  },
  loans: {
    title: "Prêts & emprunts",
    subtitle: "Pour que chaque boîte retrouve toujours son étagère.",
  },
  sale: {
    title: "À vendre",
    subtitle: "Les jeux prêts à rejoindre une nouvelle ludothèque.",
  },
  stats: {
    title: "Statistiques",
    subtitle: "Quelques chiffres sur vos habitudes de jeu.",
  },
  import: {
    title: "Importer depuis Notion",
    subtitle: "Retrouvez votre historique en quelques secondes.",
  },
};

export function MeepleHouse({ data }: { data: DashboardData }) {
  const router = useRouter();
  const [view, setView] = useState<View>("dashboard");
  const [gameModal, setGameModal] = useState(false);
  const [editingGame, setEditingGame] = useState<Game | undefined>();
  const [playModal, setPlayModal] = useState(false);
  const [editingPlay, setEditingPlay] = useState<Play | undefined>();
  const [personModal, setPersonModal] = useState(false);
  const [editingPerson, setEditingPerson] = useState<Person | undefined>();
  const [loginModal, setLoginModal] = useState(false);
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [adminName, setAdminName] = useState("Sidoine");
  const [detailsGame, setDetailsGame] = useState<Game | undefined>();
  const [detailsPerson, setDetailsPerson] = useState<Person | undefined>();
  const [selectedGame, setSelectedGame] = useState<Game | undefined>();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [toast, setToast] = useState<{
    message: string;
    error: boolean;
  } | null>(null);
  const title = pageTitles[view];
  const currentDate = useMemo(
    () =>
      new Intl.DateTimeFormat("fr-FR", {
        weekday: "long",
        day: "numeric",
        month: "long",
      }).format(new Date()),
    [],
  );

  useEffect(() => {
    fetch("/api/auth")
      .then((response) => response.json())
      .then((payload) => {
        setIsAdmin(Boolean(payload.authenticated));
        if (payload.name) setAdminName(payload.name);
      })
      .catch(() => undefined);
  }, []);

  useEffect(() => {
    if (!detailsGame) return;
    const refreshedGame = data.games.find((game) => game.id === detailsGame.id);
    if (refreshedGame && refreshedGame !== detailsGame) {
      setDetailsGame(refreshedGame);
    }
  }, [data.games, detailsGame]);

  function showToast(message: string, error = false) {
    setToast({ message, error });
    window.setTimeout(() => setToast(null), 3600);
  }
  function navigate(next: View) {
    setView(next);
    setSidebarOpen(false);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }
  function openPlay(game?: Game) {
    setEditingPlay(undefined);
    setSelectedGame(game);
    setPlayModal(true);
  }
  function openGameDetails(gameId: number) {
    const game = data.games.find((item) => item.id === gameId);
    if (!game) return;
    setDetailsPerson(undefined);
    setDetailsGame(game);
    setSidebarOpen(false);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }
  function openPersonDetails(personId: number) {
    const person = data.people.find((item) => item.id === personId);
    if (!person) return;
    setDetailsGame(undefined);
    setDetailsPerson(person);
    setSidebarOpen(false);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }
  function openEditPlay(play: Play) {
    setEditingPlay(play);
    setSelectedGame(undefined);
    setPlayModal(true);
  }
  function refreshed(close: () => void) {
    close();
    router.refresh();
  }
  async function deleteGame(game: Game) {
    if (!window.confirm(`Supprimer « ${game.title} » de la ludothèque ?`))
      return;
    const response = await fetch(`/api/games?id=${game.id}`, {
      method: "DELETE",
    });
    const payload = await response.json();
    if (!response.ok)
      return showToast(
        payload.error || "Impossible de supprimer ce jeu.",
        true,
      );
    showToast(`${game.title} a été supprimé`);
    router.refresh();
  }
  async function logout() {
    await fetch("/api/auth", { method: "DELETE" });
    setIsAdmin(false);
    setProfileMenuOpen(false);
  }

  return (
    <div className="app-shell">
      <aside className={`sidebar ${sidebarOpen ? "open" : ""}`}>
        <div className="brand">
          <span>
            <Dices size={23} />
          </span>
          <div>
            <strong>Ludo</strong>
            <em>thèque</em>
          </div>
          <button type="button" onClick={() => setSidebarOpen(false)}>
            <X size={18} />
          </button>
        </div>
        <nav className="side-nav">
          <p>Mon espace</p>
          {navMain.map((item) => (
            <button
              className={view === item.id ? "active" : ""}
              key={item.id}
              type="button"
              onClick={() => navigate(item.id)}
            >
              <item.icon size={18} />
              <span>{item.label}</span>
              {item.id === "games" && <b>{data.stats.gameCount}</b>}
              {item.id === "loans" && data.stats.activeLoanCount > 0 && (
                <b className="alert-badge">{data.stats.activeLoanCount}</b>
              )}
            </button>
          ))}
          <p>Explorer</p>
          <button
            className={view === "stats" ? "active" : ""}
            type="button"
            onClick={() => navigate("stats")}
          >
            <BarChart3 size={18} />
            <span>Statistiques</span>
          </button>
          <button
            className={view === "import" ? "active" : ""}
            type="button"
            onClick={() => navigate("import")}
          >
            <FileArchive size={18} />
            <span>Importer Notion</span>
          </button>
        </nav>
        <div className="sidebar-tip">
          <span>
            <Sparkles size={17} />
          </span>
          <strong>Le saviez-vous ?</strong>
          <p>
            Ajoutez le lien BGG d’un jeu pour remplir sa fiche automatiquement.
          </p>
        </div>
        <div className="profile">
          <Avatar
            person={{ name: isAdmin ? adminName : "Anonyme", color: "#436F5B" }}
          />
          <div>
            <strong>{isAdmin ? adminName : "Anonyme"}</strong>
            <span>{isAdmin ? "Administrateur" : "Lecture seule"}</span>
          </div>
          <button
            className="profile-menu-button"
            type="button"
            aria-label="Ouvrir le menu du profil"
            aria-expanded={profileMenuOpen}
            onClick={() => setProfileMenuOpen((open) => !open)}
          >
            <MoreHorizontal size={18} />
          </button>
          {profileMenuOpen && (
            <div className="profile-menu">
              {isAdmin ? (
                <button type="button" onClick={logout}>
                  <LogIn size={15} /> Se déconnecter
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => {
                    setLoginModal(true);
                    setProfileMenuOpen(false);
                  }}
                >
                  <LogIn size={15} /> Se connecter
                </button>
              )}
            </div>
          )}
        </div>
      </aside>
      {sidebarOpen && (
        <button
          className="sidebar-scrim"
          type="button"
          aria-label="Fermer le menu"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <main className="main-content">
        <header className="topbar">
          <button
            className="mobile-menu"
            type="button"
            onClick={() => setSidebarOpen(true)}
          >
            <Menu size={21} />
          </button>
          <div className="page-title">
            <p>{view === "dashboard" ? currentDate : "Ludothèque"}</p>
            <h1>{title.title}</h1>
            <span>{title.subtitle}</span>
          </div>
          <div className="header-actions">
            {isAdmin ? (
              <>
                {view !== "import" && (
                  <button
                    className="secondary-button import-button"
                    type="button"
                    onClick={() => navigate("import")}
                  >
                    <Upload size={17} /> Importer
                  </button>
                )}
                {view === "plays" ? (
                  <button
                    className="primary-button"
                    type="button"
                    onClick={() => openPlay()}
                  >
                    <Plus size={17} /> Ajouter une partie
                  </button>
                ) : (
                  <>
                    <button
                      className="secondary-button play-button"
                      type="button"
                      onClick={() => openPlay()}
                    >
                      <Plus size={17} /> Ajouter une partie
                    </button>
                    <button
                      className="primary-button"
                      type="button"
                      onClick={() => setGameModal(true)}
                    >
                      <Plus size={17} /> Ajouter un jeu
                    </button>
                  </>
                )}
              </>
            ) : (
              <button
                className="secondary-button"
                type="button"
                onClick={() => setLoginModal(true)}
              >
                <LogIn size={17} /> Se connecter
              </button>
            )}
          </div>
        </header>

        <div className="page-content">
          {detailsPerson ? (
            <PersonDetailsPage
              person={detailsPerson}
              plays={data.plays}
              canEdit={isAdmin}
              onOpenGame={openGameDetails}
              onBack={() => setDetailsPerson(undefined)}
              onEdit={(person) => {
                setDetailsPerson(undefined);
                setEditingPerson(person);
                setPersonModal(true);
              }}
            />
          ) : detailsGame ? (
            <GameDetailsPage
              game={detailsGame}
              people={data.people}
              plays={data.plays}
              canEdit={isAdmin}
              onBack={() => setDetailsGame(undefined)}
              onEdit={(game) => {
                setEditingGame(game);
                setGameModal(true);
              }}
              onPlay={openPlay}
              onToast={showToast}
              onChanged={() => {
                setDetailsGame(undefined);
                router.refresh();
              }}
            />
          ) : view === "dashboard" ? (
            <DashboardView
              data={data}
              setView={navigate}
              onPlay={openPlay}
              onOpenGame={openGameDetails}
              onOpenPerson={openPersonDetails}
              canEdit={isAdmin}
            />
          ) : view === "games" ? (
            <GamesView
              games={data.games}
              people={data.people}
              plays={data.plays}
              onPlay={openPlay}
              onOpenPerson={openPersonDetails}
              canEdit={isAdmin}
              onEdit={(game) => {
                setEditingGame(game);
                setGameModal(true);
              }}
              onDelete={deleteGame}
              onToast={showToast}
              onChanged={() => router.refresh()}
            />
          ) : view === "plays" ? (
            <PlaysView
              plays={data.plays}
              onAdd={() => openPlay()}
              onEdit={openEditPlay}
              onOpenGame={openGameDetails}
              onOpenPerson={openPersonDetails}
              canEdit={isAdmin}
            />
          ) : view === "people" ? (
            <PeopleView
              people={data.people}
              plays={data.plays}
              onAdd={() => {
                setEditingPerson(undefined);
                setPersonModal(true);
              }}
              onEdit={(person) => {
                setEditingPerson(person);
                setPersonModal(true);
              }}
              onOpenGame={openGameDetails}
              canEdit={isAdmin}
            />
          ) : view === "loans" ? (
            <LoansView games={data.games} />
          ) : view === "sale" ? (
            <SaleView games={data.games} />
          ) : view === "stats" ? (
            <StatsView data={data} />
          ) : (
            <ImportView onToast={showToast} canEdit={isAdmin} />
          )}
        </div>
      </main>

      <nav className="mobile-nav">
        {navMain.slice(0, 4).map((item) => (
          <button
            className={view === item.id ? "active" : ""}
            key={item.id}
            onClick={() => navigate(item.id)}
            type="button"
          >
            <item.icon size={19} />
            <span>{item.label.split(" ")[0]}</span>
          </button>
        ))}
      </nav>
      {gameModal && (
        <GameModal
          people={data.people}
          editingGame={editingGame}
          onClose={() => {
            setGameModal(false);
            setEditingGame(undefined);
          }}
          onSaved={() =>
            refreshed(() => {
              setGameModal(false);
              setEditingGame(undefined);
            })
          }
          onToast={showToast}
        />
      )}
      {playModal && (
        <PlayModal
          games={data.games}
          people={data.people}
          initialGame={selectedGame}
          initialPlay={editingPlay}
          onClose={() => {
            setPlayModal(false);
            setEditingPlay(undefined);
            setSelectedGame(undefined);
          }}
          onSaved={() =>
            refreshed(() => {
              setPlayModal(false);
              setEditingPlay(undefined);
              setSelectedGame(undefined);
            })
          }
          onToast={showToast}
        />
      )}
      {personModal && (
        <PersonModal
          editingPerson={editingPerson}
          onClose={() => {
            setPersonModal(false);
            setEditingPerson(undefined);
          }}
          onSaved={() =>
            refreshed(() => {
              setPersonModal(false);
              setEditingPerson(undefined);
            })
          }
          onToast={showToast}
        />
      )}
      {loginModal && (
        <LoginModal
          onClose={() => setLoginModal(false)}
          onAuthenticated={(name) => {
            setAdminName(name);
            setIsAdmin(true);
          }}
          onToast={showToast}
        />
      )}
      {toast && (
        <div className={`toast ${toast.error ? "error" : ""}`}>
          <span>{toast.error ? <X size={16} /> : <Check size={16} />}</span>
          {toast.message}
        </div>
      )}
    </div>
  );
}
