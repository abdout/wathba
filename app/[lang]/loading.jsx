// Default loading state for any [lang] route segment that doesn't define its own.
// Renders during server-side data fetches to prevent layout shift.
export default function Loading() {
    return (
        <div className="min-h-[40vh] flex items-center justify-center" role="status" aria-live="polite">
            <div className="h-8 w-8 rounded-full border-2 border-slate-200 border-t-slate-600 animate-spin" />
            <span className="sr-only">Loading</span>
        </div>
    );
}
