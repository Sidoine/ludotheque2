"use client";

import styled from "@emotion/styled";
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
import { usePathname, useRouter } from "next/navigation";
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

const AppShell = styled.div`
  min-height: 100vh;
`;

const Sidebar = styled.aside<{ $open: boolean }>`
  position: fixed;
  z-index: 40;
  inset: 0 auto 0 0;
  width: 248px;
  display: flex;
  flex-direction: column;
  padding: 27px 18px 19px;
  color: #f8fbf9;
  background: var(--forest-dark);
  box-shadow: 7px 0 35px rgba(26, 51, 41, 0.08);

  @media (max-width: 680px) {
    transform: translateX(${({ $open }) => ($open ? "0" : "-100%")});
    transition: transform 0.2s ease;
  }
`;

const Brand = styled.div`
  display: flex;
  align-items: center;
  gap: 11px;
  padding: 0 8px 28px;

  & > span {
    width: 39px;
    height: 39px;
    display: grid;
    place-items: center;
    border-radius: 12px;
    color: var(--forest-dark);
    background: #e7d8aa;
    transform: rotate(-3deg);
  }

  & > div {
    display: flex;
    align-items: baseline;
    gap: 4px;
    font-family: var(--serif);
    font-size: 21px;
  }

  em {
    color: #d9c98f;
    font-weight: 400;
  }

  & > button {
    display: none;
  }

  @media (max-width: 680px) {
    & > button {
      display: grid;
      margin-left: auto;
      border: 0;
      color: white;
      background: transparent;
    }
  }
`;

const SideNav = styled.nav`
  display: flex;
  flex-direction: column;
  gap: 4px;

  p {
    margin: 17px 12px 7px;
    color: rgba(255, 255, 255, 0.43);
    font-size: 10px;
    font-weight: 700;
    letter-spacing: 0.13em;
    text-transform: uppercase;
  }

  p:first-child {
    margin-top: 0;
  }
`;

const NavButton = styled.button<{ $active: boolean }>`
  width: 100%;
  min-height: 43px;
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 0 12px;
  border: 0;
  border-radius: 10px;
  color: ${({ $active }) => ($active ? "white" : "rgba(255, 255, 255, 0.7)")};
  background: ${({ $active }) =>
    $active ? "rgba(255, 255, 255, 0.105)" : "transparent"};
  box-shadow: ${({ $active }) => ($active ? "inset 3px 0 #d8c58c" : "none")};
  cursor: pointer;
  text-align: left;

  &:hover {
    color: white;
    background: rgba(255, 255, 255, 0.055);
  }

  span {
    flex: 1;
    font-size: 13px;
    font-weight: 550;
  }

  b {
    min-width: 22px;
    height: 20px;
    display: grid;
    place-items: center;
    padding: 0 6px;
    border-radius: 9px;
    color: rgba(255, 255, 255, 0.65);
    background: rgba(0, 0, 0, 0.15);
    font-size: 10px;
  }
`;

const AlertBadge = styled.b`
  color: #fff8e1 !important;
  background: #a96b4f !important;
`;

const SidebarTip = styled.div`
  position: relative;
  margin: auto 2px 18px;
  padding: 17px 15px 15px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 13px;
  color: rgba(255, 255, 255, 0.68);
  background: rgba(255, 255, 255, 0.045);

  & > span {
    position: absolute;
    top: -11px;
    right: 13px;
    width: 29px;
    height: 29px;
    display: grid;
    place-items: center;
    border-radius: 50%;
    color: #3b4b3e;
    background: #dfcf9c;
  }

  strong {
    display: block;
    margin-bottom: 5px;
    color: rgba(255, 255, 255, 0.9);
    font-family: var(--serif);
    font-size: 13px;
  }

  p {
    margin: 0;
    font-size: 11px;
    line-height: 1.55;
  }
`;

const Profile = styled.div`
  position: relative;
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 15px 7px 0;
  border-top: 1px solid rgba(255, 255, 255, 0.1);

  & > div {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 2px;
  }

  strong {
    font-size: 12px;
  }
  span {
    color: rgba(255, 255, 255, 0.43);
    font-size: 10px;
  }
`;

const ProfileButton = styled.button`
  display: grid;
  place-items: center;
  padding: 4px;
  border: 0;
  color: rgba(255, 255, 255, 0.4);
  background: transparent;
  cursor: pointer;

  &:hover {
    color: white;
  }
`;

const ProfileMenu = styled.div`
  position: absolute;
  right: 0;
  bottom: 48px;
  z-index: 5;
  min-width: 148px;
  padding: 5px;
  border: 1px solid var(--line);
  border-radius: 9px;
  background: var(--paper);
  box-shadow: 0 10px 25px rgba(24, 39, 30, 0.18);

  button {
    width: 100%;
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 9px 10px;
    border: 0;
    border-radius: 6px;
    color: var(--ink);
    background: transparent;
    font-size: 11px;
    font-weight: 700;
    text-align: left;
    cursor: pointer;
  }

  button:hover {
    background: #f0eee7;
  }
`;

