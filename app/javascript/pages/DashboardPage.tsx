export default function DashboardPage() {
  return (
    <div className="p-6 max-w-6xl mx-auto">
      {/* Balance card */}
      <div className="card p-8 mb-8">
        <p className="text-sm font-medium mb-2 text-text-muted">
          Total Balance
        </p>
        <p className="text-5xl font-bold mono">
          0,00 €
        </p>
        <p className="text-sm mt-2 text-text-muted">
          No accounts connected yet
        </p>
      </div>

      {/* Quick stats grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div className="card p-6">
          <p className="text-sm font-medium mb-1 text-text-muted">
            Income this month
          </p>
          <p className="text-2xl font-bold mono text-accent">
            +0,00 €
          </p>
        </div>

        <div className="card p-6">
          <p className="text-sm font-medium mb-1 text-text-muted">
            Expenses this month
          </p>
          <p className="text-2xl font-bold mono">
            −0,00 €
          </p>
        </div>

        <div className="card p-6">
          <p className="text-sm font-medium mb-1 text-text-muted">
            Transactions
          </p>
          <p className="text-2xl font-bold mono">
            0
          </p>
        </div>
      </div>

      {/* Empty state */}
      <div className="card p-12 text-center">
        <p className="text-lg font-medium mb-2">
          No transactions yet
        </p>
        <p className="text-sm mb-6 text-text-muted">
          Connect your bank account to start tracking your finances.
        </p>
        <button className="btn btn-primary">
          Connect Bank Account
        </button>
      </div>
    </div>
  )
}
