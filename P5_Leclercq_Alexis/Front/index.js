// Index des Teddy pour la page produits, affiche correctement les infos de chaque Teddy (img, description etc...)
const INDEX_TEDDY = window.location.search.substr(7);

// Stockage du résultat du fetch de l'API
var apiDatas;

// Pour éviter d'afficher plusieurs fois le formulaire dans le panier en cas de clic répété de l'utilisateur
let formIsNotOnPage = true;

// IIFE : à chaque chargement d'une page, exécute cette fonction une fois et 
// récupère les données de l'API puis appel une fonction propre à cette page
(function doFetch() {
    fetch("http://localhost:3000/api/teddies")
        .then(res => res.json())
        .then(data => {
            switch (window.location.pathname) {
                case '/Front/index.html':
                    loadTeddiesInfos(data);
                    break;
                case '/Front/produit.html':
                    apiDatas = data;
                    productInfos(data);
                    break;
                case '/Front/panier.html':
                    formEvent();
                    cart(data);
                    break;
                case '/Front/confirmation.html':
                    confirmPage();
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
 * @param {object} data - données de l'API
 * @param {number} index - utilisé pour obtenir les données à cet index dans l'API
 */
function getTeddyInfos(data, index) {
    let teddy = document.querySelector(`#teddy-${index}`);
    let teddyURL = data[index].imageUrl;
    teddy.innerHTML =
        `<img src="${teddyURL}" alt="teddy the bear" class="card-img-top">
                <div class="card-body">
                    <h5 class="card-title text-center">${data[index].name}</h5>
                    <p class="card-text text-justify">${data[index].description}</p>
                </div>`;
}

/**
 * Affiche les infos concernant le Teddy dont l'index est INDEX_TEDDY
 * @param {object} data - données de l'API
 */
function productInfos(data) {
    getTeddyInfos(data, INDEX_TEDDY);
    let teddy = document.querySelector(`#teddy-${INDEX_TEDDY}`);
    teddy.innerHTML += `<p class="card-text text-center font-weight-bold mx-3 bg-warning rounded"><u>Prix</u> : ${data[INDEX_TEDDY].price/100} €</p>`;
    let colors = document.querySelector('#colors');

    for (let i = 0; i < data[INDEX_TEDDY].colors.length; i++) {
        colors.innerHTML += `<option value="${data[INDEX_TEDDY].colors[i]}">${data[INDEX_TEDDY].colors[i]}</option>`;
    }
}

/**
 * Charge et affiche tous les produits sur la page d'accueil
 * @param {object} data - données de l'API
 */
function loadTeddiesInfos(data) {
    getTeddyInfos(data, 0);
    getTeddyInfos(data, 1);
    getTeddyInfos(data, 2);
    getTeddyInfos(data, 3);
    getTeddyInfos(data, 4);
}

/**
 * Création des données persistantes dans localStorage
 * pour récupération des données dans la page panier.html
 */
function addCart() {
    let teddy = apiDatas[INDEX_TEDDY];
    let confirmAddedToCart = document.querySelector('#addedToCart');

    if (localStorage.getItem('articles') === null) {

        localStorage.setItem('articles', teddy._id)
        localStorage.setItem('totalPrice', teddy.price / 100)
        localStorage.setItem('numberOfArticles', 1)
        confirmAddedToCart.innerHTML = `<p>Article ajouté à votre panier ✔️</p>`
    } else {
        let temp_articles = [];
        let newTotalPrice = Number(localStorage.getItem('totalPrice')) + Number(teddy.price / 100);
        let newNumberOfArticles = Number(localStorage.getItem('numberOfArticles')) + 1;

        temp_articles.push(localStorage.getItem('articles'), teddy._id);

        localStorage.setItem('articles', temp_articles);
        localStorage.setItem('totalPrice', newTotalPrice);
        localStorage.setItem('numberOfArticles', newNumberOfArticles);

        confirmAddedToCart.innerHTML = `<p>Article ajouté à votre panier ✔️</p>`
    }
}

/**
 * Appel de cette fonction lors du chargement de panier.html
 * Récupère toutes les données nécessaires à l'affichage du panier
 * de l'utilisateur via localStorage
 * @param {object} data - données de l'API
 */
async function cart(data) {
    let cart = document.querySelector('#cart');
    let subTotal = document.querySelector('#subTotal');
    let subTotal2 = document.querySelector('#subTotal2');

    if (localStorage.getItem('articles') === null) {
        document.querySelector('#price').hidden = true;
        cart.innerHTML = `<h4>Votre panier est vide pour le moment.</h4>
        <p>Votre panier est là pour vous servir. N'hésitez pas à parcourir notre sélection d'articles, bons achats sur Orinoco.</p>`;
    } else {
        let cartArray = localStorage.getItem('articles').split(',');
        let totalPrice = 0;
        let countArticles = 0;

        cartArray.forEach(async function(element, index, array) {
            try {
                const res = await fetch(`http://localhost:3000/api/teddies/${element.replace(/\"/g, '')}`);
                const data = await res.json();

                totalPrice += data.price / 100;
                countArticles++;

                cart.innerHTML += `
                    <div class="row">
                        <img src="${data.imageUrl}" alt="teddy the bear" class="col-11 col-md-3 img-thumbnail p-1 mb-3 mb-md-0 mx-auto">
                        <div class="col-10 col-md-7 mx-auto">
                            <h4>${data.name}</h4>
                            <p>${data.description}</p>
                        </div>
                        <div class="col-2">
                            <p class="position-relative float-right text-danger font-weight-bold">${data.price/100} €</p>
                        </div>
                    </div>
                    <hr>`;

                if (index === array.length - 1) {
                    subTotal.innerHTML = `
                        <div class="row">
                            <div class="col-11 col-lg-4 bg-light p-3 mx-auto border rounded">
                                <h5>Sous-total (${localStorage.getItem('numberOfArticles')} ${localStorage.getItem('numberOfArticles') > 1 ? 'articles' : 'article'}) : <strong class="text-danger">${localStorage.getItem('totalPrice')} €</strong></h5>
                                <button onclick="showForm()" class="col-12 btn btn-warning border-dark">Passer la commande</button>  
                            </div>
                        </div>`;

                    subTotal2.innerHTML += `
                        <div class="row">
                            <div class="col-12 d-flex justify-content-around">
                                <h5>Sous-total (${localStorage.getItem('numberOfArticles')} ${localStorage.getItem('numberOfArticles') > 1 ? 'articles' : 'article'}) : <strong class="text-danger">${localStorage.getItem('totalPrice')} €</strong></h5>
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
function formEvent() {
    form.addEventListener('submit', function(e) {
        e.preventDefault();

        let badFormat = document.getElementById('badFormat');
        let firstName = document.getElementById('firstName').value;
        let lastName = document.getElementById('lastName').value;
        let address = document.getElementById('address').value;
        let city = document.getElementById('city').value;
        let email = document.getElementById('email').value;

        let letters = /^[A-Za-z]+$/;
        if (!(firstName.match(letters) && lastName.match(letters) && city.match(letters))) {
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
                firstName: firstName,
                lastName: lastName,
                address: address,
                city: city,
                email: email
            }

            const products = localStorage.getItem('articles').split(',');

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
                    localStorage.setItem('orderInfos', JSON.stringify(myJsonObj));
                    window.location.href = "confirmation.html";
                })
                .catch(function(error) {
                    console.error("Erreur au niveau des données dans la requête order", error);
                })
        }
    })
}

/**
 * Fonction appelée au chargement de la page confirmation.html
 * Affichage de la confirmation de la commande, un récapitulatif de la commande
 * ainsi que l'affichage de l'id et du prix total
 */
function confirmPage() {
    let confirmPage = document.getElementById('confirm');
    let orderInfos = JSON.parse(localStorage.getItem('orderInfos'));
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
        <p><strong>Montant total de la commande</strong> (${localStorage.getItem('numberOfArticles')} ${localStorage.getItem('numberOfArticles') > 1 ? 'articles' : 'article'}) : <strong class="text-danger">${localStorage.getItem('totalPrice')} €</strong></p>
    </div>`;

    orderInfos.products.forEach(function(element, index, array) {
        confirmPage.innerHTML += `
            <div class="row">
                <img src="${element.imageUrl}" alt="teddy the bear" class="col-11 col-md-3 img-thumbnail p-1 mb-3 mb-md-0 mx-auto">
                <div class="col-10 col-md-7 mx-auto">
                    <h4>${element.name}</h4>
                    <p>${element.description}</p>
                </div>
                <div class="col-2">
                    <p class="position-relative float-right text-danger font-weight-bold">${element.price/100} €</p>
                </div>
            </div>
            <hr>`;

        if (index === array.length - 1) {
            confirmPage.innerHTML += `
            <p class="float-right"><strong>Montant total de la commande</strong> (${localStorage.getItem('numberOfArticles')} ${localStorage.getItem('numberOfArticles') > 1 ? 'articles' : 'article'}) : <strong class="text-danger">${localStorage.getItem('totalPrice')} €</strong></p>
            <p class="mt-5">Nous espérons vous revoir bientôt.</p>
            <h4>Orinoco</h4>`;
        }
    });

    // Suppression des éléments du localStorage ce qui vide le panier
    ['articles', 'orderInfos', 'numberOfArticles', 'totalPrice'].forEach(element => localStorage.removeItem(element));
}