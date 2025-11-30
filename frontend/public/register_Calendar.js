// 11.30 추가사항. 약속 등록 2단계 (register_Calendar.html) 로직

// 상수 정의
const TEMP_APPOINTMENT_KEY = 'ko_og_temp_appt';
const calendarGrid = document.getElementById('calendar-grid');
const skipTimeAdjustCheckbox = document.getElementById('skip-time-adjust');
const nextStepBtn = document.getElementById('nextStepBtn');
const apptTitleDisplay = document.getElementById('appt-title-display');

// 임시 데이터 로드
let tempAppointmentData = JSON.parse(localStorage.getItem(TEMP_APPOINTMENT_KEY));

// --- 1. 유틸리티 및 초기화 ---

// 11.30 추가사항. [템플릿 가드]: 1단계 데이터 없으면 user.html로 리다이렉트
function checkDataGuard() {
    if (!tempAppointmentData || !tempAppointmentData.title) {
        alert("약속 개요 정보가 누락되었습니다. 1단계로 돌아갑니다.");
        window.location.href = '/user.html';
        return false;
    }
    return true;
}

// 11.30 추가사항. [다크모드 스타일 업데이트 함수]
// theme.js에서 호출되어 동적으로 스타일을 업데이트합니다.
function updateDynamicStyles() {
    // 이 단계에서는 동적으로 목록을 렌더링하지 않으므로, 모달만 처리합니다.
    const modalContent = document.getElementById('modal-content'); 
    const modalMessageText = document.getElementById('modal-message');
    const isDarkMode = document.documentElement.classList.contains('dark');
    
    if (modalContent) {
        if (isDarkMode) {
            modalContent.classList.remove('bg-white');
            modalContent.classList.add('dark:bg-gray-900');
        } else {
            modalContent.classList.remove('dark:bg-gray-900');
            modalContent.classList.add('bg-white');
        }
    }
    // (모달 메시지 텍스트 색상 처리 로직은 생략)
}


// --- 2. 이벤트 리스너 설정 ---

// 11.30 추가사항. [달력 날짜 선택 이벤트]
function setupCalendarEvents() {
    // 실제 구현 시: 날짜 선택 로직과 시간 슬라이더 연동
    calendarGrid.addEventListener('click', (e) => {
        if (e.target.tagName === 'SPAN' && e.target.hasAttribute('data-date')) {
            // 모든 선택 상태 초기화 (단일 선택 예시)
            document.querySelectorAll('#calendar-grid span').forEach(span => {
                span.classList.remove('bg-indigo-500', 'text-white', 'font-bold');
            });
            // 선택 상태 적용
            e.target.classList.add('bg-indigo-500', 'text-white', 'font-bold');

            // 임시 데이터에 선택 날짜 저장 (다중 선택은 추후 로직 확장 필요)
            tempAppointmentData.schedule_date = e.target.getAttribute('data-date');
            localStorage.setItem(TEMP_APPOINTMENT_KEY, JSON.stringify(tempAppointmentData));
        }
    });
}


// 11.30 추가사항. [다음 단계 이동 로직]
nextStepBtn.addEventListener('click', (e) => {
    e.preventDefault();
    
    // 11.30 추가사항. 시간대 데이터 수집 (예시: 하드코딩된 시간대 사용)
    const selectedDate = document.querySelector('#calendar-grid span.bg-indigo-500');
    
    if (!selectedDate) {
        alert("약속 날짜를 선택해주세요.");
        return;
    }
    
    // 11.30 추가사항. 임시 데이터 업데이트 및 3단계로 이동
    const finalSchedule = {
        date: selectedDate.getAttribute('data-date'), // 선택된 날짜
        time_start: '09:00', // 하드코딩 예시
        time_end: '18:00', // 하드코딩 예시
        skip_adjust: skipTimeAdjustCheckbox.checked
    };
    
    tempAppointmentData.schedule = finalSchedule;
    localStorage.setItem(TEMP_APPOINTMENT_KEY, JSON.stringify(tempAppointmentData));
    
    // 3단계 페이지로 이동
    window.location.href = '/register_Penalty.html';
});


// --- 3. 초기화 실행 ---

window.addEventListener('load', () => {
    if (checkDataGuard()) {
        // 1단계에서 가져온 약속 이름 표시
        apptTitleDisplay.textContent = `"${tempAppointmentData.title}"의 시간 설정`;
        
        setupCalendarEvents();
    }
});