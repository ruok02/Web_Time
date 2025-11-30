// 11.30 수정사항. 약속 등록 1단계 (register_Start.html) 로직
const TEMP_APPOINTMENT_KEY = 'ko_og_temp_appt';

// 안전한 실행을 위해 모든 로직을 DOMContentLoaded 안에 넣습니다.
window.addEventListener('DOMContentLoaded', () => {
    
    // 1. HTML 요소 참조
    const participantCountInput = document.getElementById('participant-count');
    const decrementBtn = document.getElementById('decrement-btn');
    const incrementBtn = document.getElementById('increment-btn');
    const noCountCheckbox = document.getElementById('no-count');
    const nextStepBtn = document.getElementById('nextStepBtn');
    
    const titleInput = document.getElementById('appt-name');
    const placeInput = document.getElementById('appt-place');

    // 2. 카운터 버튼 로직
    if (decrementBtn && incrementBtn && participantCountInput) {
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
    }

    // 3. 체크박스 로직
    if (noCountCheckbox && participantCountInput) {
        noCountCheckbox.addEventListener('change', (e) => {
            participantCountInput.readOnly = e.target.checked;
            if (decrementBtn) decrementBtn.disabled = e.target.checked;
            if (incrementBtn) incrementBtn.disabled = e.target.checked;
            
            if (e.target.checked) {
                participantCountInput.value = ''; 
            } else {
                participantCountInput.value = '0'; 
            }
        });
    }

    // 4. 다음 버튼 클릭 (저장 및 이동)
    if (nextStepBtn) {
        nextStepBtn.addEventListener('click', (e) => {
            e.preventDefault();

            // 유효성 검사
            if (!titleInput.value.trim()) {
                alert('약속 이름을 입력해주세요.');
                return;
            }
            // 🚨 장소 입력 검사 추가
            if (!placeInput.value.trim()) {
                alert('약속 장소를 입력해주세요.');
                return;
            }
            
            // 데이터 수집
            let participantCount = 0;
            if (!noCountCheckbox.checked) {
                participantCount = parseInt(participantCountInput.value);
                if (isNaN(participantCount)) participantCount = 0;
            } else {
                participantCount = null;
            }
            
            // 임시 데이터 저장
            const tempData = {
                title: titleInput.value.trim(),
                place: placeInput.value.trim(), // 장소 저장
                participants_count: participantCount,
                no_count: noCountCheckbox.checked,
                schedule: null, 
                penalty: null
            };

            try {
                localStorage.setItem(TEMP_APPOINTMENT_KEY, JSON.stringify(tempData));
                // 다음 단계로 이동
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
        if (placeInput) placeInput.value = existingData.place || ''; // 장소 복원
        
        if (noCountCheckbox) {
            noCountCheckbox.checked = existingData.no_count || false;
            if (existingData.no_count) {
                if (participantCountInput) participantCountInput.readOnly = true;
            } else {
                if (participantCountInput) participantCountInput.value = existingData.participants_count >= 0 ? existingData.participants_count : '0';
            }
        }
    }
});