// 12.01 추가사항. 약속 등록 2단계 (register_Calendar.html) 로직

// 상수 정의
const TEMP_APPOINTMENT_KEY = 'ko_og_temp_appt';
const calendarGrid = document.getElementById('calendar-grid');
const skipTimeAdjustCheckbox = document.getElementById('skip-time-adjust');
const nextStepBtn = document.getElementById('nextStepBtn');
const apptTitleDisplay = document.getElementById('appt-title-display');
const currentMonthDisplay = document.getElementById('current-month-display');
const prevMonthBtn = document.getElementById('prev-month-btn');
const nextMonthBtn = document.getElementById('next-month-btn');
const arrivalTimeDisplay = document.getElementById('arrival-time-display'); // 12.01 추가

// 임시 데이터 로드
let tempAppointmentData = JSON.parse(localStorage.getItem(TEMP_APPOINTMENT_KEY));

// --- 1. 달력 동적 생성 로직 ---

const TODAY = new Date();
const currentMonth = TODAY.getMonth();
const currentYear = TODAY.getFullYear();
let displayedDate = new Date(currentYear, currentMonth, 1); // 현재 화면에 표시될 월

/**
 * 12.01 추가사항. [핵심 기능]: 현재 월의 달력 그리드를 동적으로 생성하고 렌더링합니다.
 * @param {Date} dateToDisplay - 표시할 월의 Date 객체 (1일 기준)
 */
function renderCalendar(dateToDisplay) {
    const year = dateToDisplay.getFullYear();
    const month = dateToDisplay.getMonth(); // 0-11
    
    // 현재 월 표시 업데이트
    currentMonthDisplay.textContent = `${year}년 ${month + 1}월`;
    calendarGrid.innerHTML = ''; // 기존 그리드 초기화
    
    const firstDayOfMonth = new Date(year, month, 1).getDay(); // 0 (일) ~ 6 (토)
    const daysInMonth = new Date(year, month + 1, 0).getDate(); // 해당 월의 마지막 날짜

    // 12.01 수정사항. [과거 월 이동 비활성화]: 현재 월 이전으로 이동하지 못하게 막기
    if (year === currentYear && month === currentMonth) {
        prevMonthBtn.disabled = true;
        prevMonthBtn.classList.add('opacity-40', 'cursor-default');
    } else {
        prevMonthBtn.disabled = false;
        prevMonthBtn.classList.remove('opacity-40', 'cursor-default');
    }
    
    // 1. 첫 주 공백 채우기
    for (let i = 0; i < firstDayOfMonth; i++) {
        const span = document.createElement('span');
        span.classList.add('p-2');
        calendarGrid.appendChild(span);
    }
    
    // 2. 날짜 채우기
    for (let day = 1; day <= daysInMonth; day++) {
        const date = new Date(year, month, day);
        const span = document.createElement('span');
        span.classList.add('p-2', 'cursor-pointer', 'rounded-full', 'hover:bg-gray-200'); // 12.01 수정: 다크모드 미적용으로 hover:bg-gray-100 대신 hover:bg-gray-200 사용
        span.textContent = day;
        span.setAttribute('data-date', `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`);

        // 12.01 수정사항. [과거 날짜 비활성화 및 오늘 날짜 강조]
        if (date.getTime() < TODAY.getTime() - (24 * 60 * 60 * 1000)) { // 어제까지의 시간
             // 과거 날짜: 비활성화 및 회색 처리
             span.classList.add('text-gray-400', 'cursor-default', 'opacity-60', 'hover:bg-transparent');
             span.onclick = (e) => e.stopPropagation(); // 클릭 방지
        } else if (day === TODAY.getDate() && month === currentMonth && year === currentYear) {
             // 오늘 날짜: 초록색 강조 (기본 선택)
             span.classList.add('bg-green-500', 'text-white', 'font-bold', 'today-date');
             span.setAttribute('selected', 'true');
             // 12.01 수정: 임시 데이터에 오늘 날짜를 기본값으로 저장
             tempAppointmentData.schedule_date = span.getAttribute('data-date');
             localStorage.setItem(TEMP_APPOINTMENT_KEY, JSON.stringify(tempAppointmentData));
        }

        calendarGrid.appendChild(span);
    }
}

