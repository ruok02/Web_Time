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

/**
 * alert() 대신 사용할 사용자 지정 메시지 모달 함수
 * @param {string} message - 표시할 메시지 내용
 */
function showMessage(message) {
    modalMessage.textContent = message;
    messageModal.classList.remove('hidden');
}

function closeModal() {
    messageModal.classList.add('hidden');
}

/**
 * localStorage에서 약속 데이터를 불러오는 함수
 * @returns {Array<Object>} 저장된 약속 객체 배열 (없으면 빈 배열)
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
 * @param {string} dateString - 약속 날짜 ('YYYY-MM-DD')
 * @returns {string} D-Day 문자열
 */
function calculateDDay(dateString) {
    const today = new Date();
    // 시간 정보를 제거하여 순수 날짜만 비교
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

    const appointments = getAppointments();
    appointmentList.innerHTML = ''; // 기존 목록 초기화

    if (appointments.length === 0) {
        // 11.29 변경사항: hidden 클래스를 제거하고 emptyMessage를 직접 추가 (렌더링 시점에만 처리)
        emptyMessage.classList.remove('hidden');
        appointmentList.appendChild(emptyMessage);
        return;
    }

    emptyMessage.classList.add('hidden');

    // 1. 약속 날짜가 가까운 순서로 정렬 (필수 UX)
    appointments.sort((a, b) => new Date(a.date) - new Date(b.date));

    appointments.forEach(app => {
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

        appointmentList.appendChild(card);
    });
}

// 로그아웃 함수
function logout() {
    if (confirm('로그아웃 하시겠습니까?')) {
        localStorage.removeItem('ko_og_logged_in');
        localStorage.removeItem('ko_og_username');
        alert('로그아웃 되었습니다.');
        window.location.href = '/index.html'; // 절대 경로 사용
    }
}

// 초기 화면 로드 및 데이터 렌더링
window.onload = function () {
    // 11.29 변경사항: 임시 데이터가 없으면 샘플 데이터를 생성하여 렌더링 시작
    if (getAppointments().length === 0) {
        const sampleData = [{
            id: '1', title: '웹프로젝트 발표 준비', date: '2025-12-05', time: '18:00', place: '제3공학관', penalty: '지각 시 아메리카노 1잔', status: '예정'
        }, {
            id: '2', title: '팀원과의 약속 (벌칙: 짜장면)', date: '2025-12-01', time: '12:30', place: '학교 식당', penalty: '벌칙: 짜장면 쏘기', status: '예정'
        }, {
            id: '3', title: '지난 과제 제출', date: '2025-10-30', time: '23:59', place: '온라인', penalty: '패널티 적용됨', status: '지남'
        }];
        localStorage.setItem(APPOINTMENTS_KEY, JSON.stringify(sampleData));
    }

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