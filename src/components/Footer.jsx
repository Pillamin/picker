import React from 'react';

export default function Footer({ onOpenTerms, onOpenPrivacy }) {
  return (
    <footer className="app-footer">
      <div className="footer-content">
        <div className="footer-links">
          <button className="footer-link-btn" onClick={onOpenTerms}>이용약관</button>
          <span className="footer-divider">|</span>
          <button className="footer-link-btn" onClick={onOpenPrivacy}>개인정보처리방침</button>
        </div>
        <div className="footer-copyright">
          <p>ⓒ 2026 발표자뽑기. All rights reserved.</p>
          <p>정보관리책임자: 담임 교사</p>
        </div>
      </div>
    </footer>
  );
}
