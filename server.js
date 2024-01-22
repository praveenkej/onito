const readlineSync = require('readline-sync');
const saveTicketsToDatabase = require('./saveTicketsToDatabase');

// Define a class to represent each ticket
class Node {
  constructor() {
    // Initialize a 3x9 array to represent the ticket, filled with zeros
    this.A = Array.from({ length: 3 }, () => Array(9).fill(0));
  }

  // Function to get the count of filled cells in a row
  getRowCount(r) {
    return this.A[r].filter((num) => num !== 0).length;
  }

  // Function to get the count of filled cells in a column
  getColCount(c) {
    return this.A.map((row) => row[c]).filter((num) => num !== 0).length;
  }

  // Function to get the index of the first empty cell in a column
  getEmptyCellInCol(c) {
    for (let i = 0; i < 3; i++) {
      if (this.A[i][c] === 0) {
        return i;
      }
    }
    return -1;
  }

  // Function to sort a column with three numbers
  sortColumnWithThreeNumbers(c) {
    const emptyCell = this.getEmptyCellInCol(c);
    if (emptyCell !== -1) {
      throw new Error("Hey! Your column has <3 cells filled, invalid function called");
    }

    const tempArr = [this.A[0][c], this.A[1][c], this.A[2][c]];
    tempArr.sort();

    for (let r = 0; r < 3; r++) {
      this.A[r][c] = tempArr[r];
    }
  }

  // Function to sort a column with two numbers
  sortColumnWithTwoNumbers(c) {
    const emptyCell = this.getEmptyCellInCol(c);
    if (emptyCell === -1) {
      throw new Error("Hey! Your column has 3 cells filled, invalid function called");
    }

    let cell1, cell2;
    if (emptyCell === 0) {
      cell1 = 1;
      cell2 = 2;
    } else if (emptyCell === 1) {
      cell1 = 0;
      cell2 = 2;
    } else {
      cell1 = 0;
      cell2 = 1;
    }

    if (this.A[cell1][c] >= this.A[cell2][c]) {
      [this.A[cell1][c], this.A[cell2][c]] = [this.A[cell2][c], this.A[cell1][c]];
    }
  }

  // Function to sort a column based on the number of filled cells
  sortColumn(c) {
    if (this.getColCount(c) === 1) {
      return;
    } else if (this.getColCount(c) === 2) {
      this.sortColumnWithTwoNumbers(c);
    } else {
      this.sortColumnWithThreeNumbers(c);
    }
  }

  // Function to sort all columns in the ticket
  sortColumns() {
    for (let c = 0; c < 9; c++) {
      this.sortColumn(c);
    }
  }

  // Function to reset the state of the ticket
  resetState() {
    this.A = Array.from({ length: 3 }, () => Array(9).fill(0));
  }
}

