export default function Loading() {
  return (
    <div className="flex flex-col md:flex-row gap-8 items-start pt-8">
      {/* Sidebar skeleton */}
      <div className="hidden md:block flex-shrink-0 w-64 lg:w-72">
        <div className="w-full bg-surface rounded-lg shadow-lg p-4 space-y-5 animate-pulse">
          <div className="flex justify-between items-center pb-3 border-b border-gray-700">
            <div className="h-6 w-24 bg-gray-700 rounded" />
            <div className="h-6 w-6 bg-gray-700 rounded" />
          </div>
          <div className="space-y-2">
            <div className="h-3 w-20 bg-gray-700 rounded" />
            <div className="h-9 w-full bg-gray-700 rounded-md" />
          </div>
          {[...Array(4)].map((_, i) => (
            <div key={i} className="space-y-2 border-t border-gray-700 pt-4">
              <div className="h-3 w-24 bg-gray-700 rounded" />
              <div className="flex flex-wrap gap-2">
                {[...Array(3)].map((_, j) => (
                  <div key={j} className="h-7 w-16 bg-gray-700 rounded-full" />
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Grid skeleton */}
      <div className="flex-1 min-w-0">
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-4 animate-pulse">
          {[...Array(18)].map((_, i) => (
            <div key={i} className="flex flex-col gap-2">
              <div className="aspect-[2/3] w-full bg-surface rounded-lg" />
              <div className="h-3 w-3/4 bg-gray-700 rounded" />
              <div className="h-3 w-1/2 bg-gray-700 rounded" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
