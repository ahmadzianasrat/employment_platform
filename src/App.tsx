import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { LanguageProvider } from './lib/i18n/LanguageContext';
import { AuthProvider } from './lib/auth/AuthContext';
import { Header } from './components/layout/Header';
import { Footer } from './components/layout/Footer';
import { JobBoardPage } from './modules/jobs/pages/JobBoardPage';
import { JobDetailPage } from './modules/jobs/pages/JobDetailPage';
import { SavedJobsPage } from './modules/jobs/pages/SavedJobsPage';
import { CvBuilderPage } from './modules/cv/pages/CvBuilderPage';
import { AuthPage } from './modules/auth/pages/AuthPage';
import { AdminJobsPage } from './modules/admin/pages/AdminJobsPage';

function App() {
  return (
    <LanguageProvider>
      <AuthProvider>
        <BrowserRouter>
          <div className="flex min-h-screen flex-col bg-[var(--color-paper)]">
            <Header />
            <main className="flex-1">
              <Routes>
                <Route path="/" element={<JobBoardPage />} />
                <Route path="/jobs/:id" element={<JobDetailPage />} />
                <Route path="/cv-builder" element={<CvBuilderPage />} />
                <Route path="/saved" element={<SavedJobsPage />} />
                <Route path="/sign-in" element={<AuthPage />} />
                <Route path="/admin" element={<AdminJobsPage />} />
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
