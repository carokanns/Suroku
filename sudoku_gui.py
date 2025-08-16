import tkinter as tk
from tkinter import messagebox
import random
import copy


def find_empty(board):
    for r in range(9):
        for c in range(9):
            if board[r][c] == 0:
                return r, c
    return None


def is_valid(board, r, c, num):
    if any(board[r][i] == num for i in range(9)):
        return False
    if any(board[i][c] == num for i in range(9)):
        return False
    br, bc = 3 * (r // 3), 3 * (c // 3)
    for i in range(br, br + 3):
        for j in range(bc, bc + 3):
            if board[i][j] == num:
                return False
    return True


def solve_board(board):
    pos = find_empty(board)
    if not pos:
        return True
    r, c = pos
    nums = list(range(1, 10))
    random.shuffle(nums)
    for num in nums:
        if is_valid(board, r, c, num):
            board[r][c] = num
            if solve_board(board):
                return True
            board[r][c] = 0
    return False


def generate_full_board():
    board = [[0] * 9 for _ in range(9)]
    solve_board(board)
    return board


def count_solutions(board):
    pos = find_empty(board)
    if not pos:
        return 1
    r, c = pos
    count = 0
    for num in range(1, 10):
        if is_valid(board, r, c, num):
            board[r][c] = num
            count += count_solutions(board)
            if count > 1:
                break
            board[r][c] = 0
    board[r][c] = 0
    return count


def make_puzzle(difficulty):
    full = generate_full_board()
    puzzle = copy.deepcopy(full)
    clues = {"easy": 35, "medium": 30, "hard": 25}
    cells = [(r, c) for r in range(9) for c in range(9)]
    random.shuffle(cells)
    removed = 0
    target = 81 - clues.get(difficulty, 35)
    for r, c in cells:
        if removed >= target:
            break
        temp = puzzle[r][c]
        puzzle[r][c] = 0
        board_copy = copy.deepcopy(puzzle)
        if count_solutions(board_copy) != 1:
            puzzle[r][c] = temp
        else:
            removed += 1
    return puzzle, full


class SudokuGUI:
    def __init__(self):
        self.root = tk.Tk()
        self.root.title("Sudoku")
        self.cells = [[None for _ in range(9)] for _ in range(9)]
        self.solution = None

        top = tk.Frame(self.root)
        top.pack(pady=10)
        tk.Label(top, text="Difficulty:").grid(row=0, column=0)
        self.difficulty = tk.StringVar(value="easy")
        tk.OptionMenu(top, self.difficulty, "easy", "medium", "hard").grid(row=0, column=1)
        tk.Button(top, text="New Game", command=self.new_game).grid(row=0, column=2, padx=5)
        tk.Button(top, text="Validate", command=self.validate).grid(row=0, column=3, padx=5)
        tk.Button(top, text="Solve", command=self.show_solution).grid(row=0, column=4, padx=5)

        grid = tk.Frame(self.root)
        grid.pack()
        for r in range(9):
            for c in range(9):
                entry = tk.Entry(grid, width=2, font=("Arial", 24), justify="center")
                entry.grid(row=r, column=c, padx=(0 if c % 3 else 2, 2), pady=(0 if r % 3 else 2, 2))
                self.cells[r][c] = entry

        self.new_game()

    def new_game(self):
        puzzle, self.solution = make_puzzle(self.difficulty.get())
        for r in range(9):
            for c in range(9):
                cell = self.cells[r][c]
                cell.config(state="normal")
                cell.delete(0, tk.END)
                if puzzle[r][c] != 0:
                    cell.insert(0, str(puzzle[r][c]))
                    cell.config(state="disabled", disabledforeground="black")

    def get_board(self):
        board = [[0] * 9 for _ in range(9)]
        for r in range(9):
            for c in range(9):
                val = self.cells[r][c].get()
                board[r][c] = int(val) if val.isdigit() else 0
        return board

    def validate(self):
        if self.get_board() == self.solution:
            messagebox.showinfo("Sudoku", "Congratulations! You solved the puzzle correctly!")
        else:
            messagebox.showinfo("Sudoku", "The solution is incorrect. Keep trying!")

    def show_solution(self):
        for r in range(9):
            for c in range(9):
                cell = self.cells[r][c]
                cell.config(state="normal")
                cell.delete(0, tk.END)
                cell.insert(0, str(self.solution[r][c]))
                cell.config(state="disabled", disabledforeground="black")

    def run(self):
        self.root.mainloop()


if __name__ == "__main__":
    gui = SudokuGUI()
    gui.run()
