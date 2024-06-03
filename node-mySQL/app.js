const express = require('express');
const mysql = require('mysql');
const dotenv = require('dotenv');
const cors = require('cors');

dotenv.config({ path: './.env' })

const app = express();
const db = mysql.createConnection({
    host: process.env.DATABASE_HOST,
    port: process.env.DATABASE_PORT,
    user: process.env.DATABASE_USER,
    password: process.env.DATABASE_PASSWORD,
    database: process.env.DATABASE


})

db.connect((error) => {
    if (error) {
        console.log(error)
    } else {
        console.log("My SQL connected...")
    }
})
app.get("/", (req, res) => {
    res.send("<h1>HomePage</h1>")
})


app.use(express.json());
app.use(cors());

app.post('/accountcreation', async(req, res) => {
    const {Name, Email, Password} = req.body;
    db.query('INSERT INTO users SET ?', {Name: Name, Email: Email, Password: Password}, (error, result) => {
        if (error) {
            console.log(error);
        } else {
            console.log(result);
        }
    })
})


app.listen(5001, () => {
    console.log("Server started on Port 5001");
})