"use client";

import React, { useState, useRef, useEffect } from 'react';
import { useTimer } from '@/hooks/useTimer';
import NaanasSpaceLayout from '@/components/NaanasSpaceLayout';

type AnswerType = 'yes' | 'no' | 'cold' | 'heat' | 'combo' | 'sinus' | '';

interface Answers {
  q1: AnswerType;
  q2: AnswerType;
  q3: AnswerType;
  q4: AnswerType;
  q5: AnswerType;
}

interface Result {
  isWarning: boolean;
  title: string;
  description: React.ReactNode;
}

interface TimerProps {
  timeLeft: number;
  isActive: boolean;
  toggle: () => void;
  reset: () => void;
  formatTime: () => string;
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
  <fieldset className="bg-slate-900/50 backdrop-blur-sm border border-slate-800 p-6 rounded-2xl mb-6 shadow-xl transition-all hover:border-violet-500/30 group">
    <legend className="sr-only">{question}</legend>
    <p className="text-lg font-semibold text-slate-100 mb-4" aria-hidden="true">{question}</p>
    <div className="space-y-3">
      {options.map((opt, index) => {
        const isSelected = selectedValue === opt.value;
        return (
          <label 
            key={`${opt.value}-${index}`} 
            className={`flex items-center p-3 rounded-xl cursor-pointer transition-all border-2 ${
              isSelected 
                ? 'bg-purple-500/10 border-purple-500/50 ring-1 ring-purple-500/20' 
                : 'bg-slate-800/30 border-transparent hover:bg-slate-800/50'
            }`}
          >
            <input 
              type="radio" 
              name={name} 
              value={opt.value} 
              checked={isSelected}
              onChange={onChange} 
              className="w-5 h-5 text-purple-500 bg-slate-800 border-slate-700 focus:ring-purple-500 focus:ring-offset-slate-900"
            />
            <span className={`ml-3 transition-colors ${isSelected ? 'text-white font-medium' : 'text-slate-400 group-hover:text-slate-200'}`}>
              {opt.label}
            </span>
          </label>
        );
      })}
    </div>
  </fieldset>
);

const Timer = ({ timeLeft, isActive, toggle, reset, formatTime }: TimerProps) => (
  <div className="mt-8 p-6 bg-slate-900/80 border border-purple-500/20 rounded-2xl text-center shadow-2xl">
    <div className="text-4xl font-mono font-bold text-purple-400 mb-4 tracking-wider transition-all">
      <span className="opacity-70 text-2xl mr-2">⏱️</span>
      {formatTime()}
    </div>
    <div className="flex justify-center gap-4">
      <button 
        type="button"
        onClick={toggle}
        className={`px-6 py-2 rounded-full font-bold transition-all ${
          isActive 
            ? 'bg-amber-500/10 text-amber-500 border border-amber-500/30 hover:bg-amber-500/20' 
            : 'bg-purple-600 text-white hover:bg-purple-500 shadow-lg shadow-purple-600/20'
        }`}
      >
        {isActive ? 'Pause' : 'Start Timer'}
      </button>
      <button 
        type="button"
        onClick={reset}
        className="px-6 py-2 rounded-full font-bold bg-slate-800 text-slate-300 border border-slate-700 hover:bg-slate-700 transition-all"
      >
        Reset
      </button>
    </div>
    <p className="mt-4 text-xs text-slate-500 uppercase tracking-widest font-semibold">15 Minute Session Recommended</p>
  </div>
);

const calculateHeadacheRemedy = (answers: Answers): Result => {
  const { q1, q2, q3, q4, q5 } = answers;

  if (q1 === 'yes') {
    return {
      isWarning: true,
      title: "Medical Attention Required",
      description: (
        <p className="text-slate-300 leading-relaxed">
          These are red flag symptoms (fever, confusion, stiff neck, sudden severe pain, weakness, or trouble speaking). 
          Please skip home remedies and <strong className="text-rose-400">seek immediate medical attention</strong>. 
          Safety should always come first.
        </p>
      ),
    };
  }

  let migraineScore = 0; // Cold priority
  let tensionScore = 0;  // Heat priority
  let sinusScore = 0;    // Heat/Steam priority

  // Question 2: Quality of pain
  if (q2 === 'cold') migraineScore += 2;
  if (q2 === 'heat') tensionScore += 2;
  if (q2 === 'sinus') sinusScore += 2;

  // Question 3: Location of pain
  if (q3 === 'cold') migraineScore++;
  if (q3 === 'heat') tensionScore++;
  if (q3 === 'sinus') sinusScore++;
  if (q3 === 'combo') { tensionScore++; migraineScore++; }

  // Question 4: Associated symptoms
  if (q4 === 'cold') migraineScore += 2;
  if (q4 === 'sinus') sinusScore += 2;

  // Question 5: Effect of activity
  if (q5 === 'cold') migraineScore++;

  const maxScore = Math.max(migraineScore, tensionScore, sinusScore);

  if (maxScore === migraineScore && migraineScore > tensionScore && migraineScore > sinusScore) {
    return {
      isWarning: false,
      title: "Cold Therapy Recommended",
      description: (
        <p className="text-slate-300 leading-relaxed">
          This appears to be a migraine or vascular headache. <br /><br />
          Apply a <span className="text-violet-400 font-bold text-lg">cooling strip</span> or ice pack to your forehead or temples. 
          The cold will help constrict blood vessels and numb the throbbing pain. Rest in a dark, quiet room.
        </p>
      ),
    };
  } else if (maxScore === sinusScore && sinusScore > tensionScore && sinusScore > migraineScore) {
    return {
      isWarning: false,
      title: "Warm Steam/Heat Recommended",
      description: (
        <p className="text-slate-300 leading-relaxed">
          This appears to be a sinus headache. <br /><br />
          Apply a <span className="text-orange-400 font-bold text-lg">warm compress</span> over your sinuses (nose, cheeks, forehead) or try taking a steamy shower. The warmth will help open nasal passages and relieve pressure.
        </p>
      ),
    };
  } else if (maxScore === tensionScore && tensionScore > migraineScore && tensionScore > sinusScore) {
    return {
      isWarning: false,
      title: "Heat Therapy Recommended",
      description: (
        <p className="text-slate-300 leading-relaxed">
          This appears to be a tension headache originating from muscle tightness. <br /><br />
          Apply a <span className="text-orange-400 font-bold text-lg">heat pad</span> or warm compress to the back of your neck and shoulders. 
          The warmth will increase blood flow and help muscles relax.
        </p>
      ),
    };
  } else {
    return {
      isWarning: false,
      title: "The Combination Method",
      description: (
        <div className="text-slate-300 space-y-3">
          <p>You seem to be dealing with a mix of symptoms (e.g., tension and throbbing/pressure).</p>
          <div className="p-4 bg-slate-800/40 rounded-xl border border-slate-700/50">
            <p className="flex items-center gap-3">
              <span className="text-orange-400">🔥</span>
              <span><span className="text-orange-400 font-bold">Heat pad</span> on your neck/shoulders for muscle tension.</span>
            </p>
            <p className="flex items-center gap-3 mt-2">
              <span className="text-violet-400">❄️</span>
              <span><span className="text-violet-400 font-bold">Cooling strip</span> on your forehead for throbbing pain.</span>
            </p>
          </div>
        </div>
      ),
    };
  }
};

