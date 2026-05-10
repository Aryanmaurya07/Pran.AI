import { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import SeverityBadge from '../components/SeverityBadge';
import usePageTitle from '../hooks/usePageTitle';

// ── Info card ──────────────────────────────────────────────────────────────────
const InfoCard = ({ icon, label, value, sub }) => (
  <div className="bg-white border border-slate-200 rounded-2xl p-5 hover:border-teal-200 hover:shadow-sm transition-all">
    <div className="flex items-start gap-3">
      <div className="w-10 h-10 rounded-xl bg-teal-50 border border-teal-100 flex items-center justify-center flex-shrink-0">
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-0.5">{label}</p>
        <p className="text-slate-900 font-semibold text-sm leading-snug">{value}</p>
        {sub && <p className="text-slate-400 text-xs mt-0.5">{sub}</p>}
      </div>
    </div>
  </div>
);

// ── Reliability score widget ───────────────────────────────────────────────────
const ReliabilityScore = ({ score, note }) => {
  if (score === null || score === undefined) return null;

  const color = score >= 85
    ? { bar: 'bg-green-500',  text: 'text-green-700',  bg: 'bg-green-50 border-green-200',  label: 'High Confidence' }
    : score >= 65
    ? { bar: 'bg-teal-500',   text: 'text-teal-700',   bg: 'bg-teal-50 border-teal-200',    label: 'Moderate Confidence' }
    : score >= 40
    ? { bar: 'bg-amber-500',  text: 'text-amber-700',  bg: 'bg-amber-50 border-amber-200',  label: 'Low Confidence' }
    : { bar: 'bg-red-500',    text: 'text-red-700',    bg: 'bg-red-50 border-red-200',      label: 'Very Low Confidence' };

  return (
    <div className={`border rounded-2xl p-5 mb-6 ${color.bg}`}>
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={color.text}>
            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
          </svg>
          <p className={`text-sm font-bold ${color.text}`}>AI Reliability Score</p>
        </div>
        <span className={`text-2xl font-extrabold ${color.text}`}>
          {score}<span className="text-sm font-semibold">/100</span>
        </span>
      </div>
      <div className="w-full bg-white/60 rounded-full h-2 mb-3">
        <div className={`h-2 rounded-full transition-all duration-700 ${color.bar}`} style={{ width: `${score}%` }} />
      </div>
      <div className="flex items-start justify-between gap-3">
        <p className="text-xs text-slate-600 leading-relaxed flex-1">{note}</p>
        <span className={`text-xs font-bold px-2 py-1 rounded-lg bg-white/70 flex-shrink-0 ${color.text}`}>
          {color.label}
        </span>
      </div>
    </div>
  );
};

// ── PDF Generator using jsPDF ──────────────────────────────────────────────────
const generatePDF = async (result) => {
  // Dynamically import jsPDF so it doesn't bloat initial bundle
  const { jsPDF } = await import('jspdf');

  const doc = new jsPDF({ unit: 'mm', format: 'a4' });
  const pageW = 210;
  const pageH = 297;
  const margin = 20;
  const contentW = pageW - margin * 2;
  let y = 0;

  // ── Helpers ────────────────────────────────────────────────────────────────
  const addPage = () => {
    doc.addPage();
    y = 20;
  };

  const checkY = (needed = 10) => {
    if (y + needed > pageH - 20) addPage();
  };

  const drawRect = (x, ry, w, h, r = 4) => {
    doc.roundedRect(x, ry, w, h, r, r, 'F');
  };

  const wrapText = (text, x, ry, maxW, lineH = 5) => {
    const lines = doc.splitTextToSize(String(text || ''), maxW);
    lines.forEach(line => {
      checkY(lineH + 2);
      doc.text(line, x, ry);
      ry += lineH;
    });
    return ry;
  };

  // ── HEADER ─────────────────────────────────────────────────────────────────
  // Teal header bar
  doc.setFillColor(13, 148, 136); // teal-600
  doc.rect(0, 0, pageW, 45, 'F');

  // Pulse icon circle
  doc.setFillColor(255, 255, 255, 0.2);
  doc.circle(margin + 8, 22, 8, 'F');
  doc.setDrawColor(255, 255, 255);
  doc.setLineWidth(1.5);
  // Simple pulse line in circle
  doc.line(margin + 3, 22, margin + 5.5, 22);
  doc.line(margin + 5.5, 22, margin + 7, 18);
  doc.line(margin + 7, 18, margin + 9, 26);
  doc.line(margin + 9, 26, margin + 10.5, 22);
  doc.line(margin + 10.5, 22, margin + 13, 22);

  // Brand name
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(20);
  doc.setTextColor(255, 255, 255);
  doc.text('Pran.AI', margin + 20, 20);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(204, 245, 238);
  doc.text('AI-Powered Health Assessment Report', margin + 20, 27);

  // Date/time top right
  const now = new Date();
  const dateStr = now.toLocaleDateString('en-IN', { day: '2-digit', month: 'long', year: 'numeric' });
  const timeStr = now.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
  doc.setFontSize(8);
  doc.setTextColor(204, 245, 238);
  doc.text(`${dateStr}  ${timeStr}`, pageW - margin, 20, { align: 'right' });
  doc.text('pran-ai-one.vercel.app', pageW - margin, 26, { align: 'right' });

  y = 55;

  // ── SEVERITY BANNER ────────────────────────────────────────────────────────
  const sevColors = {
    Mild:     [220, 252, 231], // green-100
    Moderate: [254, 243, 199], // amber-100
    Serious:  [254, 226, 226], // red-100
  };
  const sevTextColors = {
    Mild:     [21, 128, 61],
    Moderate: [146, 64, 14],
    Serious:  [185, 28, 28],
  };
  const sc = sevColors[result.severity]    || [241, 245, 249];
  const st = sevTextColors[result.severity] || [51, 65, 85];

  doc.setFillColor(...sc);
  drawRect(margin, y, contentW, 22, 4);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  doc.setTextColor(...st);
  doc.text(result.condition || 'Unknown Condition', margin + 5, y + 9);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(...st);
  doc.text(`Severity: ${result.severity}`, margin + 5, y + 16);

  // Reliability badge top-right of banner
  if (result.reliabilityScore !== null && result.reliabilityScore !== undefined) {
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    doc.setTextColor(13, 148, 136);
    doc.text(`AI Confidence: ${result.reliabilityScore}/100`, pageW - margin - 2, y + 9, { align: 'right' });
  }

  y += 30;

  // ── PATIENT INFORMATION ────────────────────────────────────────────────────
  const hasPatientInfo = result.patientAge || result.patientGender || result.symptomDuration || result.painLevel || result.existingConditions;

  if (hasPatientInfo) {
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.setTextColor(15, 23, 42); // slate-900
    doc.text('Patient Information', margin, y);
    y += 5;

    doc.setFillColor(248, 250, 252); // slate-50
    const patientFields = [
      result.patientAge        ? ['Age',               `${result.patientAge} years`]       : null,
      result.patientGender     ? ['Gender',             result.patientGender]                : null,
      result.symptomDuration   ? ['Symptom Duration',   result.symptomDuration]              : null,
      result.painLevel         ? ['Pain Level',         `${result.painLevel} / 10`]          : null,
      result.existingConditions? ['Existing Conditions',result.existingConditions]           : null,
    ].filter(Boolean);

    const colW = contentW / 2 - 3;
    let col = 0;
    let rowY = y;

    patientFields.forEach(([label, value]) => {
      const x = col === 0 ? margin : margin + colW + 6;
      doc.setFillColor(248, 250, 252);
      drawRect(x, rowY, colW, 14, 3);

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(7);
      doc.setTextColor(100, 116, 139); // slate-400
      doc.text(label.toUpperCase(), x + 4, rowY + 5);

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(9);
      doc.setTextColor(15, 23, 42);
      doc.text(String(value), x + 4, rowY + 11);

      col++;
      if (col === 2) { col = 0; rowY += 18; }
    });

    if (col !== 0) rowY += 18;
    y = rowY + 4;
  }

  // ── SYMPTOMS DESCRIBED ─────────────────────────────────────────────────────
  if (result.rawInput) {
    checkY(20);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.setTextColor(15, 23, 42);
    doc.text('Symptoms Described', margin, y);
    y += 5;

    doc.setFillColor(240, 253, 250); // teal-50
    const sympLines = doc.splitTextToSize(result.rawInput, contentW - 10);
    const sympH = sympLines.length * 5 + 8;
    drawRect(margin, y, contentW, sympH, 3);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.setTextColor(51, 65, 85);
    sympLines.forEach((line, i) => {
      doc.text(line, margin + 5, y + 6 + i * 5);
    });
    y += sympH + 8;
  }

  // ── AI ASSESSMENT ──────────────────────────────────────────────────────────
  checkY(30);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(15, 23, 42);
  doc.text('AI Assessment', margin, y);
  y += 5;

  // Description box
  doc.setFillColor(248, 250, 252);
  const descLines = doc.splitTextToSize(result.description || '', contentW - 10);
  const descH = descLines.length * 5 + 8;
  drawRect(margin, y, contentW, descH, 3);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(71, 85, 105);
  descLines.forEach((line, i) => {
    doc.text(line, margin + 5, y + 6 + i * 5);
  });
  y += descH + 5;

  // Doctor + Urgency side by side
  checkY(20);
  const halfW = contentW / 2 - 3;

  doc.setFillColor(240, 253, 250);
  drawRect(margin, y, halfW, 18, 3);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7);
  doc.setTextColor(100, 116, 139);
  doc.text('RECOMMENDED SPECIALIST', margin + 4, y + 5);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(13, 148, 136);
  const docLines = doc.splitTextToSize(result.doctorType || 'General Physician', halfW - 8);
  docLines.forEach((line, i) => doc.text(line, margin + 4, y + 11 + i * 4));

  doc.setFillColor(240, 253, 250);
  drawRect(margin + halfW + 6, y, halfW, 18, 3);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7);
  doc.setTextColor(100, 116, 139);
  doc.text('WHEN TO CONSULT', margin + halfW + 10, y + 5);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(13, 148, 136);
  const urgLines = doc.splitTextToSize(result.urgency || 'As soon as possible', halfW - 8);
  urgLines.forEach((line, i) => doc.text(line, margin + halfW + 10, y + 11 + i * 4));

  y += 26;

  // ── HOME CARE STEPS ────────────────────────────────────────────────────────
  const remedyList = result.remedies
    ? result.remedies.split(';').map(r => r.trim()).filter(Boolean)
    : [];

  if (remedyList.length > 0) {
    checkY(20);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.setTextColor(15, 23, 42);
    doc.text('Home Care Steps', margin, y);
    y += 5;

    remedyList.forEach((remedy, i) => {
      const lines = doc.splitTextToSize(remedy, contentW - 16);
      const boxH = lines.length * 5 + 8;
      checkY(boxH + 4);

      doc.setFillColor(248, 250, 252);
      drawRect(margin, y, contentW, boxH, 3);

      // Numbered circle
      doc.setFillColor(13, 148, 136);
      doc.circle(margin + 6, y + boxH / 2, 4, 'F');
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(8);
      doc.setTextColor(255, 255, 255);
      doc.text(String(i + 1), margin + 6, y + boxH / 2 + 2.5, { align: 'center' });

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(9);
      doc.setTextColor(51, 65, 85);
      lines.forEach((line, li) => {
        doc.text(line, margin + 14, y + 6 + li * 5);
      });

      y += boxH + 4;
    });
  }

  // ── RELIABILITY SCORE ──────────────────────────────────────────────────────
  if (result.reliabilityScore !== null && result.reliabilityScore !== undefined) {
    checkY(30);
    y += 4;

    const rColors = result.reliabilityScore >= 85 ? [[220, 252, 231], [21, 128, 61]]
      : result.reliabilityScore >= 65 ? [[204, 251, 241], [13, 148, 136]]
      : result.reliabilityScore >= 40 ? [[254, 243, 199], [146, 64, 14]]
      : [[254, 226, 226], [185, 28, 28]];

    doc.setFillColor(...rColors[0]);
    drawRect(margin, y, contentW, 24, 4);

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.setTextColor(...rColors[1]);
    doc.text('AI RELIABILITY SCORE', margin + 5, y + 7);

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(16);
    doc.text(`${result.reliabilityScore}/100`, pageW - margin - 5, y + 10, { align: 'right' });

    // Progress bar
    doc.setFillColor(255, 255, 255, 0.5);
    drawRect(margin + 5, y + 11, contentW - 10, 3, 1.5);
    doc.setFillColor(...rColors[1]);
    drawRect(margin + 5, y + 11, (contentW - 10) * (result.reliabilityScore / 100), 3, 1.5);

    if (result.reliabilityNote) {
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8);
      doc.setTextColor(...rColors[1]);
      const noteLines = doc.splitTextToSize(result.reliabilityNote, contentW - 10);
      noteLines.forEach((line, i) => doc.text(line, margin + 5, y + 18 + i * 4));
    }

    y += 32;
  }

  // ── SERIOUS WARNING ────────────────────────────────────────────────────────
  if (result.severity === 'Serious') {
    checkY(22);
    doc.setFillColor(254, 226, 226);
    drawRect(margin, y, contentW, 20, 4);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.setTextColor(185, 28, 28);
    doc.text('⚠  SEEK MEDICAL ATTENTION PROMPTLY', margin + 5, y + 7);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    const warnLines = doc.splitTextToSize(
      'Your symptoms indicate a condition requiring urgent professional evaluation. Please see a doctor immediately or visit the nearest emergency facility.',
      contentW - 10
    );
    warnLines.forEach((line, i) => doc.text(line, margin + 5, y + 13 + i * 4));
    y += 28;
  }

  // ── DISCLAIMER ─────────────────────────────────────────────────────────────
  checkY(25);
  y += 5;
  doc.setFillColor(241, 245, 249);
  drawRect(margin, y, contentW, 22, 4);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(100, 116, 139);
  doc.text('DISCLAIMER', margin + 5, y + 6);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  const disclaimerLines = doc.splitTextToSize(
    'This report is AI-generated and for informational purposes ONLY. It is NOT a substitute for professional medical diagnosis or treatment. Always consult a qualified healthcare professional before making any medical decisions. In case of emergency, call 112 immediately.',
    contentW - 10
  );
  disclaimerLines.forEach((line, i) => doc.text(line, margin + 5, y + 11 + i * 4));
  y += 28;

  // ── FOOTER ─────────────────────────────────────────────────────────────────
  const totalPages = doc.internal.getNumberOfPages();
  for (let p = 1; p <= totalPages; p++) {
    doc.setPage(p);
    doc.setFillColor(13, 148, 136);
    doc.rect(0, pageH - 12, pageW, 12, 'F');
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7);
    doc.setTextColor(255, 255, 255);
    doc.text('Generated by Pran.AI  —  Free. Always.  —  pran-ai-one.vercel.app', margin, pageH - 5);
    doc.text(`Page ${p} of ${totalPages}`, pageW - margin, pageH - 5, { align: 'right' });
  }

  // ── SAVE ───────────────────────────────────────────────────────────────────
  const fileName = `PranAI_Report_${now.toISOString().slice(0, 10)}.pdf`;
  doc.save(fileName);
};

