// 11.29 추가사항. user.html의 핵심 비즈니스 로직 (약속 관리 및 D-Day 계산)을 담당
// 이 파일은 향후 약속 등록/수정/삭제 (CRUD) 로직이 추가될 중심 파일입니다.

// 상수 정의: localStorage 키
const APPOINTMENTS_KEY = 'ko_og_appointments';
// HTML 요소 참조 (초기에는 null일 수 있으므로 window.onload에서 안전하게 다시 참조)
const appointmentList = document.getElementById('appointment-list');
const emptyMessage = document.getElementById('empty-message');
const addAppointmentBtn = document.getElementById('addAppointmentBtn');
const messageModal = document.getElementById('message-modal');
const modalMessage = document.getElementById('modal-message');

// 로그아웃 함수 (전역 함수 - 버튼 작동 보장)
function logout() {
    // 11.29 변경사항. [로그아웃 작동 오류 수정]: if(confirm)을 제거하고 즉시 실행
    localStorage.removeItem('ko_og_logged_in');
    localStorage.removeItem('ko_og_username');
    alert('로그아웃이 완료되었습니다.'); // 사용자 요청 메시지
    window.location.href = '/index.html'; // 절대 경로 사용
}

// --- 2. 다크 모드 토글 로직 함수 (initializeDarkMode) ---
function initializeDarkMode() {
    // 11.29 변경사항. [JS 오류 수정]: DOM 요소를 다시 참조하여 안전성 확보
    const themeToggleBtn = document.getElementById('theme-toggle');
    const themeToggleDarkIcon = document.getElementById('theme-toggle-dark-icon');
    const themeToggleLightIcon = document.getElementById('theme-toggle-light-icon');
    
    // 초기 로드 시 테마 설정 및 아이콘 표시
    if (localStorage.getItem('color-theme') === 'dark' || (!('color-theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
        document.documentElement.classList.add('dark');
        if (themeToggleLightIcon) themeToggleLightIcon.classList.remove('hidden');
    } else {
        document.documentElement.classList.remove('dark');
        if (themeToggleDarkIcon) themeToggleDarkIcon.classList.remove('hidden');
    }

    // 클릭 이벤트 리스너 설정
    if (themeToggleBtn) {
        themeToggleBtn.addEventListener('click', function () {
            if (themeToggleDarkIcon) themeToggleDarkIcon.classList.toggle('hidden');
            if (themeToggleLightIcon) themeToggleLightIcon.classList.toggle('hidden');
            
            // 상태 변경 로직
            if (localStorage.getItem('color-theme')) {
                if (localStorage.getItem('color-theme') === 'light') {
                    document.documentElement.classList.add('dark');
                    localStorage.setItem('color-theme', 'dark');
                } else {
                    document.documentElement.classList.remove('dark');
                    localStorage.setItem('color-theme', 'light');
                }
            } else {
                if (document.documentElement.classList.contains('dark')) {
                    document.documentElement.classList.remove('dark');
                    localStorage.setItem('color-theme', 'light');
                } else {
                    document.documentElement.classList.add('dark');
                    localStorage.setItem('color-theme', 'dark');
                }
            }
        });
    }
}

/**
 * alert() 대신 사용할 사용자 지정 메시지 모달 함수
 */
function showMessage(message) {
    // 11.29 변경사항. [모달 오류 수정]: 변수 선언 시점에 null일 수 있으므로 항상 체크
    const mModal = document.getElementById('message-modal');
    const mMessage = document.getElementById('modal-message');
    if (mMessage && mModal) {
        mMessage.textContent = message;
        mModal.classList.remove('hidden');
    } else {
        alert(message); // fallback
    }
}

function closeModal() {
    const mModal = document.getElementById('message-modal');
    if (mModal) {
        mModal.classList.add('hidden');
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
    
    // 11.29 변경사항. [강제 샘플 데이터 업데이트 로직 추가]:
    // 개발 테스트를 위해 이 함수가 호출될 때마다 최신 샘플 데이터로 강제 덮어씁니다.
    const sampleData = [{
        id: '1', title: '조별 과제', date: '2025-11-20', time: '13:00', place: '건축공학관', penalty: '지각 시 아메리카노 1잔', status: '지남'
    },{
        id: '2', title: '웹프로젝트 발표 준비', date: '2025-12-03', time: '10:00', place: 'ICT 1관', penalty: '지각 시 아메리카노 1잔', status: '예정'
    },{
        id: '3', title: '부산 약속', date: '2025-12-21', time: '17:00', place: '부산 서면', penalty: '저녁 쏘기', status: '예정'
    }];
    
    // 1. localStorage에 최신 샘플 데이터로 강제 덮어쓰기
    localStorage.setItem(APPOINTMENTS_KEY, JSON.stringify(sampleData));
    
    // 2. 덮어쓴 데이터를 다시 불러옵니다.
    let currentAppointments = getAppointments(); // let으로 변수 선언 유지
    
    
    // 목록 초기화 및 상태 체크
    if (appointmentList) {
        appointmentList.innerHTML = '';
    }

    // 11.29 추가사항. (덮어쓰기로 인해 이 조건문은 항상 false가 됩니다.)
    if (currentAppointments.length === 0 && emptyMessage) {
        // emptyMessage를 표시
        emptyMessage.classList.remove('hidden');
        if (appointmentList) appointmentList.appendChild(emptyMessage);
        return;
    }
    
    if (emptyMessage) emptyMessage.classList.add('hidden');

    // 1. 약속 날짜가 가까운 순서로 정렬 (필수 UX)
    currentAppointments.sort((a, b) => new Date(a.date) - new Date(b.date));

    currentAppointments.forEach(app => {
        const dDay = calculateDDay(app.date);
        let statusColor = 'bg-indigo-100 text-indigo-700'; // 예정

        // D-Day 상태에 따라 카드 색상 변경
        if (dDay.includes('D-Day')) {
            statusColor = 'bg-yellow-100 text-yellow-700 font-bold';
        } else if (dDay.includes('약속 지남')) {
            statusColor = 'bg-red-100 text-red-700 opacity-70';
        }

        // 약속 카드 생성 (DOM 조작)
        const card = document.createElement('div');
        // 11.29 변경사항: 카드 디자인에 폰트 스타일 추가 (index.html과 동일한 패턴)
        card.className = `p-4 border-l-4 shadow-lg rounded-xl transition duration-300 hover:shadow-xl cursor-pointer font-gowoon ${statusColor.includes('indigo') ? 'border-indigo-500' : statusColor.includes('yellow') ? 'border-yellow-500' : 'border-red-500'}`;
        card.setAttribute('data-id', app.id);

        // 클릭 시 상세 페이지로 이동 (register.html을 임시로 사용)
        card.onclick = () => {
            // 실제 구현 시 window.location.href = `detail.html?id=${app.id}`;
            showMessage(`[${app.title}] 약속 상세 페이지로 이동합니다. (ID: ${app.id})`);
        };

        card.innerHTML = `
            <div class="flex justify-between items-center mb-2">
                <h3 class="text-lg font-semibold text-gray-900 truncate font-jalnan">${app.title}</h3>
                <span class="px-3 py-1 text-xs font-bold rounded-full ${statusColor} font-boardmark">${dDay}</span>
            </div>
            <p class="text-sm text-gray-600 mb-1">
                <span class="font-medium">장소:</span> ${app.place || '미정'}
            </p>
            <p class="text-sm text-gray-600 mb-1">
                <span class="font-medium">일시:</span> ${app.date} ${app.time}
            </p>
            <p class="text-sm text-gray-600">
                <span class="font-medium text-red-500">페널티:</span> ${app.penalty}
            </p>
        `;

        if (appointmentList) appointmentList.appendChild(card);
    });
}


// 초기 화면 로드 및 데이터 렌더링
window.onload = function () {
    // 11.29 변경사항. 다크 모드 초기화 실행
    initializeDarkMode();

    // 목록 렌더링 실행 (샘플 데이터 확인 및 목록 표시)
    renderAppointments();

    // '새 약속 등록' 버튼 클릭 이벤트 (등록 폼으로 이동)
    if (addAppointmentBtn) {
        addAppointmentBtn.addEventListener('click', () => {
            // 실제 구현 시 window.location.href = 'register.html';
            showMessage("약속 등록 폼 (register.html) 페이지로 이동합니다. \n(다음 단계에서 구현 예정)");
        });
    }

    // 11.29 추가사항. 하단 네비게이션 바 버튼 클릭 이벤트 핸들러 (향후 기능 확장 대비)
    document.getElementById('nav-calendar').onclick = () => showMessage('달력 기능은 향후 구현될 예정입니다.');
    document.getElementById('nav-home').onclick = () => showMessage('홈 (약속 목록) 화면입니다.');
    document.getElementById('nav-schedule').onclick = () => showMessage('약속 조율 기능은 향후 구현될 예정입니다.');

};