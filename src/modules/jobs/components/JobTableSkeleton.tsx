function SkeletonRow() {
  return (
    <tr className="border-t border-(--color-line) bg-(--color-paper-raised)">
      <td className="px-3 py-4"><div className="h-3 w-4 animate-pulse rounded bg-(--color-line)" /></td>
      <td className="px-3 py-4"><div className="h-3 w-32 animate-pulse rounded bg-(--color-line)" /></td>
      <td className="px-3 py-4"><div className="h-7 w-7 animate-pulse rounded-full bg-(--color-line)" /></td>
      <td className="px-3 py-4"><div className="h-3 w-24 animate-pulse rounded bg-(--color-line)" /></td>
      <td className="px-3 py-4"><div className="h-3 w-16 animate-pulse rounded bg-(--color-line)" /></td>
      <td className="px-3 py-4"><div className="h-3 w-20 animate-pulse rounded bg-(--color-line)" /></td>
      <td className="px-3 py-4"><div className="h-3 w-10 animate-pulse rounded bg-(--color-line)" /></td>
      <td className="px-3 py-4"><div className="h-3 w-20 animate-pulse rounded bg-(--color-line)" /></td>
      <td className="px-3 py-4"><div className="h-5 w-16 animate-pulse rounded-full bg-(--color-line)" /></td>
      <td className="px-3 py-4"><div className="mx-auto h-8 w-8 animate-pulse rounded-full bg-(--color-line)" /></td>
      <td className="px-3 py-4"><div className="mx-auto h-8 w-8 animate-pulse rounded-full bg-(--color-line)" /></td>
      <td className="px-3 py-4"><div className="mx-auto h-6 w-16 animate-pulse rounded-(--radius-md) bg-(--color-line)" /></td>
    </tr>
  );
}

/** Shown in place of the job table while the initial fetch is in flight — gives the page structure immediately instead of a blank/loading-text gap. */
export function JobTableSkeleton({ rows = 8 }: { rows?: number }) {
  return (
    <div className="overflow-x-auto rounded-(--radius-lg) border border-(--color-line)">
      <table className="w-full min-w-[960px] border-collapse text-sm">
        <tbody>
          {Array.from({ length: rows }).map((_, i) => (
            <SkeletonRow key={i} />
          ))}
        </tbody>
      </table>
    </div>
  );
}
