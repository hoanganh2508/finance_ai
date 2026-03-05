module Api
  module V1
    class StockAnalysesController < BaseController
      def create
        ticker = params[:ticker].to_s.strip.upcase

        unless ticker.present?
          return render_error(
            status: :unprocessable_entity,
            code: "validation_error",
            message: "ticker là bắt buộc"
          )
        end

        analysis = Ai::StockAnalysisService.call(
          ticker: ticker,
          horizon: stock_params[:horizon].presence || "medium",
          risk_profile: stock_params[:risk_profile].presence || "medium",
          current_price: to_number_or_nil(stock_params[:current_price]),
          target_price: to_number_or_nil(stock_params[:target_price]),
          notes: stock_params[:notes]
        )

        render json: build_response(ticker, analysis)
      rescue Ai::StockAnalysisService::MissingApiKeyError => _e
        Rails.logger.warn("[StockAnalyses] OPENAI_API_KEY blank, returning mock response")
        render json: build_response(ticker, mock_analysis(ticker))
      rescue Ai::StockAnalysisService::ApiError => e
        render_error(status: :bad_gateway, code: "ai_error", message: e.message)
      end

      private

      def build_response(ticker, analysis)
        {
          id: SecureRandom.uuid,
          ticker:,
          kind: "stock",
          analysis: {
            investment_thesis: analysis["investment_thesis"],
            catalysts: analysis["catalysts"],
            risks: analysis["risks"],
            scenarios: {
              bull: analysis.dig("scenarios", "bull"),
              base: analysis.dig("scenarios", "base"),
              bear: analysis.dig("scenarios", "bear")
            },
            valuation_comment: analysis["valuation_comment"]
          },
          created_at: Time.current
        }
      end

      def mock_analysis(ticker)
        {
          "investment_thesis" => [
            "Ví dụ: doanh nghiệp đầu ngành, hưởng lợi xu hướng dài hạn.",
            "Ví dụ: chất lượng lợi nhuận tốt, ROE duy trì ở mức cao."
          ],
          "catalysts" => [
            "Ví dụ: tăng trưởng đơn hàng mới.",
            "Ví dụ: thông tin mở rộng thị trường quốc tế."
          ],
          "risks" => [
            "Ví dụ: cạnh tranh tăng lên trong ngành.",
            "Ví dụ: rủi ro vĩ mô, lãi suất, tỷ giá."
          ],
          "scenarios" => {
            "bull" => "Kịch bản tích cực minh hoạ cho mã #{ticker}.",
            "base" => "Kịch bản trung lập minh hoạ cho mã #{ticker}.",
            "bear" => "Kịch bản tiêu cực minh hoạ cho mã #{ticker}."
          },
          "valuation_comment" => "Ví dụ: định giá hiện tại không quá đắt so với trung bình ngành."
        }
      end

      def stock_params
        params.permit(:ticker, :horizon, :risk_profile, :current_price, :target_price, :notes)
      end

      def to_number_or_nil(value)
        str = value.to_s.strip
        return nil if str.empty?
        Float(str)
      rescue ArgumentError
        nil
      end
    end
  end
end
