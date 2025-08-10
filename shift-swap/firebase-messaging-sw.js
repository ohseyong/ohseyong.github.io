// Firebase Messaging Service Worker
importScripts('https://www.gstatic.com/firebasejs/9.0.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/9.0.0/firebase-messaging-compat.js');

// Firebase 설정 (firebase-config.js와 동일)
const firebaseConfig = {
    apiKey: "AIzaSyBw91XSrwztQP3DRQ7a41t2S3A51yJiNx0",
    authDomain: "shift-swap-app-822c2.firebaseapp.com",
    databaseURL: "https://shift-swap-app-822c2-default-rtdb.firebaseio.com",
    projectId: "shift-swap-app-822c2",
    storageBucket: "shift-swap-app-822c2.firebasestorage.app",
    messagingSenderId: "1057746623637",
    appId: "1:1057746623637:web:e9d606d30219d6c9590f9c"
};

// Firebase 초기화
firebase.initializeApp(firebaseConfig);

// Firebase Messaging 인스턴스
const messaging = firebase.messaging();

// 백그라운드 메시지 처리
messaging.onBackgroundMessage((payload) => {
    console.log('백그라운드 메시지 수신:', payload);
    
    const notificationTitle = payload.notification.title;
    const notificationOptions = {
        body: payload.notification.body,
        icon: 'apple-touch-icon.png',
        badge: 'apple-touch-icon.png',
        tag: 'shift-swap-notification',
        data: payload.data,
        requireInteraction: false,
        silent: false
    };

    // iOS/Safari 호환성을 위한 추가 옵션
    if (payload.data && payload.data.platform === 'ios') {
        // iOS에서는 일부 옵션 제한
        delete notificationOptions.vibrate;
    }

    return self.registration.showNotification(notificationTitle, notificationOptions);
});

// 알림 클릭 처리
self.addEventListener('notificationclick', (event) => {
    console.log('알림 클릭됨:', event);
    
    event.notification.close();
    
    // 앱 열기
    event.waitUntil(
        clients.openWindow('/shift-swap/')
    );
});


