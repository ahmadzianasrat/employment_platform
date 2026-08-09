export function BlogContent({ content }: { content: string }) {
  const paragraphs = content.split(/\n\s*\n/).filter((p) => p.trim());
  return (
    <div className="space-y-4 text-[15px] leading-relaxed text-(--color-ink)">
      {paragraphs.map((p, i) => (
        <p key={i} className="whitespace-pre-line">
          {p.trim()}
        </p>
      ))}
    </div>
  );
}
