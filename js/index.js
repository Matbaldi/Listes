var row = document.getElementById("row");

var xhttp = new XMLHttpRequest();
xhttp.onreadystatechange = readCSVFile;
xhttp.open("GET", './assets/csv/categories.csv')
xhttp.send();

function readCSVFile() {
    if (this.readyState == 4 && this.status == 200) {
        var file = this.response
        // Supprimer tous les caractères "\r" du contenu
        const contenuSansCR = file.replace(/\r/g, '');

        // Diviser le contenu en lignes
        const lignes = contenuSansCR.split('\n');

        // Initialiser le tableau pour stocker les données
        const tableauCSV = lignes.map(ligne => ligne.split(','));
        array = tableauCSV;
        for (let i=1; i<array.length; i++) {
            createNewCard(array[i])
        }

    }  
};

function createNewCard(array) {
    let newCol = document.createElement("div");
    newCol.className = "col";

    let newLink = document.createElement("a");
    newLink.href = "#";
    newLink.className = "link-card";
    newLink.onclick = function() {save(array[1], array[3]); return false;}

    let newCard = document.createElement("div");
    newCard.className = "card h-100";

    let newCardImg = document.createElement("img");
    newCardImg.src = array[3];
    newCardImg.className = "img-card-size mt-3 mb-3";
    newCardImg.alt = array[2];

    let newCardBody = document.createElement("div");
    newCardBody.className = "card-body";

    let newCardTitle = document.createElement("h5");
    newCardTitle.className = "card-title";
    newCardTitle.innerHTML = array[1];

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