// 12.01 추가사항. 약속 등록 2단계 (register_Calendar.html) 로직

// 상수 정의
const TEMP_APPOINTMENT_KEY = 'ko_og_temp_appt';
// HTML 요소 참조
const calendarGrid = document.getElementById('calendar-grid');
const skipTimeAdjustCheckbox = document.getElementById('skip-time-adjust');
const nextStepBtn = document.getElementById('nextStepBtn');
const apptTitleDisplay = document.getElementById('appt-title-display');
const currentMonthDisplay = document.getElementById('current-month-display');
const prevMonthBtn = document.getElementById('prev-month-btn');
const nextMonthBtn = document.getElementById('next-month-btn');
const arrivalTimeInput = document.getElementById('arrival-time-input'); 

// 임시 데이터 로드
let tempAppointmentData = JSON.parse(localStorage.getItem(TEMP_APPOINTMENT_KEY));

const TODAY = new Date();
const currentMonth = TODAY.getMonth();
const currentYear = TODAY.getFullYear();
let displayedDate = new Date(currentYear, currentMonth, 1); // 현재 화면에 표시될 월

// --- 1. 달력 동적 생성 로직 ---

/**
 * 12.01 추가사항. [핵심 기능]: 현재 월의 달력 그리드를 동적으로 생성하고 렌더링합니다.
 * @param {Date} dateToDisplay - 표시할 월의 Date 객체 (1일 기준)
 */
function renderCalendar(dateToDisplay) {
    const year = dateToDisplay.getFullYear();
    const month = dateToDisplay.getMonth(); // 0-11
    
    // 현재 월 표시 업데이트
    currentMonthDisplay.textContent = `${year}년 ${month + 1}월`;
    calendarGrid.innerHTML = ''; // 12.01 수정사항. [오류 수정]: 그리드 초기화
    
    const firstDayOfMonth = new Date(year, month, 1).getDay(); // 0 (일) ~ 6 (토)
    const daysInMonth = new Date(year, month + 1, 0).getDate(); // 해당 월의 마지막 날짜

    // 12.01 수정사항. [과거 월 이동 비활성화]: 오늘 월 이전으로 이동하지 못하게 막기
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
        // 오늘 날짜 및 해당 날짜의 자정 시간 계산
        const todayAtMidnight = new Date(TODAY.getFullYear(), TODAY.getMonth(), TODAY.getDate()).getTime();
        const dateAtMidnight = new Date(year, month, day).getTime();

        const span = document.createElement('span');
        span.classList.add('p-2', 'cursor-pointer', 'rounded-full', 'hover:bg-gray-200');
        span.textContent = day;
        const dateString = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
        span.setAttribute('data-date', dateString);

        if (dateAtMidnight < todayAtMidnight) {
             // 과거 날짜: 비활성화 및 회색 처리
             span.classList.add('text-gray-400', 'cursor-default', 'opacity-60', 'hover:bg-transparent');
             span.onclick = (e) => e.stopPropagation(); // 클릭 방지
        } else {
             
             // 12.01 수정사항. [오늘 날짜 강조 고정]: 초록색 고정
             if (dateAtMidnight === todayAtMidnight) {
                 span.classList.add('bg-green-500', 'text-white', 'font-bold', 'today-fixed');
                 
                 // 12.01 수정: 임시 데이터에 오늘 날짜가 없으면 기본값으로 설정
                 if (!tempAppointmentData.schedule_date) {
                    tempAppointmentData.schedule_date = dateString;
                    localStorage.setItem(TEMP_APPOINTMENT_KEY, JSON.stringify(tempAppointmentData));
                 }
             }

             // 12.01 수정사항. [이전에 선택된 날짜 빨간색으로 복원]
             if (tempAppointmentData.schedule_date === dateString && dateAtMidnight !== todayAtMidnight) {
                  span.classList.add('bg-red-500', 'text-white', 'font-bold', 'selected-date');
                  span.setAttribute('selected', 'true');
             }

             span.classList.add('date-cell'); // 이벤트 리스너를 위한 클래스 추가
        }

        calendarGrid.appendChild(span);
    }
}

// --- 2. 이벤트 핸들러 ---

/**
 * 12.01 추가사항. [날짜 이동 및 렌더링]
 */
