module Api
  module V1
    class NewsInsightsController < BaseController
      def create
        content = params.dig(:articles, 0, :content).to_s.presence || params[:content].to_s

        unless content.present?
          return render_error(
            status: :unprocessable_entity,
            code: "validation_error",
            message: "content (nội dung bài báo) là bắt buộc"
          )
        end

        ticker = params[:ticker].to_s.upcase.presence
        user_question = params[:user_question].to_s.presence

        render json: {
          id: SecureRandom.uuid,
          kind: "news",
          insight: {
            summary: "Ví dụ: Tóm tắt nội dung chính của bài báo.",
            impact_on_ticker: ticker ? "Ví dụ: Đánh giá tác động của tin tức lên mã #{ticker}." : "Ví dụ: Đánh giá tác động chung lên ngành/thị trường.",
            sentiment: "trung_lap",
            key_points: [
              "Ví dụ: Điểm đáng chú ý 1.",
              "Ví dụ: Điểm đáng chú ý 2."
            ],
            followups: [
              "Ví dụ: Cần theo dõi thêm phản ứng của thị trường.",
              "Ví dụ: Cần xem các tin liên quan trong vài tuần tới."
            ],
            user_question_answer: user_question ? "Ví dụ: Trả lời minh hoạ cho câu hỏi của bạn." : nil
          }.compact
        }
      end
    end
  end
end

