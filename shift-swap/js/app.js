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
        
        this.init();
    }

    async init() {
        // UI와 Firebase 서비스 초기화
        this.ui = new ShiftSwapUI(this);
        this.firebaseService = new FirebaseService(this);
        
        this.bindEvents();
        this.switchSwapType('shift');
        
        // 알림 설정 버튼 직접 바인딩 (백업)
        setTimeout(() => {
            this.bindNotificationSettingsDirectly();
        }, 200);
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

    // 알림 표시
    showNotification(message, type = 'info') {
        const notification = document.getElementById('notification');
        notification.textContent = message;
        notification.className = `notification ${type} show`;
        
        // 알림 설정 관련 메시지는 더 짧게 표시
        const duration = message.includes('알림 설정') ? 2000 : 3000;
        
        setTimeout(() => {
            notification.classList.remove('show');
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
}

// DOM이 완전히 로드된 후 앱 초기화
document.addEventListener('DOMContentLoaded', () => {
    window.shiftSwapApp = new ShiftSwapApp();
});