function handleMonthChange(direction) {
    if (direction === 'prev') {
        // 12.01 수정사항. [과거 월 이동 금지]: 현재 월보다 이전으로 가는 것을 막음
        if (displayedDate.getFullYear() === currentYear && displayedDate.getMonth() === currentMonth) {
            return; 
        }
        displayedDate.setMonth(displayedDate.getMonth() - 1);
    } else if (direction === 'next') {
        displayedDate.setMonth(displayedDate.getMonth() + 1);
    }
    renderCalendar(displayedDate);
}

/**
 * 12.01 추가사항. [단일 날짜 선택 로직]: 선택 시 빨간색 적용
 */
function handleDateSelection(e) {
    const selectedCell = e.target;
    if (selectedCell.classList.contains('date-cell') && !selectedCell.classList.contains('today-fixed')) {
        
        // 12.01 수정사항. [클릭 로직]: 모든 이전 선택 상태 제거
        document.querySelectorAll('.date-cell[selected]').forEach(span => {
            span.classList.remove('bg-red-500', 'text-white', 'font-bold', 'selected', 'selected-date');
            span.removeAttribute('selected');
        });
        
        // 12.01 수정사항. [선택 상태 적용]: 빨간색으로 선택 강조
        selectedCell.classList.add('bg-red-500', 'text-white', 'font-bold', 'selected-date');
        selectedCell.setAttribute('selected', 'true');

        // 임시 데이터에 선택 날짜 저장
        tempAppointmentData.schedule_date = selectedCell.getAttribute('data-date');
        localStorage.setItem(TEMP_APPOINTMENT_KEY, JSON.stringify(tempAppointmentData));
    }
}

/**
 * 12.01 추가사항. [데이터 가드]: 1단계 데이터 누락 시 리다이렉트
 */
function checkDataGuard() {
    if (!tempAppointmentData || !tempAppointmentData.title) {
        alert("약속 개요 정보가 누락되었습니다. 1단계로 돌아갑니다.");
        window.location.href = '/register_Start.html';
        return false;
    }
    // 12.01 추가사항. 제목 표시
    apptTitleDisplay.textContent = `"${tempAppointmentData.title}"의 시간 설정`;
    return true;
}


// --- 4. 초기화 실행 ---

window.addEventListener('load', () => {
    if (!checkDataGuard()) return;

    // 1. 달력 초기 렌더링 (오늘 날짜 기준으로 시작)
    renderCalendar(displayedDate);
    
    // 2. 이벤트 리스너 설정
    prevMonthBtn.addEventListener('click', () => handleMonthChange('prev'));
    nextMonthBtn.addEventListener('click', () => handleMonthChange('next'));
    calendarGrid.addEventListener('click', handleDateSelection);
    
    // 12.01 최종 수정: nextStepBtn 이벤트 리스너를 load 이벤트 안으로 옮겨 요소 로드 보장
    // --- 3. 폼 제출 로직 (다음 단계 이동) ---
    nextStepBtn.addEventListener('click', (e) => {
        e.preventDefault();
        
        const selectedDateElement = document.querySelector('.selected-date, .today-fixed'); // 오늘 날짜 또는 선택된 날짜
        const arrivalTime = arrivalTimeInput.value;
        
        if (!selectedDateElement) {
            alert("약속 날짜를 선택해주세요.");
            return;
        }
        if (!arrivalTime) {
            alert("약속 도착 시간을 설정해주세요.");
            return;
        }

        // 최종 스케줄 데이터 업데이트
        const finalSchedule = {
            date: selectedDateElement.getAttribute('data-date'), 
            time_arrival: arrivalTime,
            skip_adjust: skipTimeAdjustCheckbox.checked
        };
        
        tempAppointmentData.schedule = finalSchedule;
        // 1단계 데이터와 2단계 데이터(날짜, 시간)를 최종적으로 LocalStorage에 저장
        localStorage.setItem(TEMP_APPOINTMENT_KEY, JSON.stringify(tempAppointmentData));
        
        // 3단계 페이지로 이동
        window.location.href = '/register_Penalty.html';
    });
    
    // 3. 임시 데이터에서 시간 복원 (뒤로가기 시)
    if (tempAppointmentData.schedule && tempAppointmentData.schedule.time_arrival) {
        arrivalTimeInput.value = tempAppointmentData.schedule.time_arrival;
    }
});