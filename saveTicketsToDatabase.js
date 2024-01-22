const mysql = require('mysql2');

// Create a connection to the database
const connection = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: 'Thikhai@123',
  database: 'tambola_db'
});

// Connect to the database
connection.connect();

// Function to save Tambola tickets to the database
function saveTicketsToDatabase(nodes) {
  for (let setIndex = 0; setIndex < 6; setIndex++) {
    const currTicket = nodes[setIndex];

    // Check if currTicket is defined before accessing its properties
    if (currTicket) {
      for (let r = 0; r < 3; r++) {
        for (let col = 0; col < 9; col++) {
          const num = currTicket.A[r][col];

          // Insert into the database
          const sql = 'INSERT INTO tambola_tickets (set_number, ticket_number, row_number, col_number, number) VALUES (?, ?, ?, ?, ?)';
          const values = [setIndex + 1, currTicket.ticketNumber, r + 1, col + 1, num];

          connection.query(sql, values, (error, results, fields) => {
            if (error) throw error;
            console.log('Ticket data inserted into the database');
          });
        }
      }
    }
  }

  // Close the database connection
  connection.end();
}

// Export the function for external usage
module.exports = saveTicketsToDatabase;
