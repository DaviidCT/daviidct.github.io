document.addEventListener('DOMContentLoaded', function() {
    
    // --- BASE DE DATOS DE PRODUCTOS (SIMULADA) ---
    const productDatabase = {
        'mot-001': { name: 'Motor eléctrico trifásico 0.75kW/1CV', price: 150.00, image: 'motorelectrico1.jpg' },
        'mot-002': { name: 'Motor eléctrico trifásico 1,1kW/1,5CV', price: 180.50, image: 'motorelectrico1.jpg' },
        'mot-003': { name: 'Motor eléctrico trifásico 1,5kW/2CV', price: 210.00, image: 'motorelectrico1.jpg' }
    };

    // --- LÓGICA DEL MENÚ HAMBURGUESA ---
    const menuToggle = document.querySelector('.menu-toggle');
    const mainNav = document.querySelector('.main-nav');
    if (menuToggle && mainNav) {
        menuToggle.addEventListener('click', () => mainNav.classList.toggle('active-mobile'));
    }

    // --- LÓGICA DEL MODAL ---
    const modal = document.getElementById('add-to-cart-modal');
    const closeModalBtn = document.querySelector('.modal-close-btn');
    const continueShoppingBtn = document.getElementById('modal-continue-shopping');

    function showModal() {
        if (modal) modal.classList.add('visible');
    }
    function hideModal() {
        if (modal) modal.classList.remove('visible');
    }

    if (closeModalBtn) closeModalBtn.addEventListener('click', hideModal);
    if (continueShoppingBtn) continueShoppingBtn.addEventListener('click', hideModal);
    if (modal) {
        modal.addEventListener('click', function(e) {
            if (e.target === modal) {
                hideModal();
            }
        });
    }

    // --- LÓGICA DE LA CESTA DE LA COMPRA ---
    const cartCounter = document.querySelector('.cart-counter');
    const addToCartButton = document.getElementById('add-to-cart-btn');

    function getCart() {
        return JSON.parse(localStorage.getItem('movaredCart')) || [];
    }
    function saveCart(cart) {
        localStorage.setItem('movaredCart', JSON.stringify(cart));
        updateCartCounter();
    }
    function updateCartCounter() {
        const cart = getCart();
        const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
        if (cartCounter) {
            cartCounter.textContent = totalItems;
            cartCounter.classList.toggle('visible', totalItems > 0);
        }
    }

    if (addToCartButton) {
        addToCartButton.addEventListener('click', function() {
            const quantitySelector = document.querySelector('.quantity-selector');
            const product = {
                id: this.dataset.productId,
                quantity: parseInt(quantitySelector.value, 10) || 1
            };
            let cart = getCart();
            const existingProductIndex = cart.findIndex(item => item.id === product.id);
            if (existingProductIndex > -1) {
                cart[existingProductIndex].quantity += product.quantity;
            } else {
                cart.push(product);
            }
            saveCart(cart);
            showModal();
        });
    }

    // --- LÓGICA PARA MOSTRAR LA CESTA EN cesta.html ---
    if (document.body.id === 'cesta-page') {
        displayCartItems();
    }

    function displayCartItems() {
        const cart = getCart();
        const container = document.querySelector('#cesta-page .container');
        const cartLayout = document.querySelector('.cart-layout');
        const tableBody = document.getElementById('cart-table-body');
        const emptyCartMessage = document.getElementById('empty-cart-message');
        const cartSummary = document.querySelector('.cart-summary');
        const cartTable = document.querySelector('.cart-items table');
        const summarySubtotal = document.getElementById('summary-subtotal');
        const summaryTotal = document.getElementById('summary-total');

        if (!container || !cartLayout || !tableBody) return;

        tableBody.innerHTML = ''; 

        if (cart.length === 0) {
            container.classList.add('is-empty');
            cartLayout.classList.add('is-empty');
            emptyCartMessage.style.display = 'block';
            cartSummary.style.display = 'none';
            cartTable.style.display = 'none';
            return;
        }

        container.classList.remove('is-empty');
        cartLayout.classList.remove('is-empty');
        emptyCartMessage.style.display = 'none';
        cartSummary.style.display = 'block';
        cartTable.style.display = 'table';
        let subtotal = 0;

        cart.forEach(item => {
            const productData = productDatabase[item.id];
            if (!productData) return;
            const itemTotal = item.quantity * productData.price;
            subtotal += itemTotal;
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>
                    <div class="cart-product-info">
                        <img src="${productData.image}" alt="${productData.name}">
                        <span>${productData.name}</span>
                    </div>
                </td>
                <td>${productData.price.toFixed(2).replace('.', ',')} €</td>
                <td>
                    <div class="cart-quantity-controls">
                        <input type="number" class="quantity-input" value="${item.quantity}" min="1" data-product-id="${item.id}">
                    </div>
                </td>
                <td>${itemTotal.toFixed(2).replace('.', ',')} €</td>
                <td><a href="#" class="remove-item-btn" data-product-id="${item.id}">×</a></td>
            `;
            tableBody.appendChild(row);
        });

        if (summarySubtotal) summarySubtotal.textContent = `${subtotal.toFixed(2).replace('.', ',')} €`;
        if (summaryTotal) summaryTotal.textContent = `${subtotal.toFixed(2).replace('.', ',')} €`;

        tableBody.querySelectorAll('.remove-item-btn').forEach(btn => {
            btn.addEventListener('click', function(e) {
                e.preventDefault();
                const productId = this.dataset.productId;
                let cart = getCart();
                cart = cart.filter(item => item.id !== productId);
                saveCart(cart);
                displayCartItems();
            });
        });

        tableBody.querySelectorAll('.quantity-input').forEach(input => {
            input.addEventListener('change', function() {
                const productId = this.dataset.productId;
                const newQuantity = parseInt(this.value, 10);
                let cart = getCart();
                if (newQuantity < 1) {
                     cart = cart.filter(item => item.id !== productId);
                } else {
                    const productIndex = cart.findIndex(item => item.id === productId);
                    if (productIndex > -1) {
                        cart[productIndex].quantity = newQuantity;
                    }
                }
                saveCart(cart);
                displayCartItems();
            });
        });
    }

    // Actualizamos el contador en todas las páginas al cargar
    updateCartCounter();
});