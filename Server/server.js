// Entrypoint into Backend Application

require('dotenv').config(); 

const express = require("express");
const app = express();
const { createClient } = require('@supabase/supabase-js'); 
const bcrypt = require('bcrypt');

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

app.use(express.json());

//// ACCOUNT FUNCTIONS
// 1. Account Creation
app.post("/api/v1/createAccount", async (req, res) => {
    console.log(req.body);
    try {
        const hashedPassword = await bcrypt.hash(req.body.password, 10);

        const results = await supabase.from('users')
                                       .insert([
                                                { username: req.body.username, email: req.body.email, date_of_birth: req.body.date_of_birth, password_hash: hashedPassword  },
                                               ])
                                       .select('*')

        console.log(results);
        return res.status(200).json({
            status: "success",
            data: results.data
        });
    } catch (err) {
        console.error(err);
        return res.status(400).json({
            status: "error",
            message: "Username is already in use"
        });
    }
});


// 2. Log In
app.post("/api/v1/logIn", async (req, res) => {
    console.log(req.body);
    const { identification, password } = req.body;

    try {
        const { data: users, error } = await supabase
            .from('users')
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
                user: user,
            }
        });

    } catch (err) {
        console.error("Caught an error: ", err);
    }
});

// 3. Update Account Details
app.put("/api/v1/updateAccount/:user_uuid", async (req, res) => {
    console.log(req.body);
    try {
        const { data, error } = await supabase
            .from('users')
            .update({
                username: req.body.username,
                email: req.body.email,
                date_of_birth: req.body.date_of_birth,
                password_hash: req.body.password_hash
            })
            .eq('user_uuid', req.params.user_uuid)
            .select('*');

        if (error) {
            throw error;
        }

        console.log(data);
        res.status(200).json({
            status: "success",
            data: {
                posts: data[0],
            },
        });
    } catch (err) {
        console.log(err);
        res.status(500).json({
            status: "error",
            message: err.message,
        });
    }
});

// 4. Delete Account
app.delete("/api/v1/Account/:user_uuid", async (req, res) => {
    console.log(req.body);
    
    try {
        // Delete from config table first, because config has FK which references users
        let { data, error } = await supabase
            .from('config')
            .delete()
            .eq('user_uuid', req.params.user_uuid);

        if (error) {
            throw error;
        }

        // Delete from users table
        ({ data, error } = await supabase
            .from('users')
            .delete()
            .eq('user_uuid', req.params.user_uuid));

        if (error) {
            throw error;
        }

        res.status(204).json({
            status: "success"
        });

    } catch (err) {
        console.log(err);
        res.status(500).json({
            status: "error",
            message: err.message,
        });
    }
});

// 5. Get Account Information
app.get("/api/v1/getUserData/:user_uuid", async (req, res) => {
    console.log(req.params.user_uuid);
    try {
        const { data, error } = await supabase
            .from('users')
            .select('*')
            .eq('user_uuid', req.params.user_uuid);

        if (error) {
            throw error;
        }

        res.status(200).json({
            status: "success",
            data: {
                posts: data[0],
            },
        });
    } catch (err) {
        console.log(err);
        res.status(500).json({
            status: "error",
            message: err.message,
        });
    }
});


//// SECTION 2: POSTS TABLE
// 1. Get All Posts
app.get('/api/v1/allPosts', async (req, res) => {
    try {
        const { data, error } = await supabase
            .from('posts')
            .select(`*
                ,
                users (username)
                `)
            .order('post_date', { ascending: false })
            .order('post_time', { ascending: false });

        if (error) {
            throw error;
        }

        console.log(data);
        res.status(200).json({
            status: 'success',
            results: data.length,
            data: {
                posts: data,
            },
        });
    } catch (err) {
        console.log(err);
        res.status(500).json({
            status: 'error',
            message: err.message,
        });
    }
});

// 2. Get Individual Posts
app.get("/api/v1/Posts/:post_uuid", async (req, res) => {
    console.log(req.params.post_uuid);
    try {
        const { data, error } = await supabase
            .from('posts')
            .select('*')
            .eq('post_uuid', req.params.post_uuid);

        if (error) {
            throw error;
        }

        res.status(200).json({
            status: "success",
            data: {
                posts: data[0],
            },
        });
    } catch (err) {
        console.log(err);
        res.status(500).json({
            status: 'error',
            message: err.message,
        });
    }
});

