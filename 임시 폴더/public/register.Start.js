// 11.30 추가사항. 약속 등록 1단계 (register_Start.html) 로직

// 상수 정의
const TEMP_APPOINTMENT_KEY = 'ko_og_temp_appt';
const participantCountInput = document.getElementById('participant-count');
const nextStepBtn = document.getElementById('nextStepBtn');
const noCountCheckbox = document.getElementById('no-count');


// --- 1. 유틸리티 함수 (버튼 작동 문제 해결) ---

/**
 * 11.30 수정사항. [버튼 작동 오류 해결]: 참여 인원수 컨트롤러 (증가/감소)
 * - 버튼의 클릭 이벤트 리스너를 추가하여 input 값을 직접 변경합니다.
 */
function setupParticipantCounter() {
    const decrementBtn = document.getElementById('decrement-btn');
    const incrementBtn = document.getElementById('increment-btn');
    
    // 11.30 수정사항. [증감 로직 수정]: 기본값 0, 0 미만으로 감소 불가
    decrementBtn.addEventListener('click', () => {
        let count = parseInt(participantCountInput.value);
        if (isNaN(count)) count = 0;
        if (count > 0) {
            participantCountInput.value = count - 1;
        } else {
            participantCountInput.value = 0;
        }
    });

    incrementBtn.addEventListener('click', () => {
        let count = parseInt(participantCountInput.value);
        if (isNaN(count)) count = 0;
        participantCountInput.value = count + 1;
    });

    // 체크박스 상태 변경 시 카운터 활성화/비활성화
    noCountCheckbox.addEventListener('change', (e) => {
        participantCountInput.readOnly = e.target.checked;
        decrementBtn.disabled = e.target.checked;
        incrementBtn.disabled = e.target.checked;
        
        if (e.target.checked) {
            participantCountInput.value = ''; // 인원수 미정 시 값 비움
        } else if (!participantCountInput.value) {
            participantCountInput.value = '0'; // 다시 활성화 시 기본값
        }
    });
}


// --- 2. 폼 제출 로직 (다음 단계 이동 및 임시 저장) ---

nextStepBtn.addEventListener('click', (e) => {
    e.preventDefault();

    const titleInput = document.getElementById('appt-name');
    if (!titleInput.value.trim()) {
        alert('약속 이름을 입력해주세요.');
        return;
    }
    
    // 데이터 수집
    const participantCount = noCountCheckbox.checked ? null : parseInt(participantCountInput.value);
    
    // 11.30 추가사항. 임시 데이터 구조 생성 및 localStorage 저장
    const tempData = {
        title: titleInput.value.trim(),
        participants_count: participantCount,
        no_count: noCountCheckbox.checked,
        schedule: null, 
        penalty: null
    };

    try {
        localStorage.setItem(TEMP_APPOINTMENT_KEY, JSON.stringify(tempData));
        // 11.30 수정사항. 2단계 페이지 파일명 변경 반영
        window.location.href = '/register_Calendar.html'; 
    } catch (error) {
        alert("데이터 저장에 실패했습니다. (Local Storage 문제)");
        console.error(error);
    }
});


// --- 3. 초기화 ---

window.addEventListener('DOMContentLoaded', () => {
    // 11.30 수정사항. setupParticipantCounter 호출 (버튼 이벤트 리스너 설정)
    setupParticipantCounter();
    
    // 데이터 복원 로직 (뒤로가기 시 이전 내용 복원)
    const existingData = JSON.parse(localStorage.getItem(TEMP_APPOINTMENT_KEY));
    if (existingData) {
        document.getElementById('appt-name').value = existingData.title || '';
        document.getElementById('no-count').checked = existingData.no_count || false;

        // 카운트 복원
        if (existingData.no_count) {
             participantCountInput.readOnly = true;
        } else {
             // 11.30 수정사항. 기본값 0으로 복원 (min="0" 반영)
             participantCountInput.value = existingData.participants_count >= 0 ? existingData.participants_count : '0';
        }
    }
});