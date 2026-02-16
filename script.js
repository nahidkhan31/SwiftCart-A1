window.onload = () => {
  fetchTrending();
  fetchCategories();
  updateCartCount();
};

function showSection(sectionId) {
  const pages = [
    "home-page",
    "products-page",
    "faq-page",
    "about-page",
    "contact-page",
    "shipping-page",
    "return-page",
    "privacyPolicy-page",
    "cart-page",
  ];
  pages.forEach((id) => {
    const page = document.getElementById(id);
    if (page) page.classList.add("hidden");
  });

  document.getElementById(sectionId + "-page")?.classList.remove("hidden");

  if (sectionId === "cart") {
    renderCart();
  }

  document.getElementById(sectionId + "-page").classList.remove("hidden");

  const navIds = ["home", "products", "about", "contact"];

  navIds.forEach((id) => {
    const desktopNav = document.getElementById("nav-" + id);
    const mobileNav = document.getElementById("m-nav-" + id);

    if (desktopNav) desktopNav.classList.remove("nav-active");
    if (mobileNav) mobileNav.classList.remove("nav-active");
  });

  const activeDesktopNav = document.getElementById("nav-" + sectionId);
  const activeMobileNav = document.getElementById("m-nav-" + sectionId);

  if (activeDesktopNav) activeDesktopNav.classList.add("nav-active");
  if (activeMobileNav) activeMobileNav.classList.add("nav-active");

  if (sectionId === "products") {
    loadAllProducts("https://fakestoreapi.com/products", "cat-all");
  }

  const activeElement = document.activeElement;
  if (activeElement) {
    activeElement.blur();
  }

  window.scrollTo({ top: 0, behavior: "smooth" });
}

