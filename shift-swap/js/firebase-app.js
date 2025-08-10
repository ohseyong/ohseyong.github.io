// Firebase 시프트 스왑 애플리케이션
class FirebaseShiftSwapApp {
    constructor() {
        this.shifts = [];
        this.currentTab = 'selling';
        this.selectedShiftId = null;
        this.currentSwapType = 'shift'; // 'shift' 또는 'dayoff'
        
        this.init();
    }

    // 애플리케이션 초기화
    async init() {
        this.bindEvents();
        this.setupFirebaseListeners();
        this.setupTypeTabs();
        this.setupShiftButtons();
        this.setMinDates();
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
        } else {
            indicator.className = 'status-indicator offline';
            text.textContent = '연결 끊김';
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

    // 거래 유형 전환
    switchSwapType(type) {
        this.currentSwapType = type;
        
        // 탭 활성화
        document.querySelectorAll('.type-tab').forEach(tab => {
            tab.classList.remove('active');
        });
        document.querySelector(`[data-type="${type}"]`).classList.add('active');
        
        // 필드 표시/숨김
        const shiftFields = document.getElementById('shiftFields');
        const dayoffFields = document.getElementById('dayoffFields');
        
        if (type === 'shift') {
            shiftFields.style.display = 'block';
            dayoffFields.style.display = 'none';
        } else {
            shiftFields.style.display = 'none';
            dayoffFields.style.display = 'block';
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
        // 탭 클릭 이벤트
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.switchTab(e.target.closest('.tab-btn').dataset.tab);
            });
        });

        // 새 거래 등록 버튼
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

    // 새 거래 추가
    async addShift() {
        const formData = new FormData(document.getElementById('shiftForm'));
        const name = formData.get('name');
        const reason = formData.get('reason') || '';
        
        let sellingItem, buyingItem;
        
        if (this.currentSwapType === 'shift') {
            const sellingDate = formData.get('sellingShiftDate');
            const sellingTime = formData.get('sellingShiftTime');
            const buyingDate = formData.get('buyingShiftDate');
            const buyingTime = formData.get('buyingShiftTime');
            
            console.log('시프트 등록 데이터:', {
                sellingDate, sellingTime, buyingDate, buyingTime
            });
            
            if (!sellingDate || !sellingTime || !buyingDate || !buyingTime) {
                this.showNotification('모든 필드를 입력해주세요. (날짜와 시프트를 모두 선택해주세요)', 'error');
                return;
            }
            
            sellingItem = `${sellingDate} ${sellingTime}`;
            buyingItem = `${buyingDate} ${buyingTime}`;
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
            type: this.currentSwapType,
            sellingItem: sellingItem,
            buyingItem: buyingItem,
            reason: reason,
            status: 'selling',
            createdAt: new Date().toISOString()
        };

        console.log('등록할 거래:', shift);

        try {
            if (this.isLocalMode) {
                // 로컬 모드: 로컬 스토리지에 저장
                const newId = Date.now().toString();
                shift.id = newId;
                this.shifts.unshift(shift);
                this.saveToLocalStorage();
                this.renderShifts();
                this.updateTabCounts();
                this.showNotification('거래가 성공적으로 등록되었습니다! (로컬 모드)', 'success');
            } else {
                // Firebase 모드
                await database.ref('shifts').push().set(shift);
                this.showNotification('거래가 성공적으로 등록되었습니다!', 'success');
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
        
        const typeText = shift.type === 'shift' ? '시프트 스왑' : '휴무 스왑';
        const typeIcon = shift.type === 'shift' ? '🔄' : '📅';
        
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
                    <div class="shift-type">${typeIcon} ${typeText}</div>
                </div>
                <div class="shift-content">
                    <div class="shift-item">
                        <div class="shift-item-icon selling">📤</div>
                        <div class="shift-item-text">${this.formatItem(shift.sellingItem, shift.type)}</div>
                    </div>
                    <div class="shift-item">
                        <div class="shift-item-icon buying">📥</div>
                        <div class="shift-item-text">${this.formatItem(shift.buyingItem, shift.type)}</div>
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
        const sampleShifts = [
            {
                name: '김영희',
                type: 'shift',
                sellingItem: '2024-12-15 945',
                buyingItem: '2024-12-16 118',
                reason: '개인 일정으로 인해 시프트 변경이 필요합니다.',
                status: 'selling',
                createdAt: '2024-12-13T10:00:00.000Z'
            },
            {
                name: '박철수',
                type: 'shift',
                sellingItem: '2024-12-17 129',
                buyingItem: '2024-12-18 마감',
                reason: '병원 예약이 있어서 시프트를 바꿔주세요.',
                status: 'selling',
                createdAt: '2024-12-13T14:30:00.000Z'
            },
            {
                name: '이미영',
                type: 'dayoff',
                sellingItem: '2024-12-20',
                buyingItem: '2024-12-21',
                reason: '가족 행사가 있어서 휴무를 바꿔주세요.',
                status: 'selling',
                createdAt: '2024-12-12T09:15:00.000Z'
            },
            {
                name: '최민수',
                type: 'shift',
                sellingItem: '2024-12-22 945',
                buyingItem: '2024-12-23 129',
                reason: '',
                status: 'completed',
                createdAt: '2024-12-11T11:20:00.000Z',
                completedAt: '2024-12-12T13:30:00.000Z'
            },
            {
                name: '정다은',
                type: 'dayoff',
                sellingItem: '2024-12-25',
                buyingItem: '2024-12-26',
                reason: '크리스마스 파티가 있어서 휴무 변경 부탁드립니다.',
                status: 'cancelled',
                createdAt: '2024-12-10T15:45:00.000Z',
                cancelledAt: '2024-12-11T10:20:00.000Z'
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
