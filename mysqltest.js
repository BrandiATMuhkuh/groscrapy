var mysql      = require('mysql');
var connection = mysql.createConnection({
  host     : 'localhost',
  user     : 'groscrapy',
  password : 'groscrapy',
  database : 'groscrapy',
});

connection.connect();

/*
connection.query('SELECT * FROM catgorylist', function(err, rows, fields) {
  if (err) throw err;

  console.log('The solution is: ', rows, rows.length);
});

connection.query('INSERT INTO `groscrapy`.`catgorylist` (`link`, `maxpages`) VALUES (?, ?), (?, ?);', ["456",454, "999",999], function(err, results) {
  // ...
});

connection.query('SELECT * FROM catgorylist', function(err, rows, fields) {
  if (err) throw err;

  console.log('The solution is: ', rows, rows.length);
});

*/

connection.query('SELECT * FROM catgorylist', function(err, rows, fields) {
  if (err) throw err;

  console.log('The solution is: ', rows, rows.length);
});
connection.end();