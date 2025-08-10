# 🔥 Firebase 설정 가이드

실시간 동기화 기능을 사용하기 위한 Firebase 설정 방법입니다.

## 📋 단계별 설정

### 1. Firebase 프로젝트 생성

1. [Firebase Console](https://console.firebase.google.com/)에 접속
2. **"프로젝트 만들기"** 클릭
3. 프로젝트 이름 입력 (예: `shift-swap-app`)
4. Google Analytics 설정 (선택사항)
5. **"프로젝트 만들기"** 클릭

### 2. Realtime Database 설정

1. 왼쪽 메뉴에서 **"Realtime Database"** 클릭
2. **"데이터베이스 만들기"** 클릭
3. 보안 규칙 선택: **"테스트 모드에서 시작"** 선택
4. 데이터베이스 위치 선택 (가까운 지역 선택)
5. **"완료"** 클릭

### 3. 웹 앱 등록

1. 프로젝트 개요 페이지에서 **"웹"** 아이콘 클릭
2. 앱 닉네임 입력 (예: `shift-swap-web`)
3. **"앱 등록"** 클릭
4. Firebase SDK 설정 코드 복사

### 4. 설정 파일 업데이트

`js/firebase-config.js` 파일을 열고 다음 내용으로 교체:

```javascript
const firebaseConfig = {
    apiKey: "YOUR_ACTUAL_API_KEY",
    authDomain: "YOUR_PROJECT_ID.firebaseapp.com",
    databaseURL: "https://YOUR_PROJECT_ID-default-rtdb.firebaseio.com",
    projectId: "YOUR_PROJECT_ID",
    storageBucket: "YOUR_PROJECT_ID.appspot.com",
    messagingSenderId: "YOUR_SENDER_ID",
    appId: "YOUR_APP_ID"
};
```

**실제 값으로 교체해야 할 부분:**
- `YOUR_ACTUAL_API_KEY`: Firebase에서 제공한 API 키
- `YOUR_PROJECT_ID`: 프로젝트 ID
- `YOUR_SENDER_ID`: 메시징 발신자 ID
- `YOUR_APP_ID`: 앱 ID

### 5. 보안 규칙 설정 (선택사항)

Realtime Database > 규칙 탭에서 다음 규칙 설정:

```json
{
  "rules": {
    "shifts": {
      ".read": true,
      ".write": true
    }
  }
}
```

**주의:** 이 규칙은 모든 사용자가 읽기/쓰기를 할 수 있게 합니다. 실제 운영 환경에서는 더 엄격한 규칙을 설정해야 합니다.

## 🚀 사용 방법

### 로컬 테스트
1. `firebase-version.html` 파일을 브라우저에서 열기
2. Firebase 설정이 올바르면 실시간 동기화 작동

### GitHub Pages 배포
1. 모든 파일을 GitHub 저장소에 업로드
2. GitHub Pages 설정에서 배포
3. 팀원들이 URL로 접속하여 사용

## ✅ 확인 사항

### 연결 상태 확인
- 페이지 상단에 "실시간 연결됨" 메시지 표시
- 오프라인 시 "오프라인 모드" 표시

### 실시간 동기화 테스트
1. 두 개의 브라우저 창에서 동시 접속
2. 한 창에서 시프트 등록
3. 다른 창에서 즉시 반영되는지 확인

## 🔧 문제 해결

### 연결 안됨
- Firebase 설정값이 올바른지 확인
- 인터넷 연결 상태 확인
- 브라우저 콘솔에서 오류 메시지 확인

### 데이터가 보이지 않음
- Realtime Database에 데이터가 있는지 확인
- 보안 규칙이 올바른지 확인

### 권한 오류
- Realtime Database 규칙을 테스트 모드로 설정
- 또는 적절한 읽기/쓰기 권한 설정

## 💰 비용

Firebase Realtime Database는 다음과 같은 무료 할당량을 제공합니다:

- **저장소**: 1GB
- **동시 연결**: 100개
- **다운로드**: 10GB/월
- **업로드**: 10GB/월

소규모 팀 사용에는 충분한 무료 할당량입니다.

## 🔒 보안 고려사항

### 현재 설정 (테스트용)
- 모든 사용자가 읽기/쓰기 가능
- 인증 없이 접근 가능

### 운영 환경 권장사항
- 사용자 인증 추가
- 특정 사용자만 쓰기 가능하도록 제한
- 데이터 검증 규칙 추가

## 📞 지원

문제가 발생하면:
1. 브라우저 개발자 도구 콘솔 확인
2. Firebase Console에서 데이터베이스 상태 확인
3. Firebase 문서 참조: [Realtime Database](https://firebase.google.com/docs/database)

---

**설정 완료 후 `firebase-version.html`을 사용하면 모든 팀원이 실시간으로 동일한 시프트 목록을 볼 수 있습니다!** 🎉
