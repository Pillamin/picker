import React, { useState } from 'react';

export default function StudentManager({ 
  currentClass, 
  setCurrentClass, 
  students, 
  onAddStudent, 
  onBulkAddStudents, 
  onDeleteStudent, 
  onClearStudents 
}) {
  const [singleName, setSingleName] = useState('');
  const [bulkNames, setBulkNames] = useState('');
  const [isBulkMode, setIsBulkMode] = useState(false);

  const handleAddSingle = (e) => {
    e.preventDefault();
    const trimmed = singleName.trim();
    if (!trimmed) return;
    
    // Check duplication
    if (students.some(s => s.name === trimmed)) {
      alert('이미 등록된 이름입니다.');
      return;
    }
    
    onAddStudent(trimmed);
    setSingleName('');
  };

  const handleAddBulk = (e) => {
    e.preventDefault();
    const trimmed = bulkNames.trim();
    if (!trimmed) return;

    // Parse by newline or comma
    const parsedNames = trimmed
      .split(/[\n,]+/)
      .map(name => name.trim())
      .filter(name => name.length > 0);

    if (parsedNames.length === 0) return;

    onBulkAddStudents(parsedNames);
    setBulkNames('');
    setIsBulkMode(false);
  };

  const classesList = ['1반', '2반', '3반', '4반', '5반'];

  return (
    <div className="sidebar card">
      <div>
        <h3 style={{ fontSize: '1.15rem', fontWeight: 800, marginBottom: '10px' }}>학급 선택</h3>
        <div className="class-tabs">
          {classesList.map((cls) => (
            <button
              key={cls}
              className={`class-tab ${currentClass === cls ? 'active' : ''}`}
              onClick={() => setCurrentClass(cls)}
            >
              {cls}
            </button>
          ))}
        </div>
      </div>

      <div className="student-list-box">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h3 style={{ fontSize: '1.15rem', fontWeight: 800 }}>
            학생 명단 <span style={{ color: 'var(--accent-gold)', fontSize: '1rem' }}>({students.length}명)</span>
          </h3>
          {students.length > 0 && (
            <button 
              onClick={onClearStudents} 
              style={{ 
                background: 'transparent', 
                border: 'none', 
                color: 'var(--text-muted)', 
                cursor: 'pointer', 
                fontSize: '0.8rem',
                textDecoration: 'underline' 
              }}
            >
              전체 비우기
            </button>
          )}
        </div>

        <div className="student-list-container">
          {students.length === 0 ? (
            <div style={{ 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center', 
              height: '100%', 
              minHeight: '120px', 
              color: 'var(--text-muted)',
              fontSize: '0.88rem',
              textAlign: 'center',
              border: '1px dashed var(--border-color)',
              borderRadius: 'var(--radius-sm)',
              padding: '16px'
            }}>
              등록된 학생이 없습니다.<br />아래에서 학생을 추가해 주세요.
            </div>
          ) : (
            students.map((student, index) => (
              <div className="student-chip" key={index}>
                <span>{student.name}</span>
                <button onClick={() => onDeleteStudent(student.name)} title="삭제">
                  &times;
                </button>
              </div>
            ))
          )}
        </div>
      </div>

      <hr style={{ border: 'none', borderTop: '1px solid var(--border-color)', margin: '4px 0' }} />

      <div>
        <div style={{ display: 'flex', gap: '8px', marginBottom: '12px' }}>
          <button 
            className={`btn ${!isBulkMode ? 'btn-primary' : 'btn-secondary'}`} 
            style={{ flex: 1, padding: '8px 12px', fontSize: '0.85rem', borderRadius: '6px' }}
            onClick={() => setIsBulkMode(false)}
          >
            개별 추가
          </button>
          <button 
            className={`btn ${isBulkMode ? 'btn-primary' : 'btn-secondary'}`} 
            style={{ flex: 1, padding: '8px 12px', fontSize: '0.85rem', borderRadius: '6px' }}
            onClick={() => setIsBulkMode(true)}
          >
            여러 명 일괄 추가
          </button>
        </div>

        {!isBulkMode ? (
          <form onSubmit={handleAddSingle} style={{ display: 'flex', gap: '6px' }}>
            <input
              type="text"
              className="form-control"
              placeholder="학생 이름"
              value={singleName}
              onChange={(e) => setSingleName(e.target.value)}
              style={{ flex: 1 }}
              maxLength={15}
            />
            <button type="submit" className="btn btn-primary" style={{ padding: '0 16px', borderRadius: 'var(--radius-sm)' }}>
              추가
            </button>
          </form>
        ) : (
          <form onSubmit={handleAddBulk}>
            <div className="form-group" style={{ marginBottom: '8px' }}>
              <textarea
                className="form-control"
                placeholder="이름을 쉼표(,)나 줄바꿈으로 구분하여 입력하세요. (예: 홍길동, 김이름, 박수민)"
                value={bulkNames}
                onChange={(e) => setBulkNames(e.target.value)}
                style={{ fontSize: '0.85rem' }}
              />
            </div>
            <button type="submit" className="btn btn-primary" style={{ width: '100%', padding: '10px', fontSize: '0.9rem' }}>
              일괄 등록하기
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
