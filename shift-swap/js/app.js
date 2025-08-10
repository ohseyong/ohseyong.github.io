// 시프트 스왑 애플리케이션
class ShiftSwapApp {
    constructor() {
        this.shifts = this.loadShifts();
        this.currentTab = 'selling';
        this.selectedShiftId = null;
        this.currentRoleFilter = 'all';
        
        // 샘플 데이터 추가 (처음 실행 시에만)
        if (this.shifts.length === 0) {
            this.addSampleData();
        }
        
        // 날짜가 지난 거래 자동 취소 처리
        this.autoCancelExpiredShifts();
        
        this.init();
    }

    // 샘플 데이터 추가
    addSampleData() {
        const today = new Date();
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);
        const dayAfterTomorrow = new Date(today);
        dayAfterTomorrow.setDate(dayAfterTomorrow.getDate() + 2);
        
        const sampleShifts = [
            {
                id: '1',
                name: '김영희',
                role: 'TS',
                tradeType: 'shift',
                shiftDate: tomorrow.toISOString().split('T')[0],
                sellingShiftTime: '945',
                buyingShiftTime: '118',
                sellingShift: `${tomorrow.toISOString().split('T')[0]} 945`,
                buyingShift: `${tomorrow.toISOString().split('T')[0]} 118`,
                reason: '개인 일정으로 인해 시프트 변경이 필요합니다.',
                status: 'selling',
                createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString()
            },
            {
                id: '2',
                name: '박철수',
                role: 'TE',
                tradeType: 'dayoff',
                sellingDayoff: dayAfterTomorrow.toISOString().split('T')[0],
                buyingDayoff: new Date(dayAfterTomorrow.getTime() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
                sellingShift: `${dayAfterTomorrow.toISOString().split('T')[0]} 휴무`,
                buyingShift: `${new Date(dayAfterTomorrow.getTime() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]} 휴무`,
                reason: '병원 예약이 있어서 휴무를 바꿔주세요.',
                status: 'selling',
                createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString()
            },
            {
                id: '3',
                name: '이미영',
                role: 'Genius',
                tradeType: 'shift',
                shiftDate: new Date(today.getTime() - 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
                sellingShiftTime: '129',
                buyingShiftTime: '마감',
                sellingShift: `${new Date(today.getTime() - 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]} 129`,
                buyingShift: `${new Date(today.getTime() - 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]} 마감`,
                reason: '',
                status: 'completed',
                createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
                completedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString()
            },
            {
                id: '4',
                name: '최민수',
                role: 'TS',
                tradeType: 'shift',
                shiftDate: new Date(today.getTime() - 1 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
                sellingShiftTime: '945',
                buyingShiftTime: '118',
                sellingShift: `${new Date(today.getTime() - 1 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]} 945`,
                buyingShift: `${new Date(today.getTime() - 1 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]} 118`,
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
        
        // 기존 데이터 구조가 새로운 구조와 맞지 않으면 초기화
        this.migrateDataIfNeeded();
    }

    // 이벤트 바인딩
    bindEvents() {
        // 탭 클릭 이벤트
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.switchTab(e.target.closest('.tab-btn').dataset.tab);
            });
        });

        // 역할별 필터 이벤트 (이벤트 위임 사용)
        const roleFilterContainer = document.querySelector('.role-filter');
        if (roleFilterContainer) {
            roleFilterContainer.addEventListener('click', (e) => {
                const roleFilterBtn = e.target.closest('.role-filter-btn');
                if (roleFilterBtn) {
                    this.switchRoleFilter(roleFilterBtn.dataset.role);
                }
            });
        }



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

        // 역할 버튼 클릭 이벤트
        document.querySelectorAll('.role-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                document.querySelectorAll('.role-btn').forEach(b => b.classList.remove('active'));
                e.target.classList.add('active');
                document.getElementById('role').value = e.target.dataset.role;
            });
        });

        // 거래 유형 탭 클릭 이벤트
        document.querySelectorAll('.type-tab').forEach(tab => {
            tab.addEventListener('click', (e) => {
                document.querySelectorAll('.type-tab').forEach(t => t.classList.remove('active'));
                e.target.classList.add('active');
                
                const type = e.target.dataset.type;
                document.getElementById('shiftFields').style.display = type === 'shift' ? 'block' : 'none';
                document.getElementById('dayoffFields').style.display = type === 'dayoff' ? 'block' : 'none';
            });
        });

        // 시프트 버튼 클릭 이벤트
        document.querySelectorAll('.shift-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const container = e.target.closest('.form-group');
                container.querySelectorAll('.shift-btn').forEach(b => b.classList.remove('active'));
                e.target.classList.add('active');
                
                const hiddenInput = container.querySelector('input[type="hidden"]');
                if (hiddenInput) {
                    hiddenInput.value = e.target.dataset.shift;
                }
            });
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

    // 역할별 필터 전환
    switchRoleFilter(role) {
        this.currentRoleFilter = role;
        
        // 필터 버튼 활성화
        document.querySelectorAll('.role-filter-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        document.querySelector(`[data-role="${role}"]`).classList.add('active');
        
        this.renderShifts();
    }



    // 시프트 추가
    addShift() {
        const formData = new FormData(document.getElementById('shiftForm'));
        const role = document.getElementById('role').value;
        const tradeType = document.querySelector('.type-tab.active').dataset.type;
        
        let shift = {
            id: Date.now().toString(),
            name: formData.get('name'),
            role: role,
            tradeType: tradeType,
            reason: formData.get('reason') || '',
            status: 'selling',
            createdAt: new Date().toISOString()
        };

        if (tradeType === 'shift') {
            shift = {
                ...shift,
                shiftDate: formData.get('shiftDate'),
                sellingShiftTime: formData.get('sellingShiftTime'),
                buyingShiftTime: formData.get('buyingShiftTime'),
                sellingShift: `${formData.get('shiftDate')} ${formData.get('sellingShiftTime')}`,
                buyingShift: `${formData.get('shiftDate')} ${formData.get('buyingShiftTime')}`
            };
        } else if (tradeType === 'dayoff') {
            shift = {
                ...shift,
                sellingDayoff: formData.get('sellingDayoff'),
                buyingDayoff: formData.get('buyingDayoff'),
                sellingShift: `${formData.get('sellingDayoff')} 휴무`,
                buyingShift: `${formData.get('buyingDayoff')} 휴무`
            };
        }

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
        
        // 역할 버튼 리셋
        document.querySelectorAll('.role-btn').forEach(btn => btn.classList.remove('active'));
        
        // 거래 유형 탭 리셋
        document.querySelectorAll('.type-tab').forEach(tab => tab.classList.remove('active'));
        document.querySelector('[data-type="shift"]').classList.add('active');
        
        // 시프트 버튼 리셋
        document.querySelectorAll('.shift-btn').forEach(btn => btn.classList.remove('active'));
        
        // 필드 표시/숨김 리셋
        document.getElementById('shiftFields').style.display = 'block';
        document.getElementById('dayoffFields').style.display = 'none';
    }

    // 시프트 렌더링
    renderShifts() {
        const shiftList = document.getElementById('shiftList');
        const emptyState = document.getElementById('emptyState');
        
        // 필터링된 시프트 가져오기
        let filteredShifts = this.shifts.filter(shift => shift.status === this.currentTab);
        
        // 역할별 필터 적용
        if (this.currentRoleFilter !== 'all') {
            filteredShifts = filteredShifts.filter(shift => shift.role === this.currentRoleFilter);
        }
        

        
        // 날짜와 시간 순으로 정렬
        filteredShifts.sort((a, b) => {
            const dateA = this.getShiftDate(a);
            const dateB = this.getShiftDate(b);
            return dateA - dateB;
        });
        
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
        
        // 거래 유형에 따른 클래스와 텍스트 설정
        const tradeTypeText = shift.tradeType === 'shift' ? '시프트 스왑' : '휴무 스왑';
        const tradeTypeClass = shift.tradeType === 'shift' ? 'shift-type' : 'dayoff-type';
        
        // 만료된 거래인지 확인
        const isExpired = this.isShiftExpired(shift);
        const expiredClass = isExpired ? 'expired' : '';
        const expiredBadge = isExpired ? '<div class="expired-badge">날짜가 지나서 취소됨</div>' : '';
        
        const actions = shift.status === 'selling' && !isExpired ? `
            <div class="shift-actions">
                <button class="btn btn-success btn-complete">거래완료</button>
                <button class="btn btn-danger btn-cancel">취소</button>
            </div>
        ` : '';

        return `
            <div class="shift-card ${statusClass} ${expiredClass} ${tradeTypeClass}" data-shift-id="${shift.id}">
                ${expiredBadge}
                <div class="shift-header">
                    <div class="user-info">
                        <span class="user-name">${shift.name}</span>
                        ${shift.role ? `<span class="user-role">${shift.role}</span>` : ''}
                    </div>
                    <div class="shift-type">${tradeTypeText}</div>
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
                <div class="detail-value">${shift.name} ${shift.role ? `(${shift.role})` : ''}</div>
            </div>
            <div class="detail-item">
                <div class="detail-label">거래 유형</div>
                <div class="detail-value">${shift.tradeType === 'shift' ? '시프트 스왑' : '휴무 스왑'}</div>
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

    // 시프트 날짜 가져오기 (정렬용)
    getShiftDate(shift) {
        if (shift.tradeType === 'shift') {
            // 시프트 스왑의 경우 파는 시프트 날짜 사용
            return new Date(shift.shiftDate);
        } else if (shift.tradeType === 'dayoff') {
            // 휴무 스왑의 경우 파는 휴무 날짜 사용
            return new Date(shift.sellingDayoff);
        }
        return new Date(shift.createdAt);
    }

    // 시프트가 만료되었는지 확인
    isShiftExpired(shift) {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        if (shift.tradeType === 'shift') {
            const shiftDate = new Date(shift.shiftDate);
            shiftDate.setHours(0, 0, 0, 0);
            return shiftDate <= today;
        } else if (shift.tradeType === 'dayoff') {
            const dayoffDate = new Date(shift.sellingDayoff);
            dayoffDate.setHours(0, 0, 0, 0);
            return dayoffDate <= today;
        }
        return false;
    }

    // 자동으로 만료된 거래 취소 처리
    autoCancelExpiredShifts() {
        let hasChanges = false;
        
        this.shifts.forEach(shift => {
            if (shift.status === 'selling' && this.isShiftExpired(shift)) {
                shift.status = 'cancelled';
                shift.cancelledAt = new Date().toISOString();
                shift.cancelReason = '날짜가 지나서 자동 취소됨';
                hasChanges = true;
            }
        });
        
        if (hasChanges) {
            this.saveShifts();
        }
    }

    // 데이터 마이그레이션 (필요시)
    migrateDataIfNeeded() {
        const needsMigration = this.shifts.some(shift => !shift.tradeType);
        if (needsMigration) {
            console.log('데이터 구조가 변경되어 초기화합니다.');
            this.shifts = [];
            this.addSampleData();
            this.renderShifts();
            this.updateTabCounts();
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
let app;

// DOM이 완전히 로드된 후 애플리케이션 시작
document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM 로드 완료, 애플리케이션 시작');
    app = new ShiftSwapApp();
    console.log('시프트 스왑 앱이 시작되었습니다. app.clearData()로 데이터를 초기화할 수 있습니다.');
});

// 개발용: 콘솔에서 app.clearData() 호출로 데이터 초기화 가능
