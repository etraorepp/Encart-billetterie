# Projet Cmpp Billetterie

Ce projet consiste à créer un web component personnalisé qui affiche une card redirigeant vers la billetterie, et qui sera intégrée dans les pages découvertes lorsqu'un concert ou un événement en lien avec cette page est prévu.

## Structure du projet

### 1. Template.html
Ce fichier définit le modèle HTML et les styles CSS du component. 

Il contient :
- La structure en deux versions : Desktop et Mobile.
- Les styles CSS du component.

### 2. Script.js
Ce fichier gère la logique du web component :
- Création d'un **Shadow DOM** pour encapsuler le component.
- Récupération des attributs HTML dynamiques (image, titre, date, description, etc.) grace à l'API Euterpe.
- Mise à jour du component en fonction des données fournies.
- Gestion du système d'ouverture/fermeture du contenu en version mobile.
- Repositionnement de la card selon la taille de l'écran

### 3. Encart-billetterie.html
Ce code sera intégré dans un encart afin d'afficher une card avec un lien vers la billetterie.

On utilise le component ```<cmpp-billetterie>``` avec les attributs requis.

## Explication du Script.js

### 1. Constructeur
- Attache un Shadow DOM pour encapsuler le component
```js
constructor() {
    super();
    this.attachShadow({ mode: 'open' });
}
```

### 2. ConnectedCallback()
- Récupère et clone le contenu du template ```<template id="cmpp-billetterie-template">``` et l'ajoute au shadow dom
- Ajoute un chargement des données via un idEuterpe
```js
connectedCallback() {
    // Evite la multiplication des cards au chargement de la page
    this.shadowRoot.innerHTML = '';

    const template = document.getElementById('cmpp-billetterie-template');
    this.shadowRoot.appendChild(template.content.cloneNode(true));

    // Récupère l'id Euterpe et charge les données
    const ideuterpe = this.getAttribute('ideuterpe');
    this.loadData(ideuterpe);
}
```

