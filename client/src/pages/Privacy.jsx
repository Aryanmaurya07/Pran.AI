import usePageTitle from '../hooks/usePageTitle';

const Section = ({ title, children }) => (
  <div className="mb-8">
    <h2 className="text-lg font-bold text-slate-900 mb-3">{title}</h2>
    <div className="text-slate-500 text-sm leading-relaxed space-y-2">{children}</div>
  </div>
);

const Privacy = () => {
  usePageTitle('Privacy Policy');

  return (
    <div className="bg-white min-h-screen pt-24 pb-20 px-4">
      <div className="max-w-3xl mx-auto">

        <div className="mb-12">
          <span className="inline-block bg-teal-50 text-teal-700 text-xs font-semibold tracking-widest uppercase px-3 py-1 rounded-full border border-teal-200 mb-4">Legal</span>
          <h1 className="text-4xl font-extrabold text-slate-900 mb-3">Privacy Policy</h1>
          <p className="text-slate-400 text-sm">Last updated: January 2025</p>
        </div>

        <div className="bg-teal-50 border border-teal-200 rounded-2xl p-5 mb-10">
          <p className="text-teal-800 text-sm font-medium">
            TL;DR — We collect only what's needed to run प्राण.AI. We never sell your data. Your health information stays yours.
          </p>
        </div>

        <Section title="1. Information we collect">
          <p>When you register, we collect your name, email address, and a securely hashed password. We never store your password in plain text.</p>
          <p>When you use the symptom checker, we store your input (text or voice transcript), the AI-generated assessment, and a timestamp — linked to your account.</p>
          <p>When you book appointments, we store the booking details (doctor name, date, time, reason) linked to your account.</p>
        </Section>

        <Section title="2. How we use your information">
          <p>To operate and improve प्राण.AI — including displaying your history, personalising your dashboard, and improving AI response quality.</p>
          <p>To communicate with you if you contact us via our feedback form.</p>
          <p>We do not use your health data for advertising, profiling, or any commercial purpose.</p>
        </Section>

        <Section title="3. Data sharing">
          <p>We do not sell, rent, or share your personal data with third parties.</p>
          <p>Your symptom inputs are processed by Google Gemini API to generate assessments. Please review Google's AI privacy policy at ai.google.dev for details on how they handle API data.</p>
          <p>Doctor location data is sourced from OpenStreetMap, which is publicly available and does not involve any personal data.</p>
        </Section>

        <Section title="4. Data security">
          <p>All data is stored in MongoDB Atlas with encryption at rest. Passwords are hashed using bcrypt. API communication uses HTTPS/TLS. Authentication uses JWT tokens stored locally in your browser.</p>
        </Section>

        <Section title="5. Data retention">
          <p>Your account and associated data is retained as long as your account is active. You may request deletion of your account and data at any time by contacting us via the Contact page.</p>
        </Section>

        <Section title="6. Your rights">
          <p>You have the right to access, correct, or delete your personal information at any time. Contact us at the Contact page to exercise these rights.</p>
        </Section>

        <Section title="7. Contact">
          <p>For privacy-related concerns, reach us via the <a href="/contact" className="text-teal-600 hover:underline">Contact page</a>. प्राण.AI is developed by Aryan Maurya, B.Tech CSE Year 3, SAITM Gurugram.</p>
        </Section>

      </div>
    </div>
  );
};

export default Privacy;