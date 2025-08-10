// Firebase 시프트 스왑 애플리케이션
class FirebaseShiftSwapApp {
    constructor() {
        this.shifts = [];
        this.currentTab = 'selling';
        this.selectedShiftId = null;
        this.currentSwapType = 'shift'; // 'shift' 또는 'dayoff'
        // 기본은 전체 노출 (아무 필터도 선택 안됨)
        this.currentRoleFilter = 'all'; // 'all'이면 역할 필터 미적용
        this.currentTypeFilter = 'all'; // 'all'이면 유형 필터 미적용
        
        this.init();
    }

    // 애플리케이션 초기화
    async init() {
        this.bindEvents();
        this.setupFirebaseListeners();
        this.setupTypeTabs();
        this.setupShiftButtons();
        this.setupRoleButtons();
        this.setupRoleFilters();
        // 거래 유형별 모아보기 필터 활성화
        this.setupTypeFilters();
        // 알림 설정 모달 바인딩
        this.bindNotificationSettings();
        this.setMinDates();
        this.setupNotifications();
        
        // 초기 required 속성 설정 (시프트 스왑이 기본값)
        this.switchSwapType('shift');
        // 만료 자동 취소 1회 보장 (초기 로드 시)
        this.autoCancelExpiredShifts();
    }

    // 알림 설정 모달 열기/닫기 바인딩(모바일 포함)
    bindNotificationSettings() {
        const openBtn = document.getElementById('openNotificationSettings');
        const modal = document.getElementById('notificationSettingsModal');
        if (!openBtn || !modal) return;

        const closeBtn = document.getElementById('closeNotificationSettings');
        const closeFooterBtn = document.getElementById('closeNotificationSettingsFooter');
        const overlay = modal.querySelector('.modal-overlay');
        const statusSpan = document.getElementById('notificationPermissionStatus');
        const requestBtn = document.getElementById('requestNotificationPermission');
        const roleBtns = modal.querySelectorAll('#notificationRoleButtons .role-btn');
        const saveBtn = document.getElementById('saveNotificationPrefs');

        const updateStatus = () => {
            if (!('Notification' in window)) {
                if (statusSpan) statusSpan.textContent = '권한 상태: 지원되지 않음';
                return;
            }
            if (statusSpan) statusSpan.textContent = `권한 상태: ${Notification.permission}`;
        };

        const show = () => { this.showModal('notificationSettingsModal'); updateStatus(); };
        const hide = () => { this.hideModal('notificationSettingsModal'); };

        openBtn.addEventListener('click', (e) => { e.preventDefault(); e.stopPropagation(); show(); });
        closeBtn && closeBtn.addEventListener('click', hide);
        closeFooterBtn && closeFooterBtn.addEventListener('click', hide);
        overlay && overlay.addEventListener('click', (e) => { if (e.target === overlay) hide(); });

        requestBtn && requestBtn.addEventListener('click', async () => {
            try {
                if (!('Notification' in window)) return;
                await Notification.requestPermission();
                updateStatus();
            } catch (_) {}
        });

        roleBtns.forEach(btn => {
            btn.addEventListener('click', () => btn.classList.toggle('active'));
        });

        saveBtn && saveBtn.addEventListener('click', () => {
            const selected = Array.from(roleBtns).filter(b => b.classList.contains('active')).map(b => b.dataset.role);
            try { localStorage.setItem('notificationRoles', JSON.stringify(selected)); } catch (_) {}
            this.showNotification('알림 설정이 저장되었습니다.', 'success');
            hide();
        });
    }

    // 알림 설정
    async setupNotifications() {
        if (!('Notification' in window)) return;
        const permission = Notification.permission;
        if (permission !== 'granted') {
            this.showNotification('현재 알림 설정이 꺼져 있습니다. 알림 설정을 확인하세요.', 'info');
        }
    }

