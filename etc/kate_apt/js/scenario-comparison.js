// ---------- 시나리오 비교 기능 ----------

// 시나리오 데이터 저장소
let scenarios = {
  current: {},
  optimistic: {},
  conservative: {},
  custom: {}
};

// 현재 활성 시나리오
let activeScenario = 'current';

// 시나리오 기본값 설정
const scenarioDefaults = {
  current: {
    price: '41,000',
    cash: '8000',
    annualIncome: '4,750',
    loanYears: '30',
    annualRate: '3.95',
    ltvManualPct: '80',
    dsrLimitPct: '40',
    existingMonthlyDebt: '0',
    assessedRatioPct: '70',
    holdingYears: '10',
    annualAppreciationPct: '4',
    targetSellPrice: ''
  },
  optimistic: {
    price: '38,000',
    cash: '12,000',
    annualIncome: '5,200',
    loanYears: '30',
    annualRate: '3.5',
    ltvManualPct: '80',
    dsrLimitPct: '40',
    existingMonthlyDebt: '0',
    assessedRatioPct: '70',
    holdingYears: '10',
    annualAppreciationPct: '4.5',
    targetSellPrice: ''
  },
  conservative: {
    price: '45,000',
    cash: '6,000',
    annualIncome: '4,200',
    loanYears: '30',
    annualRate: '4.2',
    ltvManualPct: '80',
    dsrLimitPct: '40',
    existingMonthlyDebt: '0',
    assessedRatioPct: '70',
    holdingYears: '10',
    annualAppreciationPct: '1.5',
    targetSellPrice: ''
  },
  custom: {
    price: '42,000',
    cash: '10,000',
    annualIncome: '4,500',
    loanYears: '30',
    annualRate: '3.9',
    ltvManualPct: '80',
    dsrLimitPct: '40',
    existingMonthlyDebt: '0',
    assessedRatioPct: '70',
    holdingYears: '10',
    annualAppreciationPct: '2.5',
    targetSellPrice: ''
  }
};

// 시나리오 탭 전환
function switchScenario(scenarioName) {
  // 탭 활성화
  document.querySelectorAll('.scenario-tab').forEach(tab => {
    tab.classList.remove('active');
  });
  document.querySelector(`[data-scenario="${scenarioName}"]`).classList.add('active');

  // 입력 폼 전환
  document.querySelectorAll('.scenario-inputs').forEach(input => {
    input.classList.remove('active');
  });
  document.getElementById(`${scenarioName}-inputs`).classList.add('active');

  activeScenario = scenarioName;
}

// 시나리오 기본값 설정
function setScenarioDefaults() {
  Object.keys(scenarioDefaults).forEach(scenario => {
    Object.keys(scenarioDefaults[scenario]).forEach(field => {
      const element = document.getElementById(`${scenario}-${field}`);
      if (element) {
        element.value = scenarioDefaults[scenario][field];
      }
    });
  });
}

// 시나리오 데이터 수집
function collectScenarioData(scenarioName) {
  const fields = [
    'price', 'cash', 'annualIncome', 'loanYears', 'annualRate',
    'ltvManualPct', 'dsrLimitPct', 'existingMonthlyDebt', 'assessedRatioPct',
    'holdingYears', 'annualAppreciationPct', 'targetSellPrice'
  ];

  const data = {};
  fields.forEach(field => {
    const element = document.getElementById(`${scenarioName}-${field}`);
    if (element) {
      data[field] = element.value;
    }
  });

  return data;
}

