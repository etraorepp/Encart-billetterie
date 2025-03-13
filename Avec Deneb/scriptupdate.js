class CmppBilletterie extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
    }

    connectedCallback() {
        // Evite la multiplication des cards au chargement de la page
        this.shadowRoot.innerHTML = '';

        const template = document.getElementById('cmpp-billetterie-template');
        this.shadowRoot.appendChild(template.content.cloneNode(true));

        // Récupère l'id Euterpe et charge les données
        const ideuterpe = this.getAttribute('ideuterpe');
        this.loadData(ideuterpe);
    }

    async loadData(ideuterpe) {
        try {
            const denebUrl = `https://exemple.url.../${ideuterpe}`;
            const response = await fetch(denebUrl);
            if (!response.ok) {
                throw new Error("Erreur récupération des données");
            }

            const eventData = await response.json();

            const attributes = {
                imageUrl: eventData.image.uri,
                date: new Date(eventData.date).toLocaleDateString('fr-FR', {day: 'numeric', month: 'short'}).substring(0, 6),
                heure: new Date(eventData.date).toLocaleTimeString('fr-FR', {hour: '2-digit', minute: '2-digit'}).replace(':', 'h'),
                tag: eventData.activity,
                titre: eventData.title,
                dateComplete: new Date(eventData.date).toLocaleDateString('fr-FR', {weekday: 'long', day: 'numeric', month: 'long', year: 'numeric'}) + ' — ' + new Date(eventData.date).toLocaleTimeString('fr-FR', {hour: '2-digit', minute: '2-digit'}).replace(':', 'h'), 
                description: eventData.chapo,
                reservationUrl: `https://exemple.url.../${ideuterpe}` 
            };

            ['desktop-view', 'mobile-view'].forEach(viewClass => {
                this.updateView(viewClass, attributes);
            });

            this.setupEventListeners();

        } catch (error) {
            console.error("Erreur chargement des données:", error);
        }
    }

    updateView(viewClass, attrs) {
        const view = this.shadowRoot.querySelector(`.${viewClass}`);
        const selectors = {
            '.card-image': { attr: 'src', value: attrs.imageUrl },
            '.date-badge .date': { attr: 'textContent', value: attrs.date },
            '.date-badge p:last-child': { attr: 'textContent', value: attrs.heure },
            '.tag': { attr: 'textContent', value: attrs.tag },
            '.title': { attr: 'textContent', value: attrs.titre },
            '.content .date': { attr: 'textContent', value: attrs.dateComplete },
            '.description': { attr: 'innerHTML', value: attrs.description },
            '.reservation-btn': { 
                attr: 'onclick', 
                value: () => window.location.href = attrs.reservationUrl 
            }
        };

        Object.entries(selectors).forEach(([selector, {attr, value}]) => {
            const element = view.querySelector(selector);
            if (element) {
                element[attr] = value;
            }
        });
    }

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
    
}

// web component
customElements.define('cmpp-billetterie', CmppBilletterie);


// Creation div "renvoi-billetterie"
function setupRenvoiBilletterie() {
    let renvoiBilletterie = document.querySelector('.renvoi-billetterie');

    if (!renvoiBilletterie) {
        renvoiBilletterie = document.createElement('div');
        renvoiBilletterie.classList.add('renvoi-billetterie', 'col-md-3'); 
        document.body.prepend(renvoiBilletterie);
    }

    // Ajoute le web comp si inexistant
    let cmppBilletterie = document.querySelector('cmpp-billetterie');
    if (!cmppBilletterie) {
        cmppBilletterie = document.createElement('cmpp-billetterie');
        renvoiBilletterie.appendChild(cmppBilletterie);
    } else if (!renvoiBilletterie.contains(cmppBilletterie)) {
        renvoiBilletterie.appendChild(cmppBilletterie);
    }

    posRenvoiBilletterie();
}

// Position de "renvoi-billetterie"
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

// Exécuter au chargement et lors du redimensionnement de l'écran
window.addEventListener('load', setupRenvoiBilletterie);
window.addEventListener('resize', posRenvoiBilletterie);
