const PRODUCTS = [
    {
        id: 'p1',
        name: 'iPhone 16 Pro',
        cat: 'flagship',
        spec: 'A18 Pro · 256GB · 48MP',
        price: 999,
        img: 'https://fdn2.gsmarena.com/vv/bigpic/apple-iphone-16-pro.jpg',
        tag: 'ថ្មីបំផុត'
    },
    {
        id: 'p2',
        name: 'Samsung Galaxy S24 Ultra',
        cat: 'flagship',
        spec: 'Snapdragon · 256GB · S Pen',
        price: 1049,
        img: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQlk1ubdRL-odwodmYvi0w_J985LaTCNjGrn5QHP48ZCntlkNmE9zu0dqlw&s=10',
        tag: 'ពេញនិយម'
    },
    {
        id: 'p3',
        name: 'Google Pixel 9 Pro',
        cat: 'flagship',
        spec: 'Tensor G4 · 128GB · AI Cam',
        price: 899,
        img: 'https://media-ik.croma.com/Croma%20Assets/Communication/Mobiles/Images/309165_0_gvylu0.png'
    },
    {
        id: 'p4',
        name: 'OnePlus 13',
        cat: 'mid',
        spec: 'Snapdragon 8 Gen3 · 100W សាក',
        price: 749,
        img: 'https://fdn2.gsmarena.com/vv/bigpic/oneplus-13.jpg'
    },
    {
        id: 'p5',
        name: 'Xiaomi 14T Pro',
        cat: 'mid',
        spec: 'ថ្មធំ 5000mAh · 144Hz',
        price: 549,
        img: 'https://fdn2.gsmarena.com/vv/bigpic/xiaomi-14t-pro.jpg'
    },
    {
        id: 'p6',
        name: 'សំបកការពារកញ្ចក់ថ្លា MagSafe',
        cat: 'accessory',
        spec: 'ការពារធ្លាក់ ២ម៉ែត្រ',
        price: 25,
        img: 'https://images.unsplash.com/photo-1601784551446-20c9e07cdbdb?auto=format&fit=crop&w=600&q=80'
    },
    {
        id: 'p7',
        name: 'ខ្សែសាកលឿន 65W GaN',
        cat: 'accessory',
        spec: 'GaN · USB-C to USB-C',
        price: 29,
        img: 'https://images.unsplash.com/photo-1583863788434-e58a36330cf0?auto=format&fit=crop&w=600&q=80'
    }
];

let filter = 'all';
let search = '';
let cart = [];

const CART_STORAGE_KEY = 'hengshop-cart-v4';

function saveCart() {
    try {
        localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart));
    } catch (error) {
        console.warn('Cart could not be saved:', error);
    }
}

function loadCart() {
    try {
        const saved = JSON.parse(localStorage.getItem(CART_STORAGE_KEY) || '[]');
        cart = Array.isArray(saved) ? saved : [];
    } catch (error) {
        cart = [];
    }
}

function escapeHTML(value) {
    return String(value).replace(/[&<>"']/g, char => ({
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#039;'
    }[char]));
}

/* Product Grid Rendering */
function renderProducts() {
    const searchInput = document.getElementById('catalog-search');
    search = searchInput ? searchInput.value.trim().toLowerCase() : '';
    const grid = document.getElementById('products-grid');
    const list = PRODUCTS.filter(p => {
        const matchCat = filter === 'all' || p.cat === filter;
        const matchSearch = !search || p.name.toLowerCase().includes(search) || p.spec.toLowerCase().includes(search);
        return matchCat && matchSearch;
    });

    if (list.length === 0) {
        grid.innerHTML = `<p style="color:var(--muted); grid-column:1/-1; text-align:center; padding:30px;">មិនមានទំនិញត្រូវនឹងការស្វែងរករបស់អ្នកទេ។</p>`;
        return;
    }

    grid.innerHTML = list.map((p, i) => `
        <div class="card" style="animation: fade .4s ease both; animation-delay: ${i * 40}ms;">
            <div class="card-visual">
                ${p.tag ? `<span class="card-tag">${p.tag}</span>` : ''}
                <img src="${p.img}" alt="${escapeHTML(p.name)}" loading="lazy" />
            </div>
            <div class="card-name">${escapeHTML(p.name)}</div>
            <div class="card-spec">${escapeHTML(p.spec)}</div>
            <div class="card-foot">
                <span class="card-price">$${p.price.toLocaleString()}</span>
                <button class="card-btn" onclick="addToCart('${p.id}')">បញ្ចូលកន្ត្រក</button>
            </div>
        </div>
    `).join('');
}

function setFilter(cat) {
    filter = cat;
    document.querySelectorAll('.pill').forEach(b => b.classList.toggle('active', b.dataset.cat === cat));
    renderProducts();
}

