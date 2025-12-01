// calendar.js
const APPOINTMENTS_KEY = 'ko_og_appointments';

const calendarGrid = document.getElementById('calendar-grid');
const currentMonthDisplay = document.getElementById('current-month-display');
const prevMonthBtn = document.getElementById('prev-month-btn');
const nextMonthBtn = document.getElementById('next-month-btn');

let displayedDate = new Date();
let appointments = [];

// 저장된 약속 불러오기
function loadAppointments() {
    const data = localStorage.getItem(APPOINTMENTS_KEY);
    appointments = data ? JSON.parse(data) : [];
}

// 약속 있는 날짜들만 빨간색 동그라미 표시용
function hasAppointmentOnDate(dateStr) {
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
    today.setHours(0,0,0,0);

    // 공백
    for (let i = 0; i < firstDay; i++) {
        calendarGrid.innerHTML += `<span></span>`;
    }

    // 날짜 채우기
    for (let day = 1; day <= daysInMonth; day++) {
        const dateStr = `${year}-${String(month + 1).padStart(2,'0')}-${String(day).padStart(2,'0')}`;
        const dateObj = new Date(year, month, day);
        dateObj.setHours(0,0,0,0);

        let classes = "p-3 rounded-full cursor-pointer hover:bg-gray-200 dark:hover:bg-gray-700 transition text-center";
        let style = "";

        if (hasAppointmentOnDate(dateStr)) {
            classes += " bg-red-500 text-white font-bold"; // 약속 있으면 빨간 동그라미
        } else if (dateObj.getTime() === today.getTime()) {
            classes += " bg-green-500 text-white font-bold";
        }

        if (dateObj < today) {
            classes += " text-gray-400 cursor-default";
        }

        calendarGrid.innerHTML += `<span class="${classes}" onclick="showAppointments('${dateStr}')">${day}</span>`;
    }
}

// 날짜 클릭하면 그 날짜에 어떤 약속 있는지 간단히 alert
function showAppointments(dateStr) {
    const apps = appointments.filter(app => app.date === dateStr);
    if (apps.length === 0) {
        alert(`${dateStr}에는 약속이 없어요!`);
        return;
    }
    const titles = apps.map(app => `• ${app.title}`).join('\n');
    alert(`${dateStr} 약속 목록\n\n${titles}`);
}

prevMonthBtn.onclick = () => {
    displayedDate.setMonth(displayedDate.getMonth() - 1);
    renderCalendar();
};

nextMonthBtn.onclick = () => {
    displayedDate.setMonth(displayedDate.getMonth() + 1);
    renderCalendar();
};

// 초기화
window.onload = () => {
    renderCalendar();
};