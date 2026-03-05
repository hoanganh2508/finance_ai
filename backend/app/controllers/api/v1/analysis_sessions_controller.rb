module Api
  module V1
    class AnalysisSessionsController < BaseController
      def index
        kind = params[:kind]

        sessions = mock_sessions
        sessions = sessions.select { |s| s[:kind] == kind } if kind.present?

        render json: sessions
      end

      def show
        id = params[:id]
        session = mock_sessions.find { |s| s[:id] == id }

        if session
          render json: session
        else
          render_error(
            status: :not_found,
            code: "not_found",
            message: "Không tìm thấy phiên phân tích"
          )
        end
      end

      private

      def mock_sessions
        [
          {
            id: "mock-financial-1",
            kind: "financial",
            ticker: "FPT",
            created_at: 1.day.ago,
            analysis: {
              overview: "Ví dụ: phiên phân tích tài chính mẫu cho FPT."
            }
          },
          {
            id: "mock-stock-1",
            kind: "stock",
            ticker: "VNM",
            created_at: 2.days.ago,
            analysis: {
              overview: "Ví dụ: phiên phân tích cổ phiếu mẫu cho VNM."
            }
          }
        ]
      end
    end
  end
end

