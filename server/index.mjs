// Imports
import express from 'express';
import morgan from 'morgan';
import cors from 'cors';
import { check, validationResult } from 'express-validator';

import assignmentDao from './compitiDao.mjs';
import userDao from './utentiDao.mjs';

// Init Express
const app = express();
const assignment_Dao = new assignmentDao();
const user_Dao = new userDao();

app.use(morgan('dev'));
app.use(express.json());

app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true
}));


import session from 'express-session';
import passport from 'passport';
import LocalStrategy from 'passport-local';

passport.use(new LocalStrategy(function verify(username, password, callback) {
    user_Dao.getUserByCredentials(username, password)
      .then(user => {
        if(!user)
          return callback(null, false, 'Incorrect username or password');
        return callback(null, user);
      })
      .catch(err => callback(err));
}));

passport.serializeUser((user, callback) => callback(null, user));
passport.deserializeUser((user, callback) => callback(null, user));

app.use(session({
  secret: "SuperSecretCompitiApp",
  resave: false,
  saveUninitialized: false,
}));
app.use(passport.authenticate('session'));


const isLoggedIn = (req, res, next) => {
  if (req.isAuthenticated()) return next();
  return res.status(401).json({ error: 'Non autorizzato' });
};


const errorFormatter = ({ msg }) => msg;
const onValidationErrors = (validationResult, res) => {
  const errors = validationResult.formatWith(errorFormatter);
  return res.status(422).json({ validationErrors: errors.mapped() });
};

// ROUTE: Login
app.post('/api/sessions', function (req, res, next) {
  passport.authenticate('local', (err, user, info) => {
    if (err) return next(err);
    if (!user) return res.status(401).json({ error: info });

    req.login(user, (err) => {
      if (err) return next(err);
      return res.json(req.user);
    });
  })(req, res, next);
});

// ROUTE: Logout
app.delete('/api/sessions/current', (req, res) => {
  req.logout(() => res.end());
});

// ROUTE: Verifica sessione
app.get('/api/sessions/current', (req, res) => {
  if (req.isAuthenticated()) return res.status(200).json(req.user);
  else return res.status(401).json({ error: 'Non autenticato' });
});

// ROUTE: Crea nuovo compito
app.post('/api/docenti/compiti', isLoggedIn, [
  check('domanda').isString().notEmpty(),
  check('idstudenti').isArray({ min: 2, max: 6 })
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return onValidationErrors(errors, res);
  if (req.user.Ruolo !== 'docente') return res.status(403).json({ error: 'Solo i docenti possono creare compiti' });

  try {
    await assignment_Dao.createAssignment(
      req.body.domanda,                
      req.user.UserId,                
      req.body.idstudenti              
    );
    res.status(201).end();
  } catch (err) {
    console.error('Errore creazione compito:', err.message);
    res.status(422).json({ error: err.message });
  }
});

// ROUTE: Compiti del docente
app.get('/api/docenti/studenti/:id/compiti', isLoggedIn, async (req, res) => {
  res.set('Cache-Control', 'no-store');
  try {
    const compiti = await assignment_Dao.getAssignmentsByTeacherAndStudent(req.user.UserId, req.params.id);
    res.json(compiti);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});



// ROUTE: Compiti aperti per studente
app.get('/api/studenti/compiti/aperti', isLoggedIn, async (req, res) => {
  res.set('Cache-Control', 'no-store'); 

  try {
    const compiti = await assignment_Dao.getOpenAssignmentsForStudent(req.user.UserId);
    res.json(compiti);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ROUTE: Compiti chiusi e valutati per studente
app.get('/api/studenti/compiti/valutati', isLoggedIn, async (req, res) => {
  res.set('Cache-Control', 'no-store');

  try {
    const compiti = await assignment_Dao.getValuetedAssignmentsForStudent(req.user.UserId);
    res.json(compiti);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ROUTE: Invia risposta
app.put('/api/studenti/compiti/:id/risposta', isLoggedIn, [
  check('risposta').isString().notEmpty()
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return onValidationErrors(errors, res);
  if (req.user.Ruolo !== 'studente') return res.status(403).json({ error: 'Solo gli studenti possono rispondere' });

  try {
    await assignment_Dao.updateAssignmentResponse(req.params.id, req.body.risposta);
    res.status(200).end();
  } catch (err) {
    res.status(503).json({ error: err.message });
  }
});

// ROUTE: Valuta compito
app.put('/api/docenti/compiti/:id/valutazione', isLoggedIn, [
  check('voto').isNumeric().isInt({ min: 0, max: 30 })
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return onValidationErrors(errors, res);
  if (req.user.Ruolo !== 'docente') return res.status(403).json({ error: 'Solo i docenti possono valutare' });

  try {
    await assignment_Dao.gradeAssignment(req.params.id, req.body.voto);
    res.status(200).end();
  } catch (err) {
    res.status(503).json({ error: err.message });
  }
});

// ROUTE: Ottieni un compito per id
app.get('/api/compiti/:id', isLoggedIn, async (req, res) => {
  try {
    const compito = await assignment_Dao.getCompitoById(req.params.id);
    if (compito.error)
      return res.status(404).json(compito);
    res.json(compito);
  } catch (err) {
    res.status(500).json({ error: 'Errore durante il recupero del compito' });
  }
});

// ROUTE: Ottieni tutti gli studenti
app.get('/api/docenti/studenti', isLoggedIn, async (req, res) => {
  if (req.user.Ruolo !== 'docente') return res.status(403).json({ error: 'Accesso negato' });
  try {
    res.set('Cache-Control', 'no-store');
    const studenti = await user_Dao.getAllStudents();
    res.json(studenti);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Avvio server
const PORT = 3001;
app.listen(PORT, () => console.log(`http://localhost:${PORT}/`));
