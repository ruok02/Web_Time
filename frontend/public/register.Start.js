// 11.30 추가사항. 약속 등록 1단계 (register_Start.html) 로직

// 상수 정의
const TEMP_APPOINTMENT_KEY = 'ko_og_temp_appt';
const participantCountInput = document.getElementById('participant-count');
const nextStepBtn = document.getElementById('nextStepBtn');
const noCountCheckbox = document.getElementById('no-count');
const categoryButtons = document.querySelectorAll('.category-btn');
let selectedCategory = 'team'; // 기본값 설정

// --- 1. 유틸리티 함수 ---

/**
 * 참여 인원수 컨트롤러 (증가/감소)
 */
function setupParticipantCounter() {
    const decrementBtn = document.getElementById('decrement-btn');
    const incrementBtn = document.getElementById('increment-btn');
    
    decrementBtn.addEventListener('click', () => {
        let count = parseInt(participantCountInput.value);
        if (count > 1) {
            participantCountInput.value = count - 1;
        }
    });

    incrementBtn.addEventListener('click', () => {
        let count = parseInt(participantCountInput.value);
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
            participantCountInput.value = '2'; // 다시 활성화 시 기본값
        }
    });
}

/**
 * 카테고리 버튼 선택 로직
 */
function setupCategorySelection() {
    categoryButtons.forEach(button => {
        button.addEventListener('click', () => {
            // 모든 버튼 초기화
            categoryButtons.forEach(btn => {
                btn.classList.remove('bg-indigo-500', 'text-white', 'shadow');
                btn.classList.add('bg-gray-200', 'dark:bg-gray-700', 'text-gray-700', 'dark:text-gray-300');
            });

            // 선택된 버튼 활성화
            button.classList.add('bg-indigo-500', 'text-white', 'shadow');
            button.classList.remove('bg-gray-200', 'dark:bg-gray-700', 'text-gray-700', 'dark:text-gray-300');
            selectedCategory = button.getAttribute('data-category');
        });
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
        category: selectedCategory,
        title: titleInput.value.trim(),
        participants_count: participantCount,
        no_count: noCountCheckbox.checked,
        // 이 단계에서는 달력/시간 데이터는 아직 비어있음
        schedule: null, 
        penalty: null
    };

    try {
        localStorage.setItem(TEMP_APPOINTMENT_KEY, JSON.stringify(tempData));
        // 2단계 페이지로 이동 (register_Calendar.html)
        window.location.href = '/register_Calendar.html'; 
    } catch (error) {
        alert("데이터 저장에 실패했습니다. (Local Storage 용량 초과 등)");
        console.error(error);
    }
});


// --- 3. 초기화 ---

window.addEventListener('DOMContentLoaded', () => {
    setupParticipantCounter();
    setupCategorySelection();
    
    // 11.30 추가사항. 임시 데이터 로드 (뒤로가기 시 이전에 입력한 내용 복원)
    const existingData = JSON.parse(localStorage.getItem(TEMP_APPOINTMENT_KEY));
    if (existingData) {
        document.getElementById('appt-name').value = existingData.title || '';
        document.getElementById('no-count').checked = existingData.no_count || false;

        // 카운트 복원
        if (existingData.no_count) {
             participantCountInput.readOnly = true;
        } else {
             participantCountCountInput.value = existingData.participants_count || '2';
        }

        // 카테고리 복원
        const categoryToRestore = existingData.category || 'team';
        document.querySelector(`.category-btn[data-category="${categoryToRestore}"]`).click(); // 클릭 이벤트 실행
    }
});