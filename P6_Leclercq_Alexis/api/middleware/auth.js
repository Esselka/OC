const jwt = require('jsonwebtoken');

/**
 * Vérification du TOKEN de l'utilisateur, si le seveur reconnait que le TOKEN a bien été créé par lui et
 * que le userId correspond alors valide la requête de l'utilisateur
 */
module.exports = (req, res, next) => {
    try {
        const token = req.headers.authorization.split(' ')[1];
        const decodedToken = jwt.verify(token, 'Ht5l5Mpon1)=3GdXwSDgJdè-(ddkUWC)_OpenclassroomsProjet6_JHKJY88è-1J<88');
        const userId = decodedToken.userId;
        if (req.body.userId && req.body.userId !== userId) {
            throw ('UserID non valable !')
        } else {
            next();
        }
    } catch (error) {
        res.status(401).json({ error: error | 'Requête non authentifiée !' })
    }
};