const SidebarScrim = styled.button`
  display: none;

  @media (max-width: 680px) {
    position: fixed;
    z-index: 30;
    inset: 0;
    display: block;
    border: 0;
    background: rgba(26, 39, 33, 0.35);
  }
`;

const MainContent = styled.main`
  min-height: 100vh;
  margin-left: 248px;

  @media (max-width: 680px) {
    margin-left: 0;
  }
`;

const Topbar = styled.header`
  min-height: 130px;
  display: flex;
  align-items: center;
  gap: 22px;
  padding: 28px clamp(28px, 3.5vw, 54px) 24px;
  border-bottom: 1px solid rgba(216, 212, 201, 0.7);
  background: rgba(245, 243, 237, 0.93);
`;

const MobileMenu = styled.button`
  display: none;

  @media (max-width: 680px) {
    width: 40px;
    height: 40px;
    display: grid;
    place-items: center;
    border: 1px solid var(--line);
    border-radius: 10px;
    background: white;
  }
`;

const PageTitle = styled.div`
  flex: 1;
  & > p {
    margin: 0 0 5px;
    color: var(--terracotta);
    font-size: 10px;
    font-weight: 750;
    letter-spacing: 0.12em;
    text-transform: uppercase;
  }
  h1 {
    margin: 0;
    font-family: var(--serif);
    font-size: clamp(27px, 2.4vw, 35px);
    font-weight: 500;
    line-height: 1.05;
  }
  & > span {
    display: block;
    margin-top: 8px;
    color: var(--muted);
    font-size: 12px;
  }
`;

const HeaderActions = styled.div`
  display: flex;
  align-items: center;
  gap: 9px;
`;

const ActionButton = styled.button<{ $kind: "primary" | "secondary" }>`
  min-height: 40px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 0 15px;
  border-radius: 9px;
  font-size: 12px;
  font-weight: 700;
  cursor: pointer;
  transition: 0.15s;
  border: 1px solid
    ${({ $kind }) => ($kind === "primary" ? "var(--forest)" : "#d7d5ce")};
  color: ${({ $kind }) => ($kind === "primary" ? "white" : "#4e5b55")};
  background: ${({ $kind }) =>
    $kind === "primary" ? "var(--forest)" : "rgba(255,255,255,0.72)"};

  &:hover:not(:disabled) {
    background: ${({ $kind }) =>
      $kind === "primary" ? "var(--forest-dark)" : "white"};
  }
`;

const PageContent = styled.div`
  max-width: 1530px;
  margin: 0 auto;
  padding: 28px clamp(28px, 3.5vw, 54px) 54px;
`;

const MobileNav = styled.nav`
  display: none;

  @media (max-width: 680px) {
    position: fixed;
    z-index: 30;
    right: 0;
    bottom: 0;
    left: 0;
    height: 64px;
    display: flex;
    align-items: stretch;
    border-top: 1px solid var(--line);
    background: rgba(255, 254, 250, 0.96);
    backdrop-filter: blur(10px);

    button {
      flex: 1;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      gap: 3px;
      border: 0;
      color: #87908b;
      background: transparent;
      font-size: 8px;
    }
  }
`;

