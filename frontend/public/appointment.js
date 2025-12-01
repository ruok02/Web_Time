// 11.29 추가사항. user.html의 핵심 비즈니스 로직 (약속 관리 및 D-Day 계산)을 담당
// 이 파일은 향후 약속 등록/수정/삭제 (CRUD) 로직이 추가될 중심 파일입니다.

// 상수 정의: localStorage 키
const APPOINTMENTS_KEY = 'ko_og_appointments';
// 12.01 추가사항. 편집 및 임시 저장용 키 정의
const TEMP_APPOINTMENT_KEY = 'ko_og_temp_appt';
const EDIT_ID_KEY = 'ko_og_edit_id';

// HTML 요소 참조
const appointmentList = document.getElementById('appointment-list');
const emptyMessage = document.getElementById('empty-message');
const addAppointmentBtn = document.getElementById('addAppointmentBtn');
const messageModal = document.getElementById('message-modal');
const modalMessage = document.getElementById('modal-message');

// 12.01 추가사항. 간편 수정용 전역 변수 및 모달 참조
let currentEditingId = null;
const simpleEditModal = document.getElementById('simple-edit-modal');

// 삭제 확인 모달 관련 변수
let deleteTargetId = null;
const deleteConfirmModal = document.getElementById('delete-confirm-modal');
const deleteAppointmentTitle = document.getElementById('delete-appointment-title');
const confirmDeleteBtn = document.getElementById('confirm-delete-btn');
const cancelDeleteBtn = document.getElementById('cancel-delete-btn');

// 로그아웃 함수 (전역 함수 - 버튼 작동 보장)
function logout() {
    localStorage.removeItem('ko_og_logged_in');
    localStorage.removeItem('ko_og_username');
    alert('로그아웃이 완료되었습니다.');
    window.location.href = '/index.html';
}

/**
 * 11.30 추가사항. 다크 모드 전환 시 동적 요소들의 스타일을 업데이트합니다.
 */
