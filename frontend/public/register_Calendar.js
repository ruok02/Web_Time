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
const arrivalTimeInput = document.getElementById('arrival-time-input'); 
const selectedDateSummary = document.getElementById('selected-date-summary');

// 임시 데이터 로드
let tempAppointmentData = JSON.parse(localStorage.getItem(TEMP_APPOINTMENT_KEY));

const TODAY = new Date();
const currentMonth = TODAY.getMonth();
const currentYear = TODAY.getFullYear();

// 12.01 수정사항. [초기 달력 기준일 설정]
// 저장된 날짜가 있으면 그 날짜의 월을 보여주고, 없으면 오늘 날짜의 월을 보여줍니다.
let savedDateObj = null;
if (tempAppointmentData && tempAppointmentData.schedule && tempAppointmentData.schedule.date) {
    savedDateObj = new Date(tempAppointmentData.schedule.date);
}

let displayedDate = savedDateObj ? new Date(savedDateObj) : new Date(currentYear, currentMonth, 1);


// --- 1. 달력 동적 생성 로직 ---

function renderCalendar(dateToDisplay) {
    const year = dateToDisplay.getFullYear();
    const month = dateToDisplay.getMonth(); 
    
    currentMonthDisplay.textContent = `${year}년 ${month + 1}월`;
    calendarGrid.innerHTML = ''; 
    
    const firstDayOfMonth = new Date(year, month, 1).getDay(); 
    const daysInMonth = new Date(year, month + 1, 0).getDate(); 

    // 과거 월 이동 비활성화 (오늘 기준)
    if (year === currentYear && month === currentMonth) {
        prevMonthBtn.disabled = true;
        prevMonthBtn.classList.add('opacity-40', 'cursor-default');
    } else {
        prevMonthBtn.disabled = false;
        prevMonthBtn.classList.remove('opacity-40', 'cursor-default');
    }
    
    // 1. 첫 주 공백
    for (let i = 0; i < firstDayOfMonth; i++) {
        const span = document.createElement('span');
        span.classList.add('p-2');
        calendarGrid.appendChild(span);
    }
    
    // 2. 날짜 채우기
    for (let day = 1; day <= daysInMonth; day++) {
        const date = new Date(year, month, day);
        const todayAtMidnight = new Date(TODAY.getFullYear(), TODAY.getMonth(), TODAY.getDate()).getTime();
        const dateAtMidnight = new Date(year, month, day).getTime();
        
        // 현재 렌더링 중인 날짜의 문자열 (YYYY-MM-DD)
        const dateString = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;

        const span = document.createElement('span');
        span.classList.add('p-2', 'cursor-pointer', 'rounded-full', 'hover:bg-gray-200');
        span.textContent = day;
        span.setAttribute('data-date', dateString);

        if (dateAtMidnight < todayAtMidnight) {
             // 과거 날짜
             span.classList.add('text-gray-400', 'cursor-default', 'opacity-60', 'hover:bg-transparent');
             span.onclick = (e) => e.stopPropagation(); 
        } else {
             // 12.01 수정사항. [기존 선택 날짜 복원 로직]
             // 저장된 스케줄 날짜가 있고, 현재 그리는 날짜와 같다면 빨간색으로 표시
             let isSelected = false;
             if (tempAppointmentData.schedule && tempAppointmentData.schedule.date === dateString) {
                 isSelected = true;
                 // 단, 오늘 날짜라면 초록색이 우선이므로 아래 로직에서 처리
             }

             // 오늘 날짜 표시 (초록색)
             if (dateAtMidnight === todayAtMidnight) {
                 span.classList.add('bg-green-500', 'text-white', 'font-bold', 'today-fixed');
                 // 오늘이 선택된 상태라면 selected 속성 추가
                 if (isSelected) span.setAttribute('selected', 'true');
             } 
             // 오늘이 아닌데 선택된 날짜라면 (빨간색)
             else if (isSelected) {
                 span.classList.add('bg-red-500', 'text-white', 'font-bold', 'selected-date');
                 span.setAttribute('selected', 'true');
             }

             span.classList.add('date-cell'); 
        }

        calendarGrid.appendChild(span);
    }
    
    // 렌더링 후 요약 업데이트
    updateDateSummary();
}

// --- 2. 이벤트 핸들러 ---

function handleMonthChange(direction) {
    if (direction === 'prev') {
        if (displayedDate.getFullYear() === currentYear && displayedDate.getMonth() === currentMonth) {
            return; 
        }
        displayedDate.setMonth(displayedDate.getMonth() - 1);
    } else if (direction === 'next') {
        displayedDate.setMonth(displayedDate.getMonth() + 1);
    }
    renderCalendar(displayedDate);
}

function handleDateSelection(e) {
    const selectedCell = e.target;
    if (selectedCell.classList.contains('date-cell') && !selectedCell.classList.contains('cursor-default')) {
        
        // 모든 이전 선택 상태 제거
        document.querySelectorAll('.date-cell[selected]').forEach(span => {
            span.classList.remove('bg-red-500', 'text-white', 'font-bold', 'selected', 'selected-date');
            span.removeAttribute('selected');
            
            // 오늘 날짜 복구
            if (span.classList.contains('today-fixed')) {
                 span.classList.add('bg-green-500', 'text-white', 'font-bold');
            }
        });
        
        // 오늘 날짜인 경우 초록색 제거 후 빨간색 적용 (사용자 선택 시점)
        if (selectedCell.classList.contains('today-fixed')) {
            selectedCell.classList.remove('bg-green-500', 'today-fixed');
        }
        
        // 선택 상태 적용 (빨간색)
        selectedCell.classList.add('bg-red-500', 'text-white', 'font-bold', 'selected-date');
        selectedCell.setAttribute('selected', 'true');

        // 데이터 업데이트
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

// --- 3. 폼 제출 로직 ---

function handleNextStepClick(e) {
    e.preventDefault();
    
    const selectedDateElement = document.querySelector('.selected-date, .today-fixed'); 
    const arrivalTime = arrivalTimeInput.value; 
    
    if (!selectedDateElement) {
        alert("약속 날짜를 선택해주세요.");
        return;
    }
    if (!arrivalTime) {
        alert("약속 도착 시간을 설정해주세요.");
        return;
    }

    // 데이터 업데이트
    const selectedDate = selectedDateElement.getAttribute('data-date');
    const scheduleData = {
        date: selectedDate, 
        time_arrival: arrivalTime,
        skip_adjust: skipTimeAdjustCheckbox.checked
    };
    
    tempAppointmentData.schedule = scheduleData;
    localStorage.setItem(TEMP_APPOINTMENT_KEY, JSON.stringify(tempAppointmentData));
    
    window.location.href = '/register_Penalty.html';
}


// --- 4. 초기화 실행 ---

window.addEventListener('load', () => {
    if (!checkDataGuard()) return;

    // 1. 달력 초기 렌더링 (저장된 날짜가 있다면 해당 월을 보여줌)
    renderCalendar(displayedDate);
    
    // 2. 이벤트 리스너
    prevMonthBtn.addEventListener('click', () => handleMonthChange('prev'));
    nextMonthBtn.addEventListener('click', () => handleMonthChange('next'));
    calendarGrid.addEventListener('click', handleDateSelection);
    nextStepBtn.addEventListener('click', handleNextStepClick);
    
    // 3. 시간 데이터 복원
    if (tempAppointmentData.schedule && tempAppointmentData.schedule.time_arrival) {
        arrivalTimeInput.value = tempAppointmentData.schedule.time_arrival;
    }
    
    updateDateSummary(); 
});