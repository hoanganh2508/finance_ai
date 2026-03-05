module Api
  module V1
    class FinancialAnalysesController < BaseController
      def create
        ticker = params[:ticker].to_s.upcase

        unless ticker.present?
          return render_error(
            status: :unprocessable_entity,
            code: "validation_error",
            message: "ticker là bắt buộc"
          )
        end

        render json: {
          id: SecureRandom.uuid,
          ticker:,
          kind: "financial",
          analysis: {
            overview: "Đây là response mock cho mã #{ticker}. Kết quả này sẽ được thay thế bởi AI sau.",
            strengths: ["Ví dụ: biên lợi nhuận tốt", "Ví dụ: đòn bẩy tài chính an toàn"],
            weaknesses: ["Ví dụ: tăng trưởng chậm lại"],
            risks: ["Ví dụ: rủi ro ngành, rủi ro nợ"],
            cashflow_quality: "Ví dụ: dòng tiền từ hoạt động kinh doanh dương đều qua các năm.",
            conclusion: "Ví dụ: doanh nghiệp có sức khỏe tài chính tương đối lành mạnh."
          },
          created_at: Time.current
        }
      end
    end
  end
end

