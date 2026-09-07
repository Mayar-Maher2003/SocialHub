export default function PostCardSkeleton() {
  return (
    <div className="flex justify-center px-4 py-4 bg-page">
      <div className="w-full max-w-[500px] bg-surface rounded-2xl border border-subtle p-5 animate-pulse">
        <div className="flex items-center gap-3">
          <div className="h-[45px] w-[45px] rounded-full bg-surface-2" />
          <div className="space-y-2">
            <div className="h-3.5 w-32 rounded bg-surface-2" />
            <div className="h-2.5 w-20 rounded bg-surface-2" />
          </div>
        </div>

        <div className="mt-4 space-y-2">
          <div className="h-3 w-full rounded bg-surface-2" />
          <div className="h-3 w-4/5 rounded bg-surface-2" />
        </div>

        <div className="mt-5 flex gap-2">
          <div className="h-8 flex-1 rounded-lg bg-surface-2" />
          <div className="h-8 flex-1 rounded-lg bg-surface-2" />
          <div className="h-8 flex-1 rounded-lg bg-surface-2" />
          <div className="h-8 flex-1 rounded-lg bg-surface-2" />
        </div>
      </div>
    </div>
  );
}
