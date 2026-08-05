const PALETTE = [
  '#1B4B6B', // lapis
  '#C87A2E', // saffron
  '#3C7A5C', // success green
  '#A83A3A', // danger red
  '#6B4C9A', // purple
  '#2E7D8C', // teal
  '#8C5A2E', // brown
];

function hashString(text: string): number {
  let hash = 0;
  for (let i = 0; i < text.length; i++) {
    hash = (hash << 5) - hash + text.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
}

function getInitials(name: string): string {
  const words = name.trim().split(/\s+/).filter(Boolean);
  if (words.length === 0) return '?';
  if (words.length === 1) return words[0].slice(0, 2).toUpperCase();
  return (words[0][0] + words[1][0]).toUpperCase();
}

export function OrgAvatar({ name, size = 32 }: { name: string | null; size?: number }) {
  const label = name?.trim() || 'Unknown';
  const color = PALETTE[hashString(label) % PALETTE.length];
  const initials = getInitials(label);

  return (
    <div
      title={label}
      className="flex shrink-0 items-center justify-center rounded-full font-semibold text-white"
      style={{ width: size, height: size, backgroundColor: color, fontSize: size * 0.38 }}
    >
      {initials}
    </div>
  );
}
