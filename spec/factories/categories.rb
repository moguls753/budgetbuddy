FactoryBot.define do
  factory :category do
    user
    name { Faker::Commerce.department }
  end
end
