var platform = sessionStorage.getItem('choice');
var img = sessionStorage.getItem('img');

document.getElementById("page-title").innerHTML = platform;
document.getElementById("img-list").src = "." + img;

function textUnderscoreMin(text) {
    return text.replace(/ /g, '_').toLowerCase();
}

var csvPlatform = textUnderscoreMin(platform)

var row = document.getElementById("row");
var parentNoItems = document.getElementById("parent-no-items");

var xhttp = new XMLHttpRequest();
xhttp.onreadystatechange = readCSVFile;
xhttp.open("GET", '../assets/csv/items.csv')
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
        var j = 0;
        for (let i=1; i<array.length; i++) {
            if (array[i][0] == csvPlatform) {
                createNewCard(array[i])
                j++; 
            }
        }
        if (j == 0) {
            let noItems = document.createElement("h3");
            noItems.innerHTML = "Il n'y a pas d'éléments dans cette liste"
            noItems.className = "text-center pt-5"
            parentNoItems.appendChild(noItems);
            row.remove();
        }

    }  
};

function createNewCard(array) {
    let newCol = document.createElement("div");
    newCol.className = "col";

    let newCard = document.createElement("div");
    newCard.className = "card h-100";

    let newCardImg = document.createElement("img");
    newCardImg.src = array[4];
    newCardImg.className = "img-card-size mt-3 mb-3";
    newCardImg.alt = array[5];

    let newCardBody = document.createElement("div");
    newCardBody.className = "card-body";

    let newCardTitle = document.createElement("h5");
    newCardTitle.className = "card-title";
    newCardTitle.innerHTML = array[1];

    let newCardText = document.createElement("p");
    newCardText.innerHTML = array[2];

    newCardBody.appendChild(newCardTitle);
    newCardBody.appendChild(newCardText);

    newCard.appendChild(newCardImg);
    newCard.appendChild(newCardBody);

    newCol.appendChild(newCard);
    
    row.appendChild(newCol);
}