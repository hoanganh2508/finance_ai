# frozen_string_literal: true

module Ai
  class FinancialAnalysisService
    class Error < StandardError; end
    class MissingApiKeyError < Error; end
    class ApiError < Error; end

    REQUIRED_KEYS = %w[overview strengths weaknesses risks cashflow_quality conclusion].freeze
    DEFAULT_MODEL = "gpt-4o-mini"
    MAX_TICKER_LENGTH = 20
    MAX_NOTES_LENGTH = 2000

    def self.call(ticker:, currency: "VND", financials: {})
      new(ticker: ticker, currency: currency, financials: financials).call
    end

    def initialize(ticker:, currency: "VND", financials: {})
      @ticker = ticker.to_s.strip.upcase[0, MAX_TICKER_LENGTH]
      @currency = currency.to_s
      @financials = financials.to_h.stringify_keys
    end

    def call
      raise MissingApiKeyError, "OPENAI_API_KEY chưa được cấu hình" if api_key.blank?

      raw = request_openai
      parse_and_validate(raw)
    rescue Faraday::Error => e
      raise ApiError, "Không thể kết nối tới dịch vụ AI: #{e.message}"
    rescue StandardError => e
      raise ApiError, "Lỗi từ dịch vụ AI: #{e.message}"
    end

    private

    attr_reader :ticker, :currency, :financials

    def api_key
      @api_key ||= ENV["OPENAI_API_KEY"].to_s.strip.presence
    end

    def request_openai
      client = OpenAI::Client.new(access_token: api_key)
      response = client.chat(
        parameters: {
          model: DEFAULT_MODEL,
          messages: [
            { role: "system", content: system_prompt },
            { role: "user", content: user_prompt }
          ],
          response_format: { type: "json_object" },
          temperature: 0.4,
          max_tokens: 2000
        }
      )
      response.dig("choices", 0, "message", "content")
    end

    def system_prompt
      <<~PROMPT.strip
        Bạn là chuyên gia phân tích tài chính. Nhiệm vụ: dựa trên mã cổ phiếu và các chỉ số tài chính được cung cấp, đưa ra phân tích ngắn gọn bằng tiếng Việt.
        Trả về ĐÚNG một JSON với các key sau (không thêm key khác):
        - "overview": string, 2-4 câu tổng quan về doanh nghiệp và sức khỏe tài chính.
        - "strengths": mảng string, 2-5 điểm mạnh (mỗi phần tử 1 câu).
        - "weaknesses": mảng string, 2-5 điểm yếu (mỗi phần tử 1 câu).
        - "risks": mảng string, 2-5 rủi ro tài chính/hoạt động (mỗi phần tử 1 câu).
        - "cashflow_quality": string, 1-3 câu đánh giá chất lượng dòng tiền.
        - "conclusion": string, 1-2 câu kết luận tổng thể (nên quan tâm / thận trọng / v.v.).
        Chỉ trả về JSON, không kèm markdown hay giải thích.
      PROMPT
    end

    def user_prompt
      lines = ["Mã cổ phiếu: #{ticker}", "Đơn vị tiền tệ: #{currency}"]
      labels = {
        "revenue" => "Doanh thu (12 tháng)",
        "net_income" => "Lợi nhuận ròng",
        "gross_margin_pct" => "Biên lợi nhuận gộp (%)",
        "debt_to_equity" => "Nợ / Vốn chủ sở hữu",
        "roe_pct" => "ROE (%)",
        "roa_pct" => "ROA (%)",
        "pe" => "P/E",
        "pb" => "P/B",
        "revenue_growth_3y_pct" => "Tăng trưởng doanh thu 3 năm (%)",
        "net_income_growth_3y_pct" => "Tăng trưởng lợi nhuận ròng 3 năm (%)"
      }
      financials.each do |key, value|
        next if value.blank? || value.to_s.strip.empty?
        label = labels[key] || key
        lines << "#{label}: #{value}"
      end
      notes = financials["notes"].to_s.strip[0, MAX_NOTES_LENGTH]
      lines << "Ghi chú thêm: #{notes}" if notes.present?
      lines.join("\n")
    end

    def parse_and_validate(raw)
      return default_analysis unless raw.present?

      data = JSON.parse(raw)
      data = data.with_indifferent_access

      result = {}
      REQUIRED_KEYS.each do |key|
        case key
        when "strengths", "weaknesses", "risks"
          arr = data[key]
          result[key] = Array(arr).map(&:to_s).reject(&:blank?).presence || ["Chưa đủ dữ liệu để đánh giá."]
        else
          result[key] = data[key].to_s.presence || "Chưa đủ dữ liệu để đánh giá."
        end
      end
      result
    rescue JSON::ParserError
      default_analysis
    end

    def default_analysis
      {
        "overview" => "Không thể tạo phân tích từ phản hồi AI.",
        "strengths" => [],
        "weaknesses" => [],
        "risks" => [],
        "cashflow_quality" => "",
        "conclusion" => ""
      }
    end
  end
end
