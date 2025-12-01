// calendar.js - 최종 완성판 (약속 날짜 글자색 자동 조절)

const APPOINTMENTS_KEY = 'ko_og_appointments';

const calendarGrid = document.getElementById('calendar-grid');
const currentMonthDisplay = document.getElementById('current-month-display');
const prevMonthBtn = document.getElementById('prev-month-btn');
const nextMonthBtn = document.getElementById('next-month-btn');

let displayedDate = new Date();
let appointments = [];

function loadAppointments() {
    const data = localStorage.getItem(APPOINTMENTS_KEY);
    appointments = data ? JSON.parse(data) : [];
}

function hasAppointment(dateStr) {
    return appointments.some(app => app.date === dateStr);
}

function renderCalendar() {
    loadAppointments();
    const year = displayedDate.getFullYear();
    const month = displayedDate.getMonth();

    currentMonthDisplay.textContent = `${year}년 ${month + 1}월`;
    calendarGrid.innerHTML = '';

    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // 요일 공백
    for (let i = 0; i < firstDay; i++) {
        calendarGrid.innerHTML += '<div></div>';
    }

    // 날짜 생성
    for (let day = 1; day <= daysInMonth; day++) {
        const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
        const thisDate = new Date(year, month, day);
        thisDate.setHours(0, 0, 0, 0);

        let baseClasses = "w-12 h-12 mx-auto flex items-center justify-center rounded-full transition font-bold text-lg";

        if (hasAppointment(dateStr)) {
            // 약속 있는 날 → 빨간 배경
            baseClasses += " bg-red-500 shadow-lg";

            // 다크모드면 검정 글자, 라이트면 흰 글자
            if (document.documentElement.classList.contains('dark')) {
                baseClasses += " text-black";        // 다크모드: 검정 글자
            } else {
                baseClasses += " text-white";        // 라이트모드: 흰 글자
            }
        } else if (thisDate.getTime() === today.getTime()) {
            baseClasses += " bg-green-500 text-white shadow-md";
        } else {
            baseClasses += " hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-800 dark:text-gray-200";
        }

        // 과거 날짜는 흐리게
        if (thisDate < today) {
            baseClasses += " text-gray-400 dark:text-gray-600";
        }

        calendarGrid.innerHTML += `
            <div class="${baseClasses}" onclick="showDayAppointments('${dateStr}')">
                ${day}
            </div>
        `;
    }
}

function showDayAppointments(dateStr) {
    const dayApps = appointments.filter(app => app.date === dateStr);
    if (dayApps.length === 0) {
        alert(`${dateStr}\n\n약속이 없어요!`);
        return;
    }
    const list = dayApps.map(app => `• ${app.title} (${app.time || '시간미정'})`).join('\n');
    alert(`${dateStr} 약속 목록\n\n${list}`);
}

prevMonthBtn.onclick = () => {
    displayedDate.setMonth(displayedDate.getMonth() - 1);
    renderCalendar();
};

nextMonthBtn.onclick = () => {
    displayedDate.setMonth(displayedDate.getMonth() + 1);
    renderCalendar();
};

// 페이지 로드 시 + 테마 변경 시에도 다시 그리기
window.onload = renderCalendar;

// 다크모드 전환 시 달력 다시 그리기 (theme.js에서 호출)
if (typeof updateDynamicStyles === 'function') {
    const originalUpdate = updateDynamicStyles;
    window.updateDynamicStyles = function() {
        if (originalUpdate) originalUpdate();
        renderCalendar(); // 테마 바뀔 때마다 달력 다시 그림
    };
} else {
    window.updateDynamicStyles = renderCalendar;
}