// Firebase 설정
// 실제 사용 시에는 Firebase Console에서 프로젝트를 생성하고 설정값을 가져와야 합니다

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

// Realtime Database 참조
const database = firebase.database();

console.log('Firebase 설정이 로드되었습니다. 실제 사용을 위해서는 firebaseConfig 값을 업데이트해야 합니다.');
