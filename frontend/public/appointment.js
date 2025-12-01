// 11.29 추가사항. user.html의 핵심 비즈니스 로직 (약속 관리 및 D-Day 계산)을 담당
// 이 파일은 향후 약속 등록/수정/삭제 (CRUD) 로직이 추가될 중심 파일입니다.

// 상수 정의: localStorage 키
const APPOINTMENTS_KEY = 'ko_og_appointments';
// HTML 요소 참조
const appointmentList = document.getElementById('appointment-list');
const emptyMessage = document.getElementById('empty-message');
const addAppointmentBtn = document.getElementById('addAppointmentBtn');
// 11.30 변경사항. 편집 버튼 삭제
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
            // 11.30 추가사항. 다크 모드 전환 후 동적 요소들의 색상 업데이트
            updateDynamicStyles();
        });
    }
}

/**
 * 11.30 추가사항. 다크 모드 전환 시 동적 요소들의 스타일을 업데이트합니다.
 * (목록 카드, 모달 콘텐츠 등)
 */
function updateDynamicStyles() {
    // renderAppointments를 호출하여 목록 카드 전체를 다시 렌더링하면 폰트/배경 색상 클래스가 업데이트됩니다.
    renderAppointments(); 
    
    // 11.30 추가사항. [모달 배경 색상 반전]
    // user.html에 'modal-content' ID가 추가되었으므로 이를 사용합니다.
    const modalContent = document.getElementById('modal-content'); 
    const modalMessageText = document.getElementById('modal-message');
    
    const isDarkMode = document.documentElement.classList.contains('dark');
    
    if (modalContent) {
        if (isDarkMode) {
            // 다크 모드일 때 (흰색 -> 어두운색)
            modalContent.classList.remove('bg-white');
            modalContent.classList.add('dark:bg-gray-900');
        } else {
             // 라이트 모드일 때 (어두운색 -> 흰색)
            modalContent.classList.remove('dark:bg-gray-900');
            modalContent.classList.add('bg-white');
        }
    }
    
    // 11.30 추가사항. [모달 메시지 텍스트 색상 반전]
    if (modalMessageText) {
        if (isDarkMode) {
            modalMessageText.classList.remove('text-gray-700');
            modalMessageText.classList.add('dark:text-gray-300');
        } else {
            modalMessageText.classList.remove('dark:text-gray-300');
            modalMessageText.classList.add('text-gray-700');
        }
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
    
    // 11.29 변경사항. [샘플 데이터/목록 오류 수정]: 변수 선언을 시작 시점으로 이동하여 ReferenceError 방지
    let currentAppointments = getAppointments();
    
    // 12.01 수정사항. [샘플 데이터 제거]: 
    // 사용자 요청에 따라 데이터가 없어도 샘플 데이터를 생성하지 않습니다. (빈 목록 유지)
    
    // 목록 초기화 및 상태 체크
    if (appointmentList) {
        appointmentList.innerHTML = '';
    }

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
        
        // 11.30 추가사항. 다크 모드 폰트/배경색 클래스 설정
        const cardBgClass = 'bg-white dark:bg-gray-700 dark:text-gray-200';
        const titleTextClass = 'text-gray-900 dark:text-white';
        const bodyTextClass = 'text-gray-600 dark:text-gray-300';
        
        // 약속 카드 생성 (DOM 조작)
        const card = document.createElement('div');
        // 11.30 수정사항. 카드에 다크 모드 배경/폰트 클래스 및 굵기 적용
        card.className = `p-4 border-l-4 shadow-lg rounded-xl transition duration-300 hover:shadow-xl cursor-pointer font-gowoon ${cardBgClass} ${statusColor.includes('indigo') ? 'border-indigo-500' : statusColor.includes('yellow') ? 'border-yellow-500' : 'border-red-500'}`;
        card.setAttribute('data-id', app.id);

        // 12.01 추가사항. [인원수 표시]: 장소 밑에 인원수 추가
        const participantsText = app.participants ? `${app.participants}명` : '인원 미정';

        // 12.01 변경사항. [카드 내용]: 하단에 수정/삭제 버튼 영역 추가
        card.innerHTML = `
            <div class="flex justify-between items-center mb-2">
                <h3 class="text-lg font-semibold ${titleTextClass} truncate font-jalnan font-bold">${app.title}</h3>
                <span class="px-3 py-1 text-xs font-bold rounded-full ${statusColor} font-boardmark font-bold">${dDay}</span>
            </div>
            <p class="text-sm ${bodyTextClass} mb-1">
                <span class="font-medium">장소:</span> ${app.place || '미정'}
            </p>
            <p class="text-sm ${bodyTextClass} mb-1">
                <span class="font-medium">인원:</span> ${participantsText}
            </p>
            <p class="text-sm ${bodyTextClass} mb-1">
                <span class="font-medium">일시:</span> ${app.date} ${app.time}
            </p>
            <p class="text-sm ${bodyTextClass} mb-2">
                <span class="font-medium text-red-500">페널티:</span> ${app.penalty}
            </p>
            
            <div class="flex justify-end gap-2 mt-2 pt-2 border-t border-gray-100 dark:border-gray-600">
                <button class="edit-btn-card bg-gray-200 hover:bg-gray-300 text-gray-700 px-3 py-1 rounded-lg text-xs font-bold font-boardmark transition z-10">수정</button>
                <button class="delete-btn-card bg-red-100 hover:bg-red-200 text-red-600 px-3 py-1 rounded-lg text-xs font-bold font-boardmark transition z-10">삭제</button>
            </div>
        `;

        // 12.01 추가사항. [버튼 이벤트 리스너]: 카드 클릭과 분리
        const editBtn = card.querySelector('.edit-btn-card');
        const deleteBtn = card.querySelector('.delete-btn-card');

        if(editBtn) {
            editBtn.onclick = (e) => {
                e.stopPropagation(); // 카드 클릭 이벤트 전파 방지
                showMessage("수정 기능은 구현 대기중입니다.");
            };
        }

        if(deleteBtn) {
            deleteBtn.onclick = (e) => {
                e.stopPropagation(); // 카드 클릭 이벤트 전파 방지
                showMessage("삭제 기능은 구현 대기중입니다.");
            };
        }

        // 클릭 시 상세 페이지로 이동 (register.html을 임시로 사용)
        card.onclick = (e) => {
             // 버튼 클릭 시 상세 보기 이벤트 방지 (2중 안전장치)
             if(e.target.classList.contains('edit-btn-card') || e.target.classList.contains('delete-btn-card')) return;
            // 실제 구현 시 window.location.href = `detail.html?id=${app.id}`;
            showMessage(`[${app.title}] 약속 상세 페이지로 이동합니다. (ID: ${app.id})`);
        };

        if (appointmentList) appointmentList.appendChild(card);
    });
}


