module Api
  module V1
    class FinancialAnalysesController < BaseController
      def create
        ticker = params[:ticker].to_s.strip.upcase

        unless ticker.present?
          return render_error(
            status: :unprocessable_entity,
            code: "validation_error",
            message: "ticker là bắt buộc"
          )
        end

        analysis = Ai::FinancialAnalysisService.call(
          ticker: ticker,
          currency: financial_params[:currency].presence || "VND",
          financials: financial_params[:financials].to_h
        )

        render json: build_response(ticker, analysis)
      rescue Ai::FinancialAnalysisService::MissingApiKeyError => _e
        Rails.logger.warn("[FinancialAnalyses] OPENAI_API_KEY blank, returning mock response")
        render json: build_response(ticker, mock_analysis(ticker))
      rescue Ai::FinancialAnalysisService::ApiError => e
        render_error(status: :bad_gateway, code: "ai_error", message: e.message)
      end

      private

      def build_response(ticker, analysis)
        {
          id: SecureRandom.uuid,
          ticker: ticker,
          kind: "financial",
          analysis: {
            overview: analysis["overview"],
            strengths: analysis["strengths"],
            weaknesses: analysis["weaknesses"],
            risks: analysis["risks"],
            cashflow_quality: analysis["cashflow_quality"],
            conclusion: analysis["conclusion"]
          },
          created_at: Time.current
        }
      end

      def mock_analysis(ticker)
        {
          "overview" => "Đây là kết quả mock cho mã #{ticker}. Cấu hình OPENAI_API_KEY để dùng phân tích AI thật.",
          "strengths" => ["Ví dụ: biên lợi nhuận ổn định", "Ví dụ: đòn bẩy tài chính an toàn"],
          "weaknesses" => ["Ví dụ: tăng trưởng chậm lại"],
          "risks" => ["Ví dụ: rủi ro ngành", "Ví dụ: rủi ro nợ"],
          "cashflow_quality" => "Ví dụ: dòng tiền từ hoạt động kinh doanh dương đều.",
          "conclusion" => "Ví dụ: doanh nghiệp có sức khỏe tài chính tương đối lành mạnh."
        }
      end

      def financial_params
        params.permit(:ticker, :currency, financials: [
          :revenue, :net_income, :gross_margin_pct, :debt_to_equity,
          :roe_pct, :roa_pct, :pe, :pb,
          :revenue_growth_3y_pct, :net_income_growth_3y_pct, :notes
        ])
      end
    end
  end
end

