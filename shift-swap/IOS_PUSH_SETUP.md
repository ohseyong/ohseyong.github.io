# iOS 웹푸시 구현 가이드

## 문제 상황
iOS Safari에서는 **FCM (Firebase Cloud Messaging)**이 제한적으로 작동하며, 웹푸시는 **APNS (Apple Push Notification Service)**를 통해서만 가능합니다.

## 해결 방법

### 1. Apple Developer 계정 필요
- **연간 $99** Apple Developer Program 가입
- **웹푸시 인증서** 생성 필요

### 2. APNS 직접 구현 (권장)

#### 2.1 Apple Developer Console에서 설정
1. **Certificates, Identifiers & Profiles** 접속
2. **Identifiers** → **App IDs** 선택
3. **Web Push IDs** 생성
4. **웹푸시 인증서** 생성 및 다운로드

#### 2.2 서버 구현 (Node.js 예시)

```javascript
// server/push-service.js
const apn = require('apn');

class PushService {
    constructor() {
        this.provider = new apn.Provider({
            token: {
                key: "path/to/AuthKey_XXXXXXXXXX.p8", // Apple 인증서
                keyId: "XXXXXXXXXX", // Key ID
                teamId: "XXXXXXXXXX" // Team ID
            },
            production: false // 개발용은 false, 프로덕션은 true
        });
    }

    async sendNotification(deviceToken, title, body, data = {}) {
        const notification = new apn.Notification();
        
        notification.alert = {
            title: title,
            body: body
        };
        notification.badge = 1;
        notification.sound = "default";
        notification.topic = "com.yourdomain.shift-swap"; // Bundle ID
        notification.payload = data;
        
        try {
            const result = await this.provider.send(notification, deviceToken);
            console.log('푸시 발송 결과:', result);
            return result;
        } catch (error) {
            console.error('푸시 발송 실패:', error);
            throw error;
        }
    }
}

module.exports = PushService;
```

#### 2.3 API 엔드포인트 구현

```javascript
// server/routes/push.js
const express = require('express');
const PushService = require('../push-service');

const router = express.Router();
const pushService = new PushService();

router.post('/send-notification', async (req, res) => {
    try {
        const { deviceTokens, title, body, data } = req.body;
        
        const results = [];
        for (const token of deviceTokens) {
            const result = await pushService.sendNotification(token, title, body, data);
            results.push(result);
        }
        
        res.json({ success: true, results });
    } catch (error) {
        console.error('알림 발송 실패:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

module.exports = router;
```

### 3. Firebase Cloud Functions + APNS

#### 3.1 Firebase Functions 설정

```javascript
// functions/index.js
const functions = require('firebase-functions');
const apn = require('apn');

const apnProvider = new apn.Provider({
    token: {
        key: functions.config().apns.key,
        keyId: functions.config().apns.keyid,
        teamId: functions.config().apns.teamid
    },
    production: false
});

exports.sendPushNotification = functions.database
    .ref('/shifts/{shiftId}')
    .onCreate(async (snapshot, context) => {
        const shift = snapshot.val();
        
        // 알림 메시지 생성
        const title = `[${shift.role}] ${shift.buyingItem} 구하는 팀원이 있어요`;
        const body = `${shift.name} : ${shift.sellingItem}으로 ${shift.buyingItem}을 구합니다.`;
        
        // 등록된 디바이스 토큰들 가져오기
        const deviceTokens = await getRegisteredDeviceTokens();
        
        // APNS로 알림 발송
        const notification = new apn.Notification();
        notification.alert = { title, body };
        notification.badge = 1;
        notification.sound = "default";
        notification.topic = "com.yourdomain.shift-swap";
        
        return apnProvider.send(notification, deviceTokens);
    });
```

#### 3.2 Firebase Functions 설정 명령어

```bash
# APNS 설정
firebase functions:config:set apns.key="path/to/AuthKey_XXXXXXXXXX.p8"
firebase functions:config:set apns.keyid="XXXXXXXXXX"
firebase functions:config:set apns.teamid="XXXXXXXXXX"

# 배포
firebase deploy --only functions
```

### 4. 서드파티 서비스 사용

#### 4.1 OneSignal
```javascript
// OneSignal 설정
const OneSignal = require('onesignal-node');

const client = new OneSignal.Client(
    'your-app-id',
    'your-rest-api-key'
);

// 알림 발송
client.createNotification({
    included_segments: ['All'],
    contents: {
        en: '새로운 스왑 요청이 있습니다!'
    },
    headings: {
        en: '[TE] 8/11 945 구하는 팀원이 있어요'
    }
});
```

#### 4.2 Pushwoosh
```javascript
// Pushwoosh 설정
const Pushwoosh = require('pushwoosh-client');

const client = new Pushwoosh({
    applicationCode: 'your-app-code',
    auth: 'your-auth-token'
});

// 알림 발송
client.createMessage({
    send_date: 'now',
    content: '새로운 스왑 요청이 있습니다!',
    data: { custom: 'data' }
});
```

### 5. 클라이언트 측 구현

#### 5.1 디바이스 토큰 등록
```javascript
// firebase-service.js에 추가
async registerDeviceToken() {
    try {
        // iOS Safari에서 디바이스 토큰 가져오기
        if (this.detectIOSSafari()) {
            const token = await this.getDeviceToken();
            
            // 서버에 토큰 등록
            await fetch('/api/register-device', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ 
                    token, 
                    platform: 'ios',
                    userAgent: navigator.userAgent 
                })
            });
        }
    } catch (error) {
        console.error('디바이스 토큰 등록 실패:', error);
    }
}
```

### 6. 현재 상황에서의 임시 해결책

#### 6.1 브라우저 알림 최대화
- **PWA 설치 유도**: iOS Safari에서 PWA로 설치하면 알림 가능
- **실시간 업데이트**: Firebase Realtime Database로 실시간 데이터 동기화
- **시각적 알림**: 화면 내 토스트 메시지로 알림

#### 6.2 대안 알림 방법
- **이메일 알림**: 새 거래 등록 시 이메일 발송
- **SMS 알림**: 중요 알림에 한해 SMS 발송
- **앱 내 알림**: 앱 실행 시 알림 목록 표시

## 비용 비교

| 방법 | 초기 비용 | 월 비용 | 구현 난이도 |
|------|-----------|---------|-------------|
| Apple Developer | $99/년 | $0 | 높음 |
| OneSignal | $0 | $29/월 | 낮음 |
| Pushwoosh | $0 | $25/월 | 낮음 |
| Firebase Functions | $0 | 사용량별 | 중간 |

## 권장사항

1. **즉시**: PWA 설치 유도 + 브라우저 알림
2. **단기**: OneSignal 또는 Pushwoosh 사용
3. **장기**: Apple Developer 계정으로 APNS 직접 구현

## 참고 자료
- [Apple Push Notification Service](https://developer.apple.com/documentation/usernotifications)
- [Web Push Protocol](https://tools.ietf.org/html/rfc8030)
- [Firebase Cloud Functions](https://firebase.google.com/docs/functions)
- [OneSignal Documentation](https://documentation.onesignal.com/)