### 3. loadData(ideuterpe)
- Récupère les données avec l'Id Euterpe depuis l'API Deneb et met à jour les attributs
- 
```js
async loadData(ideuterpe) {
    try {
        const denebUrl = `https://otoplayer.philharmoniedeparis.fr/fr/Event/${ideuterpe}`;
        const response = await fetch(denebUrl);
        if (!response.ok) {
            throw new Error("Erreur récupération des données");
        }

        const eventData = await response.json();

        const attributes = {
            imageUrl: eventData.image.uri,
            date: new Date(eventData.date).toLocaleDateString('fr-FR', {day: 'numeric', month: 'short'}),
            heure: new Date(eventData.date).toLocaleTimeString('fr-FR', {hour: '2-digit', minute: '2-digit'}).replace(':', 'h'),
            tag: eventData.activity,
            titre: eventData.title,
            dateComplete: new Date(eventData.date).toLocaleDateString('fr-FR', {weekday: 'long', day: 'numeric', month: 'long', year: 'numeric'}) + ' — ' + new Date(eventData.date).toLocaleTimeString('fr-FR', {hour: '2-digit', minute: '2-digit'}).replace(':', 'h'), 
            description: eventData.chapo,
            reservationUrl: `https://philharmoniedeparis.fr/fr/activite/${ideuterpe}` 
        };

        // ...

        this.setupEventListeners();

    } catch (error) {
        console.error("Erreur chargement des données:", error);
    }
}
```

### 4. Mise à jour des vues
- Applique les bonnes informations (image, date, titre, description...) aux versions desktop et mobile
```js
// Mise à jour des deux vues
['desktop-view', 'mobile-view'].forEach(viewClass => {
    this.updateView(viewClass, attributes);
});
```

### 5. updateView()
- Selectionne la vue desktop ou mobile
```js
const view = this.shadowRoot.querySelector(`.${viewClass}`);
```

- Associe chaque classe à son attribut
```js
const selectors = {
    '.card-image': { attr: 'src', value: attrs.imageUrl },
    '.date-badge .date': { attr: 'textContent', value: attrs.date },
    '.date-badge p:last-child': { attr: 'textContent', value: attrs.heure },
    '.tag': { attr: 'textContent', value: attrs.tag },
    '.title': { attr: 'textContent', value: attrs.titre },
    '.content .date': { attr: 'textContent', value: attrs.dateComplete },
    '.description': { attr: 'textContent', value: attrs.description },
    '.reservation-btn': { 
        attr: 'onclick', 
        value: () => window.location.href = attrs.reservationUrl 
    }
};
```

- Va permettre de mettre à jour les éléments grâce aux données des attributs
```js
Object.entries(selectors).forEach(([selector, {attr, value}]) => {
    const element = view.querySelector(selector);
    if (element) {
        element[attr] = value;
    }
});
```

### 6. setupEventListeners()
- Fonction qui va gérer le déroulement du contenu caché lorsque je vais cliquer sur la card en version mobile
- Ajout d'un setTimeout pour attendre que tout le DOM soit bien chargé avant d'appliquer la fonction
- Ajout de l'attribut ```dataset.listenerAttached``` pour empêcher les multiples ajouts d'événements
```js
setupEventListeners() {
    // setTimeout assure que le DOM est prêt
    setTimeout(() => {
        const badgeWrapper = this.shadowRoot.querySelector('.mobile-view .badge-wrapper');
        const contentMobile = this.shadowRoot.querySelector('.content-mobile');

        if (!badgeWrapper.dataset.listenerAttached) {
            badgeWrapper.addEventListener('click', () => {
                contentMobile.classList.toggle('active');
                badgeWrapper.classList.toggle('active');
            });

            badgeWrapper.dataset.listenerAttached = "true";
        }
    }, 500);
}
```

### 7. Enregistrement du component
- Enregistre l'élément ```<cmpp-billetterie>``` qui est lié à la classe CmppBilletterie 
```js
// web component
customElements.define('cmpp-billetterie', CmppBilletterie);
```

### 8. setupRenvoiBilletterie()
- Créer l'élément ```<div class="renvoi-billetterie col-md-3">``` si il n'existe pas
```js
function setupRenvoiBilletterie() {
    let renvoiBilletterie = document.querySelector('.renvoi-billetterie');

    if (!renvoiBilletterie) {
        renvoiBilletterie = document.createElement('div');
        renvoiBilletterie.classList.add('renvoi-billetterie', 'col-md-3'); 
        document.body.prepend(renvoiBilletterie);
    }

    // ...
}
```

- Ajoute le web component dans la div créée
```js
let cmppBilletterie = document.querySelector('cmpp-billetterie');
if (!cmppBilletterie) {
    cmppBilletterie = document.createElement('cmpp-billetterie');
    renvoiBilletterie.appendChild(cmppBilletterie);
} else if (!renvoiBilletterie.contains(cmppBilletterie)) {
    renvoiBilletterie.appendChild(cmppBilletterie);
}
```

- Appelle la fonction pour repositionner la div au bon endroit
```js
posRenvoiBilletterie();
```

### 9. posRenvoiBilletterie()
- Positionne la div .renvoi-billetterie en fonction de la taille de l'écran (avant zone-5 en mode desktop et avant zone-4 en mode mobile)
```js
function posRenvoiBilletterie() {
    const renvoiBilletterie = document.querySelector('.renvoi-billetterie');
    if (!renvoiBilletterie) return;

    const zone5 = document.getElementById('zone-5');
    const zone4 = document.getElementById('zone-4');

    if (!zone5 || !zone4) return;

    // Positionnement selon la taille de l'écran
    const positionElement = window.innerWidth > 992 ? zone5 : zone4;

    positionElement.parentNode.insertBefore(renvoiBilletterie, positionElement);
}
```

### 10. EventListener au chargement et redimensionnement
- Execute setupRenvoiBilletterie() au chargement et posRenvoiBilletterie() au redimensionnement
```js
window.addEventListener('load', setupRenvoiBilletterie);
window.addEventListener('resize', posRenvoiBilletterie);
```

### Résumé
- Création du Shadow DOM pour encapsuler le component
- Récupération des données (image, titre, date, etc.) via Euterpe
- Mise à jour des informations sur la version Desktop et Mobile
- Affichage des données dans les éléments HTML selon Id Euterpe
- Gestion du clic pour afficher/masquer le contenu en version mobile
- Enregistrement du component avec ```<cmpp-billetterie>```
- Création d'un conteneur pour le componenet et positionnement selon la taille de l'écran