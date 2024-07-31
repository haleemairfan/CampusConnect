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

        const { data, error } = await supabase.from('users')
                                              .insert([
                                                  {
                                                      username: req.body.username,
                                                      email: req.body.email,
                                                      date_of_birth: req.body.date_of_birth,
                                                      password_hash: hashedPassword
                                                  }
                                              ])
                                              .select();

        if (error) {
            throw error;
        }

        const user = data[0];

        return res.status(200).json({
            status: "success",
            data: {
                user_uuid: user.user_uuid,
                username: user.username
            }
        });
    } catch (err) {
        console.error(err);
        return res.status(500).json({
            status: "error",
            message: err.message
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
  
  



app.get("/api/v1/getBlockedAccounts/:user_uuid", async (req, res) => {
    try {
        const { data: blockedUsers, error: blockedUsersError } = await supabase
            .from('blockedusers')
            .select('blocked_user_id')
            .eq('blocker_user_id', req.params.user_uuid);

        if (blockedUsersError) {
            throw blockedUsersError;
        }

        const blockedUserIds = blockedUsers.map(user => user.blocked_user_id);

        if (blockedUserIds.length === 0) {
            return res.status(200).json([]);
        }

        const { data: usernames, error: usernamesError } = await supabase
            .from('users')
            .select('user_uuid, username')
            .in('user_uuid', blockedUserIds);

        if (usernamesError) {
            throw usernamesError;
        }

        const blockedAccounts = blockedUsers.map(user => ({
            blocked_user_id: user.blocked_user_id,
            username: usernames.find(u => u.user_uuid === user.blocked_user_id)?.username
        }));

        res.status(200).json(blockedAccounts);
    } catch (err) {
        console.log(err);
        res.status(500).json({
            status: "error",
            message: err.message,
        });
    }
});

// Remove Blocked Account from Table
app.delete("/api/v1/removeBlockedAccount/:blocked_user_uuid/:blocker_user_uuid", async (req, res) => {
    const { blocked_user_uuid, blocker_user_uuid } = req.params;

    try {
        const { data, error } = await supabase
            .from('blockedusers')
            .delete()
            .eq('blocker_user_id', blocker_user_uuid)
            .eq('blocked_user_id', blocked_user_uuid);

        if (error) {
            throw error;
        }

        res.status(204).end();

    } catch (err) {
        console.error(err);
        res.status(500).json({
            status: "error",
            message: err.message,
        });
    }
});

// Get All Comments

// Get User Data
app.get("/api/v1/getAccountDetails/:user_uuid", async (req, res) => {
    console.log(req.params.user_uuid);
    try {
        // Fetch user data from the users table
        const { data: userData, error: userError } = await supabase
            .from('users')
            .select('*')
            .eq('user_uuid', req.params.user_uuid)
            .single(); // Ensures we get a single row

        if (userError) {
            throw userError;
        }

        // Fetch configuration data from the configuration table
        const { data: configData, error: configError } = await supabase
            .from('configuration')
            .select('university, major, interests, year_of_study')
            .eq('user_uuid', req.params.user_uuid)
            .single(); // Ensures we get a single row

        if (configError) {
            throw configError;
        }

        // Combine user and configuration data
        const combinedData = {
            ...userData,
            configuration: configData,
        };

        res.status(200).json({
            status: "success",
            data: combinedData,
        });
    } catch (err) {
        console.log(err);
        res.status(500).json({
            status: "error",
            message: err.message,
        });
    }
});

// Update Account
app.put("/api/v1/updateAccount/:user_uuid", async (req, res) => {
    console.log(req.body);
    try {
        const { data, error } = await supabase
            .from('users')
            .update({
                username: req.body.username,
                email: req.body.email,
                date_of_birth: req.body.date_of_birth,
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

// Update Config
app.put("/api/v1/updateConfig/:user_uuid", async (req, res) => {
    try {
        const { data, error } = await supabase
            .from('configuration')
            .update({
                university: req.body.university,
                major: req.body.major,
                year_of_study: req.body.year_of_study,
                interests: req.body.interests
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

// Update Password
app.put("/api/v1/updatePassword/:user_uuid", async (req, res) => {
    const { old_password, new_password } = req.body;
    const user_uuid = req.params.user_uuid;

    try {
        // Fetch the user data
        const { data: userData, error: fetchError } = await supabase
            .from('users')
            .select('password_hash')
            .eq('user_uuid', user_uuid)
            .single();

        if (fetchError) {
            throw fetchError;
        }

        const storedPasswordHash = userData.password_hash;

        // Compare the old password with the stored password hash
        const isMatch = await bcrypt.compare(old_password, storedPasswordHash);

        if (!isMatch) {
            return res.status(400).json({
                status: "error",
                message: "Incorrect old password",
            });
        }

        // Hash the new password
        const newHashedPassword = await bcrypt.hash(new_password, 10);

        // Update the password in the database
        const { data, error: updateError } = await supabase
            .from('users')
            .update({ password_hash: newHashedPassword })
            .eq('user_uuid', user_uuid)
            .select('*');

        if (updateError) {
            throw updateError;
        }

        res.status(200).json({
            status: "success",
            data: {
                user: data[0],
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

// Get Single Post
app.get("/api/v1/singlePost/:post_uuid", async (req, res) => {
    try {
        const { data, error } = await supabase
            .from('posts')
            .select(`*,
                users (username, user_flairs)
            `)
            .eq('post_uuid', req.params.post_uuid)

        if (error) {
            throw error;
        }

        res.status(200).json({
            status: "success",
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

// Update Comment
app.put("/api/v1/updateComment/:post_uuid/:comment_uuid/:user_uuid", async (req, res) => {
    try {
        const { data, error } = await supabase
            .from('comments')
            .update([
                {
                comment_body: req.body.body,
            }
            ])
            .eq('user_uuid', req.params.user_uuid)
            .eq('comment_uuid', req.params.comment_uuid)
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

// Get All Comments
app.get("/api/v1/allComments/:post_uuid", async (req, res) => {
    console.log(req.params.post_uuid);
    try {
        const { data, error } = await supabase
            .from('comments')
            .select(`
                *,
                users:users (username)
            `)
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

// Create Comment
app.post("/api/v1/createComment/:user_uuid/:post_uuid", async (req, res) => {
    console.log(req.params);
    const currentDate = new Date();
    const postDate = currentDate.toISOString().split('T')[0];
    const postTime = currentDate.toTimeString().split(' ')[0];

    try {
        const { data, error } = await supabase
            .from('comments')
            .insert([
                {
                    comment_body: req.body.comment_body,
                    comment_date: postDate, // Adding current date
                    comment_time: postTime, // Adding current time
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

// Update Post Count
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

// Update Comment Count
app.put("/api/v1/updateCommentCount/:comment_uuid", async (req, res) => {
    try {
        const { data, error } = await supabase
            .from('comments')
            .update({
                comment_like_count: req.body.comment_like_count,
                comment_dislike_count: req.body.comment_dislike_count,
                comment_liked: req.body.comment_liked,
                comment_disliked: req.body.comment_disliked
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

// Delete Account
app.delete("/api/v1/deleteAccount/:user_uuid", async (req, res) => {
    console.log(req.body);
    
    try {
        ({ data, error } = await supabase
            .from('users')
            .delete()
            .eq('user_uuid', req.params.user_uuid));

        if (error) {
            throw error;
        }

        res.status(204).end();

    } catch (err) {
        console.log(err);
        res.status(500).json({
            status: "error",
            message: err.message,
        });
    }
});

// Update Post
app.put("/api/v1/updatePost/:post_uuid", async (req, res) => {
    console.log(req.body);
    try {
        const { data, error } = await supabase
            .from('posts')
            .update({
                post_title: req.body.title,
                post_body: req.body.body,
                tags: req.body.tags
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

// Get Popular Posts
app.get('/api/v1/getPopularPosts/:user_uuid', async (req, res) => {
    try {
        const user_uuid = req.params.user_uuid;

        // Step 1: Get the list of blocked user IDs for the given user_uuid
        const { data: blockedUsersData, error: blockedUsersError } = await supabase
            .from('blockedusers')
            .select('blocked_user_id')
            .eq('blocker_user_id', user_uuid)
            .eq('blocked', true);

        if (blockedUsersError) {
            throw blockedUsersError;
        }

        // Extract blocked user IDs
        const blockedUserIds = blockedUsersData.map(item => item.blocked_user_id);

        // Step 2: Get the list of blocked post IDs for the given user_uuid
        const { data: blockedPostsData, error: blockedPostsError } = await supabase
            .from('blockedposts')
            .select('blocked_post_id')
            .eq('blocker_user_id', user_uuid)
            .eq('blocked', true);

        if (blockedPostsError) {
            throw blockedPostsError;
        }

        // Extract blocked post IDs
        const blockedPostIds = blockedPostsData.map(item => item.blocked_post_id);

        // Step 3: Query posts and filter out those from blocked users and blocked posts
        const { data, error } = await supabase
            .from('posts')
            .select(`*, users (username, user_flairs)`)
            .not('user_uuid', 'in', `(${blockedUserIds.join(',')})`)
            .not('post_uuid', 'in', `(${blockedPostIds.join(',')})`)
            .order('like_count', { ascending: false })
            .order('bookmark_count', { ascending: false })
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

// Get Recommended Posts
app.get('/api/v1/getRecommendedPosts/:user_uuid', async (req, res) => {
    try {
        const { user_uuid } = req.params;

        // Step 1: Get user configuration
        const { data: configData, error: configError } = await supabase
            .from('configuration')
            .select('university, major, year_of_study, interests')
            .eq('user_uuid', user_uuid);

        if (configError) {
            throw configError;
        }

        if (!configData || configData.length === 0) {
            return res.status(404).json({
                status: 'error',
                message: 'Configuration data not found for the user',
            });
        }

        let keywords = [];
        configData.forEach(config => {
            if (config.university) keywords.push(config.university);
            if (config.major) keywords.push(config.major);
            if (config.year_of_study) keywords.push(config.year_of_study);
            if (config.interests && Array.isArray(config.interests)) {
                config.interests.forEach(interest => {
                    if (typeof interest === 'string') {
                        keywords.push(interest.trim());
                    } else {
                        console.log(`Interest is not a string:`, interest);
                    }
                });
            } else {
                console.log(`Interests for user_uuid ${user_uuid} is not an array:`, config.interests);
            }
        });

        console.log(keywords);

        if (keywords.length === 0) {
            return res.status(404).json({
                status: 'error',
                message: 'No keywords found in configuration data for the user',
            });
        }

        // Step 2: Get the list of blocked user IDs for the given user_uuid
        const { data: blockedUsersData, error: blockedUsersError } = await supabase
            .from('blockedusers')
            .select('blocked_user_id')
            .eq('blocker_user_id', user_uuid)
            .eq('blocked', true);

        if (blockedUsersError) {
            throw blockedUsersError;
        }

        // Extract blocked user IDs from the response
        const blockedUserIds = blockedUsersData.map(item => item.blocked_user_id);

        // Step 3: Get the list of blocked post IDs for the given user_uuid
        const { data: blockedPostsData, error: blockedPostsError } = await supabase
            .from('blockedposts')
            .select('blocked_post_id')
            .eq('blocker_user_id', user_uuid)
            .eq('blocked', true);

        if (blockedPostsError) {
            throw blockedPostsError;
        }

        // Extract blocked post IDs from the response
        const blockedPostIds = blockedPostsData.map(item => item.blocked_post_id);

        // Step 4: Construct the OR conditions for keywords
        const orConditions = keywords.map(keyword => {
            return `post_title.ilike.%${keyword}%` +
                   `,post_body.ilike.%${keyword}%` +
                   `,tags.ilike.%${keyword}%`;
        }).join(',');

        // Step 5: Query posts and filter out those from blocked users and blocked posts
        const { data, error } = await supabase
            .from('posts')
            .select(`*, users (username, user_flairs)`)
            .or(orConditions)
            .not('user_uuid', 'in', `(${blockedUserIds.join(',')})`)
            .not('post_uuid', 'in', `(${blockedPostIds.join(',')})`)
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

// Get All Posts
app.get('/api/v1/allPosts/:user_uuid', async (req, res) => {
    try {
        const userUuid = req.params.user_uuid;

        // Step 1: Get the list of blocked user IDs for the given user_uuid
        const { data: blockedUsersData, error: blockedUsersError } = await supabase
            .from('blockedusers')
            .select('blocked_user_id')
            .eq('blocker_user_id', userUuid)
            .eq('blocked', true);

        if (blockedUsersError) {
            throw blockedUsersError;
        }

        // Extract blocked user IDs from the response
        const blockedUserIds = blockedUsersData.map(item => item.blocked_user_id);

        // Step 2: Get the list of blocked post IDs for the given user_uuid
        const { data: blockedPostsData, error: blockedPostsError } = await supabase
            .from('blockedposts')
            .select('blocked_post_id')
            .eq('blocker_user_id', userUuid)
            .eq('blocked', true);

        if (blockedPostsError) {
            throw blockedPostsError;
        }

        // Extract blocked post IDs from the response
        const blockedPostIds = blockedPostsData.map(item => item.blocked_post_id);

        // Step 3: Query posts and filter out those from blocked users and blocked posts
        const { data, error } = await supabase
            .from('posts')
            .select(`*,
                users (username, user_flairs)
                `)
            .not('user_uuid', 'in', `(${blockedUserIds.join(',')})`)
            .not('post_uuid', 'in', `(${blockedPostIds.join(',')})`)
            .order('post_date', { ascending: false })
            .order('post_time', { ascending: false });

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

// Get All Posts
app.get("/api/v1/getPosts/:user_uuid", async (req, res) => {
    console.log(req.params.user_uuid);
    try {
        const { data, error } = await supabase
            .from('posts')
            .select(`*
                ,
                users (username, user_flairs)
                `)
            .eq('user_uuid', req.params.user_uuid)
            .order('post_date', { ascending: false })
            .order('post_time', { ascending: false });


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

// Get Bookmarked Posts
app.get("/api/v1/getBookmarkedPosts/:user_uuid", async (req, res) => {
    console.log(req.params.user_uuid);
    try {
        const { data, error } = await supabase
            .from('posts')
            .select(`*,
                users (username, user_flairs)
            `)
            .eq('bookmarked_by_user', true) 
            .order('post_date', { ascending: false })
            .order('post_time', { ascending: false });

        if (error) {
            throw error;
        }

        res.status(200).json({
            status: "success",
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

// Get All Comments
app.get("/api/v1/allComments/:post_uuid/:user_uuid", async (req, res) => {
    const { post_uuid, user_uuid } = req.params;

    try {
        // Step 1: Get the list of blocked comment IDs for the given post_uuid and user_uuid
        const { data: blockedData, error: blockedError } = await supabase
            .from('blockedcomments')
            .select('blocked_comment_id')
            .eq('post_id', post_uuid)
            .eq('blocker_user_id', user_uuid)
            .eq('blocked', true);

        if (blockedError) {
            throw blockedError;
        }

        // Extract blocked comment IDs from the response
        const blockedCommentIds = blockedData.map(item => item.blocked_comment_id);

        // Step 2: Query comments and filter out those that are blocked
        const { data, error } = await supabase
            .from('comments')
            .select(`
                *,
                users:users (username)
            `)
            .eq('post_uuid', post_uuid)
            .not('comment_uuid', 'in', `(${blockedCommentIds.join(',')})`)
            .order('comment_date', { ascending: false })
            .order('comment_time', { ascending: false });

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


// Get User Config
app.get("/api/v1/getUserConfig/:user_uuid", async (req, res) => {
    console.log(req.params.user_uuid);
    try {
        const { data, error } = await supabase
            .from('configuration')
            .select('*')
            .eq('user_uuid', req.params.user_uuid);


        if (error) {
            throw error;
        }

        res.status(200).json({
            status: "success",
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

// Create Post
app.post("/api/v1/createPost/:user_uuid", async (req, res) => {
    console.log(req.body);
    try {
        const userUuid = req.params.user_uuid;

        const { data, error } = await supabase
            .from('posts')
            .insert([
                {
                    post_title: req.body.title,
                    post_body: req.body.body,
                    tags: req.body.tags,
                    user_uuid: req.params.user_uuid
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

// Searched Posts
app.get("/api/v1/searchedPosts/:query/:user_uuid", async (req, res) => {
    const query = req.params.query.toLowerCase(); // Convert query to lowercase for case-insensitive search
    const user_uuid = req.params.user_uuid;

    try {
        // Step 1: Get the list of blocked user IDs for the given user_uuid
        const { data: blockedUsersData, error: blockedUsersError } = await supabase
            .from('blockedusers')
            .select('blocked_user_id')
            .eq('blocker_user_id', user_uuid)
            .eq('blocked', true);

        if (blockedUsersError) {
            throw blockedUsersError;
        }

        // Extract blocked user IDs
        const blockedUserIds = blockedUsersData.map(item => item.blocked_user_id);

        // Step 2: Get the list of blocked post IDs for the given user_uuid
        const { data: blockedPostsData, error: blockedPostsError } = await supabase
            .from('blockedposts')
            .select('blocked_post_id')
            .eq('blocker_user_id', user_uuid)
            .eq('blocked', true);

        if (blockedPostsError) {
            throw blockedPostsError;
        }

        // Extract blocked post IDs
        const blockedPostIds = blockedPostsData.map(item => item.blocked_post_id);

        // Step 3: Query posts and filter out those from blocked users and blocked posts
        const { data, error } = await supabase
            .from('posts')
            .select(`
                *,
                users (username, user_flairs)
            `)
            .not('user_uuid', 'in', `(${blockedUserIds.join(',')})`)
            .not('post_uuid', 'in', `(${blockedPostIds.join(',')})`);

        if (error) {
            throw error;
        }

        // Filter posts based on the search query
        const filteredData = data.filter(post =>
            post.post_title.toLowerCase().includes(query) ||
            post.post_body.toLowerCase().includes(query) ||
            post.users.username.toLowerCase().includes(query) ||
            (post.users.user_flairs && post.users.user_flairs.toLowerCase().includes(query)) // Ensure user_flairs is not null
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

// Insert Configuration
app.post("/api/v1/insertConfig/:user_uuid", async (req, res) => {
    try {

        const { data, error } = await supabase
            .from('configuration')
            .insert([
                {
                    university: req.body.university,
                    major: req.body.major,
                    year_of_study: req.body.year_of_study,
                    interests: req.body.interests,
                    user_uuid: req.params.user_uuid,
                }
            ])
            .select('*');


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

// Delete Post
app.delete("/api/v1/deletePost/:post_uuid", async (req, res) => {
    const post_uuid = req.params.post_uuid;

    try {
        const { data, error } = await supabase
            .from('posts')
            .delete()
            .eq('post_uuid', post_uuid);

        if (error) {
            throw error;
        }

        if (data && data.length === 0) {
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

// Block Post
app.post("/api/v1/blockPost/:blocker_user_uuid/:blocked_post_uuid", async (req, res) => {
    try {

        const { data, error } = await supabase
            .from('blockedposts')
            .insert([
                {
                    blocker_user_id: req.params.blocker_user_uuid,
                    blocked_post_id: req.params.blocked_post_uuid
                }
            ])
            .select('*');


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

// Block User
app.post("/api/v1/blockUser/:blocker_user_uuid/:blocked_user_uuid", async (req, res) => {
    try {

        const { data, error } = await supabase
            .from('blockedusers')
            .insert([
                {
                    blocker_user_id: req.params.blocker_user_uuid,
                    blocked_user_id: req.params.blocked_user_uuid
                }
            ])
            .select('*');


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

// Block Comment
app.post("/api/v1/blockComment/:blocker_user_uuid/:post_uuid/:blocked_comment_uuid", async (req, res) => {
    try {

        const { data, error } = await supabase
            .from('blockedposts')
            .insert([
                {
                    blocked_comment_id: req.params.blocked_comment_uuid,
                    blocker_user_id: req.params.blocker_user_uuid,
                    post_id: req.params.post_uuid
                }
            ])
            .select('*');


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

// Delete Comment
app.delete("/api/v1/deleteComment/:comment_uuid", async (req, res) => {
    const comment_uuid = req.params.comment_uuid;

    try {
        const { data, error } = await supabase
            .from('comments')
            .delete()
            .eq('comment_uuid', comment_uuid);

        if (error) {
            throw error;
        }

        if (data && data.length === 0) {
            res.status(404).json({
                status: "error",
                message: "Comment not found or already deleted",
            });
            return;
        }

        res.status(200).json({
            status: "success",
            message: "Comment deleted successfully",
        });

    } catch (err) {
        console.error(err.message);
        res.status(500).json({
            status: "error",
            message: "Failed to delete comment",
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

