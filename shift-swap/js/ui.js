// UI 관련 기능들을 담당하는 클래스
class ShiftSwapUI {
    constructor(app) {
        this.app = app;
        this.init();
    }

    init() {
        this.setupTypeTabs();
        this.setupShiftButtons();
        this.setupRoleButtons();
        this.setupRoleFilters();
        this.setupTypeFilters();
        this.setMinDates();
        this.setupHeaderTitleClick();
        
        // 알림 설정은 DOM이 완전히 로드된 후 바인딩
        setTimeout(() => {
            this.bindNotificationSettings();
        }, 100);
    }

    // 거래 유형 탭 설정
    setupTypeTabs() {
        const typeTabs = document.querySelectorAll('.type-tab');
        typeTabs.forEach(tab => {
            tab.addEventListener('click', () => {
                this.app.switchSwapType(tab.dataset.type);
            });
        });
    }

    // 시프트 버튼 설정
    setupShiftButtons() {
        document.querySelectorAll('.shift-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const shiftButtons = e.target.closest('.shift-buttons');
                const hiddenInput = shiftButtons?.nextElementSibling;
                
                if (shiftButtons && hiddenInput) {
                    // 구하는 시프트 버튼인지 확인
                    if (shiftButtons.classList.contains('buying-shift-buttons')) {
                        // 다중 선택 로직
                        e.target.classList.toggle('active');
                        this.updateSelectedShiftsDisplay();
                    } else {
                        // 파는 시프트는 단일 선택
                        shiftButtons.querySelectorAll('.shift-btn').forEach(b => b.classList.remove('active'));
                        e.target.classList.add('active');
                        hiddenInput.value = e.target.dataset.shift;
                    }
                }
            });
        });
    }

    // 선택된 시프트 표시 업데이트
    updateSelectedShiftsDisplay() {
        const buyingButtons = document.querySelector('.buying-shift-buttons');
        const hiddenInput = document.getElementById('buyingShiftTime');
        const displayDiv = document.getElementById('selectedShiftsDisplay');
        const listDiv = document.getElementById('selectedShiftsList');
        
        if (!buyingButtons || !hiddenInput || !displayDiv || !listDiv) return;
        
        const selectedShifts = Array.from(buyingButtons.querySelectorAll('.shift-btn.active'))
            .map(btn => btn.dataset.shift);
        
        if (selectedShifts.length > 0) {
            // 선택된 시프트들을 표시
            listDiv.innerHTML = selectedShifts.map(shift => 
                `<span class="selected-shift-tag">${shift}</span>`
            ).join('');
            displayDiv.style.display = 'block';
            
            // hidden input에 선택된 시프트들을 JSON 배열로 저장
            hiddenInput.value = JSON.stringify(selectedShifts);
        } else {
            displayDiv.style.display = 'none';
            hiddenInput.value = '';
        }
    }

    // 역할 버튼 설정
    setupRoleButtons() {
        document.querySelectorAll('.role-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const roleButtons = e.target.closest('.role-buttons');
                const hiddenInput = roleButtons?.nextElementSibling;
                
                if (roleButtons && hiddenInput) {
                    roleButtons.querySelectorAll('.role-btn').forEach(b => b.classList.remove('active'));
                    e.target.classList.add('active');
                    hiddenInput.value = e.target.dataset.role;
                }
            });
        });
    }

    // 역할 필터 설정
    setupRoleFilters() {
        const container = document.querySelector('.role-filter');
        if (!container) return;

        container.addEventListener('click', (e) => {
            const btn = e.target.closest('.role-filter-btn');
            if (!btn) return;

            const role = btn.dataset.role;
            
            // 토글 기능: 이미 선택된 필터를 다시 클릭하면 해제
            if (this.app.currentRoleFilter === role) {
                this.app.currentRoleFilter = 'all';
                btn.classList.remove('active');
            } else {
                // 다른 필터가 선택되어 있으면 해제하고 새 필터 선택
                container.querySelectorAll('.role-filter-btn').forEach(b => b.classList.remove('active'));
                this.app.currentRoleFilter = role;
                btn.classList.add('active');
            }
            
            this.app.renderShifts();
        });
    }

    // 거래 유형 필터 설정
    setupTypeFilters() {
        const container = document.querySelector('.type-filter');
        if (!container) return;
        
        container.addEventListener('click', (e) => {
            const btn = e.target.closest('.type-filter-btn');
            if (!btn) return;

            const type = btn.dataset.type;
            
            // 토글 기능: 이미 선택된 필터를 다시 클릭하면 해제
            if (this.app.currentTypeFilter === type) {
                this.app.currentTypeFilter = 'all';
                btn.classList.remove('active');
            } else {
                // 다른 필터가 선택되어 있으면 해제하고 새 필터 선택
                container.querySelectorAll('.type-filter-btn').forEach(b => b.classList.remove('active'));
                this.app.currentTypeFilter = type;
                btn.classList.add('active');
            }
            
            this.app.renderShifts();
        });
    }

    // 알림 설정 모달 바인딩
    bindNotificationSettings() {
        console.log('알림 설정 바인딩 시작...');
        
        const openBtn = document.getElementById('openNotificationSettings');
        const modal = document.getElementById('notificationSettingsModal');
        
        console.log('찾은 요소들:', { openBtn, modal });
        
        if (!openBtn) {
            console.error('알림 설정 버튼을 찾을 수 없습니다!');
            return;
        }
        
        if (!modal) {
            console.error('알림 설정 모달을 찾을 수 없습니다!');
            return;
        }

        const closeBtn = document.getElementById('closeNotificationSettings');
        const closeFooterBtn = document.getElementById('closeNotificationSettingsFooter');
        const overlay = modal.querySelector('.modal-overlay');
        const statusSpan = document.getElementById('notificationPermissionStatus');
        const requestBtn = document.getElementById('requestNotificationPermission');
        const roleBtns = modal.querySelectorAll('#notificationRoleButtons .role-btn');
        const saveBtn = document.getElementById('saveNotificationPrefs');

        console.log('모달 내부 요소들:', { closeBtn, closeFooterBtn, overlay, statusSpan, requestBtn, roleBtns: roleBtns.length, saveBtn });

        const updateStatus = () => {
            if (!('Notification' in window)) {
                if (statusSpan) statusSpan.textContent = '권한 상태: 지원되지 않음';
                return;
            }
            if (statusSpan) statusSpan.textContent = `권한 상태: ${Notification.permission}`;
        };

        const show = () => { 
            console.log('알림 설정 모달 열기 시도');
            try {
                this.app.showModal('notificationSettingsModal'); 
                updateStatus(); 
                console.log('알림 설정 모달 열기 성공');
            } catch (error) {
                console.error('모달 열기 실패:', error);
            }
        };
        
        const hide = () => { 
            console.log('알림 설정 모달 닫기');
            try {
                this.app.hideModal('notificationSettingsModal'); 
            } catch (error) {
                console.error('모달 닫기 실패:', error);
            }
        };

        // 기존 이벤트 리스너 제거 (중복 방지)
        openBtn.removeEventListener('click', show);
        
        // 이벤트 리스너 등록
        openBtn.addEventListener('click', (e) => { 
            e.preventDefault(); 
            e.stopPropagation(); 
            console.log('알림 설정 버튼 클릭됨!');
            show(); 
        });
        
        if (closeBtn) {
            closeBtn.removeEventListener('click', hide);
            closeBtn.addEventListener('click', hide);
        }
        
        if (closeFooterBtn) {
            closeFooterBtn.removeEventListener('click', hide);
            closeFooterBtn.addEventListener('click', hide);
        }
        
        if (overlay) {
            overlay.removeEventListener('click', hide);
            overlay.addEventListener('click', (e) => { 
                if (e.target === overlay) hide(); 
            });
        }

        if (requestBtn) {
            requestBtn.removeEventListener('click', updateStatus);
            requestBtn.addEventListener('click', async () => {
                try {
                    if (!('Notification' in window)) return;
                    const permission = await Notification.requestPermission();
                    updateStatus();
                    
                    // 권한이 허용된 경우 Firebase Messaging 재설정
                    if (permission === 'granted') {
                        console.log('알림 권한이 허용되었습니다. Firebase Messaging을 재설정합니다.');
                        await this.app.firebaseService.setupFirebaseMessaging();
                        this.app.showNotification('알림 권한이 허용되었습니다!', 'success');
                    } else {
                        this.app.showNotification('알림 권한이 거부되었습니다.', 'error');
                    }
                } catch (error) {
                    console.error('알림 권한 요청 실패:', error);
                    this.app.showNotification('알림 권한 요청에 실패했습니다.', 'error');
                }
            });
        }

        roleBtns.forEach(btn => {
            btn.removeEventListener('click', () => btn.classList.toggle('active'));
            btn.addEventListener('click', () => btn.classList.toggle('active'));
        });

        if (saveBtn) {
            saveBtn.removeEventListener('click', () => {});
            saveBtn.addEventListener('click', () => {
                const selected = Array.from(roleBtns).filter(b => b.classList.contains('active')).map(b => b.dataset.role);
                try { 
                    localStorage.setItem('notificationRoles', JSON.stringify(selected)); 
                    console.log('알림 설정 저장됨:', selected);
                } catch (error) {
                    console.error('알림 설정 저장 실패:', error);
                }
                this.app.showNotification('알림 설정이 저장되었습니다.', 'success');
                hide();
            });
        }
        
        console.log('알림 설정 바인딩 완료!');
    }

    // 최소 날짜 설정
    setMinDates() {
        const today = new Date().toISOString().split('T')[0];
        const dateInputs = document.querySelectorAll('input[type="date"]');
        dateInputs.forEach(input => {
            input.min = today;
        });
    }

    // 거래 유형 전환
    switchSwapType(type) {
        this.app.currentSwapType = type;
        
        document.querySelectorAll('.type-tab').forEach(tab => {
            tab.classList.remove('active');
        });
        const targetTab = document.querySelector(`.type-tabs [data-type="${type}"]`);
        if (targetTab) targetTab.classList.add('active');
        
        const shiftFields = document.getElementById('shiftFields');
        const dayoffFields = document.getElementById('dayoffFields');
        
        if (type === 'shift') {
            shiftFields.style.display = 'block';
            dayoffFields.style.display = 'none';
            
            document.querySelectorAll('#shiftFields input[required]').forEach(input => {
                input.required = true;
            });
            document.querySelectorAll('#dayoffFields input[required]').forEach(input => {
                input.required = false;
            });
        } else {
            shiftFields.style.display = 'none';
            dayoffFields.style.display = 'block';
            
            document.querySelectorAll('#dayoffFields input[required]').forEach(input => {
                input.required = true;
            });
            document.querySelectorAll('#shiftFields input[required]').forEach(input => {
                input.required = false;
            });
        }
    }

    // 시프트 렌더링
    renderShifts() {
        const shiftList = document.getElementById('shiftList');
        const emptyState = document.getElementById('emptyState');
        
        let filteredShifts = this.app.shifts.filter(shift => shift.status === this.app.currentTab);
        
        if (this.app.currentRoleFilter !== 'all') {
            filteredShifts = filteredShifts.filter(shift => shift.role === this.app.currentRoleFilter);
        }
        if (this.app.currentTypeFilter !== 'all') {
            filteredShifts = filteredShifts.filter(shift => shift.type === this.app.currentTypeFilter);
        }
        
        // 매칭된 카드를 최상단에 정렬
        filteredShifts.sort((a, b) => {
            const aMatched = a.calendarMatch?.hasMatch || false;
            const bMatched = b.calendarMatch?.hasMatch || false;
            
            if (aMatched && !bMatched) return -1;
            if (!aMatched && bMatched) return 1;
            
            // 둘 다 매칭되거나 둘 다 매칭되지 않은 경우 날짜순 정렬
            return this.getSellingDateForSort(a) - this.getSellingDateForSort(b);
        });
        
        if (filteredShifts.length === 0) {
            shiftList.innerHTML = '';
            emptyState.style.display = 'block';
            return;
        }

        emptyState.style.display = 'none';
        shiftList.innerHTML = filteredShifts.map(shift => this.createShiftCard(shift)).join('');
        
        this.bindShiftCardEvents();
    }

    // 시프트 카드 이벤트 바인딩
    bindShiftCardEvents() {
        document.querySelectorAll('.shift-card').forEach(card => {
            card.addEventListener('click', (e) => {
                if (!e.target.closest('.shift-actions')) {
                    const shiftId = card.dataset.shiftId;
                    this.showShiftDetail(shiftId);
                }
            });
        });

        document.querySelectorAll('.btn-complete').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const shiftId = btn.closest('.shift-card').dataset.shiftId;
                const ok = confirm('거래는 당사자간 연락을 통해 진행하시고, 거래 성사 시 "거래완료" 버튼을 눌러주세요.\n거래 당사자인 경우에만 거래완료 처리를 부탁드립니다.\n\n계속하시겠습니까?');
                if (ok) this.app.showConfirmModal(shiftId);
            });
        });

        document.querySelectorAll('.btn-cancel').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const shiftId = btn.closest('.shift-card').dataset.shiftId;
                const ok = confirm('거래 요청이 완전히 삭제됩니다. 계속합니까?\n올린 당사자인 경우에만 삭제하세요. 타인의 매물을 삭제하지 말아주세요!');
                if (ok) this.app.cancelShift(shiftId);
            });
        });
    }

    // 시프트 카드 생성
    createShiftCard(shift) {
        const statusClass = shift.status === 'completed' ? 'completed' : 
                           shift.status === 'cancelled' ? 'cancelled' : '';
        
        const typeText = shift.type === 'shift' ? '시프트 스왑' : '휴무 스왑';
        const typeIcon = shift.type === 'shift' ? '🔄' : '📅';
        
        let cardContent = '';
        if (shift.type === 'shift') {
            const [date, sellingShift] = shift.sellingItem.split(' ');
            const formattedDate = new Date(date).toLocaleDateString('ko-KR', {
                month: 'long',
                day: 'numeric'
            });
            
            // 구하는 시프트 처리 - JSON 배열인지 먼저 확인
            let buyingShiftsDisplay = '';
            
            // JSON 배열인지 확인 (대괄호로 시작하는지)
            if (shift.buyingItem && shift.buyingItem.trim().startsWith('[')) {
                try {
                    const buyingShifts = JSON.parse(shift.buyingItem);
                    if (Array.isArray(buyingShifts) && buyingShifts.length > 1) {
                        // 다중 선택된 경우, 한 줄에 모든 시프트를 표시
                        buyingShiftsDisplay = buyingShifts.map(shift => 
                            `<span class="pill pill-buying pill-multiple">${shift}</span>`
                        ).join(' ');
                    } else if (Array.isArray(buyingShifts) && buyingShifts.length === 1) {
                        // 단일 선택된 경우
                        buyingShiftsDisplay = `<span class="pill pill-buying">${buyingShifts[0]}</span>`;
                    } else {
                        // 빈 배열인 경우
                        buyingShiftsDisplay = `<span class="pill pill-buying">선택된 시프트 없음</span>`;
                    }
                } catch (e) {
                    // JSON 파싱 실패 시 기존 방식으로 fallback
                    const [_, buyingShift] = shift.buyingItem.split(' ');
                    buyingShiftsDisplay = `<span class="pill pill-buying">${buyingShift || '알 수 없음'}</span>`;
                }
            } else {
                // 기존 방식: 날짜와 시프트 분리
                const [_, buyingShift] = shift.buyingItem.split(' ');
                buyingShiftsDisplay = `<span class="pill pill-buying">${buyingShift || '알 수 없음'}</span>`;
            }
            
            const headlineHtml = `
                <div class="shift-headline">
                    <span class="date-plain">${formattedDate}</span>
                    <span class="pill pill-selling">${sellingShift}</span>
                    <span class="postposition">로</span>
                    <span class="arrow">→</span>
                    ${buyingShiftsDisplay}
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
            
        // 캘린더 매칭 결과 표시 (매칭된 경우만)
        const calendarMatchBadge = (shift.calendarMatch?.hasMatch && shift.status === 'selling')
            ? `<span class="calendar-match">${shift.calendarMatch.isDayOff ? '내가 가지고 있는 휴무에요!' : '내가 가지고 있는 스케줄이에요!'}</span>`
            : '';

        const actions = shift.status === 'selling' ? `
            <div class="shift-actions">
                <button class="btn btn-success btn-complete">거래완료</button>
                <button class="btn btn-danger btn-cancel">거래취소</button>
            </div>
        ` : '';

        const cardTypeClass = shift.type === 'shift' ? 'type-shift' : 'type-dayoff';

        const matchedClass = (shift.calendarMatch?.hasMatch && shift.status === 'selling') ? ' matched' : '';
        
        return `
            <div class="shift-card ${statusClass} ${cardTypeClass}${matchedClass}" data-shift-id="${shift.id}">
                ${expiredBadge}
                <div class="shift-header">
                    <div class="user-info">
                        <span class="user-icon">👤</span>
                        <span class="user-name">${shift.name}</span>
                        <span class="user-role ${this.getRoleClass(shift.role)}">${shift.role}</span>
                    </div>
                    <div class="header-right">
                        <div class="shift-type">${typeIcon} ${typeText}</div>
                        <div class="shift-date">${this.formatDate(shift.createdAt)}</div>
                    </div>
                </div>
                ${cardContent}
                ${shift.reason ? `<div class="shift-reason">💬 ${shift.reason}</div>` : ''}
                <div class="shift-footer">
                    <div class="shift-footer-left">
                        ${calendarMatchBadge}
                    </div>
                    <div class="shift-footer-right">
                        ${actions}
                    </div>
                </div>
            </div>
        `;
    }

    // 시프트 상세 정보 표시
    showShiftDetail(shiftId) {
        const shift = this.app.shifts.find(s => s.id === shiftId);
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
                <div class="detail-label">메모</div>
                <div class="detail-value">${shift.reason}</div>
            </div>
            ` : ''}
            <div class="detail-item">
                <div class="detail-label">등록일</div>
                <div class="detail-value">${this.formatDate(shift.createdAt)}</div>
            </div>
            ${shift.status === 'selling' ? `
            <div class="detail-actions">
                <button class="btn btn-success" onclick="shiftSwapApp.showConfirmModal('${shift.id}')">거래완료</button>
                <button class="btn btn-danger" onclick="shiftSwapApp.cancelShift('${shift.id}')">취소</button>
            </div>
            ` : ''}
        `;

        this.app.showModal('shiftDetailModal');
    }

    // 탭 카운트 업데이트
    updateTabCounts() {
        const counts = {
            selling: this.app.shifts.filter(s => s.status === 'selling').length,
            completed: this.app.shifts.filter(s => s.status === 'completed').length,
            cancelled: this.app.shifts.filter(s => s.status === 'cancelled').length
        };

        document.getElementById('sellingCount').textContent = counts.selling;
        document.getElementById('completedCount').textContent = counts.completed;
        document.getElementById('cancelledCount').textContent = counts.cancelled;
    }

    // 연결 상태 업데이트
    updateConnectionStatus(connected, showToast = true) {
        const statusElement = document.getElementById('connectionStatus');
        const indicator = statusElement.querySelector('.status-indicator');
        const text = statusElement.querySelector('.status-text');
        
        if (connected) {
            indicator.className = 'status-indicator online';
            text.textContent = '실시간 연결됨';
            
            // 초기 로딩 시에는 토스트를 표시하지 않음
            if (showToast) {
                this.app.showNotification('연결됨', 'info', 1500);
            }
            statusElement.classList.remove('show');

        } else {
            indicator.className = 'status-indicator offline';
            text.textContent = '연결 끊김';
            // 연결 끊김 시 상단 바만 표시하고 토스트는 표시하지 않음
            statusElement.classList.add('show');
        }
    }

    // 유틸리티 메서드들
    getRoleClass(role) {
        const key = String(role || '').toLowerCase();
        if (key === 'ts') return 'role-ts';
        if (key === 'te') return 'role-te';
        if (key === 'genius') return 'role-genius';
        return '';
    }

    formatItem(item, type) {
        if (type === 'shift') {
            // JSON 배열인지 확인 (대괄호로 시작하는지)
            if (item && item.trim().startsWith('[')) {
                try {
                    const buyingShifts = JSON.parse(item);
                    if (Array.isArray(buyingShifts) && buyingShifts.length > 0) {
                        // 다중 선택된 경우, 모든 시프트를 표시
                        if (buyingShifts.length === 1) {
                            return buyingShifts[0];
                        } else {
                            return buyingShifts.join(', ');
                        }
                    }
                } catch (e) {
                    // JSON 파싱 실패 시 기존 방식 사용
                }
            }
            
            // 기존 방식: 날짜와 시프트 분리
            const [date, time] = item.split(' ');
            if (date && time) {
                const formattedDate = new Date(date).toLocaleDateString('ko-KR', {
                    month: 'long',
                    day: 'numeric'
                });
                return `${formattedDate} ${time}`;
            } else {
                return item || '알 수 없음'; // 파싱 실패 시 원본 반환
            }
        } else {
            return new Date(item).toLocaleDateString('ko-KR', {
                month: 'long',
                day: 'numeric'
            });
        }
    }

    formatDate(dateString) {
        const date = new Date(dateString);
        const month = date.getMonth() + 1;
        const day = date.getDate();
        return `${month}/${day} 등록`;
    }

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

    // 새로고침 실행
    async triggerRefresh() {
        try {
            // Firebase 데이터 새로고침
            if (this.app.firebaseService && !this.app.firebaseService.isLocalMode) {
                // Firebase 리스너가 자동으로 데이터를 새로고침함
                console.log('Firebase 데이터 새로고침 중...');
            }
            
            // 캘린더 동기화
            if (this.app.calendarService) {
                await this.app.calendarService.autoSync();
            }
            
            // UI 새로고침
            this.app.renderShifts();
            this.app.updateTabCounts();
            
            // 성공 메시지
            this.app.showNotification('새로고침이 완료되었습니다!', 'success');
            
        } catch (error) {
            console.error('새로고침 실패:', error);
            this.app.showNotification('새로고침 중 오류가 발생했습니다.', 'error');
        }
    }

    // 헤더 제목 클릭 설정
    setupHeaderTitleClick() {
        const headerTitle = document.getElementById('headerTitle');
        if (!headerTitle) return;

        headerTitle.addEventListener('click', () => {
            this.triggerRefresh();
        });
    }
}
