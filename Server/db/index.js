
const { Pool } = require('pg');
 
const pool = new Pool({
    host: 'localhost',
    user: 'postgres',
    password: 'P0tat0123#blue',
    database: 'CampusConnect',
    port: '5433'
});

 
module.exports = {query: (text, params) => pool.query(text, params),
};