// --- 2. 이벤트 핸들러 및 유틸리티 ---

/**
 * 12.01 추가사항. [날짜 이동 및 렌더링]
 */
function handleMonthChange(direction) {
    if (direction === 'prev') {
        displayedDate.setMonth(displayedDate.getMonth() - 1);
    } else if (direction === 'next') {
        displayedDate.setMonth(displayedDate.getMonth() + 1);
    }
    renderCalendar(displayedDate);
}

/**
 * 12.01 추가사항. [단일 날짜 선택 로직]
 */
function handleDateSelection(e) {
    if (e.target.tagName === 'SPAN' && e.target.hasAttribute('data-date') && !e.target.classList.contains('cursor-default')) {
        // 모든 선택 상태 초기화
        document.querySelectorAll('#calendar-grid span[selected]').forEach(span => {
            span.classList.remove('bg-green-500', 'bg-indigo-500', 'text-white', 'font-bold', 'selected');
            span.removeAttribute('selected');
        });
        
        // 선택 상태 적용 (초록색으로 통일)
        e.target.classList.add('bg-green-500', 'text-white', 'font-bold', 'selected');
        e.target.setAttribute('selected', 'true');

        // 임시 데이터에 선택 날짜 저장
        tempAppointmentData.schedule_date = e.target.getAttribute('data-date');
        localStorage.setItem(TEMP_APPOINTMENT_KEY, JSON.stringify(tempAppointmentData));
    }
}

/**
 * 12.01 추가사항. [도착 시간 수정 로직]
 */
function handleTimeEdit() {
    const defaultTime = "18:00";
    const newTime = prompt("약속 도착 시간을 'HH:MM' 형식(예: 17:30)으로 입력해주세요:", defaultTime);
    
    if (newTime && /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/.test(newTime)) {
        arrivalTimeDisplay.textContent = `${newTime} 까지`;
        
        // 임시 데이터에 시간 저장
        tempAppointmentData.arrival_time = newTime;
        localStorage.setItem(TEMP_APPOINTMENT_KEY, JSON.stringify(tempAppointmentData));
    } else if (newTime !== null) {
        alert("시간 형식이 올바르지 않습니다. HH:MM 형식으로 다시 입력해주세요.");
    }
}


// --- 3. 폼 제출 로직 (다음 단계 이동 및 임시 저장) ---

nextStepBtn.addEventListener('click', (e) => {
    e.preventDefault();
    
    if (!tempAppointmentData.schedule_date) {
        alert("약속 날짜를 선택해주세요.");
        return;
    }

    // 12.01 수정사항. 최종 스케줄 데이터 업데이트
    const finalSchedule = {
        date: tempAppointmentData.schedule_date, 
        time_arrival: tempAppointmentData.arrival_time || '18:00',
        skip_adjust: skipTimeAdjustCheckbox.checked
    };
    
    tempAppointmentData.schedule = finalSchedule;
    localStorage.setItem(TEMP_APPOINTMENT_KEY, JSON.stringify(tempAppointmentData));
    
    // 3단계 페이지로 이동
    window.location.href = '/register_Penalty.html';
});


// --- 4. 초기화 실행 ---

window.addEventListener('load', () => {
    // 1. 1단계 데이터 가드 및 이름 표시
    if (!checkDataGuard()) return;

    // 2. 달력 초기 렌더링 (오늘 날짜 기준으로 시작)
    renderCalendar(displayedDate);
    
    // 3. 이벤트 리스너 설정
    prevMonthBtn.addEventListener('click', () => handleMonthChange('prev'));
    nextMonthBtn.addEventListener('click', () => handleMonthChange('next'));
    calendarGrid.addEventListener('click', handleDateSelection);
    arrivalTimeDisplay.addEventListener('click', handleTimeEdit);
    
    // 4. 임시 데이터에서 시간 복원 (뒤로가기 시)
    if (tempAppointmentData.schedule && tempAppointmentData.schedule.time_arrival) {
        arrivalTimeDisplay.textContent = `${tempAppointmentData.schedule.time_arrival} 까지`;
    }
});