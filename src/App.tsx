import { lazy, Suspense, useEffect } from 'react';
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { LanguageProvider } from './lib/i18n/LanguageContext';
import { AuthProvider } from './lib/auth/AuthContext';
import { initAnalytics, trackPageView } from './lib/analytics/ga';
import { setCanonicalPath } from './lib/seo/head';
import { Header } from './components/layout/Header';
import { Footer } from './components/layout/Footer';
import { HomePage } from './modules/home/pages/HomePage';
import { PricingPage } from './modules/pricing/pages/PricingPage';
import { GuidePage } from './modules/guide/pages/GuidePage';
import { AuthPage } from './modules/auth/pages/AuthPage';
import { AdminDocumentsPage } from './modules/admin/pages/AdminDocumentsPage';
import { AdminBlogPage } from './modules/admin/pages/AdminBlogPage';
import { AdminOrdersPage } from './modules/admin/pages/AdminOrdersPage';
import { AdminDashboardPage } from './modules/admin/pages/AdminDashboardPage';
import { ProfilePage } from './modules/profile/pages/ProfilePage';
import { BlogListPage } from './modules/blog/pages/BlogListPage';
import { BlogPostPage } from './modules/blog/pages/BlogPostPage';
import { PrivacyPolicyPage } from './modules/legal/pages/PrivacyPolicyPage';
import { TermsPage } from './modules/legal/pages/TermsPage';

// Lazy-loaded: pulls in jsPDF (~250KB gzipped), the single biggest chunk
// in the app, so visitors who only want to read the pricing or guide
// pages never pay for it. See CHANGES.md "Bundle size" note.
const CvBuilderPage = lazy(() =>
  import('./modules/cv/pages/CvBuilderPage').then((m) => ({ default: m.CvBuilderPage }))
);

// Same reasoning as CvBuilderPage — pulls in jsPDF just for the download.
const CoverLetterBuilderPage = lazy(() =>
  import('./modules/coverLetter/pages/CoverLetterBuilderPage').then((m) => ({ default: m.CoverLetterBuilderPage }))
);

// Also lazy-loaded: pulls in pdf-lib (for the merge-and-download feature),
// which alone added ~350KB gzipped to the main bundle when this page was
// eagerly imported.
const DocumentsPage = lazy(() =>
  import('./modules/documents/pages/DocumentsPage').then((m) => ({ default: m.DocumentsPage }))
);

// Pulls in the image-upload/compression path for the payment screenshot,
// same reasoning as DocumentsPage — kept out of the main bundle.
const OrderPage = lazy(() =>
  import('./modules/orders/pages/OrderPage').then((m) => ({ default: m.OrderPage }))
);

// Renders the same CvPreview/CoverLetterPreview components as the
// builders — lightweight on their own, but no reason to ship them to
// every visitor eagerly when this page isn't part of the core flow.
const ExamplesPage = lazy(() =>
  import('./modules/examples/pages/ExamplesPage').then((m) => ({ default: m.ExamplesPage }))
);

function RouteFallback() {
  return (
    <div className="mx-auto max-w-3xl px-6 py-16 text-center text-sm text-(--color-muted)">Loading…</div>
  );
}

// Fires a GA page_view and updates the canonical URL on every client-side
// route change — neither happens automatically since React Router never
// triggers a real page navigation. Both no-op harmlessly if analytics
// isn't configured (see src/lib/analytics/ga.ts); the canonical update
// always runs regardless, since that's not tied to analytics being on.
function AnalyticsListener() {
  const location = useLocation();

  useEffect(() => {
    initAnalytics();
  }, []);

  useEffect(() => {
    trackPageView(location.pathname + location.search, document.title);
    setCanonicalPath(location.pathname);
  }, [location]);

  return null;
}

function App() {
  return (
    <LanguageProvider>
      <AuthProvider>
        <BrowserRouter basename={import.meta.env.BASE_URL}>
          <AnalyticsListener />
          <div className="flex min-h-screen flex-col bg-(--color-paper)">
            <Header />
            <main className="flex-1">
              <Routes>
                <Route path="/" element={<HomePage />} />
                <Route path="/pricing" element={<PricingPage />} />
                <Route
                  path="/examples"
                  element={
                    <Suspense fallback={<RouteFallback />}>
                      <ExamplesPage />
                    </Suspense>
                  }
                />
                <Route path="/guide" element={<GuidePage />} />
                <Route
                  path="/cv-builder"
                  element={
                    <Suspense fallback={<RouteFallback />}>
                      <CvBuilderPage />
                    </Suspense>
                  }
                />
                <Route
                  path="/cover-letter"
                  element={
                    <Suspense fallback={<RouteFallback />}>
                      <CoverLetterBuilderPage />
                    </Suspense>
                  }
                />
                <Route
                  path="/order"
                  element={
                    <Suspense fallback={<RouteFallback />}>
                      <OrderPage />
                    </Suspense>
                  }
                />
                <Route path="/sign-in" element={<AuthPage />} />
                <Route path="/profile" element={<ProfilePage />} />
                <Route path="/admin" element={<AdminDashboardPage />} />
                <Route path="/admin/orders" element={<AdminOrdersPage />} />
                <Route path="/admin/documents" element={<AdminDocumentsPage />} />
                <Route path="/admin/blog" element={<AdminBlogPage />} />
                <Route path="/blog" element={<BlogListPage />} />
                <Route path="/blog/:slug" element={<BlogPostPage />} />
                <Route path="/privacy" element={<PrivacyPolicyPage />} />
                <Route path="/terms" element={<TermsPage />} />
                <Route path="/documents" element={
                  <Suspense fallback={<RouteFallback />}>
                    <DocumentsPage />
                  </Suspense>
                } />
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