export default function HeadacheQuestionnaire() {
  const [answers, setAnswers] = useState<Answers>({ q1: '', q2: '', q3: '', q4: '', q5: '' });
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

  const isFormComplete = Object.values(answers).every(val => val !== '');

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!isFormComplete) return;

    reset();
    const newResult = calculateHeadacheRemedy(answers);
    setResult(newResult);
    
    if (!newResult.isWarning) {
      setIsActive(true);
    }
  };

  return (
    <NaanasSpaceLayout showBackLink>
      <div className="max-w-2xl mx-auto">
        <header className="text-center mb-12">
          <h2 className="text-4xl font-extrabold tracking-tight bg-gradient-to-r from-purple-400 to-violet-400 bg-clip-text text-transparent mb-4">
            Naana&apos;s Remedy Finder
          </h2>
          <p className="text-slate-400 text-lg mx-auto max-w-lg">
            A quick assessment to find the ideal session (heat, cold, or both) for your current headache.
          </p>
        </header>

        <form onSubmit={handleSubmit} className="space-y-4">
          <QuestionCard 
            question='1. Are you experiencing any of these severe symptoms? (Sudden "worst ever" pain, fever, confusion, weakness, or trouble speaking)'
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
              { label: 'Deep pressure or fullness', value: 'sinus' },
              { label: 'A mix of these, or I\'m not sure', value: 'combo' },
            ]}
            onChange={handleChange}
          />

          <QuestionCard 
            question="3. Where is the pain mostly concentrated?"
            name="q3"
            selectedValue={answers.q3}
            options={[
              { label: 'One side of the head, forehead, or temples', value: 'cold' },
              { label: 'Back of the head, neck, and shoulders', value: 'heat' },
              { label: 'Cheeks, nose, and forehead (face area)', value: 'sinus' },
              { label: 'It\'s everywhere', value: 'combo' },
            ]}
            onChange={handleChange}
          />

          <QuestionCard 
            question="4. Do you have any of these associated symptoms?"
            name="q4"
            selectedValue={answers.q4}
            options={[
              { label: 'Nausea or sensitivity to light/sound', value: 'cold' },
              { label: 'Stuffy or runny nose', value: 'sinus' },
              { label: 'None of these', value: 'no' },
            ]}
            onChange={handleChange}
          />

          <QuestionCard 
            question="5. Does routine physical activity (like walking up stairs) make the pain noticeably worse?"
            name="q5"
            selectedValue={answers.q5}
            options={[
              { label: 'Yes, movement makes it worse', value: 'cold' },
              { label: 'No, movement doesn\'t really change it', value: 'no' },
            ]}
            onChange={handleChange}
          />

          <div className="pt-4">
            <button 
              type="submit" 
              disabled={!isFormComplete}
              className={`w-full py-4 text-white font-bold text-lg rounded-2xl shadow-xl transform transition-all focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 focus:ring-offset-[#0a0a0c] ${
                isFormComplete 
                  ? 'bg-gradient-to-r from-purple-600 to-violet-600 hover:from-purple-500 hover:to-violet-500 shadow-purple-500/20 active:scale-[0.98]' 
                  : 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700'
              }`}
            >
              Calculate Remedy
            </button>
            
            {!isFormComplete && (
              <p className="text-center text-sm text-slate-500 mt-4 animate-pulse">
                Please answer all questions to see your recommendation.
              </p>
            )}
          </div>
        </form>

        {result && (
          <div 
            ref={resultRef}
            className={`mt-12 p-8 rounded-3xl border-2 transition-all animate-in fade-in slide-in-from-bottom-4 duration-500 ${
            result.isWarning 
              ? 'bg-rose-500/10 border-rose-500/30' 
              : 'bg-slate-900 border-purple-500/20 shadow-2xl shadow-purple-900/10'
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
    </NaanasSpaceLayout>
  );
}