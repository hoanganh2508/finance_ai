module Api
  module V1
    class ReportSummariesController < BaseController
      def create
        title = params[:title].presence || "Báo cáo không tiêu đề"
        content = params[:content].to_s

        unless content.present?
          return render_error(
            status: :unprocessable_entity,
            code: "validation_error",
            message: "content (nội dung báo cáo) là bắt buộc"
          )
        end

        render json: {
          id: SecureRandom.uuid,
          kind: "report",
          title:,
          summary: {
            bullets: [
              "Ví dụ: Ý chính 1 rút ra từ báo cáo.",
              "Ví dụ: Ý chính 2 rút ra từ báo cáo."
            ],
            opportunities: [
              "Ví dụ: Cơ hội tăng trưởng doanh thu.",
              "Ví dụ: Cơ hội mở rộng biên lợi nhuận."
            ],
            risks: [
              "Ví dụ: Rủi ro về chi phí đầu vào.",
              "Ví dụ: Rủi ro về chính sách hoặc pháp lý."
            ],
            watch_items: [
              "Ví dụ: Cần theo dõi tiến độ dự án lớn.",
              "Ví dụ: Cần theo dõi biến động nhu cầu thị trường."
            ]
          },
          created_at: Time.current
        }
      end
    end
  end
end

