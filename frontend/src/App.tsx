import { BrowserRouter, Routes, Route, Link, NavLink } from 'react-router-dom'
import './App.css'

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
    <div className="page">
      <h1>Finance AI Dashboard</h1>
      <p>Chọn loại phân tích bạn muốn sử dụng.</p>
      <div className="card-grid">
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
  return (
    <div className="page">
      <h1>Phân tích tài chính doanh nghiệp</h1>
      <p>Form và kết quả AI sẽ được bổ sung ở bước kế tiếp.</p>
    </div>
  )
}

function StockAnalysisPage() {
  return (
    <div className="page">
      <h1>Phân tích cổ phiếu</h1>
      <p>Form và kết quả AI sẽ được bổ sung ở bước kế tiếp.</p>
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
