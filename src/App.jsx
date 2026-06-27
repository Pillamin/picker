import React, { useState, useEffect } from 'react';
import EthicsGate from './components/EthicsGate';
import StudentManager from './components/StudentManager';
import PresenterDrawer from './components/PresenterDrawer';
import TeacherSettings from './components/TeacherSettings';

// Default mock students to give the app a ready-to-test feel on first run
const DEFAULT_STUDENTS = {
  '1반': [
    { name: '김민수' }, { name: '이서현' }, { name: '박지환' }, 
    { name: '최윤아' }, { name: '정우진' }, { name: '강다은' }, 
    { name: '윤민재' }, { name: '한소희' }, { name: '신현우' }, 
    { name: '조유리' }
  ],
  '2반': [
    { name: '이지훈' }, { name: '박수아' }, { name: '김동현' }, 
    { name: '최예은' }, { name: '정민규' }
  ],
  '3반': [],
  '4반': [],
  '5반': []
};

export default function App() {
  // Gate check (session storage so it triggers once per browser session/tab open)
  const [agreedToEthics, setAgreedToEthics] = useState(() => {
    return sessionStorage.getItem('agreed_to_ethics') === 'true';
  });

  // Current selected class
  const [currentClass, setCurrentClass] = useState('1반');

  // Load classes student data from localStorage
  const [classesData, setClassesData] = useState(() => {
    const saved = localStorage.getItem('classes_students_data');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error('Error parsing student data', e);
      }
    }
    return DEFAULT_STUDENTS;
  });

  // Rigged queue (who will be drawn next, kept in state)
  const [riggedQueue, setRiggedQueue] = useState([]);

  // Draw History
  const [history, setHistory] = useState(() => {
    const saved = localStorage.getItem('draw_history');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error('Error parsing history data', e);
      }
    }
    return [];
  });

  // Teacher settings modal visibility
  const [isTeacherModalOpen, setIsTeacherModalOpen] = useState(false);

  // Logo triple click counter
  const [logoClicks, setLogoClicks] = useState(0);

  // Hidden corner trigger click counter
  const [cornerClicks, setCornerClicks] = useState(0);

  // Sync students data to localStorage when it changes
  useEffect(() => {
    localStorage.setItem('classes_students_data', JSON.stringify(classesData));
  }, [classesData]);

  // Sync history to localStorage when it changes
  useEffect(() => {
    localStorage.setItem('draw_history', JSON.stringify(history));
  }, [history]);

  // Keyboard shortcut Ctrl + Shift + T to open Teacher Settings
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.ctrlKey && e.shiftKey && e.key.toUpperCase() === 'T') {
        e.preventDefault();
        setIsTeacherModalOpen(true);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Handle Ethics agreement
  const handleAgreeEthics = () => {
    sessionStorage.setItem('agreed_to_ethics', 'true');
    setAgreedToEthics(true);
  };

  // Re-open Ethics gate
  const handleReviewEthics = () => {
    setAgreedToEthics(false);
  };

  // Click handler for logo (triple click triggers teacher panel)
  const handleLogoClick = () => {
    setLogoClicks(prev => {
      const next = prev + 1;
      if (next >= 3) {
        setIsTeacherModalOpen(true);
        return 0;
      }
      // Reset clicks after 2 seconds of inactivity
      setTimeout(() => setLogoClicks(0), 2000);
      return next;
    });
  };

  // Click handler for secret bottom right corner
  const handleCornerClick = () => {
    setCornerClicks(prev => {
      const next = prev + 1;
      if (next >= 3) {
        setIsTeacherModalOpen(true);
        return 0;
      }
      setTimeout(() => setCornerClicks(0), 2000);
      return next;
    });
  };

  // Helper functions for student modification
  const handleAddStudent = (name) => {
    setClassesData(prev => {
      const classStudents = prev[currentClass] || [];
      return {
        ...prev,
        [currentClass]: [...classStudents, { name }]
      };
    });
  };

  const handleBulkAddStudents = (namesList) => {
    setClassesData(prev => {
      const classStudents = prev[currentClass] || [];
      // Filter out duplicate names
      const existingNames = classStudents.map(s => s.name);
      const newUniqueStudents = namesList
        .filter(name => !existingNames.includes(name))
        .map(name => ({ name }));

      return {
        ...prev,
        [currentClass]: [...classStudents, ...newUniqueStudents]
      };
    });
  };

  const handleDeleteStudent = (name) => {
    setClassesData(prev => {
      const classStudents = prev[currentClass] || [];
      return {
        ...prev,
        [currentClass]: classStudents.filter(s => s.name !== name)
      };
    });

    // Also clear from rigged queue if deleted
    setRiggedQueue(prev => prev.filter(n => n !== name));
  };

  const handleClearStudents = () => {
    if (confirm(`진짜로 ${currentClass} 학생 명단을 모두 비우시겠습니까?`)) {
      setClassesData(prev => ({
        ...prev,
        [currentClass]: []
      }));
      setRiggedQueue([]);
    }
  };

  const currentStudentsList = classesData[currentClass] || [];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      {/* 1. Ethics Gate Overlay (If not agreed) */}
      {!agreedToEthics && <EthicsGate onAgree={handleAgreeEthics} />}

      {/* 2. Main Navigation Bar */}
      <nav className="navbar">
        <div className="logo-section" onClick={handleLogoClick} title="헤더 로고를 3번 연속 클릭하면 교사용 패널이 열립니다.">
          🎲 <span>발표자 뽑기</span>
        </div>
        <div className="navbar-actions">
          <button 
            className="btn btn-secondary" 
            onClick={handleReviewEthics}
            style={{ fontSize: '0.85rem', padding: '8px 14px' }}
          >
            📋 윤리 가이드 다시보기
          </button>
        </div>
      </nav>

      {/* 3. Main Workspace Grid */}
      <div className="app-container">
        {/* Left Side: Student List & Import */}
        <StudentManager
          currentClass={currentClass}
          setCurrentClass={setCurrentClass}
          students={currentStudentsList}
          onAddStudent={handleAddStudent}
          onBulkAddStudents={handleBulkAddStudents}
          onDeleteStudent={handleDeleteStudent}
          onClearStudents={handleClearStudents}
        />

        {/* Right Side: Spin Wheel & History */}
        <PresenterDrawer
          students={currentStudentsList}
          riggedQueue={riggedQueue}
          setRiggedQueue={setRiggedQueue}
          history={history}
          setHistory={setHistory}
        />
      </div>

      {/* 4. Invisible bottom right click handler for teacher panel */}
      <div 
        className="hidden-trigger" 
        onClick={handleCornerClick} 
        title="이 구역을 3번 연속 클릭하면 교사용 패널이 열립니다."
      ></div>

      {/* 5. Hidden Teacher Panel */}
      <TeacherSettings
        isOpen={isTeacherModalOpen}
        onClose={() => setIsTeacherModalOpen(false)}
        students={currentStudentsList}
        riggedQueue={riggedQueue}
        setRiggedQueue={setRiggedQueue}
      />
    </div>
  );
}
