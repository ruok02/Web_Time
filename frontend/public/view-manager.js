// view-manager.js - user.html의 뷰 전환 및 달력 기능 관리

// ==================== 상수 정의 ====================
const APPOINTMENTS_KEY = 'ko_og_appointments';
const ACTIVE_VIEW_KEY = 'ko_og_active_view';

// 달력 관련 DOM 요소 (달력 뷰가 로드된 후 참조)
let calendarGrid, currentMonthDisplay, prevMonthBtn, nextMonthBtn;

// 현재 표시 중인 달력 월 정보
const TODAY = new Date();
let displayedDate = new Date(TODAY.getFullYear(), TODAY.getMonth(), 1);

// ==================== 뷰 전환 로직 ====================

/**
 * 뷰 전환 함수 - hidden 클래스를 활용한 SPA 방식
 * @param {string} viewName - 'home', 'calendar', 'schedule' 중 하나
 */
function switchView(viewName) {
    // 모든 뷰 숨기기
    document.getElementById('home-view').classList.add('hidden');
    document.getElementById('calendar-view').classList.add('hidden');
    document.getElementById('schedule-view').classList.add('hidden');
    
    // 선택된 뷰만 표시
    document.getElementById(`${viewName}-view`).classList.remove('hidden');
    
    // 네비게이션 버튼 활성화 상태 변경
    updateNavButtons(viewName);
    
    // localStorage에 현재 뷰 저장 (새로고침 시 복원용)
    localStorage.setItem(ACTIVE_VIEW_KEY, viewName);
    
    // 달력 뷰로 전환 시 달력 렌더링
    if (viewName === 'calendar') {
        initializeCalendarView();
    }
}

/**
 * 네비게이션 버튼의 활성화 상태 업데이트
 */
function updateNavButtons(activeView) {
    const navButtons = {
        home: document.getElementById('nav-home'),
        calendar: document.getElementById('nav-calendar'),
        schedule: document.getElementById('nav-schedule')
    };
    
    // 모든 버튼 비활성화 스타일로 변경
    Object.values(navButtons).forEach(btn => {
        btn.classList.remove('text-indigo-600', 'dark:text-indigo-400');
        btn.classList.add('text-gray-500', 'dark:text-gray-400', 'hover:text-indigo-600', 'dark:hover:text-indigo-400');
    });
    
    // 활성화된 버튼만 강조
    if (navButtons[activeView]) {
        navButtons[activeView].classList.remove('text-gray-500', 'dark:text-gray-400', 'hover:text-indigo-600', 'dark:hover:text-indigo-400');
        navButtons[activeView].classList.add('text-indigo-600', 'dark:text-indigo-400');
    }
}

// ==================== 달력 렌더링 로직 (register_Calendar.js 방식 재사용) ====================

/**
 * 달력 뷰 초기화 (DOM 요소 참조 및 이벤트 리스너 설정)
 */
function initializeCalendarView() {
    // DOM 요소 참조
    calendarGrid = document.getElementById('calendar-grid');
    currentMonthDisplay = document.getElementById('current-month-display');
    prevMonthBtn = document.getElementById('prev-month-btn');
    nextMonthBtn = document.getElementById('next-month-btn');
    
    // 이벤트 리스너 설정 (중복 방지를 위해 once 옵션 사용하지 않고 매번 새로 설정)
    if (prevMonthBtn && nextMonthBtn) {
        prevMonthBtn.onclick = () => handleMonthChange('prev');
        nextMonthBtn.onclick = () => handleMonthChange('next');
    }
    
    // 달력 렌더링
    renderCalendar(displayedDate);
}

/**
 * 약속이 있는 날짜들을 배열로 반환
 * @returns {Array<string>} 날짜 문자열 배열 (예: ['2024-12-05', '2024-12-10'])
 */
function getAppointmentDates() {
    const appointments = JSON.parse(localStorage.getItem(APPOINTMENTS_KEY) || '[]');
    return appointments.map(app => app.date);
}

/**
 * 달력 렌더링 함수 (register_Calendar.js 로직 기반)
 * @param {Date} dateToDisplay - 표시할 월의 Date 객체
 */
