var platform = sessionStorage.getItem('choice');
var img = sessionStorage.getItem('img');

document.getElementById("page-title").innerHTML = platform;
var imgList = document.getElementById("img-list");
imgList.src = "." + img;
imgList.classList.add("hero-img");

function textUnderscoreMin(text) {
    return text.replace(/ /g, '_').toLowerCase();
}

var csvPlatform = textUnderscoreMin(platform);

var row = document.getElementById("row");
var parentNoItems = document.getElementById("parent-no-items");

fetch('/api/items?platform=' + encodeURIComponent(csvPlatform))
    .then(res => res.json())
    .then(items => {
        items.forEach(item => createNewCard(item));
        if (items.length === 0) {
            let noItems = document.createElement("h3");
            noItems.innerHTML = "Il n'y a pas d'éléments dans cette liste";
            noItems.className = "text-center pt-5";
            parentNoItems.appendChild(noItems);
            row.remove();
        }
    })
    .catch(err => console.error('Erreur de chargement des articles :', err));

function createNewCard(item) {
    let newCol = document.createElement("div");
    newCol.className = "col";

    let newCard = document.createElement("div");
    newCard.className = "card h-100";

    let newCardImg = document.createElement("img");
    newCardImg.src = item.url;
    newCardImg.className = "img-card-size mt-3 mb-3";
    newCardImg.alt = item.alt;

    let newCardBody = document.createElement("div");
    newCardBody.className = "card-body";

    let newCardTitle = document.createElement("h5");
    newCardTitle.className = "card-title";
    newCardTitle.innerHTML = item.name;

    let newCardText = document.createElement("p");
    newCardText.innerHTML = item.price;

    let newCardDate = null;
    if (item.date) {
        newCardDate = document.createElement("p");
        newCardDate.innerHTML = "Sortie le " + item.date;
    }

    newCardBody.appendChild(newCardTitle);
    newCardBody.appendChild(newCardText);
    if (item.date) {
        newCardBody.appendChild(newCardDate);
    }
    newCard.appendChild(newCardImg);
    newCard.appendChild(newCardBody);
    newCol.appendChild(newCard);
    row.appendChild(newCol);
}