function updateDynamicStyles() {
    renderAppointments(); 
    
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
    const mModal = document.getElementById('message-modal');
    const mMessage = document.getElementById('modal-message');
    if (mMessage && mModal) {
        mMessage.textContent = message;
        mModal.classList.remove('hidden');
    } else {
        alert(message);
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

// --- [수정 관련 함수들] ---

function openSimpleEditModal(id) {
    const appointments = getAppointments();
    const targetAppt = appointments.find(app => app.id === id);

    if (!targetAppt) {
        alert("오류: 약속 정보를 찾을 수 없습니다.");
        return;
    }

    currentEditingId = id;

    document.getElementById('edit-title').value = targetAppt.title;
    document.getElementById('edit-place').value = targetAppt.place || '';
    document.getElementById('edit-participants').value = targetAppt.participants || 0;
    document.getElementById('edit-date').value = targetAppt.date;
    document.getElementById('edit-time').value = targetAppt.time;
    document.getElementById('edit-penalty').value = targetAppt.penalty || '';

    simpleEditModal.classList.remove('hidden');
}

function closeSimpleEditModal() {
    simpleEditModal.classList.add('hidden');
    currentEditingId = null;
}

function saveSimpleEdit() {
    if (!currentEditingId) return;

    const appointments = getAppointments();
    const index = appointments.findIndex(app => app.id === currentEditingId);

    if (index !== -1) {
        const updatedAppt = {
            ...appointments[index],
            title: document.getElementById('edit-title').value,
            place: document.getElementById('edit-place').value,
            participants: document.getElementById('edit-participants').value,
            date: document.getElementById('edit-date').value,
            time: document.getElementById('edit-time').value,
            penalty: document.getElementById('edit-penalty').value
        };

        if (!updatedAppt.title || !updatedAppt.date || !updatedAppt.time) {
            alert("제목, 날짜, 시간은 필수입니다.");
            return;
        }

        appointments[index] = updatedAppt;
        localStorage.setItem(APPOINTMENTS_KEY, JSON.stringify(appointments));
        
        alert("수정이 완료되었습니다.");
        closeSimpleEditModal();
        renderAppointments();
    }
}

// --- [삭제 관련 함수들] ---

function deleteAppointment(id) {
    const appointments = getAppointments();
    const targetAppt = appointments.find(app => app.id === id);
    
    if (!targetAppt) {
        alert("오류: 약속 정보를 찾을 수 없습니다.");
        return;
    }
    
    deleteTargetId = id;
    deleteAppointmentTitle.textContent = targetAppt.title;
    deleteConfirmModal.classList.remove('hidden');
}

function executeDelete() {
    if (!deleteTargetId) return;
    
    const appointments = getAppointments();
    const filteredAppointments = appointments.filter(app => app.id !== deleteTargetId);
    
    localStorage.setItem(APPOINTMENTS_KEY, JSON.stringify(filteredAppointments));
    
    showMessage("약속이 삭제되었습니다.");
    
    closeDeleteModal();
    renderAppointments();
}

function closeDeleteModal() {
    deleteConfirmModal.classList.add('hidden');
    deleteTargetId = null;
}

// --- [렌더링 함수] ---

function renderAppointments() {
    let currentAppointments = getAppointments();
    
    if (appointmentList) {
        appointmentList.innerHTML = '';
    }

    if (currentAppointments.length === 0 && emptyMessage) {
        emptyMessage.classList.remove('hidden');
        if (appointmentList) appointmentList.appendChild(emptyMessage);
        return;
    }

    if (emptyMessage) emptyMessage.classList.add('hidden');

    currentAppointments.sort((a, b) => new Date(a.date) - new Date(b.date));

    currentAppointments.forEach(app => {
        const dDay = calculateDDay(app.date);
        let statusColor = 'bg-indigo-100 text-indigo-700';

        if (dDay.includes('D-Day')) {
            statusColor = 'bg-yellow-100 text-yellow-700 font-bold';
        } else if (dDay.includes('약속 지남')) {
            statusColor = 'bg-red-100 text-red-700 opacity-70';
        }
        
        const cardBgClass = 'bg-white dark:bg-gray-700 dark:text-gray-200';
        const titleTextClass = 'text-gray-900 dark:text-white';
        const bodyTextClass = 'text-gray-600 dark:text-gray-300';
        
        const card = document.createElement('div');
        card.className = `relative p-4 border-l-4 shadow-lg rounded-xl transition duration-300 hover:shadow-xl cursor-pointer font-gowoon ${cardBgClass} ${statusColor.includes('indigo') ? 'border-indigo-500' : statusColor.includes('yellow') ? 'border-yellow-500' : 'border-red-500'}`;
        card.setAttribute('data-id', app.id);

        const participantsText = app.participants ? `${app.participants}명` : '인원 미정';

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
                <button class="edit-btn-action bg-gray-200 hover:bg-gray-300 text-gray-700 px-3 py-1 rounded-lg text-xs font-bold font-boardmark transition">수정</button>
                <button class="delete-btn-action bg-red-100 hover:bg-red-200 text-red-600 px-3 py-1 rounded-lg text-xs font-bold font-boardmark transition">삭제</button>
            </div>
        `;

        const editBtn = card.querySelector('.edit-btn-action');
        const deleteBtn = card.querySelector('.delete-btn-action');

        if(editBtn) {
            editBtn.onclick = (e) => {
                e.stopPropagation();
                openSimpleEditModal(app.id);
            };
        }

        if(deleteBtn) {
            deleteBtn.onclick = (e) => {
                e.stopPropagation();
                deleteAppointment(app.id);
            };
        }

        if (appointmentList) appointmentList.appendChild(card);
    });
}

// --- [초기화] ---

window.onload = function () {
    renderAppointments(); 
    
    // 새 약속 등록 버튼
    if (addAppointmentBtn) {
        addAppointmentBtn.addEventListener('click', () => {
            localStorage.removeItem(EDIT_ID_KEY);
            localStorage.removeItem(TEMP_APPOINTMENT_KEY);
            window.location.href = '/register_Start.html';
        });
    }

    // ✅ 삭제 모달 이벤트 리스너 (여기서 한 번만 등록!)
    if (confirmDeleteBtn) {
        confirmDeleteBtn.addEventListener('click', executeDelete);
    }

    if (cancelDeleteBtn) {
        cancelDeleteBtn.addEventListener('click', closeDeleteModal);
    }

    if (deleteConfirmModal) {
        deleteConfirmModal.addEventListener('click', (e) => {
            if (e.target === deleteConfirmModal) {
                closeDeleteModal();
            }
        });
    }

    // 하단 네비게이션 바 버튼
    document.getElementById('nav-calendar').onclick = () => showMessage('달력 기능은 향후 구현될 예정입니다.');
    document.getElementById('nav-home').onclick = () => showMessage('홈 (약속 목록) 화면입니다.');
    document.getElementById('nav-schedule').onclick = () => showMessage('약속 조율 기능은 향후 구현될 예정입니다.');
};