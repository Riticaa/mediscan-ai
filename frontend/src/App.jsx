import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gray-50">
        <header className="bg-white border-b border-gray-200 px-6 py-4">
          <div className="max-w-6xl mx-auto flex items-center gap-3">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <span className="text-white text-sm font-bold">M</span>
            </div>
            <h1 className="text-xl font-semibold text-gray-900">MediScan AI</h1>
            <span className="text-sm text-gray-500 ml-1">
              — Your medical reports, explained in plain language
            </span>
          </div>
        </header>

        <main className="max-w-6xl mx-auto px-6 py-12">
          <div className="text-center">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Understand Your Medical Reports
            </h2>
            <p className="text-lg text-gray-600 mb-8 max-w-2xl mx-auto">
              Upload your blood test, lab report, or radiology PDF and get
              a clear, plain-language explanation — instantly.
            </p>
            <div className="inline-flex items-center gap-2 bg-blue-50 text-blue-700 
                            px-4 py-2 rounded-full text-sm font-medium">
              ✅ Phase 1 complete — Setup done!
            </div>
          </div>
        </main>
      </div>
    </Router>
  )
}

export default App