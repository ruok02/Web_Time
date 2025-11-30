// 11.30 추가사항. 약속 등록 1단계 (register_Start.html) 로직

// 상수 정의
const TEMP_APPOINTMENT_KEY = 'ko_og_temp_appt';

// --- 초기화 및 이벤트 리스너 설정 (모든 로직의 시작점) ---

window.addEventListener('DOMContentLoaded', () => {
    
    // 1. HTML 요소 안전하게 가져오기
    const participantCountInput = document.getElementById('participant-count');
    const decrementBtn = document.getElementById('decrement-btn');
    const incrementBtn = document.getElementById('increment-btn');
    const noCountCheckbox = document.getElementById('no-count');
    const nextStepBtn = document.getElementById('nextStepBtn');
    
    // 12.01 추가사항. 장소 입력창 요소
    const titleInput = document.getElementById('appt-name');
    const placeInput = document.getElementById('appt-place'); 


    // --- 2. 카운터 버튼 기능 설정 ---
    
    // 감소 버튼 (-)
    if (decrementBtn && participantCountInput) {
        decrementBtn.addEventListener('click', () => {
            let count = parseInt(participantCountInput.value);
            if (isNaN(count)) count = 0;
            
            if (count > 0) {
                participantCountInput.value = count - 1;
            } else {
                participantCountInput.value = 0;
            }
        });
    }

    // 증가 버튼 (+)
    if (incrementBtn && participantCountInput) {
        incrementBtn.addEventListener('click', () => {
            let count = parseInt(participantCountInput.value);
            if (isNaN(count)) count = 0;
            participantCountInput.value = count + 1;
        });
    }

    // 체크박스 (인원수 미정)
    if (noCountCheckbox) {
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


    // --- 3. 다음 버튼 클릭 (저장 및 이동) 로직 ---
    
    if (nextStepBtn) {
        nextStepBtn.addEventListener('click', (e) => {
            e.preventDefault();

            // 유효성 검사
            if (!titleInput.value.trim()) {
                alert('약속 이름을 입력해주세요.');
                return;
            }
            // 12.01 추가사항. 장소 입력 검사
            if (!placeInput.value.trim()) {
                alert('약속 장소를 입력해주세요.');
                return;
            }
            
            // 데이터 수집
            const participantCount = noCountCheckbox.checked ? null : parseInt(participantCountInput.value);
            
            // 임시 데이터 객체 생성
            const tempData = {
                title: titleInput.value.trim(),
                place: placeInput.value.trim(), // 장소 저장
                participants_count: participantCount,
                no_count: noCountCheckbox.checked,
                schedule: null, 
                penalty: null
            };

            // LocalStorage 저장 및 페이지 이동
            try {
                localStorage.setItem(TEMP_APPOINTMENT_KEY, JSON.stringify(tempData));
                console.log("1단계 데이터 저장 완료:", tempData); // 디버깅용 로그
                window.location.href = '/register_Calendar.html'; 
            } catch (error) {
                alert("데이터 저장에 실패했습니다. (Local Storage 문제)");
                console.error(error);
            }
        });
    }


    // --- 4. 데이터 복원 (뒤로가기 시) ---
    
    const existingData = JSON.parse(localStorage.getItem(TEMP_APPOINTMENT_KEY));
    if (existingData) {
        if(titleInput) titleInput.value = existingData.title || '';
        if(placeInput) placeInput.value = existingData.place || ''; // 장소 복원
        if(noCountCheckbox) noCountCheckbox.checked = existingData.no_count || false;

        // 카운트 복원
        if (existingData.no_count) {
             if(participantCountInput) participantCountInput.readOnly = true;
        } else {
             // 기본값 0으로 복원
             if(participantCountInput) participantCountInput.value = existingData.participants_count >= 0 ? existingData.participants_count : '0';
        }
    }
});