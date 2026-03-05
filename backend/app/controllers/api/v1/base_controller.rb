module Api
  module V1
    class BaseController < ApplicationController
      protect_from_forgery with: :null_session

      private

      def render_error(status:, code:, message:, details: nil)
        error = { code:, message: }
        error[:details] = details if details

        render json: { error: }, status:
      end
    end
  end
end

