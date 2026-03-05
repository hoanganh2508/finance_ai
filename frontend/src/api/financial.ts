import { apiClient } from './client'

export type FinancialAnalysisRequest = {
  ticker: string
  currency?: string
  financials: {
    revenue?: number | null
    net_income?: number | null
    gross_margin_pct?: number | null
    debt_to_equity?: number | null
    roe_pct?: number | null
    roa_pct?: number | null
    pe?: number | null
    pb?: number | null
    revenue_growth_3y_pct?: number | null
    net_income_growth_3y_pct?: number | null
    notes?: string | null
  }
}

export type FinancialAnalysisResponse = {
  id: string
  ticker: string
  kind: 'financial'
  analysis: {
    overview: string
    strengths: string[]
    weaknesses: string[]
    risks: string[]
    cashflow_quality: string
    conclusion: string
  }
  created_at: string
}

export function createFinancialAnalysis(payload: FinancialAnalysisRequest) {
  return apiClient.post<FinancialAnalysisResponse>('/financial_analyses', payload)
}
