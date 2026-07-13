var row = document.getElementById("row");

fetch('/api/categories')
    .then(res => res.json())
    .then(categories => {
        categories.forEach(cat => createNewCard(cat));
    })
    .catch(err => console.error('Erreur de chargement des catégories :', err));

function createNewCard(cat) {
    let newCol = document.createElement("div");
    newCol.className = "col";

    let newLink = document.createElement("a");
    newLink.href = "#";
    newLink.className = "link-card";
    newLink.onclick = function() { save(cat.name, cat.url); return false; }

    let newCard = document.createElement("div");
    newCard.className = "card h-100";

    let newCardImg = document.createElement("img");
    newCardImg.src = cat.url;
    newCardImg.className = "img-card-size img-card-size--logo mt-3 mb-3";
    newCardImg.alt = cat.alt;

    let newCardBody = document.createElement("div");
    newCardBody.className = "card-body";

    let newCardTitle = document.createElement("h5");
    newCardTitle.className = "card-title";
    newCardTitle.innerHTML = cat.name;

    newCardBody.appendChild(newCardTitle);
    newCard.appendChild(newCardImg);
    newCard.appendChild(newCardBody);
    newLink.appendChild(newCard);
    newCol.appendChild(newLink);
    row.appendChild(newCol);
}

function save(name, img) {
    sessionStorage.setItem('choice', name);
    sessionStorage.setItem('img', img);
    location.href = "./html/list_page.html";
}