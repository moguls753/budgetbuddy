class Statistics
  def initialize(accounts:, period_in_days: 30)
    @accounts       = accounts
    @period_range   = period_in_days.days.ago.to_date..Date.current
    @period_days    = period_in_days
  end

  def call
    {
      spending: {
        last_period:     spending_in_range(@period_range),
        average_daily:   average_daily_spending,
        average_monthly: average_monthly_spending,
        average_yearly:  average_yearly_spending
      },
      income: {
        last_period:     income_in_range(@period_range),
        average_daily:   average_daily_income,
        average_monthly: average_monthly_income,
        average_yearly:  average_yearly_income
      },
      top_10_merchants: top_merchants(10)
    }
  end

  private

  def spending_in_range(range)
    TransactionRecord.where(account: @accounts).where(booking_date: range).where("amount < 0").sum(:amount).to_f
  end

  def income_in_range(range)
    TransactionRecord.where(account: @accounts).where(booking_date: range).where("amount > 0").sum(:amount).to_f
  end

  def average_daily_spending
    spending_in_range(@period_range).to_f / @period_days
  end

  def average_monthly_spending
    average_daily_spending * 30
  end

  def average_yearly_spending
    average_daily_spending * 365
  end

  def average_daily_income
    income_in_range(@period_range).to_f / @period_days
  end

  def average_monthly_income
    average_daily_income * 30
  end

  def average_yearly_income
    average_daily_income * 365
  end

  def top_merchants(limit = 10)
    TransactionRecord
             .where(account: @accounts)
             .where("amount < 0")
             .where(booking_date: @period_range)
             .group(:creditor_name)
             .select("creditor_name AS name, SUM(amount) AS spending")
             .order("spending ASC")
             .limit(limit)
             .map { |r| { name: r.name, spending: r.spending.to_f } }
  end
end
