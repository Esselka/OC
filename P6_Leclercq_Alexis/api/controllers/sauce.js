const Sauce = require('../models/sauce');
const fs = require('fs');

exports.createSauce = (req, res, next) => {
    const sauceObject = JSON.parse(req.body.sauce);
    delete sauceObject._id;
    const sauce = new Sauce({
        ...sauceObject,
        imageUrl: `${req.protocol}://${req.get('host')}/images/${req.file.filename}`,
        likes: 0,
        dislikes: 0,
        usersLiked: [],
        usersDisliked: []
    });
    sauce.save()
        .then(() => res.status(201).json({ message: 'Sauce enregistrée !' }))
        .catch(error => res.status(400).json({ error }));
};

exports.getOneSauce = (req, res, next) => {
    Sauce.findOne({ _id: req.params.id })
        .then(sauce => res.status(200).json(sauce))
        .catch(error => res.status(404).json({ error: 'Sauce introuvable !' }));
}

/**
 * On crée un objet sauceObject qui regarde si req.file existe ou non. 
 * S'il existe, on traite la nouvelle image ; s'il n'existe pas, on traite simplement l'objet entrant. 
 * On crée ensuite une instance Sauce à partir de sauceObject , puis on effectue la modification.
 */
exports.modifySauce = (req, res, next) => {
    const sauceObject = req.file ? {
        ...JSON.parse(req.body.sauce),
        imageUrl: `${req.protocol}://${req.get('host')}/images/${req.file.filename}`
    } : {...req.body };

    Sauce.updateOne({ _id: req.params.id }, {...sauceObject, _id: req.params.id })
        .then(() => res.status(200).json({ message: 'Objet modifié !' }))
        .catch(error => res.status(400).json({ error }));
}

exports.deleteSauce = (req, res, next) => {
    Sauce.findOne({ _id: req.params.id })
        .then(sauce => {
            const filename = sauce.imageUrl.split('/images/')[1];
            fs.unlink(`images/${filename}`, () => {
                Sauce.deleteOne({ _id: req.params.id })
                    .then(() => res.status(200).json({ message: 'Sauce supprimée !' }))
                    .catch(error => res.status(400).json({ error }));
            })
        })
        .catch(error => res.status(500).json({ error }));
}

exports.getAllSauces = (req, res, next) => {
    Sauce.find()
        .then(sauces => res.status(200).json(sauces))
        .catch(error => res.status(400).json({ error }));
}

exports.likeSauces = (req, res, next) => {
    const bodyObj = req.body;
    Sauce.findOne({ _id: req.params.id })
        .then(sauce => {
            switch (bodyObj.like) {
                case 1:
                    sauce.likes++;
                    if (!sauce.usersLiked.includes(bodyObj.userId)) {
                        sauce.usersLiked.push(bodyObj.userId);
                    }
                    if (sauce.usersDisliked.includes(bodyObj.userId)) {
                        sauce.usersDisliked = sauce.usersDisliked.filter(item => item != bodyObj.userId);
                    }
                    sauce.save();
                    break;
                case 0:
                    if (sauce.usersLiked.includes(bodyObj.userId)) {
                        sauce.likes--;
                        sauce.usersLiked = sauce.usersLiked.filter(item => item != bodyObj.userId);
                    }
                    if (sauce.usersDisliked.includes(bodyObj.userId)) {
                        sauce.dislikes--;
                        sauce.usersDisliked = sauce.usersDisliked.filter(item => item != bodyObj.userId);
                    }
                    sauce.save()
                    break;
                case -1:
                    sauce.dislikes++;
                    if (sauce.usersLiked.includes(bodyObj.userId)) {
                        sauce.usersLiked = sauce.usersLiked.filter(item => item != bodyObj.userId);
                    }
                    if (!sauce.usersDisliked.includes(bodyObj.userId)) {
                        sauce.usersDisliked.push(bodyObj.userId);
                    }
                    sauce.save();
                    break;

                default:
                    res.status(400).json({ error: 'Valeur de like incorrect, ne peut être que -1, 0 ou 1 !' })
                    break;
            }
        })
        .then(res.status(200).json({ message: 'Choix like effectué !' }))
        .catch(error => res.status(404).json({ error: 'Sauce introuvable !' }));
}