# FCM 웹 푸시 설정 가이드 (/shift-swap/)

이 문서는 GitHub Pages 서브경로(`/shift-swap/`)에서 FCM 웹 푸시를 동작시키는 방법을 정리한 것입니다.

## 1) Firebase Web App & VAPID 공개키 발급
1. Firebase Console → 프로젝트 생성
2. 프로젝트 설정 → 일반 → 내 앱 → Web 앱 추가 후 `firebaseConfig` 확보
3. 프로젝트 설정 → Cloud Messaging → “웹 푸시 인증서” → VAPID 공개키 생성 및 복사

## 2) 코드에 반영
- `shift-swap/js/firebase-config.js`에 `firebaseConfig` 값 입력
- `shift-swap/index.html`에 Messaging SDK 로드 확인
  ```html
  <script src="https://www.gstatic.com/firebasejs/9.0.0/firebase-messaging-compat.js"></script>
  ```
- `shift-swap/manifest.json`의 `start_url`은 반드시 `/shift-swap/`
- SW 등록(페이지 SW와 Messaging SW) 확인
  ```html
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('sw.js');
      navigator.serviceWorker.register('firebase-messaging-sw.js', { scope: './' });
    });
  }
  ```
- `shift-swap/firebase-messaging-sw.js`에 동일한 `firebaseConfig`로 초기화 코드 입력

## 3) 권한/토큰 처리 (클라이언트)
- 권한 상태가 `granted`가 아닐 때는 UI 토스트로 안내 (본 프로젝트에 구현)
- 권한 요청 후 토큰 발급 예시:
  ```js
  async function initFcmAndGetToken() {
    if (!('Notification' in window) || !firebase.messaging) return null;
    const permission = await Notification.requestPermission();
    if (permission !== 'granted') return null;

    const messaging = firebase.messaging();
    const token = await messaging.getToken({ vapidKey: '여기에_공개_VAPID_키' });
    return token;
  }
  ```
- 발급된 토큰을 Realtime DB 등에 저장해 나중에 타겟 전송에 사용

## 4) 서버에서 발송 (HTTP v1 권장)
- 서비스 계정 키(JSON) 발급 후 OAuth2 토큰 생성 → HTTP v1 API 호출
- 간단 예시(노드):
  ```js
  const { google } = require('googleapis');
  const fetch = require('node-fetch');

  async function getAccessToken(serviceAccount) {
    const jwtClient = new google.auth.JWT(
      serviceAccount.client_email,
      null,
      serviceAccount.private_key,
      ['https://www.googleapis.com/auth/firebase.messaging']
    );
    const tokens = await jwtClient.authorize();
    return tokens.access_token;
  }

  async function sendFcmHttpV1({ projectId, accessToken, token, title, body }) {
    const url = `https://fcm.googleapis.com/v1/projects/${projectId}/messages:send`;
    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        message: {
          token,
          notification: { title, body },
          webpush: { headers: { TTL: '300' } }
        }
      })
    });
    return await res.json();
  }
  ```

## 5) iOS/Safari 주의
- iOS 16.4+, 홈 화면에 추가된 PWA에서만 웹 푸시 지원
- 사파리 탭 상태에서는 동작하지 않음 (PWA 필요)

## 6) 체크리스트
- [ ] firebaseConfig 입력
- [ ] messaging SDK / `firebase-messaging-sw.js` 등록
- [ ] VAPID 공개키로 토큰 발급 확인
- [ ] 서버에서 HTTP v1으로 실제 발송 테스트
