// ---------- 정책 가정(간이) ----------

// LTV 기본 비율 계산
function ltvDefaultPct(region, homeCount) {
  // 매우 간이화: 실제 제도는 가격구간/생애최초 등 복잡. 수동 조정 전제로 기본값만 제공
  if (region === 'speculation') return 40; // 투기과열(서울 강북구 기본)
  if (region === 'adjusted') return 50;    // 조정대상
  return 70; // 일반
}

// 취득세 계산
function acquisitionTax(price, homeCount, region) {
  // 기본: 1주택 1.1/2.2/3.3% (취득세+지방교육세 10%)
  // 다주택 중과(간이): 규제지역 2주택 8%, 3주택 이상 12% (대략)
  const priceW = price;
  let baseRate;
  
  if (homeCount >= 2 && (region === 'adjusted' || region === 'speculation')) {
    baseRate = (homeCount >= 3) ? 12 : 8; // 간이 가정
  } else {
    if (priceW <= 600_000_000) baseRate = 1.1;
    else if (priceW <= 900_000_000) baseRate = 2.2;
    else baseRate = 3.3;
  }
  
  const gross = priceW * (baseRate/100);
  // 생애최초 취득세 200만원 할인(간이 반영, 하한 0)
  const discount = 2_000_000;
  return Math.max(0, gross - discount);
}

// 연간 재산세 계산 (간이)
function annualPropertyTaxSimple(price, assessedRatioPct) {
  // 공시가 ≈ 시세 × 비율, 누진세율(간이): 0.1% (≤6억), 0.15% (6~15억), 0.25% (15~30억), 0.4% (>30억)
  const assessed = price * (assessedRatioPct/100);
  const bands = [
    { cap: 600_000_000, rate: 0.0010 },
    { cap: 1_500_000_000, rate: 0.0015 },
    { cap: 3_000_000_000, rate: 0.0025 },
    { cap: Infinity, rate: 0.0040 },
  ];
  
  let remaining = assessed, prevCap = 0, tax = 0;
  for (const b of bands) {
    const taxable = Math.max(0, Math.min(remaining, b.cap - prevCap));
    tax += taxable * b.rate;
    remaining -= taxable;
    prevCap = b.cap;
    if (remaining <= 0) break;
  }
  return Math.max(0, tax);
}

// 중개수수료 계산 (간이)
function calculateBrokerFee(price) {
  // 간이 요율: 가격 구간별 추정치
  const p = price;
  if (p <= 200000000) return p * 0.006;      // ≤2억: 0.6%
  if (p <= 600000000) return p * 0.005;      // ≤6억: 0.5%
  if (p <= 900000000) return p * 0.004;      // ≤9억: 0.4%
  return Math.min(p * 0.009, 20000000);      // >9억: 0.9%, 상한 간이 2천만원
}

// 인지세 계산 (간이)
function calculateStampTax(price) {
  const p = price;
  if (p <= 100000000) return 20000;                 // ≤1억
  if (p <= 1000000000) return 50000;               // ≤10억
  return 150000;                                    // >10억
}
