import { useEffect, useState } from 'react';
import { useParams, Link, Navigate } from 'react-router-dom';
import { fetchPostBySlug } from '../api/blogApi';
import type { BlogPost } from '../api/blogApi';
import { BlogContent } from '../components/BlogContent';
import { ShareButtons } from '../components/ShareButtons';
import { LoadingBlock } from '../../../components/ui/Spinner';

function formatDate(iso: string | null): string {
  if (!iso) return '';
  return new Date(iso).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' });
}

export function BlogPostPage() {
  const { slug } = useParams<{ slug: string }>();
  const [post, setPost] = useState<BlogPost | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    if (!slug) return;
    setLoading(true);
    fetchPostBySlug(slug).then((data) => {
      if (!data) {
        setNotFound(true);
      } else {
        setPost(data);
        document.title = `${data.title} — Hamqar Blog`;
      }
      setLoading(false);
    });
  }, [slug]);

  if (loading) return <LoadingBlock label="Loading…" className="mx-auto max-w-2xl px-6" />;
  if (notFound || !post) return <Navigate to="/blog" replace />;

  const shareUrl = typeof window !== 'undefined' ? window.location.href : `https://hamqar.com/blog/${post.slug}`;

  return (
    <div className="mx-auto max-w-2xl px-6 py-10">
      <Link to="/blog" className="text-sm font-medium text-(--color-lapis) hover:underline">
        ← Blog
      </Link>

      {post.cover_image_url && (
        <img
          src={post.cover_image_url}
          alt=""
          className="mt-4 h-56 w-full rounded-(--radius-lg) object-cover"
        />
      )}

      <h1 className="mt-4 font-display text-3xl font-semibold text-(--color-ink)">{post.title}</h1>
      <p className="mt-2 text-sm text-(--color-muted)">
        {formatDate(post.published_at)}
        {post.author && ` · ${post.author}`}
      </p>

      <div className="mt-4">
        <ShareButtons url={shareUrl} title={post.title} />
      </div>

      <div className="mt-6">
        <BlogContent content={post.content} />
      </div>

      <div className="mt-8 border-t border-(--color-line) pt-4">
        <ShareButtons url={shareUrl} title={post.title} />
      </div>
    </div>
  );
}
