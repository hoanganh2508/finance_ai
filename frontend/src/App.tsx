import { useState } from 'react'
import { BrowserRouter, Routes, Route, Link, NavLink } from 'react-router-dom'
import './App.css'
import { createFinancialAnalysis, type FinancialAnalysisResponse } from './api/financial'
import { createStockAnalysis, type StockAnalysisResponse } from './api/stock'

type NavItem = {
  path: string
  label: string
}
const navItems: NavItem[] = [
  { path: '/', label: 'Dashboard' },
  { path: '/financial', label: 'Phân tích tài chính' },
  { path: '/stock', label: 'Phân tích cổ phiếu' },
  { path: '/report', label: 'Tóm tắt báo cáo' },
  { path: '/news', label: 'Tin tức & insight' },
]

function App() {
  return (
    <BrowserRouter>
      <div className="app">
        <header className="app-header">
          <Link to="/" className="app-logo">
            Finance AI
          </Link>
          <nav className="app-nav">
            {navItems.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) =>
                  ['app-nav-link', isActive ? 'app-nav-link-active' : '']
                    .filter(Boolean)
                    .join(' ')
                }
              >
                {item.label}
              </NavLink>
            ))}
          </nav>
        </header>

        <main className="app-main">
          <Routes>
            <Route path="/" element={<DashboardPage />} />
            <Route path="/financial" element={<FinancialAnalysisPage />} />
            <Route path="/stock" element={<StockAnalysisPage />} />
            <Route path="/report" element={<ReportSummaryPage />} />
            <Route path="/news" element={<NewsInsightPage />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  )
}

function DashboardPage() {
  return (
    <div className="page dashboard">
      <div className="dashboard-intro">
        <h1>Finance AI</h1>
        <p>
          Một nơi để bạn hỏi – hệ thống hỗ trợ phân tích tài chính, cổ phiếu, báo cáo và tin tức
          theo cùng một phong cách.
        </p>
        <ul>
          <li>Nhập nhanh mã cổ phiếu và số liệu cơ bản.</li>
          <li>Tóm tắt báo cáo dài thành vài ý chính.</li>
          <li>Theo dõi tin tức và tác động đến doanh nghiệp.</li>
        </ul>
      </div>

      <div className="dashboard-actions">
        {navItems
          .filter((item) => item.path !== '/')
          .map((item) => (
            <Link key={item.path} to={item.path} className="card">
              <h2>{item.label}</h2>
              <p>Nhấn để mở công cụ {item.label.toLowerCase()}.</p>
            </Link>
          ))}
      </div>
    </div>
  )
}

