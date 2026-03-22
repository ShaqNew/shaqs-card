"use client";

import React, { useState, useRef, useEffect } from 'react';
import { useTimer } from '@/hooks/useTimer';
import Link from 'next/link';

type AnswerType = 'yes' | 'no' | 'cold' | 'heat' | 'combo' | '';

interface Answers {
  q1: AnswerType;
  q2: AnswerType;
  q3: AnswerType;
}

interface Result {
  isWarning: boolean;
  title: string;
  description: React.ReactNode;
}

const QuestionCard = ({ 
  question, 
  name, 
  options, 
  selectedValue,
  onChange 
}: { 
  question: string; 
  name: keyof Answers; 
  options: { label: string; value: AnswerType }[]; 
  selectedValue: AnswerType;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}) => (
  <div className="bg-slate-900/50 backdrop-blur-sm border border-slate-800 p-6 rounded-2xl mb-6 shadow-xl transition-all hover:border-blue-500/30">
    <p className="text-lg font-semibold text-slate-100 mb-4">{question}</p>
    <div className="space-y-3">
      {options.map((opt) => {
        const isSelected = selectedValue === opt.value;
        return (
          <label 
            key={opt.value} 
            className={`flex items-center p-3 rounded-xl cursor-pointer transition-all border-2 ${
              isSelected 
                ? 'bg-blue-500/10 border-blue-500/50 ring-1 ring-blue-500/20' 
                : 'bg-slate-800/30 border-transparent hover:bg-slate-800/50'
            } group`}
          >
            <input 
              type="radio" 
              name={name} 
              value={opt.value} 
              checked={isSelected}
              onChange={onChange} 
              className="w-5 h-5 text-blue-500 bg-slate-800 border-slate-700 focus:ring-blue-500 focus:ring-offset-slate-900"
            />
            <span className={`ml-3 transition-colors ${isSelected ? 'text-white font-medium' : 'text-slate-400 group-hover:text-slate-200'}`}>
              {opt.label}
            </span>
          </label>
        );
      })}
    </div>
  </div>
);

const Timer = ({ timeLeft, isActive, toggle, reset, formatTime }: any) => (
  <div className="mt-8 p-6 bg-slate-900/80 border border-blue-500/20 rounded-2xl text-center shadow-2xl">
    <div className="text-4xl font-mono font-bold text-blue-400 mb-4 tracking-wider transition-all">
      <span className="opacity-70 text-2xl mr-2">⏱️</span>
      {formatTime()}
    </div>
    <div className="flex justify-center gap-4">
      <button 
        onClick={toggle}
        className={`px-6 py-2 rounded-full font-bold transition-all ${
          isActive 
            ? 'bg-amber-500/10 text-amber-500 border border-amber-500/30 hover:bg-amber-500/20' 
            : 'bg-blue-600 text-white hover:bg-blue-500 shadow-lg shadow-blue-600/20'
        }`}
      >
        {isActive ? 'Pause' : 'Start Timer'}
      </button>
      <button 
        onClick={reset}
        className="px-6 py-2 rounded-full font-bold bg-slate-800 text-slate-300 border border-slate-700 hover:bg-slate-700 transition-all"
      >
        Reset
      </button>
    </div>
    <p className="mt-4 text-xs text-slate-500 uppercase tracking-widest font-semibold">15 Minute Session Recommended</p>
  </div>
);

