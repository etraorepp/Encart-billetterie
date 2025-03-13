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
- Récupération des attributs HTML dynamiques (image, titre, date, description, etc.).
- Mise à jour du component en fonction des données fournies.
- Gestion du système d'ouverture/fermeture du contenu en version mobile.

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
```js
connectedCallback() {
    const template = document.getElementById('cmpp-billetterie-template');
    const templateContent = template.content;

    this.shadowRoot.appendChild(templateContent.cloneNode(true));

    // ...
}
```

### 3. Récupération des attributs/variables
```js
// Récupération des attributs
const attributes = {
    imageUrl: this.getAttribute('image-url'),
    date: this.getAttribute('date'),
    heure: this.getAttribute('heure'),
    tag: this.getAttribute('tag'),
    titre: this.getAttribute('titre'),
    dateComplete: this.getAttribute('date-complete'),
    description: this.getAttribute('description'),
    reservationUrl: this.getAttribute('reservation-url')
};
```

### 4. Mise à jour des vues
- Applique les bonnes informations (image, date, titre, description...) aux versions desktop et mobile
```js
// Mise à jour des deux vues
['desktop-view', 'mobile-view'].forEach(viewClass => {
    this.updateView(viewClass, attributes);
});
```

### 5. updateView
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

### 6. setupEventListeners
- Fonction qui va gérer le déroulement du contenu caché lorsque je vais cliquer sur la card en version mobile
```js
setupEventListeners() {
    const badgeWrapper = this.shadowRoot.querySelector('.mobile-view .badge-wrapper');
    badgeWrapper.addEventListener('click', () => {
        const content = this.shadowRoot.querySelector('.content-mobile');
        const badge = badgeWrapper;
        content.classList.toggle('active');
        badge.classList.toggle('active');
    });
}
```

### 7. Enregistrement du component
- Enregistre l'élément ```<cmpp-billetterie>``` qui est lié à la classe CmppBilletterie 
```js
// web component
customElements.define('cmpp-billetterie', CmppBilletterie);
```

### Résumé
- Création du Shadow DOM pour encapsuler le component
- Récupération des données (image, titre, date, etc.)
- Mise à jour des informations sur la version Desktop et Mobile
- Affichage des données dans les éléments HTML
- Gestion du clic pour afficher/masquer le contenu en version mobile
- Enregistrement du component avec ```<cmpp-billetterie>```