// 시나리오 계산 실행
function calculateScenario(scenarioName) {
  const data = collectScenarioData(scenarioName);
  
  // 기존 계산 함수를 활용하여 계산
  const price = valManToWon(`${scenarioName}-price`);
  const cash = valManToWon(`${scenarioName}-cash`);
  const annualIncome = valManToWon(`${scenarioName}-annualIncome`);
  const years = parseInt(data.loanYears || '0', 10) || 0;
  const rate = parseFloat(data.annualRate || '0') || 0;
  const region = 'speculation';
  const homeCount = 0;
  const dsrLimitPct = parseFloat(data.dsrLimitPct || '0') || 0;
  const existingMonthlyDebt = valManToWon(`${scenarioName}-existingMonthlyDebt`);
  const assessedRatioPct = parseFloat(data.assessedRatioPct || '0') || 0;
  const holdingYears = parseInt(data.holdingYears || '0', 10) || 0;
  const annualAppreciationPct = parseFloat(data.annualAppreciationPct || '0') || 0;
  const targetSellPrice = valManToWon(`${scenarioName}-targetSellPrice`);

  // LTV 수동 입력 처리
  const ltvManual = parseFloat(data.ltvManualPct || '0') || ltvDefaultPct(region, homeCount);
  const ltvPct = ltvManual;

  // 계산 실행
  const neededLoan = Math.max(0, toNum(price) - toNum(cash));
  const ltvMax = calculateLtvMaxLoan(toNum(price), toNum(ltvPct));
  const dsrCapMonthly = Math.max(0, (toNum(annualIncome) * (toNum(dsrLimitPct)/100) / 12) - toNum(existingMonthlyDebt));
  const dsrMax = calculateDsrMaxLoan(toNum(annualIncome), toNum(dsrLimitPct), toNum(existingMonthlyDebt), toNum(rate), toNum(years));
  const maxLoanAllowed = calculateMaxLoanAllowed(toNum(neededLoan), toNum(ltvMax), toNum(dsrMax));
  const monthlyPayment = annuityMonthlyPayment(toNum(maxLoanAllowed), toNum(rate), toNum(years));
  const acqTax = acquisitionTax(toNum(price), homeCount, region);
  const annualPropTax = annualPropertyTaxSimple(toNum(price), toNum(assessedRatioPct));

  // 보유기간 이자합계
  const monthsHeld = toNum(holdingYears) * 12;
  const monthsConsidered = Math.min(monthsHeld, toNum(years)*12);
  const totalPaidDuringHold = toNum(monthlyPayment) * monthsConsidered;
  const remainingAfterHold = remainingBalance(toNum(maxLoanAllowed), toNum(rate), toNum(years), monthsConsidered);
  const principalRepaid = Math.max(0, toNum(maxLoanAllowed) - toNum(remainingAfterHold));
  const interestPaid = Math.max(0, toNum(totalPaidDuringHold) - toNum(principalRepaid));

  // 미래 매도가
  let projectedSellPrice = toNum(targetSellPrice) > 0 ? toNum(targetSellPrice) : toNum(price) * Math.pow(1 + (toNum(annualAppreciationPct)/100), toNum(holdingYears));
  const simpleGain = Math.max(0, toNum(projectedSellPrice) - toNum(price));

  // 매수 부대비용
  const brokerFee = calculateBrokerFee(toNum(price));
  const stampTax = calculateStampTax(toNum(price));
  const buyCost = toNum(brokerFee) + toNum(stampTax);

  // 손익 계산
  const pnl = toNum(simpleGain) - (toNum(acqTax) + toNum(buyCost) + toNum(interestPaid));

  return {
    scenarioName,
    monthlyPayment,
    maxLoanAllowed,
    pnl,
    simpleGain,
    acqTax,
    buyCost,
    interestPaid,
    annualPropTax,
    neededLoan,
    ltvMax,
    dsrMax,
    dsrCapMonthly
  };
}

// 모든 시나리오 계산
function calculateAllScenarios() {
  const results = {};
  
  Object.keys(scenarioDefaults).forEach(scenario => {
    results[scenario] = calculateScenario(scenario);
  });

  return results;
}