export default function HeadacheQuestionnaire() {
  const [answers, setAnswers] = useState<Answers>({ q1: '', q2: '', q3: '' });
  const [result, setResult] = useState<Result | null>(null);
  const resultRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (result && resultRef.current) {
      resultRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, [result]);

  const { timeLeft, isActive, toggle, reset, formatTime, setIsActive } = useTimer({
    initialTime: 15 * 60,
    onFinish: () => alert("Time is up! Please remove your heat pad or cooling strip now to protect your skin.")
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setAnswers({ ...answers, [e.target.name]: e.target.value as AnswerType });
  };

  const calculateRemedy = () => {
    const { q1, q2, q3 } = answers;
    if (!q1 || !q2 || !q3) {
      alert("Please answer all the questions so I can give you the best suggestion.");
      return;
    }

    reset();
    
    if (q1 === 'yes') {
      setResult({
        isWarning: true,
        title: "Medical Attention Required",
        description: (
          <p className="text-slate-300 leading-relaxed">
            These are red flag symptoms (fever, confusion, stiff neck, or sudden severe pain). 
            Please skip home remedies and <strong className="text-rose-400">seek immediate medical attention</strong>. 
            Safety should always come first.
          </p>
        ),
      });
      return;
    }

    let coldScore = 0;
    let heatScore = 0;

    if (q2 === 'cold') coldScore++;
    if (q2 === 'heat') heatScore++;
    if (q3 === 'cold') coldScore++;
    if (q3 === 'heat') heatScore++;

    if (coldScore > heatScore) {
      setResult({
        isWarning: false,
        title: "Cold Therapy Recommended",
        description: (
          <p className="text-slate-300 leading-relaxed">
            This appears to be a migraine or vascular headache. <br /><br />
            Apply a <span className="text-blue-400 font-bold text-lg">cooling strip</span> or ice pack to your forehead or temples. 
            The cold will help constrict blood vessels and numb the throbbing pain. Rest in a dark, quiet room.
          </p>
        ),
      });
      setIsActive(true);
    } else if (heatScore > coldScore) {
      setResult({
        isWarning: false,
        title: "Heat Therapy Recommended",
        description: (
          <p className="text-slate-300 leading-relaxed">
            This appears to be a tension headache originating from muscle tightness. <br /><br />
            Apply a <span className="text-orange-400 font-bold text-lg">heat pad</span> or warm compress to the back of your neck and shoulders. 
            The warmth will increase blood flow and help muscles relax.
          </p>
        ),
      });
      setIsActive(true);
    } else {
      setResult({
        isWarning: false,
        title: "The Combination Method",
        description: (
          <div className="text-slate-300 space-y-3">
            <p>You are dealing with a mix of tension and throbbing pain.</p>
            <div className="p-4 bg-slate-800/40 rounded-xl border border-slate-700/50">
              <p className="flex items-center gap-3">
                <span className="text-orange-400">🔥</span>
                <span><span className="text-orange-400 font-bold">Heat pad</span> on your neck/shoulders for muscle tension.</span>
              </p>
              <p className="flex items-center gap-3 mt-2">
                <span className="text-blue-400">❄️</span>
                <span><span className="text-blue-400 font-bold">Cooling strip</span> on your forehead for throbbing pain.</span>
              </p>
            </div>
          </div>
        ),
      });
      setIsActive(true);
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0a0c] text-slate-100 py-12 px-4 sm:px-6 relative">
      <div className="absolute top-6 left-6 md:top-10 md:left-10">
        <Link href="/naanas-space" className="text-slate-400 hover:text-blue-400 font-medium flex items-center gap-2 transition-colors">
          &larr; Back to Hub
        </Link>
      </div>
      <div className="max-w-2xl mx-auto">
        <header className="text-center mb-12">
          <h2 className="text-4xl font-extrabold tracking-tight bg-gradient-to-r from-blue-400 to-indigo-500 bg-clip-text text-transparent mb-4">
            Naana&apos;s Remedy Finder
          </h2>
          <p className="text-slate-400 text-lg">
            Quick lil guidence to find the ideal session (heat, cold, or both) for your current headache.
          </p>
        </header>

        <form className="space-y-2">
          <QuestionCard 
            question='1. Are you experiencing any of these severe symptoms? (Sudden "worst ever" pain, fever, or confusion)'
            name="q1"
            selectedValue={answers.q1}
            options={[
              { label: 'No, none of these', value: 'no' },
              { label: 'Yes', value: 'yes' },
            ]}
            onChange={handleChange}
          />

          <QuestionCard 
            question="2. How would you describe the pain in your head?"
            name="q2"
            selectedValue={answers.q2}
            options={[
              { label: 'Throbbing, pulsing, or pounding', value: 'cold' },
              { label: 'Dull, aching, or feeling like a tight band', value: 'heat' },
              { label: 'A mix of both, or I\'m not sure', value: 'combo' },
            ]}
            onChange={handleChange}
          />

          <QuestionCard 
            question="3. Where is the pain mostly concentrated?"
            name="q3"
            selectedValue={answers.q3}
            options={[
              { label: 'Forehead, temples, or behind the eyes', value: 'cold' },
              { label: 'Back of the head, neck, and shoulders', value: 'heat' },
              { label: 'It\'s everywhere', value: 'combo' },
            ]}
            onChange={handleChange}
          />

          <button 
            type="button" 
            onClick={calculateRemedy} 
            className="w-full py-4 mt-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-lg rounded-2xl shadow-xl shadow-blue-500/20 transform transition-all active:scale-[0.98] focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-[#0a0a0c]"
          >
            Calculate Remedy
          </button>
        </form>

        {result && (
          <div 
            ref={resultRef}
            className={`mt-12 p-8 rounded-3xl border-2 transition-all animate-in fade-in slide-in-from-bottom-4 duration-500 ${
            result.isWarning 
              ? 'bg-rose-500/10 border-rose-500/30' 
              : 'bg-slate-900 border-blue-500/20'
          }`}>
            <h3 className={`text-2xl font-bold mb-4 flex items-center gap-3 ${
              result.isWarning ? 'text-rose-400' : 'text-white'
            }`}>
              {result.isWarning ? '⚠️' : '✅'} {result.title}
            </h3>
            {result.description}
            
            {!result.isWarning && (
              <Timer 
                timeLeft={timeLeft}
                isActive={isActive}
                toggle={toggle}
                reset={reset}
                formatTime={formatTime}
              />
            )}
          </div>
        )}
      </div>
    </div>
  );
}