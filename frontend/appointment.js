// 11.29 추가사항. user.html의 핵심 비즈니스 로직 (약속 관리 및 D-Day 계산)을 담당
// 이 파일은 향후 약속 등록/수정/삭제 (CRUD) 로직이 추가될 중심 파일입니다.

// 상수 정의: localStorage 키
const APPOINTMENTS_KEY = 'ko_og_appointments';
// HTML 요소 참조
const appointmentList = document.getElementById('appointment-list');
const emptyMessage = document.getElementById('empty-message');
const addAppointmentBtn = document.getElementById('addAppointmentBtn');
const messageModal = document.getElementById('message-modal');
const modalMessage = document.getElementById('modal-message');

// 로그아웃 함수 (전역 함수 - 버튼 작동 보장)
// **수정: window 객체에 명시적으로 할당하여 인라인 이벤트에서 접근 가능하도록 함**
window.logout = function() {
    localStorage.removeItem('ko_og_logged_in');
    localStorage.removeItem('ko_og_username');
    alert('로그아웃이 완료되었습니다.'); 
    window.location.href = '/index.html';
}

// --- 2. 다크 모드 토글 로직 함수 (initializeDarkMode) ---
function initializeDarkMode() {
    const themeToggleBtn = document.getElementById('theme-toggle');
    const themeToggleDarkIcon = document.getElementById('theme-toggle-dark-icon');
    const themeToggleLightIcon = document.getElementById('theme-toggle-light-icon');
    
    // **수정: 초기 로드 시 테마 설정 및 아이콘 표시 로직 개선**
    const isDarkMode = localStorage.getItem('color-theme') === 'dark' || 
                      (!localStorage.getItem('color-theme') && window.matchMedia('(prefers-color-scheme: dark)').matches);
    
    if (isDarkMode) {
        document.documentElement.classList.add('dark');
        if (themeToggleLightIcon) themeToggleLightIcon.classList.remove('hidden');
        if (themeToggleDarkIcon) themeToggleDarkIcon.classList.add('hidden');
    } else {
        document.documentElement.classList.remove('dark');
        if (themeToggleDarkIcon) themeToggleDarkIcon.classList.remove('hidden');
        if (themeToggleLightIcon) themeToggleLightIcon.classList.add('hidden');
    }

    // 클릭 이벤트 리스너 설정
    if (themeToggleBtn) {
        themeToggleBtn.addEventListener('click', function () {
            // 아이콘 토글
            if (themeToggleDarkIcon) themeToggleDarkIcon.classList.toggle('hidden');
            if (themeToggleLightIcon) themeToggleLightIcon.classList.toggle('hidden');
            
            // 다크모드 토글
            if (document.documentElement.classList.contains('dark')) {
                document.documentElement.classList.remove('dark');
                localStorage.setItem('color-theme', 'light');
            } else {
                document.documentElement.classList.add('dark');
                localStorage.setItem('color-theme', 'dark');
            }
        });
    }
}

/**
 * alert() 대신 사용할 사용자 지정 메시지 모달 함수
 */
function showMessage(message) {
    if (modalMessage && messageModal) {
        modalMessage.textContent = message;
        messageModal.classList.remove('hidden');
    } else {
        alert(message); // fallback
    }
}

function closeModal() {
    if (messageModal) {
        messageModal.classList.add('hidden');
    }
}

/**
 * localStorage에서 약속 데이터를 불러오는 함수
 */
function getAppointments() {
    try {
        const data = localStorage.getItem(APPOINTMENTS_KEY);
        return data ? JSON.parse(data) : [];
    } catch (e) {
        console.error("localStorage 데이터를 불러오는 데 실패했습니다.", e);
        return [];
    }
}

/**
 * D-Day를 계산하여 문자열로 반환합니다.
 */
function calculateDDay(dateString) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const appointmentDate = new Date(dateString);
    appointmentDate.setHours(0, 0, 0, 0);

    const diffTime = appointmentDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return 'D-Day 💥';
    if (diffDays > 0) return `D-${diffDays}일`;
    return '약속 지남 🗓️';
}

/**
 * 약속 목록을 화면에 렌더링하는 함수
 */
