// ---------- 메인 계산기 로직 ----------

// 기본값 설정
function setDefaults() {
  // 번동주공 60.33㎡ 예시 기본값
  document.getElementById('price').value = '41,000';
  document.getElementById('cash').value = '8000';
  document.getElementById('annualIncome').value = '4,750';
  
  document.getElementById('loanYears').value = '30';
  document.getElementById('annualRate').value = '3.95';
  document.getElementById('dsrLimitPct').value = '40';
  document.getElementById('existingMonthlyDebt').value = '0';
  document.getElementById('assessedRatioPct').value = '70';
  document.getElementById('holdingYears').value = '10';
  document.getElementById('annualAppreciationPct').value = '4';
  // 목표 매도가: 기본값 제거(빈 값 유지)
  document.getElementById('targetSellPrice').value = '';
}

// 자동 계산 이벤트 바인딩
function bindAutoCompute() {
  const ids = [
    'price','cash','annualIncome','loanYears','annualRate',
    'dsrLimitPct','existingMonthlyDebt','assessedRatioPct','holdingYears','annualAppreciationPct','targetSellPrice'
  ];
  
  ids.forEach(id => {
    const element = document.getElementById(id);
    if (element) {
      element.addEventListener('input', compute);
      element.addEventListener('change', compute);
    }
  });
  
  const calcBtn = document.getElementById('btnCalc');
  if (calcBtn) {
    calcBtn.addEventListener('click', compute);
  }
}

// 메인 계산 함수
function compute() {
  // 입력값 가져오기
  const price = valManToWon('price');
  const cash = valManToWon('cash');
  const annualIncome = valManToWon('annualIncome');
  const years = parseInt(document.getElementById('loanYears').value || '0', 10) || 0;
  const rate = parseFloat(document.getElementById('annualRate').value || '0') || 0;
  const region = 'speculation'; // 지역 규제 입력 제거: 기본 가정
  const homeCount = 0; // 무주택 가정
  const dsrLimitPct = parseFloat(document.getElementById('dsrLimitPct').value || '0') || 0;
  const existingMonthlyDebt = valManToWon('existingMonthlyDebt');
  const assessedRatioPct = parseFloat(document.getElementById('assessedRatioPct').value || '0') || 0;
  const holdingYears = parseInt(document.getElementById('holdingYears').value || '0', 10) || 0;
  const annualAppreciationPct = parseFloat(document.getElementById('annualAppreciationPct').value || '0') || 0;
  const targetSellPrice = valManToWon('targetSellPrice');
  const sellCostPct = 0; // 매도 부대비용율 제외

  // LTV 수동 입력 처리
  const ltvManualField = document.getElementById('ltvManualPct');
  const ltvManualRaw = ltvManualField ? ltvManualField.value : '';
  const ltvManual = ltvManualRaw === '' ? NaN : parseFloat(ltvManualRaw);
  const ltvPct = isNaN(ltvManual) ? ltvDefaultPct(region, homeCount) : ltvManual;

  // 필요 대출액
  const neededLoan = Math.max(0, toNum(price) - toNum(cash));

  // LTV 한도
  const ltvMax = calculateLtvMaxLoan(toNum(price), toNum(ltvPct));

  // DSR 한도
  const dsrCapMonthly = Math.max(0, (toNum(annualIncome) * (toNum(dsrLimitPct)/100) / 12) - toNum(existingMonthlyDebt));
  const dsrMax = calculateDsrMaxLoan(toNum(annualIncome), toNum(dsrLimitPct), toNum(existingMonthlyDebt), toNum(rate), toNum(years));

  // 최종 대출 가능액
  const maxLoanAllowed = calculateMaxLoanAllowed(toNum(neededLoan), toNum(ltvMax), toNum(dsrMax));

  // 월납부액
  const monthlyPayment = annuityMonthlyPayment(toNum(maxLoanAllowed), toNum(rate), toNum(years));

  // 취득세
  const acqTax = acquisitionTax(toNum(price), homeCount, region);

  // 보유세
  const annualPropTax = annualPropertyTaxSimple(toNum(price), toNum(assessedRatioPct));

  // 보유기간 이자합계
  const monthsHeld = toNum(holdingYears) * 12;
  const monthsConsidered = Math.min(monthsHeld, toNum(years)*12);
  const totalPaidDuringHold = toNum(monthlyPayment) * monthsConsidered;
  const remainingAfterHold = remainingBalance(toNum(maxLoanAllowed), toNum(rate), toNum(years), monthsConsidered);
  const principalRepaid = Math.max(0, toNum(maxLoanAllowed) - toNum(remainingAfterHold));
  const interestPaid = Math.max(0, toNum(totalPaidDuringHold) - toNum(principalRepaid));
  const avgPrincipal = monthsConsidered > 0 ? principalRepaid / monthsConsidered : 0;
  const avgInterest = monthsConsidered > 0 ? interestPaid / monthsConsidered : 0;

  // 미래 매도가
  let projectedSellPrice = toNum(targetSellPrice) > 0 ? toNum(targetSellPrice) : toNum(price) * Math.pow(1 + (toNum(annualAppreciationPct)/100), toNum(holdingYears));
  const simpleGain = Math.max(0, toNum(projectedSellPrice) - toNum(price));

  // 매수 부대비용
  const brokerFee = calculateBrokerFee(toNum(price));
  const stampTax = calculateStampTax(toNum(price));
  const buyCost = toNum(brokerFee) + toNum(stampTax);
  const buyCostGrandTotal = toNum(acqTax) + toNum(buyCost);

  // 손익 계산
  const pnl = toNum(simpleGain) - (toNum(acqTax) + toNum(buyCost) + toNum(interestPaid));

  // 결과 표시
  updateDisplay({
    neededLoan, ltvPct, dsrCapMonthly, maxLoanAllowed, monthlyPayment,
    avgPrincipal, avgInterest, acqTax, brokerFee, stampTax, buyCostGrandTotal,
    annualPropTax, interestPaid, pnl, simpleGain, monthsConsidered,
    ltvMax, dsrMax, neededLoan
  });
}

