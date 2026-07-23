import { Flame } from "lucide-react";
import { AppProvider, useApp } from "./context/AppContext";
import Nav from "./components/Nav";
import Drawer from "./components/Drawer";
import Toasts from "./components/Toasts";
import Footer from "./components/Footer";
import ShareModal from "./components/modals/ShareModal";
import RewardModal from "./components/modals/RewardModal";
import AuthModal from "./components/modals/AuthModal";
import DeleteConfirmModal from "./components/modals/DeleteConfirmModal";
import HomePage from "./pages/HomePage";
import RoastPage from "./pages/RoastPage";
import BattlePage from "./pages/BattlePage";
import ChallengesPage from "./pages/ChallengesPage";
import LeaderboardPage from "./pages/LeaderboardPage";
import RewardsPage from "./pages/RewardsPage";
import ProfilePage from "./pages/ProfilePage";
import SettingsPage from "./pages/SettingsPage";

const PAGES = {
  home: HomePage,
  roast: RoastPage,
  battle: BattlePage,
  challenges: ChallengesPage,
  leaderboard: LeaderboardPage,
  rewards: RewardsPage,
  profile: ProfilePage,
  settings: SettingsPage,
};

function Shell() {
  const { darkMode, handlePagePointerMove, sessionChecked, page } = useApp();
  const PageComponent = PAGES[page] || HomePage;

  return (
    <div
      data-theme={darkMode ? "dark" : "light"}
      onMouseMove={handlePagePointerMove}
      className="min-h-screen w-full c-text-text-1 font-[Manrope,sans-serif] overflow-x-hidden relative transition-colors duration-300"
    >
      <div className="page-bg fixed inset-0 -z-10" />

      {!sessionChecked && (
        <div className="fixed inset-0 z-[100] flex flex-col items-center justify-center page-bg">
          <div style={{ perspective: "300px" }}>
            <div className="w-16 h-16 rounded-2xl flame-grad flex items-center justify-center logo-3d splash-pulse">
              <Flame size={28} className="text-white" fill="white" />
            </div>
          </div>
          <p className="font-display font-600 text-sm c-text-text-2 mt-4">Loading your session…</p>
        </div>
      )}

      <Nav />
      <Drawer />

      <PageComponent />

      <Footer />
      <Toasts />
      <RewardModal />
      <ShareModal />
      <AuthModal />
      <DeleteConfirmModal />
    </div>
  );
}

export default function App() {
  return (
    <AppProvider>
      <Shell />
    </AppProvider>
  );
}
