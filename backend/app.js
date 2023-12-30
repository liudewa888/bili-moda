const express = require("express");
const mysql = require("mysql");
const jwt = require("jsonwebtoken");
const compression = require("compression");
const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static("public"));
app.use(compression());

const pool = mysql.createPool({
  host: "82.157.150.181",
  user: "user",
  password: "useruser",
  port: 3306,
  database: "moda",
  dateStrings: true,
});
// {age:18}转为'age=18'
function transform(obj, filter = []) {
  if (!(obj && typeof obj === "object")) return "";
  const res = [];
  for (let key in obj) {
    if (filter.includes(key)) continue;
    res.push(`${key}=${obj[key]}`);
  }
  return res.join();
}
// 响应统一格式化
function responseFormat(code = 200, data = [], msg = "ok") {
  const response = {
    code: code,
    data: data,
    msg: msg,
  };
  return response;
}

// token生成
function generateAccessToken(user, key) {
  return jwt.sign(user, key, {
    expiresIn: "1h",
  });
}

// token验证
function authenticateToken(req, res, next) {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];
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
// 返回10位格式时间戳
function getTimeSpan() {
  return String(parseInt(new Date().getTime() / 1000));
}

// 登录
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

// 莫大目录-删除
app.get("/catalog/delete", authenticateToken, (req, res) => {
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

// 莫大目录-获取
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

// 莫大目录-新增
app.post("/catalog/add", authenticateToken, (req, res) => {
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

// 莫大目录-修改
app.post("/catalog/edit", authenticateToken, (req, res) => {
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
// 测试
app.get("/test", authenticateToken, (req, res) => {
  res.send(responseFormat(200, [], "test"));
});

app.listen(9080, () => {
  console.log("9080 is running");
});
