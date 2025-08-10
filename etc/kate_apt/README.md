# 박지은 아파트 구매 계산기 2.0

아파트 구매 시 주담대 LTV/DSR 한도, 상환액, 유지비, 세금, 보유기간 손익을 계산하는 웹 도구입니다.

## 📁 프로젝트 구조

```
kate_apt/
├── index.html          # 원본 단일 파일 (548줄)
├── index-new.html      # 리팩토링된 메인 HTML
├── css/
│   └── styles.css      # 스타일시트 (분리됨)
├── js/
│   ├── formatters.js   # 포맷팅 유틸리티
│   ├── loan-calculator.js # 대출 계산 함수들
│   └── calculator.js   # 메인 계산기 로직
├── data/
│   └── tax-rates.js    # 세율 및 정책 데이터
└── README.md           # 이 파일
```

## 🔄 리팩토링 내용

### Before (원본)
- **548줄의 단일 HTML 파일**
- HTML + CSS + JavaScript가 모두 하나의 파일에
- 유지보수 어려움
- 코드 가독성 낮음

### After (리팩토링)
- **모듈화된 구조**
- 관심사 분리 (HTML/CSS/JS)
- 각 파일이 단일 책임을 가짐
- 유지보수성 향상

## 📋 파일별 역할

### `index-new.html`
- HTML 구조만 담당
- 외부 CSS/JS 파일 참조
- 깔끔한 마크업

### `css/styles.css`
- 모든 스타일링 로직
- CSS 변수 정의
- 반응형 디자인

### `js/formatters.js`
- 숫자 포맷팅 함수들
- DOM 조작 유틸리티
- `cfmt`, `wfmt`, `mfmt`, `eokManWonFmt` 등

### `js/loan-calculator.js`
- 대출 계산 관련 함수들
- `annuityMonthlyPayment`, `remainingBalance` 등
- 금융 수학 로직

### `data/tax-rates.js`
- 세율 및 정책 데이터
- `acquisitionTax`, `annualPropertyTaxSimple` 등
- 정책 변경 시 이 파일만 수정

### `js/calculator.js`
- 메인 계산 로직
- 이벤트 핸들러
- 초기화 및 기본값 설정

## 🚀 사용법

1. **원본 버전**: `index.html` 파일을 브라우저에서 열기
2. **리팩토링 버전**: `index-new.html` 파일을 브라우저에서 열기

## 🛠️ 개발 가이드

### 새로운 기능 추가
1. **UI 변경**: `index-new.html` 수정
2. **스타일 변경**: `css/styles.css` 수정
3. **계산 로직 변경**: `js/calculator.js` 수정
4. **세율 변경**: `data/tax-rates.js` 수정

### 디버깅
- 브라우저 개발자 도구에서 각 모듈별로 확인 가능
- 특정 기능만 독립적으로 테스트 가능

## 📊 주요 기능

- **LTV/DSR 한도 계산**
- **원리금균등 상환 계산**
- **취득세/재산세 계산**
- **보유기간 손익 분석**
- **실시간 계산 업데이트**

## 🎨 디자인 특징

- 2025 Light + Liquid Glass 디자인
- 반응형 레이아웃
- 모던한 UI/UX
- 접근성 고려

---

**개발자**: 오세용  
**버전**: 2.0 (리팩토링 완료)