// 초기 화면 로드 및 데이터 렌더링
window.onload = function () {
    // 11.29 변경사항. 다크 모드 초기화 실행
    initializeDarkMode();

    // 목록 렌더링 실행 (샘플 데이터 확인 및 목록 표시)
    // 11.30 변경사항. 다크 모드 초기화 후, 동적 스타일 업데이트와 목록 렌더링을 한번에 처리
    
    // '새 약속 등록' 버튼 클릭 이벤트 (등록 폼으로 이동)
    if (addAppointmentBtn) {
        addAppointmentBtn.addEventListener('click', () => {
            // 11.30 변경사항. 파일명 변경 반영 (register_Start.html로 이동)
            window.location.href = '/register_Start.html';
        });
    }

    // 11.30 변경사항. editAppointmentBtn 삭제
  


    // 11.29 추가사항. 하단 네비게이션 바 버튼 클릭 이벤트 핸들러 (향후 기능 확장 대비)
    document.getElementById('nav-calendar').onclick = () => showMessage('달력 기능은 향후 구현될 예정입니다.');
    document.getElementById('nav-home').onclick = () => showMessage('홈 (약속 목록) 화면입니다.');
    document.getElementById('nav-schedule').onclick = () => showMessage('약속 조율 기능은 향후 구현될 예정입니다.');
    
    // 11.30 추가사항. 초기 렌더링 및 스타일 적용
    renderAppointments(); 
};