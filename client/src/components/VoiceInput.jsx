import { useState, useEffect, useRef } from 'react';

const VoiceInput = ({ value, onChange }) => {
  const [listening, setListening] = useState(false);
  const [supported, setSupported] = useState(true);
  const [interim, setInterim] = useState('');
  const [pulseSize, setPulseSize] = useState(1);
  const recognitionRef = useRef(null);
  const animFrameRef = useRef(null);
  // Snapshot of value at the moment mic is started — never changes mid-session
  const baseValueRef = useRef('');
  // Accumulates only the finals from THIS session — resets each time mic starts
  const sessionFinalRef = useRef('');

  useEffect(() => {
    if (!('SpeechRecognition' in window || 'webkitSpeechRecognition' in window)) {
      setSupported(false);
    }
    return () => {
      if (recognitionRef.current) recognitionRef.current.stop();
      cancelAnimationFrame(animFrameRef.current);
    };
  }, []);

  const animatePulse = () => {
    setPulseSize(1 + Math.random() * 0.3);
    animFrameRef.current = requestAnimationFrame(() => {
      setTimeout(animatePulse, 150);
    });
  };

  const startListening = () => {
    // Snapshot the current value before session starts
    baseValueRef.current = value;
    // Reset session finals so we start fresh
    sessionFinalRef.current = '';

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    recognitionRef.current = recognition;

    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = 'en-IN';

    recognition.onstart = () => {
      setListening(true);
      animatePulse();
    };

    recognition.onresult = (event) => {
      let newFinals = '';
      let interimTranscript = '';

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const t = event.results[i][0].transcript;
        if (event.results[i].isFinal) newFinals += t;
        else interimTranscript += t;
      }

      if (newFinals) {
        // Append only the NEW finals from this event to the session accumulator
        sessionFinalRef.current = (sessionFinalRef.current + ' ' + newFinals).trim();
        // Rebuild full value: what was there before mic + what we've heard this session
        const combined = (baseValueRef.current + ' ' + sessionFinalRef.current).trim();
        onChange(combined);
      }

      setInterim(interimTranscript);
    };

    recognition.onerror = () => stopListening();
    recognition.onend = () => stopListening();
    recognition.start();
  };

  const stopListening = () => {
    setListening(false);
    setInterim('');
    cancelAnimationFrame(animFrameRef.current);
    if (recognitionRef.current) recognitionRef.current.stop();
  };

  const toggle = () => listening ? stopListening() : startListening();

  if (!supported) {
    return (
      <div className="bg-amber-50 border border-amber-200 rounded-2xl p-6 text-center">
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#d97706" strokeWidth="1.8" className="mx-auto mb-3">
          <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/>
          <line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>
        </svg>
        <p className="text-amber-700 font-semibold text-sm mb-1">Browser not supported</p>
        <p className="text-amber-600 text-xs">Voice input requires Chrome or Edge. Please switch browsers or use text input.</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center">
      {/* Mic button */}
      <div className="relative flex items-center justify-center mb-8 mt-4">
        {listening && (
          <>
            <div className="absolute w-32 h-32 rounded-full bg-teal-500/10 animate-ping" />
            <div className="absolute rounded-full bg-teal-500/10 transition-transform duration-150"
              style={{ width: `${7 * pulseSize}rem`, height: `${7 * pulseSize}rem` }} />
          </>
        )}
        <button
          onClick={toggle}
          className={`relative z-10 w-24 h-24 rounded-full flex items-center justify-center transition-all duration-300 shadow-lg ${
            listening
              ? 'bg-red-500 hover:bg-red-600 shadow-red-500/30 scale-110'
              : 'bg-teal-600 hover:bg-teal-700 shadow-teal-500/30 hover:scale-105'
          }`}>
          {listening ? (
            <svg width="28" height="28" viewBox="0 0 24 24" fill="white">
              <rect x="6" y="6" width="12" height="12" rx="2"/>
            </svg>
          ) : (
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
              <path d="M12 1a3 3 0 00-3 3v8a3 3 0 006 0V4a3 3 0 00-3-3z"/>
              <path d="M19 10v2a7 7 0 01-14 0v-2M12 19v4M8 23h8" strokeLinecap="round"/>
            </svg>
          )}
        </button>
      </div>

      <p className={`text-sm font-semibold mb-6 transition-colors ${listening ? 'text-red-500' : 'text-slate-500'}`}>
        {listening ? 'Listening... tap to stop' : 'Tap to start speaking'}
      </p>

      {/* Live transcript */}
      {(value || interim) && (
        <div className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-5 min-h-[120px]">
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Transcript</p>
          <p className="text-slate-700 text-sm leading-relaxed">
            {value}
            {interim && <span className="text-slate-400 italic"> {interim}</span>}
          </p>
        </div>
      )}

      {value && (
        <button onClick={() => onChange('')}
          className="mt-3 text-xs text-red-400 hover:text-red-600 transition-colors">
          Clear transcript
        </button>
      )}

      <p className="text-xs text-slate-400 mt-4 text-center">
        Speak clearly in English. Works best in Chrome or Edge.
      </p>
    </div>
  );
};

export default VoiceInput;