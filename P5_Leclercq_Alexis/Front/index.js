// Index des Teddy pour la page produits, affiche correctement les infos de chaque Teddy (img, description etc...)
const urlParams = new URLSearchParams(window.location.search);
const INDEX_TEDDY = urlParams.get('teddy');

// Création des constantes pour le localStorage
const ARTICLES = 'articles';
const ORDER_INFOS = 'orderInfos';
const NUMBER_OF_ARTICLES = 'numberOfArticles';
const TOTAL_PRICE = 'totalPrice';

// Stockage du résultat du fetch de l'API
var apiDatas;

// Pour éviter d'afficher plusieurs fois le formulaire dans le panier en cas de clic répété de l'utilisateur
var formIsNotOnPage = true;

// IIFE : à chaque chargement d'une page, exécute cette fonction une fois et 
// récupère les données de l'API puis appel une fonction propre à cette page
(function fetchAPIOneTime() {
    fetch("http://localhost:3000/api/teddies")
        .then(res => res.json())
        .then(data => {
            apiDatas = data;
            switch (window.location.pathname) {
                case '/Front/index.html':
                    getAllTeddies();
                    break;
                case '/Front/produit.html':
                    showProductInfos();
                    break;
                case '/Front/panier.html':
                    validateFormAndPostToAPI();
                    getCartDatas();
                    break;
                case '/Front/confirmation.html':
                    getConfirmPageInfos();
                    break;
                default:
                    console.error('Erreur : Page non trouvée');
                    break;
            }
        })
        .catch(error => console.error(error))
})()

/**
 * Récupération et affichage des données concernant un Teddy
 * @param {number} index - utilisé pour obtenir les données à cet index dans l'API
 */
function getTeddyInfos(index) {
    let articles = document.querySelector(`#articles`);

    if (window.location.pathname == '/Front/index.html') {
        articles.innerHTML += `
        <article class="col-12 col-lg-4 mx-auto">
            <div class="card mb-4 border-primary">
            <img src="${apiDatas[index].imageUrl}" alt="teddy the bear" class="card-img-top">
            <div class="card-body">
                <h5 class="card-title text-center">${apiDatas[index].name}</h5>
                <p class="card-text text-justify">${apiDatas[index].description}</p>
            </div>
                <a href="produit.html?teddy=${index}" class="btn btn-primary mx-auto mb-3">Plus d'infos</a>
            </div>
        </article>`;
    }

    if (window.location.pathname == '/Front/produit.html') {
        article.innerHTML = `
            <article class="card mb-4 border-primary">
                <img src="${apiDatas[index].imageUrl}" alt="teddy the bear" class="card-img-top">
                <div class="card-body text-center">
                    <h5 class="card-title text-center">${apiDatas[index].name}</h5>
                    <p class="card-text text-justify">${apiDatas[index].description}</p>
                    <div id="price"></div>
                    <button onclick="addToCart()" class="btn btn-warning mt-3 border-dark">Ajouter au panier</button>
                </div>
            </article>`;
    }

}

/**
 * Affiche les infos concernant le Teddy dont l'index est INDEX_TEDDY
 */
function showProductInfos() {
    getTeddyInfos(INDEX_TEDDY);
    let article = document.querySelector(`#price`);
    price.innerHTML += `<p class="card-text text-center font-weight-bold mx-3"><u>Prix</u> : ${apiDatas[INDEX_TEDDY].price/100} €</p>`;
    let colors = document.querySelector('#colors');

    for (let i = 0; i < apiDatas[INDEX_TEDDY].colors.length; i++) {
        colors.innerHTML += `<option value="${apiDatas[INDEX_TEDDY].colors[i]}">${apiDatas[INDEX_TEDDY].colors[i]}</option>`;
    }
}

/**
 * Charge et affiche tous les produits sur la page d'accueil
 */
function getAllTeddies() {
    for (index in apiDatas) {
        getTeddyInfos(index);
    }
}

/**
 * Création des données persistantes dans localStorage
 * pour récupération des données dans la page panier.html
 */
function addToCart() {
    let teddy = apiDatas[INDEX_TEDDY];
    let confirmAddedToCart = document.querySelector('#addedToCart');

    if (localStorage.getItem(ARTICLES) === null) {

        localStorage.setItem(ARTICLES, teddy._id)
        localStorage.setItem(TOTAL_PRICE, teddy.price / 100)
        localStorage.setItem(NUMBER_OF_ARTICLES, 1)
        confirmAddedToCart.innerHTML = `<p>Article ajouté à votre panier ✔️</p>`
    } else {
        let temp_articles = [];
        let newTotalPrice = Number(localStorage.getItem(TOTAL_PRICE)) + Number(teddy.price / 100);
        let newNumberOfArticles = Number(localStorage.getItem(NUMBER_OF_ARTICLES)) + 1;

        temp_articles.push(localStorage.getItem(ARTICLES), teddy._id);

        localStorage.setItem(ARTICLES, temp_articles);
        localStorage.setItem(TOTAL_PRICE, newTotalPrice);
        localStorage.setItem(NUMBER_OF_ARTICLES, newNumberOfArticles);

        confirmAddedToCart.innerHTML = `<p>Article ajouté à votre panier ✔️</p>`
    }
}