    // 오늘 이전의 모든 시프트를 자동 취소 처리 (시프트 스왑 대상)
    async autoCancelExpiredShifts() {
        const today = new Date();
        today.setHours(0,0,0,0);
        let changed = false;

        for (const s of this.shifts) {
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
                    this.shifts.forEach(s => {
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

    // Firebase 리스너 설정
    setupFirebaseListeners() {
        try {
            // 시프트 데이터 변경 감지
            database.ref('shifts').on('value', (snapshot) => {
                this.shifts = [];
                snapshot.forEach((childSnapshot) => {
                    const shift = childSnapshot.val();
                    shift.id = childSnapshot.key;
                    this.shifts.push(shift);
                });
                
                // 시간순으로 정렬 (최신순)
                this.shifts.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
                // 만료된 시프트 자동 취소 처리
                this.autoCancelExpiredShifts();
                this.renderShifts();
                this.updateTabCounts();
            });

            // 연결 상태 감지
            database.ref('.info/connected').on('value', (snapshot) => {
                this.updateConnectionStatus(snapshot.val());
            });
        } catch (error) {
            console.log('Firebase 연결 실패, 로컬 스토리지 모드로 전환:', error);
            this.setupLocalStorage();
            this.updateConnectionStatus(false);
        }
    }

    // 로컬 스토리지 설정 (Firebase 연결 실패 시)
    setupLocalStorage() {
        this.isLocalMode = true;
        this.loadFromLocalStorage();
        this.showNotification('로컬 모드로 실행 중입니다. (Firebase 연결 실패)', 'info');
    }

    // 로컬 스토리지에서 데이터 로드
    loadFromLocalStorage() {
        try {
            const data = localStorage.getItem('shiftSwapData');
            this.shifts = data ? JSON.parse(data) : [];
        } catch (error) {
            console.error('로컬 스토리지 로드 실패:', error);
            this.shifts = [];
        }
    }

    // 로컬 스토리지에 데이터 저장
    saveToLocalStorage() {
        try {
            localStorage.setItem('shiftSwapData', JSON.stringify(this.shifts));
        } catch (error) {
            console.error('로컬 스토리지 저장 실패:', error);
        }
    }

    // 연결 상태 업데이트
    updateConnectionStatus(connected) {
        const statusElement = document.getElementById('connectionStatus');
        const indicator = statusElement.querySelector('.status-indicator');
        const text = statusElement.querySelector('.status-text');
        
        if (connected) {
            indicator.className = 'status-indicator online';
            text.textContent = '실시간 연결됨';
            
            // 3초 후에 연결 상태 표시 숨기기
            setTimeout(() => {
                statusElement.style.opacity = '0';
                setTimeout(() => {
                    statusElement.style.display = 'none';
                }, 300);
            }, 3000);
        } else {
            indicator.className = 'status-indicator offline';
            text.textContent = '연결 끊김';
            statusElement.style.display = 'flex';
            statusElement.style.opacity = '1';
        }
    }

    // 거래 유형 탭 설정
    setupTypeTabs() {
        const typeTabs = document.querySelectorAll('.type-tab');
        typeTabs.forEach(tab => {
            tab.addEventListener('click', () => {
                this.switchSwapType(tab.dataset.type);
            });
        });
    }

    // 시프트 버튼 설정
    setupShiftButtons() {
        // 모든 시프트 버튼에 이벤트 리스너 추가
        document.querySelectorAll('.shift-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const shiftButtons = e.target.closest('.shift-buttons');
                const hiddenInput = shiftButtons.nextElementSibling;
                
                // 같은 그룹의 다른 버튼들 비활성화
                shiftButtons.querySelectorAll('.shift-btn').forEach(b => b.classList.remove('active'));
                
                // 클릭된 버튼 활성화
                e.target.classList.add('active');
                
                // hidden input에 값 설정
                hiddenInput.value = e.target.dataset.shift;
                
                console.log('시프트 선택:', e.target.dataset.shift, 'hidden input:', hiddenInput.value);
            });
        });
    }

    // 역할 버튼 설정
    setupRoleButtons() {
        document.querySelectorAll('.role-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const roleButtons = e.target.closest('.role-buttons');
                const hiddenInput = roleButtons.nextElementSibling;
                
                // 같은 그룹의 다른 버튼들 비활성화
                roleButtons.querySelectorAll('.role-btn').forEach(b => b.classList.remove('active'));
                
                // 클릭된 버튼 활성화
                e.target.classList.add('active');
                
                // hidden input에 값 설정
                hiddenInput.value = e.target.dataset.role;
                
                console.log('역할 선택:', e.target.dataset.role);
            });
        });
    }

        // 역할별 필터 설정 (단일 선택 토글, 재클릭시 해제)
    setupRoleFilters() {
        document.querySelectorAll('.role-filter-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const self = e.currentTarget;
                const role = self.dataset.role;
                const isActive = self.classList.contains('active');
                // 모두 비활성화
                document.querySelectorAll('.role-filter-btn').forEach(b => b.classList.remove('active'));
                // 재클릭이면 해제 상태 유지 (전체 표시), 아니면 활성화
                if (!isActive) {
                    self.classList.add('active');
                    this.currentRoleFilter = role;
                } else {
                    this.currentRoleFilter = 'all';
                }
                this.renderShifts();
            });
        });
    }

        // 거래 유형별 필터 설정 (단일 선택 토글, 재클릭시 해제)
    setupTypeFilters() {
        const container = document.querySelector('.type-filter');
        if (!container) return;
        container.addEventListener('click', (e) => {
            const btn = e.target.closest('.type-filter-btn');
            if (!btn) return;
            const type = btn.dataset.type; // all | shift | dayoff

            const isActive = btn.classList.contains('active');
            // 모두 비활성화
            container.querySelectorAll('.type-filter-btn').forEach(b => b.classList.remove('active'));
            if (!isActive) {
                btn.classList.add('active');
                this.currentTypeFilter = type;
            } else {
                this.currentTypeFilter = 'all';
            }
            this.renderShifts();
        });
    }

    // (초기엔 아무 버튼도 활성화하지 않음)

    // 거래 유형 전환
    switchSwapType(type) {
        this.currentSwapType = type;
        
        // 탭 활성화 (모달 내부 type-tabs에만 적용)
        document.querySelectorAll('.type-tab').forEach(tab => {
            tab.classList.remove('active');
        });
        const targetTab = document.querySelector(`.type-tabs [data-type="${type}"]`);
        if (targetTab) targetTab.classList.add('active');
        
        // 필드 표시/숨김 및 required 속성 관리
        const shiftFields = document.getElementById('shiftFields');
        const dayoffFields = document.getElementById('dayoffFields');
        
        if (type === 'shift') {
            shiftFields.style.display = 'block';
            dayoffFields.style.display = 'none';
            
            // 시프트 필드 required 활성화, 휴무 필드 required 비활성화
            document.querySelectorAll('#shiftFields input[required]').forEach(input => {
                input.required = true;
            });
            document.querySelectorAll('#dayoffFields input[required]').forEach(input => {
                input.required = false;
            });
        } else {
            shiftFields.style.display = 'none';
            dayoffFields.style.display = 'block';
            
            // 휴무 필드 required 활성화, 시프트 필드 required 비활성화
            document.querySelectorAll('#dayoffFields input[required]').forEach(input => {
                input.required = true;
            });
            document.querySelectorAll('#shiftFields input[required]').forEach(input => {
                input.required = false;
            });
        }
    }

    // 최소 날짜 설정 (오늘부터)
    setMinDates() {
        const today = new Date().toISOString().split('T')[0];
        const dateInputs = document.querySelectorAll('input[type="date"]');
        dateInputs.forEach(input => {
            input.min = today;
        });
    }

    // 이벤트 바인딩
    bindEvents() {
        console.log('이벤트 바인딩 시작');
        
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
                console.log('새 거래 등록 버튼 클릭');
                this.showModal('addShiftModal');
            });
        } else {
            console.error('addShiftBtn을 찾을 수 없습니다');
        }

        // 모달 닫기 버튼들
        const closeModal = document.getElementById('closeModal');
        if (closeModal) {
            closeModal.addEventListener('click', () => {
                this.hideModal('addShiftModal');
            });
        } else {
            console.error('closeModal을 찾을 수 없습니다');
        }

        const closeDetailModal = document.getElementById('closeDetailModal');
        if (closeDetailModal) {
            closeDetailModal.addEventListener('click', () => {
                this.hideModal('shiftDetailModal');
            });
        } else {
            console.error('closeDetailModal을 찾을 수 없습니다');
        }

        const closeConfirmModal = document.getElementById('closeConfirmModal');
        if (closeConfirmModal) {
            closeConfirmModal.addEventListener('click', () => {
                this.hideModal('confirmModal');
            });
        } else {
            console.error('closeConfirmModal을 찾을 수 없습니다');
        }

        // 취소 버튼들
        const cancelBtn = document.getElementById('cancelBtn');
        if (cancelBtn) {
            cancelBtn.addEventListener('click', () => {
                this.hideModal('addShiftModal');
            });
        } else {
            console.error('cancelBtn을 찾을 수 없습니다');
        }

        const cancelConfirm = document.getElementById('cancelConfirm');
        if (cancelConfirm) {
            cancelConfirm.addEventListener('click', () => {
                this.hideModal('confirmModal');
            });
        } else {
            console.error('cancelConfirm을 찾을 수 없습니다');
        }

        // 폼 제출
        const shiftForm = document.getElementById('shiftForm');
        if (shiftForm) {
            shiftForm.addEventListener('submit', (e) => {
                e.preventDefault();
                console.log('폼 제출 이벤트 발생');
                this.addShift();
            });
            // 이름/역할 자동완성 초기값 주입
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
        } else {
            console.error('shiftForm을 찾을 수 없습니다');
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
        } else {
            console.error('confirmComplete을 찾을 수 없습니다');
        }
        
        console.log('이벤트 바인딩 완료');
    }

    // 새 거래 추가
    async addShift() {
        console.log('addShift 함수 시작');
        
        const shiftForm = document.getElementById('shiftForm');
        if (!shiftForm) {
            console.error('shiftForm을 찾을 수 없습니다');
            return;
        }
        
        const formData = new FormData(shiftForm);
        const name = formData.get('name');
        const role = formData.get('role');
        const reason = formData.get('reason') || '';
        
        console.log('폼 데이터:', { name, role, reason, currentSwapType: this.currentSwapType });
        
        if (!role) {
            this.showNotification('역할을 선택해주세요.', 'error');
            return;
        }
        
        console.log('폼 데이터:', { name, reason, currentSwapType: this.currentSwapType });
        
        let sellingItem, buyingItem;
        
        if (this.currentSwapType === 'shift') {
            const shiftDate = formData.get('shiftDate');
            const sellingTime = formData.get('sellingShiftTime');
            const buyingTime = formData.get('buyingShiftTime');
            
            console.log('시프트 등록 데이터:', {
                shiftDate, sellingTime, buyingTime
            });
            
            if (!shiftDate || !sellingTime || !buyingTime) {
                console.error('필수 필드 누락:', { shiftDate, sellingTime, buyingTime });
                this.showNotification('모든 필드를 입력해주세요. (날짜와 시프트를 모두 선택해주세요)', 'error');
                return;
            }
            
            sellingItem = `${shiftDate} ${sellingTime}`;
            buyingItem = `${shiftDate} ${buyingTime}`;
        } else {
            const sellingDayoff = formData.get('sellingDayoff');
            const buyingDayoff = formData.get('buyingDayoff');
            
            console.log('휴무 등록 데이터:', { sellingDayoff, buyingDayoff });
            
            if (!sellingDayoff || !buyingDayoff) {
                console.error('필수 필드 누락:', { sellingDayoff, buyingDayoff });
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

        console.log('등록할 거래:', shift);
        console.log('현재 모드:', this.isLocalMode ? '로컬 모드' : 'Firebase 모드');

        try {
            if (this.isLocalMode) {
                // 로컬 모드: 로컬 스토리지에 저장
                const newId = Date.now().toString();
                shift.id = newId;
                this.shifts.unshift(shift);
                // 사용자 이름/역할 저장 (자동완성용)
                try {
                    localStorage.setItem('userName', name);
                    localStorage.setItem('userRole', role);
                } catch (e) {}
                this.saveToLocalStorage();
                this.renderShifts();
                this.updateTabCounts();
                this.showNotification('거래가 성공적으로 등록되었습니다! (로컬 모드)', 'success');
                this.sendNotification('새 거래 등록', `${shift.name}님이 새로운 거래를 등록했습니다.`);
                console.log('로컬 모드에서 거래 등록 성공');
            } else {
                // Firebase 모드
                await database.ref('shifts').push().set(shift);
                try {
                    localStorage.setItem('userName', name);
                    localStorage.setItem('userRole', role);
                } catch (e) {}
                this.showNotification('거래가 성공적으로 등록되었습니다!', 'success');
                this.sendNotification('새 거래 등록', `${shift.name}님이 새로운 거래를 등록했습니다.`);
                console.log('Firebase 모드에서 거래 등록 성공');
            }
            this.hideModal('addShiftModal');
            this.resetForm();
        } catch (error) {
            console.error('거래 등록 실패:', error);
            this.showNotification('거래 등록에 실패했습니다. 다시 시도해주세요.', 'error');
        }
    }

    // 탭 전환
    switchTab(tabName) {
        this.currentTab = tabName;
        
        // 탭 버튼 활성화
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        document.querySelector(`[data-tab="${tabName}"]`).classList.add('active');
        
        this.renderShifts();
    }

    // 폼 리셋
    resetForm() {
        document.getElementById('shiftForm').reset();
        this.switchSwapType('shift'); // 기본값으로 시프트 스왑
        this.setMinDates();
        
        // 시프트 버튼 초기화
        document.querySelectorAll('.shift-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        
        // 역할 버튼 초기화
        document.querySelectorAll('.role-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        
        // required 속성 재설정
        this.switchSwapType('shift');
    }

    // 판매 시프트(또는 휴무) 날짜 기준 정렬용 Date (가까운 날짜 우선)
    getSellingDateForSort(shift) {
        try {
            if (shift.type === 'shift') {
                const [dateStr, timeCode] = (shift.sellingItem || '').split(' ');
                const d = new Date(dateStr);
                const orderMap = { '945': 0, '118': 1, '129': 2, '마감': 3 };
                const idx = orderMap[timeCode] ?? 0;
                d.setHours(0 + idx, 0, 0, 0);
                return d;
            }
            if (shift.type === 'dayoff') {
                return new Date(shift.sellingItem);
            }
        } catch (e) {}
        return new Date(shift.createdAt || Date.now());
    }

    // 시프트 렌더링
    renderShifts() {
        const shiftList = document.getElementById('shiftList');
        const emptyState = document.getElementById('emptyState');
        
        let filteredShifts = this.shifts.filter(shift => shift.status === this.currentTab);
        
        // 역할별 필터링
        if (this.currentRoleFilter !== 'all') {
            filteredShifts = filteredShifts.filter(shift => shift.role === this.currentRoleFilter);
        }
        // 거래 유형별 필터링
        if (this.currentTypeFilter !== 'all') {
            filteredShifts = filteredShifts.filter(shift => shift.type === this.currentTypeFilter);
        }
        // 기본 정렬: 판매 날짜가 가까운 순
        filteredShifts.sort((a, b) => this.getSellingDateForSort(a) - this.getSellingDateForSort(b));
        
        if (filteredShifts.length === 0) {
            shiftList.innerHTML = '';
            emptyState.style.display = 'block';
            return;
        }

        emptyState.style.display = 'none';
        shiftList.innerHTML = filteredShifts.map(shift => this.createShiftCard(shift)).join('');
        
        // 시프트 카드 클릭 이벤트 바인딩
        document.querySelectorAll('.shift-card').forEach(card => {
            card.addEventListener('click', (e) => {
                if (!e.target.closest('.shift-actions')) {
                    const shiftId = card.dataset.shiftId;
                    this.showShiftDetail(shiftId);
                }
            });
        });

        // 액션 버튼 이벤트 바인딩
        document.querySelectorAll('.btn-complete').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const shiftId = btn.closest('.shift-card').dataset.shiftId;
                // 추가 컨펌 메시지
                const ok = confirm('거래는 당사자간 연락을 통해 진행하시고, 거래 성사 시 "거래완료" 버튼을 눌러주세요.\n거래 당사자인 경우에만 거래완료 처리를 부탁드립니다.\n\n계속하시겠습니까?');
                if (ok) this.showConfirmModal(shiftId);
            });
        });

        document.querySelectorAll('.btn-cancel').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const shiftId = btn.closest('.shift-card').dataset.shiftId;
                const ok = confirm('거래 요청이 완전히 삭제됩니다. 계속합니까?\n올린 당사자인 경우에만 삭제하세요. 타인의 매물을 삭제하지 말아주세요!');
                if (ok) this.cancelShift(shiftId);
            });
        });
    }

    // 시프트 카드 생성
    createShiftCard(shift) {
        const statusClass = shift.status === 'completed' ? 'completed' : 
                           shift.status === 'cancelled' ? 'cancelled' : '';
        
        const typeText = shift.type === 'shift' ? '시프트 스왑' : '휴무 스왑';
        const typeIcon = shift.type === 'shift' ? '🔄' : '📅';
        
        // 시프트 스왑인 경우 카드 내용 생성
        let cardContent = '';
        if (shift.type === 'shift') {
            const [date, sellingShift] = shift.sellingItem.split(' ');
            const [_, buyingShift] = shift.buyingItem.split(' ');
            const formattedDate = new Date(date).toLocaleDateString('ko-KR', {
                month: 'long',
                day: 'numeric'
            });
            const headlineHtml = `
                <div class="shift-headline">
                    <span class="date-plain">${formattedDate}</span>
                    <span class="pill pill-selling">${sellingShift}</span>
                    <span class="postposition">로</span>
                    <span class="arrow">→</span>
                    <span class="pill pill-buying">${buyingShift}</span>
                    <span class="headline-tail">구합니다</span>
                </div>`;
            cardContent = `${headlineHtml}`;
        } else {
            const sellingDate = new Date(shift.sellingItem).toLocaleDateString('ko-KR', {
                month: 'long',
                day: 'numeric'
            });
            const buyingDate = new Date(shift.buyingItem).toLocaleDateString('ko-KR', {
                month: 'long',
                day: 'numeric'
            });
            const headlineHtml = `
                <div class="shift-headline">
                    <span class="pill pill-selling">${sellingDate} 휴무</span>
                    <span class="postposition">로</span>
                    <span class="arrow">→</span>
                    <span class="pill pill-buying">${buyingDate} 휴무</span>
                    <span class="headline-tail">구합니다</span>
                </div>`;
            cardContent = `${headlineHtml}`;
        }
        
        const expiredBadge = (shift.status === 'cancelled' && shift.cancelReason === 'expired')
            ? '<div class="expired-badge">날짜가 지나서 취소되었습니다</div>'
            : '';

        const actions = shift.status === 'selling' ? `
            <div class="shift-actions">
                <button class="btn btn-success btn-complete">거래완료</button>
                <button class="btn btn-danger btn-cancel">취소</button>
            </div>
        ` : '';

        // 거래유형에 따라 카드에 구분 클래스 추가 (type-shift | type-dayoff)
        const cardTypeClass = shift.type === 'shift' ? 'type-shift' : 'type-dayoff';

        return `
            <div class="shift-card ${statusClass} ${cardTypeClass}" data-shift-id="${shift.id}">
                ${expiredBadge}
                <div class="shift-header">
                    <div class="user-info">
                        <span class="user-icon">👤</span>
                        <span class="user-name">${shift.name}</span>
                        <span class="user-role ${this.getRoleClass(shift.role)}">${shift.role}</span>
                    </div>
                    <div class="shift-type">${typeIcon} ${typeText}</div>
                </div>
                ${cardContent}
                ${shift.reason ? `<div class="shift-reason">💬 ${shift.reason}</div>` : ''}
                <div class="shift-footer">
                    <div class="shift-date">${this.formatDate(shift.createdAt)}</div>
                    ${actions}
                </div>
            </div>
        `;
    }

    // 역할 뱃지 클래스 매핑
    getRoleClass(role) {
        const key = String(role || '').toLowerCase();
        if (key === 'ts') return 'role-ts';
        if (key === 'te') return 'role-te';
        if (key === 'genius') return 'role-genius';
        return '';
    }

    // 아이템 포맷팅
    formatItem(item, type) {
        if (type === 'shift') {
            const [date, time] = item.split(' ');
            const formattedDate = new Date(date).toLocaleDateString('ko-KR', {
                month: 'long',
                day: 'numeric'
            });
            return `${formattedDate} ${time}`;
        } else {
            return new Date(item).toLocaleDateString('ko-KR', {
                month: 'long',
                day: 'numeric'
            });
        }
    }

    // 시프트 상세 정보 표시
    showShiftDetail(shiftId) {
        const shift = this.shifts.find(s => s.id === shiftId);
        if (!shift) return;

        const detailContainer = document.getElementById('shiftDetail');
        const typeText = shift.type === 'shift' ? '시프트 스왑' : '휴무 스왑';
        const typeIcon = shift.type === 'shift' ? '🔄' : '📅';
        
        detailContainer.innerHTML = `
            <div class="detail-item">
                <div class="detail-label">등록자</div>
                <div class="detail-value">${shift.name}</div>
            </div>
            <div class="detail-item">
                <div class="detail-label">거래 유형</div>
                <div class="detail-value">${typeIcon} ${typeText}</div>
            </div>
            <div class="detail-item">
                <div class="detail-label">${shift.type === 'shift' ? '파는 시프트' : '파는 휴무'}</div>
                <div class="detail-value">${this.formatItem(shift.sellingItem, shift.type)}</div>
            </div>
            <div class="detail-item">
                <div class="detail-label">${shift.type === 'shift' ? '사는 시프트' : '사는 휴무'}</div>
                <div class="detail-value">${this.formatItem(shift.buyingItem, shift.type)}</div>
            </div>
            ${shift.reason ? `
            <div class="detail-item">
                <div class="detail-label">사유</div>
                <div class="detail-value">${shift.reason}</div>
            </div>
            ` : ''}
            <div class="detail-item">
                <div class="detail-label">등록일</div>
                <div class="detail-value">${this.formatDate(shift.createdAt)}</div>
            </div>
            ${shift.status === 'selling' ? `
            <div class="detail-actions">
                <button class="btn btn-success" onclick="firebaseApp.showConfirmModal('${shift.id}')">거래완료</button>
                <button class="btn btn-danger" onclick="firebaseApp.cancelShift('${shift.id}')">취소</button>
            </div>
            ` : ''}
        `;

        this.showModal('shiftDetailModal');
    }

    // 확인 모달 표시
    showConfirmModal(shiftId) {
        this.selectedShiftId = shiftId;
        this.showModal('confirmModal');
    }

    // 거래 완료 처리
    async completeShift() {
        if (!this.selectedShiftId) return;

        try {
            if (this.isLocalMode) {
                // 로컬 모드
                const shift = this.shifts.find(s => s.id === this.selectedShiftId);
                if (shift) {
                    shift.status = 'completed';
                    shift.completedAt = new Date().toISOString();
                    this.saveToLocalStorage();
                    this.renderShifts();
                    this.updateTabCounts();
                    this.showNotification('거래가 완료되었습니다! (로컬 모드)', 'success');
                }
            } else {
                // Firebase 모드
                await database.ref(`shifts/${this.selectedShiftId}`).update({
                    status: 'completed',
                    completedAt: new Date().toISOString()
                });
                this.showNotification('거래가 완료되었습니다!', 'success');
            }
            this.hideModal('confirmModal');
            this.selectedShiftId = null;
        } catch (error) {
            console.error('거래 완료 실패:', error);
            this.showNotification('거래 완료에 실패했습니다. 다시 시도해주세요.', 'error');
        }
    }

    // 시프트 취소 처리
    async cancelShift(shiftId) {
        const shift = this.shifts.find(s => s.id === shiftId);
        if (!shift) return;

        if (confirm(`정말로 이 거래를 취소하시겠습니까?

거래 정보:
- 등록자: ${shift.name}
- 거래 ID: ${shift.id}`)) {
            try {
                if (this.isLocalMode) {
                    // 로컬 모드
                    shift.status = 'cancelled';
                    shift.cancelledAt = new Date().toISOString();
                    this.saveToLocalStorage();
                    this.renderShifts();
                    this.updateTabCounts();
                    this.showNotification('거래가 취소되었습니다. (로컬 모드)', 'info');
                } else {
                    // Firebase 모드
                    await database.ref(`shifts/${shiftId}`).update({
                        status: 'cancelled',
                        cancelledAt: new Date().toISOString()
                    });
                    this.showNotification('거래가 취소되었습니다.', 'info');
                }
            } catch (error) {
                console.error('거래 취소 실패:', error);
                this.showNotification('거래 취소에 실패했습니다. 다시 시도해주세요.', 'error');
            }
        }
    }

    // 탭 카운트 업데이트
    updateTabCounts() {
        const counts = {
            selling: this.shifts.filter(s => s.status === 'selling').length,
            completed: this.shifts.filter(s => s.status === 'completed').length,
            cancelled: this.shifts.filter(s => s.status === 'cancelled').length
        };

        document.getElementById('sellingCount').textContent = counts.selling;
        document.getElementById('completedCount').textContent = counts.completed;
        document.getElementById('cancelledCount').textContent = counts.cancelled;
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

    // 날짜 포맷팅
    formatDate(dateString) {
        const date = new Date(dateString);
        const now = new Date();
        const diffTime = Math.abs(now - date);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        
        if (diffDays === 1) {
            return '오늘';
        } else if (diffDays === 2) {
            return '어제';
        } else if (diffDays <= 7) {
            return `${diffDays - 1}일 전`;
        } else {
            return date.toLocaleDateString('ko-KR', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
            });
        }
    }

    // 알림 표시
    showNotification(message, type = 'info') {
        const notification = document.getElementById('notification');
        notification.textContent = message;
        notification.className = `notification ${type} show`;
        
        setTimeout(() => {
            notification.classList.remove('show');
        }, 3000);
    }

    // 개발용: 데이터 초기화
    async clearData() {
        if (confirm('정말로 모든 데이터를 삭제하시겠습니까?')) {
            try {
                await database.ref('shifts').remove();
                this.showNotification('모든 데이터가 삭제되었습니다.', 'info');
            } catch (error) {
                console.error('데이터 삭제 실패:', error);
                this.showNotification('데이터 삭제에 실패했습니다.', 'error');
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
                    this.shifts.unshift(shift);
                }
                this.saveToLocalStorage();
                this.renderShifts();
                this.updateTabCounts();
                this.showNotification('샘플 데이터가 추가되었습니다! (로컬 모드)', 'success');
            } else {
                // Firebase 모드
                for (const shift of sampleShifts) {
                    await database.ref('shifts').push().set(shift);
                }
                this.showNotification('샘플 데이터가 추가되었습니다!', 'success');
            }
        } catch (error) {
            console.error('샘플 데이터 추가 실패:', error);
            this.showNotification('샘플 데이터 추가에 실패했습니다.', 'error');
        }
    }
}

// 애플리케이션 시작
const firebaseApp = new FirebaseShiftSwapApp();

// 개발용: 콘솔에서 firebaseApp.clearData() 호출로 데이터 초기화 가능
// 샘플 데이터 추가: firebaseApp.addSampleData()
console.log('가로수길 스케줄 스왑 앱이 시작되었습니다.');
console.log('- firebaseApp.clearData()로 데이터를 초기화할 수 있습니다.');
console.log('- firebaseApp.addSampleData()로 샘플 데이터를 추가할 수 있습니다.');
