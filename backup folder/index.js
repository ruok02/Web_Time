// --- 1. 다크 모드 토글 로직 ---
const themeToggleBtn = document.getElementById('theme-toggle');
const themeToggleDarkIcon = document.getElementById('theme-toggle-dark-icon');
const themeToggleLightIcon = document.getElementById('theme-toggle-light-icon');

if (localStorage.getItem('color-theme') === 'dark' || (!('color-theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
    document.documentElement.classList.add('dark');
    themeToggleLightIcon.classList.remove('hidden');
} else {
    document.documentElement.classList.remove('dark');
    themeToggleDarkIcon.classList.remove('hidden');
}

themeToggleBtn.addEventListener('click', function () {
    themeToggleDarkIcon.classList.toggle('hidden');
    themeToggleLightIcon.classList.toggle('hidden');
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

// --- 2. 개별 섹션 애니메이션 로직 ---
document.addEventListener('DOMContentLoaded', () => {

    // [SECTION 1] 달력 애니메이션 로직
    const sectionCalendar = document.getElementById('section-calendar');
    const imgMainCalendar = document.getElementById('img-main-calendar');
    const monthlyCalendarGroup = document.getElementById('monthly-calendar-group');
    const monthlyImages = monthlyCalendarGroup.querySelectorAll('img');

    let calendarInterval = null;
    let calendarTimeout = null; // [추가] 초기 딜레이를 제어할 타임아웃 변수
    let currentMonthIndex = 0;

    const startCalendarAnim = () => {
        // 실행 중이면 중복 실행 방지 (Timeout도 확인)
        if (calendarInterval || calendarTimeout) return;

        // 1. 달력 그룹 컨테이너 보이기
        monthlyCalendarGroup.classList.remove('opacity-0');
        monthlyCalendarGroup.classList.add('opacity-100');

        // [수정] 시작 시 표지 이미지를 확실하게 보여줌 (숨기지 않음)
        imgMainCalendar.classList.remove('opacity-0', '-z-10');
        imgMainCalendar.classList.add('opacity-100', 'z-10');

        // 월별 이미지는 일단 숨김 및 초기화
        monthlyImages.forEach(img => {
            img.classList.remove('opacity-100', 'flip-scale-up-exit');
            img.classList.add('opacity-0');
            img.style.zIndex = '';
        });

        // [수정] 1.5초 뒤에 표지를 숨기고 애니메이션 루프 시작
        calendarTimeout = setTimeout(() => {
            // 표지 숨김 (뒤로 보내기)
            imgMainCalendar.classList.remove('opacity-100', 'z-10');
            imgMainCalendar.classList.add('opacity-0', '-z-10');

            // 1월 보이기
            monthlyImages[0].classList.remove('opacity-0');
            monthlyImages[0].classList.add('opacity-100');
            currentMonthIndex = 0;

            // 루프 시작
            calendarInterval = setInterval(() => {
                if (currentMonthIndex >= 11) {
                    clearInterval(calendarInterval);
                    calendarInterval = null;
                    return;
                }
                const currentImg = monthlyImages[currentMonthIndex];
                const nextImg = monthlyImages[currentMonthIndex + 1];

                // 다음 달 미리 준비
                if (nextImg) {
                    nextImg.style.zIndex = '10';
                    nextImg.classList.remove('opacity-0');
                    nextImg.classList.add('opacity-100');
                }

                // 현재 달 넘기기 (플립 애니메이션)
                if (currentImg) {
                    currentImg.style.zIndex = '20';
                    currentImg.classList.add('flip-scale-up-exit');

                    setTimeout(() => {
                        currentImg.classList.remove('flip-scale-up-exit', 'opacity-100');
                        currentImg.classList.add('opacity-0');
                        currentImg.style.zIndex = '';
                        if (nextImg) nextImg.style.zIndex = '';
                    }, 600);
                }

                currentMonthIndex++;
            }, 1200);

            calendarTimeout = null; // 타임아웃 종료 표시
        }, 1500); // 1.5초 딜레이 (표지 감상 시간)
    };

    const stopCalendarAnim = () => {
        // 실행 중인 인터벌 정지
        if (calendarInterval) {
            clearInterval(calendarInterval);
            calendarInterval = null;
        }
        // [수정] 대기 중인 타임아웃도 정지 (스크롤을 빨리 내렸을 경우 대비)
        if (calendarTimeout) {
            clearTimeout(calendarTimeout);
            calendarTimeout = null;
        }

        // 초기화 상태로 복구 (표지 보여주기)
        monthlyCalendarGroup.classList.remove('opacity-100');
        monthlyCalendarGroup.classList.add('opacity-0');

        // 표지 이미지 복구
        imgMainCalendar.classList.remove('opacity-0', '-z-10');
        imgMainCalendar.classList.add('opacity-100', 'z-10');

        monthlyImages.forEach(img => {
            img.classList.remove('opacity-100', 'flip-scale-up-exit');
            img.classList.add('opacity-0');
        });
    };

    const calendarObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                startCalendarAnim();
            } else {
                stopCalendarAnim();
            }
        });
    }, { threshold: 0.5 });
    if (sectionCalendar) calendarObserver.observe(sectionCalendar);


    // [SECTION 2] 약속 등록 애니메이션 로직
    const sectionPromise = document.getElementById('section-promise');
    const promiseGroup = document.getElementById('promise-image-group');
    const promiseImages = promiseGroup ? promiseGroup.querySelectorAll('img') : [];
    let promiseInterval = null;
    let currentPromiseIndex = 0;

    const startPromiseAnim = () => {
        if (promiseInterval) return;
        promiseImages.forEach((img, idx) => {
            if (idx === 0) {
                img.classList.remove('opacity-0');
                img.classList.add('opacity-100');
            } else {
                img.classList.remove('opacity-100');
                img.classList.add('opacity-0');
            }
        });
        currentPromiseIndex = 0;
        promiseInterval = setInterval(() => {
            if (currentPromiseIndex >= 3) {
                clearInterval(promiseInterval);
                promiseInterval = null;
                return;
            }
            promiseImages[currentPromiseIndex].classList.remove('opacity-100');
            promiseImages[currentPromiseIndex].classList.add('opacity-0');
            currentPromiseIndex++;
            promiseImages[currentPromiseIndex].classList.remove('opacity-0');
            promiseImages[currentPromiseIndex].classList.add('opacity-100');
        }, 1200);
    };

    const stopPromiseAnim = () => {
        if (promiseInterval) {
            clearInterval(promiseInterval);
            promiseInterval = null;
        }
        currentPromiseIndex = 0;
        promiseImages.forEach((img, idx) => {
            if (idx === 0) {
                img.classList.remove('opacity-0');
                img.classList.add('opacity-100');
            } else {
                img.classList.remove('opacity-100');
                img.classList.add('opacity-0');
            }
        });
    };

    const promiseObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                startPromiseAnim();
            } else {
                stopPromiseAnim();
            }
        });
    }, { threshold: 0.5 });
    if (sectionPromise) promiseObserver.observe(sectionPromise);


    // [SECTION 3] 11.26 추가 사항. D-Day 카운트다운 애니메이션 로직
    const sectionDday = document.getElementById('section-dday');
    const ddayDisplay = document.getElementById('dday-display');
    const ddaySequence = ['D-7', 'D-6', 'D-5', 'D-4', 'D-3', 'D-2', 'D-1', 'D-Day'];
    let ddayInterval = null;
    let ddayIndex = 0;

    const startDDayAnim = () => {
        if (ddayInterval) return;
        ddayIndex = 0;
        ddayDisplay.innerText = ddaySequence[0];
        // 11.26 수정 사항. 초기화 시 색상 리셋 (D-Day 빨간색 제거)
        ddayDisplay.classList.remove('text-red-600', 'dark:text-red-500', 'scale-125', 'transition-transform', 'duration-300');
        ddayDisplay.classList.add('text-indigo-600', 'dark:text-indigo-400');

        ddayInterval = setInterval(() => {
            ddayIndex++;
            if (ddayIndex >= ddaySequence.length) {
                clearInterval(ddayInterval);
                ddayInterval = null;
                ddayDisplay.innerText = "D-Day";
                // 11.26 수정 사항. D-Day 도달 시 빨간색 강조 적용
                ddayDisplay.classList.remove('text-indigo-600', 'dark:text-indigo-400');
                ddayDisplay.classList.add('text-red-600', 'dark:text-red-500', 'scale-125', 'transition-transform', 'duration-300');
                return;
            }
            ddayDisplay.innerText = ddaySequence[ddayIndex];
            ddayDisplay.classList.remove('pop-in');
            void ddayDisplay.offsetWidth;
            ddayDisplay.classList.add('pop-in');
        }, 1500); // 1.5초 간격으로 카운트다운 (주석 삭제 X)
    };

    const stopDDayAnim = () => {
        if (ddayInterval) {
            clearInterval(ddayInterval);
            ddayInterval = null;
        }
        ddayDisplay.innerText = "D-7";
        // 11.26 수정 사항. 정지 시 색상 초기화
        ddayDisplay.classList.remove('text-red-600', 'dark:text-red-500', 'scale-125', 'transition-transform', 'duration-300');
        ddayDisplay.classList.add('text-indigo-600', 'dark:text-indigo-400');
    };

    const ddayObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) startDDayAnim();
            else stopDDayAnim();
        });
    }, { threshold: 0.5 });
    if (sectionDday) ddayObserver.observe(sectionDday);


    // [SECTION 4] 11.26 추가 사항. 체크인 토글 스위치 로직 (텍스트/아이콘 교체 방식)
    const checkinToggle = document.getElementById('checkin-toggle');
    const checkinStatus = document.getElementById('checkin-status');
    const checkinDesc = document.getElementById('checkin-desc');
    const checkinContainer = document.getElementById('checkin-container');

    if (checkinToggle) {
        checkinToggle.addEventListener('change', (e) => {
            // 텍스트 전환 효과 (Fade Out)
            checkinStatus.style.opacity = '0';
            checkinDesc.style.opacity = '0';

            setTimeout(() => {
                if (e.target.checked) {
                    // ON: 도착 상태
                    checkinStatus.innerHTML = '<span class="mr-2 text-4xl">✅</span> 장소 도착';
                    checkinStatus.className = "mb-8 text-3xl font-bold text-green-600 dark:text-green-400 transition-all duration-300 flex items-center";

                    checkinDesc.innerText = "체크 완료로 페널티 피하기!";
                    checkinDesc.className = "mt-8 text-lg text-green-600 dark:text-green-400 font-medium transition-all duration-300";

                    // 배경색 변경 (녹색 틴트)
                    checkinContainer.classList.remove('bg-gray-100', 'dark:bg-gray-800');
                    checkinContainer.classList.add('bg-green-50', 'dark:bg-green-900/20');
                } else {
                    // OFF: 미도착 상태
                    checkinStatus.innerHTML = '<span class="mr-2 text-4xl">❌</span> 장소 미도착';
                    checkinStatus.className = "mb-8 text-3xl font-bold text-red-500 dark:text-red-400 transition-all duration-300 flex items-center";

                    checkinDesc.innerText = "약속장소 도착 후 체크하기!";
                    checkinDesc.className = "mt-8 text-lg text-gray-500 dark:text-gray-400 font-medium transition-all duration-300";

                    // 배경색 복구
                    checkinContainer.classList.add('bg-gray-100', 'dark:bg-gray-800');
                    checkinContainer.classList.remove('bg-green-50', 'dark:bg-green-900/20');
                }
                // 텍스트 전환 효과 (Fade In)
                checkinStatus.style.opacity = '1';
                checkinDesc.style.opacity = '1';
            }, 200);
        });
    }

    // 초기 로드 시 강제 실행
    startCalendarAnim();
});