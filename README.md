# Sudoku Solver

This is a Python script to solve Sudoku puzzles using backtracking search and AC-3 algorithm.

## Usage
Install or copy the Python script from the [file](https://github.com/weien0905/sudoku_solver/blob/main/sudoku.py) and do the following.

```python
# Import Sudoku class from the file
from sudoku import Sudoku

# Create a Sudoku object with argument of a grid in 2D list (values from 1-9 and None for empty cells)
s = Sudoku(grid)

# Returns the solution in 2D list
solution = s.solve()

# Print the solution in the terminal
print(solution)
```

View the number of states explored by passing argument to the solve method.

```python
# Returns a tuple of the solution with (solution, states_explored)
solution = s.solve(show_explored=True)

# Print the solution in the terminal
print(solution[0])

# Print the number of states explored in the terminal
print(f"States explored: {solution[1]}")
```

## License
[MIT](https://github.com/weien0905/sudoku_solver/blob/main/LICENSE)

## Credits
Inspiration from [CS50 AI](https://cs50.harvard.edu/ai/2020/notes/3/).
