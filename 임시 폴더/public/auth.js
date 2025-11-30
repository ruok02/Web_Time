// 11.29 추가사항. login.html과 signup.html이 공유할 공통 인증(Authentication) 로직
// 이 파일은 localStorage 기반의 사용자 인증 및 회원가입 처리를 담당합니다.

// --- 1. 로그인 폼 제출 처리 (login.html에서 사용) ---
const loginForm = document.getElementById('loginForm');
if (loginForm) {
    loginForm.addEventListener('submit', function (e) {
        e.preventDefault();

        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;

        // localStorage에서 사용자 정보 확인 (간단한 데모 구현)
        const users = JSON.parse(localStorage.getItem('ko_og_users') || '[]');
        const user = users.find(u => u.email === email && u.password === password);

        if (user) {
            // 로그인 성공
            localStorage.setItem('ko_og_logged_in', 'true');
            localStorage.setItem('ko_og_username', user.name);
            alert(`환영합니다, ${user.name}님!`);
            window.location.href = '/user.html'; // 절대 경로 사용
        } else {
            // 로그인 실패
            alert('이메일 또는 비밀번호가 일치하지 않습니다.');
        }
    });
}

// --- 2. 회원가입 폼 제출 처리 (signup.html에서 사용) ---
const signupForm = document.getElementById('signupForm');
if (signupForm) {
    signupForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const name = document.getElementById('name').value.trim();
        const email = document.getElementById('email').value.trim();
        const password = document.getElementById('password').value;
        const passwordConfirm = document.getElementById('password_confirm').value;
        
        // 비밀번호 유효성 검사 (길이 및 일치 여부)
        if (password !== passwordConfirm) {
            alert('비밀번호가 일치하지 않습니다.');
            return;
        }
        if (password.length < 6) {
            alert('비밀번호는 6자리 이상이어야 합니다.');
            return;
        }
        
        // localStorage에서 기존 사용자 목록 가져오기
        const users = JSON.parse(localStorage.getItem('ko_og_users') || '[]');
        
        // 이메일 중복 확인
        if (users.some(u => u.email === email)) {
            alert('이미 등록된 이메일입니다.');
            return;
        }
        
        // 새 사용자 추가
        const newUser = {
            id: Date.now().toString(),
            name: name,
            email: email,
            password: password,
            createdAt: new Date().toISOString()
        };
        
        users.push(newUser);
        localStorage.setItem('ko_og_users', JSON.stringify(users));
        
        // 회원가입 성공
        alert(`회원가입이 완료되었습니다, ${name}님! 로그인 페이지로 이동합니다.`);
        window.location.href = '/login.html'; // 절대 경로 사용 (Vercel 배포 환경 고려)
    });
}


// --- 3. 이미 로그인된 경우 자동 리다이렉트 (login.html, signup.html에서 사용) ---
window.addEventListener('DOMContentLoaded', () => {
    const isLoggedIn = localStorage.getItem('ko_og_logged_in');
    if (isLoggedIn) {
        // 11.29 추가사항. 회원가입 페이지에서는 확인창을 띄우는 로직을 유지
        if (document.title.includes('회원가입')) {
             if (confirm('이미 로그인되어 있습니다. 회원 페이지로 이동하시겠습니까?')) {
                 window.location.href = '/user.html'; // 절대 경로 사용
             }
        } else {
            // 로그인 페이지에서는 바로 리다이렉트 (간결하게)
            window.location.href = '/user.html'; // 절대 경로 사용
        }
    }
});