/**
 * Récupère toutes les données nécessaires à l'affichage du panier
 * de l'utilisateur via localStorage
 */
async function getCartDatas() {
    let cart = document.querySelector('#cart');
    let subTotal = document.querySelector('#subTotal');
    let subTotal2 = document.querySelector('#subTotal2');

    if (localStorage.getItem(ARTICLES) === null) {
        document.querySelector('#price').hidden = true;
        cart.innerHTML = `<h4>Votre panier est vide pour le moment.</h4>
        <p>Votre panier est là pour vous servir. N'hésitez pas à parcourir notre sélection d'articles, bons achats sur Orinoco.</p>`;
    } else {
        let cartArray = localStorage.getItem(ARTICLES).split(',');

        cartArray.forEach(async function(element, index, array) {
            try {
                const res = await fetch(`http://localhost:3000/api/teddies/${element.replace(/\"/g, '')}`);
                const data = await res.json();

                cart.innerHTML += `
                    <article class="row">
                        <img src="${data.imageUrl}" alt="teddy the bear" class="col-11 col-md-3 img-thumbnail p-1 mb-3 mb-md-0 mx-auto">
                        <div class="col-10 col-md-7 mx-auto">
                            <h4>${data.name}</h4>
                            <p>${data.description}</p>
                        </div>
                        <div class="col-2">
                            <p class="position-relative float-right text-danger font-weight-bold">${data.price/100} €</p>
                        </div>
                    </article>
                    <hr>`;

                if (index === array.length - 1) {
                    subTotal.innerHTML = `
                        <div class="row">
                            <div class="col-11 col-lg-4 bg-light p-3 mx-auto border rounded">
                                <h5>Sous-total (${localStorage.getItem(NUMBER_OF_ARTICLES)} ${localStorage.getItem(NUMBER_OF_ARTICLES) > 1 ? 'articles' : 'article'}) : <strong class="text-danger">${localStorage.getItem(TOTAL_PRICE)} €</strong></h5>
                                <button onclick="showForm()" class="col-12 btn btn-warning border-dark">Passer la commande</button>  
                            </div>
                        </div>`;

                    subTotal2.innerHTML += `
                        <div class="row">
                            <div class="col-12 d-flex justify-content-around">
                                <h5>Sous-total (${localStorage.getItem(NUMBER_OF_ARTICLES)} ${localStorage.getItem(NUMBER_OF_ARTICLES) > 1 ? 'articles' : 'article'}) : <strong class="text-danger">${localStorage.getItem(TOTAL_PRICE)} €</strong></h5>
                                <button onclick="showForm()" class="btn btn-warning border-dark">Passer la commande</button>  
                            </div>
                        </div>`;
                }
            } catch (error) {
                console.error(error);
            }
        });
    }
}

/**
 * Permet d'éviter que plusieurs formulaires 
 * soient visibles sur la page du panier
 */
function showForm() {
    if (formIsNotOnPage) {
        let form = document.getElementById('form');
        form.hidden = false;
        form.scrollIntoView();
    }
}

/**
 * Vérification si les données du formulaire sont correctes.
 * Envoi des données à l'API et sauvegarde de la réponse dans le localStorage
 * pour utilisation dans la page de confirmation de commande.
 */
