// 11.29 추가사항. login.html과 signup.html이 공유할 공통 인증(Authentication) 로직
// 이 파일은 localStorage 기반의 사용자 인증 처리를 담당합니다.

// 로그인 폼 제출 처리
document.getElementById('loginForm').addEventListener('submit', function (e) {
    e.preventDefault();

    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;

    // localStorage에서 사용자 정보 확인 (간단한 데모 구현) = 사용자 정보를 확인하는 로직
    const users = JSON.parse(localStorage.getItem('ko_og_users') || '[]');
    const user = users.find(u => u.email === email && u.password === password);

    if (user) {
        // 로그인 성공
        localStorage.setItem('ko_og_logged_in', 'true');
        localStorage.setItem('ko_og_username', user.name);
        alert(`환영합니다, ${user.name}님!`);
        // /frontend/public/user.html -> /user.html
        window.location.href = '/user.html';
    } else {
        // 로그인 실패
        alert('이메일 또는 비밀번호가 일치하지 않습니다.');
    }
});

// 이미 로그인된 경우 자동으로 user.html로 이동
window.addEventListener('DOMContentLoaded', () => {
    const isLoggedIn = localStorage.getItem('ko_og_logged_in');
    if (isLoggedIn) {
        window.location.href = '/user.html';
    }
});