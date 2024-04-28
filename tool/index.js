const mysql = require("mysql");

const { tableData } = require("./public/table");

const pool = mysql.createPool({
  host: "",
  user: "",
  password: "",
  port: 2301,
  database: "moda",
  dateStrings: true,
});

function addCatalog(temp) {
  pool.getConnection((err, connection) => {
    const data = {};
    for (let key in temp) {
      if (temp[key] != null) {
        data[key] = `'${temp[key]}'`;
      }
    }
    const sql = `INSERT INTO table_list (${Object.keys(
      data
    ).join()}) VALUES (${Object.values(data).join()})`;
    connection.query(sql, (err, result) => {
      if (err) {
        console.log(err);
      } else {
        console.log("add success!");
        i++;
        if (i >= len) {
          console.log("finished");
        }
      }
    });
    connection.release();
  });
}

const len = tableData.length;
let i = 0;
function main() {
  tableData.forEach((data) => {
    addCatalog(data);
  });
}
main();
