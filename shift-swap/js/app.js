// 메인 애플리케이션 클래스
class ShiftSwapApp {
    constructor() {
        this.shifts = [];
        this.currentTab = 'selling';
        this.selectedShiftId = null;
        this.currentSwapType = 'shift';
        this.currentRoleFilter = 'all';
        this.currentTypeFilter = 'all';
        this.isLocalMode = false;
        this.toastQueue = [];
        this.isToastVisible = false;
        
        this.init();
    }

    async init() {
        // UI와 Firebase 서비스 초기화
        this.ui = new ShiftSwapUI(this);
        this.firebaseService = new FirebaseService(this);
        this.calendarService = new CalendarService(this);
        
        this.bindEvents();
        this.switchSwapType('shift');
        
        // 알림 설정 버튼 직접 바인딩 (백업)
        setTimeout(() => {
            this.bindNotificationSettingsDirectly();
        }, 200);
        
        // 캘린더 서비스 초기화 및 자동 동기화
        setTimeout(() => {
            this.calendarService.init();
            // 페이지 로딩 시마다 캘린더 동기화 실행
            this.calendarService.autoSync();
        }, 100);
        
        // 통합 토스트 메시지 표시 (다른 초기화 완료 후)
        setTimeout(() => {
            this.showInitialToasts();
        }, 500); // 이전 100ms에서 조금 더 여유를 줌
    }

