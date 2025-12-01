// calendar.js
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

    // 공백
    for (let i = 0; i < firstDay; i++) {
        calendarGrid.innerHTML += '<div></div>';
    }

    // 날짜들
    for (let day = 1; day <= daysInMonth; day++) {
        const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
        const thisDate = new Date(year, month, day);
        thisDate.setHours(0, 0, 0, 0);

        let classList = "w-12 h-12 mx-auto flex items-center justify-center rounded-full transition";

        if (hasAppointment(dateStr)) {
            classList += " bg-red-500 text-white font-bold shadow-lg";
        } else if (thisDate.getTime() === today.getTime()) {
            classList += " bg-green-500 text-white font-bold";
        } else {
            classList += " hover:bg-gray-200 dark:hover:bg-gray-700";
        }

        if (thisDate < today) {
            classList += " text-gray-400";
        }

        calendarGrid.innerHTML += `
            <div class="${classList}" onclick="showDayAppointments('${dateStr}')">
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
    const list = dayApps.map(app => `• ${app.title} (${app.time})`).join('\n');
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

window.onload = renderCalendar;