const express = require('express');
const { createClient } =  require('@supabase/supabase-js');
const bodyparser = require('body-parser');


const app = express();
const supabase = createClient('https://ixcwmtjytstmzyanpqro.supabase.co',
'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Iml4Y3dtdGp5dHN0bXp5YW5wcXJvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MTc1MzU2MjAsImV4cCI6MjAzMzExMTYyMH0.XCJzoWA5nJX95NRykhi6BDs771H0x-TAp6zVk_jeeRY')
app.get("/", (req, res) => {
    res.send("<h1>HomePage</h1>")
})


app.use(bodyparser.json());

app.post('/accountcreation', async (req, res) => {
    const { Username, Email, Date_Of_Birth, Password } = req.body;
    const { error } = await supabase.from('users')
                             .insert({ username: Username, 
                                       email: Email,  
                                       date_of_birth: Date_Of_Birth,
                                       password_hash: Password
                                    })

    if (error) {
        res.status(500).send(`Error creating user: ${error.message}`);
    } else {
        res.status(201).send(`User added`);
    }

})


app.listen(5001, () => {
    console.log("Server started on Port 5001");
})