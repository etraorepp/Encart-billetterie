class CmppBilletterie extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
    }

    connectedCallback() {
        const template = document.getElementById('cmpp-billetterie-template');
        const templateContent = template.content;

        this.shadowRoot.appendChild(templateContent.cloneNode(true));

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

        // Mise à jour des deux vues
        ['desktop-view', 'mobile-view'].forEach(viewClass => {
            this.updateView(viewClass, attributes);
        });

        this.setupEventListeners();
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
            '.description': { attr: 'textContent', value: attrs.description },
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
        const badgeWrapper = this.shadowRoot.querySelector('.mobile-view .badge-wrapper');
        badgeWrapper.addEventListener('click', () => {
            const content = this.shadowRoot.querySelector('.content-mobile');
            const badge = badgeWrapper;
            content.classList.toggle('active');
            badge.classList.toggle('active');
        });
    }
}

// web component
customElements.define('cmpp-billetterie', CmppBilletterie);