// ── Main Results component ─────────────────────────────────────────────────────
const Results = () => {
  usePageTitle('Your Assessment');
  const [result, setResult] = useState(null);
  const [animate, setAnimate] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const saved = localStorage.getItem('pranix_last_result');
    if (!saved) { navigate('/symptoms'); return; }
    setResult(JSON.parse(saved));
    setTimeout(() => setAnimate(true), 100);
  }, []);

  if (!result) return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center">
      <div className="w-10 h-10 border-2 border-teal-500 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  const remedyList = result.remedies
    ? result.remedies.split(';').map(r => r.trim()).filter(Boolean)
    : [];

  const severityColor = {
    Mild:     'from-green-50 to-teal-50 border-green-200',
    Moderate: 'from-amber-50 to-orange-50 border-amber-200',
    Serious:  'from-red-50 to-rose-50 border-red-200'
  }[result.severity] || 'from-slate-50 to-white border-slate-200';

  const handleDownload = async () => {
    setDownloading(true);
    try {
      await generatePDF(result);
    } catch (err) {
      console.error('PDF generation failed:', err);
      alert('PDF generation failed. Please try again.');
    } finally {
      setDownloading(false);
    }
  };

  return (
    <div className={`min-h-screen bg-slate-50 pt-20 transition-all duration-500 ${animate ? 'opacity-100' : 'opacity-0 translate-y-4'}`}>
      <div className="max-w-3xl mx-auto px-4 py-10">

        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-full bg-teal-600 flex items-center justify-center mx-auto mb-4 shadow-lg shadow-teal-500/20">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5">
              <path d="M20 6L9 17l-5-5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <h1 className="text-3xl font-extrabold text-slate-900 mb-2">Assessment complete</h1>
          <p className="text-slate-500">Here's what प्राण.AI found based on your symptoms</p>
        </div>

        {/* Patient info summary */}
        {(result.patientAge || result.patientGender || result.symptomDuration) && (
          <div className="bg-white border border-slate-200 rounded-2xl px-5 py-4 mb-6 flex flex-wrap gap-4">
            {result.patientAge && (
              <div><span className="text-slate-400 text-xs font-semibold uppercase">Age</span><p className="font-semibold text-slate-800">{result.patientAge} yrs</p></div>
            )}
            {result.patientGender && (
              <div><span className="text-slate-400 text-xs font-semibold uppercase">Gender</span><p className="font-semibold text-slate-800">{result.patientGender}</p></div>
            )}
            {result.symptomDuration && (
              <div><span className="text-slate-400 text-xs font-semibold uppercase">Duration</span><p className="font-semibold text-slate-800">{result.symptomDuration}</p></div>
            )}
            {result.painLevel && (
              <div><span className="text-slate-400 text-xs font-semibold uppercase">Pain Level</span><p className="font-semibold text-slate-800">{result.painLevel}/10</p></div>
            )}
          </div>
        )}

        {/* Main condition card */}
        <div className={`bg-gradient-to-br ${severityColor} border rounded-3xl p-7 mb-6`}>
          <div className="flex items-start justify-between gap-4 mb-4">
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Probable condition</p>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900">{result.condition}</h2>
            </div>
            <SeverityBadge severity={result.severity} showBar />
          </div>
          <p className="text-slate-600 text-sm leading-relaxed">{result.description}</p>
        </div>

        {/* Reliability score */}
        <ReliabilityScore score={result.reliabilityScore} note={result.reliabilityNote} />

        {/* Info grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
          <InfoCard
            label="Consult"
            value={result.doctorType}
            sub="Recommended specialist"
            icon={<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#0d9488" strokeWidth="2"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>}
          />
          <InfoCard
            label="Urgency"
            value={result.urgency || 'See a doctor soon'}
            sub="When to seek care"
            icon={<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#0d9488" strokeWidth="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14" strokeLinecap="round"/></svg>}
          />
        </div>

        {/* Remedies */}
        {remedyList.length > 0 && (
          <div className="bg-white border border-slate-200 rounded-2xl p-6 mb-6">
            <h3 className="font-bold text-slate-900 mb-4 flex items-center gap-2">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#0d9488" strokeWidth="2">
                <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/>
              </svg>
              Home care steps
            </h3>
            <ul className="space-y-3">
              {remedyList.map((remedy, i) => (
                <li key={i} className="flex items-start gap-3 text-sm text-slate-600 leading-relaxed">
                  <span className="w-6 h-6 rounded-full bg-teal-50 border border-teal-200 text-teal-700 text-xs font-bold flex items-center justify-center flex-shrink-0 mt-0.5">
                    {i + 1}
                  </span>
                  {remedy}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Serious warning */}
        {result.severity === 'Serious' && (
          <div className="bg-red-50 border border-red-200 rounded-2xl p-5 mb-6 flex gap-3">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#dc2626" strokeWidth="2" className="flex-shrink-0 mt-0.5">
              <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/>
              <line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>
            </svg>
            <div>
              <p className="font-semibold text-red-700 text-sm">Seek medical attention promptly</p>
              <p className="text-red-600 text-xs mt-1">Your symptoms indicate a condition that needs urgent professional evaluation. Please see a doctor as soon as possible or visit the nearest emergency facility.</p>
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-3 mb-3">
          <Link to="/nearby-doctors"
            className="flex-1 bg-teal-600 hover:bg-teal-700 text-white font-bold py-4 px-6 rounded-2xl text-center transition-all hover:shadow-lg hover:shadow-teal-500/20 active:scale-[0.98] flex items-center justify-center gap-2">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z"/>
              <circle cx="12" cy="9" r="2.5"/>
            </svg>
            Find nearby doctors
          </Link>
          <Link to="/symptoms"
            className="flex-1 bg-white border border-slate-200 hover:border-slate-300 text-slate-700 font-semibold py-4 px-6 rounded-2xl text-center transition-all hover:shadow-sm active:scale-[0.98] flex items-center justify-center gap-2">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M1 4v6h6M23 20v-6h-6"/>
              <path d="M20.49 9A9 9 0 005.64 5.64L1 10M23 14l-4.64 4.36A9 9 0 013.51 15" strokeLinecap="round"/>
            </svg>
            Check again
          </Link>
        </div>

        {/* Download PDF button */}
        <button
          onClick={handleDownload}
          disabled={downloading}
          className="w-full bg-slate-800 hover:bg-slate-900 disabled:bg-slate-500 disabled:cursor-not-allowed text-white font-semibold py-4 px-6 rounded-2xl transition-all active:scale-[0.98] flex items-center justify-center gap-2">
          {downloading ? (
            <>
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              Generating PDF...
            </>
          ) : (
            <>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/>
                <polyline points="7 10 12 15 17 10"/>
                <line x1="12" y1="15" x2="12" y2="3"/>
              </svg>
              Download PDF Report
            </>
          )}
        </button>

        <p className="text-center text-slate-400 text-xs mt-8 leading-relaxed max-w-md mx-auto">
          This assessment is AI-generated and for informational purposes only.
          It is not a substitute for professional medical diagnosis or treatment.
        </p>
      </div>
    </div>
  );
};

export default Results;