// 3. Create a post
app.post("/api/v1/createPost/:user_uuid", async (req, res) => {
    console.log(req.body);
    try {
        const currentDate = new Date();
        const postDate = currentDate.toISOString().split('T')[0];
        const postTime = currentDate.toTimeString().split(' ')[0];
        const userUuid = req.params.user_uuid;

        const { data, error } = await supabase
            .from('posts')
            .insert([
                {
                    post_title: req.body.title,
                    post_body: req.body.body,
                    post_date: postDate, // Adding current date
                    post_time: postTime,  // Adding current time
                    user_uuid: userUuid,
                }
            ])
            .select('*');

        if (error) {
            throw error;
        }

        console.log(data);
        res.status(201).json({
            status: "success",
            data: {
                posts: data[0],
            }
        });
    } catch (err) {
        console.log(err);
        res.status(500).json({
            status: "error",
            message: err.message,
        });
    }
});

// Get user's post
app.get("/api/v1/getPosts/:user_uuid", async (req, res) => {
    console.log(req.params.user_uuid);
    try {
        const { data, error } = await supabase
            .from('posts')
            .select(`*
                ,
                users (username)
                `)
            .eq('user_uuid', req.params.user_uuid);

        if (error) {
            throw error;
        }

        res.status(200).json({
            status: "success",
            data: {
                posts: data,  // should NOT be data[0] because we are getting all the columms
            },
        });
    } catch (err) {
        console.log(err);
        res.status(500).json({
            status: 'error',
            message: err.message,
        });
    }
});

// Update post count
app.put("/api/v1/updatePostCount/:post_uuid", async (req, res) => {
    console.log(req.body);
    try {
        const { data, error } = await supabase
            .from('posts')
            .update({
                like_count: req.body.like_count,
                bookmark_count: req.body.bookmark_count,
                liked_by_user: req.body.liked,
                bookmarked_by_user: req.body.bookmarked
            })
            .eq('post_uuid', req.params.post_uuid)
            .select('*');

        if (error) {
            throw error;
        }

        console.log(data);
        res.status(200).json({
            status: "success",
            data: {
                posts: data,
            },
        });
    } catch (err) {
        console.log(err);
        res.status(500).json({
            status: "error",
            message: err.message,
        });
    }
});

// Delete post
app.delete("/api/v1/deletePost/:post_uuid", async (req, res) => {
    const post_uuid = req.params.post_uuid; // Extract post_uuid from request parameters

    try {
        const { data, error } = await supabase
            .from('posts')
            .delete()
            .eq('post_uuid', post_uuid);

        if (error) {
            throw error;
        }

        if (data && data.length === 0) {
            // If no rows were affected, handle accordingly (optional)
            res.status(404).json({
                status: "error",
                message: "Post not found or already deleted",
            });
            return;
        }

        res.status(200).json({
            status: "success",
            message: "Post deleted successfully",
        });

    } catch (err) {
        console.error(err.message);
        res.status(500).json({
            status: "error",
            message: "Failed to delete post",
        });
    }
});

// Update post
app.put("/api/v1/updatePost/:post_uuid", async (req, res) => {
    console.log(req.body);
    try {
        const { data, error } = await supabase
            .from('posts')
            .update({
                post_title: req.body.title,
                post_body: req.body.body
            })
            .eq('post_uuid', req.params.post_uuid)
            .select('*');

        if (error) {
            throw error;
        }

        console.log(data);
        res.status(200).json({
            status: "success",
            data: {
                posts: data,
            },
        });
    } catch (err) {
        console.log(err);
        res.status(500).json({
            status: "error",
            message: err.message,
        });
    }
});


// Search all posts
app.get("/api/v1/searchedPosts/:query", async (req, res) => {
    const query = req.params.query;
    
    try {
        const { data, error } = await supabase
            .from('posts')
            .select(`
                *,
                users (username)
            `);

        if (error) {
            throw error;
        }

        const filteredData = data.filter(post =>
            post.post_title.includes(query) ||
            post.post_body.includes(query) ||
            post.users.username.includes(query)
        );

        res.status(200).json({
            status: "success",
            data: {
                posts: filteredData,
            },
        });
    } catch (err) {
        console.log(err);
        res.status(500).json({
            status: 'error',
            message: err.message,
        });
    }
});

