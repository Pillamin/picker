import React, { useState, useEffect, useRef } from 'react';

export default function PresenterDrawer({ 
  students, 
  riggedQueue, 
  setRiggedQueue, 
  history, 
  setHistory 
}) {
  const [isDrawing, setIsDrawing] = useState(false);
  const [drawCount, setDrawCount] = useState(1);
  const [showResultModal, setShowResultModal] = useState(false);
  const [winners, setWinners] = useState([]);
  const [isMuted, setIsMuted] = useState(false);
  
  // Reel animation state
  const [reelNames, setReelNames] = useState(['준비 완료!']);
  const [reelStyle, setReelStyle] = useState({ transform: 'translateY(0px)' });
  
  const canvasRef = useRef(null);
  const confettiIntervalRef = useRef(null);
  const confettiParticles = useRef([]);

  // Synthesize Tick Sound using Web Audio API
  const playTickSound = () => {
    if (isMuted) return;
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(600, ctx.currentTime);
      
      gain.gain.setValueAtTime(0.06, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.04);
      
      osc.connect(gain);
      gain.connect(ctx.destination);
      
      osc.start();
      osc.stop(ctx.currentTime + 0.04);
    } catch (e) {
      console.warn("Audio play error", e);
    }
  };

  // Synthesize Victory Sound using Web Audio API
  const playVictorySound = () => {
    if (isMuted) return;
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      
      const playTone = (freq, startTime, duration) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, ctx.currentTime + startTime);
        
        gain.gain.setValueAtTime(0.12, ctx.currentTime + startTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + startTime + duration);
        
        osc.connect(gain);
        gain.connect(ctx.destination);
        
        osc.start(ctx.currentTime + startTime);
        osc.stop(ctx.currentTime + startTime + duration);
      };
      
      // Fun arpeggio
      playTone(523.25, 0, 0.15);      // C5
      playTone(659.25, 0.12, 0.15);   // E5
      playTone(783.99, 0.24, 0.15);   // G5
      playTone(1046.50, 0.36, 0.5);   // C6
    } catch (e) {
      console.warn("Audio play error", e);
    }
  };

  // Custom Confetti Particle System
  const initConfetti = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    confettiParticles.current = [];

    const colors = ['#f59e0b', '#10b981', '#3b82f6', '#ec4899', '#8b5cf6', '#eab308', '#f97316'];

    // Create particles from left and right bottom
    const addParticles = (startX, dir) => {
      for (let i = 0; i < 60; i++) {
        confettiParticles.current.push({
          x: startX,
          y: canvas.height + 20,
          vx: (Math.random() * 10 + 5) * dir + (Math.random() - 0.5) * 5,
          vy: -(Math.random() * 15 + 15),
          color: colors[Math.floor(Math.random() * colors.length)],
          size: Math.random() * 8 + 6,
          rotation: Math.random() * 360,
          rotationSpeed: (Math.random() - 0.5) * 10,
          gravity: 0.45,
          friction: 0.98
        });
      }
    };

    addParticles(100, 1); // Shoot from left
    addParticles(canvas.width - 100, -1); // Shoot from right

    const updateConfetti = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      let active = false;
      confettiParticles.current.forEach((p) => {
        p.vy += p.gravity;
        p.vx *= p.friction;
        p.vy *= p.friction;
        p.x += p.vx;
        p.y += p.vy;
        p.rotation += p.rotationSpeed;

        if (p.y < canvas.height + 50) {
          active = true;
        }

        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate((p.rotation * Math.PI) / 180);
        ctx.fillStyle = p.color;
        // Draw rectangle particle
        ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size);
        ctx.restore();
      });

      if (active && showResultModal) {
        confettiIntervalRef.current = requestAnimationFrame(updateConfetti);
      } else {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
      }
    };

    confettiIntervalRef.current = requestAnimationFrame(updateConfetti);
  };

  useEffect(() => {
    if (showResultModal) {
      initConfetti();
    } else {
      if (confettiIntervalRef.current) {
        cancelAnimationFrame(confettiIntervalRef.current);
      }
    }
    return () => {
      if (confettiIntervalRef.current) {
        cancelAnimationFrame(confettiIntervalRef.current);
      }
    };
  }, [showResultModal]);

  // Handle window resizing for Canvas
  useEffect(() => {
    const handleResize = () => {
      if (canvasRef.current) {
        canvasRef.current.width = window.innerWidth;
        canvasRef.current.height = window.innerHeight;
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const startDraw = () => {
    if (students.length === 0) {
      alert('학생 명단을 먼저 추가해 주세요.');
      return;
    }

    if (isDrawing) return;
    setIsDrawing(true);
    setShowResultModal(false);

    // 1. Determine the winners (accounting for rigging)
    const availableStudents = [...students];
    const chosenWinners = [];
    const updatedRiggedQueue = [...riggedQueue];

    const countToDraw = Math.min(drawCount, students.length);

    for (let i = 0; i < countToDraw; i++) {
      let winnerName = null;

      // Check rigged queue
      if (updatedRiggedQueue.length > 0) {
        const nextRigged = updatedRiggedQueue.shift();
        // Make sure this rigged student is in the current class list and not already picked
        if (students.some(s => s.name === nextRigged) && !chosenWinners.includes(nextRigged)) {
          winnerName = nextRigged;
        }
      }

      // If no valid rigged student, pick randomly
      if (!winnerName) {
        const pool = availableStudents.filter(s => !chosenWinners.includes(s.name));
        if (pool.length > 0) {
          const randIdx = Math.floor(Math.random() * pool.length);
          winnerName = pool[randIdx].name;
        }
      }

      if (winnerName) {
        chosenWinners.push(winnerName);
      }
    }

    // Update parent's rigged queue
    setRiggedQueue(updatedRiggedQueue);

    // 2. Set up the reel animation
    // The reel list contains: starting label, a series of random student names, and the winner name
    const reelLength = 35;
    const finalWinner = chosenWinners[0] || '없음'; // Display first winner on the reel

    const randomSequence = [];
    for (let i = 0; i < reelLength - 2; i++) {
      const randomStudent = students[Math.floor(Math.random() * students.length)].name;
      randomSequence.push(randomStudent);
    }

    const startLabel = reelNames[reelNames.length - 1] || '준비 완료!';
    const fullReel = [startLabel, ...randomSequence, finalWinner];
    
    setReelNames(fullReel);
    setReelStyle({ transform: 'translateY(0px)' });

    // 3. Play tick sounds that slow down over time
    let tickDelay = 35;
    let ticksPlayed = 0;
    const playTicks = () => {
      if (!isDrawing) return;
      playTickSound();
      ticksPlayed++;
      
      // Increase delay exponentially as we approach the end
      if (ticksPlayed < reelLength - 1) {
        tickDelay = tickDelay * 1.12;
        setTimeout(playTicks, Math.min(tickDelay, 450));
      }
    };

    // Trigger tick sounds shortly after start
    setTimeout(playTicks, 50);

    // 4. Run translation animation (translateY down to target index)
    // Container height is 180px, so we translate by -((length - 1) * 180)px
    setTimeout(() => {
      setReelStyle({
        transform: `translateY(-${(fullReel.length - 1) * 180}px)`,
        transition: 'transform 3.5s cubic-bezier(0.12, 0.8, 0.15, 1)'
      });
    }, 50);

    // 5. Wrap up draw after transition finishes
    setTimeout(() => {
      setWinners(chosenWinners);
      setHistory(prev => {
        const newHist = [...chosenWinners, ...prev];
        // Keep unique values, or just keep a running list
        return newHist.slice(0, 50); // limit to 50 items
      });
      setIsDrawing(false);
      setShowResultModal(true);
      playVictorySound();
    }, 3650);
  };

  const handleResetHistory = () => {
    if (confirm('발표자 내역을 초기화하시겠습니까?')) {
      setHistory([]);
    }
  };

  return (
    <div className="main-content">
      {/* Confetti Overlay */}
      {showResultModal && <canvas ref={canvasRef} className="confetti-canvas" />}

      <div className="roulette-container card">
        <div style={{ position: 'absolute', top: '16px', right: '20px', zIndex: 10 }}>
          <button 
            className="btn btn-secondary" 
            style={{ padding: '6px 12px', fontSize: '0.8rem', borderRadius: '6px' }}
            onClick={() => setIsMuted(!isMuted)}
          >
            {isMuted ? '🔇 음소거 해제' : '🔊 소리 켜짐'}
          </button>
        </div>

        <div className="slot-machine-frame">
          <div className="slot-machine-pointer"></div>
          <div className="slot-machine-pointer-left"></div>
          <div className="slot-reel" style={reelStyle}>
            {reelNames.map((name, index) => (
              <div 
                className={`slot-item ${name === '준비 완료!' || name === '추첨 완료!' ? 'placeholder' : ''}`} 
                key={index}
              >
                {name}
              </div>
            ))}
          </div>
        </div>

        <div className="draw-controls">
          <div className="draw-options-row">
            <span style={{ fontSize: '1rem', fontWeight: '700', color: 'var(--text-secondary)' }}>뽑을 인원:</span>
            <select 
              className="input-select-count"
              value={drawCount} 
              onChange={(e) => setDrawCount(parseInt(e.target.value))}
              disabled={isDrawing}
            >
              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(n => (
                <option key={n} value={n}>{n}명</option>
              ))}
            </select>
          </div>

          <button 
            className="btn btn-primary draw-btn-large" 
            onClick={startDraw}
            disabled={isDrawing || students.length === 0}
          >
            {isDrawing ? '추첨 중...' : '발표자 뽑기 🎲'}
          </button>
        </div>
      </div>

      {/* History Area */}
      <div className="history-section card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
          <h3 style={{ fontSize: '1.15rem', fontWeight: 800 }}>최근 당첨자 목록</h3>
          {history.length > 0 && (
            <button 
              className="btn btn-secondary" 
              onClick={handleResetHistory}
              style={{ padding: '4px 10px', fontSize: '0.75rem', borderRadius: '4px' }}
            >
              비우기
            </button>
          )}
        </div>

        {history.length === 0 ? (
          <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)', fontStyle: 'italic' }}>
            아직 뽑힌 발표자가 없습니다.
          </p>
        ) : (
          <div className="history-chips-container">
            {history.map((name, index) => (
              <div className="history-chip" key={index}>
                {name}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Results Detail Modal */}
      {showResultModal && (
        <div className="modal-overlay" style={{ zIndex: 1110 }}>
          <div className="modal-content card" style={{ maxWidth: '420px', border: '2px solid var(--accent-gold)' }}>
            <div className="modal-header" style={{ marginBottom: '10px' }}>
              <h3 style={{ fontSize: '1.35rem', color: 'var(--accent-gold)', fontWeight: 800 }}>🎉 오늘의 발표자!</h3>
              <button className="close-btn" onClick={() => setShowResultModal(false)}>&times;</button>
            </div>
            
            <div className="result-reveal-box">
              <p style={{ fontSize: '0.95rem', color: 'var(--text-secondary)', marginBottom: '15px' }}>
                축하합니다! 발표에 적극적으로 참여해 주세요.
              </p>
              <div className="result-list">
                {winners.map((name, index) => (
                  <div className="result-name-card" key={index}>
                    {name}
                  </div>
                ))}
              </div>
            </div>

            <div style={{ marginTop: '24px', display: 'flex', justifyContent: 'center' }}>
              <button 
                className="btn btn-primary" 
                onClick={() => setShowResultModal(false)}
                style={{ width: '100%', borderRadius: '30px', padding: '12px' }}
              >
                확인
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
