// 사이드 메뉴 열기/닫기
document.getElementById('menuBtn').addEventListener('click', function () {
    document.getElementById('sideNav').classList.add('active');
    document.body.style.overflow = 'hidden';
});

document.getElementById('closeBtn').addEventListener('click', function () {
    document.getElementById('sideNav').classList.remove('active');
    document.body.style.overflow = 'auto';
});

// 부드러운 스크롤 이동 및 메뉴 닫기
document.querySelectorAll('.side-nav a').forEach(link => {
    link.addEventListener('click', function (e) {
        const href = this.getAttribute('href');
        if (href && href.startsWith('#')) {
            e.preventDefault();
            const target = document.querySelector(href);
            if (target) {
                window.scrollTo({
                    top: target.getBoundingClientRect().top + window.scrollY - document.querySelector('.fixed-header').offsetHeight - 10,
                    behavior: 'smooth'
                });
            }
        }
        document.getElementById('sideNav').classList.remove('active');
        document.body.style.overflow = 'auto';
    });
});

// 이모지 버튼 active 토글
const emojiButtons = document.querySelectorAll('.emoji-btn');
emojiButtons.forEach(button => {
    button.addEventListener('click', function () {
        emojiButtons.forEach(btn => btn.classList.remove('active'));
        this.classList.add('active');
    });
});

// Firebase 설정
const firebaseConfig = {
    apiKey: "AIzaSyBqQhAewg0JIM_nWT8Gx70UwX6bg4e5TPw",
    authDomain: "foodproject-11189.firebaseapp.com",
    projectId: "foodproject-11189",
    storageBucket: "foodproject-11189.firebasestorage.app",
    messagingSenderId: "399708958646",
    appId: "1:399708958646:web:9fabb699c9bea754f39b17",
    measurementId: "G-732D8Z4ZT9",
    databaseURL: "https://foodproject-11189-default-rtdb.asia-southeast1.firebasedatabase.app/"
};
// Firebase 초기화 (중복 방지)
if (!firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
}
const auth = firebase.auth();

// 로그인/로그아웃 버튼 동적 처리
const loginBtn = document.getElementById('loginBtn');
auth.onAuthStateChanged(function (user) {
    if (user) {
        // 로그인 상태: 로그아웃 버튼으로 변경
        loginBtn.textContent = '로그아웃';
        loginBtn.href = "#";
        loginBtn.onclick = function (e) {
            e.preventDefault();
            auth.signOut().then(() => {
                alert('로그아웃 되었습니다.');
                window.location.reload();
            });
        };
    } else {
        // 로그아웃 상태: 로그인 버튼
        loginBtn.textContent = '로그인';
        loginBtn.href = "login.html";
        loginBtn.onclick = null;
    }
});

// 로그인 체크 함수
function requireLogin() {
    if (!firebase.auth().currentUser) {
        alert('로그인을 해주세요.');
        window.location.href = 'login.html';
        return false;
    }
    return true;
}

// 만족도 평가(이모지) 클릭 시 로그인 체크
document.querySelectorAll('.emoji-btn').forEach(button => {
    button.addEventListener('click', function (e) {
        if (!requireLogin()) {
            e.preventDefault();
            return;
        }
        // 기존 active 처리
        document.querySelectorAll('.emoji-btn').forEach(btn => btn.classList.remove('active'));
        this.classList.add('active');
    });
});

// 의견 남기기 제출 버튼 클릭 시 로그인 체크 (가장 먼저 체크!)
const submitButton = document.querySelector('.submit-btn');
if (submitButton) {
    submitButton.addEventListener('click', function (e) {
        // 1. 로그인 체크가 가장 먼저!
        if (!requireLogin()) {
            e.preventDefault();
            return false;
        }

        // 2. 로그인한 경우에만 만족도 체크 등 나머지 검증
        const selectedRating = document.querySelector('.emoji-btn.active');
        if (!selectedRating) {
            alert('만족도를 선택해주세요!');
            return;
        }

        // ... (이하 기존 제출 로직)
    });
}
