import { NavLink } from 'react-router-dom';

const tabClass = ({ isActive }: { isActive: boolean }) =>
  `rounded-(--radius-md) px-3 py-1.5 text-sm font-medium transition-colors ${
    isActive
      ? 'bg-(--color-lapis) text-white'
      : 'text-(--color-muted) hover:bg-(--color-lapis)/8 hover:text-(--color-lapis)'
  }`;

export function AdminNav() {
  return (
    <div className="mb-6 flex gap-2 border-b border-(--color-line) pb-4">
      <NavLink to="/admin" end className={tabClass}>
        Jobs
      </NavLink>
      <NavLink to="/admin/documents" className={tabClass}>
        Documents
      </NavLink>
      <NavLink to="/admin/blog" className={tabClass}>
        Blog
      </NavLink>
    </div>
  );
}
