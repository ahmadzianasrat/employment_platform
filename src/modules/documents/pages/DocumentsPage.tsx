import { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../../lib/auth/AuthContext';
import { useLanguage } from '../../../lib/i18n/LanguageContext';
import { fetchUserDocuments } from '../api/documentsApi';
import { DOCUMENT_TYPES } from '../data/documentTypes';
import { DocumentTypeSection } from '../components/DocumentTypeSection';
import { BulkUploadZone } from '../components/BulkUploadZone';
import { AllInOneUpload, ALL_IN_ONE_TYPE } from '../components/AllInOneUpload';
import { MergeAndDownloadButton } from '../components/MergeAndDownloadButton';
import { LoadingBlock } from '../../../components/ui/Spinner';
import type { DocumentEntry } from '../types/document';

export function DocumentsPage() {
  const { user, loading: authLoading } = useAuth();
  const { tr } = useLanguage();
  const [entries, setEntries] = useState<DocumentEntry[]>([]);
  const [loading, setLoading] = useState(true);

  async function reload() {
    if (!user) return;
    const data = await fetchUserDocuments(user.id);
    setEntries(data);
    setLoading(false);
  }

  useEffect(() => {
    reload();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  if (authLoading) return null;
  if (!user) return <Navigate to="/sign-in" replace />;

  const allInOneEntry = entries.find((e) => e.document_type === ALL_IN_ONE_TYPE);
  const typedEntries = entries.filter((e) => e.document_type !== ALL_IN_ONE_TYPE);

  return (
    <div className="mx-auto max-w-4xl px-6 py-10">
      <h1 className="font-display text-2xl font-semibold text-(--color-ink)">{tr('documents', 'title')}</h1>
      <p className="mt-1 text-(--color-muted)">{tr('documents', 'subtitle')}</p>

      {loading ? (
        <LoadingBlock label={tr('common', 'loading')} />
      ) : (
        <div className="mt-8 space-y-6">
          <AllInOneUpload userId={user.id} entry={allInOneEntry} onChanged={reload} />

          <BulkUploadZone userId={user.id} onUploaded={reload} />

          {DOCUMENT_TYPES.map((typeConfig) => (
            <DocumentTypeSection
              key={typeConfig.key}
              typeConfig={typeConfig}
              entries={entries.filter((e) => e.document_type === typeConfig.key)}
              userId={user.id}
              onChanged={reload}
            />
          ))}

          <MergeAndDownloadButton entries={typedEntries} />
        </div>
      )}
    </div>
  );
}
