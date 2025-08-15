// Firebase 서비스 클래스
class FirebaseService {
    constructor(app) {
        this.app = app;
        this.isLocalMode = false;
        this.messaging = null;
        this.hasShownConnectionToast = false;
        this.init();
    }

    init() {
        this.setupFirebaseListeners();
        this.setupNotifications();
        this.setupFirebaseMessaging();
    }

    // Firebase Messaging 설정
    async setupFirebaseMessaging() {
        try {
            // iOS/Safari 호환성을 위한 추가 설정
            if (!('Notification' in window)) {
                console.log('이 브라우저는 알림을 지원하지 않습니다.');
                return;
            }

            // iOS Safari 감지
            const isIOSSafari = this.detectIOSSafari();
            console.log('iOS Safari 감지:', isIOSSafari);

            // 현재 알림 권한 상태 확인
            let permission = Notification.permission;
            console.log('현재 알림 권한 상태:', permission);
            
            // iOS Safari에서 PWA 설치 안내
            if (isIOSSafari && permission === 'granted') {
                this.checkPWAInstallation();
            }
            
            // 권한이 없는 경우에만 요청
            if (permission === 'default') {
                console.log('알림 권한을 요청합니다...');
                permission = await Notification.requestPermission();
                console.log('알림 권한 요청 결과:', permission);
            }
            
            if (permission === 'granted') {
                console.log('알림 권한이 허용되었습니다.');
                
                // iOS Safari에서는 PWA 설치 안내
                if (isIOSSafari) {
                    this.showPWAInstallGuide();
                }
                
                // Firebase Messaging 설정 (사용 가능한 경우에만)
                if (firebase.messaging) {
                    try {
                        this.messaging = firebase.messaging();
                        
                        // FCM 토큰 가져오기
                        const token = await this.messaging.getToken();
                        if (token) {
                            console.log('FCM 토큰:', token);
                            this.saveFCMToken(token);
                        }
                        
                        // 토큰 갱신 리스너
                        this.messaging.onTokenRefresh(() => {
                            this.messaging.getToken().then((refreshedToken) => {
                                console.log('FCM 토큰 갱신:', refreshedToken);
                                this.saveFCMToken(refreshedToken);
                            }).catch((error) => {
                                console.error('토큰 갱신 실패:', error);
                            });
                        });
                        
                        // 포그라운드 메시지 리스너
                        this.messaging.onMessage((payload) => {
                            console.log('포그라운드 메시지 수신:', payload);
                            this.showNotification(payload.notification.title, payload.notification.body);
                        });
                    } catch (tokenError) {
                        console.error('FCM 토큰 가져오기 실패:', tokenError);
                        // FCM 실패해도 브라우저 알림은 계속 사용 가능
                    }
                } else {
                    console.log('Firebase Messaging을 사용할 수 없습니다. 브라우저 알림만 사용합니다.');
                }
                
                // 알림 권한 상태를 로컬 스토리지에 저장
                localStorage.setItem('notificationPermission', 'granted');
                
            } else if (permission === 'denied') {
                console.log('알림 권한이 거부되었습니다. 사용자가 수동으로 권한을 허용해야 합니다.');
                localStorage.setItem('notificationPermission', 'denied');
                // 토스트는 app.js에서 통합 관리
            } else if (permission === 'default') {
                console.log('알림 권한이 아직 요청되지 않았습니다.');
                localStorage.setItem('notificationPermission', 'default');
                // 토스트는 app.js에서 통합 관리
            }
        } catch (error) {
            console.error('Firebase Messaging 설정 실패:', error);
            // Firebase Messaging 실패해도 브라우저 알림은 계속 사용 가능
        }
    }

    // iOS Safari 감지
    detectIOSSafari() {
        const userAgent = navigator.userAgent;
        const isIOS = /iPad|iPhone|iPod/.test(userAgent);
        const isSafari = /Safari/.test(userAgent) && !/Chrome/.test(userAgent);
        const isStandalone = window.navigator.standalone === true;
        
        console.log('User Agent:', userAgent);
        console.log('iOS:', isIOS);
        console.log('Safari:', isSafari);
        console.log('Standalone:', isStandalone);
        
        return isIOS && isSafari && !isStandalone;
    }