function FinancialAnalysisPage() {
  const [ticker, setTicker] = useState('')
  const [currency, setCurrency] = useState<'VND' | 'USD'>('VND')
  const [financials, setFinancials] = useState({
    revenue: '',
    net_income: '',
    gross_margin_pct: '',
    debt_to_equity: '',
    roe_pct: '',
    roa_pct: '',
    pe: '',
    pb: '',
    revenue_growth_3y_pct: '',
    net_income_growth_3y_pct: '',
    notes: '',
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [result, setResult] = useState<FinancialAnalysisResponse | null>(null)

  const handleChange =
    (field: keyof typeof financials) =>
    (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      setFinancials((prev) => ({ ...prev, [field]: event.target.value }))
    }

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()
    setError(null)

    if (!ticker.trim()) {
      setError('Vui lòng nhập mã cổ phiếu.')
      return
    }

    setLoading(true)
    try {
      const payload = {
        ticker: ticker.trim(),
        currency,
        financials: {
          revenue: Number(financials.revenue) || null,
          net_income: Number(financials.net_income) || null,
          gross_margin_pct: Number(financials.gross_margin_pct) || null,
          debt_to_equity: Number(financials.debt_to_equity) || null,
          roe_pct: Number(financials.roe_pct) || null,
          roa_pct: Number(financials.roa_pct) || null,
          pe: Number(financials.pe) || null,
          pb: Number(financials.pb) || null,
          revenue_growth_3y_pct: Number(financials.revenue_growth_3y_pct) || null,
          net_income_growth_3y_pct: Number(financials.net_income_growth_3y_pct) || null,
          notes: financials.notes || null,
        },
      }

      const response = await createFinancialAnalysis(payload)
      setResult(response)
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Đã xảy ra lỗi không xác định.'
      setError(message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="page">
      <h1>Phân tích tài chính doanh nghiệp</h1>
      <p>
        Nhập mã cổ phiếu và một số chỉ số cơ bản. Hệ thống sẽ trả về phân tích tài chính tổng quan
        do AI tạo dựa trên số liệu bạn nhập.
      </p>

      <div className="layout-two-columns">
        <section className="panel">
          <h2 className="panel-title">Thông tin đầu vào</h2>
          <form className="form" onSubmit={handleSubmit}>
            <div className="form-row">
              <div className="form-field">
                <label htmlFor="ticker">Mã cổ phiếu</label>
                <input
                  id="ticker"
                  value={ticker}
                  onChange={(e) => setTicker(e.target.value.toUpperCase())}
                  placeholder="Ví dụ: FPT, VNM..."
                  autoComplete="off"
                  required
                />
              </div>
              <div className="form-field">
                <label htmlFor="currency">Đơn vị tiền tệ</label>
                <select
                  id="currency"
                  value={currency}
                  onChange={(e) => setCurrency(e.target.value as 'VND' | 'USD')}
                >
                  <option value="VND">VND</option>
                  <option value="USD">USD</option>
                </select>
              </div>
            </div>

            <div className="form-grid">
              <div className="form-field">
                <label>Doanh thu (12 tháng)</label>
                <input
                  type="number"
                  inputMode="decimal"
                  value={financials.revenue}
                  onChange={handleChange('revenue')}
                  placeholder="Ví dụ: 5000000"
                />
              </div>
              <div className="form-field">
                <label>Lợi nhuận ròng</label>
                <input
                  type="number"
                  inputMode="decimal"
                  value={financials.net_income}
                  onChange={handleChange('net_income')}
                  placeholder="Ví dụ: 700000"
                />
              </div>
              <div className="form-field">
                <label>Biên lợi nhuận gộp (%)</label>
                <input
                  type="number"
                  inputMode="decimal"
                  value={financials.gross_margin_pct}
                  onChange={handleChange('gross_margin_pct')}
                  placeholder="Ví dụ: 40.5"
                />
              </div>
              <div className="form-field">
                <label>Nợ / Vốn chủ sở hữu</label>
                <input
                  type="number"
                  inputMode="decimal"
                  value={financials.debt_to_equity}
                  onChange={handleChange('debt_to_equity')}
                  placeholder="Ví dụ: 0.4"
                />
              </div>
              <div className="form-field">
                <label>ROE (%)</label>
                <input
                  type="number"
                  inputMode="decimal"
                  value={financials.roe_pct}
                  onChange={handleChange('roe_pct')}
                  placeholder="Ví dụ: 18.2"
                />
              </div>
              <div className="form-field">
                <label>ROA (%)</label>
                <input
                  type="number"
                  inputMode="decimal"
                  value={financials.roa_pct}
                  onChange={handleChange('roa_pct')}
                  placeholder="Ví dụ: 9.5"
                />
              </div>
              <div className="form-field">
                <label>P/E</label>
                <input
                  type="number"
                  inputMode="decimal"
                  value={financials.pe}
                  onChange={handleChange('pe')}
                  placeholder="Ví dụ: 20.1"
                />
              </div>
              <div className="form-field">
                <label>P/B</label>
                <input
                  type="number"
                  inputMode="decimal"
                  value={financials.pb}
                  onChange={handleChange('pb')}
                  placeholder="Ví dụ: 3.2"
                />
              </div>
              <div className="form-field">
                <label>Tăng trưởng doanh thu 3 năm (%)</label>
                <input
                  type="number"
                  inputMode="decimal"
                  value={financials.revenue_growth_3y_pct}
                  onChange={handleChange('revenue_growth_3y_pct')}
                  placeholder="Ví dụ: 15"
                />
              </div>
              <div className="form-field">
                <label>Tăng trưởng lợi nhuận ròng 3 năm (%)</label>
                <input
                  type="number"
                  inputMode="decimal"
                  value={financials.net_income_growth_3y_pct}
                  onChange={handleChange('net_income_growth_3y_pct')}
                  placeholder="Ví dụ: 12"
                />
              </div>
            </div>

            <div className="form-field">
              <label>Ghi chú (tùy chọn)</label>
              <textarea
                rows={3}
                value={financials.notes}
                onChange={handleChange('notes')}
                placeholder="Bạn có thể ghi thêm bối cảnh, sự kiện đặc biệt, kế hoạch doanh nghiệp..."
              />
            </div>

            {error && <div className="form-error">{error}</div>}

            <button className="primary-button" type="submit" disabled={loading}>
              {loading ? 'Đang phân tích...' : 'Phân tích với AI'}
            </button>
          </form>
        </section>

        <section className="panel">
          <h2 className="panel-title">Kết quả phân tích</h2>
          {!result && !loading && (
            <p className="muted">
              Kết quả phân tích sẽ hiển thị tại đây sau khi bạn gửi form (phân tích do AI tạo).
            </p>
          )}

          {loading && <p className="muted">Đang phân tích với AI...</p>}

          {result && (
            <div className="analysis">
              <div className="analysis-header">
                <span className="badge">Financial</span>
                <span className="ticker">{result.ticker}</span>
              </div>

              <section className="analysis-section">
                <h3>Tổng quan</h3>
                <p>{result.analysis.overview}</p>
              </section>

              <section className="analysis-section">
                <h3>Điểm mạnh</h3>
                <ul>
                  {result.analysis.strengths.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </section>

              <section className="analysis-section">
                <h3>Điểm yếu</h3>
                <ul>
                  {result.analysis.weaknesses.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </section>

              <section className="analysis-section">
                <h3>Rủi ro tài chính</h3>
                <ul>
                  {result.analysis.risks.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </section>

              <section className="analysis-section">
                <h3>Chất lượng dòng tiền</h3>
                <p>{result.analysis.cashflow_quality}</p>
              </section>

              <section className="analysis-section">
                <h3>Kết luận tổng thể</h3>
                <p>{result.analysis.conclusion}</p>
              </section>
            </div>
          )}
        </section>
      </div>
    </div>
  )
}

function StockAnalysisPage() {
  const [ticker, setTicker] = useState('')
  const [horizon, setHorizon] = useState<'short' | 'medium' | 'long'>('medium')
  const [riskProfile, setRiskProfile] = useState<'low' | 'medium' | 'high'>('medium')
  const [currentPrice, setCurrentPrice] = useState('')
  const [targetPrice, setTargetPrice] = useState('')
  const [notes, setNotes] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [result, setResult] = useState<StockAnalysisResponse | null>(null)

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()
    setError(null)

    if (!ticker.trim()) {
      setError('Vui lòng nhập mã cổ phiếu.')
      return
    }

    setLoading(true)
    try {
      const payload = {
        ticker: ticker.trim().toUpperCase(),
        horizon,
        risk_profile: riskProfile,
        current_price: Number(currentPrice) || null,
        target_price: Number(targetPrice) || null,
        notes: notes || null,
      }

      const response = await createStockAnalysis(payload)
      setResult(response)
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Đã xảy ra lỗi không xác định.'
      setError(message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="page">
      <h1>Phân tích cổ phiếu</h1>
      <p>
        Nhập mã cổ phiếu và một vài thông tin cơ bản về kỳ vọng của bạn. Hệ thống sẽ trả về gợi ý
        luận điểm đầu tư, catalyst, rủi ro và kịch bản giá (hiện đang dùng dữ liệu minh hoạ từ API
        Rails).
      </p>

      <div className="layout-two-columns">
        <section className="panel">
          <h2 className="panel-title">Thiết lập ý tưởng giao dịch</h2>
          <form className="form" onSubmit={handleSubmit}>
            <div className="form-row">
              <div className="form-field">
                <label htmlFor="stock-ticker">Mã cổ phiếu</label>
                <input
                  id="stock-ticker"
                  value={ticker}
                  onChange={(e) => setTicker(e.target.value.toUpperCase())}
                  placeholder="Ví dụ: FPT, MWG..."
                  autoComplete="off"
                  required
                />
              </div>

              <div className="form-field">
                <label htmlFor="horizon">Khung thời gian</label>
                <select
                  id="horizon"
                  value={horizon}
                  onChange={(e) => setHorizon(e.target.value as typeof horizon)}
                >
                  <option value="short">Ngắn hạn (vài tuần - 3 tháng)</option>
                  <option value="medium">Trung hạn (3-12 tháng)</option>
                  <option value="long">Dài hạn (&gt; 1 năm)</option>
                </select>
              </div>
            </div>

            <div className="form-row">
              <div className="form-field">
                <label htmlFor="risk-profile">Mức chấp nhận rủi ro</label>
                <select
                  id="risk-profile"
                  value={riskProfile}
                  onChange={(e) => setRiskProfile(e.target.value as typeof riskProfile)}
                >
                  <option value="low">Thấp (ưu tiên an toàn vốn)</option>
                  <option value="medium">Trung bình</option>
                  <option value="high">Cao (chấp nhận biến động mạnh)</option>
                </select>
              </div>

              <div className="form-field">
                <label>Giá hiện tại (tùy chọn)</label>
                <input
                  type="number"
                  inputMode="decimal"
                  value={currentPrice}
                  onChange={(e) => setCurrentPrice(e.target.value)}
                  placeholder="Ví dụ: 95000"
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-field">
                <label>Giá mục tiêu (tùy chọn)</label>
                <input
                  type="number"
                  inputMode="decimal"
                  value={targetPrice}
                  onChange={(e) => setTargetPrice(e.target.value)}
                  placeholder="Ví dụ: 115000"
                />
              </div>
            </div>

            <div className="form-field">
              <label>Ghi chú thêm (tùy chọn)</label>
              <textarea
                rows={3}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Bạn có thể thêm luận điểm riêng, thông tin doanh nghiệp, sự kiện sắp tới..."
              />
            </div>

            {error && <div className="form-error">{error}</div>}

            <button className="primary-button" type="submit" disabled={loading}>
              {loading ? 'Đang phân tích...' : 'Phân tích ý tưởng với AI'}
            </button>
          </form>
        </section>

        <section className="panel">
          <h2 className="panel-title">Kết quả phân tích</h2>
          {!result && !loading && (
            <p className="muted">
              Kết quả phân tích cổ phiếu sẽ hiển thị tại đây sau khi bạn gửi form. Hiện hệ thống
              đang sử dụng dữ liệu mock từ API Rails.
            </p>
          )}

          {loading && <p className="muted">Đang phân tích ý tưởng giao dịch...</p>}

          {result && (
            <div className="analysis">
              <div className="analysis-header">
                <span className="badge">Stock</span>
                <span className="ticker">{result.ticker}</span>
              </div>

              <section className="analysis-section">
                <h3>Luận điểm đầu tư</h3>
                <ul>
                  {result.analysis.investment_thesis.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </section>

              <section className="analysis-section">
                <h3>Catalyst / Động lực tăng giá</h3>
                <ul>
                  {result.analysis.catalysts.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </section>

              <section className="analysis-section">
                <h3>Rủi ro chính</h3>
                <ul>
                  {result.analysis.risks.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </section>

              <section className="analysis-section">
                <h3>Kịch bản giá</h3>
                <ul>
                  <li>
                    <strong>Kịch bản tích cực (bull):</strong> {result.analysis.scenarios.bull}
                  </li>
                  <li>
                    <strong>Kịch bản cơ sở (base):</strong> {result.analysis.scenarios.base}
                  </li>
                  <li>
                    <strong>Kịch bản tiêu cực (bear):</strong> {result.analysis.scenarios.bear}
                  </li>
                </ul>
              </section>

              <section className="analysis-section">
                <h3>Nhận xét về định giá</h3>
                <p>{result.analysis.valuation_comment}</p>
              </section>
            </div>
          )}
        </section>
      </div>
    </div>
  )
}

function ReportSummaryPage() {
  return (
    <div className="page">
      <h1>Tóm tắt báo cáo</h1>
      <p>Form và kết quả AI sẽ được bổ sung ở bước kế tiếp.</p>
    </div>
  )
}

function NewsInsightPage() {
  return (
    <div className="page">
      <h1>Tin tức & insight</h1>
      <p>Form và kết quả AI sẽ được bổ sung ở bước kế tiếp.</p>
    </div>
  )
}

export default App
