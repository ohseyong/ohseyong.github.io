// 간단한 시프트 스왑 애플리케이션 (JSON 파일 기반)
class SimpleShiftSwapApp {
    constructor() {
        this.shifts = [];
        this.currentTab = 'selling';
        this.selectedShiftId = null;
        this.lastUpdateTime = null;
        
        this.init();
    }

    // 애플리케이션 초기화
    async init() {
        this.bindEvents();
        await this.loadShifts();
        this.renderShifts();
        this.updateTabCounts();
        
        // 주기적으로 데이터 확인 (5분마다)
        setInterval(() => this.checkForUpdates(), 5 * 60 * 1000);
    }

    // JSON 파일에서 시프트 데이터 로드
    async loadShifts() {
        try {
            const response = await fetch('data/shifts.json');
            const data = await response.json();
            this.shifts = data.shifts || [];
            this.lastUpdateTime = data.lastUpdated;
        } catch (error) {
            console.error('시프트 데이터 로드 실패:', error);
            this.shifts = [];
        }
    }

    // 업데이트 확인
    async checkForUpdates() {
        try {
            const response = await fetch('data/shifts.json?t=' + Date.now());
            const data = await response.json();
            
            if (data.lastUpdated !== this.lastUpdateTime) {
                this.shifts = data.shifts || [];
                this.lastUpdateTime = data.lastUpdated;
                this.renderShifts();
                this.updateTabCounts();
                this.showRefreshNotice();
            }
        } catch (error) {
            console.error('업데이트 확인 실패:', error);
        }
    }

    // 새로고침 안내 표시
    showRefreshNotice() {
        const notice = document.getElementById('refreshNotice');
        notice.style.display = 'block';
    }

