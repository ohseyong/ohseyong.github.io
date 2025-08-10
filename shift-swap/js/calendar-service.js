class CalendarService {
    constructor(app) {
        this.app = app;
        this.calendarUrl = null;
        this.lastUpdate = null;
        this.lastCheck = null;
        this.calendarEvents = [];
        this.myRole = null;
        this.eventStats = {
            '945': 0,
            '118': 0,
            '129': 0,
            '마감': 0
        };
        this.dayOffDates = []; // 휴무 날짜 목록
        this.dayOffStats = []; // 휴무 통계
        this.shiftTimeMap = {
            '945': '09:45',
            '118': '11:00',
            '129': '12:00',
            '마감': '13:30'
        };
    }

    init() {
        this.loadCalendarSettings();
        this.setupEventListeners();
        this.updateStatusDisplay();
    }

    setupEventListeners() {
        // 캘린더 연동 버튼
        const calendarSyncBtn = document.getElementById('calendarSyncBtn');
        if (calendarSyncBtn) {
            calendarSyncBtn.addEventListener('click', () => this.showCalendarModal());
        }

        // 모달 관련 이벤트
        const closeCalendarSync = document.getElementById('closeCalendarSync');
        const closeCalendarSyncFooter = document.getElementById('closeCalendarSyncFooter');
        const saveCalendarSync = document.getElementById('saveCalendarSync');
        const testCalendarSync = document.getElementById('testCalendarSync');

        if (closeCalendarSync) {
            closeCalendarSync.addEventListener('click', () => this.hideCalendarModal());
        }
        if (closeCalendarSyncFooter) {
            closeCalendarSyncFooter.addEventListener('click', () => this.hideCalendarModal());
        }
        if (saveCalendarSync) {
            saveCalendarSync.addEventListener('click', () => this.saveCalendarSettings());
        }
        if (testCalendarSync) {
            testCalendarSync.addEventListener('click', () => this.testCalendarSync());
        }

        // 역할 선택 버튼 이벤트
        this.setupRoleButtons();

        // 모달 외부 클릭 시 닫기
        const calendarSyncModal = document.getElementById('calendarSyncModal');
        if (calendarSyncModal) {
            calendarSyncModal.addEventListener('click', (e) => {
                if (e.target === calendarSyncModal) {
                    this.hideCalendarModal();
                }
            });
        }
    }

    setupRoleButtons() {
        const roleButtons = document.querySelectorAll('#calendarRoleButtons .role-btn');
        roleButtons.forEach(btn => {
            btn.addEventListener('click', () => {
                // 기존 선택 해제
                roleButtons.forEach(b => b.classList.remove('active'));
                // 현재 버튼 선택
                btn.classList.add('active');
                this.myRole = btn.dataset.role;
                
                // 매칭 결과 업데이트
                this.compareShiftsWithCalendar();
            });
        });
    }

    showCalendarModal() {
        const modal = document.getElementById('calendarSyncModal');
        if (modal) {
            modal.classList.add('show');
            this.updateStatusDisplay();
        }
    }

    hideCalendarModal() {
        const modal = document.getElementById('calendarSyncModal');
        if (modal) {
            modal.classList.remove('show');
        }
    }

    loadCalendarSettings() {
        try {
            const settings = localStorage.getItem('calendarSettings');
            if (settings) {
                const data = JSON.parse(settings);
                this.calendarUrl = data.url;
                this.lastUpdate = data.lastUpdate;
                this.lastCheck = data.lastCheck;
                this.eventStats = data.eventStats || this.eventStats;
                this.dayOffStats = data.dayOffStats || [];
                this.myRole = data.myRole || null;
                
                // URL 입력 필드에 설정된 값 표시
                const urlInput = document.getElementById('calendarUrl');
                if (urlInput && this.calendarUrl) {
                    urlInput.value = this.calendarUrl;
                }
                
                // 역할 버튼 상태 복원
                this.restoreRoleButtonState();
            }
        } catch (error) {
            console.error('캘린더 설정 로드 실패:', error);
        }
    }

    restoreRoleButtonState() {
        if (this.myRole) {
            const roleButtons = document.querySelectorAll('#calendarRoleButtons .role-btn');
            roleButtons.forEach(btn => {
                if (btn.dataset.role === this.myRole) {
                    btn.classList.add('active');
                } else {
                    btn.classList.remove('active');
                }
            });
        }
    }

    saveCalendarSettings() {
        const urlInput = document.getElementById('calendarUrl');
        if (!urlInput) return;

        const url = urlInput.value.trim();
        if (!url) {
            this.app.ui.showNotification('캘린더 URL을 입력해주세요.', 'error');
            return;
        }

        if (!this.isValidCalendarUrl(url)) {
            this.app.ui.showNotification('올바른 캘린더 URL을 입력해주세요.', 'error');
            return;
        }

        this.calendarUrl = url;
        this.lastUpdate = new Date().toISOString();
        
        const settings = {
            url: this.calendarUrl,
            lastUpdate: this.lastUpdate,
            lastCheck: this.lastCheck,
            eventStats: this.eventStats,
            dayOffStats: this.dayOffStats,
            myRole: this.myRole
        };

        try {
            localStorage.setItem('calendarSettings', JSON.stringify(settings));
            this.updateStatusDisplay();
            this.app.ui.showNotification('캘린더 설정이 저장되었습니다.', 'success');
            this.hideCalendarModal();
            
            // 저장 후 즉시 캘린더 동기화 실행 및 순차적 토스트 표시
            this.syncCalendar().then(() => {
                this.showSequentialToasts();
            }).catch(error => {
                console.error('캘린더 동기화 실패:', error);
                this.showSequentialToasts(true);
            });
        } catch (error) {
            console.error('캘린더 설정 저장 실패:', error);
            this.app.ui.showNotification('설정 저장에 실패했습니다.', 'error');
        }
    }

    isValidCalendarUrl(url) {
        // Apple 캘린더 URL 패턴 확인
        return url.includes('sm-cal.apple.com') || url.includes('.ics');
    }

    updateStatusDisplay() {
        const lastUpdateSpan = document.getElementById('lastUpdate');
        const lastCheckSpan = document.getElementById('lastCheck');

        if (lastUpdateSpan) {
            if (this.lastUpdate) {
                const date = new Date(this.lastUpdate);
                lastUpdateSpan.textContent = `마지막 업데이트: ${date.toLocaleString('ko-KR')}`;
            } else {
                lastUpdateSpan.textContent = '마지막 업데이트: 없음';
            }
        }

        if (lastCheckSpan) {
            if (this.lastCheck) {
                const date = new Date(this.lastCheck);
                lastCheckSpan.textContent = `마지막 확인: ${date.toLocaleString('ko-KR')}`;
            } else {
                lastCheckSpan.textContent = '마지막 확인: 없음';
            }
        }
        
        // 이벤트 통계 표시
        this.updateEventStats();
    }
    
    updateEventStats() {
        const matchingDiv = document.getElementById('shiftMatching');
        if (!matchingDiv || !this.eventStats) return;
        
        let html = '';
        
        // 이벤트 통계 표시
        if (this.lastCheck) {
            html += `<div style="margin-bottom: 12px;"><strong>마지막 동기화 시 가져온 일정:</strong></div>`;
            html += `<div style="font-size: 12px; color: #64748b; margin-bottom: 8px;">`;
            html += `945: ${this.eventStats['945']}개<br>`;
            html += `118: ${this.eventStats['118']}개<br>`;
            html += `129: ${this.eventStats['129']}개<br>`;
            html += `마감: ${this.eventStats['마감']}개`;
            html += `</div>`;
            
            // 휴무 통계 표시
            if (this.dayOffStats && this.dayOffStats.length > 0) {
                html += `<div style="margin-top: 8px; border-top: 1px solid #e2e8f0; padding-top: 8px;"><strong>가져온 휴무:</strong></div>`;
                html += `<div style="font-size: 12px; color: #64748b; margin-bottom: 8px;">`;
                html += this.dayOffStats.slice(0, 10).join(', '); // 최대 10개까지만 표시
                if (this.dayOffStats.length > 10) {
                    html += ` 외 ${this.dayOffStats.length - 10}일`;
                }
                html += `</div>`;
            }
        }
        
        // 역할 매칭 상태 표시
        if (this.myRole) {
            html += `<div style="margin-top: 8px; font-size: 12px; color: #1e40af;"><strong>역할 필터:</strong> ${this.myRole} 역할의 매물만 강조됩니다</div>`;
        }
        
        // 매칭 결과 표시
        const sellingShifts = this.app.shifts.filter(shift => shift.status === 'selling');
        const matchedShifts = sellingShifts.filter(shift => shift.calendarMatch?.hasMatch);
        
        if (matchedShifts.length > 0) {
            html += `<div style="margin-top: 12px; border-top: 1px solid #e2e8f0; padding-top: 8px;"><strong>매칭된 매물:</strong></div>`;
            html += `<div style="font-size: 12px; color: #059669;">✓ ${matchedShifts.length}개의 매물이 내 스케줄과 매칭됩니다</div>`;
        } else {
            html += `<div style="margin-top: 12px; border-top: 1px solid #e2e8f0; padding-top: 8px;"><strong>매칭 결과:</strong></div>`;
            html += `<div style="font-size: 12px; color: #64748b;">매칭되는 매물이 없습니다</div>`;
        }

        matchingDiv.innerHTML = html;
    }

    async testCalendarSync() {
        if (!this.calendarUrl) {
            this.app.ui.showNotification('먼저 캘린더 URL을 저장해주세요.', 'error');
            return;
        }

        this.app.ui.showNotification('캘린더 동기화 테스트 중...', 'info');
        
        try {
            await this.syncCalendar();
            this.showSequentialToasts();
        } catch (error) {
            console.error('캘린더 동기화 테스트 실패:', error);
            this.showSequentialToasts(true);
        }
    }

    async syncCalendar() {
        if (!this.calendarUrl) {
            console.log('캘린더 URL이 설정되지 않음');
            return;
        }

        try {
            console.log('캘린더 동기화 시작:', this.calendarUrl);
            
            // CORS 우회를 위한 프록시 사용
            const proxyUrl = `https://api.allorigins.win/raw?url=${encodeURIComponent(this.calendarUrl)}`;
            const response = await fetch(proxyUrl);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const icsData = await response.text();
            this.parseICSData(icsData);
            this.lastCheck = new Date().toISOString();
            this.updateStatusDisplay();
            
            // 설정 저장
            const settings = {
                url: this.calendarUrl,
                lastUpdate: this.lastUpdate,
                lastCheck: this.lastCheck,
                eventStats: this.eventStats,
                dayOffStats: this.dayOffStats,
                myRole: this.myRole
            };
            localStorage.setItem('calendarSettings', JSON.stringify(settings));
            
            // 매물과 캘린더 비교
            this.compareShiftsWithCalendar();
            
            console.log('캘린더 동기화 완료');
        } catch (error) {
            console.error('캘린더 동기화 실패:', error);
            throw error;
        }
    }

    parseICSData(icsData) {
        this.calendarEvents = [];
        this.eventStats = {
            '945': 0,
            '118': 0,
            '129': 0,
            '마감': 0
        };
        
        // 간단한 ICS 파싱 (실제로는 더 정교한 파서 사용 권장)
        const lines = icsData.split('\n');
        let currentEvent = {};
        let eventDates = new Set(); // 이벤트가 있는 날짜들
        
        for (let i = 0; i < lines.length; i++) {
            const line = lines[i].trim();
            
            if (line === 'BEGIN:VEVENT') {
                currentEvent = {};
            } else if (line === 'END:VEVENT') {
                if (currentEvent.start && currentEvent.summary) {
                    this.calendarEvents.push(currentEvent);
                    
                    // 이벤트가 있는 날짜 기록
                    const dateKey = currentEvent.start.toISOString().split('T')[0];
                    eventDates.add(dateKey);
                    
                    // 이벤트 시간에 따른 통계 업데이트
                    const hours = currentEvent.start.getHours();
                    const minutes = currentEvent.start.getMinutes();
                    const timeStr = `${hours.toString().padStart(2, '0')}${minutes.toString().padStart(2, '0')}`;
                    
                    if (timeStr === '0945') this.eventStats['945']++;
                    else if (timeStr === '1100') this.eventStats['118']++;
                    else if (timeStr === '1200') this.eventStats['129']++;
                    else if (timeStr === '1330') this.eventStats['마감']++;
                }
            } else if (line.startsWith('DTSTART')) {
                const startMatch = line.match(/DTSTART[^:]*:(.+)/);
                if (startMatch) {
                    const dateStr = startMatch[1];
                    // 날짜 파싱 (TZID 또는 UTC 형식)
                    if (dateStr.includes('T')) {
                        currentEvent.start = new Date(dateStr.replace(/(\d{4})(\d{2})(\d{2})T(\d{2})(\d{2})(\d{2})/, '$1-$2-$3T$4:$5:$6'));
                    } else {
                        currentEvent.start = new Date(dateStr);
                    }
                }
            } else if (line.startsWith('SUMMARY:')) {
                currentEvent.summary = line.substring(8);
            }
        }
        
        // 휴무 날짜 계산 (이벤트가 없는 날짜들)
        this.calculateDayOffDates(eventDates);
        
        console.log('파싱된 캘린더 이벤트:', this.calendarEvents);
        console.log('이벤트 통계:', this.eventStats);
        console.log('휴무 날짜:', this.dayOffDates);
    }

    calculateDayOffDates(eventDates) {
        this.dayOffDates = [];
        this.dayOffStats = [];
        
        if (eventDates.size === 0) {
            console.log('일정이 없어서 휴무 계산을 건너뜁니다.');
            return;
        }
        
        // 일정이 있는 날짜들을 정렬하여 최초/마지막 날짜 찾기
        const sortedDates = Array.from(eventDates).sort();
        const firstEventDate = new Date(sortedDates[0]);
        const lastEventDate = new Date(sortedDates[sortedDates.length - 1]);
        
        console.log('일정 기간:', firstEventDate.toISOString().split('T')[0], '~', lastEventDate.toISOString().split('T')[0]);
        
        // 최초 일정 날짜부터 마지막 일정 날짜까지 확인
        const currentDate = new Date(firstEventDate);
        
        while (currentDate <= lastEventDate) {
            const dateKey = currentDate.toISOString().split('T')[0];
            
            // 이벤트가 없는 날짜가 휴무
            if (!eventDates.has(dateKey)) {
                const month = currentDate.getMonth() + 1;
                const day = currentDate.getDate();
                const dateStr = `${month}/${day}`;
                
                this.dayOffDates.push({
                    date: new Date(currentDate),
                    dateStr: dateStr
                });
                
                this.dayOffStats.push(dateStr);
            }
            
            currentDate.setDate(currentDate.getDate() + 1);
        }
        
        console.log('계산된 휴무 개수:', this.dayOffStats.length);
    }

    compareShiftsWithCalendar() {
        if (!this.app.shifts || this.app.shifts.length === 0) {
            console.log('비교할 매물이 없음');
            return;
        }

        const sellingShifts = this.app.shifts.filter(shift => shift.status === 'selling');
        let hasChanges = false;
        
        sellingShifts.forEach(shift => {
            const matchResult = this.checkShiftMatch(shift);
            const previousMatch = shift.calendarMatch;
            
            // 매칭 결과가 변경되었는지 확인
            if (!previousMatch || 
                previousMatch.hasMatch !== matchResult.hasMatch ||
                previousMatch.selling !== matchResult.selling ||
                previousMatch.buying !== matchResult.buying) {
                hasChanges = true;
            }
            
            this.updateShiftMatchDisplay(shift, matchResult);
        });

        // 매칭 결과를 모달에 표시
        this.updateMatchingDisplay(hasChanges);
    }

    checkShiftMatch(shift) {
        if (shift.type === 'shift') {
            // 시프트 스왑
            const [date, sellingShift] = shift.sellingItem.split(' ');
            const [_, buyingShift] = shift.buyingItem.split(' ');
            
            // 구하는 시프트만 확인 (구매 시프트)
            const buyingMatch = this.findMatchingEvent(date, buyingShift);
            
            // 역할 매칭 확인
            const roleMatch = !this.myRole || shift.role === this.myRole;
            
            return {
                selling: false,
                buying: buyingMatch,
                hasMatch: buyingMatch && roleMatch,
                isDayOff: false
            };
        } else {
            // 휴무 스왑
            const sellingDate = new Date(shift.sellingItem);
            const buyingDate = new Date(shift.buyingItem);
            
            // 구하는 휴무만 확인 (구매 휴무)
            const buyingMatch = this.findDayOffMatch(buyingDate);
            
            // 역할 매칭 확인
            const roleMatch = !this.myRole || shift.role === this.myRole;
            
            return {
                selling: false,
                buying: buyingMatch,
                hasMatch: buyingMatch && roleMatch,
                isDayOff: true
            };
        }
    }

    findMatchingEvent(date, shiftName) {
        const targetTime = this.shiftTimeMap[shiftName];
        if (!targetTime) return null;

        const targetDate = new Date(date);
        const targetDateTime = new Date(targetDate);
        const [hours, minutes] = targetTime.split(':');
        targetDateTime.setHours(parseInt(hours), parseInt(minutes), 0, 0);

        // 30분 범위 내에서 매칭 (시작 시간 기준)
        const rangeStart = new Date(targetDateTime.getTime() - 30 * 60 * 1000);
        const rangeEnd = new Date(targetDateTime.getTime() + 30 * 60 * 1000);

        return this.calendarEvents.find(event => {
            if (!event.start) return false;
            
            const eventStart = new Date(event.start);
            return eventStart >= rangeStart && eventStart <= rangeEnd;
        });
    }

    findDayOffMatch(date) {
        // 해당 날짜가 휴무인지 확인
        const dateKey = date.toISOString().split('T')[0];
        const month = date.getMonth() + 1;
        const day = date.getDate();
        const dateStr = `${month}/${day}`;
        
        return this.dayOffDates.find(dayOff => dayOff.dateStr === dateStr);
    }

    updateShiftMatchDisplay(shift, matchResult) {
        // shift 객체에 매칭 결과 저장
        shift.calendarMatch = matchResult;
    }

    updateMatchingDisplay(hasChanges = false) {
        // 변경사항이 있을 때만 UI 다시 렌더링
        if (hasChanges) {
            this.app.ui.renderShifts();
        }
    }

    // 페이지 로드 시 자동 실행
    async autoSync() {
        console.log('자동 캘린더 동기화 실행');
        
        // 저장된 설정에서 캘린더 URL 로드
        if (!this.calendarUrl) {
            try {
                const settings = localStorage.getItem('calendarSettings');
                if (settings) {
                    const data = JSON.parse(settings);
                    this.calendarUrl = data.url;
                    this.lastUpdate = data.lastUpdate;
                    this.lastCheck = data.lastCheck;
                    this.eventStats = data.eventStats || this.eventStats;
                    this.dayOffStats = data.dayOffStats || [];
                    this.myRole = data.myRole || null;
                }
            } catch (error) {
                console.error('저장된 캘린더 설정 로드 실패:', error);
            }
        }
        
        if (this.calendarUrl) {
            try {
                console.log('저장된 캘린더 URL로 동기화 시작:', this.calendarUrl);
                await this.syncCalendar();
                // 토스트는 app.js에서 통합 관리
            } catch (error) {
                console.error('자동 캘린더 동기화 실패:', error);
                // 에러 토스트는 app.js에서 통합 관리
            }
        } else {
            console.log('저장된 캘린더 URL이 없습니다.');
        }
    }

    // 순차적 토스트 메시지 표시 (비활성화 - app.js에서 통합 관리)
    showSequentialToasts(hasError = false) {
        // 토스트는 app.js에서 통합 관리됨
        console.log('토스트는 app.js에서 통합 관리됩니다');
    }
}