/* Configurator Logic */
const cfg = {
    model: 'iphone16pro',
    modelName: 'iPhone 16 Pro',
    modelPrice: 999,
    storage: '128',
    storagePrice: 0,
    color: 'titanium',
    colorPrice: 0,
    acc: 'none',
    accPrice: 0,
    img: 'https://fdn2.gsmarena.com/vv/bigpic/apple-iphone-16-pro.jpg'
};

function switchStep(n) {
    document.querySelectorAll('.ctab').forEach(t => t.classList.toggle('active', +t.dataset.step === n));
    document.querySelectorAll('.cpanel').forEach(p => p.classList.toggle('active', +p.dataset.panel === n));
}

function pick(group, val, priceDelta, extra) {
    const panelMap = { model: 1, storage: 2, color: 3, acc: 4 };
    const panel = document.querySelector(`.cpanel[data-panel="${panelMap[group]}"]`);
    if (panel) {
        panel.querySelectorAll('.opt').forEach(o => o.classList.toggle('selected', o.dataset.val === val));
    }

    if (group === 'model') {
        cfg.model = val;
        cfg.modelName = extra.name;
        cfg.modelPrice = priceDelta;
        if (extra.img) {
            cfg.img = extra.img;
            const imgEl = document.getElementById('cfg-phone-img');
            if (imgEl) imgEl.src = extra.img;
        }
    }
    if (group === 'storage') {
        cfg.storage = val;
        cfg.storagePrice = priceDelta;
    }
    if (group === 'color') {
        cfg.color = val;
        cfg.colorPrice = priceDelta;
    }
    if (group === 'acc') {
        cfg.acc = val;
        cfg.accPrice = priceDelta;
    }

    updatePrice();
}

function updatePrice() {
    const total = cfg.modelPrice + cfg.storagePrice + cfg.colorPrice + cfg.accPrice;
    const priceEl = document.getElementById('cfg-price');
    if (priceEl) priceEl.textContent = '$' + total.toLocaleString();
}

function updateEngrave() {
    const input = document.getElementById('engrave-input');
    const v = (input && input.value) ? input.value : 'សារជូនពររបស់អ្នក';
    const engraveEl = document.getElementById('cfg-engrave');
    if (engraveEl) engraveEl.textContent = '🎁 ' + v;
}

function addCustomToCart() {
    const total = cfg.modelPrice + cfg.storagePrice + cfg.colorPrice + cfg.accPrice;
    cart.push({
        id: 'custom-' + Date.now(),
        name: 'ទូរស័ព្ទកំណត់ផ្ទាល់ខ្លួន: ' + cfg.modelName,
        meta: `${cfg.storage}GB · ពណ៌ ${cfg.color}`,
        price: total,
        img: cfg.img
    });
    saveCart();
    renderCart();
    showToast('បានបញ្ចូលទូរស័ព្ទកំណត់ផ្ទាល់ខ្លួនទៅកន្ត្រក ✓');
    openCart();
}

/* Cart Operations */
function addToCart(id) {
    const p = PRODUCTS.find(x => x.id === id);
    if (!p) return;
    cart.push({
        id: p.id + '-' + Date.now(),
        name: p.name,
        meta: p.spec,
        price: p.price,
        img: p.img
    });
    saveCart();
    renderCart();
    showToast(p.name + ' ត្រូវបានបញ្ចូលកន្ត្រក ✓');
    openCart();
}

function removeFromCart(idx) {
    cart.splice(idx, 1);
    saveCart();
    renderCart();
}

function renderCart() {
    const wrap = document.getElementById('cart-items');
    const countEl = document.getElementById('cart-count');
    if (countEl) countEl.textContent = cart.length;

    if (!wrap) return;

    if (cart.length === 0) {
        wrap.innerHTML = `<div class="empty-cart">កន្ត្រករបស់អ្នកនៅទទេ។<br/>សូមជ្រើសរើសទូរស័ព្ទដែលអ្នកចូលចិត្ត។</div>`;
    } else {
        wrap.innerHTML = cart.map((c, i) => `
            <div class="cart-item">
                <div class="ci-thumb">
                    <img src="${c.img || 'https://images.unsplash.com/photo-1695048133142-1a20484d2569?auto=format&fit=crop&w=200&q=80'}" alt="${escapeHTML(c.name)}" />
                </div>
                <div style="flex:1;">
                    <div class="ci-name">${escapeHTML(c.name)}</div>
                    <div class="ci-meta">${escapeHTML(c.meta)}</div>
                    <div class="ci-price">$${c.price.toLocaleString()}</div>
                </div>
                <button class="ci-remove" onclick="removeFromCart(${i})">លុប</button>
            </div>
        `).join('');
    }

    const subtotal = cart.reduce((s, c) => s + c.price, 0);
    const subtotalEl = document.getElementById('cart-subtotal');
    const totalEl = document.getElementById('cart-total');
    if (subtotalEl) subtotalEl.textContent = '$' + subtotal.toFixed(2);
    if (totalEl) totalEl.textContent = '$' + subtotal.toFixed(2);
}