// 시나리오 요약 카드 생성
function createScenarioSummary(results) {
  const summaryContainer = document.getElementById('scenarioSummary');
  summaryContainer.innerHTML = '';

  Object.keys(results).forEach(scenario => {
    const result = results[scenario];
    const scenarioNames = {
      current: '현재 상황',
      optimistic: '낙관적',
      conservative: '보수적',
      custom: '사용자 정의'
    };

    const card = document.createElement('div');
    card.className = 'summary-card';
    card.innerHTML = `
      <h4>${scenarioNames[scenario]}</h4>
      <div class="summary-value">${eokManWonFmt(result.pnl)}</div>
      <div class="small">월납부: ${eokManWonFmt(result.monthlyPayment)}</div>
      <div class="small">대출: ${eokManWonFmt(result.maxLoanAllowed)}</div>
    `;
    summaryContainer.appendChild(card);
  });
}

// 비교 테이블 생성
function createComparisonTable(results) {
  const tableBody = document.getElementById('comparisonTableBody');
  const comparisonTable = document.getElementById('comparisonTable');
  
  tableBody.innerHTML = '';
  
  // 비교할 지표들
  const metrics = [
    { key: 'pnl', label: '보유기간 손익', formatter: eokManWonFmt, better: 'higher' },
    { key: 'monthlyPayment', label: '월납부액', formatter: eokManWonFmt, better: 'lower' },
    { key: 'maxLoanAllowed', label: '최대 대출 가능액', formatter: eokManWonFmt, better: 'higher' },
    { key: 'simpleGain', label: '시세 차익', formatter: eokManWonFmt, better: 'higher' },
    { key: 'acqTax', label: '취득세', formatter: eokManWonFmt, better: 'lower' },
    { key: 'buyCost', label: '매수 부대비용', formatter: eokManWonFmt, better: 'lower' }
  ];

  metrics.forEach(metric => {
    const row = document.createElement('tr');
    row.innerHTML = `<td>${metric.label}</td>`;
    
    const values = Object.keys(results).map(scenario => results[scenario][metric.key]);
    const bestValue = metric.better === 'higher' ? Math.max(...values) : Math.min(...values);
    const worstValue = metric.better === 'higher' ? Math.min(...values) : Math.max(...values);
    
    Object.keys(results).forEach(scenario => {
      const value = results[scenario][metric.key];
      let className = '';
      if (value === bestValue) className = 'best-value';
      else if (value === worstValue) className = 'worst-value';
      
      row.innerHTML += `<td class="${className}">${metric.formatter(value)}</td>`;
    });
    
    tableBody.appendChild(row);
  });

  comparisonTable.style.display = 'block';
}

// 이벤트 핸들러 바인딩
function bindScenarioEvents() {
  // 시나리오 탭 클릭
  document.querySelectorAll('.scenario-tab').forEach(tab => {
    tab.addEventListener('click', () => {
      const scenario = tab.getAttribute('data-scenario');
      switchScenario(scenario);
    });
  });

  // 전체 비교 버튼
  document.getElementById('compareAll').addEventListener('click', () => {
    const results = calculateAllScenarios();
    createScenarioSummary(results);
    createComparisonTable(results);
  });

  // 초기화 버튼
  document.getElementById('resetScenarios').addEventListener('click', () => {
    setScenarioDefaults();
    document.getElementById('scenarioSummary').innerHTML = '';
    document.getElementById('comparisonTable').style.display = 'none';
  });

  // 계산 버튼
  document.getElementById('btnCalc').addEventListener('click', () => {
    const results = calculateAllScenarios();
    createScenarioSummary(results);
    createComparisonTable(results);
  });

  // 입력값 변경 시 자동 계산
  const allInputs = document.querySelectorAll('input');
  allInputs.forEach(input => {
    input.addEventListener('input', () => {
      setTimeout(() => {
        const results = calculateAllScenarios();
        createScenarioSummary(results);
        createComparisonTable(results);
      }, 500);
    });
  });
}

// 시나리오 비교 초기화
function initScenarioComparison() {
  setScenarioDefaults();
  bindScenarioEvents();
  
  // 초기 계산 실행
  const results = calculateAllScenarios();
  createScenarioSummary(results);
  createComparisonTable(results);
}
