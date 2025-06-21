class Statistics
  def initialize(user:, period_in_days: 30)
    @current_user = user
    @period_in_days = period_in_days
  end

  def call
    {
      spending:
        {
          last_period:,
          daily:,
          monthly:,
          yearly:
        },
      income:
        {
          last_period:,
          daily:,
          monthly:,
          yearly:
        },
      top_10_merchants: {
        name:,
        spending:
      }
    }
  end
end
