import { apiClient } from './client'

export type StockAnalysisRequest = {
  ticker: string
  horizon?: 'short' | 'medium' | 'long'
  risk_profile?: 'low' | 'medium' | 'high'
  current_price?: number | null
  target_price?: number | null
  notes?: string | null
}

export type StockAnalysisResponse = {
  id: string
  ticker: string
  kind: 'stock'
  analysis: {
    investment_thesis: string[]
    catalysts: string[]
    risks: string[]
    scenarios: {
      bull: string
      base: string
      bear: string
    }
    valuation_comment: string
  }
  created_at: string
}

export function createStockAnalysis(payload: StockAnalysisRequest) {
  // Backend hiện tại đang trả mock; khi có AI sẽ dùng thêm các trường khác
  return apiClient.post<StockAnalysisResponse>('/stock_analyses', payload, 60000)
}

