// 11.30 수정사항. 약속 등록 1단계 로직 (register_Start.js)
// 안전한 실행을 위해 모든 로직을 DOMContentLoaded 내부에 배치합니다.

const TEMP_APPOINTMENT_KEY = 'ko_og_temp_appt';

window.addEventListener('DOMContentLoaded', () => {
    // 1. HTML 요소 참조 (이 시점에는 무조건 존재함)
    const participantCountInput = document.getElementById('participant-count');
    const decrementBtn = document.getElementById('decrement-btn');
    const incrementBtn = document.getElementById('increment-btn');
    const noCountCheckbox = document.getElementById('no-count');
    const nextStepBtn = document.getElementById('nextStepBtn');
    
    const titleInput = document.getElementById('appt-name');
    const placeInput = document.getElementById('appt-place');

    // 2. 카운터 버튼 이벤트 리스너 (요소가 존재할 때만 연결)
    if (decrementBtn && incrementBtn && participantCountInput) {
        
        // 감소 버튼 (-)
        decrementBtn.addEventListener('click', () => {
            let count = parseInt(participantCountInput.value);
            if (isNaN(count)) count = 0;
            
            if (count > 0) {
                participantCountInput.value = count - 1;
            } else {
                participantCountInput.value = 0;
            }
        });

        // 증가 버튼 (+)
        incrementBtn.addEventListener('click', () => {
            let count = parseInt(participantCountInput.value);
            if (isNaN(count)) count = 0;
            participantCountInput.value = count + 1;
        });
    }

    // 3. 체크박스 로직
    if (noCountCheckbox && participantCountInput) {
        noCountCheckbox.addEventListener('change', (e) => {
            participantCountInput.readOnly = e.target.checked;
            if (decrementBtn) decrementBtn.disabled = e.target.checked;
            if (incrementBtn) incrementBtn.disabled = e.target.checked;
            
            if (e.target.checked) {
                participantCountInput.value = ''; // 인원수 미정
            } else {
                participantCountInput.value = '0'; // 다시 활성화 시 기본값
            }
        });
    }

    // 4. '다음' 버튼 클릭 로직
    if (nextStepBtn) {
        nextStepBtn.addEventListener('click', (e) => {
            e.preventDefault(); // 기본 동작 방지

            // 입력값 가져오기
            const titleVal = titleInput ? titleInput.value.trim() : '';
            const placeVal = placeInput ? placeInput.value.trim() : '';

            // 유효성 검사
            if (!titleVal) {
                alert('약속 이름을 입력해주세요.');
                return;
            }
            if (!placeVal) {
                alert('약속 장소를 입력해주세요.');
                return;
            }
            
            // 데이터 수집
            let participantCount = 0;
            if (participantCountInput && !noCountCheckbox.checked) {
                participantCount = parseInt(participantCountInput.value);
                if (isNaN(participantCount)) participantCount = 0;
            } else {
                participantCount = null; // 인원수 미정
            }
            
            // 임시 데이터 객체 생성
            const tempData = {
                title: titleVal,
                place: placeInput.value.trim(), // 12.01 장소 저장 안되서 수정 
                participants_count: participantCount,
                no_count: noCountCheckbox ? noCountCheckbox.checked : false,
                schedule: null, 
                penalty: null
            };

            // 저장 및 이동
            try {
                localStorage.setItem(TEMP_APPOINTMENT_KEY, JSON.stringify(tempData));
                console.log("저장된 데이터:", tempData);
                window.location.href = '/register_Calendar.html'; 
            } catch (error) {
                alert("데이터 저장 실패: " + error);
            }
        });
    }

    // 5. 데이터 복원 (뒤로가기 시)
    const existingData = JSON.parse(localStorage.getItem(TEMP_APPOINTMENT_KEY));
    if (existingData) {
        if (titleInput) titleInput.value = existingData.title || '';
        if (placeInput) placeInput.value = existingData.place || '';
        
        if (noCountCheckbox) {
            noCountCheckbox.checked = existingData.no_count || false;
            if (existingData.no_count) {
                if (participantCountInput) participantCountInput.readOnly = true;
                if (decrementBtn) decrementBtn.disabled = true;
                if (incrementBtn) incrementBtn.disabled = true;
            } else {
                if (participantCountInput) participantCountInput.value = existingData.participants_count >= 0 ? existingData.participants_count : '0';
            }
        }
    }
});