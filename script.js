// Import the functions you need from the SDKs you need
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-app.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-analytics.js";
import { getDatabase, ref, push, set, remove, update, get } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-database.js";
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
const database = getDatabase(app);

// 최초 방문 시 localStorage에 userId 저장
if (!localStorage.getItem('userId')) {
    localStorage.setItem('userId', 'user_' + Math.random().toString(36).substr(2, 9));
}
const userId = localStorage.getItem('userId');

let currentUid = null;
let commentList = null;
let createComment = null;

firebase.auth().onAuthStateChanged(function (user) {
    currentUid = user ? user.uid : null;
    // 로그인 상태가 바뀔 때마다 댓글 새로고침
    loadDailyRatings();
});

document.addEventListener('DOMContentLoaded', function () {
    const emojiButtons = document.querySelectorAll('.emoji-btn');
    const commentTextarea = document.querySelector('textarea');
    const submitButton = document.querySelector('.submit-btn');
    const commentTypeSelector = document.querySelector('.comment-type-selector');
    commentList = document.querySelector('.comment-list');

    // 댓글 생성 함수 전역 할당
    createComment = function (content, rating, type, key, timeString, commentUserId) {
        const commentItem = document.createElement('div');
        commentItem.className = 'comment-item';
        let contentStyle = '';
        if (type === 'private') {
            contentStyle = 'color: #888;';
        }

        // 더보기 메뉴 HTML
        const moreMenuHTML = `
            <div class="more-menu-container" style="position:relative; display:inline-block;">
                <button class="more-btn" style="background:none; border:none; font-size:20px; cursor:pointer;">⋮</button>
                <div class="more-menu" style="display:none; position:absolute; right:0; background:#fff; border:1px solid #ccc; z-index:10;">
                    <div class="edit-btn" style="padding:8px 16px; cursor:pointer;">수정</div>
                    <div class="delete-btn" style="padding:8px 16px; cursor:pointer;">삭제</div>
                </div>
            </div>
        `;

        commentItem.innerHTML = `
            <div class="comment-header" style="display:flex; align-items:center; justify-content:space-between;">
                <div>
                    <span class="comment-time">${timeString || ''}</span>
                    <span class="comment-rating">평가: ${rating}</span>
                    ${type === 'private' ? '<span style="font-size:12px; color:tomato; margin-left:8px;">(비공개)</span>' : ''}
                </div>
                ${moreMenuHTML}
            </div>
            <p class="comment-content" style="${contentStyle}">${content}</p>
        `;

        const commentContent = commentItem.querySelector('.comment-content');

        // 더보기 메뉴 동작
        const moreBtn = commentItem.querySelector('.more-btn');
        const moreMenu = commentItem.querySelector('.more-menu');
        moreBtn.addEventListener('click', function (e) {
            e.stopPropagation();
            moreMenu.style.display = moreMenu.style.display === 'block' ? 'none' : 'block';
        });
        document.addEventListener('click', function () {
            moreMenu.style.display = 'none';
        });

        // 인라인 수정
        commentItem.querySelector('.edit-btn').addEventListener('click', function () {
            moreMenu.style.display = 'none';
            const textarea = document.createElement('textarea');
            textarea.value = commentContent.textContent;
            textarea.style.width = '100%';
            const saveBtn = document.createElement('button');
            saveBtn.textContent = '저장';
            saveBtn.style.marginRight = '8px';
            const cancelBtn = document.createElement('button');
            cancelBtn.textContent = '취소';

            commentContent.style.display = 'none';
            commentContent.parentNode.insertBefore(textarea, commentContent);
            commentContent.parentNode.insertBefore(saveBtn, commentContent);
            commentContent.parentNode.insertBefore(cancelBtn, commentContent);

            saveBtn.addEventListener('click', function () {
                const newComment = textarea.value.trim();
                if (newComment) {
                    updateRating(key, { comment: newComment });
                    commentContent.textContent = newComment;
                }
                textarea.remove();
                saveBtn.remove();
                cancelBtn.remove();
                commentContent.style.display = '';
            });

            cancelBtn.addEventListener('click', function () {
                textarea.remove();
                saveBtn.remove();
                cancelBtn.remove();
                commentContent.style.display = '';
            });
        });

        // 인라인 삭제
        commentItem.querySelector('.delete-btn').addEventListener('click', function () {
            moreMenu.style.display = 'none';
            const confirmDiv = document.createElement('div');
            confirmDiv.style.marginTop = '8px';
            confirmDiv.innerHTML = `
                <span>정말 삭제하시겠습니까?</span>
                <button class="confirm-delete-btn" style="margin-left:8px;">삭제</button>
                <button class="cancel-delete-btn" style="margin-left:4px;">취소</button>
            `;
            commentItem.appendChild(confirmDiv);

            confirmDiv.querySelector('.confirm-delete-btn').addEventListener('click', function () {
                deleteRating(key);
                commentItem.remove();
            });
            confirmDiv.querySelector('.cancel-delete-btn').addEventListener('click', function () {
                confirmDiv.remove();
            });
        });

        return commentItem;
    };

    // 이모지 버튼 클릭 이벤트
    emojiButtons.forEach(button => {
        button.addEventListener('click', function () {
            emojiButtons.forEach(btn => btn.classList.remove('active'));
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
        const newComment = createComment(comment, selectedRating.textContent, commentType, null, null, userId);

        // 댓글을 화면에 표시 (공개/비공개 모두)
        commentList.insertBefore(newComment, commentList.firstChild);

        saveDailyRating(selectedRating.dataset.rating, comment, commentType);
        emojiButtons.forEach(btn => btn.classList.remove('active'));
        commentTextarea.value = '';
        alert('평가가 제출되었습니다. 감사합니다!');
    });

    // 관리자 페이지 기능
    if (document.querySelector('.admin-section')) {
        // 차트 초기화 (실제 구현 시 Chart.js 등의 라이브러리 사용)
        initializeCharts();
    }

    // 페이지 로드시 댓글 로드
    loadDailyRatings();
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

// 평가 저장 함수
function saveDailyRating(rating, comment, commentType) {
    const today = new Date().toISOString().slice(0, 10);
    const ratingRef = ref(database, 'dailyRatings/' + today);
    const newRatingRef = push(ratingRef);
    const user = firebase.auth().currentUser;
    set(newRatingRef, {
        rating,
        comment,
        commentType,
        userId: user ? user.uid : null,
        timestamp: Date.now()
    });
}

function deleteRating(key) {
    const today = new Date().toISOString().slice(0, 10);
    const ratingRef = ref(database, `dailyRatings/${today}/${key}`);
    remove(ratingRef)
        // 성공 시 아무 동작 없음
        .catch(err => alert('삭제 실패: ' + err));
}

function updateRating(key, newData) {
    const today = new Date().toISOString().slice(0, 10);
    const ratingRef = ref(database, `dailyRatings/${today}/${key}`);
    update(ratingRef, newData)
        // 성공 시 아무 동작 없음
        .catch(err => alert('수정 실패: ' + err));
}

// 댓글 로드 함수
function loadDailyRatings() {
    if (!commentList || !createComment) return;
    commentList.innerHTML = ""; // 기존 댓글 초기화

    // 로그아웃 상태면 댓글을 보여주지 않음
    if (!currentUid) {
        return;
    }

    const today = new Date().toISOString().slice(0, 10);
    const ratingRef = ref(database, 'dailyRatings/' + today);

    get(ratingRef).then(snapshot => {
        if (snapshot.exists()) {
            const ratings = snapshot.val();
            // 1. Object.entries로 배열화 후 timestamp 내림차순 정렬
            const sortedEntries = Object.entries(ratings).sort(
                (a, b) => b[1].timestamp - a[1].timestamp
            );
            // 2. 정렬된 배열로 댓글 생성
            sortedEntries.forEach(([key, data]) => {
                if (data.commentType === 'private') {
                    // 비공개 댓글은 본인만 볼 수 있음
                    if (data.userId !== currentUid) return;
                }
                const timeString = new Date(data.timestamp).toLocaleTimeString('ko-KR', {
                    hour: 'numeric',
                    minute: 'numeric',
                    hour12: true
                });
                const commentElement = createComment(
                    data.comment,
                    data.rating,
                    data.commentType,
                    key,
                    timeString,
                    data.userId
                );
                commentList.appendChild(commentElement);
            });
        }
    });
} 