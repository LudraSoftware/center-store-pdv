module.exports = {
    ensureAuthenticated: (req, res, next) => {
      if (req.isAuthenticated()) {
        return next();
      }
      req.flash('error', 'Você precisa estar logado para acessar esta página.');
      res.redirect('/login');
    },
    
    ensureAdmin: (req, res, next) => {
        if (req.isAuthenticated() && req.user.type === 'admin') {
          return next();
        }
        req.flash('error', 'Acesso negado! Apenas administradores podem acessar esta página.');
        res.redirect('/dashboard');
      }
  };
  