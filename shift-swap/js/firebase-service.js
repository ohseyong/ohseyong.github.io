// Firebase 서비스 클래스
class FirebaseService {
    constructor(app) {
        this.app = app;
        this.isLocalMode = false;
        this.init();
    }

    init() {
        this.setupFirebaseListeners();
        this.setupNotifications();
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
            });

            // 연결 상태 감지
            database.ref('.info/connected').on('value', (snapshot) => {
                this.app.ui.updateConnectionStatus(snapshot.val());
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
        this.app.showNotification('로컬 모드로 실행 중입니다. (Firebase 연결 실패)', 'info');
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

    // 알림 발송
    sendNotification(title, body) {
        if ('Notification' in window && Notification.permission === 'granted') {
            new Notification(title, {
                body: body,
                icon: '/assets/icon-192x192.png',
                badge: '/assets/icon-72x72.png',
                vibrate: [100, 50, 100]
            });
        }
    }

    // 새 거래 추가
    async addShift(shift) {
        try {
            if (this.isLocalMode) {
                // 로컬 모드
                const newId = Date.now().toString();
                shift.id = newId;
                this.app.shifts.unshift(shift);
                this.saveToLocalStorage();
                this.app.ui.renderShifts();
                this.app.ui.updateTabCounts();
                this.app.showNotification('거래가 성공적으로 등록되었습니다! (로컬 모드)', 'success');
                this.sendNotification('새 거래 등록', `${shift.name}님이 새로운 거래를 등록했습니다.`);
            } else {
                // Firebase 모드
                await database.ref('shifts').push().set(shift);
                this.app.showNotification('거래가 성공적으로 등록되었습니다!', 'success');
                this.sendNotification('새 거래 등록', `${shift.name}님이 새로운 거래를 등록했습니다.`);
            }
            return true;
        } catch (error) {
            console.error('거래 등록 실패:', error);
            this.app.showNotification('거래 등록에 실패했습니다. 다시 시도해주세요.', 'error');
            return false;
        }
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