    // 이벤트 바인딩
    bindEvents() {
        // 탭 클릭 이벤트
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.switchTab(e.target.closest('.tab-btn').dataset.tab);
            });
        });

        // 새 거래 등록 버튼
        const addShiftBtn = document.getElementById('addShiftBtn');
        if (addShiftBtn) {
            addShiftBtn.addEventListener('click', () => {
                this.showModal('addShiftModal');
            });
        }

        // 모달 닫기 버튼들
        const closeModal = document.getElementById('closeModal');
        if (closeModal) {
            closeModal.addEventListener('click', () => {
                this.hideModal('addShiftModal');
            });
        }

        const closeDetailModal = document.getElementById('closeDetailModal');
        if (closeDetailModal) {
            closeDetailModal.addEventListener('click', () => {
                this.hideModal('shiftDetailModal');
            });
        }

        const closeConfirmModal = document.getElementById('closeConfirmModal');
        if (closeConfirmModal) {
            closeConfirmModal.addEventListener('click', () => {
                this.hideModal('confirmModal');
            });
        }

        // 취소 버튼들
        const cancelBtn = document.getElementById('cancelBtn');
        if (cancelBtn) {
            cancelBtn.addEventListener('click', () => {
                this.hideModal('addShiftModal');
            });
        }

        const cancelConfirm = document.getElementById('cancelConfirm');
        if (cancelConfirm) {
            cancelConfirm.addEventListener('click', () => {
                this.hideModal('confirmModal');
            });
        }

        // 폼 제출
        const shiftForm = document.getElementById('shiftForm');
        if (shiftForm) {
            shiftForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.addShift();
            });
            this.loadUserPreferences();
        }

        // 모달 오버레이 클릭 시 닫기
        document.querySelectorAll('.modal-overlay').forEach(overlay => {
            overlay.addEventListener('click', (e) => {
                if (e.target === overlay) {
                    this.hideAllModals();
                }
            });
        });

        // 거래 완료 확인
        const confirmComplete = document.getElementById('confirmComplete');
        if (confirmComplete) {
            confirmComplete.addEventListener('click', () => {
                this.completeShift();
            });
        }
    }

    // 사용자 선호도 로드
    loadUserPreferences() {
        const savedName = localStorage.getItem('userName');
        const savedRole = localStorage.getItem('userRole');
        
        if (savedName) {
            const nameInput = document.getElementById('name');
            if (nameInput) nameInput.value = savedName;
        }
        
        if (savedRole) {
            const roleHidden = document.getElementById('role');
            if (roleHidden) roleHidden.value = savedRole;
            document.querySelectorAll('.role-btn').forEach(b => {
                b.classList.toggle('active', b.dataset.role === savedRole);
            });
        }
    }

    // 새 거래 추가 (중복 등록 버그 수정)
    async addShift() {
        const shiftForm = document.getElementById('shiftForm');
        if (!shiftForm) return;
        
        const formData = new FormData(shiftForm);
        const name = formData.get('name');
        const role = formData.get('role');
        const reason = formData.get('reason') || '';
        
        if (!role) {
            this.showNotification('역할을 선택해주세요.', 'error');
            return;
        }
        
        let sellingItem, buyingItem;
        
        if (this.currentSwapType === 'shift') {
            const shiftDate = formData.get('shiftDate');
            const sellingTime = formData.get('sellingShiftTime');
            const buyingTime = formData.get('buyingShiftTime');
            
            if (!shiftDate || !sellingTime || !buyingTime) {
                this.showNotification('모든 필드를 입력해주세요. (날짜와 시프트를 모두 선택해주세요)', 'error');
                return;
            }
            
            sellingItem = `${shiftDate} ${sellingTime}`;
            buyingItem = `${shiftDate} ${buyingTime}`;
        } else {
            const sellingDayoff = formData.get('sellingDayoff');
            const buyingDayoff = formData.get('buyingDayoff');
            
            if (!sellingDayoff || !buyingDayoff) {
                this.showNotification('모든 필드를 입력해주세요.', 'error');
                return;
            }
            
            sellingItem = sellingDayoff;
            buyingItem = buyingDayoff;
        }

        const shift = {
            name: name,
            role: role,
            type: this.currentSwapType,
            sellingItem: sellingItem,
            buyingItem: buyingItem,
            reason: reason,
            status: 'selling',
            createdAt: new Date().toISOString()
        };

        // Firebase 서비스를 통해 거래 추가 (중복 방지)
        const success = await this.firebaseService.addShift(shift);
        if (success) {
            this.saveUserPreferences(name, role);
            this.hideModal('addShiftModal');
            this.resetForm();
        }
    }

    // 사용자 선호도 저장
    saveUserPreferences(name, role) {
        try {
            localStorage.setItem('userName', name);
            localStorage.setItem('userRole', role);
        } catch (e) {
            console.error('사용자 선호도 저장 실패:', e);
        }
    }

    // 탭 전환
    switchTab(tabName) {
        this.currentTab = tabName;
        
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        document.querySelector(`[data-tab="${tabName}"]`).classList.add('active');
        
        this.ui.renderShifts();
    }

    // 폼 리셋
    resetForm() {
        document.getElementById('shiftForm').reset();
        this.switchSwapType('shift');
        this.ui.setMinDates();
        
        document.querySelectorAll('.shift-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        
        document.querySelectorAll('.role-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        
        this.switchSwapType('shift');
    }

    // 거래 완료 처리
    async completeShift() {
        if (!this.selectedShiftId) return;

        const success = await this.firebaseService.completeShift(this.selectedShiftId);
        if (success) {
            this.hideModal('confirmModal');
            this.selectedShiftId = null;
        }
    }

    // 시프트 취소 처리
    async cancelShift(shiftId) {
        const shift = this.shifts.find(s => s.id === shiftId);
        if (!shift) return;

        if (confirm(`정말로 이 거래를 취소하시겠습니까?\n\n거래 정보:\n- 등록자: ${shift.name}\n- 거래 ID: ${shift.id}`)) {
            await this.firebaseService.cancelShift(shiftId);
        }
    }

    // 확인 모달 표시
    showConfirmModal(shiftId) {
        this.selectedShiftId = shiftId;
        this.showModal('confirmModal');
    }

    // 거래 유형 전환
    switchSwapType(type) {
        this.currentSwapType = type;
        this.ui.switchSwapType(type);
    }

    // 모달 표시
    showModal(modalId) {
        document.getElementById(modalId).classList.add('show');
        document.body.style.overflow = 'hidden';
    }

    // 모달 숨기기
    hideModal(modalId) {
        document.getElementById(modalId).classList.remove('show');
        document.body.style.overflow = '';
    }

    // 모든 모달 숨기기
    hideAllModals() {
        document.querySelectorAll('.modal').forEach(modal => {
            modal.classList.remove('show');
        });
        document.body.style.overflow = '';
    }

    // 알림 표시 (큐 시스템 적용)
    showNotification(message, type = 'info', duration = 3000) {
        this.toastQueue.push({ message, type, duration });
        if (!this.isToastVisible) {
            this.showNextToast();
        }
    }

    // 다음 토스트 메시지 표시
    showNextToast() {
        if (this.toastQueue.length === 0) {
            this.isToastVisible = false;
            return;
        }

        this.isToastVisible = true;
        const { message, type, duration } = this.toastQueue.shift();

        const notification = document.getElementById('notification');
        notification.textContent = message;
        notification.className = `notification ${type} show`;

        setTimeout(() => {
            notification.classList.remove('show');
            // 애니메이션 시간을 기다린 후 다음 토스트 표시
            setTimeout(() => {
                this.showNextToast();
            }, 500); // .notification의 transition 시간과 일치
        }, duration);
    }

    // UI 렌더링 메서드들 (UI 클래스로 위임)
    renderShifts() {
        this.ui.renderShifts();
    }

    updateTabCounts() {
        this.ui.updateTabCounts();
    }

    // 알림 설정 직접 바인딩 (백업 메서드)
    bindNotificationSettingsDirectly() {
        const openBtn = document.getElementById('openNotificationSettings');
        if (openBtn) {
            console.log('앱 클래스에서 알림 설정 버튼 직접 바인딩');
            openBtn.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                console.log('앱 클래스에서 알림 설정 버튼 클릭됨');
                this.showModal('notificationSettingsModal');
            });
        }
    }

    // 개발용 메서드들
    clearData() {
        this.firebaseService.clearData();
    }

    addSampleData() {
        this.firebaseService.addSampleData();
    }

    // 테스트 알림 발송
    sendTestNotification() {
        this.firebaseService.sendTestNotification();
    }

    // 초기 토스트 메시지 표시 (큐 사용)
    showInitialToasts() {
        console.log('초기 토스트 메시지 표시 시작');
        const toastDuration = 1000; // 모든 초기 토스트는 1초간 표시

        // 1. 알림 설정 (연결됨 메시지는 연결 상태 변경 시 자동으로 표시되므로 제거)
        const permission = Notification.permission;
        console.log('알림 권한 상태:', permission);
        const isIOSSafari = this.firebaseService.detectIOSSafari();
        const isStandalone = window.navigator.standalone === true;

        if (permission !== 'granted') {
            this.showNotification('알림 설정 시 새 매물 등록 시 알림을 받을 수 있습니다', 'info', toastDuration);
        } else if (isIOSSafari && !isStandalone) {
            this.showNotification('iOS Safari에서는 홈 화면에 추가하면 알림을 받을 수 있습니다', 'info', toastDuration);
        } else {
            this.showNotification('알림이 설정되어 있습니다', 'success', toastDuration);
        }

        // 3. 캘린더 설정
        const hasCalendarUrl = this.calendarService.calendarUrl;
        const hasCalendarEvents = this.calendarService.calendarEvents.length > 0;
        console.log('캘린더 상태:', { hasCalendarUrl, hasCalendarEvents });
        
        if (hasCalendarUrl && hasCalendarEvents) {
            this.showNotification('캘린더가 동기화된 상태입니다', 'success', toastDuration);
        } else if (hasCalendarUrl) {
            this.showNotification('캘린더 설정은 되어 있지만 동기화가 필요합니다', 'info', toastDuration);
        } else {
            this.showNotification('캘린더 설정 시 내가 가진 스케줄과 일치하는 매물이 강조 표시됩니다', 'info', toastDuration);
        }
    }
}

// DOM이 완전히 로드된 후 앱 초기화
document.addEventListener('DOMContentLoaded', () => {
    window.shiftSwapApp = new ShiftSwapApp();
});
