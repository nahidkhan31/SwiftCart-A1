let cartItemsCount = 0;


window.onload = () => {
    fetchTrending();
    fetchCategories();
};

function showSection(sectionId) {
    const pages = ['home-page', 'products-page', 'faq-page'];
    pages.forEach(id => {
        const page = document.getElementById(id);
        if (page) page.classList.add('hidden');
    });
    
    document.getElementById(sectionId + '-page').classList.remove('hidden');

    const navIds = ['home', 'products'];
    
    navIds.forEach(id => {
        const desktopNav = document.getElementById('nav-' + id);
        const mobileNav = document.getElementById('m-nav-' + id);
        
        if (desktopNav) desktopNav.classList.remove('nav-active');
        if (mobileNav) mobileNav.classList.remove('nav-active');
    });

    const activeDesktopNav = document.getElementById('nav-' + sectionId);
    const activeMobileNav = document.getElementById('m-nav-' + sectionId);
    
    if (activeDesktopNav) activeDesktopNav.classList.add('nav-active');
    if (activeMobileNav) activeMobileNav.classList.add('nav-active');

    if (sectionId === 'products') {
        loadAllProducts('https://fakestoreapi.com/products', 'cat-all');
    }

    const activeElement = document.activeElement;
    if (activeElement) {
        activeElement.blur();
    }

    window.scrollTo({ top: 0, behavior: 'smooth' });
}

// show category
async function fetchCategories() {
    try {
        const res = await fetch('https://fakestoreapi.com/products/categories');
        const categories = await res.json();
        const container = document.getElementById('category-btns');
        
        container.innerHTML = `<button id="cat-all" class="btn btn-sm cat-btn cat-active">All</button>`;
        
        document.getElementById('cat-all').onclick = () => loadAllProducts('https://fakestoreapi.com/products', 'cat-all');

        categories.forEach((cat, index) => {
            const btnId = `cat-${index}`;
            const btn = document.createElement('button');
            btn.id = btnId;
            btn.className = "btn btn-sm btn-outline btn-primary capitalize cat-btn";
            btn.innerText = cat;
            
            btn.onclick = () => {
                const url = `https://fakestoreapi.com/products/category/${encodeURIComponent(cat)}`;
                loadAllProducts(url, btnId);
            };
            
            container.appendChild(btn);
        });
    } catch (error) {
        console.error("Error fetching categories:", error);
    }
}



async function loadAllProducts(url, btnId) {
    document.querySelectorAll('.cat-btn').forEach(btn => {
        btn.classList.remove('cat-active');
        btn.classList.add('btn-outline');
    });
    const activeBtn = document.getElementById(btnId);
    if (activeBtn) {
        activeBtn.classList.add('cat-active');
        activeBtn.classList.remove('btn-outline');
    }
    const grid = document.getElementById('all-products-grid');
    grid.innerHTML = `<div class="col-span-full text-center py-20"><span class="loading loading-spinner loading-lg text-primary"></span></div>`;
    try {
        const res = await fetch(url);
        const data = await res.json();
        
        if (!data || data.length === 0) {
            grid.innerHTML = `<div class="col-span-full py-20 text-center"><h3 class="text-xl font-bold opacity-40">No products found in this category.</h3></div>`;
        } else {
            renderCards(data, 'all-products-grid');
        }
    } catch (e) {
        grid.innerHTML = `<p class="col-span-full text-center text-red-400">Error loading data. Please check your internet.</p>`;
    }
}


// show only 3 items in main page
async function fetchTrending() {
    try {
        const res = await fetch('https://fakestoreapi.com/products?limit=3');
        const data = await res.json();
        renderCards(data, 'trending-grid');
    } catch(e) {}
}

function renderCards(products, gridId) {
  const grid = document.getElementById(gridId);
  grid.innerHTML = "";
  products.forEach((p) => {
    grid.innerHTML += `
                <div class="card bg-white shadow-sm border border-gray-100 hover:shadow-md transition duration-300">
                <figure class="p-6 bg-gray-50"><img src="${p.image}" class="h-40 object-contain" /></figure>
                <div class="card-body p-5">
                    <div class="flex justify-between items-center mb-2 font-bold">
                        <span class="badge badge-sm badge-outline opacity-50 capitalize">${p.category}</span>
                        <div class="flex items-center gap-1 text-orange-500 text-[11px]">
                            <i class="fa-solid fa-star"></i>
                            <span>${p.rating.rate}</span>
                        </div>
                    </div>
                    <h2 class="card-title text-sm h-10 overflow-hidden leading-tight">${p.title.slice(0, 40)}...</h2>
                    <p class="text-lg font-bold text-[#4f46e5]">$${p.price}</p>
                    <div class="card-actions grid grid-cols-2 gap-2 mt-4">
                        <button onclick="details(${p.id})" class="btn btn-xs btn-outline border-gray-300">Details</button>
                        <button onclick="addToCart()" class="btn btn-xs bg-[#4f46e5] border-none text-white hover:bg-[#4338ca]">Add</button>
                    </div>
                </div>
            </div>
        `;
  });
}

async function details(id) {
    const res = await fetch(`https://fakestoreapi.com/products/${id}`);
    const d = await res.json();
    document.getElementById('modal-body').innerHTML = `
        <div class="flex-1 p-4 bg-gray-50 rounded-xl flex items-center justify-center"><img src="${d.image}" class="h-60 object-contain"></div>
        <div class="flex-1">
            <h2 class="text-xl font-bold mb-2">${d.title}</h2>
            <p class="text-xs opacity-60 mb-4">${d.description}</p>
            <p class="text-2xl font-black text-[#4f46e5] mb-6">$${d.price}</p>
            <button class="btn bg-[#4f46e5] text-white w-full" onclick="addToCart()">Add to Cart</button>
        </div>`;
    product_modal.showModal();
}

function addToCart() {
    cartItemsCount++;
    document.getElementById('cart-count').innerText = cartItemsCount;
}