function openCart() {
    const drawer = document.getElementById('cart-drawer');
    const overlay = document.getElementById('cart-overlay');
    if (drawer) drawer.classList.add('open');
    if (overlay) overlay.classList.add('show');
}

function closeCart() {
    const drawer = document.getElementById('cart-drawer');
    const overlay = document.getElementById('cart-overlay');
    if (drawer) drawer.classList.remove('open');
    if (overlay) overlay.classList.remove('show');
}

/* Checkout Modal */
function openCheckout() {
    if (cart.length === 0) {
        showToast('សូមបញ្ចូលទំនិញមុននឹងទូទាត់ប្រាក់');
        return;
    }
    const modal = document.getElementById('checkout-modal');
    if (modal) modal.classList.add('show');
    closeCart();
}

function closeCheckout() {
    const modal = document.getElementById('checkout-modal');
    if (modal) modal.classList.remove('show');
}

/* FAQ Accordion */
function toggleFaq(btn) {
    const item = btn.parentElement;
    const icon = btn.querySelector('.faq-icon');
    document.querySelectorAll('.faq-item').forEach(f => {
        if (f !== item) {
            f.classList.remove('open');
            const ic = f.querySelector('.faq-icon');
            if (ic) ic.textContent = '+';
        }
    });
    const isOpen = item.classList.toggle('open');
    if (icon) icon.textContent = isOpen ? '−' : '+';
}

/* Mobile Navigation */
function openMobileNav() {
    const mnav = document.getElementById('mnav');
    if (mnav) mnav.classList.add('open');
}

function closeMobileNav() {
    const mnav = document.getElementById('mnav');
    if (mnav) mnav.classList.remove('open');
}

/* Newsletter & Toast */
function handleNewsletter(e) {
    e.preventDefault();
    showToast('បានចុះឈ្មោះទទួលព័ត៌មានជោគជ័យ!');
    e.target.reset();
}

function showToast(msg) {
    const wrap = document.getElementById('toast-wrap');
    if (!wrap) return;
    const t = document.createElement('div');
    t.className = 'toast';
    t.textContent = msg;
    wrap.appendChild(t);
    setTimeout(() => t.remove(), 2600);
}

/* Scroll Progress & Navbar Effect */
window.addEventListener('scroll', () => {
    const scrollBar = document.getElementById('scroll-bar');
    if (scrollBar) {
        const totalHeight = document.documentElement.scrollHeight - window.innerHeight;
        const progress = totalHeight > 0 ? (window.scrollY / totalHeight) * 100 : 0;
        scrollBar.style.width = progress + '%';
    }

    const navbar = document.querySelector('.navbar');
    if (navbar) {
        navbar.classList.toggle('scrolled', window.scrollY > 20);
    }
}, { passive: true });

/* Scroll Reveal with Staggered Delays */
const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('in');
            revealObserver.unobserve(entry.target);
        }
    });
}, { threshold: 0.1 });

document.querySelectorAll('.spec-card, .rev-card, .store-card, .quote-box, .faq-item, .story-stats > div, .cat-head, .config-wrap').forEach((el, i) => {
    el.classList.add('reveal');
    el.style.transitionDelay = (i % 4) * 80 + 'ms';
    revealObserver.observe(el);
});

/* 3D Tilt Effect on Product Cards */
if (window.matchMedia('(hover: hover)').matches) {
    const pGrid = document.getElementById('products-grid');
    if (pGrid) {
        pGrid.addEventListener('mousemove', (e) => {
            const c = e.target.closest('.card');
            if (!c) return;
            const r = c.getBoundingClientRect();
            const x = (e.clientX - r.left) / r.width - 0.5;
            const y = (e.clientY - r.top) / r.height - 0.5;
            c.style.transform = `perspective(700px) rotateY(${x * 8}deg) rotateX(${-y * 8}deg) translateY(-8px)`;
        });
        pGrid.addEventListener('mouseout', (e) => {
            const c = e.target.closest('.card');
            if (c) c.style.transform = '';
        });
    }
}

/* Initial Setup */
document.addEventListener('DOMContentLoaded', () => {
    loadCart();

    const searchInput = document.getElementById('catalog-search');
    if (searchInput) {
        searchInput.addEventListener('input', renderProducts);
    }

    document.addEventListener('keydown', (event) => {
        if (event.key === 'Escape') {
            closeCart();
            closeCheckout();
            closeMobileNav();
        }
    });

    const checkoutModal = document.getElementById('checkout-modal');
    if (checkoutModal) {
        checkoutModal.addEventListener('click', (event) => {
            if (event.target === checkoutModal) closeCheckout();
        });
    }

    renderProducts();
    renderCart();
    updateEngrave();
});
