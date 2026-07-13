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
    newLink.onclick = function () { save(cat.name, cat.url); return false; }

    let newCard = document.createElement("div");
    newCard.className = "card h-100";

    let newImgWrap = document.createElement("div");
    newImgWrap.className = "card-img-wrap";

    let newCardImg = document.createElement("img");
    newCardImg.src = cat.url;
    newCardImg.alt = cat.alt;
    newImgWrap.appendChild(newCardImg);

    let newCardBody = document.createElement("div");
    newCardBody.className = "card-body";

    let newCardTitle = document.createElement("h5");
    newCardTitle.className = "card-title";
    newCardTitle.innerHTML = cat.name;

    newCardBody.appendChild(newCardTitle);
    newCard.appendChild(newImgWrap);
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