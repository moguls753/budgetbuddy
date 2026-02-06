export default function RecurringPage() {
  return (
    <div className="p-6 max-w-6xl mx-auto">
      <h2 className="text-2xl font-bold mb-6">Recurring</h2>
      <div className="card p-12 text-center">
        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="mx-auto mb-4 text-text-muted">
          <polyline points="17 1 21 5 17 9" />
          <path d="M3 11V9a4 4 0 0 1 4-4h14" />
          <polyline points="7 23 3 19 7 15" />
          <path d="M21 13v2a4 4 0 0 1-4 4H3" />
        </svg>
        <p className="text-lg font-medium mb-2">No recurring transactions</p>
        <p className="text-sm text-text-muted">
          Recurring transactions will be detected automatically from your history.
        </p>
      </div>
    </div>
  )
}
