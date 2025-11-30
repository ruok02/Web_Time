// 12.01 추가사항. 약속 등록 3단계 (register_Penalty.html) 로직

// 상수 정의
const TEMP_APPOINTMENT_KEY = 'ko_og_temp_appt';
const APPOINTMENTS_KEY = 'ko_og_appointments'; // user.html 목록에 저장될 최종 키
const finishBtn = document.getElementById('finishBtn');
const penaltyDetailsInput = document.getElementById('penalty-details');
const noPenaltyCheckbox = document.getElementById('no-penalty');

// 임시 데이터 로드
let tempAppointmentData = JSON.parse(localStorage.getItem(TEMP_APPOINTMENT_KEY));

// --- 1. 유틸리티 및 초기화 ---

/**
 * 12.01 추가사항. [데이터 가드]: 이전 단계 데이터 누락 시 리다이렉트
 */
function checkDataGuard() {
    if (!tempAppointmentData || !tempAppointmentData.schedule) {
        alert("약속 날짜 정보가 누락되었습니다. 2단계로 돌아갑니다.");
        window.location.href = '/register_Calendar.html';
        return false;
    }
    return true;
}

/**
 * 12.01 추가사항. [최종 저장 로직]: 임시 데이터를 최종 목록에 추가하고 user.html로 이동
 */
function finalizeAppointment(penaltyText) {
    // 1. 최종 약속 객체 생성 (UUID는 없으므로 Timestamp 사용)
    const newAppointment = {
        id: Date.now().toString(),
        title: tempAppointmentData.title || "새 약속",
        date: tempAppointmentData.schedule.date,
        time: tempAppointmentData.schedule.time_arrival,
        place: tempAppointmentData.place || "장소 미정", // 1단계에서 장소 정보가 없었으므로 기본값 설정
        penalty: penaltyText,
        participants: tempAppointmentData.participants_count || 1, // 인원수 또는 기본값 1
        status: "예정"
    };

    // 2. 기존 최종 약속 목록을 불러오기
    const existingAppointments = JSON.parse(localStorage.getItem(APPOINTMENTS_KEY) || '[]');
    
    // 3. 새 약속을 목록에 추가
    existingAppointments.push(newAppointment);
    
    // 4. LocalStorage에 최종 저장
    localStorage.setItem(APPOINTMENTS_KEY, JSON.stringify(existingAppointments));

    // 5. 임시 데이터 삭제 (선택 사항이지만 깔끔하게 정리)
    localStorage.removeItem(TEMP_APPOINTMENT_KEY);

    alert(`'${newAppointment.title}' 약속 등록이 완료되었습니다!`);
    window.location.href = '/user.html';
}

// --- 2. 폼 제출 로직 (완료하기) ---

finishBtn.addEventListener('click', (e) => {
    e.preventDefault();
    
    let penaltyText;
    
    if (noPenaltyCheckbox.checked) {
        penaltyText = "페널티 없음 (자율 이행)";
    } else {
        penaltyText = penaltyDetailsInput.value.trim();
        if (!penaltyText) {
            alert("페널티 내용을 입력하거나 '페널티 없음'을 선택해주세요.");
            return;
        }
    }
    
    // 최종 저장 함수 호출
    finalizeAppointment(penaltyText);
});


// --- 3. 초기화 실행 ---

window.addEventListener('load', () => {
    if (!checkDataGuard()) return;

    // 12.01 추가사항. 체크박스 상태 변경 시 텍스트 영역 활성화/비활성화
    noPenaltyCheckbox.addEventListener('change', (e) => {
        penaltyDetailsInput.disabled = e.target.checked;
        if (e.target.checked) {
            penaltyDetailsInput.value = '';
        }
    });
    
    // 12.01 추가사항. 뒤로가기 시 데이터 복원 로직은 현재 단계에서는 생략 (텍스트 영역이 복잡하지 않으므로)
});