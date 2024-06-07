
const { Pool } = require('pg');
 
<<<<<<< HEAD
const pool = new Pool({
    host: 'localhost',
    user: 'postgres',
    password: 'P0tat0123#blue',
    database: 'CampusConnect',
    port: '5433'
});

=======
const pool = new Pool();
>>>>>>> be47cc69a08766f465fce3e21e12bc01f7cb55ca
 
module.exports = {query: (text, params) => pool.query(text, params),
};

