const express = require("express");
const cors = require("cors");
// const { executeDB } = require('./data/db')
// const  userroutes  = require('./routes/userroutes')
const sqlite = require("sqlite3").verbose();
require("dotenv").config();
const socket = require("socket.io");
const app = express();
const jwt = require('jsonwebtoken');
const port = process.env.PORT;
const moment = require('moment')
const multer = require("multer");
const path = require("path");

app.use(express.json());
app.use(cors())
const secretKey = process.env.SECRET_KEY

const db = new sqlite.Database(
  "./chatapp.db",
  sqlite.OPEN_READWRITE,
  (err, result) => {
    if (err) throw err;
    else {
      console.log("Database Successfully Connected");
    }
  }
);

const authenticateToken =(req, res, next) => {
    const token = req.headers['authorization'];
    if (!token) return res.status(401).json({ message: 'Token not provided' });

    jwt.verify(token, secretKey, (err, decoded) => {
        if (err) return res.status(403).json({ message: 'Invalid token' });
        req.user = decoded;
        next();
    });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/");
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  }
});

const courseStorage = multer.diskStorage({
  destination:(req,res,cb)=>{
    cb(null,"images/")
  },
  filename:(req,file,cb)=>{
    cb(null,Date.now() +"-"+ path.extname(file.originalname))
  }
})

const upload = multer({storage:storage})
const courseUpload = multer({storage:courseStorage})

const uploadFields = [
  { name: 'image' },
  { name: 'thumbnail' }
];

//Get Users
app.get("/users", (req, res) => {
  db.all("SELECT * FROM USERS", (err, rows) => {
    if (err) {
      res.json({ message: "Error" });
    } else {
      res.json(rows);
    }
  });
});

//Post Users:
app.post("/register", (req, res) => {
  const username = req.body.username;
  const email = req.body.email;
  const password = req.body.password;
  var image;
  const createON = new Date().toISOString();
  let sql = `INSERT INTO USERS (username,image,email,password,createON) VALUES(?,?,?,?,?)`;
  db.run(sql, [username, image, email, password, createON], (err, result) => {
    if (err) throw err;
    else {
      res.json(result);
    }
  });
});


//Login Users:
app.post("/login",(req,res)=>{
    const {email ,password} = req.body;
    let sql = `SELECT *  FROM USERS WHERE email= ? and password =?;`
    db.all(sql,[email,password],(err,result)=>{
        if(err) throw err;
        else if(result.length < 1)
        {
            res.json({message:"Invalid Username or Password"});
        }
        else {
            const token = jwt.sign({ email: email }, secretKey, { expiresIn: '1h' });
            res.json({ token: token });
        }
    });
});

app.get("/getme", authenticateToken, (req, res) => {
    let email = req.user.email;
    let sql = `SELECT * FROM USERS WHERE email = ?`;
    db.all(sql, [email], (err, rows) => {
        if (err) throw err;
        else {
            if (rows.length > 0) {
                res.json({ user : rows[0] }); 
            } else {
                res.status(404).json({ message: "User not found" });
            }
        }
    });
});

app.get("/students",(req,res)=>{
  let sql = `SELECT * FROM STUDENTS;`
  db.all(sql,(err,rows)=>{
    if(err) throw err
    else{
      res.json(rows)
    }
  })
});

app.post("/students", upload.single('image'), (req, res) => {
  const { sname, rollno, dob, gender, address, fathername, mothername, email, phoneNumber, batch, createdBy } = req.body;
  const image = req.file ? req.file.filename : null;
  let sql = `
  INSERT INTO STUDENTS(sname, rollno, dob, gender, address, fathername, mothername, email, phoneNumber, batch, image, createdBy) 
  VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);`;
  db.run(sql, [sname, rollno, dob, gender, address, fathername, mothername, email, phoneNumber, batch, image, createdBy], (err, row) => {
    if (err) {
      throw err;
    } else {
      res.json({ data: row });
    }
  });
});





app.put("/students/:sid",(req,res)=>{
  const sid = req.params.sid;
  const {sname,rollno,dob,gender,address,fathername,mothername,email,phoneNumber,batch,image,createdBy} = req.body;
  let sql = `
  UPDATE STUDENTS SET sname=?, rollno=?, dob=? ,gender=? ,address=? ,fathername=? ,mothername=? ,email=? ,phonenumber=? ,
  batch = ?,image = ?,createdBy =? where sid =?;`
  db.run(sql,[sname,rollno,dob,gender,address,fathername,mothername,email,phoneNumber,batch,image,createdBy,sid],(err,row)=>{
    if(err) throw err;
    else{
      res.json({message:"Updated Successfully"});
    }
  })
})

app.delete("/students/:sid",(req,res)=>{
  const sid = req.params.sid;
  let sql = `DELETE FROM USERS WHERE sid =?;`
  db.run(sql,[sid],(err,row)=>{
    if(err) throw err;
    else{
      res.json({message:"Deleted Successfully"})
    }
  })
})



//Course:

app.get('/courses',(req,res)=>{
  db.all(`SELECT * FROM COURSES`,(err,rows)=>{
    if(err)
    {
      throw err;
    }
    else{
      res.json(rows)
    }
  })
});

app.post('/courses',courseUpload.fields(uploadFields),(req,res)=>{
  const { cname,category,fees,duration,desc,tags } = req.body;
  console.log(req.body)
  const image = req.files['image'][0].filename;
  const thumbnail = req.files['thumbnail'][0].filename;
  let sql =`INSERT INTO COURSES(cname,category,fees,duration,image,desc,tags,thumbnail) VALUES(?,?,?,?,?,?,?,?);`
  db.run(sql,[cname,category,fees,duration,image,desc,tags,thumbnail],(err,row)=>{
    if(err) throw err;
    else{
      res.json(row);
    }
  })
})


app.put('/courses/:cid',(req,res)=>{
  const cid = req.params.cid;
  const { cname,category,fees,duration,image,desc } = req.body; 
  let sql = `UPDATE COURSES SET cname =?,category=?,fees=?,duration=?,image=?,desc=? where cid =?;`
  db.run(sql,[cname,category,fees,duration,image,desc,cid],(err,row)=>{
    if(err) throw err;
    else{
      res.json({message:"Updated Successfully"})
    }
  })
});


app.delete('/courses/:cid',(req,res)=>{
  const cid = req.params.cid;
  let sql = `DELETE FROM COURSES WHERE cid =?;`
  db.run(sql,[cid],(err,row)=>{
    if (err) throw err;
    else{
      res.json(row)
    }
  })
})


// app.use('/',userroutes)

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
