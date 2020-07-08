const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const path = require('path')

const sauceRoutes = require('./routes/sauce')
const userRoutes = require('./routes/user');
const session = require('express-session');

const app = express();

// Connexion à la base de donnée mongoDB
mongoose.connect('mongodb+srv://p6_oc_api:AcpHEYykiYvWa7J@cluster0-2ugsc.mongodb.net/pekocko?retryWrites=true&w=majority', {
        useNewUrlParser: true,
        useUnifiedTopology: true
    })
    .then(() => console.log('Connexion à MongoDB réussie !'))
    .catch(() => console.log('Connexion à MongoDB échouée !'));

// Permet d'accéder à l'API depuis n'importe quelle origine
app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content, Accept, Content-Type, Authorization');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
    next();
});

// Utilisation des cookies en http-only
app.use(session({
    secret: 'OpenClassrooms P6',
    resave: false,
    saveUninitialized: true,
    cookie: {
        secure: true,
        httpOnly: true,
        domain: 'http://localhost:3000'
    }
}))

// Permet de parser les requêtes envoyées apr le client, on accède au body via 'req.body'
app.use(bodyParser.json());

// Permet de charger les images dans le dossier 'images'
app.use('/images', express.static(path.join(__dirname, 'images')));

// Préfix des routes par défaut pour les requêtes
app.use('/api/auth', userRoutes);
app.use('/api/sauces', sauceRoutes);

module.exports = app;