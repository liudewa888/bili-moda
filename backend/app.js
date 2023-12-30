require("dotenv").config();

const express = require("express");
const mysql = require("mysql");
const jwt = require("jsonwebtoken");
const compression = require("compression");
const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static("public"));
app.use(compression());
app.set("env", "production");

const pool = mysql.createPool({
  host: "82.157.150.181",
  user: "user",
  password: "useruser",
  port: 3306,
  database: "moda",
  dateStrings: true,
});

function responseFormat(code = 200, data = [], msg = "ok") {
  const response = {
    code: code,
    data: data,
    msg: msg,
  };
  return response;
}

//生成token
function generateAccessToken(user, key) {
  return jwt.sign(user, key, {
    expiresIn: "1h",
  });
}

//验证token
function authenticateToken(req, res, next) {
  const authHeader = req.headers["authorization"];
  const token = authHeader || authHeader.split(" ")[1];
  if (!token) {
    return res.send(responseFormat(401, null, "需要登录,才能操作"));
  }
  pool.getConnection((err, connection) => {
    const sql = `select token_key from users WHERE token = '${token}'`;
    connection.query(sql, (err, result) => {
      if (result) {
        const key = result[0].token_key;
        jwt.verify(token, key, (err, decoded) => {
          if (!err) {
            const time = getTimeSpan();
            if (time < decoded.exp) {
              next();
            } else {
              return res.send(responseFormat(401, null, "token过期"));
            }
          } else {
            return res.send(responseFormat(401, null, "token过期"));
          }
        });
      } else {
        return res.send(responseFormat(401, null, "token无效"));
      }
    });
  });
}

function getTimeSpan() {
  return String(parseInt(new Date().getTime() / 1000));
}

//用户登陆
app.post("/admin/login", (req, res) => {
  pool.getConnection((err, connection) => {
    const data = req.body;
    let sql = `SELECT * FROM users WHERE uname = '${data.uname}' AND password = '${data.password}'`;
    connection.query(sql, (err, result) => {
      if (!err) {
        //若存在结果则表示登陆成功
        if (result[0]) {
          const user = { uname: data.uname };
          const key = data.uname + getTimeSpan();
          const token = generateAccessToken(user, key);
          sql = `UPDATE users SET token_key = '${key}', token='${token}' WHERE uname = '${data.uname}'`;
          connection.query(sql, (err, result) => {
            if (!err) {
              res.send(responseFormat(200, { token }));
            } else {
              res.send(responseFormat(409, [], err.sqlMessage));
            }
          });
        } else {
          res.send(responseFormat(401, [], "用户名或密码错误"));
        }
      } else {
        res.send(responseFormat(409, [], err.sqlMessage));
      }
    });
  });
});

//修改用户密码
app.put("/adminUser/changePassword", (req, res) => {
  pool.getConnection((err, connection) => {
    const id = req.body.userId;
    const checkPassword = "SELECT * FROM users WHERE id = ? AND password = ?";
    const checkValue = [id, req.body.originalPassword];
    connection.query(checkPassword, checkValue, (err, result) => {
      if (err) {
        console.log(err);
      }

      if (result[0]) {
        console.log("have match, process to change password");
        const updatePassword = "UPDATE users SET password = ? WHERE id = ?";
        const updateValue = [req.body.newPassword, id];
        pool.getConnection((err, connection) => {
          connection.query(updatePassword, updateValue, (err, result) => {
            if (err) {
              console.log(err);
            }
          });
        });
        res.send("修改密码成功");
      } else {
        res.status(400).send("原密码错误, 请重新输入");
      }
    });
    connection.release();
  });
});

//获取用户信息
app.post("/getUser", (req, res) => {
  pool.getConnection((err, connection) => {
    const querySql = "SELECT * FROM users WHERE id = ?";
    const reqId = req.body.userId;
    connection.query(querySql, reqId, (err, result) => {
      if (err) {
        console.log(err);
      }
      res.send(result);
      connection.release();
    });
  });
});

//修改用户名字和邮箱
app.put("/changeUserInfo", (req, res) => {
  pool.getConnection((err, connection) => {
    const reqName = req.body.name;
    const reqEmail = req.body.email;
    const reqId = req.body.id;
    const querySql = "UPDATE users SET name = ?, email = ? WHERE id = ?";
    const value = [reqName, reqEmail, reqId];
    connection.query(querySql, value, (err, result) => {
      if (err) {
        console.log(err);
      }
    });
    connection.release();
  });
  res.send("修改成功");
});

//删除莫大目录信息
app.get("/catalog/delete", (req, res) => {
  pool.getConnection((err, connection) => {
    const id = req.query.id;
    const sql = `DELETE FROM table_list WHERE Id = ${id}`;
    if (id > 0) {
      connection.query(sql, (err, result) => {
        if (!err) {
          res.send(responseFormat());
        } else {
          res.send(responseFormat(409, [], err.sqlMessage));
        }
      });
      connection.release();
    } else {
      res.send(responseFormat(409, [], "参数错误"));
    }
  });
});

//获取莫大目录信息
app.get("/catalog/list", (req, res) => {
  pool.getConnection((err, connection) => {
    const reqId = req.body.id;
    const sql = "SELECT * FROM table_list";
    connection.query(sql, (err, result) => {
      if (!err) {
        res.send(responseFormat(200, result));
      } else {
        res.send(responseFormat(409, [], err.sqlMessage));
      }
    });
    connection.release();
  });
});

//新增莫大目录信息
app.post("/catalog/add", (req, res) => {
  pool.getConnection((err, connection) => {
    const data = req.body;
    const sql = `INSERT INTO table_list (${Object.keys(
      data
    ).join()}) VALUES (${Object.values(data).join()})`;
    connection.query(sql, (err, result) => {
      if (!err) {
        res.send(responseFormat());
      } else {
        res.send(responseFormat(409, [], err.sqlMessage));
      }
    });
    connection.release();
  });
});

//修改莫大目录信息
app.post("/catalog/edit", (req, res) => {
  pool.getConnection((err, connection) => {
    const data = req.body;
    const replace = transform(data, [id]);
    const sql = `UPDATE table_list SET ${replace} WHERE Id = ${data.id}`;
    connection.query(sql, (err, result) => {
      if (!err) {
        res.send(responseFormat());
      } else {
        res.send(responseFormat(409, [], err.sqlMessage));
      }
    });
    connection.release();
  });
});

app.get("/test", authenticateToken, (req, res) => {
  res.send(responseFormat(200, [], "test"));
});

function transform(obj, filter = []) {
  if (!(obj && typeof obj === "object")) return "";
  const res = [];
  for (let key in obj) {
    if (filter.includes(key)) continue;
    res.push(`${key}=${obj[key]}`);
  }
  return res.join();
}

app.listen(9080, () => {
  console.log("9080 is running");
});
