const sqlite = require('sqlite3').verbose()

const executeDB = async() =>{
     const db = await new sqlite.Database('./chatapp.db',sqlite.OPEN_READWRITE,(err,result)=>{
        if(err) throw err;
        else{
            console.log("Database Successfully Connected");
            return db
        }
    })
}

module.exports={
    executeDB,
}