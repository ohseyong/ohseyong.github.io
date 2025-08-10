// 시프트 스왑 애플리케이션
class ShiftSwapApp {
    constructor() {
        this.shifts = this.loadShifts();
        this.currentTab = 'selling';
        this.selectedShiftId = null;
        
        // 샘플 데이터 추가 (처음 실행 시에만)
        if (this.shifts.length === 0) {
            this.addSampleData();
        }
        
        this.init();
    }

    // 샘플 데이터 추가
    addSampleData() {
        const sampleShifts = [
            {
                id: '1',
                name: '김영희',
                type: 'sell',
                sellingShift: '12월 15일 오후 2시-10시',
                buyingShift: '12월 16일 오전 9시-5시',
                reason: '개인 일정으로 인해 시프트 변경이 필요합니다.',
                status: 'selling',
                createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString()
            },
            {
                id: '2',
                name: '박철수',
                type: 'buy',
                sellingShift: '12월 17일 오전 9시-5시',
                buyingShift: '12월 18일 오후 2시-10시',
                reason: '병원 예약이 있어서 시프트를 바꿔주세요.',
                status: 'selling',
                createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString()
            },
            {
                id: '3',
                name: '이미영',
                type: 'sell',
                sellingShift: '12월 20일 오후 2시-10시',
                buyingShift: '12월 21일 오전 9시-5시',
                reason: '',
                status: 'completed',
                createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
                completedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString()
            },
            {
                id: '4',
                name: '최민수',
                type: 'buy',
                sellingShift: '12월 22일 오전 9시-5시',
                buyingShift: '12월 23일 오후 2시-10시',
                reason: '가족 행사가 있어서 시프트 변경 부탁드립니다.',
                status: 'cancelled',
                createdAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
                cancelledAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString()
            }
        ];

        this.shifts = sampleShifts;
        this.saveShifts();
    }

    // 로컬 스토리지에서 시프트 데이터 로드
    loadShifts() {
        const saved = localStorage.getItem('shiftSwapData');
        return saved ? JSON.parse(saved) : [];
    }

    // 로컬 스토리지에 시프트 데이터 저장
    saveShifts() {
        localStorage.setItem('shiftSwapData', JSON.stringify(this.shifts));
    }

    // 애플리케이션 초기화
    init() {
        this.bindEvents();
        this.renderShifts();
        this.updateTabCounts();
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
        document.getElementById('shiftForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.addShift();
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
            this.completeShift();
        });
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

    // 시프트 추가
    addShift() {
        const formData = new FormData(document.getElementById('shiftForm'));
        const shift = {
            id: Date.now().toString(),
            name: formData.get('name'),
            type: formData.get('type'),
            sellingShift: formData.get('sellingShift'),
            buyingShift: formData.get('buyingShift'),
            reason: formData.get('reason') || '',
            status: 'selling',
            createdAt: new Date().toISOString()
        };

        this.shifts.unshift(shift);
        this.saveShifts();
        this.renderShifts();
        this.updateTabCounts();
        this.hideModal('addShiftModal');
        this.resetForm();
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
                <button class="btn btn-success" onclick="app.showConfirmModal('${shift.id}')">거래완료</button>
                <button class="btn btn-danger" onclick="app.cancelShift('${shift.id}')">취소</button>
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
    completeShift() {
        if (!this.selectedShiftId) return;
        
        const shiftIndex = this.shifts.findIndex(s => s.id === this.selectedShiftId);
        if (shiftIndex !== -1) {
            this.shifts[shiftIndex].status = 'completed';
            this.shifts[shiftIndex].completedAt = new Date().toISOString();
            this.saveShifts();
            this.renderShifts();
            this.updateTabCounts();
        }
        
        this.hideModal('confirmModal');
        this.selectedShiftId = null;
    }

    // 시프트 취소 처리
    cancelShift(shiftId) {
        if (confirm('정말로 이 시프트를 취소하시겠습니까?')) {
            const shiftIndex = this.shifts.findIndex(s => s.id === shiftId);
            if (shiftIndex !== -1) {
                this.shifts[shiftIndex].status = 'cancelled';
                this.shifts[shiftIndex].cancelledAt = new Date().toISOString();
                this.saveShifts();
                this.renderShifts();
                this.updateTabCounts();
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

    // 데이터 초기화 (개발용)
    clearData() {
        if (confirm('모든 데이터를 삭제하시겠습니까?')) {
            this.shifts = [];
            this.saveShifts();
            this.renderShifts();
            this.updateTabCounts();
        }
    }
}

// 애플리케이션 시작
const app = new ShiftSwapApp();

// 개발용: 콘솔에서 app.clearData() 호출로 데이터 초기화 가능
console.log('시프트 스왑 앱이 시작되었습니다. app.clearData()로 데이터를 초기화할 수 있습니다.');