// 결과 표시 함수
function updateDisplay(results) {
  const {
    neededLoan, ltvPct, dsrCapMonthly, maxLoanAllowed, monthlyPayment,
    avgPrincipal, avgInterest, acqTax, brokerFee, stampTax, buyCostGrandTotal,
    annualPropTax, interestPaid, pnl, simpleGain, monthsConsidered,
    ltvMax, dsrMax, neededLoan: neededLoanVal
  } = results;

  setText('neededLoan', eokManWonFmt(neededLoan));
  setText('ltvCap', pfmt(ltvPct));
  setText('dsrCapMonthly', eokManWonFmt(dsrCapMonthly));
  setText('maxLoanAllowed', eokManWonFmt(maxLoanAllowed));
  setText('monthlyPayment', eokManWonFmt(monthlyPayment));
  setText('avgPrincipal', eokManWonFmt(avgPrincipal));
  setText('avgInterest', eokManWonFmt(avgInterest));
  setText('acqTax', eokManWonFmt(acqTax));
  setText('brokerFee', eokManWonFmt(brokerFee));
  setText('stampTax', eokManWonFmt(stampTax));
  setText('buyCostGrandTotal', eokManWonFmt(buyCostGrandTotal));
  setText('annualPropertyTax', eokManWonFmt(annualPropTax));
  setText('interestPaid', eokManWonFmt(interestPaid));
  setText('pnl', eokManWonFmt(pnl));
  setText('dbgSimpleGain', eokManWonFmt(simpleGain));
  setText('dbgAcq', eokManWonFmt(acqTax));
  setText('dbgBuyCost', eokManWonFmt(brokerFee + stampTax));
  setText('dbgInterest', eokManWonFmt(interestPaid));
  setText('dbgMonths', cfmt(monthsConsidered));
  setText('simpleGain', eokManWonFmt(simpleGain));

  setText('ltvMax', eokManWonFmt(ltvMax));
  setText('dsrMax', eokManWonFmt(dsrMax));
  
  const shortDiff = neededLoanVal - maxLoanAllowed;
  setText('shortCapital', signedEokManWon(-shortDiff, false));
  
  const gapLoan = maxLoanAllowed - neededLoanVal;
  setText('gap', signedEokManWon(gapLoan, true));
}

// 초기화
function init() {
  setDefaults();
  bindAutoCompute();
  compute();
}
