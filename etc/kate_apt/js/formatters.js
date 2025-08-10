// ---------- 포맷팅 유틸리티 ----------
const nf = new Intl.NumberFormat('ko-KR');
const MANWON = 10000;
const EOK = 100000000; // 1억

// 기본 포맷팅 함수들
const cfmt = (n) => n==null||isNaN(n) ? '-' : nf.format(Math.round(n));
const wfmt = (n) => n==null||isNaN(n) ? '-' : nf.format(Math.round(n)) + '원';
const mfmt = (n) => n==null||isNaN(n) ? '-' : nf.format(Math.round(n / MANWON)) + '만원';

// 부호가 있는 만원 포맷팅
const signedMfmt = (n) => {
  if (n==null||isNaN(n)) return '-';
  const sign = n >= 0 ? '+' : '';
  return sign + mfmt(Math.abs(n));
};

// 억/만원 복합 포맷팅
const eokManWonFmt = (n) => {
  if (n==null||isNaN(n)) return '-';
  const abs = Math.abs(Math.round(n));
  const eok = Math.floor(abs / EOK);
  const man = Math.floor((abs % EOK) / MANWON);
  const won = abs % MANWON;
  const parts = [];
  
  if (eok > 0) parts.push(`${eok}억`);
  if (man > 0) {
    // won이 있으면 '만', 없으면 '만원'
    parts.push(`${nf.format(man)}만${won > 0 ? '' : '원'}`);
  }
  if (won > 0) parts.push(`${nf.format(won)}원`);
  if (parts.length === 0) parts.push('0원');
  
  // 3억원 같이 딱 떨어지면 '3억원'
  if (eok > 0 && man === 0 && won === 0) return (n < 0 ? '-' : '') + `${eok}억원`;
  return (n < 0 ? '-' : '') + parts.join(' ');
};

// 부호가 있는 억/만원 포맷팅
const signedEokManWon = (n, showPlus) => {
  if (n==null || isNaN(n)) return '-';
  const sp = !!showPlus;
  const absStr = eokManWonFmt(Math.abs(Number(n)));
  if (n < 0) return '-' + absStr.replace(/^[-]/,'');
  return (sp ? '+' : '') + absStr;
};

// 퍼센트 포맷팅
const pfmt = (n) => n==null||isNaN(n) ? '-' : (Math.round(n*10)/10).toFixed(1) + '%';

// DOM 유틸리티
const valNum = (id) => parseFloat(String(document.getElementById(id).value).replace(/[^0-9.-]/g,'')) || 0;
const setText = (id, text) => { document.getElementById(id).textContent = text; };

// 숫자 변환 유틸리티
const toNum = (n, d=0) => {
  const x = Number(n);
  return Number.isFinite(x) ? x : d;
};

// 범위 제한
const clamp = (x, lo, hi) => Math.max(lo, Math.min(hi, x));

// 만원을 원으로 변환
const manToWon = (nMan) => nMan * MANWON;
const valManToWon = (id) => manToWon(valNum(id));