    // 이벤트 바인딩
    bindEvents() {
        // 탭 클릭 이벤트
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.switchTab(e.target.closest('.tab-btn').dataset.tab);
            });
        });

        // 새 시프트 등록 버튼
        document.getElementById('addShiftBtn').addEventListener('click', () => {
            this.showModal('addShiftModal');
        });

        // 모달 닫기 버튼들
        document.getElementById('closeModal').addEventListener('click', () => {
            this.hideModal('addShiftModal');
        });

        document.getElementById('closeDetailModal').addEventListener('click', () => {
            this.hideModal('shiftDetailModal');
        });

        document.getElementById('closeConfirmModal').addEventListener('click', () => {
            this.hideModal('confirmModal');
        });

        // 취소 버튼들
        document.getElementById('cancelBtn').addEventListener('click', () => {
            this.hideModal('addShiftModal');
        });

        document.getElementById('cancelConfirm').addEventListener('click', () => {
            this.hideModal('confirmModal');
        });

        // 폼 제출
        document.getElementById('shiftForm').addEventListener('click', (e) => {
            e.preventDefault();
            this.showAddInstructions();
        });

        // 모달 오버레이 클릭 시 닫기
        document.querySelectorAll('.modal-overlay').forEach(overlay => {
            overlay.addEventListener('click', (e) => {
                if (e.target === overlay) {
                    this.hideAllModals();
                }
            });
        });

        // 거래 완료 확인
        document.getElementById('confirmComplete').addEventListener('click', () => {
            this.showCompleteInstructions();
        });
    }

    // 시프트 등록 안내
    showAddInstructions() {
        alert(`새 시프트 등록 방법:

1. 관리자에게 연락하여 시프트 정보를 전달
2. 관리자가 JSON 파일을 업데이트
3. 페이지를 새로고침하여 확인

현재 시프트 정보:
- 이름: ${document.getElementById('name').value}
- 거래 유형: ${document.querySelector('input[name="type"]:checked').value === 'sell' ? '팝니다' : '삽니다'}
- 파는 시프트: ${document.getElementById('sellingShift').value}
- 구하는 시프트: ${document.getElementById('buyingShift').value}
- 사유: ${document.getElementById('reason').value || '없음'}

이 정보를 관리자에게 전달해주세요!`);
        
        this.hideModal('addShiftModal');
        this.resetForm();
    }

    // 거래 완료 안내
    showCompleteInstructions() {
        const shift = this.shifts.find(s => s.id === this.selectedShiftId);
        if (!shift) return;

        alert(`거래 완료 처리 방법:

1. 관리자에게 연락하여 거래 완료 요청
2. 시프트 ID: ${shift.id}
3. 등록자: ${shift.name}
4. 관리자가 JSON 파일을 업데이트
5. 페이지를 새로고침하여 확인

관리자에게 위 정보를 전달해주세요!`);
        
        this.hideModal('confirmModal');
        this.selectedShiftId = null;
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
        document.querySelector('input[name="type"][value="sell"]').checked = true;
    }

    // 시프트 렌더링
    renderShifts() {
        const shiftList = document.getElementById('shiftList');
        const emptyState = document.getElementById('emptyState');
        
        const filteredShifts = this.shifts.filter(shift => shift.status === this.currentTab);
        
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
                this.showConfirmModal(shiftId);
            });
        });

        document.querySelectorAll('.btn-cancel').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const shiftId = btn.closest('.shift-card').dataset.shiftId;
                this.cancelShift(shiftId);
            });
        });
    }

    // 시프트 카드 생성
    createShiftCard(shift) {
        const statusClass = shift.status === 'completed' ? 'completed' : 
                           shift.status === 'cancelled' ? 'cancelled' : '';
        
        const typeText = shift.type === 'sell' ? '팝니다' : '삽니다';
        const typeClass = shift.type === 'sell' ? 'sell' : 'buy';
        
        const actions = shift.status === 'selling' ? `
            <div class="shift-actions">
                <button class="btn btn-success btn-complete">거래완료</button>
                <button class="btn btn-danger btn-cancel">취소</button>
            </div>
        ` : '';

        return `
            <div class="shift-card ${statusClass}" data-shift-id="${shift.id}">
                <div class="shift-header">
                    <div class="shift-name">${shift.name}</div>
                    <div class="shift-type ${typeClass}">${typeText}</div>
                </div>
                <div class="shift-content">
                    <div class="shift-item">
                        <div class="shift-item-icon selling">📤</div>
                        <div class="shift-item-text">${shift.sellingShift}</div>
                    </div>
                    <div class="shift-item">
                        <div class="shift-item-icon buying">📥</div>
                        <div class="shift-item-text">${shift.buyingShift}</div>
                    </div>
                    ${shift.reason ? `<div class="shift-reason">💬 ${shift.reason}</div>` : ''}
                </div>
                <div class="shift-footer">
                    <div class="shift-date">${this.formatDate(shift.createdAt)}</div>
                    ${actions}
                </div>
            </div>
        `;
    }

    // 시프트 상세 정보 표시
    showShiftDetail(shiftId) {
        const shift = this.shifts.find(s => s.id === shiftId);
        if (!shift) return;

        const detailContainer = document.getElementById('shiftDetail');
        const typeText = shift.type === 'sell' ? '팝니다' : '삽니다';
        
        detailContainer.innerHTML = `
            <div class="detail-item">
                <div class="detail-label">등록자</div>
                <div class="detail-value">${shift.name}</div>
            </div>
            <div class="detail-item">
                <div class="detail-label">거래 유형</div>
                <div class="detail-value">${typeText}</div>
            </div>
            <div class="detail-item">
                <div class="detail-label">파는 시프트</div>
                <div class="detail-value">${shift.sellingShift}</div>
            </div>
            <div class="detail-item">
                <div class="detail-label">구하는 시프트</div>
                <div class="detail-value">${shift.buyingShift}</div>
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
                <button class="btn btn-success" onclick="simpleApp.showConfirmModal('${shift.id}')">거래완료</button>
                <button class="btn btn-danger" onclick="simpleApp.cancelShift('${shift.id}')">취소</button>
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

    // 시프트 취소 처리
    cancelShift(shiftId) {
        const shift = this.shifts.find(s => s.id === shiftId);
        if (!shift) return;

        if (confirm(`정말로 이 시프트를 취소하시겠습니까?

시프트 정보:
- 등록자: ${shift.name}
- 시프트 ID: ${shift.id}

관리자에게 취소 요청을 전달해주세요.`)) {
            alert('시프트 취소 요청이 완료되었습니다. 관리자가 처리 후 페이지를 새로고침하세요.');
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

    // 수동 새로고침
    refresh() {
        this.loadShifts().then(() => {
            this.renderShifts();
            this.updateTabCounts();
            document.getElementById('refreshNotice').style.display = 'none';
        });
    }
}

// 애플리케이션 시작
const simpleApp = new SimpleShiftSwapApp();

// 전역 함수로 새로고침 제공
window.refreshShifts = () => simpleApp.refresh();

console.log('간단한 시프트 스왑 앱이 시작되었습니다. 5분마다 자동으로 업데이트를 확인합니다.');
