// ---------- 메인 계산기 로직 ----------

// localStorage 키
const STORAGE_KEY = 'kate_apt_calculator_data';
const SAVED_APARTMENTS_KEY = 'kate_apt_saved_apartments';

// 저장된 데이터 불러오기
function loadSavedData() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      const data = JSON.parse(saved);
      Object.keys(data).forEach(key => {
        const element = document.getElementById(key);
        if (element) {
          element.value = data[key];
        }
      });
      return true;
    }
  } catch (e) {
    console.warn('저장된 데이터 불러오기 실패:', e);
  }
  return false;
}

// 현재 데이터 저장하기
function saveCurrentData() {
  try {
    const data = {};
    const ids = [
      'kbPrice','price','cash','annualIncome','loanYears','annualRate',
      'dsrLimitPct','existingMonthlyDebt','creditLoanRate','assessedRatioPct','holdingYears','annualAppreciationPct','targetSellPrice','ltvManualPct'
    ];
    
    ids.forEach(id => {
      const element = document.getElementById(id);
      if (element && element.value !== '') {
        data[id] = element.value;
      }
    });
    
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (e) {
    console.warn('데이터 저장 실패:', e);
  }
}

// 기본값 설정
function setDefaults() {
  // 번동주공 60.33㎡ 예시 기본값
  document.getElementById('price').value = '41,000';
  // KB시세는 빈 값으로 두어 실제 거래가로 계산되도록 함
  document.getElementById('kbPrice').value = '';
  document.getElementById('cash').value = '8000';
  document.getElementById('annualIncome').value = '4,750';
  
  document.getElementById('loanYears').value = '30';
  document.getElementById('annualRate').value = '3.95';
  document.getElementById('dsrLimitPct').value = '40';
  document.getElementById('existingMonthlyDebt').value = '0';
  document.getElementById('assessedRatioPct').value = '70';
  document.getElementById('holdingYears').value = '10';
  document.getElementById('annualAppreciationPct').value = '4';
  document.getElementById('creditLoanRate').value = '5.0';
  // 목표 매도가: 기본값 제거(빈 값 유지)
  document.getElementById('targetSellPrice').value = '';
}

// 자동 계산 이벤트 바인딩
function bindAutoCompute() {
  const ids = [
    'kbPrice','price','cash','annualIncome','loanYears','annualRate',
    'dsrLimitPct','existingMonthlyDebt','creditLoanRate','assessedRatioPct','holdingYears','annualAppreciationPct','targetSellPrice','ltvManualPct'
  ];
  
  ids.forEach(id => {
    const element = document.getElementById(id);
    if (element) {
      element.addEventListener('input', () => {
        compute();
        saveCurrentData(); // 입력값 변경 시 자동 저장
      });
      element.addEventListener('change', () => {
        compute();
        saveCurrentData(); // 값 변경 시 자동 저장
      });
    }
  });
  
  const calcBtn = document.getElementById('btnCalc');
  if (calcBtn) {
    calcBtn.addEventListener('click', compute);
  }
  
  const resetBtn = document.getElementById('btnReset');
  if (resetBtn) {
    resetBtn.addEventListener('click', () => {
      localStorage.removeItem(STORAGE_KEY);
      setDefaults();
      compute();
    });
  }
}

// 메인 계산 함수
function compute() {
  // 입력값 가져오기
  const kbPrice = valManToWon('kbPrice');
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
  const creditLoanRate = parseFloat(document.getElementById('creditLoanRate').value || '0') || 0;
  const sellCostPct = 0; // 매도 부대비용율 제외

  // LTV 수동 입력 처리
  const ltvManualField = document.getElementById('ltvManualPct');
  const ltvManualRaw = ltvManualField ? ltvManualField.value : '';
  const ltvManual = ltvManualRaw === '' ? NaN : parseFloat(ltvManualRaw);
  const ltvPct = isNaN(ltvManual) ? ltvDefaultPct(region, homeCount) : ltvManual;

  // 필요 대출액 (실제 거래가 기준)
  const neededLoan = Math.max(0, toNum(price) - toNum(cash));

  // LTV 한도 (KB부동산 시세 기준, 미입력 시 실제 거래가 사용)
  const ltvPrice = toNum(kbPrice) > 0 ? toNum(kbPrice) : toNum(price);
  const ltvMax = calculateLtvMaxLoan(ltvPrice, toNum(ltvPct));

  // DSR 한도
  const dsrCapMonthly = Math.max(0, (toNum(annualIncome) * (toNum(dsrLimitPct)/100) / 12) - toNum(existingMonthlyDebt));
  const dsrMax = calculateDsrMaxLoan(toNum(annualIncome), toNum(dsrLimitPct), toNum(existingMonthlyDebt), toNum(rate), toNum(years));

  // 최종 대출 가능액 (KB시세 기준)
  const maxLoanAllowed = calculateMaxLoanAllowed(toNum(neededLoan), toNum(ltvMax), toNum(dsrMax));

  // 부족 자본금 및 신용대출 이자 계산
  const shortCapital = Math.max(0, toNum(neededLoan) - toNum(maxLoanAllowed));
  const creditLoanMonthlyInterest = toNum(shortCapital) * (toNum(creditLoanRate) / 100) / 12;

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
    ltvMax, dsrMax, neededLoan, shortCapital, creditLoanMonthlyInterest
  });
}

