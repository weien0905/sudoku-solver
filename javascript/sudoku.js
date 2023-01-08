/**
 * Sudoku solver with backtracking search and AC-3 algorithm
 */

class Sudoku {
    constructor(grid) {
        /**
         * Initialise the variables and domains based on the given grid
         */

        // Throw exception if the grid of the sudoku is not 9x9
        if (grid.length !== 9) throw "Sudoku grid must be 9x9.";
        
        for (let i = 0; i < 9; i++) {
            if (grid[i].length !== 9) throw "Sudoku grid must be 9x9.";
        }
        
        this.explored = 0;

        // Get the variables which are the empty cells in the grid
        this.variables = [];
        for (let i = 0; i < 9; i++) {
            for (let j = 0; j < 9; j++) {
                if (!grid[i][j]) this.variables.push([i, j]);
            }
        }

        // Assign the value of the empty cells with None initially
        this.values = grid;

        // Assign domains to variables based on unary constraint to ensure node consistency
        this.domains = structuredClone(grid);
        for (let cell of this.variables) {
            let [x, y] = cell;
            this.domains[x][y] = new Set([1, 2, 3, 4, 5, 6, 7, 8, 9])

            // Unary constraint on row
            for (let i = 0; i < 9; i++) {
                if (i === y) continue;
                if (this.domains[x][y].has(grid[x][i])) this.domains[x][y].delete(grid[x][i]);
            }

            // Unary constraint on column
            for (let i = 0; i < 9; i++) {
                if (i === x) continue;
                if (this.domains[x][y].has(grid[i][y])) this.domains[x][y].delete(grid[i][y]);
            }

            // Unary constraint on sub-grid
            let start_x = x - (x % 3);
            let start_y = y - (y % 3);

            for (let i = start_x; i < start_x + 3; i++) {
                for (let j = start_y; j < start_y + 3; j++) {
                    if (i === x && j === y) continue;
                    if (this.domains[x][y].has(grid[i][j])) this.domains[x][y].delete(grid[i][j]);
                }
            }
        }
    }
    
    solve(show_explored=false) {
        /**
         * Returns a 2D list of solution
         */
        let solution = this.backtrack(this.values, this.domains)
        let explored = this.explored

        return (show_explored) ? [solution, explored] : solution
    }

    backtrack(values, domains) {
        /**
         * Solve the puzzle by using backtracking search. Recursively calling itself until there is a solution
         */

        // Check whether the puzzle has been solved
        if (values.every(row => row.every(cell => cell !== null))) return values;

        this.explored++;

        // Select an unassigned variable
        let v = this.unassigned_variable(values, domains);
        let [x, y] = v;

        // Iterate over all values in the domain of the cell
        for (let value of domains[x][y]) {
            let new_values = structuredClone(values);
            let new_domains = structuredClone(domains);
            new_values[x][y] = value;
            // usestate here; new values
            // Check whether the new value assigned is arc consistent
            if (this.consistent(v, new_values)) {
                new_domains[x][y] = new Set([value]);
                // Draw inferences based on the new value assigned
                let inferences = this.ac3(v, new_domains);
                // Consider next option if the cell has no solution
                if (!inferences) continue;
                // Call itself recursively to consider options for other cells
                let result = this.backtrack(new_values, new_domains);
                if (result) return result;
            }
        }
        return null;
    }

    unassigned_variable(values, domains) {
        /**
         * Select an unassigned variable using Minimum Remaining Values (MRV) and Degree heuristic
         */

        // Initialise the value of MRV which is greater than the maximum possible value
        let mrv = 10
        
        // Initialise the minimum possible value of degree
        let degree = 0;

        let candidate = null;

        let unassgined_variables = []
        for (let i = 0; i < 9; i++) {
            for (let j = 0; j < 9; j++) {
                if (values[i][j] === null) unassgined_variables.push([i, j]);
            }
        }

        for (let v of unassgined_variables) {
            let [x, y] = v;
            if (domains[x][y].size <= mrv) {
                candidate = v;
                mrv = domains[x][y].size;
                let n = this.neighbours(v).length;
                if (n > degree) {
                    candidate = v;
                    degree = n;
                }
            }
        }
        return candidate;
    }

    consistent (v, values) {
        /**
         * Check arc consistency for binary constraint
         */

        for (let neighbour of this.neighbours(v)) {
            let [x, y] = v;
            let [i, j] = neighbour;
            if (values[x][y] === values[i][j]) return false;
        }
        return true;
    }

    neighbours (v) {
        /**
         * Returns neighbours for a given cell
         */

        let [x, y] = v;

        let neighbours = new Set();

        // Neighbours for same row
        for (let i = 0; i < 9; i++) {
            if (!(i === y) && (itemInArray(this.variables, [x, i]))) neighbours.add(JSON.stringify([x, i]));
        }

        // Neighbours for same column
        for (let i = 0; i < 9; i++) {
            if (!(i === x) && (itemInArray(this.variables, [i, y]))) neighbours.add(JSON.stringify([i, y]));
        }

        // Neighbours for same sub-grid
        let start_x = x - (x % 3);
        let start_y = y - (y % 3);

        for (let i = start_x; i < start_x + 3; i++) {
            for (let j = start_y; j < start_y + 3; j++) {
                if (!((i === x) && (j === y)) && (itemInArray(this.variables, [i, j]))) neighbours.add(JSON.stringify([i, j]));
            }
        }

        let neighbours_array = []
        for (let elem of neighbours) {
            neighbours_array.push(JSON.parse(elem));
        }
        return neighbours_array;
    }

    ac3(v, domains) {
        /**
         * Ensure arc consistency for all related nodes of the variable
         */

        let queue = [];
        for (let neighbour of this.neighbours(v)) {
            queue.push([neighbour, v]);
        }

        while (queue.length > 0) {
            let [a, b] = queue.shift();
            if (this.revise(a, b, domains)) {
                // No possible solution
                if (domains[a[0]][b[0]].size === 0) return false;
                let s = new Set(this.neighbours(a));
                let new_neighbours = Array.from(s).filter(function(elem) {
                    return (JSON.stringify(elem) !== JSON.stringify(b))
                });
                for (let c of new_neighbours) {
                    // New inferences only can be made if it is the only value in the domain
                    if (domains[a[0]][a[1]].size === 1) queue.push([c, a]);
                }
            }
        }
        return true;
    }

    revise(a, b, domains) {
        /**
         * Ensure arc consistency between two nodes
         */
        for (let value of domains[a[0]][a[1]]) {
            // Remove duplicate values if it is inconsistent between two nodes
            if (domains[b[0]][b[1]].has(value)) {
                domains[a[0]][a[1]].delete(value);
                return true;
            }
        }
        return false;
    }
}

// Check if an array is in another array
function itemInArray(arr, item) {
    return arr.some(elem => {
        return JSON.stringify(elem) === JSON.stringify(item);
    });
}

export default Sudoku;
