let students = [];
const seatingChart = document.getElementById('seatingChart');
const generateButton = document.getElementById('generateButton');
const loading = document.getElementById('loading');
const fileUpload = document.getElementById('fileUpload');
let emptySeats = [];

function createSeats() {
    for (let i = 1; i <= 20; i++) {
        const seat = document.createElement('div');
        seat.className = 'seat';
        seat.id = `seat-${i}`;
        const row = Math.ceil(i / 5);
        const col = ((i - 1) % 5) + 1;
        seat.classList.add(`seat-row-${row}`, `seat-col-${col}`);
        seat.innerHTML = `<p>席 ${i}</p>`;
        seatingChart.appendChild(seat);
    }

    // 教卓の追加
    const teacherDesk = document.createElement('div');
    teacherDesk.className = 'teacher-desk';
    teacherDesk.innerHTML = `<p>教卓</p>`;
    teacherDesk.style.gridColumn = '1 / 3';
    teacherDesk.style.gridRow = '5 / 6';
    seatingChart.appendChild(teacherDesk);
}

function assignSeats() {
    const totalSeats = 20;
    const numStudents = students.length;
    const availableSeats = Array.from({ length: totalSeats }, (_, i) => i + 1);
    const assignedStudents = [];

    // 空席にする座席を決定 (生徒が20人未満の場合、#seat-20から順に空席)
    emptySeats = [];
    if (numStudents < totalSeats) {
        for (let i = totalSeats; i > numStudents; i--) {
            emptySeats.push(i);
        }
    }

    // 空席の座席を availableSeats から削除
    emptySeats.forEach(seat => {
        const index = availableSeats.indexOf(seat);
        if (index !== -1) {
            availableSeats.splice(index, 1);
        }
    });

    // 特定の座席が指定されている生徒を先に配置
    students.filter(student => student.specialSeats).forEach(student => {
        const availableSpecialSeats = student.specialSeats.filter(seat => availableSeats.includes(seat));
        if (availableSpecialSeats.length > 0) {
            const selectedSeat = availableSpecialSeats[Math.floor(Math.random() * availableSpecialSeats.length)];
            assignedStudents.push({ ...student, assignedSeat: selectedSeat });
            availableSeats.splice(availableSeats.indexOf(selectedSeat), 1);
        }
    });

    // 残りの生徒をランダムに配置
    const remainingStudents = students.filter(student => !assignedStudents.some(as => as.number === student.number));
    remainingStudents.sort(() => Math.random() - 0.5).forEach(student => {
        let selectedSeat;
        do {
            selectedSeat = availableSeats[Math.floor(Math.random() * availableSeats.length)];
        } while (!isValidSeat(student, selectedSeat, assignedStudents));

        assignedStudents.push({ ...student, assignedSeat: selectedSeat });
        availableSeats.splice(availableSeats.indexOf(selectedSeat), 1);
    });

    // 割り当てられた生徒を返す
    return assignedStudents;
}

function displayAssignedSeats(assignedStudents) {
    // すべての座席をリセット
    for (let i = 1; i <= 20; i++) {
        const seatElement = document.getElementById(`seat-${i}`);
        seatElement.innerHTML = '';
    }

    // 生徒を表示
    assignedStudents.forEach(student => {
        const seatElement = document.getElementById(`seat-${student.assignedSeat}`);
        seatElement.innerHTML = `
            <p class="number">${student.number}</p>
            <p>${student.name}</p>
        `;
    });

    // 空席を表示（席番号なし）
    emptySeats.forEach(seat => {
        const seatElement = document.getElementById(`seat-${seat}`);
        seatElement.innerHTML = `<p>空席</p>`;
    });
}

function isValidSeat(student, seat, assignedStudents) {
    const adjacentSeats = getAdjacentSeats(seat);
    for (const adjacentSeat of adjacentSeats) {
        const adjacentStudent = assignedStudents.find(as => as.assignedSeat === adjacentSeat);
        if (adjacentStudent && student.specialValue && student.specialValue === adjacentStudent.specialValue) {
            return false;
        }
    }
    return true;
}

function getAdjacentSeats(seat) {
    const row = Math.ceil(seat / 5);
    const col = (seat - 1) % 5 + 1;
    const adjacent = [];

    if (col > 1) adjacent.push(seat - 1);
    if (col < 5) adjacent.push(seat + 1);
    if (row > 1) adjacent.push(seat - 5);
    if (row < 4) adjacent.push(seat + 5);

    return adjacent.filter(s => s >= 1 && s <= 20);
}

function generateSeats() {
    loading.style.display = 'block';
    seatingChart.style.display = 'none';

    setTimeout(() => {
        const assignedStudents = assignSeats();
        displayAssignedSeats(assignedStudents);

        loading.style.display = 'none';
        seatingChart.style.display = 'grid';

        // 抽選ボタンを非表示にする
        generateButton.style.display = 'none';
        fileUpload.style.display = 'none';
    }, 1000);
}

function handleFileUpload(event) {
    const file = event.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function (e) {
            try {
                const fileContent = e.target.result;
                // ファイルの内容を評価して students 変数を設定
                eval(fileContent);
                if (Array.isArray(students) && students.length > 0) {
                    generateButton.disabled = false;
                    alert('生徒データを正常に読み込みました。');
                } else {
                    alert('有効な生徒データが見つかりませんでした。');
                }
            } catch (error) {
                console.error('ファイルの読み込み中にエラーが発生しました:', error);
                alert('ファイルの読み込み中にエラーが発生しました。');
            }
        };
        reader.readAsText(file);
    }
}

createSeats();
generateButton.addEventListener('click', generateSeats);
fileUpload.addEventListener('change', handleFileUpload);