// 4. Update a post
app.put("/api/v1/Posts/:post_uuid", async (req, res) => {
    console.log(req.body);
    try {
        const { data, error } = await supabase
            .from('posts')
            .update({
                post_title: req.body.post_title,
                post_body: req.body.post_body
            })
            .eq('post_uuid', req.params.post_uuid)
            .select('*');

        if (error) {
            throw error;
        }

        console.log(data);
        res.status(200).json({
            status: "success",
            data: {
                posts: data[0],
            },
        });
    } catch (err) {
        console.log(err);
        res.status(500).json({
            status: "error",
            message: err.message,
        });
    }
});

// 5. Delete a post
app.delete("/api/v1/Posts/:post_uuid", async (req, res) => {
    console.log(req.body);
    try {
        const { data, error } = await supabase
            .from('posts')
            .delete()
            .eq('post_uuid', req.params.post_uuid);

        if (error) {
            throw error;
        }

        res.status(204).json({
            status: "success"
        });
    } catch (err) {
        console.log(err);
        res.status(500).json({
            status: "error",
            message: err.message,
        });
    }
});

//// SECTION 3: COMMENTS TABLE
// 1. Get all comments from a post
app.get("/api/v1/Comments/:post_uuid", async (req, res) => {
    console.log(req.params.post_uuid);
    try {
        const { data, error } = await supabase
            .from('comments')
            .select('*')
            .eq('post_uuid', req.params.post_uuid);

        if (error) {
            throw error;
        }

        res.status(200).json({
            status: "success",
            data: {
                comments: data,
            },
        });
    } catch (err) {
        console.log(err);
        res.status(500).json({
            status: "error",
            message: err.message,
        });
    }
});

// 2. Create a new comment
app.post("/api/v1/Comments/:user_uuid/:post_uuid", async (req, res) => {
    console.log(req.params);
    try {
        const { data, error } = await supabase
            .from('comments')
            .insert([
                {
                    comment_uuid: uuid(), // Assuming you generate UUID on the client side or use a UUID library
                    comment_body: req.body.comment_body,
                    comment_date: new Date().toISOString(), // Adding current date
                    comment_time: new Date().toISOString(), // Adding current time
                    user_uuid: req.params.user_uuid,
                    post_uuid: req.params.post_uuid
                }
            ])
            .select('*');

        if (error) {
            throw error;
        }

        console.log(data);
        res.status(201).json({
            status: "success",
            data: {
                comments: data[0],
            }
        });
    } catch (err) {
        console.log(err);
        res.status(500).json({
            status: "error",
            message: err.message,
        });
    }
});

// 3. Edit a comment
app.put("/api/v1/Comments/:comment_uuid", async (req, res) => {
    console.log(req.body);
    try {
        const { data, error } = await supabase
            .from('comments')
            .update({
                comment_body: req.body.comment_body
            })
            .eq('comment_uuid', req.params.comment_uuid)
            .select('*');

        if (error) {
            throw error;
        }

        console.log(data);
        res.status(200).json({
            status: "success",
            data: {
                comments: data[0],
            },
        });
    } catch (err) {
        console.log(err);
        res.status(500).json({
            status: "error",
            message: err.message,
        });
    }
});

// 4. Delete a comment
app.delete("/api/v1/Comments/:comment_uuid", async (req, res) => {
    console.log(req.body);
    try {
        const { data, error } = await supabase
            .from('comments')
            .delete()
            .eq('comment_uuid', req.params.comment_uuid);

        if (error) {
            throw error;
        }

        res.status(204).json({
            status: "success"
        });
    } catch (err) {
        console.log(err);
        res.status(500).json({
            status: "error",
            message: err.message,
        });
    }
});


//// SECTION 4: REPORTED POSTS
// 1. Report a post
app.post("/api/v1/reportedPosts/:user_uuid1/:user_uuid2/:post_uuid", async (req, res) => {
    console.log(req.params);
    try {
        const { data, error } = await supabase
            .from('reported_posts')
            .insert([
                {
                    date_reported: new Date().toISOString(), // Adding current date
                    time_reported: new Date().toISOString(), // Adding current time
                    reported_by_uuid: req.params.user_uuid1,
                    reported_against_uuid: req.params.user_uuid2,
                    post_reported_uuid: req.params.post_uuid
                }
            ])
            .select('*');

        if (error) {
            throw error;
        }

        console.log(data);
        res.status(201).json({
            status: "success",
            data: {
                reported_posts: data[0],
            }
        });
    } catch (err) {
        console.log(err);
        res.status(500).json({
            status: "error",
            message: err.message,
        });
    }
});

