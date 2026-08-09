import { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { LanguageProvider } from './lib/i18n/LanguageContext';
import { AuthProvider } from './lib/auth/AuthContext';
import { Header } from './components/layout/Header';
import { Footer } from './components/layout/Footer';
import { JobBoardPage } from './modules/jobs/pages/JobBoardPage';
import { JobDetailPage } from './modules/jobs/pages/JobDetailPage';
import { SavedJobsPage } from './modules/jobs/pages/SavedJobsPage';
import { JobAlertsPage } from './modules/jobs/pages/JobAlertsPage';
import { AuthPage } from './modules/auth/pages/AuthPage';
import { AdminJobsPage } from './modules/admin/pages/AdminJobsPage';
import { AdminDocumentsPage } from './modules/admin/pages/AdminDocumentsPage';
import { DocumentsPage } from './modules/documents/pages/DocumentsPage';

// Lazy-loaded: pulls in jsPDF + html2canvas (~250KB gzipped), the single
// biggest chunk in the app, so visitors who only want the job board never
// pay for it. See CHANGES.md "Bundle size" note.
const CvBuilderPage = lazy(() =>
  import('./modules/cv/pages/CvBuilderPage').then((m) => ({ default: m.CvBuilderPage }))
);

function RouteFallback() {
  return (
    <div className="mx-auto max-w-3xl px-6 py-16 text-center text-sm text-(--color-muted)">Loading…</div>
  );
}

function App() {
  return (
    <LanguageProvider>
      <AuthProvider>
        <BrowserRouter basename={import.meta.env.BASE_URL}>
          <div className="flex min-h-screen flex-col bg-(--color-paper)">
            <Header />
            <main className="flex-1">
              <Routes>
                <Route path="/" element={<JobBoardPage />} />
                <Route path="/jobs/:id" element={<JobDetailPage />} />
                <Route
                  path="/cv-builder"
                  element={
                    <Suspense fallback={<RouteFallback />}>
                      <CvBuilderPage />
                    </Suspense>
                  }
                />
                <Route path="/saved" element={<SavedJobsPage />} />
                <Route path="/job-alerts" element={<JobAlertsPage />} />
                <Route path="/sign-in" element={<AuthPage />} />
                <Route path="/admin" element={<AdminJobsPage />} />
                <Route path="/admin/documents" element={<AdminDocumentsPage />} />
                <Route path="/documents" element={<DocumentsPage />} />
              </Routes>
            </main>
            <Footer />
          </div>
        </BrowserRouter>
      </AuthProvider>
    </LanguageProvider>
  );
}

export default App;