    // PWA 설치 상태 확인
    checkPWAInstallation() {
        const isStandalone = window.navigator.standalone === true;
        const hasShownPWAInstall = localStorage.getItem('pwaInstallShown');
        
        if (!isStandalone && !hasShownPWAInstall) {
            // PWA가 설치되지 않았고 아직 안내를 보여주지 않았다면
            setTimeout(() => {
                this.showPWAInstallGuide();
            }, 3000); // 3초 후 안내 표시
        }
    }

    // PWA 설치 안내 표시
    showPWAInstallGuide() {
        const modal = document.getElementById('pwaInstallModal');
        if (modal) {
            modal.classList.add('show');
            document.body.style.overflow = 'hidden';
            
            // 이벤트 리스너 설정
            this.setupPWAInstallModal();
            
            // 안내를 보여줬다고 표시
            localStorage.setItem('pwaInstallShown', 'true');
        }
    }

    // PWA 설치 모달 이벤트 설정
    setupPWAInstallModal() {
        const closeBtn = document.getElementById('closePwaInstall');
        const closeFooterBtn = document.getElementById('closePwaInstallFooter');
        const testBtn = document.getElementById('testNotification');
        const modal = document.getElementById('pwaInstallModal');

        if (closeBtn) {
            closeBtn.addEventListener('click', () => this.hidePWAInstallModal());
        }
        if (closeFooterBtn) {
            closeFooterBtn.addEventListener('click', () => this.hidePWAInstallModal());
        }
        if (testBtn) {
            testBtn.addEventListener('click', () => {
                this.sendTestNotification();
                this.hidePWAInstallModal();
            });
        }
        if (modal) {
            modal.addEventListener('click', (e) => {
                if (e.target === modal) {
                    this.hidePWAInstallModal();
                }
            });
        }
    }

    // PWA 설치 모달 숨기기
    hidePWAInstallModal() {
        const modal = document.getElementById('pwaInstallModal');
        if (modal) {
            modal.classList.remove('show');
            document.body.style.overflow = '';
        }
    }

    // 알림 설정 토스트 메시지 (비활성화 - app.js에서 통합 관리)
    showNotificationSetupToast() {
        // 토스트는 app.js에서 통합 관리됨
        console.log('토스트는 app.js에서 통합 관리됩니다');
    }

    // FCM 토큰 저장
    saveFCMToken(token) {
        try {
            localStorage.setItem('fcmToken', token);
            console.log('FCM 토큰이 로컬 스토리지에 저장되었습니다.');
            
            // Firebase에 토큰 저장 (선택사항)
            if (database && !this.isLocalMode) {
                database.ref('fcmTokens').child(token).set({
                    timestamp: new Date().toISOString(),
                    userAgent: navigator.userAgent
                }).then(() => {
                    console.log('FCM 토큰이 Firebase에 저장되었습니다.');
                }).catch((error) => {
                    console.error('FCM 토큰 Firebase 저장 실패:', error);
                });
            }
        } catch (error) {
            console.error('FCM 토큰 저장 실패:', error);
        }
    }

    // Firebase 리스너 설정
    setupFirebaseListeners() {
        try {
            // Firebase 데이터 변경 감지
            database.ref('shifts').on('value', (snapshot) => {
                this.app.shifts = [];
                snapshot.forEach((childSnapshot) => {
                    const shift = childSnapshot.val();
                    shift.id = childSnapshot.key;
                    this.app.shifts.push(shift);
                });
                
                // 시간순으로 정렬 (최신순)
                this.app.shifts.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
                // 만료된 시프트 자동 취소 처리
                this.autoCancelExpiredShifts();
                
                // 데이터 로드 후 UI 업데이트
                this.app.ui.renderShifts();
                this.app.ui.updateTabCounts();
                
                // 캘린더 매칭 업데이트 (캘린더 데이터가 로드된 후에만 실행)
                if (this.app.calendarService && this.app.calendarService.calendarEvents.length > 0) {
                    setTimeout(() => {
                        this.app.calendarService.compareShiftsWithCalendar();
                    }, 100);
                }
            });

            // 연결 상태 감지
            database.ref('.info/connected').on('value', (snapshot) => {
                // 초기 연결 시에는 토스트를 표시하지 않음
                const isInitialConnection = !this.hasShownConnectionToast;
                this.app.ui.updateConnectionStatus(snapshot.val(), !isInitialConnection);
                this.hasShownConnectionToast = true;
            });
        } catch (error) {
            console.log('Firebase 연결 실패, 로컬 스토리지 모드로 전환:', error);
            this.setupLocalStorage();
            this.app.ui.updateConnectionStatus(false);
        }
    }

