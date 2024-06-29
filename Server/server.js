
// Entrypoint into Backend Application
// Creating and Initialising Express App

require('dotenv').config(); 
// Hardcoding port is not reccommended as the development environment port may be 3000
// but production environment may use a different port instead. Preferably, use environment
// variables to get the port up and running automatically. Use dotenv package to do so.

const express = require("express");
const app = express();   // Create an instance of express

const { createClient } = require('@supabase/supabase-js');

const bcrypt = require('bcrypt'); 

const supabaseUrl = process.env.SUPABASE_URL;

const supabaseKey = process.env.SUPABASE_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

// Middleware (Order defined for middleware matters, express leads from the top down)
app.use(express.json());

app.post("/api/v1/createAccount", async (req, res) => {
    console.log(req.body);
    try {
        const hashedPassword = await bcrypt.hash(req.body.password, 10);

        const results = await supabase.from('users')
                                       .insert([
                                                { username: req.body.username, email: req.body.email, date_of_birth: req.body.date_of_birth, password_hash: hashedPassword  },
                                               ])
                                       .select()

        console.log(results);
        return res.status(200).json({
            status: "success",
            data: results.data[0]
        });
    } catch (err) {
        return res.status(400).json({
            status: "error",
            message: "Username is already in use"
        });
    }
        });
    }
});


app.post("/api/v1/logIn", async (req, res) => {
    console.log(req.body);
    const { identification, password } = req.body;
    
    try {
        const { data: users, error } = await supabase.from('users')
                                                     .select('*')
                                                     .or(`username.eq.${identification},email.eq.${identification}`);
    
        if (error) {
            throw error;
        }
    
        if (!users || users.length === 0) {
            return res.status(400).json({
                status: "error",
                message: "Invalid username/email"
            });
        }
    
        const user = users[0];
            
            
        const isValidPassword = await bcrypt.compare(password, user.password_hash);
        console.log(isValidPassword);
    
        if (!isValidPassword) {
            return res.status(400).json({
                status: "error",
                message: "Invalid password"
            });
                
        }
    
        return res.status(200).json({
            status: "success",
            data: {
                user: user.user_uuid
            }
        });
    
    } catch (err) {
        console.error("Caught an error: ", err);
    }
});

app.post("/api/v1/getUserData", async(req, res) => {
    console.log(req.body);
    const id = req.body.id;
    try {
        const { data: users, error } = await supabase
            .from('users')
            .select('*')
            .eq('user_uuid', id);        
        
        const user = users[0];

        return res.status(200).json({
            status: "success",
            data: {
                username: user.username,
                password: user.password_hash,
                date_of_birth: user.date_of_birth
            }
        })
    } catch (err) {
        return res.status(400).json({
            status: "error",
            message: "User not found"
        });
    }
 });

 app.post("/api/v1/insertMajor", async (req, res) => {
    console.log(req.body);
    const id  = req.body.id;
    const major = req.body.selectedMajor;
    try {

        const {data, error} = await supabase.from('configuration')
                                        .insert([
                                                { user_uuid: id, major: major },
                                               ])
                                        .select();

        if (error) {
            throw error;
        }

        return res.status(200).json({
            status: "success",
        });
    } catch (err) {
        console.error(err);
        return res.status(400).json({
            status: "error",
            message: "Invalid input"
        });
    }
});


app.post("/api/v1/insertUniversity", async (req, res) => {
    console.log(req.body);
    const id  = req.body.id;
    const university = req.body.selectedUniversity;
    try {

        const {data, error} = await supabase.from('configuration')
                                            .update({university: university})
                                            .eq('user_uuid', id)


        if (error) {
            throw error;
        }

        return res.status(200).json({
            status: "success",
        });
    } catch (err) {
        console.error(err);
        return res.status(400).json({
            status: "error",
            message: "Invalid input"
        });
    }
});

/** 

// next() function tells us to send to the next middleware or route handler
// middleware can be used to send response back to user, like so:
//  res.status(404).json({
//      status: "fail",
//  });
// drop a request but putting nothing inside
// ton of 3rd party middleware (e.g. morgan), already configured to call the next function,
// so there is no need to indicate next
// express.json() provides the body as a convenient standard javascript object





// first parameter is the url in the form: http://localhost:{port_num}/{name of get function}
// second parameter is the callback function:
// request is stored in the first variable and response is stored in the second variable
// This is a restful API. If we console.log("...") here, it will print whatever is in it in the terminal.
// however, if we do a res.send(...), the browser will show all the restaurants.
// res.json will put it in a json format for react client that can easily parse the data
// to change the status on Postman (e.g. 200, 404), change to res.status(...).json(...)

// Get individual posts
app.get("/api/v1/getPost/:post_uuid", async (req, res) => {
    console.log(req.params.post_uuid);
    try {
        const results = await db.query(
            "SELECT * FROM posts WHERE post_uuid = $1", [req.params.post_uuid]
        );   
        // do not use string interpolation or concatenation for this, rather use a parameterised query to prevent SQL injection
        res.status(200).json({
            status: "success",
            data: {
                posts: results.rows[0],
        },
    });
    } catch (err) {
        console.log(err);
    }
});
// if we console.log(req), express will store it in an object called params: { id: '1234' }
// next time, we can just call console.log(req.params);
// express knows this because of the id in our req

// Create a post
app.post("/api/v1/getPost", async (req, res) => {
    console.log(req.body);
    try {
        const results = await db.query(
            "INSERT INTO posts (post_uuid, post_title, post_body, post_date, post_time) VALUES (uuid_generate_v4(), $1, $2, NOW(), NOW()) RETURNING *",
        [req.body.post_title, req.body.post_body]);
        console.log(results);
        res.status(201).json({
            status: "success",
            data: {
                posts: results.rows[0],
            }
    });
    } catch (err) {
        console.log(err);
    }
    });

// Update a post
app.put("/api/v1/getPost/:post_uuid", async (req, res) => {
    console.log(req.body);
    try {
        const results = await db.query("UPDATE posts SET post_title = $1, post_body = $2 WHERE post_uuid = $3 RETURNING *", 
            [req.body.post_title, req.body.post_body, req.params.post_uuid]);
        console.log(results);
        res.status(200).json({
            status: "success",
            data: {
                posts: results.rows[0],
            },
        });
    } catch (err) {
        console.log(err);
    }
});

// Delete a post
app.delete("/api/v1/getPost/:post_uuid", async (req, res) => {
    console.log(req.body);
    try {
        const results = await db.query(
            "DELETE FROM posts WHERE post_uuid = $1", 
            [req.params.post_uuid]);
            res.status(204).json({
                status: "success"
            });
    } catch (err) {
        console.log(err);
    }
});
// For 204, postman automatically removes the json above but note we are
// sending this data

*/
const port = process.env.PORT || 3000;   
// Storing the value of port to the environment variable defined in env, if env not available, 
// then listen on port 3000


app.listen(port, () => {
    console.log(`Server is up and listening on port ${port}`);
});

