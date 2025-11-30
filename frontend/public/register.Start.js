// 11.30 추가사항. 약속 등록 1단계 (register_Start.html) 로직

// 상수 정의 (상위 레벨에서는 DOM 참조 제거)
const TEMP_APPOINTMENT_KEY = 'ko_og_temp_appt';

// --- 1. 유틸리티 함수 (버튼 작동 문제 해결) ---

/**
 * 11.30 수정사항. [버튼 작동 오류 해결]: 참여 인원수 컨트롤러 (증가/감소)
 * - 버튼의 클릭 이벤트 리스너를 추가하여 input 값을 직접 변경합니다.
 * @param {HTMLElement} input, decrementBtn, incrementBtn, noCountCheckbox - 참조된 DOM 요소
 */
function setupParticipantCounter(participantCountInput, decrementBtn, incrementBtn, noCountCheckbox) {
    
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

function handleNextStepClick() {
    // 12.01 수정사항. DOM 요소를 함수 내부에서 다시 참조 (안전성 보장)
    const participantCountInput = document.getElementById('participant-count');
    const titleInput = document.getElementById('appt-name');
    const placeInput = document.getElementById('appt-place'); 
    const noCountCheckbox = document.getElementById('no-count');
    
    // 1. 유효성 검사
    if (!titleInput.value.trim()) {
        alert('약속 이름을 입력해주세요.');
        return;
    }
    if (!placeInput.value.trim()) {
        alert('약속 장소를 입력해주세요.');
        return;
    }
    
    // 2. 데이터 수집
    const participantCount = noCountCheckbox.checked ? null : parseInt(participantCountInput.value);
    
    // 3. 임시 데이터 구조 생성 및 localStorage 저장
    const tempData = {
        title: titleInput.value.trim(),
        place: placeInput.value.trim(), 
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
}


// --- 3. 초기화 (DOMContentLoaded) ---

window.addEventListener('DOMContentLoaded', () => {
    // 12.01 핵심 수정: 모든 DOM 요소 참조를 이 블록 안으로 옮깁니다.
    const participantCountInput = document.getElementById('participant-count');
    const decrementBtn = document.getElementById('decrement-btn');
    const incrementBtn = document.getElementById('increment-btn');
    const noCountCheckbox = document.getElementById('no-count');
    const nextStepBtn = document.getElementById('nextStepBtn');
    
    const titleInput = document.getElementById('appt-name');
    const placeInput = document.getElementById('appt-place'); 

    // 1. 카운터 이벤트 리스너 설정
    if (participantCountInput && decrementBtn && incrementBtn && noCountCheckbox) {
        setupParticipantCounter(participantCountInput, decrementBtn, incrementBtn, noCountCheckbox);
    }
    
    // 2. '다음' 버튼 클릭 리스너 설정
    if (nextStepBtn) {
        // 12.01 수정사항: 버튼의 type="submit"을 제거했으므로, 클릭 리스너를 직접 연결합니다.
        nextStepBtn.addEventListener('click', (e) => {
             e.preventDefault(); 
             handleNextStepClick();
        });
    }

    // 3. 데이터 복원 로직 (뒤로가기 시 이전 내용 복원)
    const existingData = JSON.parse(localStorage.getItem(TEMP_APPOINTMENT_KEY));
    if (existingData) {
        titleInput.value = existingData.title || '';
        placeInput.value = existingData.place || ''; // 12.01 추가
        noCountCheckbox.checked = existingData.no_count || false;

        // 카운트 복원
        if (existingData.no_count) {
             participantCountInput.readOnly = true;
        } else {
             // 11.30 수정사항. 기본값 0으로 복원 (min="0" 반영)
             participantCountInput.value = existingData.participants_count >= 0 ? existingData.participants_count : '0';
        }
    }
});