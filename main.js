'use strict';

const cartButton = document.querySelector('#cart-button');
const modal = document.querySelector('.modal');
const close = document.querySelector('.close');
const buttonAuth = document.querySelector('.button-auth');
const modalAuth = document.querySelector('.modal-auth');
const closeAuth = document.querySelector('.close-auth');
const logInForm = document.querySelector('#logInForm');
const loginInput = document.querySelector('#login');
const userName = document.querySelector('.user-name');
const buttonOut = document.querySelector('.button-out');
const cardsRestaurants = document.querySelector('.cards-restaurants');
const containerPromo = document.querySelector('.container-promo');
const restaurants = document.querySelector('.restaurants');
const menu = document.querySelector('.menu');
const logo = document.querySelector('.logo');
const cardsMenu = document.querySelector('.cards-menu');
const restaurantTitle = document.querySelector('.restaurant-title');
const restaurantRating = document.querySelector('.rating');
const restaurantPrice = document.querySelector('.price');
const restaurantCategory = document.querySelector('.category');
const inputSearch = document.querySelector('.input-search');
const modalBody = document.querySelector('.modal-body');
const modalPrice = document.querySelector('.modal-pricetag');
const clearCart = document.querySelector('.clear-cart');

let login = localStorage.getItem('delivery');

const cart = [];

const getData = async function (url) {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(
      `Ошибка по адресу ${url},  статус ошибки ${response.status}`
    );
  }
  return await response.json();
};

const toggleModal = () => {
  modal.classList.toggle('is-open');
};

const toggleModalAuth = () => {
  modalAuth.classList.toggle('is-open');
  loginInput.style.borderColor = '';
};

const authorized = () => {
  function logOut() {
    login = '';

    localStorage.removeItem('delivery');

    buttonAuth.style.display = '';
    userName.style.display = '';
    buttonOut.style.display = '';
    cartButton.style.display = 'flex';
    buttonOut.removeEventListener('click', logOut);

    checkAuth();
  }

  console.log('authorized');

  userName.textContent = login;

  buttonAuth.style.display = 'none';
  userName.style.display = 'inline';
  buttonOut.style.display = 'flex';
  cartButton.style.display = 'flex';
  buttonOut.addEventListener('click', logOut);
};

const notAuthorized = () => {
  console.log(' no authorized');

  function logIn(e) {
    e.preventDefault();

    if (loginInput.value.trim()) {
      login = loginInput.value;
      localStorage.setItem('delivery', login);
      toggleModalAuth();

      buttonAuth.removeEventListener('click', toggleModalAuth);
      closeAuth.removeEventListener('click', toggleModalAuth);
      logInForm.removeEventListener('submit', logIn);
      logInForm.reset();
      checkAuth();
    } else {
      loginInput.style.borderColor = 'red';
      loginInput.value = '';
    }
  }

  buttonAuth.addEventListener('click', toggleModalAuth);
  closeAuth.addEventListener('click', toggleModalAuth);
  logInForm.addEventListener('submit', logIn);
  modalAuth.addEventListener('click', function (e) {
    if (e.target.classList.contains('is-open')) {
      toggleModalAuth();
    }
  });
};

const checkAuth = () => {
  if (login) {
    authorized();
  } else {
    notAuthorized();
  }
};

const createCardRestaurant = ({
  name,
  products,
  stars,
  price,
  kitchen,
  image,
  time_of_delivery: timeOfDelivery,
}) => {
  const cardRestaurant = document.createElement('a');
  cardRestaurant.className = 'card card-restaurant';
  cardRestaurant.products = products;
  cardRestaurant.info = { name, stars, price, kitchen };

  const card = `
      <img
        src="${image}"
        alt="${name}"
        class="card-image"
      />
      <div class="card-text">
        <div class="card-heading">
          <h3 class="card-title">${name} </h3>
          <span class="card-tag tag">${timeOfDelivery}</span>
        </div>
        <div class="card-info">
          <div class="rating">${stars}</div>
          <div class="price">${price}</div>
          <div class="category">${kitchen}</div>
        </div>
      </div>
  `;
  cardRestaurant.insertAdjacentHTML('beforeend', card);
  cardsRestaurants.insertAdjacentElement('beforeend', cardRestaurant);
};

