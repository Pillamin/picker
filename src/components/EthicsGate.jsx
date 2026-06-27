import React, { useState } from 'react';

const coreValues = {
  initiative: {
    label: '주도성',
    className: 'initiative',
    icon: (
      <svg className="w-4 h-4 mr-1" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M15 14c.2-1 .7-1.7 1.5-2.5 1-.9 1.5-2.2 1.5-3.5A6 6 0 0 0 6 8c0 1 .2 2.2 1.5 3.5.7.7 1.3 1.5 1.5 2.5" />
        <path d="M9 18h6" />
        <path d="M10 22h4" />
      </svg>
    )
  },
  purpose: {
    label: '합목적성',
    className: 'purpose',
    icon: (
      <svg className="w-4 h-4 mr-1" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10" />
        <circle cx="12" cy="12" r="6" />
        <circle cx="12" cy="12" r="2" />
      </svg>
    )
  },
  safety: {
    label: '안전성',
    className: 'safety',
    icon: (
      <svg className="w-4 h-4 mr-1" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
      </svg>
    )
  },
  transparency: {
    label: '투명성',
    className: 'transparency',
    icon: (
      <svg className="w-4 h-4 mr-1" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7z" />
        <circle cx="12" cy="12" r="3" />
      </svg>
    )
  }
};

const guideData = [
  {
    id: 1,
    category: '활용 목적',
    values: [coreValues.initiative, coreValues.purpose],
    title: '생성형 AI의 활용 이유와 범위를 스스로 설명할 수 있어야 해요.',
    desc: '생성형 AI를 활용하는 이유가 진짜 궁금한 것을 탐구하기 위해 보조 도구로 활용하려는 것인지, 숙제를 빨리 끝내려고 쓰는 것인지 스스로에게 먼저 물어봐요. 선생님이 허락하신 범위에서 내가 정한 학습 목표를 달성하기 위해 생성형 AI를 보조 도구로 활용해요.'
  },
  {
    id: 2,
    category: '주도적 학습',
    values: [coreValues.initiative],
    title: '생성형 AI를 사용하기 전, 내가 아는 것을 정리하고 질문을 설계해요.',
    desc: '생성형 AI를 사용하기 전에 내 생각을 먼저 적어봐요. 내가 모르는 것이 무엇인지 파악한 다음, 이를 배우기 위해 어떤 도움을 받을지 구체적인 질문(프롬프트)을 만들어요.'
  },
  {
    id: 3,
    category: '비판적 검증',
    values: [coreValues.initiative],
    title: '생성형 AI의 답변 속 오류나 편향된 시각을 직접 찾아보고 비교해요.',
    desc: '생성형 AI는 가끔 그럴듯한 거짓말(할루시네이션)을 할 수 있어요. 생성형 AI의 답변을 맹신하지 않고 교과서나 공식 자료를 통해 한 번 더 교차 검증해요. 한쪽으로 치우친 생각은 아닌지 비판적으로 검증하는 습관을 가져요.'
  },
  {
    id: 4,
    category: '사고의 확장',
    values: [coreValues.initiative, coreValues.purpose],
    title: '단순한 질문을 넘어 좋은 질문을 설계하며 생각의 범위를 넓혀요.',
    desc: '생성형 AI에게 단순히 정답만을 요구하는 것은 바람직하지 않아요. 생성형 AI 답변의 근거와 다른 관점을 고려하여, "왜 그럴까?", "다른 방법은 없을까?"라고 다각도의 심화 질문을 이어가요. 생성형 AI를 토론 파트너처럼 활용하여 나의 생각을 키워가요.'
  },
  {
    id: 5,
    category: '안전과 관계',
    values: [coreValues.safety],
    title: '개인정보를 스스로 지키고, 생성형 AI와 정서적 거리를 유지해요.',
    desc: '나 또는 타인의 이름, 연락처, 주소, 계정 정보 등을 함부로 생성형 AI에 입력하지 않아요. 이러한 정보가 생성형 AI 학습에 활용될 수 있어요. 속상하거나 힘든 일이 있을 때는 생성형 AI보다 나를 진심으로 이해해 줄 수 있는 가족, 선생님, 친구들과 마음을 나누어요.'
  },
  {
    id: 6,
    category: '투명성·윤리',
    values: [coreValues.transparency],
    title: '생성형 AI를 활용한 부분과 내 생각을 명확하게 구분해서 밝혀요.',
    desc: '수업이나 평가 및 과제에서 생성형 AI의 도움을 받았다면, 어떤 도구를 어떤 방식으로 참고하였는지 투명하게 밝혀요. 생성형 AI의 답변을 내가 쓴 것처럼 제출하는 것은 표절(부정행위)임을 명심해요.'
  }
];

export default function EthicsGate({ onAgree }) {
  const [isChecked, setIsChecked] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (isChecked) {
      onAgree();
    }
  };

  return (
    <div className="gate-overlay">
      <div className="gate-card">
        <div className="gate-header">
          <h1>인공지능(AI) 활용 윤리 핵심가이드</h1>
          <p>생성형 AI를 지혜롭고 안전하게 활용하기 위해 우리 함께 약속해요!</p>
        </div>

        <div className="ethics-table-container">
          <table className="ethics-table">
            <thead>
              <tr>
                <th className="col-value">핵심 가치</th>
                <th className="col-guide">핵심 가이드</th>
              </tr>
            </thead>
            <tbody>
              {guideData.map((item) => (
                <tr className="ethics-row" key={item.id}>
                  <td>
                    <div className="value-badges-cell">
                      {item.values.map((val, idx) => (
                        <span key={idx} className={`badge-value ${val.className}`}>
                          {val.icon}
                          {val.label}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td>
                    <div className="guide-cell-layout">
                      <div className="guide-badge-box">
                        <div className="guide-badge-num">Guide {item.id}</div>
                        <div className="guide-badge-title">{item.category}</div>
                      </div>
                      <div className="guide-text-box">
                        <div className="guide-text-title">{item.title}</div>
                        <div className="guide-text-desc">{item.desc}</div>
                      </div>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <form onSubmit={handleSubmit} className="gate-footer-section">
          <label className="agreement-checkbox-wrapper">
            <input
              type="checkbox"
              checked={isChecked}
              onChange={(e) => setIsChecked(e.target.checked)}
            />
            <span className="custom-checkbox"></span>
            <span>나는 윤리 핵심가이드를 빠짐없이 읽고 이를 실천하겠습니다.</span>
          </label>

          <button
            type="submit"
            disabled={!isChecked}
            className="btn btn-primary gate-submit-btn"
          >
            본 활동 시작하기
          </button>
        </form>
      </div>
    </div>
  );
}