    // 로컬 스토리지 설정 (Firebase 연결 실패 시)
    setupLocalStorage() {
        this.isLocalMode = true;
        this.app.isLocalMode = true;
        this.loadFromLocalStorage();
        // 로컬 모드 메시지는 다른 토스트들과 겹치지 않도록 제거
        // this.app.showNotification('로컬 모드로 실행 중입니다. (Firebase 연결 실패)', 'info');
    }

    // 로컬 스토리지에서 데이터 로드
    loadFromLocalStorage() {
        try {
            const data = localStorage.getItem('shiftSwapData');
            this.app.shifts = data ? JSON.parse(data) : [];
        } catch (error) {
            console.error('로컬 스토리지 로드 실패:', error);
            this.app.shifts = [];
        }
    }

    // 로컬 스토리지에 데이터 저장
    saveToLocalStorage() {
        try {
            localStorage.setItem('shiftSwapData', JSON.stringify(this.app.shifts));
        } catch (error) {
            console.error('로컬 스토리지 저장 실패:', error);
        }
    }

    // 오늘 이전의 모든 시프트를 자동 취소 처리 (시프트 스왑 대상)
    async autoCancelExpiredShifts() {
        const today = new Date();
        today.setHours(0,0,0,0);
        let changed = false;

        for (const s of this.app.shifts) {
            if (s.status !== 'selling') continue;
            if (s.type !== 'shift') continue; // 시프트 스왑만 만료 처리

            // s.sellingItem: 'YYYY-MM-DD HH' 형태
            const dateStr = (s.sellingItem || '').split(' ')[0];
            if (!dateStr) continue;
            const d = new Date(dateStr);
            d.setHours(0,0,0,0);
            // 오늘 이전이면 만료 처리 (d < today)
            if (d < today) {
                s.status = 'cancelled';
                s.cancelledAt = new Date().toISOString();
                s.cancelReason = 'expired';
                changed = true;
            }
        }

        if (changed) {
            try {
                if (this.isLocalMode) {
                    this.saveToLocalStorage();
                } else {
                    // Firebase 모드: 변경분을 반영
                    const updates = {};
                    this.app.shifts.forEach(s => {
                        if (s.id && s.cancelReason === 'expired' && s.status === 'cancelled') {
                            updates[`shifts/${s.id}/status`] = 'cancelled';
                            updates[`shifts/${s.id}/cancelledAt`] = new Date().toISOString();
                            updates[`shifts/${s.id}/cancelReason`] = 'expired';
                        }
                    });
                    if (Object.keys(updates).length > 0) {
                        await database.ref().update(updates);
                    }
                }
            } catch (e) {
                console.error('만료 자동 취소 반영 실패:', e);
            }
        }
    }

    // 알림 설정
    async setupNotifications() {
        if (!('Notification' in window)) return;
        const permission = Notification.permission;
        if (permission !== 'granted') {
            this.app.showNotification('현재 알림 설정이 꺼져 있습니다. 알림 설정을 확인하세요.', 'info');
        }
    }