const createCardGood = ({ name, description, price, image, id }) => {
  const card = document.createElement('div');
  card.className = 'card';
  card.insertAdjacentHTML(
    'beforeend',
    `
    <img
      src="${image}"
      alt="${name}"
      class="card-image"
    />
    <div class="card-text">
      <div class="card-heading">
        <h3 class="card-title card-title-reg">${name}</h3>
      </div>
      <div class="card-info">
        <div class="ingredients">
          ${description}
        </div>
      </div>
      <div class="card-buttons">
        <button class="button button-primary button-add-cart" id=${id}>
          <span class="button-card-text">В корзину</span>
          <span class="button-cart-svg"></span>
        </button>
        <strong class="card-price-bold">${price}$</strong>
      </div>
    </div>
  `
  );

  cardsMenu.insertAdjacentElement('beforeend', card);
};

const openGoods = e => {
  const target = e.target;
  if (login) {
    const restaurant = target.closest('.card-restaurant');
    if (restaurant) {
      cardsMenu.textContent = '';
      containerPromo.classList.add('hide');
      restaurants.classList.add('hide');
      menu.classList.remove('hide');

      const { name, kitchen, price, stars } = restaurant.info;

      restaurantTitle.textContent = name;
      restaurantRating.textContent = stars;
      restaurantPrice.textContent = `от ${price}$`;
      restaurantCategory.textContent = kitchen;

      getData(`./../db/${restaurant.products}`).then(data => {
        data.forEach(createCardGood);
      });
    }
  } else {
    toggleModalAuth();
  }
};

const addToCart = e => {
  const target = e.target;
  const buttonAddToCart = target.closest('.button-add-cart');
  if (buttonAddToCart) {
    const card = target.closest('.card');
    const title = card.querySelector('.card-title-reg').textContent;
    const cost = card.querySelector('.card-price-bold').textContent;
    const id = buttonAddToCart.id;
    const food = cart.find(item => {
      return item.id === id;
    });
    if (food) {
      food.count += 1;
    } else {
      cart.push({ id, title, cost, count: 1 });
    }

    console.log(cart);
  }
};

const renderCart = () => {
  modalBody.textContent = '';
  cart.forEach(({ id, title, cost, count }) => {
    const itemCart = `
      <div class="food-row">
        <span class="food-name">${title}</span>
        <strong class="food-price">${cost}</strong>
        <div class="food-counter">
          <button class="counter-button counter-minus" data-id=${id}>-</button>
          <span class="counter">${count}</span>
          <button class="counter-button counter-plus" data-id=${id}>+</button>
        </div>
      </div>
    `;
    modalBody.insertAdjacentHTML('afterbegin', itemCart);
  });
  const totalPrice = cart.reduce((result, item) => {
    return result + parseFloat(item.cost) * item.count;
  }, 0);

  modalPrice.textContent = totalPrice + ' $';
};

const chengeCount = e => {
  const target = e.target;

  if (target.classList.contains('counter-button')) {
    const food = cart.find(item => {
      return item.id === target.dataset.id;
    });
    if (target.classList.contains('counter-minus')) {
      food.count--;
      if (food.count === 0) {
        cart.splice(cart.indexOf(food), 1);
      }
    }
    if (target.classList.contains('counter-plus')) {
      food.count++;
    }

    renderCart();
  }
};

const init = () => {
  getData('./../db/partners.json').then(data => {
    data.forEach(createCardRestaurant);
  });

  modalBody.addEventListener('click', chengeCount);

  clearCart.addEventListener('click', () => {
    cart.length = 0;
    renderCart();
  });

  cardsRestaurants.addEventListener('click', openGoods);
  logo.addEventListener('click', function () {
    containerPromo.classList.remove('hide');
    restaurants.classList.remove('hide');
    menu.classList.add('hide');
  });
  cartButton.addEventListener('click', () => {
    renderCart();
    toggleModal();
  });

  cardsMenu.addEventListener('click', addToCart);

  close.addEventListener('click', toggleModal);

  checkAuth();

  inputSearch.addEventListener('keypress', e => {
    if (e.charCode === 13) {
      const value = e.target.value;
      if (value.trim()) {
        getData('./../db/partners.json')
          .then(data => {
            return data.map(partner => {
              return partner.products;
            });
          })
          .then(linksProducts => {
            cardsMenu.textContent = '';

            linksProducts.forEach(link => {
              getData(`./../db/${link}`).then(data => {
                const resultSearch = data.filter(item => {
                  return item.name.toLowerCase().includes(value.toLowerCase());
                });

                containerPromo.classList.add('hide');
                restaurants.classList.add('hide');
                menu.classList.remove('hide');

                restaurantTitle.textContent = 'результат поиска';
                restaurantRating.textContent = '';
                restaurantPrice.textContent = '';
                restaurantCategory.textContent = 'разная кухня';

                resultSearch.forEach(createCardGood);
              });
            });
          });
      } else {
        e.target.value = '';
        return;
      }
    }
  });
};
init();
