const { RateLimiterMongo } = require('rate-limiter-flexible');
const mongoose = require('mongoose');

const mongoOpts = {
    reconnectTries: Number.MAX_VALUE, // Never stop trying to reconnect
    reconnectInterval: 100, // Reconnect every 100ms
};

const dbAddress = 'mongodb+srv://p6_oc_api:AcpHEYykiYvWa7J@cluster0-2ugsc.mongodb.net/pekocko'

mongoose.connect(dbAddress)
    .catch((err) => { error });
const mongoConn = mongoose.createConnection(dbAddress, mongoOpts);

// Les options de configuration du limiter, ici on peut faire 50 tentatives de mot de passe par 24h
const opts = {
    storeClient: mongoConn,
    points: 50, // Nombre de tentatives de connexion
    duration: 60 * 60 * 24, // Temps total pour utiliser nos points de connexion
};

const rateLimiterMongo = new RateLimiterMongo(opts);

module.exports = (req, res, next) => {
    rateLimiterMongo.consume(req.ip, 1) // consume 1 point
        .then((rateLimiterRes) => {
            next();
        })
        .catch((rateLimiterRes) => {
            res.status(429).json({ error: `Too many requests ! You have to wait ${rateLimiterRes/1000} seconds to try again.` });
        });
}