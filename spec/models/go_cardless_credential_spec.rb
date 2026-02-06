require "rails_helper"

RSpec.describe GoCardlessCredential, type: :model do
  it "is valid with secret_id and secret_key" do
    expect(build(:go_cardless_credential)).to be_valid
  end

  it "requires secret_id and secret_key" do
    expect(build(:go_cardless_credential, secret_id: nil)).not_to be_valid
    expect(build(:go_cardless_credential, secret_key: nil)).not_to be_valid
  end

  it "allows only one credential per user" do
    user = create(:user)
    create(:go_cardless_credential, user: user)
    duplicate = build(:go_cardless_credential, user: user)
    expect { duplicate.save!(validate: false) }.to raise_error(ActiveRecord::RecordNotUnique)
  end

  it "encrypts secret_key" do
    credential = create(:go_cardless_credential)
    raw_value = ActiveRecord::Base.connection.select_value(
      "SELECT secret_key FROM go_cardless_credentials WHERE id = ?", "SQL", [ credential.id ]
    )
    expect(raw_value).not_to eq(credential.secret_key)
  end

  it "knows when access is expired" do
    expect(build(:go_cardless_credential, :with_token)).not_to be_access_expired
    expect(build(:go_cardless_credential, :expired_access)).to be_access_expired
    expect(build(:go_cardless_credential)).to be_access_expired # no token yet
  end

  it "knows when refresh is valid" do
    expect(build(:go_cardless_credential, :with_token)).to be_refresh_valid
    expect(build(:go_cardless_credential, :fully_expired)).not_to be_refresh_valid
  end
end
