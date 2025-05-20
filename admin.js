// Import the functions you need from the SDKs you need
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-app.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-analytics.js";
import { getDatabase, ref, get, query, orderByChild } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-database.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-auth.js";

// Firebase configuration
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

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const database = getDatabase(app);
const auth = getAuth(app);

// DOM Elements
const commentList = document.querySelector('#comments .comment-list');
const periodSelect = document.querySelector('.comment-filters select');

// 날짜 필터링 함수
function getDateRange(period) {
    const now = new Date();
    const startDate = new Date();

    switch (period) {
        case 'week':
            startDate.setDate(now.getDate() - 7);
            break;
        case 'month':
            startDate.setMonth(now.getMonth() - 1);
            break;
        default: // 'all'
            startDate.setFullYear(now.getFullYear() - 1); // 1년치 데이터
    }

    return {
        start: startDate.toISOString().slice(0, 10),
        end: now.toISOString().slice(0, 10)
    };
}

// 댓글 생성 함수
function createCommentElement(data, date) {
    const commentItem = document.createElement('div');
    commentItem.className = 'comment-item';

    const isPrivate = data.commentType === 'private';
    const privateLabel = isPrivate ? '<span style="color: tomato; margin-left: 8px;">(비공개)</span>' : '';

    commentItem.innerHTML = `
        <p class="comment-date">${date}</p>
        <p class="comment-content">${data.comment}</p>
        <p class="comment-rating">평가: ${data.rating} ${privateLabel}</p>
    `;

    return commentItem;
}

// 댓글 로드 함수
async function loadComments(period = 'all') {
    if (!commentList) return;

    commentList.innerHTML = ''; // 기존 댓글 초기화

    const dateRange = getDateRange(period);
    const ratingsRef = ref(database, 'dailyRatings');

    try {
        const snapshot = await get(ratingsRef);
        if (!snapshot.exists()) return;

        const allComments = [];
        const ratings = snapshot.val();

        // 모든 날짜의 댓글을 하나의 배열로 수집
        Object.entries(ratings).forEach(([date, dayRatings]) => {
            if (date >= dateRange.start && date <= dateRange.end) {
                Object.entries(dayRatings).forEach(([key, data]) => {
                    allComments.push({
                        date,
                        data,
                        timestamp: data.timestamp
                    });
                });
            }
        });

        // timestamp 기준으로 내림차순 정렬
        allComments.sort((a, b) => b.timestamp - a.timestamp);

        // 댓글 표시
        allComments.forEach(({ date, data }) => {
            const commentElement = createCommentElement(data, date);
            commentList.appendChild(commentElement);
        });

    } catch (error) {
        console.error('Error loading comments:', error);
        commentList.innerHTML = '<p>댓글을 불러오는 중 오류가 발생했습니다.</p>';
    }
}

// 기간 선택 이벤트 리스너
if (periodSelect) {
    periodSelect.addEventListener('change', (e) => {
        const period = e.target.value;
        loadComments(period);
    });
}

// 인증 상태 확인 및 초기 데이터 로드
onAuthStateChanged(auth, (user) => {
    if (user) {
        // 관리자 권한 확인 로직 추가 필요
        loadComments();
    } else {
        window.location.href = 'login.html'; // 로그인되지 않은 경우 로그인 페이지로 리다이렉트
    }
}); 