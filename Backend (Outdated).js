// Entrypoint into Backend Application
// Creating and Initialising Express App

require('dotenv').config(); 
// Hardcoding port is not reccommended as the development environment port may be 3000
// but production environment may use a different port instead. Preferably, use environment
// variables to get the port up and running automatically. Use dotenv package to do so.

const express = require("express");
const morgan = require("morgan");
const app = express();   // Create an instance of express
const bcrypt = require('bcrypt');

const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);


// Middleware (Order defined for middleware matters, express leads from the top down)
app.use(express.json());

////// SECTION I: FUNCTIONS WITH USERS TABLE
// 1. Account Creation

const createUser = async (user) => {
    const { data, error } = await supabase
      .from('users')
      .insert([
        { username: user.username, email: user.email, password: user.password }
      ]);
  
    if (error) {
      console.error(error);
    } else {
      console.log('User created:', data);
    }
  };
  

app.post("/api/v1/createAccount", async (req, res) => {
    console.log(req.body);
    try {
        const results = await db.query(
            "INSERT INTO users (user_uuid, username, email, date_of_birth, password_hash, date_created) VALUES (uuid_generate_v4(), $1, $2, $3, $4, NOW()) RETURNING *",
        [req.body.username, req.body.email, req.body.date_of_birth, req.body.password]);
        console.log(results);
        res.status(201).json({
            status: "success",
            data: {
                posts: results.rows[0],
            }
    });
    } catch (err) {
        console.log(err);
        res.status(201).json({
            status: "Username taken. Choose another username!"
    });
    }
});