// 결과 표시 함수
function updateDisplay(results) {
  const {
    neededLoan, ltvPct, dsrCapMonthly, maxLoanAllowed, monthlyPayment,
    avgPrincipal, avgInterest, acqTax, brokerFee, stampTax, buyCostGrandTotal,
    annualPropTax, interestPaid, pnl, simpleGain, monthsConsidered,
    ltvMax, dsrMax, neededLoan: neededLoanVal, shortCapital, creditLoanMonthlyInterest
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
  
  setText('shortCapital', signedEokManWon(-shortCapital, false));
  setText('creditLoanMonthlyInterest', eokManWonFmt(creditLoanMonthlyInterest));
  
  const gapLoan = maxLoanAllowed - neededLoanVal;
  setText('gap', signedEokManWon(gapLoan, true));
}

// 저장된 아파트 목록 불러오기
function loadSavedApartments() {
  try {
    const saved = localStorage.getItem(SAVED_APARTMENTS_KEY);
    return saved ? JSON.parse(saved) : [];
  } catch (e) {
    console.warn('저장된 아파트 목록 불러오기 실패:', e);
    return [];
  }
}

// 모달 표시
function showSaveModal() {
  const modal = document.getElementById('saveModal');
  const nameInput = document.getElementById('saveName');
  modal.style.display = 'block';
  nameInput.value = '';
  nameInput.focus();
}

// 수정 모달 표시
function showEditModal(index) {
  const modal = document.getElementById('editModal');
  const savedApartments = loadSavedApartments();
  const apartment = savedApartments[index];
  
  // 모든 입력 필드에 현재 값 설정
  document.getElementById('editName').value = apartment.name;
  document.getElementById('editPrice').value = wonToManFmt(apartment.price);
  document.getElementById('editKbPrice').value = wonToManFmt(apartment.kbPrice);
  document.getElementById('editCash').value = wonToManFmt(apartment.cash);
  document.getElementById('editAnnualIncome').value = wonToManFmt(apartment.annualIncome);
  document.getElementById('editLoanYears').value = apartment.loanYears;
  document.getElementById('editAnnualRate').value = apartment.annualRate;
  document.getElementById('editLtvManualPct').value = apartment.ltvManualPct;
  document.getElementById('editDsrLimitPct').value = apartment.dsrLimitPct;
  document.getElementById('editExistingMonthlyDebt').value = wonToManFmt(apartment.existingMonthlyDebt);
  document.getElementById('editCreditLoanRate').value = apartment.creditLoanRate;
  document.getElementById('editAssessedRatioPct').value = apartment.assessedRatioPct;
  document.getElementById('editHoldingYears').value = apartment.holdingYears;
  document.getElementById('editAnnualAppreciationPct').value = apartment.annualAppreciationPct;
  document.getElementById('editTargetSellPrice').value = wonToManFmt(apartment.targetSellPrice);
  
  modal.style.display = 'block';
  document.getElementById('editName').focus();
  
  // 현재 수정 중인 인덱스를 모달에 저장
  modal.dataset.editIndex = index;
}

// 모달 숨기기
function hideSaveModal() {
  const modal = document.getElementById('saveModal');
  modal.style.display = 'none';
}

// 수정 모달 숨기기
function hideEditModal() {
  const modal = document.getElementById('editModal');
  modal.style.display = 'none';
}

// 아파트 저장하기
function saveApartment() {
  const name = document.getElementById('saveName').value.trim();
  if (!name) {
    alert('아파트 이름을 입력해주세요.');
    return;
  }

  // 현재 계산 결과를 저장
  const currentData = {
    name: name,
    timestamp: new Date().toISOString(),
    kbPrice: valManToWon('kbPrice'),
    price: valManToWon('price'),
    cash: valManToWon('cash'),
    annualIncome: valManToWon('annualIncome'),
    loanYears: parseInt(document.getElementById('loanYears').value || '0', 10) || 0,
    annualRate: parseFloat(document.getElementById('annualRate').value || '0') || 0,
    ltvManualPct: parseFloat(document.getElementById('ltvManualPct').value || '0') || 0,
    dsrLimitPct: parseFloat(document.getElementById('dsrLimitPct').value || '0') || 0,
    existingMonthlyDebt: valManToWon('existingMonthlyDebt'),
    creditLoanRate: parseFloat(document.getElementById('creditLoanRate').value || '0') || 0,
    assessedRatioPct: parseFloat(document.getElementById('assessedRatioPct').value || '0') || 0,
    holdingYears: parseInt(document.getElementById('holdingYears').value || '0', 10) || 0,
    annualAppreciationPct: parseFloat(document.getElementById('annualAppreciationPct').value || '0') || 0,
    targetSellPrice: valManToWon('targetSellPrice')
  };

  // 계산된 결과도 저장
  const results = calculateCurrentResults();
  Object.assign(currentData, results);

  // 기존 저장된 목록에 추가
  const savedApartments = loadSavedApartments();
  savedApartments.push(currentData);
  
  try {
    localStorage.setItem(SAVED_APARTMENTS_KEY, JSON.stringify(savedApartments));
    alert('저장되었습니다!');
    renderSavedApartments();
  } catch (e) {
    console.warn('저장 실패:', e);
    alert('저장에 실패했습니다.');
  }
}

// 현재 계산 결과 가져오기
function calculateCurrentResults() {
  // compute() 함수의 계산 로직을 여기서 실행
  const kbPrice = valManToWon('kbPrice');
  const price = valManToWon('price');
  const cash = valManToWon('cash');
  const annualIncome = valManToWon('annualIncome');
  const years = parseInt(document.getElementById('loanYears').value || '0', 10) || 0;
  const rate = parseFloat(document.getElementById('annualRate').value || '0') || 0;
  const region = 'speculation';
  const homeCount = 0;
  const dsrLimitPct = parseFloat(document.getElementById('dsrLimitPct').value || '0') || 0;
  const existingMonthlyDebt = valManToWon('existingMonthlyDebt');
  const assessedRatioPct = parseFloat(document.getElementById('assessedRatioPct').value || '0') || 0;
  const holdingYears = parseInt(document.getElementById('holdingYears').value || '0', 10) || 0;
  const annualAppreciationPct = parseFloat(document.getElementById('annualAppreciationPct').value || '0') || 0;
  const targetSellPrice = valManToWon('targetSellPrice');
  const creditLoanRate = parseFloat(document.getElementById('creditLoanRate').value || '0') || 0;

  const ltvManualField = document.getElementById('ltvManualPct');
  const ltvManualRaw = ltvManualField ? ltvManualField.value : '';
  const ltvManual = ltvManualRaw === '' ? NaN : parseFloat(ltvManualRaw);
  const ltvPct = isNaN(ltvManual) ? ltvDefaultPct(region, homeCount) : ltvManual;

  const neededLoan = Math.max(0, toNum(price) - toNum(cash));
  const ltvPrice = toNum(kbPrice) > 0 ? toNum(kbPrice) : toNum(price);
  const ltvMax = calculateLtvMaxLoan(ltvPrice, toNum(ltvPct));
  const dsrCapMonthly = Math.max(0, (toNum(annualIncome) * (toNum(dsrLimitPct)/100) / 12) - toNum(existingMonthlyDebt));
  const dsrMax = calculateDsrMaxLoan(toNum(annualIncome), toNum(dsrLimitPct), toNum(existingMonthlyDebt), toNum(rate), toNum(years));
  const maxLoanAllowed = calculateMaxLoanAllowed(toNum(neededLoan), toNum(ltvMax), toNum(dsrMax));
  const shortCapital = Math.max(0, toNum(neededLoan) - toNum(maxLoanAllowed));
  const creditLoanMonthlyInterest = toNum(shortCapital) * (toNum(creditLoanRate) / 100) / 12;
  const monthlyPayment = annuityMonthlyPayment(toNum(maxLoanAllowed), toNum(rate), toNum(years));
  const acqTax = acquisitionTax(toNum(price), homeCount, region);
  const annualPropTax = annualPropertyTaxSimple(toNum(price), toNum(assessedRatioPct));
  const monthsHeld = toNum(holdingYears) * 12;
  const monthsConsidered = Math.min(monthsHeld, toNum(years)*12);
  const totalPaidDuringHold = toNum(monthlyPayment) * monthsConsidered;
  const remainingAfterHold = remainingBalance(toNum(maxLoanAllowed), toNum(rate), toNum(years), monthsConsidered);
  const principalRepaid = Math.max(0, toNum(maxLoanAllowed) - toNum(remainingAfterHold));
  const interestPaid = Math.max(0, toNum(totalPaidDuringHold) - toNum(principalRepaid));
  let projectedSellPrice = toNum(targetSellPrice) > 0 ? toNum(targetSellPrice) : toNum(price) * Math.pow(1 + (toNum(annualAppreciationPct)/100), toNum(holdingYears));
  const simpleGain = Math.max(0, toNum(projectedSellPrice) - toNum(price));
  const brokerFee = calculateBrokerFee(toNum(price));
  const stampTax = calculateStampTax(toNum(price));
  const buyCost = toNum(brokerFee) + toNum(stampTax);
  const pnl = toNum(simpleGain) - (toNum(acqTax) + toNum(buyCost) + toNum(interestPaid));

  return {
    maxLoanAllowed: maxLoanAllowed,
    monthlyPayment: monthlyPayment,
    shortCapital: shortCapital,
    pnl: pnl,
    ltvMax: ltvMax,
    dsrMax: dsrMax
  };
}

// 데이터로부터 계산 결과 가져오기 (수정용)
function calculateResultsFromData(data) {
  const region = 'speculation';
  const homeCount = 0;
  
  const ltvPct = data.ltvManualPct || ltvDefaultPct(region, homeCount);
  const neededLoan = Math.max(0, toNum(data.price) - toNum(data.cash));
  const ltvPrice = toNum(data.kbPrice) > 0 ? toNum(data.kbPrice) : toNum(data.price);
  const ltvMax = calculateLtvMaxLoan(ltvPrice, toNum(ltvPct));
  const dsrCapMonthly = Math.max(0, (toNum(data.annualIncome) * (toNum(data.dsrLimitPct)/100) / 12) - toNum(data.existingMonthlyDebt));
  const dsrMax = calculateDsrMaxLoan(toNum(data.annualIncome), toNum(data.dsrLimitPct), toNum(data.existingMonthlyDebt), toNum(data.annualRate), toNum(data.loanYears));
  const maxLoanAllowed = calculateMaxLoanAllowed(toNum(neededLoan), toNum(ltvMax), toNum(dsrMax));
  const shortCapital = Math.max(0, toNum(neededLoan) - toNum(maxLoanAllowed));
  const creditLoanMonthlyInterest = toNum(shortCapital) * (toNum(data.creditLoanRate) / 100) / 12;
  const monthlyPayment = annuityMonthlyPayment(toNum(maxLoanAllowed), toNum(data.annualRate), toNum(data.loanYears));
  const acqTax = acquisitionTax(toNum(data.price), homeCount, region);
  const annualPropTax = annualPropertyTaxSimple(toNum(data.price), toNum(data.assessedRatioPct));
  const monthsHeld = toNum(data.holdingYears) * 12;
  const monthsConsidered = Math.min(monthsHeld, toNum(data.loanYears)*12);
  const totalPaidDuringHold = toNum(monthlyPayment) * monthsConsidered;
  const remainingAfterHold = remainingBalance(toNum(maxLoanAllowed), toNum(data.annualRate), toNum(data.loanYears), monthsConsidered);
  const principalRepaid = Math.max(0, toNum(maxLoanAllowed) - toNum(remainingAfterHold));
  const interestPaid = Math.max(0, toNum(totalPaidDuringHold) - toNum(principalRepaid));
  let projectedSellPrice = toNum(data.targetSellPrice) > 0 ? toNum(data.targetSellPrice) : toNum(data.price) * Math.pow(1 + (toNum(data.annualAppreciationPct)/100), toNum(data.holdingYears));
  const simpleGain = Math.max(0, toNum(projectedSellPrice) - toNum(data.price));
  const brokerFee = calculateBrokerFee(toNum(data.price));
  const stampTax = calculateStampTax(toNum(data.price));
  const buyCost = toNum(brokerFee) + toNum(stampTax);
  const pnl = toNum(simpleGain) - (toNum(acqTax) + toNum(buyCost) + toNum(interestPaid));

  return {
    maxLoanAllowed: maxLoanAllowed,
    monthlyPayment: monthlyPayment,
    shortCapital: shortCapital,
    pnl: pnl,
    ltvMax: ltvMax,
    dsrMax: dsrMax
  };
}

// 저장된 아파트 목록 렌더링
function renderSavedApartments() {
  const savedApartments = loadSavedApartments();
  const tbody = document.getElementById('savedApartmentsBody');
  const cardsContainer = document.getElementById('savedApartmentsCards');
  const noDataDiv = document.getElementById('noSavedData');
  const tableDiv = document.getElementById('savedApartmentsTable');

  if (savedApartments.length === 0) {
    tbody.innerHTML = '';
    cardsContainer.innerHTML = '';
    noDataDiv.style.display = 'block';
    tableDiv.style.display = 'none';
    return;
  }

  noDataDiv.style.display = 'none';
  tableDiv.style.display = 'block';

  // 세로형 테이블 렌더링
  tbody.innerHTML = savedApartments.map((apt, index) => `
    <tr>
      <td><strong>${apt.name}</strong></td>
      <td>
        <div class="apartment-info">
          <div class="apartment-info-item">
            <div class="apartment-info-label">KB시세</div>
            <div class="apartment-info-value">${eokManWonFmt(apt.kbPrice)}</div>
          </div>
          <div class="apartment-info-item">
            <div class="apartment-info-label">실제거래가</div>
            <div class="apartment-info-value">${eokManWonFmt(apt.price)}</div>
          </div>
          <div class="apartment-info-item">
            <div class="apartment-info-label">대출가능액</div>
            <div class="apartment-info-value">${eokManWonFmt(apt.maxLoanAllowed)}</div>
          </div>
          <div class="apartment-info-item">
            <div class="apartment-info-label">월상환액</div>
            <div class="apartment-info-value">${eokManWonFmt(apt.monthlyPayment)}</div>
          </div>
          <div class="apartment-info-item">
            <div class="apartment-info-label">부족자본</div>
            <div class="apartment-info-value">${signedEokManWon(-apt.shortCapital, false)}</div>
          </div>
          <div class="apartment-info-item">
            <div class="apartment-info-label">보유기간손익</div>
            <div class="apartment-info-value">${eokManWonFmt(apt.pnl)}</div>
          </div>
        </div>
      </td>
      <td>
        <div class="action-buttons">
          <button class="edit-btn" onclick="showEditModal(${index})">수정</button>
          <button class="delete-btn" onclick="deleteSavedApartment(${index})">삭제</button>
        </div>
      </td>
    </tr>
  `).join('');

  // 모바일용 카드 렌더링
  cardsContainer.innerHTML = savedApartments.map((apt, index) => `
    <div class="apartment-card">
      <div class="apartment-card-header">
        <div class="apartment-name">${apt.name}</div>
        <div class="action-buttons">
          <button class="edit-btn" onclick="showEditModal(${index})">수정</button>
          <button class="delete-btn" onclick="deleteSavedApartment(${index})">삭제</button>
        </div>
      </div>
      <div class="apartment-card-grid">
        <div class="apartment-card-item">
          <div class="apartment-card-label">KB시세</div>
          <div class="apartment-card-value">${eokManWonFmt(apt.kbPrice)}</div>
        </div>
        <div class="apartment-card-item">
          <div class="apartment-card-label">실제거래가</div>
          <div class="apartment-card-value">${eokManWonFmt(apt.price)}</div>
        </div>
        <div class="apartment-card-item">
          <div class="apartment-card-label">대출가능액</div>
          <div class="apartment-card-value">${eokManWonFmt(apt.maxLoanAllowed)}</div>
        </div>
        <div class="apartment-card-item">
          <div class="apartment-card-label">월상환액</div>
          <div class="apartment-card-value">${eokManWonFmt(apt.monthlyPayment)}</div>
        </div>
        <div class="apartment-card-item">
          <div class="apartment-card-label">부족자본</div>
          <div class="apartment-card-value">${signedEokManWon(-apt.shortCapital, false)}</div>
        </div>
        <div class="apartment-card-item">
          <div class="apartment-card-label">보유기간손익</div>
          <div class="apartment-card-value">${eokManWonFmt(apt.pnl)}</div>
        </div>
      </div>
    </div>
  `).join('');
}

// 저장된 아파트 수정
function editSavedApartment() {
  const modal = document.getElementById('editModal');
  const index = parseInt(modal.dataset.editIndex);
  const name = document.getElementById('editName').value.trim();
  
  if (!name) {
    alert('아파트 이름을 입력해주세요.');
    return;
  }

  // 모든 입력값 수집
  const updatedData = {
    name: name,
    timestamp: new Date().toISOString(),
    price: valManToWon('editPrice'),
    kbPrice: valManToWon('editKbPrice'),
    cash: valManToWon('editCash'),
    annualIncome: valManToWon('editAnnualIncome'),
    loanYears: parseInt(document.getElementById('editLoanYears').value || '0', 10) || 0,
    annualRate: parseFloat(document.getElementById('editAnnualRate').value || '0') || 0,
    ltvManualPct: parseFloat(document.getElementById('editLtvManualPct').value || '0') || 0,
    dsrLimitPct: parseFloat(document.getElementById('editDsrLimitPct').value || '0') || 0,
    existingMonthlyDebt: valManToWon('editExistingMonthlyDebt'),
    creditLoanRate: parseFloat(document.getElementById('editCreditLoanRate').value || '0') || 0,
    assessedRatioPct: parseFloat(document.getElementById('editAssessedRatioPct').value || '0') || 0,
    holdingYears: parseInt(document.getElementById('editHoldingYears').value || '0', 10) || 0,
    annualAppreciationPct: parseFloat(document.getElementById('editAnnualAppreciationPct').value || '0') || 0,
    targetSellPrice: valManToWon('editTargetSellPrice')
  };

  // 수정된 데이터로 재계산
  const results = calculateResultsFromData(updatedData);
  Object.assign(updatedData, results);

  const savedApartments = loadSavedApartments();
  savedApartments[index] = updatedData;
  
  try {
    localStorage.setItem(SAVED_APARTMENTS_KEY, JSON.stringify(savedApartments));
    alert('수정되었습니다!');
    renderSavedApartments();
    hideEditModal();
  } catch (e) {
    console.warn('수정 실패:', e);
    alert('수정에 실패했습니다.');
  }
}

// 저장된 아파트 삭제
function deleteSavedApartment(index) {
  if (!confirm('정말 삭제하시겠습니까?')) return;

  const savedApartments = loadSavedApartments();
  savedApartments.splice(index, 1);
  
  try {
    localStorage.setItem(SAVED_APARTMENTS_KEY, JSON.stringify(savedApartments));
    renderSavedApartments();
  } catch (e) {
    console.warn('삭제 실패:', e);
    alert('삭제에 실패했습니다.');
  }
}

// 초기화
function init() {
  // Safari 렌더링 문제 방지를 위한 지연 실행
  setTimeout(() => {
    // 저장된 데이터가 있으면 불러오고, 없으면 기본값 설정
    if (!loadSavedData()) {
      setDefaults();
    }
    
    // 이벤트 바인딩
    bindAutoCompute();
    
    // 저장 버튼 이벤트 바인딩
    const saveBtn = document.getElementById('btnSave');
    if (saveBtn) {
      saveBtn.addEventListener('click', showSaveModal);
    }
    
    // 모달 버튼 이벤트 바인딩
    const saveConfirmBtn = document.getElementById('btnSaveConfirm');
    const saveCancelBtn = document.getElementById('btnSaveCancel');
    
    if (saveConfirmBtn) {
      saveConfirmBtn.addEventListener('click', () => {
        saveApartment();
        hideSaveModal();
      });
    }
    
      // Enter 키로 저장
  const nameInput = document.getElementById('saveName');
  if (nameInput) {
    nameInput.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') {
        saveApartment();
        hideSaveModal();
      }
    });
  }
  
  if (saveCancelBtn) {
    saveCancelBtn.addEventListener('click', hideSaveModal);
  }
  
  // 수정 모달 버튼 이벤트 바인딩
  const editConfirmBtn = document.getElementById('btnEditConfirm');
  const editCancelBtn = document.getElementById('btnEditCancel');
  
  if (editConfirmBtn) {
    editConfirmBtn.addEventListener('click', editSavedApartment);
  }
  
  if (editCancelBtn) {
    editCancelBtn.addEventListener('click', hideEditModal);
  }
  
  // Enter 키로 수정
  const editNameInput = document.getElementById('editName');
  if (editNameInput) {
    editNameInput.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') {
        editSavedApartment();
      }
    });
  }
  
  // 모달 외부 클릭 시 닫기
  const saveModal = document.getElementById('saveModal');
  const editModal = document.getElementById('editModal');
  
  if (saveModal) {
    saveModal.addEventListener('click', (e) => {
      if (e.target === saveModal) {
        hideSaveModal();
      }
    });
  }
  
  if (editModal) {
    editModal.addEventListener('click', (e) => {
      if (e.target === editModal) {
        hideEditModal();
      }
    });
  }
    
    // 저장된 아파트 목록 렌더링
    renderSavedApartments();
    
    // 초기 계산
    compute();
    
    // Safari에서 추가 렌더링 강제
    requestAnimationFrame(() => {
      const monthlyPaymentEl = document.getElementById('monthlyPayment');
      if (monthlyPaymentEl) {
        monthlyPaymentEl.style.display = 'none';
        setTimeout(() => {
          monthlyPaymentEl.style.display = '';
        }, 10);
      }
    });
  }, 50);
}
