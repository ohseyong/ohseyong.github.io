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
        this.bindNotificationSettings();
        this.setMinDates();
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
                const hiddenInput = shiftButtons.nextElementSibling;
                
                shiftButtons.querySelectorAll('.shift-btn').forEach(b => b.classList.remove('active'));
                e.target.classList.add('active');
                hiddenInput.value = e.target.dataset.shift;
            });
        });
    }

    // 역할 버튼 설정
    setupRoleButtons() {
        document.querySelectorAll('.role-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const roleButtons = e.target.closest('.role-buttons');
                const hiddenInput = roleButtons.nextElementSibling;
                
                roleButtons.querySelectorAll('.role-btn').forEach(b => b.classList.remove('active'));
                e.target.classList.add('active');
                hiddenInput.value = e.target.dataset.role;
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
            this.app.currentRoleFilter = role;

            container.querySelectorAll('.role-filter-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            
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
            this.app.currentTypeFilter = type;

            container.querySelectorAll('.type-filter-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            
            this.app.renderShifts();
        });
    }

    // 알림 설정 모달 바인딩
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

        const show = () => { this.app.showModal('notificationSettingsModal'); updateStatus(); };
        const hide = () => { this.app.hideModal('notificationSettingsModal'); };

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
            this.app.showNotification('알림 설정이 저장되었습니다.', 'success');
            hide();
        });
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
        
        filteredShifts.sort((a, b) => this.getSellingDateForSort(a) - this.getSellingDateForSort(b));
        
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
    updateConnectionStatus(connected) {
        const statusElement = document.getElementById('connectionStatus');
        const indicator = statusElement.querySelector('.status-indicator');
        const text = statusElement.querySelector('.status-text');
        
        if (connected) {
            indicator.className = 'status-indicator online';
            text.textContent = '실시간 연결됨';
            
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
}
