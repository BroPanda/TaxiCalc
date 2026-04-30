

document.addEventListener('DOMContentLoaded', () => {
    // Елементи навігації
    const navItems = document.querySelectorAll('.nav-item');
    const views = document.querySelectorAll('.view');
    const pageTitle = document.getElementById('page-title');

    // Елементи вводу
    const carValueInput = document.getElementById('car-value');
    const consumptionInput = document.getElementById('consumption');
    const fuelPriceInput = document.getElementById('fuel-price');

    const tripDistanceInput = document.getElementById('trip-distance');
    const clientDistanceInput = document.getElementById('client-distance');
    const returnEmptyCheckbox = document.getElementById('return-empty');

    const orderValueInput = document.getElementById('order-value');
    const commissionInput = document.getElementById('commission');

    const expensesContainer = document.getElementById('dynamic-expenses-container');
    const btnAddExpense = document.getElementById('btn-add-expense');
    const settingsTotalExtra = document.getElementById('settings-total-extra');

    let extraExpensesList = [];

    const btnCalculate = document.getElementById('btn-calculate');
    const resultsCard = document.getElementById('results-card');

    // Елементи виводу результатів
    const resNetProfit = document.getElementById('res-net-profit');
    const resTotalExpenses = document.getElementById('res-total-expenses');
    const resCommission = document.getElementById('res-commission');
    const resAmortization = document.getElementById('res-amortization');
    const resFuel = document.getElementById('res-fuel');
    const resExtra = document.getElementById('res-extra');

    // Завантаження налаштувань при старті
    loadSettings();

    // Логіка навігації
    navItems.forEach(item => {
        item.addEventListener('click', () => {
            // Оновлення активної кнопки
            navItems.forEach(nav => nav.classList.remove('active'));
            item.classList.add('active');

            // Оновлення активного вікна
            const targetId = item.getAttribute('data-target');
            views.forEach(view => view.classList.remove('active'));
            document.getElementById(targetId).classList.add('active');

            // Оновлення заголовку
            pageTitle.textContent = targetId === 'calculator-view' ? 'Калькулятор поїздки' : 'Налаштування';
        });
    });

    // Збереження налаштувань (Автоматичне)
    function saveSettings() {
        const settings = {
            carValue: parseFloat(carValueInput.value) || 0,
            consumption: parseFloat(consumptionInput.value) || 0,
            fuelPrice: parseFloat(fuelPriceInput.value) || 0,
            extraExpensesList: extraExpensesList
        };
        localStorage.setItem('taxiSettings', JSON.stringify(settings));
    }

    [carValueInput, consumptionInput, fuelPriceInput].forEach(input => {
        input.addEventListener('input', saveSettings);
    });

    // Управління списком додаткових витрат
    function renderExpenses() {
        expensesContainer.innerHTML = '';
        extraExpensesList.forEach(expense => {
            const item = document.createElement('div');
            item.className = 'expense-item';
            item.innerHTML = `
                <div class="expense-header">
                    <input type="text" value="${expense.name}" placeholder="Назва витрати" data-id="${expense.id}" class="expense-name-input">
                    <button type="button" class="delete-expense-btn" data-id="${expense.id}">
                        <i data-lucide="trash-2"></i>
                    </button>
                </div>
                <div class="expense-fields">
                    <div class="input-group">
                        <label>Вартість (грн)</label>
                        <input type="number" value="${expense.cost}" placeholder="Напр: 500" data-id="${expense.id}" class="expense-cost-input" min="0">
                    </div>
                    <div class="input-group">
                        <label>Дистанція (км)</label>
                        <input type="number" value="${expense.distance}" placeholder="Напр: 10000" data-id="${expense.id}" class="expense-distance-input" min="1">
                    </div>
                </div>
            `;
            expensesContainer.appendChild(item);
        });

        // Перемальовуємо іконки
        if (typeof lucide !== 'undefined') {
            lucide.createIcons();
        }

        // Обробники подій
        document.querySelectorAll('.delete-expense-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const id = e.currentTarget.getAttribute('data-id');
                extraExpensesList = extraExpensesList.filter(exp => exp.id != id);
                saveSettings();
                renderExpenses();
            });
        });

        document.querySelectorAll('.expense-name-input').forEach(input => {
            input.addEventListener('change', (e) => {
                const id = e.target.getAttribute('data-id');
                const exp = extraExpensesList.find(exp => exp.id == id);
                if (exp) {
                    exp.name = e.target.value;
                    saveSettings();
                }
            });
        });

        document.querySelectorAll('.expense-cost-input').forEach(input => {
            input.addEventListener('input', (e) => {
                const id = e.target.getAttribute('data-id');
                const exp = extraExpensesList.find(exp => exp.id == id);
                if (exp) {
                    exp.cost = e.target.value;
                    updateSettingsTotalExtra();
                    saveSettings();
                }
            });
        });

        document.querySelectorAll('.expense-distance-input').forEach(input => {
            input.addEventListener('input', (e) => {
                const id = e.target.getAttribute('data-id');
                const exp = extraExpensesList.find(exp => exp.id == id);
                if (exp) {
                    exp.distance = e.target.value;
                    updateSettingsTotalExtra();
                    saveSettings();
                }
            });
        });

        updateSettingsTotalExtra();
    }

    function updateSettingsTotalExtra() {
        if (!settingsTotalExtra) return;
        let extraPerKm = 0;
        extraExpensesList.forEach(exp => {
            const cost = parseFloat(exp.cost) || 0;
            const dist = parseFloat(exp.distance) || 0;
            if (dist > 0) {
                extraPerKm += (cost / dist);
            }
        });
        const total100k = extraPerKm * 100000;
        settingsTotalExtra.textContent = total100k.toFixed(2) + ' грн';
    }

    btnAddExpense.addEventListener('click', () => {
        extraExpensesList.push({
            id: Date.now(),
            name: '',
            cost: '',
            distance: ''
        });
        saveSettings();
        renderExpenses();
    });

    // Розрахунок
    btnCalculate.addEventListener('click', () => {
        // Отримання налаштувань
        const carValue = parseFloat(carValueInput.value) || 0;
        const consumption = parseFloat(consumptionInput.value) || 0;
        const fuelPrice = parseFloat(fuelPriceInput.value) || 0;

        // Отримання даних поїздки
        const tripDistance = parseFloat(tripDistanceInput.value) || 0;
        const clientDistance = parseFloat(clientDistanceInput.value) || 0;
        let distance = tripDistance + clientDistance;

        if (returnEmptyCheckbox.checked) {
            distance *= 2;
        }

        const orderValue = parseFloat(orderValueInput.value) || 0;
        const commissionPct = parseFloat(commissionInput.value) || 0;

        // Валідація
        if (distance <= 0) {
            alert('Будь ласка, введіть коректну дистанцію.');
            return;
        }

        // Розрахунки
        // Амортизація за 1 км = вартість авто / 100000
        const amortizationPerKm = carValue / 100000;
        const totalAmortization = amortizationPerKm * distance;

        // Витрати на пальне/енергію за 1 км = (витрата * ціна) / 100
        const fuelPerKm = (consumption * fuelPrice) / 100;
        const totalFuel = fuelPerKm * distance;

        // Додаткові витрати
        let extraPerKm = 0;
        extraExpensesList.forEach(exp => {
            const cost = parseFloat(exp.cost) || 0;
            const dist = parseFloat(exp.distance) || 0;
            if (dist > 0) {
                extraPerKm += (cost / dist);
            }
        });
        const totalExtra = extraPerKm * distance;

        // Комісія
        const totalCommission = (orderValue * commissionPct) / 100;

        // Загальні витрати та прибуток
        const totalExpenses = totalAmortization + totalFuel + totalCommission + totalExtra;
        const netProfit = orderValue - totalExpenses;

        // Вивід результатів
        resAmortization.textContent = totalAmortization.toFixed(2) + ' грн';
        resFuel.textContent = totalFuel.toFixed(2) + ' грн';
        resCommission.textContent = totalCommission.toFixed(2) + ' грн';
        resExtra.textContent = totalExtra.toFixed(2) + ' грн';

        resTotalExpenses.textContent = totalExpenses.toFixed(2) + ' грн';
        resNetProfit.textContent = netProfit.toFixed(2) + ' грн';

        if (netProfit >= 0) {
            resNetProfit.className = 'highlight-green';
        } else {
            resNetProfit.className = 'highlight-red';
        }

        // Відображення картки з результатами
        resultsCard.style.display = 'block';
        resultsCard.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    });

    // Функція завантаження налаштувань
    function loadSettings() {
        const saved = localStorage.getItem('taxiSettings');
        if (saved) {
            try {
                const settings = JSON.parse(saved);
                carValueInput.value = settings.carValue || '';
                consumptionInput.value = settings.consumption || '';
                fuelPriceInput.value = settings.fuelPrice || '';
                if (settings.extraExpensesList && Array.isArray(settings.extraExpensesList) && settings.extraExpensesList.length > 0) {
                    extraExpensesList = settings.extraExpensesList;
                } else {
                    // Стандартні витрати, якщо список порожній
                    extraExpensesList = [
                        { id: Date.now() + 1, name: 'Мийка авто', cost: 700, distance: 500 },
                        { id: Date.now() + 2, name: 'Мастила та фільтри', cost: 2000, distance: 10000 },
                        { id: Date.now() + 3, name: 'Омивач', cost: 300, distance: 2000 },
                        { id: Date.now() + 4, name: 'Ходова частина', cost: 15000, distance: 50000 }
                    ];
                    saveSettings();
                }
            } catch (e) {
                console.error('Помилка завантаження налаштувань', e);
            }
        } else {
            // Якщо налаштувань ще немає взагалі, також ставимо стандартні
            extraExpensesList = [
                { id: Date.now() + 1, name: 'Мийка авто', cost: 700, distance: 500 },
                { id: Date.now() + 2, name: 'Мастила та фільтри', cost: 2000, distance: 10000 },
                { id: Date.now() + 3, name: 'Омивач', cost: 300, distance: 2000 },
                { id: Date.now() + 4, name: 'Ходова частина', cost: 15000, distance: 50000 }
            ];
            saveSettings();
        }
        renderExpenses();
    }
});
