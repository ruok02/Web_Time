// 11.30 추가사항. [공통 UI 로직]: 다크 모드 토글 기능을 담당합니다.
// 이 코드는 index.html, user.html, login.html, signup.html 등 모든 페이지에서 참조됩니다.

function initializeDarkMode() {
    // DOM 요소를 안전하게 참조 (이 시점에는 HTML에 SVG가 존재한다고 가정)
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
            // 테마 변경 시 동적 스타일 업데이트 (모든 페이지에서 호출 가능)
            if (typeof updateDynamicStyles === 'function') {
                updateDynamicStyles();
            }
        });
    }
}

// 11.30 추가사항. DOMContentLoaded 시점에 다크 모드 초기화 실행
window.addEventListener('DOMContentLoaded', initializeDarkMode);