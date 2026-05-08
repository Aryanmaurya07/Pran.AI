import { Link } from 'react-router-dom';
import usePageTitle from '../hooks/usePageTitle';

const About = () => {
  usePageTitle('About Us');

  return (
    <div className="bg-white min-h-screen pt-24 pb-20 px-4">
      <div className="max-w-4xl mx-auto">

        <div className="text-center mb-16">
          <span className="inline-block bg-teal-50 text-teal-700 text-xs font-semibold tracking-widest uppercase px-3 py-1 rounded-full border border-teal-200 mb-4">About</span>
          <h1 className="text-4xl sm:text-5xl font-extrabold text-slate-900 mb-5">
            The story behind<br /><span className="text-teal-600">प्राण.AI</span>
          </h1>
          <p className="text-slate-500 text-xl max-w-2xl mx-auto leading-relaxed">
            A student-built AI platform with a real-world problem at its core.
          </p>
        </div>

        <div className="prose prose-slate max-w-none">
          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-8 mb-10">
            <h2 className="text-xl font-bold text-slate-900 mb-3">The problem we're solving</h2>
            <p className="text-slate-600 leading-relaxed">
              India has approximately 1 doctor per 1,456 patients — far below the WHO-recommended ratio of 1:1000.
              The result? Overcrowded hospitals, 4-hour waits for 10-minute consultations, patients consulting the
              wrong specialist entirely, and millions of people in rural and semi-urban areas who simply can't
              access qualified medical guidance when they need it.
            </p>
            <p className="text-slate-600 leading-relaxed mt-3">
              प्राण.AI doesn't try to replace doctors. It does something more pragmatic: it gives people the
              intelligence to understand their own symptoms, gauge urgency, and navigate to the right care —
              faster, smarter, and completely free.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-10">
            {[
              { title: 'Our mission', body: 'Make preliminary health intelligence accessible to every person, regardless of geography, digital literacy, or financial status.' },
              { title: 'Our approach', body: 'Multi-modal AI input (text, voice) + Google Gemini analysis + location-aware doctor discovery. One platform. Zero friction.' },
              { title: 'Built by', body: 'Aryan Maurya — B.Tech CSE Year 3, St. Andrews Institute of Technology & Management, Gurugram (MDU Rohtak).' },
              { title: 'Future vision', body: 'Hospital management, doctor dashboards, health analytics, multi-language support, image input, and AI follow-up consultations.' },
            ].map((item, i) => (
              <div key={i} className="bg-white border border-slate-200 rounded-2xl p-6 hover:border-teal-200 transition-colors">
                <h3 className="font-bold text-slate-900 mb-2">{item.title}</h3>
                <p className="text-slate-500 text-sm leading-relaxed">{item.body}</p>
              </div>
            ))}
          </div>

          <div className="bg-teal-50 border border-teal-200 rounded-2xl p-8 mb-10">
            <h2 className="text-xl font-bold text-slate-900 mb-4">Technology stack</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {[
                'React.js v18', 'Tailwind CSS', 'Node.js + Express',
                'MongoDB Atlas', 'Google Gemini API', 'Web Speech API',
                'Leaflet.js', 'OpenStreetMap', 'JWT Auth',
              ].map(t => (
                <div key={t} className="bg-white border border-teal-100 rounded-lg px-3 py-2 text-sm font-medium text-teal-700 text-center">
                  {t}
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="text-center">
          <Link to="/register"
            className="inline-flex items-center gap-2 bg-teal-600 hover:bg-teal-700 text-white font-semibold px-8 py-4 rounded-xl transition-all hover:shadow-lg active:scale-95">
            Try प्राण.AI for free
          </Link>
          <p className="text-slate-400 text-sm mt-4">
            Questions? <Link to="/contact" className="text-teal-600 hover:underline">Reach out to us</Link>
          </p>
        </div>

      </div>
    </div>
  );
};

export default About;