    // 알림 발송 (브라우저 알림 + FCM)
    async sendNotification(title, body) {
        console.log('알림 발송 시도:', { title, body });
        
        // iOS Safari 감지
        const isIOSSafari = this.detectIOSSafari();
        const isStandalone = window.navigator.standalone === true;
        
        // 브라우저 알림 (iOS/Safari 호환성 개선)
        if ('Notification' in window && Notification.permission === 'granted') {
            try {
                // iOS Safari에서는 PWA로 설치된 경우에만 알림 가능
                if (isIOSSafari && !isStandalone) {
                    console.log('iOS Safari에서 PWA로 설치되지 않아 알림을 보낼 수 없습니다.');
                    this.showPWAInstallGuide();
                    return;
                }
                
                // iOS/Safari 호환성을 위한 옵션 조정
                const notificationOptions = {
                    body: body,
                    tag: 'shift-swap-notification',
                    requireInteraction: false,
                    silent: false
                };
                
                // 아이콘과 배지 (지원되는 경우에만)
                if (navigator.userAgent.includes('Safari') && !navigator.userAgent.includes('Chrome')) {
                    // Safari에서는 아이콘 옵션 제한적
                    console.log('Safari에서 알림 발송');
                } else {
                    // Chrome, Firefox 등에서는 전체 옵션 사용
                    notificationOptions.icon = 'apple-touch-icon.png';
                    notificationOptions.badge = 'apple-touch-icon.png';
                    notificationOptions.vibrate = [100, 50, 100];
                }
                
                const notification = new Notification(title, notificationOptions);
                
                // 알림 클릭 이벤트 (지원되는 경우)
                notification.onclick = function() {
                    window.focus();
                    this.close();
                };
                
                console.log('브라우저 알림 발송 성공');
                
                // 알림 자동 닫기 (5초 후)
                setTimeout(() => {
                    notification.close();
                }, 5000);
                
            } catch (error) {
                console.error('브라우저 알림 발송 실패:', error);
                
                // iOS Safari에서 알림 실패 시 PWA 설치 안내
                if (isIOSSafari && !isStandalone) {
                    this.showPWAInstallGuide();
                }
            }
        } else {
            console.log('브라우저 알림 권한이 없습니다. 권한 상태:', Notification.permission);
            
            // iOS Safari에서 권한이 없으면 PWA 설치 안내
            if (isIOSSafari && !isStandalone) {
                this.showPWAInstallGuide();
            }
        }

        // FCM 알림 (Firebase가 연결된 경우)
        if (!this.isLocalMode && this.messaging && Notification.permission === 'granted') {
            try {
                // 서버에 알림 요청 (실제 구현에서는 서버 API 호출)
                await this.sendFCMNotification(title, body);
            } catch (error) {
                console.error('FCM 알림 발송 실패:', error);
            }
        } else {
            console.log('FCM 알림 발송 조건이 충족되지 않습니다.');
        }
    }

    // FCM 알림 발송 (서버 API 호출)
    async sendFCMNotification(title, body) {
        try {
            console.log('FCM 알림 발송 시도:', { title, body });
            
            // iOS Safari에서는 FCM이 제한적이므로 브라우저 알림으로 대체
            const isIOSSafari = this.detectIOSSafari();
            
            if (isIOSSafari) {
                console.log('iOS Safari에서는 FCM 대신 브라우저 알림을 사용합니다.');
                // 브라우저 알림은 이미 sendNotification에서 처리됨
                return;
            }
            
            // 다른 플랫폼에서는 FCM 사용
            if ('Notification' in window && Notification.permission === 'granted') {
                new Notification(title, {
                    body: body,
                    icon: 'apple-touch-icon.png',
                    badge: 'apple-touch-icon.png',
                    vibrate: [100, 50, 100],
                    tag: 'shift-swap-notification'
                });
            }
            
            // TODO: 실제 서버 API 구현 시
            // const response = await fetch('/api/send-notification', {
            //     method: 'POST',
            //     headers: { 'Content-Type': 'application/json' },
            //     body: JSON.stringify({ title, body, deviceTokens })
            // });
            
        } catch (error) {
            console.error('FCM 알림 발송 실패:', error);
        }
    }

    // 테스트용 알림 발송
    sendTestNotification() {
        const testShift = {
            name: 'Raymond',
            role: 'TE',
            type: 'shift',
            sellingItem: '2024-08-11 118',
            buyingItem: '2024-08-11 945'
        };
        
        const notificationMessage = this.createNotificationMessage(testShift);
        this.sendNotification(notificationMessage.title, notificationMessage.body);
    }