function validateFormAndPostToAPI() {
    form.addEventListener('submit', function(e) {
        e.preventDefault();

        let badFormat = document.getElementById('badFormat');
        let firstName = document.getElementById('firstName');
        let lastName = document.getElementById('lastName');
        let address = document.getElementById('address');
        let city = document.getElementById('city');
        let email = document.getElementById('email');

        let letters = /^[A-Za-z]+$/;
        if (!(firstName.value.match(letters) && lastName.value.match(letters) && city.value.match(letters))) {
            // La bordure devient rouge pour les input où l'utilisateur n'a pas utilisé que des lettres
            firstName.classList.remove("border-danger");
            lastName.classList.remove("border-danger");
            city.classList.remove("border-danger");

            if (!firstName.value.match(letters)) {
                firstName.classList.add("border-danger");
            }
            if (!lastName.value.match(letters)) {
                lastName.classList.add("border-danger");
            }
            if (!city.value.match(letters)) {
                city.classList.add("border-danger");
            }
            // Affichage d'une alerte expliquant comment remplir le formulaire correctement
            badFormat.innerHTML = `
            <div class="alert alert-danger alert-dismissible fade show" role="alert">
                <strong>Oups, une petite erreur!</strong> Les champs 'Prénom', 'Nom' et 'Ville' n'accèptent que les lettres.<br>
                Veuillez effectuer les modifications et appuyer de nouveau sur le bouton <strong>Acheter</strong>.
                <button type="button" class="close" data-dismiss="alert" aria-label="Close">
                    <span aria-hidden="true">&times;</span>
                </button>
            </div>`;
        } else {
            const contact = {
                firstName: firstName.value,
                lastName: lastName.value,
                address: address.value,
                city: city.value,
                email: email.value
            }

            const products = localStorage.getItem(ARTICLES).split(',');

            const myOrder = { contact, products }

            fetch('http://localhost:3000/api/teddies/order', {
                    method: 'post',
                    headers: {
                        'Content-Type': 'application/json;charset=utf-8'
                    },
                    body: JSON.stringify(myOrder)
                })
                .then(function(response) {
                    return response.json();
                })
                .then(function(myJsonObj) {
                    localStorage.setItem(ORDER_INFOS, JSON.stringify(myJsonObj));
                    window.location.href = "confirmation.html";
                })
                .catch(function(error) {
                    console.error("Erreur au niveau des données dans la requête order", error);
                })
        }
    })
}

/**
 * Affichage de la confirmation de la commande, un récapitulatif de la commande
 * ainsi que l'affichage de l'id et du prix total
 */
function getConfirmPageInfos() {
    let confirmPage = document.getElementById('confirm');
    let orderInfos = JSON.parse(localStorage.getItem(ORDER_INFOS));
    document.getElementById('commandId').innerHTML = orderInfos.orderId;


    confirmPage.innerHTML = `
    <div>
        <h4 class="text-warning">Bonjour,</h4>
        Nous vous remercions de votre commande sur Orinoco. Nous vous tiendrons informés par e-mail lorsque les articles de votre commande auront été expédiés.
    </div>
    <div class="col-12 col-md-7 col-lg-6 text-center mx-auto bg-light border p-3 mt-3">
        <p>Votre commande sera expédiée à :</p>
        <strong>${orderInfos.contact.firstName} ${orderInfos.contact.lastName}</strong><br>
        <strong>${orderInfos.contact.address}</strong><br>
        <strong>${orderInfos.contact.city}</strong><br>
    </div>
    <h5 class="text-warning mt-5 mb-0 pb-0">Détails de la commande</h5>
    <hr class="mt-0 pt-0">
    <div class="d-lg-flex justify-content-between mb-5">
        <p>Commande n° <span class="text-primary">${orderInfos.orderId}</span></p>
        <p><strong>Montant total de la commande</strong> (${localStorage.getItem(NUMBER_OF_ARTICLES)} ${localStorage.getItem(NUMBER_OF_ARTICLES) > 1 ? 'articles' : 'article'}) : <strong class="text-danger">${localStorage.getItem(TOTAL_PRICE)} €</strong></p>
    </div>`;

    orderInfos.products.forEach(function(element, index, array) {
        confirmPage.innerHTML += `
            <article class="row">
                <img src="${element.imageUrl}" alt="teddy the bear" class="col-11 col-md-3 img-thumbnail p-1 mb-3 mb-md-0 mx-auto">
                <div class="col-10 col-md-7 mx-auto">
                    <h4>${element.name}</h4>
                    <p>${element.description}</p>
                </div>
                <div class="col-2">
                    <p class="position-relative float-right text-danger font-weight-bold">${element.price/100} €</p>
                </div>
            </article>
            <hr>`;

        if (index === array.length - 1) {
            confirmPage.innerHTML += `
            <p class="float-right"><strong>Montant total de la commande</strong> (${localStorage.getItem(NUMBER_OF_ARTICLES)} ${localStorage.getItem(NUMBER_OF_ARTICLES) > 1 ? 'articles' : 'article'}) : <strong class="text-danger">${localStorage.getItem(TOTAL_PRICE)} €</strong></p>
            <p class="mt-5">Nous espérons vous revoir bientôt.</p>
            <h4>Orinoco</h4>`;
        }
    });

    // Suppression des éléments du localStorage ce qui vide le panier
    [ARTICLES, ORDER_INFOS, NUMBER_OF_ARTICLES, TOTAL_PRICE].forEach(element => localStorage.removeItem(element));
}