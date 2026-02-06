module Api
  module V1
    class CategoriesController < ApplicationController
      def index
        render json: Current.user.categories.order(:name).map { |c| category_json(c) }
      end

      def create
        category = Current.user.categories.build(category_params)

        if category.save
          render json: category_json(category), status: :created
        else
          render json: { errors: category.errors.full_messages }, status: :unprocessable_entity
        end
      end

      def update
        category = Current.user.categories.find(params[:id])

        if category.update(category_params)
          render json: category_json(category)
        else
          render json: { errors: category.errors.full_messages }, status: :unprocessable_entity
        end
      end

      def destroy
        category = Current.user.categories.find(params[:id])
        category.destroy!
        head :no_content
      end

      private

      def category_params
        params.expect(category: [ :name ])
      end

      def category_json(category)
        { id: category.id, name: category.name }
      end
    end
  end
end
