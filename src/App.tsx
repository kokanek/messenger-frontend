import { BrowserRouter, Routes, Route } from "react-router";
import { AppShell } from "@/components/AppShell";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import ConversationListPage from "@/pages/ConversationListPage";
import ConversationPage from "@/pages/ConversationPage";
import LoginPage from "@/pages/LoginPage";
import NewConversationPage from "@/pages/NewConversationPage";
import Settings from "@/pages/Settings";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route element={<ProtectedRoute />}>
          <Route element={<AppShell />}>
            <Route path="/" element={<ConversationListPage />} />
            <Route path="/new" element={<NewConversationPage />} />
            <Route path="/conversations/:conversationId" element={<ConversationPage />} />
            <Route path="/settings" element={<Settings />} />
          </Route>
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
