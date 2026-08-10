import { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { useIsAdmin } from '../hooks/useIsAdmin';
import {
  fetchAllPostsForAdmin,
  createPost,
  updatePost,
  deletePost,
  slugify,
} from '../../blog/api/blogApi';
import type { BlogPost, BlogPostInput } from '../../blog/api/blogApi';
import { AdminNav } from '../components/AdminNav';
import { LoadingBlock } from '../../../components/ui/Spinner';
import { btnPrimary, btnSecondarySm, btnDangerOutlineSm } from '../../../components/ui/buttonStyles';
import { IconPlus, IconTrash } from '../../../components/ui/icons';

const EMPTY_DRAFT: BlogPostInput = {
  slug: '',
  title: '',
  excerpt: '',
  content: '',
  cover_image_url: '',
  author: '',
  published: false,
};

export function AdminBlogPage() {
  const { isAdmin, checking } = useIsAdmin();
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);
  const [draft, setDraft] = useState<BlogPostInput>(EMPTY_DRAFT);
  const [slugTouched, setSlugTouched] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isAdmin) return;
    load();
  }, [isAdmin]);

  async function load() {
    setLoading(true);
    const data = await fetchAllPostsForAdmin();
    setPosts(data);
    setLoading(false);
  }

  function startCreate() {
    setDraft(EMPTY_DRAFT);
    setSlugTouched(false);
    setEditingId(null);
    setCreating(true);
    setError(null);
  }

  function startEdit(post: BlogPost) {
    setDraft({
      slug: post.slug,
      title: post.title,
      excerpt: post.excerpt ?? '',
      content: post.content,
      cover_image_url: post.cover_image_url ?? '',
      author: post.author ?? '',
      published: post.published,
    });
    setSlugTouched(true);
    setEditingId(post.id);
    setCreating(false);
    setError(null);
  }

  function cancel() {
    setCreating(false);
    setEditingId(null);
    setDraft(EMPTY_DRAFT);
  }

  function updateTitle(title: string) {
    setDraft((d) => ({ ...d, title, slug: slugTouched ? d.slug : slugify(title) }));
  }

  async function handleSave() {
    if (!draft.title.trim() || !draft.content.trim() || !draft.slug.trim()) {
      setError('Title, content, and slug are required.');
      return;
    }
    setSaving(true);
    setError(null);

    const input: BlogPostInput = {
      ...draft,
      excerpt: draft.excerpt?.trim() || null,
      cover_image_url: draft.cover_image_url?.trim() || null,
      author: draft.author?.trim() || null,
      slug: slugify(draft.slug),
    };

    const result = editingId
      ? await updatePost(editingId, input, posts.find((p) => p.id === editingId)?.published ?? false)
      : await createPost(input);

    setSaving(false);
    if (result.error) {
      setError(result.error);
      return;
    }
    cancel();
    load();
  }

  async function handleDelete(post: BlogPost) {
    if (!confirm(`Delete "${post.title}" permanently? This cannot be undone.`)) return;
    await deletePost(post.id);
    setPosts((prev) => prev.filter((p) => p.id !== post.id));
  }

  if (checking) return null;
  if (!isAdmin) return <Navigate to="/" replace />;

  const showForm = creating || editingId !== null;

  return (
    <div className="mx-auto max-w-4xl px-6 py-10">
      <AdminNav />
      <div className="flex items-center justify-between">
        <h1 className="font-display text-2xl font-semibold text-(--color-ink)">Admin — Blog</h1>
        {!showForm && (
          <button onClick={startCreate} className={btnPrimary}>
            <IconPlus />
            New post
          </button>
        )}
      </div>

      {showForm && (
        <div className="mt-4 rounded-(--radius-lg) border border-(--color-line) bg-(--color-paper-raised) p-4">
          <h2 className="text-sm font-semibold text-(--color-ink)">{editingId ? 'Edit post' : 'New post'}</h2>
          <div className="mt-3 space-y-2">
            <input
              className="w-full rounded border border-(--color-line) px-2 py-1.5 text-sm font-semibold"
              placeholder="Title *"
              value={draft.title}
              onChange={(e) => updateTitle(e.target.value)}
            />
            <div className="flex items-center gap-2">
              <span className="text-xs text-(--color-muted)">/blog/</span>
              <input
                className="flex-1 rounded border border-(--color-line) px-2 py-1.5 text-sm"
                placeholder="slug"
                value={draft.slug}
                onChange={(e) => {
                  setSlugTouched(true);
                  setDraft((d) => ({ ...d, slug: e.target.value }));
                }}
              />
            </div>
            <input
              className="w-full rounded border border-(--color-line) px-2 py-1.5 text-sm"
              placeholder="Excerpt (shown in the list)"
              value={draft.excerpt ?? ''}
              onChange={(e) => setDraft((d) => ({ ...d, excerpt: e.target.value }))}
            />
            <input
              className="w-full rounded border border-(--color-line) px-2 py-1.5 text-sm"
              placeholder="Cover image URL (optional)"
              value={draft.cover_image_url ?? ''}
              onChange={(e) => setDraft((d) => ({ ...d, cover_image_url: e.target.value }))}
            />
            <input
              className="w-full rounded border border-(--color-line) px-2 py-1.5 text-sm"
              placeholder="Author (optional)"
              value={draft.author ?? ''}
              onChange={(e) => setDraft((d) => ({ ...d, author: e.target.value }))}
            />
            <textarea
              className="w-full rounded border border-(--color-line) px-2 py-1.5 text-sm"
              placeholder="Content — leave a blank line between paragraphs *"
              rows={10}
              value={draft.content}
              onChange={(e) => setDraft((d) => ({ ...d, content: e.target.value }))}
            />
            <label className="flex items-center gap-2 text-sm text-(--color-ink)">
              <input
                type="checkbox"
                checked={draft.published}
                onChange={(e) => setDraft((d) => ({ ...d, published: e.target.checked }))}
              />
              Published (visible to everyone on /blog)
            </label>

            {error && <p className="text-sm text-(--color-danger)">{error}</p>}

            <div className="flex flex-wrap gap-2 pt-1">
              <button onClick={handleSave} disabled={saving} className={btnPrimary}>
                {saving ? 'Saving…' : 'Save'}
              </button>
              <button onClick={cancel} className={btnSecondarySm}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {loading ? (
        <LoadingBlock label="Loading posts…" />
      ) : (
        <div className="mt-6 space-y-2">
          {posts.length === 0 && <p className="text-sm text-(--color-muted)">No posts yet.</p>}
          {posts.map((post) => (
            <div
              key={post.id}
              className="flex flex-wrap items-center justify-between gap-2 rounded-(--radius-md) border border-(--color-line) bg-(--color-paper-raised) p-3"
            >
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-(--color-ink)">{post.title}</span>
                  <span
                    className={`rounded-full px-2 py-0.5 text-[11px] font-medium ${
                      post.published
                        ? 'bg-(--color-success)/10 text-(--color-success)'
                        : 'bg-(--color-muted)/10 text-(--color-muted)'
                    }`}
                  >
                    {post.published ? 'Published' : 'Draft'}
                  </span>
                </div>
                <p className="text-xs text-(--color-muted)">/blog/{post.slug}</p>
              </div>
              <div className="flex gap-2">
                <button onClick={() => startEdit(post)} className={btnSecondarySm}>
                  Edit
                </button>
                <button onClick={() => handleDelete(post)} className={btnDangerOutlineSm}>
                  <IconTrash />
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