    // 새 거래 추가
    async addShift(shift) {
        try {
            // 알림 메시지 생성
            const notificationMessage = this.createNotificationMessage(shift);
            
            if (this.isLocalMode) {
                // 로컬 모드
                const newId = Date.now().toString();
                shift.id = newId;
                this.app.shifts.unshift(shift);
                this.saveToLocalStorage();
                this.app.ui.renderShifts();
                this.app.ui.updateTabCounts();
                this.app.showNotification('거래가 성공적으로 등록되었습니다! (로컬 모드)', 'success');
                this.sendNotification(notificationMessage.title, notificationMessage.body);
            } else {
                // Firebase 모드
                await database.ref('shifts').push().set(shift);
                this.app.showNotification('거래가 성공적으로 등록되었습니다!', 'success');
                this.sendNotification(notificationMessage.title, notificationMessage.body);
            }
            return true;
        } catch (error) {
            console.error('거래 등록 실패:', error);
            this.app.showNotification('거래 등록에 실패했습니다. 다시 시도해주세요.', 'error');
            return false;
        }
    }

    // 알림 메시지 생성
    createNotificationMessage(shift) {
        let title, body;
        
        if (shift.type === 'shift') {
            // 시프트 스왑
            const [date, sellingShift] = shift.sellingItem.split(' ');
            const [_, buyingShift] = shift.buyingItem.split(' ');
            
            // 날짜 포맷팅 (M/D 형식)
            const dateObj = new Date(date);
            const shortDate = `${dateObj.getMonth() + 1}/${dateObj.getDate()}`;
            
            // 제목: [역할명] M/D 시프트 구하는 팀원이 있어요
            title = `[${shift.role}] ${shortDate} ${buyingShift} 구하는 팀원이 있어요`;
            
            // 내용: 이름 : M/D 시프트로 시프트을 구합니다.
            body = `${shift.name} : ${shortDate} ${sellingShift}으로 ${buyingShift}을 구합니다.`;
        } else {
            // 휴무 스왑
            const sellingDate = new Date(shift.sellingItem);
            const buyingDate = new Date(shift.buyingItem);
            
            // 날짜 포맷팅 (M/D 형식)
            const sellingShortDate = `${sellingDate.getMonth() + 1}/${sellingDate.getDate()}`;
            const buyingShortDate = `${buyingDate.getMonth() + 1}/${buyingDate.getDate()}`;
            
            // 제목: [역할명] M/D 휴무 구하는 팀원이 있어요
            title = `[${shift.role}] ${buyingShortDate} 휴무 구하는 팀원이 있어요`;
            
            // 내용: 이름 : M/D 휴무로 M/D 휴무를 구합니다.
            body = `${shift.name} : ${sellingShortDate} 휴무로 ${buyingShortDate} 휴무를 구합니다.`;
        }
        
        return { title, body };
    }

    // 거래 완료 처리
    async completeShift(shiftId) {
        try {
            if (this.isLocalMode) {
                const shift = this.app.shifts.find(s => s.id === shiftId);
                if (shift) {
                    shift.status = 'completed';
                    shift.completedAt = new Date().toISOString();
                    this.saveToLocalStorage();
                    this.app.ui.renderShifts();
                    this.app.ui.updateTabCounts();
                    this.app.showNotification('거래가 완료되었습니다! (로컬 모드)', 'success');
                }
            } else {
                await database.ref(`shifts/${shiftId}`).update({
                    status: 'completed',
                    completedAt: new Date().toISOString()
                });
                this.app.showNotification('거래가 완료되었습니다!', 'success');
            }
            return true;
        } catch (error) {
            console.error('거래 완료 실패:', error);
            this.app.showNotification('거래 완료에 실패했습니다. 다시 시도해주세요.', 'error');
            return false;
        }
    }

    // 거래 취소 처리
    async cancelShift(shiftId) {
        try {
            if (this.isLocalMode) {
                const shift = this.app.shifts.find(s => s.id === shiftId);
                if (shift) {
                    shift.status = 'cancelled';
                    shift.cancelledAt = new Date().toISOString();
                    this.saveToLocalStorage();
                    this.app.ui.renderShifts();
                    this.app.ui.updateTabCounts();
                    this.app.showNotification('거래가 취소되었습니다. (로컬 모드)', 'info');
                }
            } else {
                await database.ref(`shifts/${shiftId}`).update({
                    status: 'cancelled',
                    cancelledAt: new Date().toISOString()
                });
                this.app.showNotification('거래가 취소되었습니다.', 'info');
            }
            return true;
        } catch (error) {
            console.error('거래 취소 실패:', error);
            this.app.showNotification('거래 취소에 실패했습니다. 다시 시도해주세요.', 'error');
            return false;
        }
    }

