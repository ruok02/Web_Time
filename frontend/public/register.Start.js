// 11.30 수정사항. 약속 등록 1단계 (register_Start.html) 로직

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
    
    // 11.30 수정사항. [오류 수정]: input 값을 숫자로 파싱하여 유효성 검사 후 증감
    decrementBtn.addEventListener('click', () => {
        let count = parseInt(participantCountInput.value);
        if (isNaN(count)) count = 1; // 값이 없으면 1로 시작
        if (count > 1) {
            participantCountInput.value = count - 1;
        }
    });

    incrementBtn.addEventListener('click', () => {
        let count = parseInt(participantCountInput.value);
        if (isNaN(count)) count = 1; // 값이 없으면 1로 시작
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


// --- 2. 다크 모드 로직 (register_Calendar, register_Penalty 재사용 예정) ---
// 11.30 추가사항. 다크 모드 로직을 별도로 정의합니다.

function initializeDarkMode() {
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
        });
    }
}


// --- 3. 폼 제출 로직 (다음 단계 이동 및 임시 저장) ---

nextStepBtn.addEventListener('click', (e) => {
    e.preventDefault();

    const titleInput = document.getElementById('appt-name');
    if (!titleInput.value.trim()) {
        alert('약속 이름을 입력해주세요.');
        return;
    }
    
    // 데이터 수집
    // 11.30 수정사항. 카테고리 로직 제거에 따른 수정
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


// --- 4. 초기화 ---

window.addEventListener('DOMContentLoaded', () => {
    // 11.30 추가사항. 다크 모드 초기화
    initializeDarkMode(); 
    setupParticipantCounter();
    
    // 11.30 수정사항. [데이터 복원 로직 간소화]: 카테고리 복원 로직 제거
    const existingData = JSON.parse(localStorage.getItem(TEMP_APPOINTMENT_KEY));
    if (existingData) {
        document.getElementById('appt-name').value = existingData.title || '';
        document.getElementById('no-count').checked = existingData.no_count || false;

        // 카운트 복원
        if (existingData.no_count) {
             participantCountInput.readOnly = true;
        } else {
             participantCountInput.value = existingData.participants_count || '2';
        }
    }
});