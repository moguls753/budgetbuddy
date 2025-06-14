# == Schema Information
#
# Table name: go_cardless_tokens
#
#  id              :integer          not null, primary key
#  access_expires  :integer          default(0), not null
#  access_token    :string
#  refresh_expires :integer          default(0), not null
#  refresh_token   :string
#  created_at      :datetime         not null
#  updated_at      :datetime         not null
#

class GoCardlessToken < ApplicationRecord
  def self.fetch_valid!
    token = first_or_initialize

    if token.new_record?
      token.fetch_new_token!
    elsif token.access_expired?
      if token.refresh_valid?
        token.refresh!
      else
        token.fetch_new_token!
      end
    end

    token
  end

  def access_expired?
    (created_at + access_expires.seconds) <= Time.current
  end

  def refresh_valid?
    (created_at + refresh_expires.seconds) > Time.current
  end

  def fetch_new_token!
    data = GoCardless::Client
             .new_without_token
             .post("token/new/", body: {
               secret_id:  Rails.application.credentials.gocardless[:secret_id],
               secret_key: Rails.application.credentials.gocardless[:secret_key]
             })

    update!(
      access_token:    data["access"],
      refresh_token:   data["refresh"],
      access_expires:  data["access_expires"],
      refresh_expires: data["refresh_expires"]
    )
  end

  def refresh!
    data = GoCardless::Client
             .new_without_token
             .post("token/refresh/", body: { refresh: refresh_token })

    update!(
      access_token:    data["access"],
      access_expires:  data["access_expires"],
    )
  end
end
