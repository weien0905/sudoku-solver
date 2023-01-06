"""
Sudoku solver with backtracking search and AC-3 algorithm
"""

import copy

class Sudoku:
    def __init__(self, grid):
        """Initialize the variables and domains based on the given grid"""
        # Raise exception if the grid of the sudoku is not 9x9
        if len(grid) != 9 or not all(len(row) == 9 for row in grid):
            raise Exception("Sudoku grid must be 9x9.")

        self.explored = 0

        # Get the variables which are the empty cells in the grid
        self.variables = []
        for i in range(9):
            for j in range(9):
                if not grid[i][j]:
                    self.variables.append((i, j))

        # Assign the value of the empty cells with None initially
        self.values = grid

        # Assign domains to variables based on unary constraint to ensure node consistency
        self.domains = copy.deepcopy(grid)
        for cell in self.variables:
            x, y = cell
            self.domains[x][y] = set(range(1, 10))
            # Unary constraint on row
            for i in range(9):
                if i == y:
                    continue
                if grid[x][i] in self.domains[x][y]:
                    self.domains[x][y].remove(grid[x][i])

            # Unary constraint on column
            for i in range(9):
                if i == x:
                    continue
                if grid[i][y] in self.domains[x][y]:
                    self.domains[x][y].remove(grid[i][y])

            # Unary constraint on sub-grid
            start_x = x - (x % 3)
            start_y = y - (y % 3)

            for i in range(start_x, start_x + 3):
                for j in range(start_y, start_y + 3):
                    if i == x and j == y:
                        continue
                    if grid[i][j] in self.domains[x][y]:
                        self.domains[x][y].remove(grid[i][j])

    def solve(self, show_explored=False):
        """Returns a 2D list of solution"""
        solution = self.backtrack(self.values, self.domains)
        explored = self.explored

        if show_explored:
            return (solution, explored)
        else:
            return solution

    def backtrack(self, values, domains):
        """Solve the puzzle by using backtracking search. Recursively calling itself until there is a solution"""
        # Check whether the puzzle has been solved
        if all(None not in row for row in values):
            return values

        self.explored += 1

        # Select an unassigned variable
        var = self.unassigned_variable(values, domains)
        x, y = var

        # Iterate over all values in the domain of the cell
        for value in domains[x][y]:
            new_values = copy.deepcopy(values)
            new_domains = copy.deepcopy(domains)
            new_values[x][y] = value
            # Check whether the new value assigned is arc consistent
            if self.consistent(var, new_values):
                new_domains[x][y] = {value}
                # Draw inferences based on the new value assigned
                inferences = self.ac3(var, new_domains)
                # Consider next option if the cell has no solution
                if not inferences:
                    continue
                # Call itself recursively to consider options for other cells
                result = self.backtrack(new_values, new_domains)
                if result:
                    return result
        return None


    def unassigned_variable(self, values, domains):
        """Select an unassigned variable using Minimum Remaining Values (MRV) and Degree heuristic"""
        # Initialize the value of MRV which is greater than the maximum possible value
        mrv = 10
        
        # Initialize the minimum possible value of degree
        degree = 0

        candidate = None

        unassigned_variables = []
        for i in range(9):
            for j in range(9):
                if values[i][j] is None:
                    unassigned_variables.append((i, j))

        for var in unassigned_variables:
            x, y = var
            if len(domains[x][y]) <= mrv:
                candidate = var
                mrv = len(domains[x][y])
                if len(self.neighbours(var)) > degree:
                    candidate = var
                    degree = len(self.neighbours(var))

        return candidate

    def consistent(self, var, values):
        """Check arc consistency for binary constraint"""
        for neighbour in self.neighbours(var):
            x, y = var
            i, j = neighbour
            if values[x][y] == values[i][j]:
                return False

        return True

    def neighbours(self, var):
        """Returns neighbours for a given cell"""
        x, y = var

        neighbours = set()
        # Neighbours for same row
        for i in range(9):
            if not i == y and (x, i) in self.variables:
                neighbours.add((x, i))

        # Neighbours for same column
        for i in range(9):
            if not i == x and (i, y) in self.variables:
                neighbours.add((i, y))

        # Neighbours for same sub-grid
        start_x = x - (x % 3)
        start_y = y - (y % 3)

        for i in range(start_x, start_x + 3):
            for j in range(start_y, start_y + 3):
                if (not (i == x and j == y)) and (i, j) in self.variables:
                    neighbours.add((i, j))

        return list(neighbours)

    def ac3(self, var, domains):
        """Ensure arc consistency for all related nodes of the variable"""
        queue = []
        for neighbour in self.neighbours(var):
            queue.append((neighbour, var))
        while queue:
            a, b = queue.pop(0)
            if self.revise(a, b, domains):
                # No possible solution
                if len(domains[a[0]][a[1]]) == 0:
                    return False
                new_neighbours = list(set(self.neighbours(a)) - {b})
                for c in new_neighbours:
                    # New inferences only can be made if it is the only value in the domain 
                    if len(domains[a[0]][a[1]]) == 1:
                        queue.append((c, a))
        return True

    def revise(self, a, b, domains):
        """Ensure arc consistency between two nodes"""
        revised = False
        duplicate_values = []
        for value in domains[a[0]][a[1]]:
            # Remove duplicate values if it is inconsistent between two nodes
            if value in domains[b[0]][b[1]]:
                duplicate_values.append(value)
                revised = True
        for value in duplicate_values:
            domains[a[0]][a[1]].remove(value)
        return revised
