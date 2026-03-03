export default function LoadingSkeleton() {
  return (
    <div className="page-container animate-fadeIn">
      <div className="skeleton h-7 w-48 mb-2" />
      <div className="skeleton h-4 w-32 mb-6" />
      <div className="space-y-4">
        <div className="card !p-4 space-y-3">
          <div className="skeleton h-5 w-3/4" />
          <div className="skeleton h-4 w-full" />
          <div className="skeleton h-4 w-5/6" />
        </div>
        <div className="grid grid-cols-2 gap-3">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="card !p-4 space-y-2">
              <div className="skeleton h-10 w-10 rounded-lg" />
              <div className="skeleton h-4 w-20" />
              <div className="skeleton h-3 w-16" />
            </div>
          ))}
        </div>
        <div className="card !p-4 space-y-3">
          <div className="skeleton h-4 w-full" />
          <div className="skeleton h-4 w-4/5" />
        </div>
      </div>
    </div>
  );
}
