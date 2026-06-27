import React, { useState, useEffect } from 'react';

export default function TeacherSettings({ 
  isOpen, 
  onClose, 
  students, 
  riggedQueue, 
  setRiggedQueue 
}) {
  const [pin, setPin] = useState('');
  const [savedPin, setSavedPin] = useState(() => {
    return localStorage.getItem('teacher_pin') || '1234';
  });
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [pinError, setPinError] = useState('');
  const [newPin, setNewPin] = useState('');
  const [pinChangeMsg, setPinChangeMsg] = useState('');

  // Reset auth state when modal is closed/opened
  useEffect(() => {
    if (!isOpen) {
      setIsAuthenticated(false);
      setPin('');
      setPinError('');
      setPinChangeMsg('');
      setNewPin('');
    }
  }, [isOpen]);

  const handleLogin = (e) => {
    e.preventDefault();
    if (pin === savedPin) {
      setIsAuthenticated(true);
      setPinError('');
    } else {
      setPinError('비밀번호가 올바르지 않습니다.');
    }
  };

  const handlePinChange = (e) => {
    e.preventDefault();
    if (newPin.length < 4) {
      setPinChangeMsg('비밀번호는 최소 4자리 이상이어야 합니다.');
      return;
    }
    localStorage.setItem('teacher_pin', newPin);
    setSavedPin(newPin);
    setNewPin('');
    setPinChangeMsg('비밀번호가 성공적으로 변경되었습니다!');
    setTimeout(() => setPinChangeMsg(''), 3000);
  };

  const toggleStudentRig = (studentName) => {
    // If already in queue, remove it
    if (riggedQueue.includes(studentName)) {
      setRiggedQueue(riggedQueue.filter(name => name !== studentName));
    } else {
      // Add to queue
      setRiggedQueue([...riggedQueue, studentName]);
    }
  };

  const clearQueue = () => {
    setRiggedQueue([]);
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content card">
        <div className="modal-header">
          <h3>교사용 관리 패널 {isAuthenticated && '(인증됨)'}</h3>
          <button className="close-btn" onClick={onClose}>&times;</button>
        </div>

        {!isAuthenticated ? (
          <form onSubmit={handleLogin}>
            <div className="form-group">
              <label htmlFor="pin-input">비밀번호를 입력하세요 (초기 비밀번호: 1234)</label>
              <input
                id="pin-input"
                type="password"
                className="form-control"
                placeholder="PIN 번호 입력"
                value={pin}
                onChange={(e) => setPin(e.target.value)}
                autoFocus
              />
              {pinError && <p style={{ color: '#ef4444', fontSize: '0.85rem', marginTop: '4px' }}>{pinError}</p>}
            </div>
            <div style={{ display: 'flex', gap: '8px', marginTop: '20px' }}>
              <button type="submit" className="btn btn-primary" style={{ flex: 1 }}>확인</button>
              <button type="button" className="btn btn-secondary" onClick={onClose}>취소</button>
            </div>
          </form>
        ) : (
          <div>
            <div className="form-group" style={{ marginBottom: '24px' }}>
              <h4 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--accent-gold)', marginBottom: '8px' }}>
                발표자 지정 대기열 (비밀)
              </h4>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '12px' }}>
                아래 대기열에 들어간 학생들은 다음 발표자 추첨 시 **우선적으로 순서대로** 당첨됩니다. (추첨 시 자동으로 대기열에서 제거됩니다)
              </p>

              {riggedQueue.length > 0 ? (
                <div style={{ 
                  background: 'rgba(245, 158, 11, 0.08)', 
                  border: '1px solid rgba(245, 158, 11, 0.3)',
                  padding: '12px',
                  borderRadius: 'var(--radius-sm)',
                  marginBottom: '12px'
                }}>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', alignItems: 'center' }}>
                    <span style={{ fontSize: '0.85rem', fontWeight: 'bold', color: 'var(--accent-gold)' }}>대기열 순서: </span>
                    {riggedQueue.map((name, idx) => (
                      <span key={idx} style={{ 
                        background: 'var(--accent-gold)', 
                        color: '#fff', 
                        padding: '2px 8px', 
                        borderRadius: '4px',
                        fontSize: '0.8rem',
                        fontWeight: 'bold',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px'
                      }}>
                        {idx + 1}. {name}
                        <button 
                          onClick={() => toggleStudentRig(name)} 
                          style={{ background: 'transparent', border: 'none', color: '#fff', cursor: 'pointer', fontSize: '0.75rem', fontWeight: 'bold' }}
                        >
                          &times;
                        </button>
                      </span>
                    ))}
                  </div>
                </div>
              ) : (
                <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontStyle: 'italic', marginBottom: '12px' }}>
                  현재 활성화된 지정 발표자가 없습니다. 무작위로 추첨됩니다.
                </p>
              )}

              {riggedQueue.length > 0 && (
                <button onClick={clearQueue} className="btn btn-danger" style={{ padding: '6px 12px', fontSize: '0.8rem', width: '100%', marginBottom: '16px' }}>
                  지정 대기열 전체 초기화
                </button>
              )}

              <label style={{ fontSize: '0.9rem', fontWeight: 600, display: 'block', marginBottom: '8px' }}>
                학생을 클릭하여 대기열에 추가/제거 하세요:
              </label>

              {students.length === 0 ? (
                <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>등록된 학생이 없습니다. 먼저 학생 명단을 추가해주세요.</p>
              ) : (
                <div style={{ 
                  display: 'grid', 
                  gridTemplateColumns: 'repeat(auto-fill, minmax(80px, 1fr))', 
                  gap: '8px', 
                  maxHeight: '180px', 
                  overflowY: 'auto',
                  background: 'rgba(0,0,0,0.2)',
                  padding: '10px',
                  borderRadius: 'var(--radius-sm)'
                }}>
                  {students.map((student, idx) => {
                    const queueIndex = riggedQueue.indexOf(student.name);
                    const isRigged = queueIndex !== -1;
                    return (
                      <button
                        key={idx}
                        onClick={() => toggleStudentRig(student.name)}
                        className="btn"
                        style={{
                          background: isRigged ? 'var(--accent-gold)' : 'rgba(255,255,255,0.05)',
                          color: isRigged ? '#fff' : 'var(--text-primary)',
                          border: isRigged ? '1px solid var(--accent-gold)' : '1px solid var(--border-color)',
                          padding: '6px 4px',
                          fontSize: '0.85rem',
                          borderRadius: '4px',
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: 'center',
                          gap: '2px',
                          justifyContent: 'center',
                          height: 'auto'
                        }}
                      >
                        <span style={{ fontWeight: '600' }}>{student.name}</span>
                        {isRigged && <span style={{ fontSize: '0.7rem', opacity: 0.9 }}>({queueIndex + 1}순위)</span>}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            <hr style={{ border: 'none', borderTop: '1px solid var(--border-color)', margin: '20px 0' }} />

            <form onSubmit={handlePinChange}>
              <div className="form-group">
                <label htmlFor="new-pin-input">비밀번호(PIN) 변경</label>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <input
                    id="new-pin-input"
                    type="password"
                    className="form-control"
                    placeholder="새 비밀번호 입력"
                    value={newPin}
                    onChange={(e) => setNewPin(e.target.value)}
                    style={{ flex: 1 }}
                  />
                  <button type="submit" className="btn btn-secondary" style={{ padding: '0 16px' }}>변경</button>
                </div>
                {pinChangeMsg && <p style={{ 
                  color: pinChangeMsg.includes('성공') ? '#10b981' : '#ef4444', 
                  fontSize: '0.85rem', 
                  marginTop: '4px' 
                }}>{pinChangeMsg}</p>}
              </div>
            </form>

            <div style={{ marginTop: '24px', display: 'flex', justifyContent: 'flex-end' }}>
              <button className="btn btn-secondary" onClick={onClose}>닫기</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