// show category
async function fetchCategories() {
  try {
    const res = await fetch("https://fakestoreapi.com/products/categories");
    const categories = await res.json();
    const container = document.getElementById("category-btns");

    container.innerHTML = `<button id="cat-all" class="btn btn-sm cat-btn cat-active">All</button>`;

    document.getElementById("cat-all").onclick = () =>
      loadAllProducts("https://fakestoreapi.com/products", "cat-all");

    categories.forEach((cat, index) => {
      const btnId = `cat-${index}`;
      const btn = document.createElement("button");
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
  document.querySelectorAll(".cat-btn").forEach((btn) => {
    btn.classList.remove("cat-active");
    btn.classList.add("btn-outline");
  });
  const activeBtn = document.getElementById(btnId);
  if (activeBtn) {
    activeBtn.classList.add("cat-active");
    activeBtn.classList.remove("btn-outline");
  }
  const grid = document.getElementById("all-products-grid");
  grid.innerHTML = `<div class="col-span-full text-center py-20"><span class="loading loading-spinner loading-lg text-primary"></span></div>`;
  try {
    const res = await fetch(url);
    const data = await res.json();

    if (!data || data.length === 0) {
      grid.innerHTML = `<div class="col-span-full py-20 text-center"><h3 class="text-xl font-bold opacity-40">No products found in this category.</h3></div>`;
    } else {
      renderCards(data, "all-products-grid");
    }
  } catch (e) {
    grid.innerHTML = `<p class="col-span-full text-center text-red-400">Error loading data. Please check your internet.</p>`;
  }
}

// show only 3 items in main page
async function fetchTrending() {
  try {
    const res = await fetch("https://fakestoreapi.com/products?limit=3");
    const data = await res.json();
    renderCards(data, "trending-grid");
  } catch (e) {}
}

function renderCards(products, gridId) {
  const grid = document.getElementById(gridId);
  grid.innerHTML = "";
  products.forEach((p) => {
    grid.innerHTML += `
                <div class="card bg-white shadow-sm border border-gray-100 hover:shadow-md transition duration-300">
                <figure class="p-6 bg-gray-50"><img src="${p.image}" class="h-40 object-contain transition-transform duration-300 hover:scale-110 cursor-pointer" /></figure>
                <div class="card-body p-5">
                    <div class="flex justify-between items-center mb-2 font-bold">
                        <span class="badge badge-sm badge-outline capitalize bg-green-400">${p.category}</span>
                        <div class="flex items-center gap-1 text-orange-500 text-[11px]">
                            <i class="fa-solid fa-star"></i>
                            <span>${p.rating.rate}</span>
                        </div>
                    </div>
                    <h2 class="card-title text-sm h-10 overflow-hidden leading-tight">${p.title.slice(0, 40)}...</h2>
                    <p class="text-lg font-bold text-[#4f46e5]">$${p.price}</p>
                    <div class="card-actions grid grid-cols-2 gap-2 mt-4">
                        <button onclick="details(${p.id})" class="btn btn-xs btn-outline border-gray-300">Details</button>
                        <button onclick="addToCart(${p.id}, '${p.title.replaceAll("'", "\\'")}', ${p.price}, '${p.image}')" class="btn btn-xs bg-[#4f46e5] border-none text-white hover:bg-[#4338ca]">Add</button>
                    </div>
                </div>
            </div>
        `;
  });
}

async function details(id) {
  const res = await fetch(`https://fakestoreapi.com/products/${id}`);
  const d = await res.json();
  document.getElementById("modal-body").innerHTML = `
        <div class="flex-1 p-4 bg-gray-50 rounded-xl flex items-center justify-center"><img src="${d.image}" class="h-60 object-contain"></div>
        <div class="flex-1">
            <h2 class="text-xl font-bold mb-2">${d.title}</h2>
            <p class="text-xs opacity-60 mb-4">${d.description}</p>
            <p class="text-2xl font-black text-[#4f46e5] mb-6">$${d.price}</p>
            <button class="btn bg-[#4f46e5] text-white w-full" onclick="addToCart(${d.id}, '${d.title.replaceAll("'", "\\'")}', ${d.price}, '${d.image}')">Add to Cart</button>
        </div>`;
  product_modal.showModal();
}

//local storage control

let cart = JSON.parse(localStorage.getItem("cart")) || [];

function saveCart() {
  localStorage.setItem("cart", JSON.stringify(cart));
  updateCartCount();
}

function addToCart(id, name, price, image) {
  const item = cart.find((p) => p.id === id);

  if (item) {
    item.qty++;
  } else {
    cart.push({ id, name, price, image, qty: 1 });
    showToast("Product added to cart", "success");
  }

  saveCart();
  
}

function updateQty(id, type) {
  const item = cart.find((p) => p.id === id);
  if (!item) return;

  if (type === "plus") {
    item.qty++;
  } else {
    item.qty--;
    if (item.qty <= 0) {
      cart = cart.filter((p) => p.id !== id);
    }
  }

  saveCart();
  renderCart();
}

function removeItem(id) {
  cart = cart.filter((item) => item.id !== id);
  saveCart();
  renderCart();
  showToast("Item removed from cart", "error");
}

function updateCartCount() {
  const totalQty = cart.reduce((sum, item) => sum + item.qty, 0);
  document.getElementById("cart-count").innerText = totalQty;
  showToast("Quantity updated", "info");
}

function renderCart() {
  const container = document.getElementById("cart-items");
  const totalBox = document.getElementById("cart-total");
  container.innerHTML = "";

  if (cart.length === 0) {
    container.innerHTML =
      "<p class='text-center opacity-60'>Your cart is empty</p>";
    totalBox.innerHTML = "";
    return;
  }

  let totalPrice = 0;

  cart.forEach((item) => {
    totalPrice += item.price * item.qty;

    container.innerHTML += `
      <div class="flex items-center gap-4 border-b pb-4">
        <img src="${item.image}" class="w-14 h-14 object-contain rounded">

        <div class="flex-1">
          <h4 class="font-semibold text-sm">${item.name}</h4>
          <p class="text-xs opacity-60">$${item.price} each</p>

          <div class="flex items-center gap-2 mt-2">
            <button onclick="updateQty(${item.id}, 'minus')" class="btn btn-xs">−</button>
            <span class="font-bold">${item.qty}</span>
            <button onclick="updateQty(${item.id}, 'plus')" class="btn btn-xs">+</button>
          </div>
        </div>

        <div class="text-right">
          <p class="font-bold">$${(item.price * item.qty).toFixed(2)}</p>
          <button onclick="removeItem(${item.id})"
            class="text-xs text-red-500 hover:underline">
            Remove
          </button>
        </div>
      </div>
    `;
  });

  totalBox.innerHTML = `
    <div class="mt-6 p-4 bg-white shadow rounded-xl text-right">
      <p class="text-sm opacity-60">Subtotal</p>
      <h3 class="text-2xl font-bold text-indigo-600">
        $${totalPrice.toFixed(2)}
      </h3>
      <button class="btn bg-indigo-600 text-white mt-4 w-full">
        Proceed to Checkout
      </button>
    </div>
  `;
}

function showToast(message, type = "success") {
  const container = document.getElementById("toast-container");

  const colors = {
    success: "bg-green-500",
    error: "bg-red-500",
    info: "bg-indigo-500",
  };

  const icons = {
    success: "fa-circle-check",
    error: "fa-circle-xmark",
    info: "fa-circle-info",
  };

  const toast = document.createElement("div");
  toast.className = `
    flex items-center gap-3 px-5 py-4 rounded-xl shadow-lg text-white
    ${colors[type]} animate-slide-in
  `;

  toast.innerHTML = `
    <i class="fa-solid ${icons[type]} text-xl"></i>
    <span class="font-semibold text-sm">${message}</span>
  `;

  container.appendChild(toast);

  // auto remove
  setTimeout(() => {
    toast.classList.add("opacity-0", "translate-x-10");
    setTimeout(() => toast.remove(), 300);
  }, 2000);
}
