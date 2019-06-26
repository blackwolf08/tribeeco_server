// const { Pool } = require('pg')

// const pool = new Pool()

// module.exports = {
//   query: (text, params, callback) => {
//     return pool.query(text, params, callback)
//   }
// }

const Sequelize = require('sequelize');
const sequelize = new Sequelize('name_it', 'root', '123', {
  host: 'localhost',
  dialect: 'postgres',
  operatorsAliases: false,
  logging: false,

  pool: {
    max: 5,
    min: 0,
    acquire: 30000,
    idle: 10000
  }
});
sequelize
  .authenticate()
  .then(() => {
    console.log('Connection has been established successfully.');
  })
  .catch(err => {
    console.error('Unable to connect to the database:', err);
});