    // 개발용: 데이터 초기화
    async clearData() {
        if (confirm('정말로 모든 데이터를 삭제하시겠습니까?')) {
            try {
                if (this.isLocalMode) {
                    this.app.shifts = [];
                    this.saveToLocalStorage();
                    this.app.ui.renderShifts();
                    this.app.ui.updateTabCounts();
                    this.app.showNotification('모든 데이터가 삭제되었습니다. (로컬 모드)', 'info');
                } else {
                    await database.ref('shifts').remove();
                    this.app.showNotification('모든 데이터가 삭제되었습니다.', 'info');
                }
            } catch (error) {
                console.error('데이터 삭제 실패:', error);
                this.app.showNotification('데이터 삭제에 실패했습니다.', 'error');
            }
        }
    }

    // 샘플 데이터 추가
    async addSampleData() {
        const toISODate = (d) => d.toISOString().split('T')[0];
        const addDays = (base, n) => {
            const d = new Date(base);
            d.setDate(d.getDate() + n);
            d.setHours(0,0,0,0);
            return d;
        };
        const now = new Date();
        const d1 = toISODate(addDays(now, 1));
        const d3 = toISODate(addDays(now, 3));
        const d5 = toISODate(addDays(now, 5));
        const d7 = toISODate(addDays(now, 7));
        const d10 = toISODate(addDays(now, 10));

        const sampleShifts = [
            {
                name: '김영희',
                role: 'TS',
                type: 'shift',
                sellingItem: `${d1} 945`,
                buyingItem: `${d1} 118`,
                reason: '개인 일정으로 인해 시프트 변경이 필요합니다.',
                status: 'selling',
                createdAt: new Date().toISOString()
            },
            {
                name: '박철수',
                role: 'TE',
                type: 'shift',
                sellingItem: `${d3} 129`,
                buyingItem: `${d3} 마감`,
                reason: '병원 예약이 있어서 시프트를 바꿔주세요.',
                status: 'selling',
                createdAt: new Date().toISOString()
            },
            {
                name: '이미영',
                role: 'Genius',
                type: 'dayoff',
                sellingItem: d5,
                buyingItem: d7,
                reason: '가족 행사가 있어서 휴무를 바꿔주세요.',
                status: 'selling',
                createdAt: new Date().toISOString()
            },
            {
                name: '최민수',
                role: 'TS',
                type: 'shift',
                sellingItem: `${d10} 945`,
                buyingItem: `${d10} 129`,
                reason: '',
                status: 'completed',
                createdAt: new Date().toISOString(),
                completedAt: new Date(addDays(now, 1)).toISOString()
            },
            {
                name: '정다은',
                role: 'TE',
                type: 'dayoff',
                sellingItem: d7,
                buyingItem: d10,
                reason: '행사 일정으로 휴무 변경 부탁드립니다.',
                status: 'cancelled',
                createdAt: new Date().toISOString(),
                cancelledAt: new Date(addDays(now, 1)).toISOString()
            }
        ];

        try {
            if (this.isLocalMode) {
                // 로컬 모드
                for (const shift of sampleShifts) {
                    shift.id = Date.now().toString() + Math.random().toString(36).substr(2, 9);
                    this.app.shifts.unshift(shift);
                }
                this.saveToLocalStorage();
                this.app.ui.renderShifts();
                this.app.ui.updateTabCounts();
                this.app.showNotification('샘플 데이터가 추가되었습니다! (로컬 모드)', 'success');
            } else {
                // Firebase 모드
                for (const shift of sampleShifts) {
                    await database.ref('shifts').push().set(shift);
                }
                this.app.showNotification('샘플 데이터가 추가되었습니다!', 'success');
            }
        } catch (error) {
            console.error('샘플 데이터 추가 실패:', error);
            this.app.showNotification('샘플 데이터 추가에 실패했습니다.', 'error');
        }
    }
}
