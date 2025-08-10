// ---------- 대출 계산 유틸리티 ----------

// 원리금균등 월납부액 계산
function annuityMonthlyPayment(principal, annualRatePct, years) {
  if (!principal || principal <= 0) return 0;
  const r = (annualRatePct/100) / 12;
  const n = years * 12;
  if (r === 0) return principal / n;
  return principal * r / (1 - Math.pow(1 + r, -n));
}

// 월납부액으로부터 원금 계산
function principalFromMonthly(payment, annualRatePct, years) {
  const r = (annualRatePct/100) / 12;
  const n = years * 12;
  if (r === 0) return payment * n;
  return payment * (1 - Math.pow(1 + r, -n)) / r;
}

// 대출 잔액 계산
function remainingBalance(principal, annualRatePct, years, monthsElapsed) {
  const r = (annualRatePct/100) / 12;
  const n = years * 12;
  const pmt = annuityMonthlyPayment(principal, annualRatePct, years);
  if (r === 0) return principal - (pmt * monthsElapsed);
  // Formula: B_k = P*(1+r)^k - pmt* [((1+r)^k - 1)/r]
  const pow = Math.pow(1 + r, monthsElapsed);
  return principal * pow - pmt * ((pow - 1) / r);
}

// DSR 기준 최대 대출 가능액 계산
function calculateDsrMaxLoan(annualIncome, dsrLimitPct, existingMonthlyDebt, annualRate, loanYears) {
  const monthlyIncome = annualIncome / 12;
  const dsrCapMonthly = Math.max(0, (annualIncome * (dsrLimitPct/100) / 12) - existingMonthlyDebt);
  return principalFromMonthly(dsrCapMonthly, annualRate, loanYears);
}

// LTV 기준 최대 대출 가능액 계산
function calculateLtvMaxLoan(price, ltvPct) {
  return price * (ltvPct/100);
}

// 최대 대출 가능액 계산 (LTV/DSR 중 작은 값)
function calculateMaxLoanAllowed(neededLoan, ltvMax, dsrMax) {
  return Math.max(0, Math.min(neededLoan, ltvMax, dsrMax));
}
