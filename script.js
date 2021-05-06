const randomMeals = document.querySelector('.meals'); // находим элементы куда будем выводить инфу
const favoritList = document.querySelector('.favorit__list');
const searchInput = document.querySelector('.search__input');
const searchButton = document.querySelector('.search__button');
const mealInfo = document.querySelector('.meal__info');
const popup = document.querySelector('.popup__info-container');
const buttonPopup = document.querySelector('.close__popup');

// получение данных из апи
async function getRandomMeal() { // рандомный блюдо
    const resp = await fetch("https://www.themealdb.com/api/json/v1/1/random.php");
    const responseData = await resp.json();
    const randomMeal = responseData.meals[0];
    console.log('randomMeal: ', randomMeal);

    addMeal(randomMeal, true);
}

async function getMealsById(id) {  // блюдо по id
    const resp = await fetch("https://www.themealdb.com/api/json/v1/1/lookup.php?i=" + id);

    const responseData = await resp.json();
    const meal = responseData.meals[0];

    return meal;
}

async function getMealsBySearch(term) { // блюдо по ключевому слову
    const resp = await fetch("https://www.themealdb.com/api/json/v1/1/search.php?s=" + term);

    const responseData = await resp.json();
    const meals = responseData.meals;

    return meals;
}

getRandomMeal(); // запуск функций
fetchFavoriteMeals();

function addMeal(mealData, random = false) {  // вывод рандомного блюда на страницу
    const meal = document.createElement('div'); // создаем div
    meal.classList.add('meal'); // добавляем divу класс 
    // в добавленый элемент вставляем разметку с полученым блюдом
    meal.innerHTML = ` 
    <div class="meal__header">
    ${random ? `<span>Случайный рецепт</span>` : ''}
        <img
        src="${mealData.strMealThumb}"
        alt="${mealData.strMeal}"
        class="meal__img"
        />
    </div>
    <div class="meal__body">
        <h4>${mealData.strMeal} <span>${mealData.strCategory}</span></h4>
        <button class="meal__btn">
            <i class="fa fa-heart"></i>
        </button>
    </div>
    `;

    const btn = meal.querySelector('.meal__body .meal__btn'); // на кнопку вешаем прослушиватель клика
    btn.addEventListener('click', () => {

        if (btn.classList.contains('active')) {  // если у блюда есть класс актив, удаляем блюдо из локал стоража и убираем класс актив
            removeMealLocalStorage(mealData.idMeal);
            btn.classList.remove('active');
        } else { // если нет класса актив то блюдо добавить в ЛС(локалСторадже) и добавляем класс актив
            addMealLocalStorage(mealData.idMeal);
            btn.classList.add('active');
        }

        fetchFavoriteMeals(); // запускаем функцию вывода любимых блюд
    });

    const mealHeader = meal.querySelector('.meal__header');
    mealHeader.addEventListener('click', () => { // на блюда вешаем прослушиватель
        showMealInfo(mealData); // выводим рецепт блюда
    });

    randomMeals.appendChild(meal); // вставляем картоку блюда в блок
}

function addMealLocalStorage(mealId) { // добавляем блюдо в ЛС передавая ID
    const mealIds = getMealsLocalStorage(); // запрашиваем из ЛС добавленные блюда

    localStorage.setItem(
        'mealIds',
        JSON.stringify([...mealIds, mealId])); // дописываем в массив ID
}

function removeMealLocalStorage(mealId) { // убираем блюдо из ЛС
    const mealIds = getMealsLocalStorage(); // запрашиваем из ЛС любимые блюда

    localStorage.setItem(
        'mealIds',
        JSON.stringify(mealIds.filter((id) => id !== mealId))); // методом filter() убираем ID если они совпадают
}

function getMealsLocalStorage() { // функция возврата массива любимых блюд
    const mealIds = JSON.parse(localStorage.getItem('mealIds'));

    return mealIds === null ? [] : mealIds;
}

async function fetchFavoriteMeals() { // 
    favoritList.innerHTML = ''; // отчишаем блок с любимыми блюдами

    const mealsIds = getMealsLocalStorage(); // получаем из ЛС
    const meals = []; // пустой массив

    for (let i = 0; i < mealsIds.length; i++) {
        const mealId = mealsIds[i];

        meal = await getMealsById(mealId);
        meals.push(meal); // добавляем в массив ID блюд

        addMealFavorite(meal);  // вывод любимых блюд
    }
}

function addMealFavorite(mealData) { // вывод любимого блюда на сайт
    const favMeal = document.createElement('li');

    favMeal.innerHTML = `
    <img
        src="${mealData.strMealThumb}"
        alt="${mealData.strMeal}"
    />
    <span>${mealData.strMeal}</span>
    <button class="favorit__clear">
        <i class="fas fa-window-close"></i>
    </button>
    `;

    const btn = favMeal.querySelector('.favorit__clear'); // кнопка для удаления из любимых блюд

    btn.addEventListener('click', () => {
        removeMealLocalStorage(mealData.idMeal); // удалить блюдо из ЛС

        fetchFavoriteMeals(); // перерисовать вывод любимых блюд
    });

    favMeal.addEventListener('click', () => { // обработчик, при нажатии вывести инфо о блюде
        showMealInfo(mealData);
    });

    favoritList.appendChild(favMeal); // выводим любимые блюда
}

function showMealInfo(mealData) {  // вывод рецепта блюда
    mealInfo.innerHTML = '';
    const mealInfoElement = document.createElement('div');

    const ingredients = []; // создаем массив с ингридиентами
    for (let i = 1; i <= 20; i++) {
        if (mealData['strIngredient' + i]) { // если ещё есть ингридиенты
            ingredients.push(`${mealData['strIngredient' + i]} - ${mealData['strMeasure' + i]}`); // добавить в массив строку ингридиент - количество
        } else {
            break; // нет ингридиентов закончить цикл
        }

    }
    // вывод на страницу, рецепт блюда
    mealInfoElement.innerHTML = ` 
        <h1 class="meal__title">${mealData.strMeal}</h1>
        <img
            src="${mealData.strMealThumb}"
            alt="${mealData.strMeal}"
            class="meal__img"
        />
        <p class="meal__text">
            ${marked(mealData.strInstructions)}
        </p>
        <h3>Ingredients / Measure</h3>
        <ul class="meal__ingredients">
            ${ingredients.map((ingredient) => `
            <li><span class="ingredient">${ingredient}</span></li>`).join('')}
        </ul >
        `;

    mealInfo.appendChild(mealInfoElement);
    popup.classList.remove('hidden'); // убрать класс для отображения на странице
}

searchButton.addEventListener('click', async () => { // по кнопке поиска
    randomMeals.innerHTML = ''; // очистить вывод блюд

    const search = searchInput.value; // получаем значение из инпута поиска

    const meals = await getMealsBySearch(search); // присваиваем все найденные блюда

    if (meals) { // выводим найденные блюда пока они есть
        meals.forEach((meal) => {
            addMeal(meal);
        });
        searchInput.value = '';
    }
});

buttonPopup.addEventListener('click', () => { // кнопка закрытия окна
    popup.classList.add('hidden');
});