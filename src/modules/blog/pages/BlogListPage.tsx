import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { fetchPublishedPosts } from '../api/blogApi';
import type { BlogPost } from '../api/blogApi';
import { LoadingBlock } from '../../../components/ui/Spinner';

function formatDate(iso: string | null): string {
  if (!iso) return '';
  return new Date(iso).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' });
}

export function BlogListPage() {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPublishedPosts().then((data) => {
      setPosts(data);
      setLoading(false);
    });
  }, []);

  return (
    <div className="mx-auto max-w-3xl px-6 py-10">
      <h1 className="font-display text-2xl font-semibold text-(--color-ink)">Blog</h1>
      <p className="mt-1 text-(--color-muted)">Tips, updates, and stories for Afghan job seekers.</p>

      {loading ? (
        <LoadingBlock label="Loading posts…" />
      ) : posts.length === 0 ? (
        <p className="mt-8 text-sm text-(--color-muted)">No posts yet — check back soon.</p>
      ) : (
        <div className="mt-8 space-y-5">
          {posts.map((post) => (
            <Link
              key={post.id}
              to={`/blog/${post.slug}`}
              className="block rounded-(--radius-lg) border border-(--color-line) bg-(--color-paper-raised) p-5 transition-shadow hover:shadow-md"
            >
              {post.cover_image_url && (
                <img
                  src={post.cover_image_url}
                  alt=""
                  className="mb-3 h-40 w-full rounded-(--radius-md) object-cover"
                />
              )}
              <h2 className="font-display text-lg font-semibold text-(--color-ink)">{post.title}</h2>
              <p className="mt-1 text-xs text-(--color-muted)">
                {formatDate(post.published_at)}
                {post.author && ` · ${post.author}`}
              </p>
              {post.excerpt && <p className="mt-2 text-sm text-(--color-muted)">{post.excerpt}</p>}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
