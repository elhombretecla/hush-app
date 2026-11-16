import { Navigate, Route, Routes } from "react-router-dom";
import { AppShell } from "./AppShell";
import { HomePage } from "../pages/HomePage";
import { InboxPage } from "../pages/InboxPage";
import { LibraryPage } from "../pages/LibraryPage";
import { ReaderPage } from "../pages/ReaderPage";
import { CollectionsPage } from "../pages/CollectionsPage";
import { CollectionDetailPage } from "../pages/CollectionDetailPage";
import { HighlightsPage } from "../pages/HighlightsPage";
import { FocusPage } from "../pages/FocusPage";
import { SearchPage } from "../pages/SearchPage";
import { PreferencesPage } from "../pages/PreferencesPage";

export function App() {
  return (
    <Routes>
      <Route path="/read/:id" element={<ReaderPage />} />
      <Route element={<AppShell />}>
        <Route index element={<HomePage />} />
        <Route path="inbox" element={<InboxPage />} />
        <Route path="library" element={<LibraryPage />} />
        <Route path="collections" element={<CollectionsPage />} />
        <Route path="collections/:id" element={<CollectionDetailPage />} />
        <Route path="highlights" element={<HighlightsPage />} />
        <Route path="focus" element={<FocusPage />} />
        <Route path="search" element={<SearchPage />} />
        <Route path="preferences" element={<PreferencesPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  );
}
