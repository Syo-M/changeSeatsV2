// 現在の日付を取得
const today = new Date();

// 日付の形式を指定
const year = today.getFullYear();
const month = String(today.getMonth() + 1).padStart(2, '0'); // 月は0から始まるので+1
const day = String(today.getDate()).padStart(2, '0');

// 変更する日付の文字列を作成
const dateString = `${year}年${month}月${day}日作成`;

// pタグの内容を更新
document.getElementById('date').textContent = dateString;