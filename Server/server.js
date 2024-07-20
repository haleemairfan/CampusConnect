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
        origin: 'http://192.168.50.176:3000',
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
                                       .select()

                                               
        if (error) {
            throw error;
        }

        user = data[0];

        return res.status(200).json({
            status: "success",
            data: {
                userID: user.user_uuid,
                username: user.username
            }
        });


    } catch (err) {
        console.error(err)
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
                userID: user.user_uuid,
                username: user.username
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
app.get("/api/v1/Account/:user_uuid", async (req, res) => {
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
app.get('/api/v1/Posts', async (req, res) => {
    try {
        const { data, error } = await supabase
            .from('posts')
            .select('*');

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
app.post("/api/v1/Posts", async (req, res) => {
    console.log(req.body);
    try {
        const { data, error } = await supabase
            .from('posts')
            .insert([
                {
                    post_title: req.body.post_title,
                    post_body: req.body.post_body,
                    post_date: new Date().toISOString(), // Adding current date
                    post_time: new Date().toISOString()  // Adding current time
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

