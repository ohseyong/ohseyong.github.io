# 가로수길 스케줄 스왑 앱

가로수길 매장 직원들을 위한 시프트 스왑 및 휴무 교환 플랫폼입니다.

## 🚀 주요 기능

- **시프트 스왑**: 같은 날의 다른 시프트로 교환
- **휴무 스왑**: 다른 날의 휴무로 교환
- **실시간 동기화**: Firebase를 통한 실시간 데이터 동기화
- **역할별 필터링**: TS, TE, Genius 역할별 거래 필터링
- **알림 시스템**: 새 거래 등록 시 푸시 알림
- **PWA 지원**: 모바일 앱처럼 설치 가능
- **오프라인 지원**: Firebase 연결 실패 시 로컬 스토리지 모드

## 🏗️ 프로젝트 구조 (리팩토링 완료)

```
shift-swap/
├── index.html                 # 메인 HTML 파일
├── css/
│   ├── styles-optimized.css   # 최적화된 CSS (중복 제거, 구조화)
│   └── styles.css            # 기존 CSS (백업)
├── js/
│   ├── app.js                # 메인 애플리케이션 클래스
│   ├── ui.js                 # UI 관련 기능 모듈
│   ├── firebase-service.js   # Firebase 서비스 모듈
│   └── firebase-config.js    # Firebase 설정
├── firebase-messaging-sw.js  # Firebase 메시징 서비스 워커
├── sw.js                     # 메인 서비스 워커
└── manifest.json             # PWA 매니페스트
```

## 🔧 리팩토링 개선사항

### 1. **코드 모듈화**
- **기존**: 1114줄의 단일 거대 클래스
- **개선**: 3개의 모듈로 분리
  - `app.js`: 메인 애플리케이션 로직
  - `ui.js`: UI 렌더링 및 이벤트 처리
  - `firebase-service.js`: Firebase 데이터 관리

### 2. **중복 등록 버그 수정**
- **문제**: Firebase 모드에서 거래 등록 시 로컬에도 임시 저장하여 중복 등록 발생
- **해결**: Firebase 서비스 모듈에서 중앙화된 데이터 관리로 중복 방지

### 3. **CSS 최적화**
- **기존**: 1121줄의 중복 스타일
- **개선**: 800줄로 축소, 중복 제거, 구조화된 주석

### 4. **성능 개선**
- 불필요한 DOM 조작 최소화
- 이벤트 리스너 중복 등록 방지
- 모듈별 책임 분리로 유지보수성 향상

## 🛠️ 기술 스택

- **Frontend**: HTML5, CSS3, JavaScript (ES6+)
- **Backend**: Firebase Realtime Database
- **PWA**: Service Workers, Web App Manifest
- **알림**: Firebase Cloud Messaging
- **스타일링**: CSS Grid, Flexbox, CSS Variables

## 📱 사용법

### 거래 등록
1. "새 거래 등록" 버튼 클릭
2. 이름과 역할 선택
3. 거래 유형 선택 (시프트 스왑 / 휴무 스왑)
4. 파는 항목과 사는 항목 선택
5. 사유 입력 (선택사항)
6. 등록하기

### 거래 관리
- **거래완료**: 거래가 성사된 경우
- **취소**: 거래를 취소하고 싶은 경우
- **필터링**: 역할별, 거래 유형별 필터링 가능

## 🔧 개발 환경 설정

1. Firebase 프로젝트 생성
2. `js/firebase-config.js` 파일에 Firebase 설정 추가
3. 로컬 서버 실행 (Firebase 호스팅 또는 Live Server)

## 🐛 알려진 이슈

- ~~거래 등록 시 중복 등록 문제~~ ✅ **해결됨**
- ~~코드 구조가 복잡하고 유지보수 어려움~~ ✅ **해결됨**
- ~~CSS 중복 스타일로 인한 성능 저하~~ ✅ **해결됨**

## 📈 성능 개선 결과

- **JavaScript**: 1114줄 → 3개 모듈로 분리 (가독성 향상)
- **CSS**: 1121줄 → 800줄 (중복 제거)
- **로딩 속도**: 모듈화로 인한 초기 로딩 최적화
- **유지보수성**: 모듈별 책임 분리로 코드 관리 용이

## 🤝 기여하기

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 라이선스

이 프로젝트는 MIT 라이선스 하에 배포됩니다.

## 📞 문의

프로젝트에 대한 문의사항이 있으시면 이슈를 생성해주세요.