// 2. Get all reported posts (for moderators)
app.get("/api/v1/reportedPosts", async (req, res) => {
    try {
        const { data, error } = await supabase
            .from('reported_posts')
            .select('*');

        if (error) {
            throw error;
        }

        res.status(200).json({
            status: "success",
            data: {
                reported_posts: data,
            },
        });
    } catch (err) {
        console.log(err);
        res.status(500).json({
            status: "error",
            message: err.message,
        });
    }
});


// 3. See all reported posts by a user
app.get("/api/v1/reportedPosts/:user_uuid", async (req, res) => {
    try {
        const { data, error } = await supabase
            .from('reported_posts')
            .select('*')
            .eq('reported_by_uuid', req.params.user_uuid);

        if (error) {
            throw error;
        }

        res.status(200).json({
            status: "success",
            data: {
                reported_posts: data,
            },
        });
    } catch (err) {
        console.log(err);
        res.status(500).json({
            status: "error",
            message: err.message,
        });
    }
});

// 4. See all posts reported against the user
app.get("/api/v1/reportedPosts/:user_uuid", async (req, res) => {
    try {
        const { data, error } = await supabase
            .from('reported_posts')
            .select('*')
            .eq('reported_against_uuid', req.params.user_uuid);

        if (error) {
            throw error;
        }

        res.status(200).json({
            status: "success",
            data: {
                reported_posts: data,
            },
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({
            status: "error",
            message: err.message,
        });
    }
});

// 5. See a particular reported post
app.get("/api/v1/reportedPosts/:post_uuid", async (req, res) => {
    try {
        const { data, error } = await supabase
            .from('reported_posts')
            .select('*')
            .eq('reported_post_uuid', req.params.post_uuid);

        if (error) {
            throw error;
        }

        res.status(200).json({
            status: "success",
            data: {
                reported_posts: data[0], // Assuming you want the first reported post
            },
        });
    } catch (err) {
        console.log(err);
        res.status(500).json({
            status: "error",
            message: err.message,
        });
    }
});

// 6. Remove post from reported posts
app.delete("/api/v1/reportedPosts/:post_uuid", async (req, res) => {
    console.log(req.body);
    try {
        const { data, error } = await supabase
            .from('reported_posts')
            .delete()
            .eq('reported_post_uuid', req.params.post_uuid);

        if (error) {
            throw error;
        }

        res.status(204).json({
            status: "success"
        });
    } catch (err) {
        console.log(err);
        res.status(500).json({
            status: "error",
            message: err.message,
        });
    }
});

//// SECTION 5: REPORTED COMMENTS
// 1. Report a comment
app.post("/api/v1/reportedComments/:user_uuid1/:user_uuid2/:comment_uuid", async (req, res) => {
    console.log(req.params);
    try {
        const { data, error } = await supabase
            .from('reported_comments')
            .insert([
                {
                    date_reported: new Date().toISOString(), // Adding current date
                    time_reported: new Date().toISOString(), // Adding current time
                    reported_by_uuid: req.params.user_uuid1,
                    reported_against_uuid: req.params.user_uuid2,
                    comment_reported_uuid: req.params.comment_uuid
                }
            ])
            .select('*');

        if (error) {
            throw error;
        }

        console.log(data);
        res.status(201).json({
            status: "success",
            data: {
                reported_comments: data[0],
            }
        });
    } catch (err) {
        console.log(err);
        res.status(500).json({
            status: "error",
            message: err.message,
        });
    }
});

// 2. Get all reported comments (for moderators)
app.get("/api/v1/reportedComments", async (req, res) => {
    try {
        const { data, error } = await supabase
            .from('reported_comments')
            .select('*');

        if (error) {
            throw error;
        }

        res.status(200).json({
            status: "success",
            data: {
                reported_comments: data,
            },
        });
    } catch (err) {
        console.log(err);
        res.status(500).json({
            status: "error",
            message: err.message,
        });
    }
});

// 3. See all reported comments reported by a user
app.get("/api/v1/reportedComments/:user_uuid", async (req, res) => {
    try {
        const { data, error } = await supabase
            .from('reported_comments')
            .select('*')
            .eq('reported_by_uuid', req.params.user_uuid);

        if (error) {
            throw error;
        }

        res.status(200).json({
            status: "success",
            data: {
                reported_comments: data,
            },
        });
    } catch (err) {
        console.log(err);
        res.status(500).json({
            status: "error",
            message: err.message,
        });
    }
});

// 4. See all comments reported against a user
app.get("/api/v1/reportedComments/:user_uuid", async (req, res) => {
    try {
        const { data, error } = await supabase
            .from('reported_comments')
            .select('*')
            .eq('reported_against_uuid', req.params.user_uuid);

        if (error) {
            throw error;
        }

        res.status(200).json({
            status: "success",
            data: {
                reported_comments: data,
            },
        });
    } catch (err) {
        console.log(err);
        res.status(500).json({
            status: "error",
            message: err.message,
        });
    }
});

// 5. See a particular reported comment
app.get("/api/v1/reportedComments/:comment_uuid", async (req, res) => {
    try {
        const { data, error } = await supabase
            .from('reported_comments')
            .select('*')
            .eq('reported_comment_uuid', req.params.comment_uuid);

        if (error) {
            throw error;
        }

        res.status(200).json({
            status: "success",
            data: {
                reported_comments: data[0], // Assuming you want the first reported comment
            },
        });
    } catch (err) {
        console.log(err);
        res.status(500).json({
            status: "error",
            message: err.message,
        });
    }
});

// 6. Remove comment from reported comments
app.delete("/api/v1/reportedComments/:comment_uuid", async (req, res) => {
    console.log(req.body);
    try {
        const { data, error } = await supabase
            .from('reported_comments')
            .delete()
            .eq('reported_comment_uuid', req.params.comment_uuid);

        if (error) {
            throw error;
        }

        res.status(204).json({
            status: "success"
        });
    } catch (err) {
        console.log(err);
        res.status(500).json({
            status: "error",
            message: err.message,
        });
    }
});


/** 
///// SECTION 6: MODERATORS TABLE


///// SECTION 7: DISPLAY CONFIGURATION TABLE
// 1. Look at display configuration settings
app.get("/api/v1/Config/:user_uuid", async (req, res) => {
    console.log(req.params.user_uuid);
    try {
        const results = await db.query(
            "SELECT * FROM config WHERE user_uuid = $1", [req.params.user_uuid]
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

// 2. Update display configuration settings
app.put("/api/v1/Config/:user_uuid", async (req, res) => {
    console.log(req.body);
    try {
        const results = await db.query("UPDATE config SET style = $1, colour = $2, char_size = $3 WHERE user_uuid = $4 RETURNING *", 
            [req.body.style, req.body.colour, req.body.char_size, req.params.user_uuid]);
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
*/

// Configuration Pages
// 1. Insert University
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

// 2. Insert Interests
app.post("/api/v1/insertInterests", async (req, res) => {
    console.log(req.body);
    const id  = req.body.id;
    const interests = req.body.selectedInterests;
    try {

        const {data, error} = await supabase.from('configuration')
                                            .update({interests: interests})
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

// 3. Insert Accomodation
app.post("/api/v1/insertAccommodation", async (req, res) => {
    console.log(req.body);
    const id  = req.body.id;
    const accommodation = req.body.accommodation;
    try {

        const {data, error} = await supabase.from('configuration')
                                            .update({campus_accommodation: accommodation})
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

// 4. Insert Major
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

// 4. Insert Year of Study
app.post("/api/v1/insertYear", async (req, res) => {
    console.log(req.body);
    const id  = req.body.id;
    const yearofstudy = req.body.selectedYear;
    try {

        const {data, error} = await supabase.from('configuration')
                                        .insert([
                                                { user_uuid: id, year_of_study: yearofstudy },
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

const port = process.env.PORT || 3000;   
// Storing the value of port to the environment variable defined in env, if env not available, 
// then listen on port 3000


app.listen(port, () => {
    console.log(`Server is up and listening on port ${port}`);
});