function renderAppointments() {
    // **수정: 샘플 데이터 생성 로직을 함수 시작 부분으로 이동**
    let currentAppointments = getAppointments();
    
    // 임시 데이터가 없으면 샘플 데이터를 생성하여 localStorage에 저장
    if (currentAppointments.length === 0) {
        const sampleData = [{
            id: '1', 
            title: '웹프로젝트 발표 준비', 
            date: '2025-12-05', 
            time: '18:00', 
            place: '제3공학관', 
            penalty: '지각 시 아메리카노 1잔', 
            status: '예정'
        }, {
            id: '2', 
            title: '팀원과의 약속 (벌칙: 짜장면)', 
            date: '2025-12-01', 
            time: '12:30', 
            place: '학교 식당', 
            penalty: '벌칙: 짜장면 쏘기', 
            status: '예정'
        }, {
            id: '3', 
            title: '지난 과제 제출', 
            date: '2025-10-30', 
            time: '23:59', 
            place: '온라인', 
            penalty: '패널티 적용됨', 
            status: '지남'
        }];
        
        localStorage.setItem(APPOINTMENTS_KEY, JSON.stringify(sampleData));
        currentAppointments = sampleData; // **수정: 즉시 반영**
    }
    
    // **수정: 목록 초기화 (emptyMessage 제외하고 모두 제거)**
    if (appointmentList) {
        // emptyMessage를 제외한 다른 요소들만 제거
        Array.from(appointmentList.children).forEach(child => {
            if (child.id !== 'empty-message') {
                child.remove();
            }
        });
    }

    // **수정: 빈 목록 처리 로직 개선**
    if (currentAppointments.length === 0) {
        if (emptyMessage) {
            emptyMessage.classList.remove('hidden');
        }
        return;
    }

    // 약속이 있으면 emptyMessage 숨김
    if (emptyMessage) {
        emptyMessage.classList.add('hidden');
    }

    // 1. 약속 날짜가 가까운 순서로 정렬
    currentAppointments.sort((a, b) => new Date(a.date) - new Date(b.date));

    currentAppointments.forEach(app => {
        const dDay = calculateDDay(app.date);
        let statusColor = 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900 dark:text-indigo-300';

        // D-Day 상태에 따라 카드 색상 변경
        if (dDay.includes('D-Day')) {
            statusColor = 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300 font-bold';
        } else if (dDay.includes('약속 지남')) {
            statusColor = 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300 opacity-70';
        }

        // 약속 카드 생성
        const card = document.createElement('div');
        card.className = `p-4 border-l-4 shadow-lg rounded-xl transition duration-300 hover:shadow-xl cursor-pointer font-gowoon bg-white dark:bg-gray-700 ${statusColor.includes('indigo') ? 'border-indigo-500' : statusColor.includes('yellow') ? 'border-yellow-500' : 'border-red-500'}`;
        card.setAttribute('data-id', app.id);

        card.onclick = () => {
            showMessage(`[${app.title}] 약속 상세 페이지로 이동합니다. (ID: ${app.id})`);
        };

        card.innerHTML = `
            <div class="flex justify-between items-center mb-2">
                <h3 class="text-lg font-semibold text-gray-900 dark:text-white truncate font-jalnan">${app.title}</h3>
                <span class="px-3 py-1 text-xs font-bold rounded-full ${statusColor} font-boardmark">${dDay}</span>
            </div>
            <p class="text-sm text-gray-600 dark:text-gray-300 mb-1">
                <span class="font-medium">장소:</span> ${app.place || '미정'}
            </p>
            <p class="text-sm text-gray-600 dark:text-gray-300 mb-1">
                <span class="font-medium">일시:</span> ${app.date} ${app.time}
            </p>
            <p class="text-sm text-gray-600 dark:text-gray-300">
                <span class="font-medium text-red-500 dark:text-red-400">페널티:</span> ${app.penalty}
            </p>
        `;

        if (appointmentList) appointmentList.appendChild(card);
    });
}


// 초기 화면 로드 및 데이터 렌더링
window.onload = function () {
    // 다크 모드 초기화 실행
    initializeDarkMode();

    // 목록 렌더링 실행
    renderAppointments();

    // '새 약속 등록' 버튼 클릭 이벤트
    if (addAppointmentBtn) {
        addAppointmentBtn.addEventListener('click', () => {
            showMessage("약속 등록 폼 (register.html) 페이지로 이동합니다. \n(다음 단계에서 구현 예정)");
        });
    }

    // 11.29 추가사항. 하단 네비게이션 바 버튼 클릭 이벤트 핸들러 (향후 기능 확장 대비)
    const navCalendar = document.getElementById('nav-calendar');
    const navHome = document.getElementById('nav-home');
    const navSchedule = document.getElementById('nav-schedule');

    if (navCalendar) navCalendar.onclick = () => showMessage('달력 기능은 향후 구현될 예정입니다.');
    if (navHome) navHome.onclick = () => showMessage('홈 (약속 목록) 화면입니다.');
    if (navSchedule) navSchedule.onclick = () => showMessage('약속 조율 기능은 향후 구현될 예정입니다.');
};