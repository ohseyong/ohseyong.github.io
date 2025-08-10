/* global importScripts, firebase */
importScripts('https://www.gstatic.com/firebasejs/9.0.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/9.0.0/firebase-messaging-compat.js');

firebase.initializeApp({
  apiKey: "",
  authDomain: "",
  projectId: "",
  messagingSenderId: "",
  appId: ""
});

const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
  self.registration.showNotification(payload.notification.title || '새 알림', {
    body: payload.notification.body || '',
    icon: '/assets/jekyll.png'
  });
});


