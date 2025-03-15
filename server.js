require('dotenv').config();
const express = require('express');
const session = require('express-session');
const flash = require('express-flash');
const passport = require('./config/passport');
const db = require('./models');

const app = express();

const expressLayouts = require('express-ejs-layouts');

// Configuração do EJS
app.set('view engine', 'ejs');
app.use(express.static('public'));
app.use(expressLayouts);
app.set('layout', 'main');

app.use((req, res, next) => {
  res.locals.company = {
      name: process.env.EMPLOYMENT_NAME,
      email: process.env.EMPLOYMENT_EMAIL,
      logoVertical: process.env.EMPLOYMENT_LOGO_V,
      logoHorizontal: process.env.EMPLOYMENT_LOGO_H,
      address: {
          street: process.env.EMPLOYMENT_ADDRESS_STREET,
          number: process.env.EMPLOYMENT_ADDRESS_NUMBER,
          city: process.env.EMPLOYMENT_ADDRESS_CITY,
          neighborhood: process.env.EMPLOYMENT_ADDRESS_NEIGHBORHOOD,
          state: process.env.EMPLOYMENT_ADDRESS_STATE,
          country: process.env.EMPLOYMENT_ADDRESS_COUNTRY
      }
  };
  next();
});

// Middlewares
app.use(express.json()); // ✅ Permite receber JSON no req.body
app.use(express.urlencoded({ extended: true })); // ✅ Permite receber dados de formulários
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
app.use('/dashboard', require('./routes/dashboardRoutes'));
app.use('/suppliers', require('./routes/suppliersRoutes'));
app.use('/products', require('./routes/productsRoutes'));
app.use('/customers', require('./routes/customerRoutes'));
app.use('/sales', require('./routes/salesRoutes'));
app.use('/invoices', require('./routes/invoiceRoutes'));

// Iniciar servidor
db.sequelize.sync().then(() => {
  app.listen(3000, () => console.log('🔥 Servidor rodando em http://localhost:3000'));
});
