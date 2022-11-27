# Import Sudoku class from the file
from sudoku import Sudoku

# Sudoku grid in 2D list with values from 1-9 and None for empty cells
N = None
grid = [
    [N, N, N, N, N, N, N, N, N],
    [N, N, N, N, N, 3, N, 8, 5],
    [N, N, 1, N, 2, N, N, N, N],
    [N, N, N, 5, N, 7, N, N, N],
    [N, N, 4, N, N, N, 1, N, N],
    [N, 9, N, N, N, N, N, N, N],
    [5, N, N, N, N, N, N, 7, 3],
    [N, N, 2, N, 1, N, N, N, N],
    [N, N, N, N, 4, N, N, N, 9]
]

# Create Sudoku object with argument of Sudoku grid
s = Sudoku(grid)

# # Print solution in 2D list
# solution = s.solve()
# print(solution)

# Print solution in tuple of (solution, states_explored)
solution = s.solve(show_explored=True)
print(solution[0])

# Print the number of states explored in the terminal
print(f"States explored: {solution[1]}")