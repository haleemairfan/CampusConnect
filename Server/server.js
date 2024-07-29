// Entrypoint into Backend Application

require('dotenv').config(); 

const express = require("express");
const app = express();
const { createClient } = require('@supabase/supabase-js'); 
const bcrypt = require('bcrypt');
const cors = require("cors");
const { Server } = require("socket.io");
const http = require('http');

const port = process.env.PORT || 3000;   

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

app.use(express.json());
app.use(cors());
  
  
const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: 'http://localhost:3000',
        methods: ["POST"]
    }
});

const socketUserMap = new Map();



io.use((socket, next) => {
    const username = socket.handshake.auth.username;
    if (!username) {
        return next(new Error("invalid username"));
    }
    socket.username = username;
    socketUserMap.set(username, socket.id);
    next();
})

io.on('connection', (socket) => {
    socket.on('join', async (data) => {
        const roomId = data.id
        socket.join(roomId)
        console.log('user has joined.')
    })

    socket.on('sendMessage', async (data) => {
        const { messageID, id, sender, message } = data
        io.to(id).emit('newMessage', { id, data });
    })

    
})

server.listen(port, () => {
    console.log(`Server is up and listening on port ${port}`);
});

//// ACCOUNT FUNCTIONS
// 1. Account Creation
app.post("/api/v1/createAccount", async (req, res) => {
    console.log(req.body);
    try {
        const hashedPassword = await bcrypt.hash(req.body.password, 10);

        const { data, error} = await supabase.from('users')
                                       .insert([
                                                { username: req.body.username, email: req.body.email, date_of_birth: req.body.date_of_birth, password_hash: hashedPassword  },
                                               ])
                                       .select('*')
        
        if (error) {
            throw error;
        }

        const user = data[0];
        return res.status(200).json({
            status: "success",
            data: {
                user_uuid: user.user_uuid,
                username: user.username,
                type: "new User"
            }
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
                user_uuid: user.user_uuid,
                username: user.username,
                type: "returning User"
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
// Get All Posts with Pagination
app.get('/api/v1/allPosts', async (req, res) => {
    const { limit = 10, offset = 0 } = req.query;

    try {
        const { data, error } = await supabase
            .from('posts')
            .select(`*
                ,
                users (username)
                `)
            .order('post_date', { ascending: false })
            .order('post_time', { ascending: false })
            .range(offset, offset + limit - 1); // Pagination

        if (error) {
            throw error;
        }

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
        const { data: post, error: postError } = await supabase
            .from('posts')
            .update({
                like_count: req.body.like_count,
                bookmark_count: req.body.bookmark_count,
                liked_by_user: req.body.liked,
                bookmarked_by_user: req.body.bookmarked
            })
            .eq('post_uuid', req.params.post_uuid)
            .select('*');
        

        if (postError) {
            throw postError;
        }
        const { data: existingInteractions, error: interactionError } = await supabase
        .from('user_interactions')
        .select('*')
        .eq('user_uuid', req.body.user_uuid)
        .eq('post_uuid', req.params.post_uuid);
    
        if (interactionError) {
            throw interactionError;
        }
        
        if (existingInteractions.length > 0) {
            const existingInteraction = existingInteractions[0];
            const { data: updatedInteraction, error: updateError } = await supabase
                .from('user_interactions')
                .update({
                    liked: req.body.liked,
                    bookmarked: req.body.bookmarked,
                })
                .eq('user_uuid', req.body.user_uuid)
                .eq('post_uuid', req.params.post_uuid)
                .select('*');

        if (updateError) {
            throw updateError;
        }


        } else {
            const { data: newInteraction, error: insertError } = await supabase
                .from('user_interactions')
                .insert({
                    user_uuid: req.body.user_uuid,
                    post_uuid: req.params.post_uuid,
                    liked: req.body.liked,
                    bookmarked: req.body.bookmarked,
                })
                .select('*');

            if (insertError) {
                throw insertError;
            }

        }
        

        console.log(data);
        res.status(200).json({
            status: "success",
            data: {
                posts: post,
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
                                        .insert([
                                                { user_uuid: id, university: university },
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
                                        .update({ major: major })
                                        .eq('user_uuid', id);

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
                                        .update({year_of_study: yearofstudy})
                                        .eq('user_uuid', id);

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


app.post("/api/v1/validateUsername", async (req, res) => {
    console.log(req.body);
    const { recipient } = req.body;

    try {
        const { data: users, error } = await supabase
            .from('users')
            .select('*')
            .eq('username', recipient);

        if (error) {
            throw error;
        }

        if (!users || users.length === 0) {
            return res.status(400).json({
                status: "error",
                data: {
                    isValid: false
                }
                
            });
        }


        const id = socketUserMap.get(recipient);
    
    
        return res.status(200).json({
            status: "success",
            data: {
                isValid: true,
                socketID: id
            }
        });
    

    } catch (err) {
        console.error("Caught an error: ", err);
    }
});


  app.post('/api/v1/conversations', async (req, res) => {
    const { sender, recipient } = req.body;
  
    try {

        const { data, error } = await supabase
            .from('conversations')
            .insert([{ sender: sender, recipient: recipient}])
            .select();
        
        
        if (error) {
            throw error;
        }
        const conversation = data[0];
        io.to(socketUserMap.get(sender)).emit('newConversation', conversation);
        io.to(socketUserMap.get(recipient)).emit('newConversation', conversation);


    
        return res.status(201).json({ message: "success" });

    } catch (error) {

        console.error('Error creating conversation:', error.message);
        res.status(500).json({ error: error.message });
    }
  });


  app.post('/api/v1/fetchAllConversations', async (req, res) => {
    const { sender } = req.body;
  
    try {

        const { data, error } = await supabase
            .from('conversations')
            .select("*")
            .or(`sender.eq.${sender},recipient.eq.${sender}`)
        
        
        if (error) {
            throw error;
        }

        console.log('Query data:', data);
        console.log('Query error:', error);

    
        return res.status(201).json({ message: "success", data: data});

    } catch (error) {

        console.error('Error creating conversation:', error.message);
        res.status(500).json({ error: error.message });
    }
  });

  app.post('/api/v1/sendMessage', async (req, res) => {
    const { id, sender, message } = req.body;

    try {

        const { data, error } = await supabase
            .from('chat')
            .insert([{ id: id, sender: sender, message: message}])
            .select()
        
        
        if (error) {
            throw error;
        }

        
    
        return res.status(201).json({ message: "success", data: data[0]});

    } catch (error) {

        console.error('Error creating conversation:', error.message);
        res.status(500).json({ error: error.message });
    }


  })

  app.post('/api/v1/getMessages', async (req, res) => {
    const { id } = req.body;

    try {

        const { data, error } = await supabase
            .from('chat')
            .select('*')
            .eq('id', id)
        
        
        if (error) {
            throw error;
        }

        
    
        return res.status(201).json({ message: "success", data: data });

    } catch (error) {

        console.error('Error creating conversation:', error.message);
        res.status(500).json({ error: error.message });
    }


  })

  app.post("/api/v1/initialFeed", async (req, res) => {
    const { user_uuid, limit = 10, offset = 0 } = req.body;

    try {
        // Fetch user configurations
        const { data: userConfig, error: configError } = await supabase
            .from('configuration')
            .select('*')
            .eq('user_uuid', user_uuid);

        if (configError) {
            throw configError;
        }

        if (!userConfig || userConfig.length === 0) {
            return res.status(400).json({
                status: "error",
                message: "User configuration not found"
            });
        }

        const user = userConfig[0];
        const { university, major, interests, year_of_study } = user;

        // Fetch users with matching configurations
        const { data: matchingUsers, error: usersError } = await supabase
            .from('configuration')
            .select('user_uuid, university, major, year_of_study, interests')
            .or(`university.eq.${university},major.eq.${major},year_of_study.eq.${year_of_study}`)
            .or(interests.map(interest => `interests.ilike.%${interest}%`).join(','));

        if (usersError) {
            throw usersError;
        }

        // Calculate scores based on matching configurations
        const userScores = matchingUsers.map(user => {
            let score = 0;
            if (user.university === university) score += 1;
            if (user.major === major) score += 1;
            if (user.year_of_study === year_of_study) score += 1;
            if (user.interests) {
                const userInterests = user.interests;
                const commonInterests = interests.filter(interest => userInterests.includes(interest));
                score += commonInterests.length;
            }
            return { user_uuid: user.user_uuid, score };
        });

        // Sort users by score in descending order
        userScores.sort((a, b) => b.score - a.score);

        // Fetch posts from matched users with pagination
        const userUuids = userScores.map(user => user.user_uuid);
        const { data: posts, error: postsError } = await supabase
            .from('posts')
            .select('*')
            .in('user_uuid', userUuids)
            .order('user_uuid', { ascending: true }) // To maintain order of prioritized users
            .order('post_date', { ascending: false }) // To sort posts by date
            .range(offset, offset + limit - 1); // Pagination

        if (postsError) {
            throw postsError;
        }

        let fetchedPosts = posts;

        // If not enough posts, fetch random posts to fill the gap
        if (fetchedPosts.length < limit) {
            const remainingLimit = limit - fetchedPosts.length;
            const { data: randomPosts, error: randomPostsError } = await supabase
                .from('posts')
                .select('*')
                .not('user_uuid', 'in', `(${userUuids.join(',')})`)
                .order('post_date', { ascending: false }) // To sort posts by date
                .range(0, remainingLimit - 1); // Fetch the remaining number of posts

            if (randomPostsError) {
                throw randomPostsError;
            }

            fetchedPosts = [...fetchedPosts, ...randomPosts];
        }

        return res.status(200).json({
            status: "success",
            data: fetchedPosts,
        });
    } catch (err) {
        console.error(err);
        return res.status(500).json({
            status: "error",
            message: err.message,
        });
    }
});

const getUserInteractions = async (user_uuid) => {
    const { data, error } = await supabase
        .from('user_interactions')
        .select('*')
        .eq('user_uuid', user_uuid)
        .or('liked.eq.true, bookmarked.eq.true'); // Assuming these are the columns indicating interactions

    if (error) {
        throw error;
    }

    return data;
}

const calculateSimilarity = async (userOneUUID, userTwoUUID) => {
    let userOne = await getUserInteractions(userOneUUID);
    let userTwo = await getUserInteractions(userTwoUUID);

    let totalInteractions = userOne.length + userTwo.length;

    let userOnePostUUID = new Set(userOne.map(interaction => interaction.post_uuid));
    let userTwoPostUUID = new Set(userTwo.map(interaction => interaction.post_uuid));

    let commonInteractions = Array.from(userOnePostUUID).filter(post => userTwoPostUUID.has(post));

    return commonInteractions.length / totalInteractions;
}


app.post("/api/v1/memoryBasedCollaborativeFiltering", async (req, res) => {
    const { user_uuid, limit, offset } = req.body;

    if (!user_uuid) {
        return res.status(400).json({
            status: "error",
            message: "user_uuid is required"
        });
    }

    try {
        const { data: userConfig, error: configError } = await supabase
            .from('configuration')
            .select('*')
            .eq('user_uuid', user_uuid);

        if (configError) {
            throw configError;
        }

        if (!userConfig || userConfig.length === 0) {
            return res.status(400).json({
                status: "error",
                message: "User configuration not found"
            });
        }

        const user = userConfig[0];
        const { university, major, interests, year_of_study } = user;

        let query = supabase
            .from('configuration')
            .select('user_uuid, university, major, year_of_study, interests')
            .or(`university.eq.${university},major.eq.${major},year_of_study.eq.${year_of_study}`);
        
        if (interests && interests.length > 0) {
            query = query.contains('interests', interests);
        }

        const { data: matchingUsers, error: usersError } = await query;

        if (usersError) {
            throw usersError;
        }

        const userScores = [];
        for (const matchingUser of matchingUsers) {
            let score = 0;
            if (matchingUser.university === university) score += 1;
            if (matchingUser.major === major) score += 1;
            if (matchingUser.year_of_study === year_of_study) score += 1;
            if (matchingUser.interests) {
                const userInterests = matchingUser.interests;
                const commonInterests = interests.filter(interest => userInterests.includes(interest));
                score += commonInterests.length;
            }
            const similarity = await calculateSimilarity(user_uuid, matchingUser.user_uuid);
            score += similarity;
            userScores.push({ user_uuid: matchingUser.user_uuid, score });
        }

        userScores.sort((a, b) => b.score - a.score);

        const userUuids = userScores.map(user => user.user_uuid);
        const { data: posts, error: postsError } = await supabase
            .from('posts')
            .select(`
                *,
                users (
                    username,
                    user_flairs
                )
            `)
            .in('user_uuid', userUuids)
            .order('post_date', { ascending: false })
            .range(offset, offset + limit - 1);

        if (postsError) {
            throw postsError;
        }

        let fetchedPosts = posts;

        if (fetchedPosts.length < limit) {
            const remainingLimit = limit - fetchedPosts.length;
            const { data: randomPosts, error: randomPostsError } = await supabase
                .from('posts')
                .select(`
                    *,
                    users (
                        username,
                        user_flairs
                    )
                `)
                .not('user_uuid', 'in', `(${userUuids.join(',')})`)
                .order('post_date', { ascending: false })
                .range(0, remainingLimit - 1);

            if (randomPostsError) {
                throw randomPostsError;
            }

            fetchedPosts = [...fetchedPosts, ...randomPosts];
        }

        return res.status(200).json({
            status: "success",
            data: {
                posts: fetchedPosts
            }
        });
    } catch (err) {
        console.error(err);
        return res.status(500).json({
            status: "error",
            message: err.message,
        });
    }
});

app.post("/api/v1/recentPosts", async (req, res) => {
    const { user_uuid } = req.query;

    try {
        // Fetch the most recent posts
        const { data: posts, error: postsError } = await supabase
            .from('posts')
            .select('*')
            .eq('user_uuid', user_uuid) // Filter by user_uuid
            .order('post_date', { ascending: false }) // To sort posts by date
            .order('post_time', { ascending: false }); // To sort posts by time within the same date

        if (postsError) {
            throw postsError;
        }

        return res.status(200).json({
            status: "success",
            data: posts,
        });
    } catch (err) {
        console.error(err);
        return res.status(500).json({
            status: "error",
            message: err.message,
        });
    }
});


app.post("/api/v1/getPopularPosts", async (req, res) => {
    const { user_uuid } = req.query;

    try {
        // Fetch the most popular posts based on likes and bookmarks
        const { data: posts, error: postsError } = await supabase
            .from('posts')
            .select('*')
            .eq('user_uuid', user_uuid) // Filter by user_uuid
            .order('like_count', { ascending: false }) // To sort posts by number of likes
            .order('bookmark_count', { ascending: false }); // To sort posts by number of bookmarks

        if (postsError) {
            throw postsError;
        }

        return res.status(200).json({
            status: "success",
            data: posts,
        });
    } catch (err) {
        console.error(err);
        return res.status(500).json({
            status: "error",
            message: err.message,
        });
    }
});
 