function renderCalendar(dateToDisplay) {
    if (!calendarGrid || !currentMonthDisplay) return;
    
    const year = dateToDisplay.getFullYear();
    const month = dateToDisplay.getMonth(); // 0-11
    
    // 현재 월 표시 업데이트
    currentMonthDisplay.textContent = `${year}년 ${month + 1}월`;
    calendarGrid.innerHTML = ''; // 그리드 초기화
    
    const firstDayOfMonth = new Date(year, month, 1).getDay(); // 0 (일) ~ 6 (토)
    const daysInMonth = new Date(year, month + 1, 0).getDate(); // 해당 월의 마지막 날짜
    
    // 오늘 날짜 정보
    const todayYear = TODAY.getFullYear();
    const todayMonth = TODAY.getMonth();
    const todayDate = TODAY.getDate();
    
    // 약속이 있는 날짜 목록 가져오기
    const appointmentDates = getAppointmentDates();
    
    // 이전/다음 월 버튼 활성화 상태 (과거 월 이동 금지)
    if (prevMonthBtn) {
        if (year === todayYear && month === todayMonth) {
            prevMonthBtn.disabled = true;
            prevMonthBtn.classList.add('opacity-40', 'cursor-default');
        } else {
            prevMonthBtn.disabled = false;
            prevMonthBtn.classList.remove('opacity-40', 'cursor-default');
        }
    }
    
    // 1. 첫 주 공백 채우기
    for (let i = 0; i < firstDayOfMonth; i++) {
        const span = document.createElement('span');
        span.classList.add('p-2');
        calendarGrid.appendChild(span);
    }
    
    // 2. 날짜 채우기
    for (let day = 1; day <= daysInMonth; day++) {
        const dateString = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
        const todayAtMidnight = new Date(todayYear, todayMonth, todayDate).getTime();
        const dateAtMidnight = new Date(year, month, day).getTime();
        
        const span = document.createElement('span');
        span.classList.add('p-2', 'rounded-full', 'font-gowoon', 'text-gray-900', 'dark:text-white');
        span.textContent = day;
        
        // 과거 날짜 처리
        if (dateAtMidnight < todayAtMidnight) {
            span.classList.add('text-gray-400', 'dark:text-gray-600', 'opacity-60');
        } 
        // 오늘 날짜 처리
        else if (dateAtMidnight === todayAtMidnight) {
            span.classList.add('bg-green-500', 'text-white', 'font-bold');
        }
        
        // 약속이 있는 날짜 표시 (빨간색 동그라미)
        if (appointmentDates.includes(dateString)) {
            // 오늘이면서 약속이 있는 경우 - 초록색 유지하되 테두리 추가
            if (dateAtMidnight === todayAtMidnight) {
                span.classList.add('ring-2', 'ring-red-500', 'ring-offset-2', 'dark:ring-offset-gray-700');
            } 
            // 일반 약속 날짜 - 빨간색으로 표시
            else {
                span.classList.remove('text-gray-900', 'dark:text-white');
                span.classList.add('bg-red-500', 'text-white', 'font-bold');
            }
        }
        
        calendarGrid.appendChild(span);
    }
}

/**
 * 월 이동 핸들러
 * @param {string} direction - 'prev' 또는 'next'
 */
function handleMonthChange(direction) {
    const currentYear = TODAY.getFullYear();
    const currentMonth = TODAY.getMonth();
    
    if (direction === 'prev') {
        // 과거 월 이동 금지
        if (displayedDate.getFullYear() === currentYear && displayedDate.getMonth() === currentMonth) {
            return;
        }
        displayedDate.setMonth(displayedDate.getMonth() - 1);
    } else if (direction === 'next') {
        displayedDate.setMonth(displayedDate.getMonth() + 1);
    }
    
    renderCalendar(displayedDate);
}

// ==================== 초기화 ====================

/**
 * view-manager 초기화 함수 (appointment.js의 window.onload에서 호출)
 */
function initializeViewManager() {
    // 네비게이션 버튼 이벤트 설정
    document.getElementById('nav-calendar').onclick = () => switchView('calendar');
    document.getElementById('nav-home').onclick = () => switchView('home');
    document.getElementById('nav-schedule').onclick = () => {
        alert('약속 조율 기능은 향후 구현될 예정입니다.');
        // 향후: switchView('schedule');
    };
    
    // 저장된 뷰 복원 또는 기본값(home)으로 시작
    const savedView = localStorage.getItem(ACTIVE_VIEW_KEY) || 'home';
    switchView(savedView);
}