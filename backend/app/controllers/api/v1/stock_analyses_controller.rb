module Api
  module V1
    class StockAnalysesController < BaseController
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
          kind: "stock",
          analysis: {
            investment_thesis: [
              "Ví dụ: doanh nghiệp đầu ngành, hưởng lợi xu hướng dài hạn.",
              "Ví dụ: chất lượng lợi nhuận tốt, ROE duy trì ở mức cao."
            ],
            catalysts: [
              "Ví dụ: tăng trưởng đơn hàng mới.",
              "Ví dụ: thông tin mở rộng thị trường quốc tế."
            ],
            risks: [
              "Ví dụ: cạnh tranh tăng lên trong ngành.",
              "Ví dụ: rủi ro vĩ mô, lãi suất, tỷ giá."
            ],
            scenarios: {
              bull: "Kịch bản tích cực minh hoạ cho mã #{ticker}.",
              base: "Kịch bản trung lập minh hoạ cho mã #{ticker}.",
              bear: "Kịch bản tiêu cực minh hoạ cho mã #{ticker}."
            },
            valuation_comment: "Ví dụ: định giá hiện tại không quá đắt so với trung bình ngành."
          },
          created_at: Time.current
        }
      end
    end
  end
end

