// 12.01 안정화 버전. 약속 등록 2단계 (register_Calendar.html) 로직

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
const selectedDateSummary = document.getElementById('selected-date-summary');

// 임시 데이터 로드
let tempAppointmentData = JSON.parse(localStorage.getItem(TEMP_APPOINTMENT_KEY));

const TODAY = new Date();
const currentMonth = TODAY.getMonth();
const currentYear = TODAY.getFullYear();
let displayedDate = new Date(currentYear, currentMonth, 1);

// --- 1. 달력 렌더링 (날짜 복원 로직 제거 - 기본 달력만 표시) ---

function renderCalendar(dateToDisplay) {
    const year = dateToDisplay.getFullYear();
    const month = dateToDisplay.getMonth(); 
    
    currentMonthDisplay.textContent = `${year}년 ${month + 1}월`;
    calendarGrid.innerHTML = ''; 
    
    const firstDayOfMonth = new Date(year, month, 1).getDay(); // 0 (일) ~ 6 (토)
    const daysInMonth = new Date(year, month + 1, 0).getDate(); // 해당 월의 마지막 날짜

    // 과거 월 이동 비활성화
    if (year === currentYear && month === currentMonth) { 
        prevMonthBtn.disabled = true;
        prevMonthBtn.classList.add('opacity-40', 'cursor-default');
    } else {
        prevMonthBtn.disabled = false;
        prevMonthBtn.classList.remove('opacity-40', 'cursor-default');
    }
    
    // 빈 칸 채우기
    for (let i = 0; i < firstDayOfMonth; i++) {
        const span = document.createElement('span');
        span.classList.add('p-2');
        calendarGrid.appendChild(span);
    }
    
    // 날짜 채우기
    for (let day = 1; day <= daysInMonth; day++) {
        const date = new Date(year, month, day);
        const todayAtMidnight = new Date(TODAY.getFullYear(), TODAY.getMonth(), TODAY.getDate()).getTime();
        const dateAtMidnight = new Date(year, month, day).getTime();
        
        const dateString = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;

        const span = document.createElement('span');
        span.classList.add('p-2', 'cursor-pointer', 'rounded-full', 'hover:bg-gray-200');
        span.textContent = day;
        span.setAttribute('data-date', dateString);

        if (dateAtMidnight < todayAtMidnight) {
             // 과거 날짜 비활성화
             span.classList.add('text-gray-400', 'cursor-default', 'opacity-60', 'hover:bg-transparent');
             span.onclick = (e) => e.stopPropagation();
        } else {
             // 오늘 날짜 표시 (초록색)
             if (dateAtMidnight === todayAtMidnight) {
                 span.classList.add('bg-green-500', 'text-white', 'font-bold', 'today-fixed');
                 // 오늘이 기본 선택된 것으로 간주
                 if (!tempAppointmentData.schedule) tempAppointmentData.schedule = {};
                 tempAppointmentData.schedule.date = dateString;
             }
             span.classList.add('date-cell'); 
        }
        calendarGrid.appendChild(span);
    }
    // 요약 업데이트
    updateDateSummary();
}

// --- 2. 이벤트 핸들러 ---

function handleMonthChange(direction) {
    if (direction === 'prev') {
        if (displayedDate.getFullYear() === currentYear && displayedDate.getMonth() === currentMonth) return; 
        displayedDate.setMonth(displayedDate.getMonth() - 1);
    } else if (direction === 'next') {
        displayedDate.setMonth(displayedDate.getMonth() + 1);
    }
    renderCalendar(displayedDate);
}

function handleDateSelection(e) {
    const selectedCell = e.target;
    if (selectedCell.classList.contains('date-cell')) {
        
        // 기존 빨간색 선택 제거
        document.querySelectorAll('.selected-date').forEach(span => {
            span.classList.remove('bg-red-500', 'text-white', 'font-bold', 'selected-date');
            
            // 만약 오늘 날짜였다면 초록색 복구 (renderCalendar가 해주지만 시각적 즉시 반영)
            if (span.classList.contains('today-fixed')) {
                span.classList.add('bg-green-500', 'text-white', 'font-bold');
            }
        });
        
        // 오늘 날짜를 클릭했다면 초록색 제거 후 빨간색 적용
        if (selectedCell.classList.contains('today-fixed')) {
            selectedCell.classList.remove('bg-green-500', 'today-fixed');
        }
        
        // 빨간색 선택 적용
        selectedCell.classList.add('bg-red-500', 'text-white', 'font-bold', 'selected-date');

        // 데이터 저장
        if (!tempAppointmentData.schedule) tempAppointmentData.schedule = {};
        tempAppointmentData.schedule.date = selectedCell.getAttribute('data-date');
        localStorage.setItem(TEMP_APPOINTMENT_KEY, JSON.stringify(tempAppointmentData));
        
        updateDateSummary();
    }
}

function updateDateSummary() {
    const selectedRedElement = document.querySelector('.selected-date'); 
    const todayGreenElement = document.querySelector('.today-fixed');    
    const finalSelectedElement = selectedRedElement || todayGreenElement;
    
    if (finalSelectedElement && selectedDateSummary) {
        const dateString = finalSelectedElement.getAttribute('data-date');
        selectedDateSummary.textContent = `🗓️ 선택된 날짜: ${dateString}`;
    }
}

function checkDataGuard() {
    if (!tempAppointmentData || !tempAppointmentData.title) {
        alert("약속 개요 정보가 누락되었습니다. 1단계로 돌아갑니다.");
        window.location.href = '/register_Start.html';
        return false;
    }
    apptTitleDisplay.textContent = `"${tempAppointmentData.title}"의 시간 설정`;
    return true;
}

// --- 3. 다음 단계 이동 ---

function handleNextStepClick(e) {
    e.preventDefault();
    
    // 선택된 날짜 확인 (빨간색 or 초록색)
    const selectedDateElement = document.querySelector('.selected-date') || document.querySelector('.today-fixed'); 
    const arrivalTime = arrivalTimeInput.value; 
    
    if (!selectedDateElement) {
        alert("약속 날짜를 선택해주세요.");
        return;
    }
    if (!arrivalTime) {
        alert("약속 도착 시간을 설정해주세요.");
        return;
    }

    // 데이터 저장
    const scheduleData = {
        date: selectedDateElement.getAttribute('data-date'), 
        time_arrival: arrivalTime,
        skip_adjust: skipTimeAdjustCheckbox.checked
    };
    
    tempAppointmentData.schedule = scheduleData;
    localStorage.setItem(TEMP_APPOINTMENT_KEY, JSON.stringify(tempAppointmentData));
    
    window.location.href = '/register_Penalty.html';
}


// --- 4. 초기화 (시간만 복원) ---

window.addEventListener('load', () => {
    if (!checkDataGuard()) return;

    renderCalendar(displayedDate);
    
    prevMonthBtn.addEventListener('click', () => handleMonthChange('prev'));
    nextMonthBtn.addEventListener('click', () => handleMonthChange('next'));
    calendarGrid.addEventListener('click', handleDateSelection);
    nextStepBtn.addEventListener('click', handleNextStepClick);
    
    // 12.01 수정: 시간만 복원 (날짜 복원 로직 제거)
    if (tempAppointmentData.schedule && tempAppointmentData.schedule.time_arrival) {
        arrivalTimeInput.value = tempAppointmentData.schedule.time_arrival;
    }
    
    updateDateSummary(); 
});