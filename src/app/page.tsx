import Link from 'next/link';

/** Sample structure SVG illustration for the homepage hero */
function StructureIllustration() {
  return (
    <svg
      viewBox="0 0 480 320"
      className="w-full max-w-lg"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Background */}
      <rect width="480" height="320" rx="12" fill="#F8FAFC" stroke="#E2E8F0" strokeWidth="1" />

      {/* Connection lines */}
      <path d="M240 110 L140 180" stroke="#2563EB" strokeWidth="2" />
      <path d="M240 110 L340 180" stroke="#7C3AED" strokeWidth="2" />
      <path d="M140 230 L140 260" stroke="#DC2626" strokeWidth="2" strokeDasharray="6 3" />

      {/* HoldCo (rectangle - company) */}
      <rect x="170" y="60" width="140" height="50" rx="6" fill="#EFF6FF" stroke="#2563EB" strokeWidth="2" />
      <text x="240" y="82" textAnchor="middle" fill="#1E3A5F" fontWeight="600" fontSize="13">HoldCo Pty Ltd</text>
      <text x="240" y="98" textAnchor="middle" fill="#6B7280" fontSize="10">Company</text>

      {/* Subsidiary (rectangle - company) */}
      <rect x="70" y="180" width="140" height="50" rx="6" fill="#EFF6FF" stroke="#2563EB" strokeWidth="2" />
      <text x="140" y="202" textAnchor="middle" fill="#1E3A5F" fontWeight="600" fontSize="13">OpCo Pty Ltd</text>
      <text x="140" y="218" textAnchor="middle" fill="#6B7280" fontSize="10">100% owned</text>

      {/* Trust (triangle - trust) */}
      <polygon points="340,180 270,230 410,230" fill="#F5F3FF" stroke="#7C3AED" strokeWidth="2" />
      <text x="340" y="215" textAnchor="middle" fill="#4C1D95" fontWeight="600" fontSize="12">Family Trust</text>

      {/* Debt line label */}
      <rect x="90" y="248" width="100" height="22" rx="4" fill="#FEF2F2" stroke="#DC2626" strokeWidth="1" />
      <text x="140" y="263" textAnchor="middle" fill="#DC2626" fontSize="10">$500K Loan</text>

      {/* Ownership label */}
      <text x="175" y="150" textAnchor="middle" fill="#2563EB" fontSize="10" fontWeight="500">Equity</text>
      <text x="310" y="150" textAnchor="middle" fill="#7C3AED" fontSize="10" fontWeight="500">Beneficiary</text>
    </svg>
  );
}

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col bg-white">
      {/* Hero */}
      <main className="flex-1 flex items-center justify-center px-6 py-16">
        <div className="max-w-4xl w-full flex flex-col lg:flex-row items-center gap-12">
          {/* Left: text content */}
          <div className="flex-1 text-center lg:text-left">
            <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl">
              Tax Structuring Tool
            </h1>
            <p className="mt-4 text-lg text-gray-600 leading-relaxed">
              Visual tax structure design for Australian tax professionals.
              Build, analyse, and share complex entity structures with ease.
            </p>

            <ul className="mt-6 space-y-3 text-sm text-gray-600">
              <li className="flex items-center gap-2 justify-center lg:justify-start">
                <span className="w-1.5 h-1.5 rounded-full bg-blue-600 flex-shrink-0" />
                Drag-and-drop entities onto a visual canvas
              </li>
              <li className="flex items-center gap-2 justify-center lg:justify-start">
                <span className="w-1.5 h-1.5 rounded-full bg-violet-600 flex-shrink-0" />
                Connect relationships -- equity, trust, debt, and more
              </li>
              <li className="flex items-center gap-2 justify-center lg:justify-start">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 flex-shrink-0" />
                Export to PDF, PNG, or share via link
              </li>
              <li className="flex items-center gap-2 justify-center lg:justify-start">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-600 flex-shrink-0" />
                Pre-built templates for common structures
              </li>
            </ul>

            <div className="mt-8 flex items-center gap-4 justify-center lg:justify-start">
              <Link
                href="/editor"
                className="rounded-lg bg-blue-600 px-6 py-3 text-sm font-semibold text-white shadow-sm hover:bg-blue-700 transition-colors"
              >
                Open Editor
              </Link>
              <Link
                href="/dashboard"
                className="rounded-lg border border-gray-300 px-6 py-3 text-sm font-semibold text-gray-700 shadow-sm hover:bg-gray-50 transition-colors"
              >
                My Structures
              </Link>
            </div>
          </div>

          {/* Right: illustration */}
          <div className="flex-1 flex justify-center">
            <StructureIllustration />
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-100 py-6 text-center text-xs text-gray-400">
        Built for Australian tax professionals
      </footer>
    </div>
  );
}
