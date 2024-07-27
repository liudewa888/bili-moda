const express = require("express");
const mysql = require("mysql");
const compression = require("compression");
const axios = require("axios");
const app = express();
const { appConfig } = require("./config.js");

const ADMIN_BASE_URL = appConfig.loginUrl;

app.use((req, res, next) => {
  if (req.url.includes("/moda")) {
    req.url = req.url.replace("/moda", "");
  }
  if (req.url.includes("/api")) {
    req.url = req.url.replace("/api", "");
  }
  next();
});

const sse = [];
app.get("/dynamic/sse", (req, res) => {
  res.set({
    "Content-Type": "text/event-stream",
    "Cache-Control": "no-cache",
    Connection: "keep-alive",
    "Access-Control-Allow-Origin": "*",
  });
  res.flushHeaders();
  res.write("data: sse connected\n\n");
  if (sse.length > 500) {
    sse.shift();
  }
  sse.push(res);
  setInterval(function () {
    res.write("data: heart beat\n\n");
  }, 1000 * 60 * 20);
});

app.use(express.static("./dist"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(compression());

const pool = mysql.createPool(appConfig.dataBase);

// 远程检验token
app.use(async (req, res, next) => {
  const whiteList = [
    "/dynamic/sse",
    "/dynamic/list",
    "/dynamic/add",
    "/catalog/list",
  ];
  if (whiteList.includes(req.url)) {
    next();
    return;
  }
  const url = ADMIN_BASE_URL + "/check";
  const token = req.headers["authorization"];
  const { data } = await axios.get(url, {
    headers: {
      authorization: token,
    },
  });
  if (data.code === 200) {
    next();
  } else {
    res.send(data);
  }
});
// {age:18}转为'age=18'
function transform(obj, filter = []) {
  if (!(obj && typeof obj === "object")) return "";
  const res = [];
  for (let key in obj) {
    if (filter.includes(key)) continue;
    res.push(`${key}='${obj[key]}'`);
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

// 获取服务器时间戳
async function getServerTimeSpan() {
  const url =
    "http://api.m.taobao.com/rest/api3.do?api=mtop.common.getTimestamp";
  const { data } = await axios.get(url);
  if (data.data) {
    return data.data.t;
  }
}

// 动态新增
app.post("/dynamic/add", (req, res) => {
  pool.getConnection(async (err, connection) => {
    const body = req.body;
    const data = {};
    Object.keys(body).forEach((key) => {
      if (body[key]) {
        data[key] = `'${body[key]}'`;
      }
    });
    data.time = await getServerTimeSpan();
    const sql = `INSERT INTO dynamic (${Object.keys(
      data
    ).join()}) VALUES (${Object.values(data).join()})`;
    connection.query(sql, (err, result) => {
      connection.release();
      if (!err) {
        sse.forEach((resp) => {
          resp.write("data: ok\n\n");
        });
        res.send(responseFormat());
      } else {
        res.send(responseFormat(409, [], err.sqlMessage));
      }
    });
  });
});

// 动态获取
app.get("/dynamic/list", (req, res) => {
  pool.getConnection((err, connection) => {
    if (err) {
      return res.send(responseFormat(502, [], "服务端故障"));
    }
    const sql = `SELECT * FROM dynamic ORDER BY time DESC LIMIT 5;`;
    connection.query(sql, (err, result) => {
      connection.release();
      if (!err) {
        res.send(responseFormat(200, result));
      } else {
        res.send(responseFormat(409, [], err.sqlMessage));
      }
    });
  });
});

// 莫大目录-删除
app.get("/catalog/delete", (req, res) => {
  pool.getConnection((err, connection) => {
    const id = req.query.id;
    const sql = `DELETE FROM table_list WHERE Id = ${id}`;
    if (id > 0) {
      connection.query(sql, (err, result) => {
        connection.release();
        if (!err) {
          res.send(responseFormat());
        } else {
          res.send(responseFormat(409, [], err.sqlMessage));
        }
      });
    } else {
      res.send(responseFormat(409, [], "参数错误"));
    }
  });
});

// 莫大目录-获取
app.get("/catalog/list", (req, res) => {
  const query = req.query;
  if (Object.keys(query).length < 2) {
    query.pageSize = "10";
    query.pageIndex = "1";
  }
  pool.getConnection((err, connection) => {
    if (err) {
      return res.send(responseFormat(502, [], "服务端故障"));
    }
    const sql = `SELECT * FROM table_list  ORDER BY date DESC LIMIT ${
      query.pageSize
    } OFFSET ${(query.pageIndex - 1) * query.pageSize};`;
    const sql_count = `SELECT COUNT(*) FROM table_list;`;
    connection.query(sql, (err, result) => {
      connection.release();
      if (!err) {
        const data = { list: result };
        connection.query(sql_count, (err, result) => {
          if (!err) {
            data.total = result[0]["COUNT(*)"];
            (data.pageSize = query.pageSize),
              (data.pageIndex = query.pageIndex);
            res.send(responseFormat(200, data));
          } else {
            res.send(responseFormat(409, [], err.sqlMessage));
          }
        });
      } else {
        res.send(responseFormat(409, [], err.sqlMessage));
      }
    });
  });
});

// 莫大目录-新增
app.post("/catalog/add", (req, res) => {
  pool.getConnection((err, connection) => {
    const temp = req.body;
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
      connection.release();
      if (!err) {
        res.send(responseFormat());
      } else {
        res.send(responseFormat(409, [], err.sqlMessage));
      }
    });
  });
});

// 莫大目录-修改
app.post("/catalog/edit", (req, res) => {
  pool.getConnection((err, connection) => {
    const data = req.body;
    const replace = transform(data, ["Id"]);
    const sql = `UPDATE table_list SET ${replace} WHERE Id = ${data.Id}`;
    connection.query(sql, (err, result) => {
      connection.release();
      if (!err) {
        res.send(responseFormat());
      } else {
        res.send(responseFormat(409, [], err.sqlMessage));
      }
    });
  });
});
// 测试
app.get("/test", (req, res) => {
  res.send(responseFormat(200, [], "test"));
});

// app.listen(9080, () => {
//   console.log("9080 is running");
// });

// 服务器写法
app.listen(process.env.PORT,function() {
  console.log(process.env.PORT ,"is running");
})
