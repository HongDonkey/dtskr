import { StrictMode, Suspense } from 'react'
import { createRoot } from 'react-dom/client'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { BrowserRouter, Route, Routes } from 'react-router-dom'
import '@fontsource/noto-sans-kr/600.css'
import '@fontsource/noto-sans-jp/600.css'
import './index.css'
import './styles/request-board-components.css'
import './i18n'
import App from './App'
import { AdminLoginPage, AdminRequestBoardPage, DigimonDetailPage, HomePage, PatchNotesPage, PrivacyPolicyPage, QuestBoardPage, RequestBoardPage } from './routes'

const queryClient = new QueryClient()

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Suspense fallback={<div className="route-loading" aria-live="polite">Loading...</div>}>
        <Routes>
          <Route path="/" element={<App />}>
            <Route index element={<HomePage />} />
            <Route path="digimons/:id" element={<DigimonDetailPage />} />
            <Route path="quests" element={<QuestBoardPage />} />
            <Route path="quests/:questId" element={<QuestBoardPage />} />
            <Route path="patch-notes" element={<PatchNotesPage />} />
            <Route path="requests" element={<RequestBoardPage />} />
            <Route path="admin/login" element={<AdminLoginPage />} />
            <Route path="admin/requests" element={<AdminRequestBoardPage />} />
            <Route path="privacy" element={<PrivacyPolicyPage />} />
          </Route>
        </Routes>
        </Suspense>
      </BrowserRouter>
    </QueryClientProvider>
  </StrictMode>
)