// 2. Update Account Details
app.put("/api/v1/updateAccount/:user_uuid", async (req, res) => {
    console.log(req.body);
    try {
        const results = await db.query(
            "UPDATE users SET username = $1, email = $2, date_of_birth = $3, password_hash = $4 WHERE user_uuid = $5 RETURNING *", 
            [req.body.username, req.body.email, req.body.date_of_birth, req.body.password_hash, req.params.user_uuid]);
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

// 3. Delete Account
app.delete("/api/v1/Account/:user_uuid", async (req, res) => {
    console.log(req.body);
    try {
        const results = await db.query(                      // Delete from config table first, because config has FK which references users
            "DELETE FROM config WHERE user_uuid = $1", 
            [req.params.user_uuid]);
            res.status(204).json({
                status: "success"
            });
    } catch (err) {
        console.log(err);
    }

    try {
        const results = await db.query(
            "DELETE FROM users WHERE user_uuid = $1", 
            [req.params.user_uuid]);
            res.status(204).json({
                status: "success"
            });
    } catch (err) {
        console.log(err);
    }
});

// 4. Get Account Information
app.get("/api/v1/Account/:user_uuid", async (req, res) => {
    console.log(req.params.post_uuid);
    try {
        const results = await db.query(
            "SELECT * FROM users WHERE user_uuid = $1", [req.params.user_uuid]
        ); 
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

// 5. Log In
app.post("/api/v1/logIn", async (req, res) => {
    console.log(req.body);
    try {
        const results = await db.query(
            "SELECT * FROM users WHERE (username = $1 OR email = $1) AND password_hash = $2",
        [req.body.identification, req.body.password]);

        console.log(results);
        
        if (results.rowCount != 0) {      // Check if current username or password exists, else throw error in status.
            res.status(201).json({
                status: "success",
                
                data: {
                    posts: results.rows[0],
            }
        })} else {
            res.status(201).json({
                status: "Username or password invalid! Please try again."});
        };
    } catch (err) {
        console.log(err);
    };
});

///// SECTION II: POSTS TABLE
// 1. Get all posts
app.get(`/api/v1/Posts`, async (req, res) => {

    try {const results = await db.query("SELECT * FROM posts;");
        console.log(results);
            res.status(200).json({
                status: "success",
                results: results.rows.length,
                data: {posts: results.rows,
                },
        });
    } catch (err) {
        console.log(err);
    }
});
// first parameter is the url in the form: http://localhost:{port_num}/{name of get function}
// second parameter is the callback function:
// request is stored in the first variable and response is stored in the second variable
// This is a restful API. If we console.log("...") here, it will print whatever is in it in the terminal.
// however, if we do a res.send(...), the browser will show all the restaurants.
// res.json will put it in a json format for react client that can easily parse the data
// to change the status on Postman (e.g. 200, 404), change to res.status(...).json(...)

// Get individual posts
app.get("/api/v1/Posts/:post_uuid", async (req, res) => {
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
app.post("/api/v1/Posts", async (req, res) => {
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
app.put("/api/v1/Posts/:post_uuid", async (req, res) => {
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
app.delete("/api/v1/Posts/:post_uuid", async (req, res) => {
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

///// SECTION 3: COMMENTS TABLE
// 1. Get All Comments From a Post
app.get("/api/v1/Comments/:post_uuid", async (req, res) => {
    console.log(req.params.post_uuid);
    try {
        const results = await db.query(
            "SELECT * FROM comments WHERE post_uuid = $1", [req.params.post_uuid]
        );   
        res.status(200).json({
            status: "success",
            data: {
                comments: results.rows,
        },
    });
    } catch (err) {
        console.log(err);
    }
});

// 2. Create a New Comment
app.post("/api/v1/Comments/:user_uuid/:post_uuid", async (req, res) => {
    console.log(req.params);
    try {
        const results = await db.query(
            "INSERT INTO comments (comment_uuid, comment_body, comment_date, comment_time, user_uuid, post_uuid) VALUES (uuid_generate_v4(), $1, NOW(), NOW(), $2, $3) RETURNING *",
        [req.body.comment_body, req.params.user_uuid, req.params.post_uuid]);
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

// 3. Edit a Comment
app.put("/api/v1/Comments/:comment_uuid", async (req, res) => {
    console.log(req.body);
    try {
        const results = await db.query("UPDATE comments SET comment_body = $1 WHERE comment_uuid = $2 RETURNING *", 
            [req.body.comment_body, req.params.comment_uuid]);
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

// 4. Delete a comment
app.delete("/api/v1/Comments/:comment_uuid", async (req, res) => {
    console.log(req.body);
    try {
        const results = await db.query(
            "DELETE FROM comments WHERE comment_uuid = $1", 
            [req.params.comment_uuid]);
            res.status(204).json({
                status: "success"
            });
    } catch (err) {
        console.log(err);
    }
});

///// SECTION 4: REPORTED POSTS
// 1. Report a Post
app.post("/api/v1/reportedPosts/:user_uuid1/:user_uuid2/:post_uuid", async (req, res) => {
    console.log(req.params);
    try {
        const results = await db.query(
            "INSERT INTO reported_posts (date_reported, time_reported, reported_by_uuid, reported_against_uuid, post_reported_uuid) VALUES (NOW(), NOW(), $1, $2, $3) RETURNING *",
        [req.params.user_uuid1, req.params.user_uuid2, req.params.post_uuid]);
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

// 2. Get All Reported Posts (for Moderators)
app.get("/api/v1/reportedPosts", async (req, res) => {
    try {
        const results = await db.query(
            "SELECT * FROM reported_posts"
        );   
        res.status(200).json({
            status: "success",
            data: {
                reported_posts: results.rows,
        },
    });
    } catch (err) {
        console.log(err);
    }
});

// 3. See All Reported Posts Reported By a User
app.get("/api/v1/reportedPosts/:user_uuid", async (req, res) => {
    try {
        const results = await db.query(
            "SELECT * FROM reported_posts WHERE reported_by_uuid = $1",
            [req.params.user_uuid]
        );   
        res.status(200).json({
            status: "success",
            data: {
                reported_posts: results.rows,
        },
    });
    } catch (err) {
        console.log(err);
    }
});

// 4. See All Posts Reported Against a User
app.get("/api/v1/reportedPosts/:user_uuid", async (req, res) => {
    try {
        const results = await db.query(
            "SELECT * FROM reported_posts WHERE reported_against_uuid = $1",
            [req.params.user_uuid]
        );   
        res.status(200).json({
            status: "success",
            data: {
                reported_posts: results.rows,
        },
    });
    } catch (err) {
        console.log(err);
    }
});

// 5. See a Particular Reported Post
app.get("/api/v1/reportedPosts/:post_uuid", async (req, res) => {
    try {
        const results = await db.query(
            "SELECT * FROM reported_posts WHERE reported_post_uuid = $1",
            [req.params.post_uuid]
        );   
        res.status(200).json({
            status: "success",
            data: {
                reported_posts: results.rows[0],
        },
    });
    } catch (err) {
        console.log(err);
    }
});

// 6. Remove Post from Reported Posts
app.delete("/api/v1/reportedPosts/:post_uuid", async (req, res) => {
    console.log(req.body);
    try {
        const results = await db.query(
            "DELETE FROM reported_posts WHERE reported_post_uuid = $1", 
            [req.params.post_uuid]);
            res.status(204).json({
                status: "success"
            });
    } catch (err) {
        console.log(err);
    }
});

///// SECTION 5: REPORTED COMMENTS
// 1. Report a Comment
app.post("/api/v1/reportedComments/:user_uuid1/:user_uuid2/:post_uuid", async (req, res) => {
    console.log(req.params);
    try {
        const results = await db.query(
            "INSERT INTO reported_comments (date_reported, time_reported, reported_by_uuid, reported_against_uuid, comment_reported_uuid) VALUES (NOW(), NOW(), $1, $2, $3) RETURNING *",
        [req.params.user_uuid1, req.params.user_uuid2, req.params.comment_uuid]);
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

// 2. Get All Reported Comments (for Moderators)
app.get("/api/v1/reportedComments", async (req, res) => {
    try {
        const results = await db.query(
            "SELECT * FROM reported_comments"
        );   
        res.status(200).json({
            status: "success",
            data: {
                reported_posts: results.rows,
        },
    });
    } catch (err) {
        console.log(err);
    }
});

// 3. See All Reported Comments Reported By a User
app.get("/api/v1/reportedComments/:user_uuid", async (req, res) => {
    try {
        const results = await db.query(
            "SELECT * FROM reported_comments WHERE reported_by_uuid = $1",
            [req.params.user_uuid]
        );   
        res.status(200).json({
            status: "success",
            data: {
                reported_posts: results.rows,
        },
    });
    } catch (err) {
        console.log(err);
    }
});

// 4. See All Comments Reported Against a User
app.get("/api/v1/reportedComments/:user_uuid", async (req, res) => {
    try {
        const results = await db.query(
            "SELECT * FROM reported_comments WHERE reported_against_uuid = $1",
            [req.params.user_uuid]
        );   
        res.status(200).json({
            status: "success",
            data: {
                reported_posts: results.rows,
        },
    });
    } catch (err) {
        console.log(err);
    }
});

// 5. See a Particular Reported Comment
app.get("/api/v1/reportedComments/:comment_uuid", async (req, res) => {
    try {
        const results = await db.query(
            "SELECT * FROM reported_comments WHERE reported_comment_uuid = $1",
            [req.params.post_uuid]
        );   
        res.status(200).json({
            status: "success",
            data: {
                reported_posts: results.rows[0],
        },
    });
    } catch (err) {
        console.log(err);
    }
});

// 6. Remove Comment from Reported Comments
app.delete("/api/v1/reportedComments/:comment_uuid", async (req, res) => {
    console.log(req.body);
    try {
        const results = await db.query(
            "DELETE FROM reported_comments WHERE reported_comment_uuid = $1", 
            [req.params.post_uuid]);
            res.status(204).json({
                status: "success"
            });
    } catch (err) {
        console.log(err);
    }
});













// next() function tells us to send to the next middleware or route handler
// middleware can be used to send response back to user, like so:
//  res.status(404).json({
//      status: "fail",
//  });
// drop a request but putting nothing inside
// ton of 3rd party middleware (e.g. morgan), already configured to call the next function,
// so there is no need to indicate next
// express.json() provides the body as a convenient standard javascript object