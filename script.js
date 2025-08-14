document.addEventListener('DOMContentLoaded', () => {
    const gridContainer = document.getElementById('grid-container');
    const paletteContainer = document.getElementById('palette-container');
    const newGameBtn = document.getElementById('new-game-btn');
    const difficultySelect = document.getElementById('difficulty');
    const loadingContainer = document.getElementById('loading-container');
    const validateBtn = document.getElementById('validate-btn');
    const autofillPenBtn = document.getElementById('autofill-pen-btn');
    const togglePenModeBtn = document.getElementById('toggle-pen-mode-btn');

    let board = []; 
    let solution = [];
    let selectedCell = null;
    let selectedNumber = null;
    let penMode = false;
    let penMarks = Array(81).fill(null).map(() => []);

    function init() {
        // Create the grid cells
        for (let i = 0; i < 81; i++) {
            const cell = document.createElement('div');
            cell.classList.add('cell');
            cell.dataset.index = i;

            const text = document.createElement('span');
            text.classList.add('cell-text');
            cell.appendChild(text);

            const penMarksContainer = document.createElement('div');
            penMarksContainer.classList.add('pen-marks');
            cell.appendChild(penMarksContainer);

            gridContainer.appendChild(cell);
        }

        // Create the number palette
        for (let i = 1; i <= 9; i++) {
            const number = document.createElement('div');
            number.classList.add('number-palette');
            number.textContent = i;
            number.dataset.number = i;
            paletteContainer.appendChild(number);
        }

        // Add event listeners
        newGameBtn.addEventListener('click', newGame);
        validateBtn.addEventListener('click', validateSolution);
        autofillPenBtn.addEventListener('click', autofillPenMarks);
        togglePenModeBtn.addEventListener('click', togglePenMode);
        gridContainer.addEventListener('click', selectCell);
        paletteContainer.addEventListener('click', selectNumber);
    }

    function newGame() {
        loadingContainer.style.display = 'block';
        gridContainer.style.display = 'none';

        setTimeout(() => {
            const difficulty = difficultySelect.value;
            board = generateSudoku();
            solution = JSON.parse(JSON.stringify(board)); // Deep copy
            solveSudoku(solution);
            renderBoard();
            
            loadingContainer.style.display = 'none';
            gridContainer.style.display = 'grid';
        }, 0);
    }

    function generateSudoku() {
        // 1. Create a full solution
        let fullBoard = Array(81).fill(0);
        solveSudoku(fullBoard); // This will generate a full board

        // 2. Poke holes
        let puzzle = [...fullBoard];
        let cells = Array.from({ length: 81 }, (_, i) => i);
        shuffle(cells);

        let removedCount = 0;
        const targetRemoved = 81 - getCluesCount(difficultySelect.value);

        for (const cellIndex of cells) {
            if (removedCount >= targetRemoved) break;

            let temp = puzzle[cellIndex];
            puzzle[cellIndex] = 0;

            if (countSolutions(puzzle) !== 1) {
                puzzle[cellIndex] = temp; // Put it back
            } else {
                removedCount++;
            }
        }
        return puzzle;
    }

    function getCluesCount(difficulty) {
        switch (difficulty) {
            case 'easy': return 35;
            case 'medium': return 30;
            case 'hard': return 25;
            default: return 35;
        }
    }

    function solveSudoku(board) {
        const findEmpty = () => {
            for (let i = 0; i < 81; i++) {
                if (board[i] === 0) return i;
            }
            return -1;
        };

        const emptyIndex = findEmpty();
        if (emptyIndex === -1) return true;

        const row = Math.floor(emptyIndex / 9);
        const col = emptyIndex % 9;

        const nums = [1, 2, 3, 4, 5, 6, 7, 8, 9];
        shuffle(nums);

        for (const num of nums) {
            if (isValid(board, row, col, num)) {
                board[emptyIndex] = num;
                if (solveSudoku(board)) {
                    return true;
                }
                board[emptyIndex] = 0;
            }
        }
        return false;
    }

    function countSolutions(board) {
        let count = 0;
        const findEmpty = () => {
            for (let i = 0; i < 81; i++) {
                if (board[i] === 0) return i;
            }
            return -1;
        };

        const emptyIndex = findEmpty();
        if (emptyIndex === -1) return 1;

        const row = Math.floor(emptyIndex / 9);
        const col = emptyIndex % 9;

        for (let num = 1; num <= 9; num++) {
            if (isValid(board, row, col, num)) {
                board[emptyIndex] = num;
                count += countSolutions(board);
                if (count > 1) return 2; // Optimization
                board[emptyIndex] = 0;
            }
        }
        return count;
    }

    function isValid(board, row, col, num) {
        // Check row
        for (let c = 0; c < 9; c++) {
            if (board[row * 9 + c] === num) return false;
        }
        // Check column
        for (let r = 0; r < 9; r++) {
            if (board[r * 9 + col] === num) return false;
        }
        // Check 3x3 box
        const startRow = Math.floor(row / 3) * 3;
        const startCol = Math.floor(col / 3) * 3;
        for (let r = 0; r < 3; r++) {
            for (let c = 0; c < 3; c++) {
                if (board[(startRow + r) * 9 + (startCol + c)] === num) return false;
            }
        }
        return true;
    }

    function shuffle(array) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
    }

    function renderBoard() {
        const cells = gridContainer.children;
        penMarks = Array(81).fill(null).map(() => []);
        for (let i = 0; i < 81; i++) {
            const cell = cells[i];
            const cellText = cell.querySelector('.cell-text');
            const penMarksContainer = cell.querySelector('.pen-marks');

            cellText.textContent = '';
            penMarksContainer.innerHTML = '';
            cell.classList.remove('fixed', 'selected', 'highlighted');

            if (board[i] !== 0) {
                cellText.textContent = board[i];
                cell.classList.add('fixed');
            }
        }
    }

    function validateSolution() {
        let isCorrect = true;
        let isComplete = true;
        for (let i = 0; i < 81; i++) {
            if (board[i] === 0) {
                isComplete = false;
            }
            if (board[i] !== solution[i]) {
                isCorrect = false;
            }
        }

        if (isComplete) {
            if (isCorrect) {
                alert('Congratulations! You solved the puzzle correctly!');
            } else {
                alert('The solution is incorrect. Keep trying!');
            }
        } else {
            alert('The puzzle is not yet complete. Keep going!');
        }
    }

    function autofillPenMarks() {
        for (let i = 0; i < 81; i++) {
            if (board[i] === 0) {
                penMarks[i] = [];
                for (let num = 1; num <= 9; num++) {
                    if (isValid(board, Math.floor(i / 9), i % 9, num)) {
                        penMarks[i].push(num);
                    }
                }
                const cell = gridContainer.children[i];
                const penMarksContainer = cell.querySelector('.pen-marks');
                renderPenMarks(penMarksContainer, penMarks[i]);
            }
        }
    }

    function togglePenMode() {
        penMode = !penMode;
        togglePenModeBtn.textContent = penMode ? 'Pen Mode (On)' : 'Pen Mode (Off)';
        console.log('Pen mode:', penMode);
    }

    function selectCell(event) {
        const cell = event.target.closest('.cell');
        if (cell) {
            if (selectedCell) {
                selectedCell.classList.remove('selected');
            }
            selectedCell = cell;
            selectedCell.classList.add('selected');
            highlightNumbers(cell.dataset.index);
        }
    }

    function selectNumber(event) {
        const numberDiv = event.target.closest('.number-palette');
        if (numberDiv) {
            if (selectedNumber) {
                selectedNumber.classList.remove('selected');
            }
            selectedNumber = numberDiv;
            selectedNumber.classList.add('selected');

            if (selectedCell && !selectedCell.classList.contains('fixed')) {
                placeNumber(selectedCell, selectedNumber.dataset.number);
            }
        }
    }

    function placeNumber(cell, number) {
        const index = parseInt(cell.dataset.index);
        const cellText = cell.querySelector('.cell-text');
        const penMarksContainer = cell.querySelector('.pen-marks');

        if (penMode) {
            cellText.textContent = '';
            board[index] = 0;
            const mark = parseInt(number);
            if (penMarks[index].includes(mark)) {
                penMarks[index] = penMarks[index].filter(m => m !== mark);
            } else {
                penMarks[index].push(mark);
            }
            renderPenMarks(penMarksContainer, penMarks[index]);
        } else {
            penMarks[index] = [];
            renderPenMarks(penMarksContainer, []);
            board[index] = parseInt(number);
            cellText.textContent = number;
            highlightNumbers(index);

            if (!board.includes(0)) {
                validateSolution();
            }
        }
    }

    function renderPenMarks(container, marks) {
        container.innerHTML = '';
        marks.sort((a, b) => a - b);
        for (const mark of marks) {
            const penMarkDiv = document.createElement('div');
            penMarkDiv.classList.add('pen-mark');
            penMarkDiv.textContent = mark;
            container.appendChild(penMarkDiv);
        }
    }

    function highlightNumbers(index) {
        const cells = gridContainer.children;
        const number = board[index] || (selectedNumber ? selectedNumber.dataset.number : null);

        for (const cell of cells) {
            cell.classList.remove('highlighted');
        }

        if (number) {
            for (let i = 0; i < 81; i++) {
                if (board[i] == number) {
                    cells[i].classList.add('highlighted');
                }
            }
        }
    }
    
    init();
});

