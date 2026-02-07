module Api
  module V1
    class DashboardsController < ApplicationController
      def show
        accounts = Current.user.accounts
        transactions = Current.user.transaction_records.in_period(Date.current.beginning_of_month, Date.current)

        render json: {
          total_balance: accounts.sum(:balance_amount),
          income: transactions.credits.sum(:amount),
          expenses: transactions.debits.sum(:amount),
          transaction_count: transactions.count,
          recent_transactions: recent_transactions
        }
      end

      private

      def recent_transactions
        Current.user.transaction_records
          .includes(:account, :category)
          .order(booking_date: :desc, id: :desc)
          .limit(5)
          .map do |tx|
            {
              id: tx.id,
              amount: tx.amount,
              currency: tx.currency,
              booking_date: tx.booking_date,
              remittance: tx.remittance,
              creditor_name: tx.creditor_name,
              debtor_name: tx.debtor_name,
              category: tx.category ? { id: tx.category.id, name: tx.category.name } : nil
            }
          end
      end
    end
  end
end