// Function to generate a random number within a range
function getRand(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

// Function to get the total number of elements in a set
function getNumberOfElementsInSet(set) {
  return set.reduce((count, li) => count + li.length, 0);
}

// Function to generate Tambola sets
function generateTambolaSets(numSets) {
  // Create an array of Node objects to represent each ticket
  const nodes = Array.from({ length: 6 }, () => new Node());

  for (let setCount = 0; setCount < numSets; setCount++) {
    // Initialize columns and sets for the current set
    const columns = Array.from({ length: 9 }, (_, i) => Array.from({ length: 10 }, (_, j) => i * 10 + j + 1));
    const sets = Array.from({ length: 6 }, () => Array.from({ length: 9 }, () => []));

    // Fill sets with random numbers from columns
    for (let i = 0; i < 9; i++) {
      const li = columns[i];
      for (let j = 0; j < 6; j++) {
        const randNumIndex = getRand(0, li.length - 1);
        const randNum = li[randNumIndex];

        const set = sets[j][i];
        set.push(randNum);

        li.splice(randNumIndex, 1);
      }
    }

    // Randomly select a number from the last column and add it to a random set
    const lastCol = columns[8];
    const randNumIndex = getRand(0, lastCol.length - 1);
    const randNum = lastCol[randNumIndex];

    const randSetIndex = getRand(0, sets.length - 1);
    const randSet = sets[randSetIndex][8];
    randSet.push(randNum);

    lastCol.splice(randNumIndex, 1);

    // Distribute remaining numbers to sets and columns
    for (let pass = 0; pass < 3; pass++) {
      for (let i = 0; i < 9; i++) {
        const col = columns[i];
        if (col.length === 0) {
          continue;
        }

        const randNumIndex_p = getRand(0, col.length - 1);
        const randNum_p = col[randNumIndex_p];

        let vacantSetFound = false;
        while (!vacantSetFound) {
          const randSetIndex_p = getRand(0, sets.length - 1);
          const randSet_p = sets[randSetIndex_p];

          if (getNumberOfElementsInSet(randSet_p) === 15 || randSet_p[i].length === 2) {
            continue;
          }

          vacantSetFound = true;
          randSet_p[i].push(randNum_p);

          col.splice(randNumIndex_p, 1);
        }
      }
    }

    // Sort the sets and columns
    for (let i = 0; i < 9; i++) {
      const col = columns[i];
      if (col.length === 0) {
        continue;
      }

      const randNumIndex_p = getRand(0, col.length - 1);
      const randNum_p = col[randNumIndex_p];

      let vacantSetFound = false;
      while (!vacantSetFound) {
        const randSetIndex_p = getRand(0, sets.length - 1);
        const randSet_p = sets[randSetIndex_p];

        if (getNumberOfElementsInSet(randSet_p) === 15 || randSet_p[i].length === 3) {
          continue;
        }

        vacantSetFound = true;
        randSet_p[i].push(randNum_p);

        col.splice(randNumIndex_p, 1);
      }
    }

    // Sort numbers within each set
    for (let i = 0; i < 6; i++) {
      for (let j = 0; j < 9; j++) {
        sets[i][j].sort((a, b) => a - b);
      }
    }

    // Fill each ticket with numbers from the sets
    for (let setIndex = 0; setIndex < 6; setIndex++) {
      const currSet = sets[setIndex];
      const currTicket = nodes[setIndex];

      for (let size = 3; size > 0; size--) {
        if (currTicket.getRowCount(0) === 5) {
          break;
        }
        for (let colIndex = 0; colIndex < 9; colIndex++) {
          if (currTicket.getRowCount(0) === 5) {
            break;
          }
          if (currTicket.A[0][colIndex] !== 0) {
            continue;
          }

          const currSetCol = currSet[colIndex];
          if (currSetCol.length !== size) {
            continue;
          }

          currTicket.A[0][colIndex] = currSetCol.shift();
        }
      }

      for (let size = 2; size > 0; size--) {
        if (currTicket.getRowCount(1) === 5) {
          break;
        }
        for (let colIndex = 0; colIndex < 9; colIndex++) {
          if (currTicket.getRowCount(1) === 5) {
            break;
          }
          if (currTicket.A[1][colIndex] !== 0) {
            continue;
          }

          const currSetCol = currSet[colIndex];
          if (currSetCol.length !== size) {
            continue;
          }

          currTicket.A[1][colIndex] = currSetCol.shift();
        }
      }

      for (let size = 1; size > 0; size--) {
        if (currTicket.getRowCount(2) === 5) {
          break;
        }
        for (let colIndex = 0; colIndex < 9; colIndex++) {
          if (currTicket.getRowCount(2) === 5) {
            break;
          }
          if (currTicket.A[2][colIndex] !== 0) {
            continue;
          }

          const currSetCol = currSet[colIndex];
          if (currSetCol.length !== size) {
            continue;
          }

          currTicket.A[2][colIndex] = currSetCol.shift();
        }
      }
    }

    // Sort columns within each ticket
    try {
      for (let i = 0; i < 6; i++) {
        const currTicket = nodes[i];
        currTicket.sortColumns();
      }
    } catch (e) {
      console.log(
        "Note: there is a small probability your columns may not be sorted, it should not impact the gameplay"
      );
      console.log("Please create an issue in the GitHub for investigation");
      console.log(e.message);
    }

    // Output each ticket
    for (let i = 0; i < 6; i++) {
      const currTicket = nodes[i];

      for (let r = 0; r < 3; r++) {
        for (let col = 0; col < 9; col++) {
          const num = currTicket.A[r][col];
          process.stdout.write(num.toString());

          if (col !== 8) {
            process.stdout.write(",");
          }
        }
        if (r !== 2) {
          console.log();
        }
      }

      if (i !== 5 || setCount === numSets - 1) {
        console.log();
      
      }
      console.log();
      console.log();
    
    }

    // Reset the state of nodes for the next set
    nodes.forEach((node) => node.resetState());
  }
}

// Main function to get the number of sets from the user and generate Tambola sets
function main() {
  const numSets = readlineSync.question('Enter the number of sets: ');

  if (isNaN(numSets) || numSets <= 0) {
    console.log('Invalid input. Please enter a positive number.');
    return;
  }

  const nodes = generateTambolaSets(Number(numSets));

  // Save Tambola tickets to the database
  saveTicketsToDatabase(nodes);
}

// Run the main function
main();
