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

document.querySelector('.login-container').addEventListener('submit', async function (e) {
    e.preventDefault();
    const username = e.target.username.value.trim();
    const password = e.target.password.value;

    if (!username || !username.includes('@')) {
        alert('아이디는 이메일 형식이어야 합니다.');
        return;
    }
    if (!password) {
        alert('비밀번호를 입력하세요.');
        return;
    }

    try {
        await auth.signInWithEmailAndPassword(username, password);
        window.location.href = 'index.html';
    } catch (error) {
        if (error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password') {
            showToast('아이디 또는 비밀번호가 올바르지 않습니다.');
        } else {
            showToast('로그인 실패');
        }
    }
});
