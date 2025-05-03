// Firebase 설정 (script.js와 동일하게 맞춰주세요)
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

// Firebase 초기화
firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();

document.querySelector('.signup-container').addEventListener('submit', async function (e) {
    e.preventDefault();

    const username = e.target.username.value.trim();
    const password = e.target.password.value;
    const passwordConfirm = e.target.password_confirm.value;

    // 이메일 형식이 아니면 에러
    if (!username || !username.includes('@')) {
        alert('아이디는 이메일 형식이어야 합니다.');
        return;
    }
    if (password.length < 6) {
        alert('비밀번호는 6자 이상이어야 합니다.');
        return;
    }
    if (password !== passwordConfirm) {
        alert('비밀번호가 일치하지 않습니다.');
        return;
    }

    try {
        await auth.createUserWithEmailAndPassword(username, password);
        alert('회원가입이 완료되었습니다! 로그인 해주세요.');
        window.location.href = 'login.html';
    } catch (error) {
        if (error.code === 'auth/email-already-in-use') {
            alert('이미 가입된 이메일입니다.');
        } else {
            alert('회원가입 실패: ' + error.message);
        }
    }
});
