export default function TransactionsPage() {
  return (
    <div className="p-6 max-w-6xl mx-auto">
      <h2 className="text-2xl font-bold mb-6">Transactions</h2>
      <div className="card p-12 text-center">
        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="mx-auto mb-4 text-text-muted">
          <line x1="12" y1="5" x2="12" y2="19" />
          <polyline points="19 12 12 19 5 12" />
        </svg>
        <p className="text-lg font-medium mb-2">No transactions yet</p>
        <p className="text-sm text-text-muted">
          Import or connect a bank account to see transactions here.
        </p>
      </div>
    </div>
  )
}
