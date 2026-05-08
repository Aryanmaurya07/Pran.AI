import { Link } from 'react-router-dom';

const HINDI_FONT = { fontFamily: "'Tiro Devanagari Hindi', serif", fontWeight: 700 };

const Logo = () => (
  <Link to="/" className="inline-flex items-center gap-2.5 group">
    <div className="w-9 h-9 rounded-xl bg-teal-600 flex items-center justify-center shadow-sm flex-shrink-0 group-hover:bg-teal-700 transition-colors duration-200">
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
        <path
          d="M3 12h3l2-7 4 14 3-10 2 3h4"
          stroke="white"
          strokeWidth="2.2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </div>
    <span className="text-xl tracking-tight leading-none select-none flex items-baseline gap-0">
      <span style={HINDI_FONT} className="text-slate-900 text-[22px]">प्राण</span>
      <span className="font-bold text-slate-400 text-lg">.</span>
      <span className="font-bold text-teal-600 text-xl">AI</span>
    </span>
  </Link>
);

export default Logo;