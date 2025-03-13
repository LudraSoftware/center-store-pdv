require('dotenv').config();
const express = require('express');
const session = require('express-session');
const flash = require('express-flash');
const passport = require('./config/passport');
const db = require('./models');

const app = express();

// Configuração do EJS
app.set('view engine', 'ejs');
app.use(express.static('public'));

// Middlewares
app.use(express.urlencoded({ extended: false }));
app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false
}));
app.use(flash());
app.use(passport.initialize());
app.use(passport.session());

// Rotas
app.use('/', require('./routes/authRoutes'));
app.use('/suppliers', require('./routes/suppliersRoutes'));
app.use('/', require('./routes/productsRoutes'));
app.use('/', require('./routes/customerRoutes'));

// Iniciar servidor
db.sequelize.sync().then(() => {
  app.listen(3000, () => console.log('🔥 Servidor rodando em http://localhost:3000'));
});
