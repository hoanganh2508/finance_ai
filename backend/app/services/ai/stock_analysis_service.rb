# frozen_string_literal: true

module Ai
  class StockAnalysisService
    class Error < StandardError; end
    class MissingApiKeyError < Error; end
    class ApiError < Error; end

    DEFAULT_MODEL = "gpt-4o-mini"
    MAX_TICKER_LENGTH = 20
    MAX_NOTES_LENGTH = 2000

    def self.call(ticker:, horizon: "medium", risk_profile: "medium", current_price: nil, target_price: nil, notes: nil)
      new(
        ticker: ticker,
        horizon: horizon,
        risk_profile: risk_profile,
        current_price: current_price,
        target_price: target_price,
        notes: notes
      ).call
    end

    def initialize(ticker:, horizon:, risk_profile:, current_price:, target_price:, notes:)
      @ticker = ticker.to_s.strip.upcase[0, MAX_TICKER_LENGTH]
      @horizon = horizon.to_s
      @risk_profile = risk_profile.to_s
      @current_price = current_price
      @target_price = target_price
      @notes = notes.to_s.strip[0, MAX_NOTES_LENGTH]
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

    attr_reader :ticker, :horizon, :risk_profile, :current_price, :target_price, :notes

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
        Bạn là chuyên gia phân tích cổ phiếu. Nhiệm vụ: dựa trên mã cổ phiếu, khung thời gian, mức chấp nhận rủi ro
        và một số thông tin về giá, hãy xây dựng gợi ý luận điểm đầu tư bằng tiếng Việt.

        Trả về ĐÚNG một JSON với cấu trúc sau (không thêm key khác):
        {
          "investment_thesis": [string...],   // 2-5 luận điểm đầu tư chính
          "catalysts": [string...],          // 2-5 catalyst / động lực tăng giá
          "risks": [string...],              // 2-5 rủi ro chính
          "scenarios": {
            "bull": string,                  // mô tả kịch bản tích cực
            "base": string,                  // mô tả kịch bản cơ sở
            "bear": string                   // mô tả kịch bản tiêu cực
          },
          "valuation_comment": string        // 1-3 câu nhận xét định giá (theo vùng giá cung cấp, nếu có)
        }

        Chỉ trả về JSON, không kèm markdown hay giải thích thêm.
      PROMPT
    end

    def user_prompt
      lines = []
      lines << "Mã cổ phiếu: #{ticker}"
      lines << "Khung thời gian: #{horizon}"
      lines << "Mức chấp nhận rủi ro: #{risk_profile}"
      lines << "Giá hiện tại: #{current_price}" if current_price
      lines << "Giá mục tiêu: #{target_price}" if target_price
      lines << "Ghi chú thêm: #{notes}" if notes.present?
      lines.join("\n")
    end

    def parse_and_validate(raw)
      return default_analysis unless raw.present?

      data = JSON.parse(raw)
      data = data.with_indifferent_access

      {
        "investment_thesis" => Array(data["investment_thesis"]).map(&:to_s).reject(&:blank?).presence ||
          ["Chưa đủ dữ liệu để xây dựng luận điểm đầu tư."],
        "catalysts" => Array(data["catalysts"]).map(&:to_s).reject(&:blank?).presence ||
          ["Chưa đủ dữ liệu để xác định catalyst cụ thể."],
        "risks" => Array(data["risks"]).map(&:to_s).reject(&:blank?).presence ||
          ["Chưa đủ dữ liệu để liệt kê rủi ro cụ thể."],
        "scenarios" => {
          "bull" => data.dig("scenarios", "bull").to_s.presence || "Chưa đủ dữ liệu cho kịch bản tích cực.",
          "base" => data.dig("scenarios", "base").to_s.presence || "Chưa đủ dữ liệu cho kịch bản cơ sở.",
          "bear" => data.dig("scenarios", "bear").to_s.presence || "Chưa đủ dữ liệu cho kịch bản tiêu cực."
        },
        "valuation_comment" =>
          data["valuation_comment"].to_s.presence || "Chưa đủ dữ liệu để nhận xét về định giá."
      }
    rescue JSON::ParserError
      default_analysis
    end

    def default_analysis
      {
        "investment_thesis" => [],
        "catalysts" => [],
        "risks" => [],
        "scenarios" => {
          "bull" => "Không thể xây dựng kịch bản tích cực từ phản hồi AI.",
          "base" => "Không thể xây dựng kịch bản cơ sở từ phản hồi AI.",
          "bear" => "Không thể xây dựng kịch bản tiêu cực từ phản hồi AI."
        },
        "valuation_comment" => "Không thể tạo nhận xét định giá từ phản hồi AI."
      }
    end
  end
end

