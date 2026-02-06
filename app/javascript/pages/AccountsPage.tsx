export default function AccountsPage() {
  return (
    <div className="p-6 max-w-6xl mx-auto">
      <h2 className="text-2xl font-bold mb-6">Accounts</h2>
      <div className="card p-12 text-center">
        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="mx-auto mb-4 text-text-muted">
          <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
          <line x1="3" y1="9" x2="21" y2="9" />
        </svg>
        <p className="text-lg font-medium mb-2">No accounts connected</p>
        <p className="text-sm text-text-muted">
          Link your bank accounts to start tracking balances automatically.
        </p>
      </div>
    </div>
  )
}
