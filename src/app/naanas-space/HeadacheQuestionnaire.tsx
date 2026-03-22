import React, { useState, useEffect } from 'react';

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

export default function HeadacheQuestionnaire() {
  const [answers, setAnswers] = useState<Answers>({
    q1: '',
    q2: '',
    q3: '',
  });

  const [result, setResult] = useState<Result | null>(null);
  
  const [timeLeft, setTimeLeft] = useState<number>(15 * 60); // 15 minutes in seconds
  const [isTimerActive, setIsTimerActive] = useState<boolean>(false);

  useEffect(() => {
    let interval: ReturnType<typeof setInterval> | null = null;
    
    if (isTimerActive && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((prevTime) => prevTime - 1);
      }, 1000);
    } 
    else if (timeLeft === 0 && isTimerActive) {
      setIsTimerActive(false);
      alert("Time is up! Please remove your heat pad or cooling strip now to protect your skin.");
    }
    
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isTimerActive, timeLeft]);

  const formatTime = (seconds: number): string => {
    const m = Math.floor(seconds / 60).toString().padStart(2, '0');
    const s = (seconds % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setAnswers({
      ...answers,
      [e.target.name]: e.target.value as AnswerType,
    });
  };

  const calculateRemedy = () => {
    const { q1, q2, q3 } = answers;

    if (!q1 || !q2 || !q3) {
      alert("Please answer all the questions so I can give you the best suggestion.");
      return;
    }

    setIsTimerActive(false);
    setTimeLeft(15 * 60);

    if (q1 === 'yes') {
      setResult({
        isWarning: true,
        title: "⚠️ Seek Medical Attention",
        description: (
          <p>
            These are red flag symptoms (fever, confusion, stiff neck, or sudden severe pain), it'll be best to skip the home remedies and <strong>seek medical attention</strong>. It is always better to be safe.
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
        title: "❄️ Recommended: Cold Therapy (Cooling Strips)",
        description: (
          <p>
            This could be a migraine or vascular headache. <br /><br />
            <strong>What to do:</strong> Apply a cooling strip or ice pack to your forehead or temples. The cold will help constrict blood vessels and numb the throbbing pain. Rest in a dark, quiet room.
          </p>
        ),
      });
      setIsTimerActive(true);
    } else if (heatScore > coldScore) {
      setResult({
        isWarning: false,
        title: "🔥 Recommended: Heat Therapy (Heat Pads)",
        description: (
          <p>
            This could be a tension headache originating from your muscles. <br /><br />
            <strong>What to do:</strong> Apply a heat pad or warm compress to the back of your neck and shoulders. The warmth will increase blood flow and help those tight muscles relax. Try doing some gentle neck stretches.
          </p>
        ),
      });
      setIsTimerActive(true);
    } else {
      setResult({
        isWarning: false,
        title: "⚖️ Recommended: The Combination Method",
        description: (
          <p>
            You are dealing with a mix of tension and throbbing pain. <br /><br />
            <strong>What to do:</strong> Put a heat pad on your neck/shoulders to melt the muscle tension, and simultaneously place a cooling strip on your forehead to numb the throbbing. 
          </p>
        ),
      });
      setIsTimerActive(true);
    }
  };

  const styles: { [key: string]: React.CSSProperties } = {
    container: {
      fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
      backgroundColor: '#121212',
      color: '#e0e0e0',
      lineHeight: '1.6',
      padding: '20px',
      maxWidth: '600px',
      margin: '0 auto',
      borderRadius: '8px',
    },
    heading: {
      color: '#ffffff',
      borderBottom: '1px solid #333',
      paddingBottom: '10px',
    },
    questionBlock: {
      backgroundColor: '#1e1e1e',
      padding: '15px 20px',
      marginBottom: '20px',
      borderRadius: '8px',
      border: '1px solid #333',
    },
    label: {
      display: 'block',
      marginBottom: '10px',
      cursor: 'pointer',
    },
    button: {
      backgroundColor: '#4a90e2',
      color: 'white',
      border: 'none',
      padding: '12px 20px',
      fontSize: '16px',
      borderRadius: '5px',
      cursor: 'pointer',
      width: '100%',
      fontWeight: 'bold',
      marginTop: '10px',
    },
    timerDisplay: {
      marginTop: '15px',
      padding: '15px',
      backgroundColor: '#1e1e1e',
      borderRadius: '5px',
      textAlign: 'center',
      fontSize: '24px',
      fontWeight: 'bold',
      color: '#4a90e2',
      border: '1px solid #333'
    },
    timerControls: {
      display: 'flex',
      justifyContent: 'center',
      gap: '10px',
      marginTop: '10px'
    },
    timerBtn: {
      padding: '5px 15px',
      backgroundColor: '#333',
      color: '#fff',
      border: 'none',
      borderRadius: '3px',
      cursor: 'pointer'
    }
  };

  // Helper functions for dynamic styles to maintain strict typing
  const getResultBoxStyle = (isWarning: boolean): React.CSSProperties => ({
    marginTop: '30px',
    padding: '20px',
    backgroundColor: '#2a2a2a',
    borderRadius: '8px',
    borderLeft: `5px solid ${isWarning ? '#e74c3c' : '#4a90e2'}`,
  });

  const getResultTitleStyle = (isWarning: boolean): React.CSSProperties => ({
    color: isWarning ? '#e74c3c' : '#e0e0e0',
    marginTop: 0,
  });

  return (
    <div style={styles.container}>
      <h2 style={styles.heading}>Headache & Neck Pain Remedy Finder</h2>
      <p>Fill out this quick form to see whether heat, ice, or a combination is best for your current symptoms.</p>

      <form>
        {/* Question 1 */}
        <div style={styles.questionBlock}>
          <p style={{ fontWeight: 'bold', marginTop: 0 }}>1. Are you experiencing any of these severe symptoms?</p>
          <label style={styles.label}>
            <input type="radio" name="q1" value="yes" onChange={handleChange} style={{ marginRight: '10px' }} />
            Yes (Sudden "worst ever" headache, fever, confusion, or unable to touch chin to chest)
          </label>
          <label style={styles.label}>
            <input type="radio" name="q1" value="no" onChange={handleChange} style={{ marginRight: '10px' }} />
            No, none of these
          </label>
        </div>

        {/* Question 2 */}
        <div style={styles.questionBlock}>
          <p style={{ fontWeight: 'bold', marginTop: 0 }}>2. How would you describe the pain in your head?</p>
          <label style={styles.label}>
            <input type="radio" name="q2" value="cold" onChange={handleChange} style={{ marginRight: '10px' }} />
            Throbbing, pulsing, or pounding
          </label>
          <label style={styles.label}>
            <input type="radio" name="q2" value="heat" onChange={handleChange} style={{ marginRight: '10px' }} />
            Dull, aching, or feeling like a tight band
          </label>
          <label style={styles.label}>
            <input type="radio" name="q2" value="combo" onChange={handleChange} style={{ marginRight: '10px' }} />
            A mix of both, or I'm not sure
          </label>
        </div>

        {/* Question 3 */}
        <div style={styles.questionBlock}>
          <p style={{ fontWeight: 'bold', marginTop: 0 }}>3. Where is the pain mostly concentrated?</p>
          <label style={styles.label}>
            <input type="radio" name="q3" value="cold" onChange={handleChange} style={{ marginRight: '10px' }} />
            Forehead, temples, or behind the eyes
          </label>
          <label style={styles.label}>
            <input type="radio" name="q3" value="heat" onChange={handleChange} style={{ marginRight: '10px' }} />
            Back of the head, neck, and shoulders
          </label>
          <label style={styles.label}>
            <input type="radio" name="q3" value="combo" onChange={handleChange} style={{ marginRight: '10px' }} />
            It's everywhere
          </label>
        </div>

        <button type="button" onClick={calculateRemedy} style={styles.button}>
          Find My Remedy
        </button>
      </form>

      {/* Conditionally render the result box */}
      {result && (
        <div style={getResultBoxStyle(result.isWarning)}>
          <h3 style={getResultTitleStyle(result.isWarning)}>{result.title}</h3>
          {result.description}
          
          {/* Render timer only if it's not a medical warning */}
          {!result.isWarning && (
            <div style={styles.timerDisplay}>
              ⏱️ {formatTime(timeLeft)}
              <div style={styles.timerControls}>
                <button 
                  style={styles.timerBtn} 
                  onClick={() => setIsTimerActive(!isTimerActive)}
                >
                  {isTimerActive ? 'Pause' : 'Resume'}
                </button>
                <button 
                  style={styles.timerBtn} 
                  onClick={() => {
                    setIsTimerActive(false);
                    setTimeLeft(15 * 60);
                  }}
                >
                  Reset
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}