import { supabase } from '../../../lib/supabase/client';

export interface BlogPost {
  id: string;
  slug: string;
  title: string;
  excerpt: string | null;
  content: string;
  cover_image_url: string | null;
  author: string | null;
  published: boolean;
  created_at: string;
  updated_at: string;
  published_at: string | null;
}

export async function fetchPublishedPosts(): Promise<BlogPost[]> {
  const { data, error } = await supabase
    .from('blog_posts')
    .select('*')
    .eq('published', true)
    .order('published_at', { ascending: false });
  if (error || !data) return [];
  return data as BlogPost[];
}

export async function fetchPostBySlug(slug: string): Promise<BlogPost | null> {
  const { data, error } = await supabase.from('blog_posts').select('*').eq('slug', slug).maybeSingle();
  if (error || !data) return null;
  return data as BlogPost;
}

// --- Admin ---

export async function fetchAllPostsForAdmin(): Promise<BlogPost[]> {
  const { data, error } = await supabase.from('blog_posts').select('*').order('created_at', { ascending: false });
  if (error) throw error;
  return (data ?? []) as BlogPost[];
}

export function slugify(title: string): string {
  return title
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .slice(0, 180);
}

export interface BlogPostInput {
  slug: string;
  title: string;
  excerpt: string | null;
  content: string;
  cover_image_url: string | null;
  author: string | null;
  published: boolean;
}

export async function createPost(input: BlogPostInput): Promise<{ error: string | null; id: string | null }> {
  const { data, error } = await supabase
    .from('blog_posts')
    .insert({ ...input, published_at: input.published ? new Date().toISOString() : null })
    .select('id')
    .single();
  return { error: error?.message ?? null, id: data?.id ?? null };
}

export async function updatePost(id: string, input: BlogPostInput, wasPublished: boolean): Promise<{ error: string | null }> {
  const patch: Partial<BlogPostInput> & { updated_at: string; published_at?: string | null } = {
    ...input,
    updated_at: new Date().toISOString(),
  };
  // Only stamp published_at the moment a post transitions draft -> published, don't keep bumping it on every edit.
  if (input.published && !wasPublished) {
    patch.published_at = new Date().toISOString();
  }
  const { error } = await supabase.from('blog_posts').update(patch).eq('id', id);
  return { error: error?.message ?? null };
}

export async function deletePost(id: string): Promise<void> {
  await supabase.from('blog_posts').delete().eq('id', id);
}
