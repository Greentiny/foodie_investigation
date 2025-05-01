// Import the functions you need from the SDKs you need
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-app.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-analytics.js";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
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
// 이모지 평가 기능
document.addEventListener('DOMContentLoaded', function () {
    const emojiButtons = document.querySelectorAll('.emoji-btn');
    const commentTextarea = document.querySelector('textarea');
    const submitButton = document.querySelector('.submit-btn');
    const commentTypeSelector = document.querySelector('.comment-type-selector');
    const commentList = document.querySelector('.comment-list');

    // 이모지 버튼 클릭 이벤트
    emojiButtons.forEach(button => {
        button.addEventListener('click', function () {
            // 모든 버튼에서 active 클래스 제거
            emojiButtons.forEach(btn => btn.classList.remove('active'));
            // 클릭된 버튼에 active 클래스 추가
            this.classList.add('active');
        });
    });

    // 제출 버튼 클릭 이벤트
    submitButton.addEventListener('click', function () {
        const selectedRating = document.querySelector('.emoji-btn.active');
        const comment = commentTextarea.value;
        const commentType = document.querySelector('input[name="commentType"]:checked').value;

        if (!selectedRating) {
            alert('만족도를 선택해주세요!');
            return;
        }

        if (!comment.trim()) {
            alert('의견을 입력해주세요!');
            return;
        }

        // 댓글 생성
        const newComment = createComment(comment, selectedRating.textContent, commentType);

        // 공개 댓글이면 화면에 표시
        if (commentType === 'public') {
            commentList.insertBefore(newComment, commentList.firstChild);
        }

        // 여기에 서버로 데이터를 전송하는 코드를 추가할 예정
        console.log('평가:', selectedRating.dataset.rating);
        console.log('의견:', comment);
        console.log('댓글 타입:', commentType);

        // 제출 후 초기화
        emojiButtons.forEach(btn => btn.classList.remove('active'));
        commentTextarea.value = '';
        alert('평가가 제출되었습니다. 감사합니다!');
    });

    // 댓글 생성 함수
    function createComment(content, rating, type) {
        const commentItem = document.createElement('div');
        commentItem.className = 'comment-item';

        const now = new Date();
        const timeString = now.toLocaleTimeString('ko-KR', {
            hour: 'numeric',
            minute: 'numeric',
            hour12: true
        });

        commentItem.innerHTML = `
            <div class="comment-header">
                <span class="comment-time">${timeString}</span>
                <span class="comment-rating">평가: ${rating}</span>
            </div>
            <p class="comment-content">${content}</p>
        `;

        return commentItem;
    }

    // 관리자 페이지 기능
    if (document.querySelector('.admin-section')) {
        // 차트 초기화 (실제 구현 시 Chart.js 등의 라이브러리 사용)
        initializeCharts();
    }
});

// 차트 초기화 함수
function initializeCharts() {
    // 차트 구현을 위한 placeholder
    const chartPlaceholder = document.querySelector('.chart-placeholder');
    if (chartPlaceholder) {
        // 실제 구현 시 Chart.js 등을 사용하여 차트를 그릴 예정
        console.log('차트 초기화');
    }
}

// 관리자 페이지 필터 기능
function filterComments() {
    const periodSelect = document.querySelector('.comment-filters select');
    const searchInput = document.querySelector('.comment-filters input');

    periodSelect.addEventListener('change', updateComments);
    searchInput.addEventListener('input', updateComments);
}

function updateComments() {
    // 실제 구현 시 서버에서 필터링된 댓글을 가져오는 코드를 추가할 예정
    console.log('댓글 필터링 업데이트');
}

// 메뉴 관리 폼 제출
function handleMenuForm() {
    const menuForm = document.querySelector('.menu-form form');
    if (menuForm) {
        menuForm.addEventListener('submit', function (e) {
            e.preventDefault();
            // 실제 구현 시 서버로 메뉴 데이터를 전송하는 코드를 추가할 예정
            console.log('메뉴 등록');
        });
    }
} 