const Toast = styled.div<{ $error: boolean }>`
  position: fixed;
  z-index: 200;
  right: 24px;
  bottom: 24px;
  min-height: 48px;
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 12px 16px;
  border-radius: 10px;
  color: white;
  background: ${({ $error }) => ($error ? "#a35341" : "var(--forest)")};
  box-shadow: var(--shadow);
`;

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
  const pathname = usePathname();
  const router = useRouter();
  const pathSegments = pathname.split("/").filter(Boolean);
  const pathView = pathSegments[0];
  const parsedDetailsId = Number(pathSegments[1]);
  const detailsId = Number.isInteger(parsedDetailsId) ? parsedDetailsId : null;
  const view: View =
    pathView && pathView in pageTitles ? (pathView as View) : "dashboard";
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
    if (view === "games" && detailsId) {
      setDetailsGame(data.games.find((game) => game.id === detailsId));
      setDetailsPerson(undefined);
      return;
    }
    if (view === "people" && detailsId) {
      setDetailsPerson(data.people.find((person) => person.id === detailsId));
      setDetailsGame(undefined);
      return;
    }
    setDetailsGame(undefined);
    setDetailsPerson(undefined);
  }, [data.games, data.people, detailsId, view]);

  function showToast(message: string, error = false) {
    setToast({ message, error });
    window.setTimeout(() => setToast(null), 3600);
  }
  function navigate(next: View) {
    setSidebarOpen(false);
    router.push(next === "dashboard" ? "/" : `/${next}`);
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
    setSidebarOpen(false);
    router.push(`/games/${gameId}`);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }
  function openPersonDetails(personId: number) {
    const person = data.people.find((item) => item.id === personId);
    if (!person) return;
    setSidebarOpen(false);
    router.push(`/people/${personId}`);
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
    <AppShell>
      <Sidebar $open={sidebarOpen}>
        <Brand>
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
        </Brand>
        <SideNav>
          <p>Mon espace</p>
          {navMain.map((item) => (
            <NavButton
              $active={view === item.id}
              key={item.id}
              type="button"
              onClick={() => navigate(item.id)}
            >
              <item.icon size={18} />
              <span>{item.label}</span>
              {item.id === "games" && <b>{data.stats.gameCount}</b>}
              {item.id === "loans" && data.stats.activeLoanCount > 0 && (
                <AlertBadge>{data.stats.activeLoanCount}</AlertBadge>
              )}
            </NavButton>
          ))}
          <p>Explorer</p>
          <NavButton
            $active={view === "stats"}
            type="button"
            onClick={() => navigate("stats")}
          >
            <BarChart3 size={18} />
            <span>Statistiques</span>
          </NavButton>
          <NavButton
            $active={view === "import"}
            type="button"
            onClick={() => navigate("import")}
          >
            <FileArchive size={18} />
            <span>Importer Notion</span>
          </NavButton>
        </SideNav>
        <SidebarTip>
          <span>
            <Sparkles size={17} />
          </span>
          <strong>Le saviez-vous ?</strong>
          <p>
            Ajoutez le lien BGG d’un jeu pour remplir sa fiche automatiquement.
          </p>
        </SidebarTip>
        <Profile>
          <Avatar
            person={{ name: isAdmin ? adminName : "Anonyme", color: "#436F5B" }}
          />
          <div>
            <strong>{isAdmin ? adminName : "Anonyme"}</strong>
            <span>{isAdmin ? "Administrateur" : "Lecture seule"}</span>
          </div>
          <ProfileButton
            type="button"
            aria-label="Ouvrir le menu du profil"
            aria-expanded={profileMenuOpen}
            onClick={() => setProfileMenuOpen((open) => !open)}
          >
            <MoreHorizontal size={18} />
          </ProfileButton>
          {profileMenuOpen && (
            <ProfileMenu>
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
            </ProfileMenu>
          )}
        </Profile>
      </Sidebar>
      {sidebarOpen && (
        <SidebarScrim
          type="button"
          aria-label="Fermer le menu"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <MainContent>
        <Topbar>
          <MobileMenu type="button" onClick={() => setSidebarOpen(true)}>
            <Menu size={21} />
          </MobileMenu>
          <PageTitle>
            <p>{view === "dashboard" ? currentDate : "Ludothèque"}</p>
            <h1>{title.title}</h1>
            <span>{title.subtitle}</span>
          </PageTitle>
          <HeaderActions>
            {isAdmin ? (
              <>
                {view !== "import" && (
                  <ActionButton
                    $kind="secondary"
                    type="button"
                    onClick={() => navigate("import")}
                  >
                    <Upload size={17} /> Importer
                  </ActionButton>
                )}
                {view === "plays" ? (
                  <ActionButton
                    $kind="primary"
                    type="button"
                    onClick={() => openPlay()}
                  >
                    <Plus size={17} /> Ajouter une partie
                  </ActionButton>
                ) : (
                  <>
                    <ActionButton
                      $kind="secondary"
                      type="button"
                      onClick={() => openPlay()}
                    >
                      <Plus size={17} /> Ajouter une partie
                    </ActionButton>
                    <ActionButton
                      $kind="primary"
                      type="button"
                      onClick={() => setGameModal(true)}
                    >
                      <Plus size={17} /> Ajouter un jeu
                    </ActionButton>
                  </>
                )}
              </>
            ) : (
              <ActionButton
                $kind="secondary"
                type="button"
                onClick={() => setLoginModal(true)}
              >
                <LogIn size={17} /> Se connecter
              </ActionButton>
            )}
          </HeaderActions>
        </Topbar>

        <PageContent>
          {detailsPerson ? (
            <PersonDetailsPage
              person={detailsPerson}
              plays={data.plays}
              canEdit={isAdmin}
              onOpenGame={openGameDetails}
              onBack={() => navigate("people")}
              onEdit={(person) => {
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
              onBack={() => navigate("games")}
              onEdit={(game) => {
                setEditingGame(game);
                setGameModal(true);
              }}
              onPlay={openPlay}
              onToast={showToast}
              onChanged={() => router.refresh()}
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
              onPlay={openPlay}
              onOpenGame={openGameDetails}
              onOpenPerson={openPersonDetails}
              canEdit={isAdmin}
              onEdit={(game) => {
                setEditingGame(game);
                setGameModal(true);
              }}
              onDelete={deleteGame}
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
              onOpenPerson={openPersonDetails}
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
        </PageContent>
      </MainContent>

      <MobileNav>
        {navMain.slice(0, 4).map((item) => (
          <button
            aria-current={view === item.id ? "page" : undefined}
            key={item.id}
            onClick={() => navigate(item.id)}
            type="button"
          >
            <item.icon size={19} />
            <span>{item.label.split(" ")[0]}</span>
          </button>
        ))}
      </MobileNav>
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
        <Toast $error={toast.error}>
          <span>{toast.error ? <X size={16} /> : <Check size={16} />}</span>
          {toast.message}
        </Toast>
      )}
    </AppShell>
  );
}
