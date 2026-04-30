

document.addEventListener('DOMContentLoaded', () => {
    // Елементи навігації
    const navItems = document.querySelectorAll('.nav-item');
    const views = document.querySelectorAll('.view');
    const pageTitle = document.getElementById('page-title');

    // Елементи вводу
    const carValueInput = document.getElementById('car-value');
    const consumptionInput = document.getElementById('consumption');
    const fuelPriceInput = document.getElementById('fuel-price');
    const defaultCommissionInput = document.getElementById('default-commission');

    const tripDistanceInput = document.getElementById('trip-distance');
    const orderValueInput = document.getElementById('order-value');
    const commissionInput = document.getElementById('commission');
    const extraExpensesInput = document.getElementById('extra-expenses');

    const btnSaveSettings = document.getElementById('btn-save-settings');
    const settingsSavedMsg = document.getElementById('settings-saved-msg');
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

    // Збереження налаштувань
    btnSaveSettings.addEventListener('click', () => {
        const settings = {
            carValue: parseFloat(carValueInput.value) || 0,
            consumption: parseFloat(consumptionInput.value) || 0,
            fuelPrice: parseFloat(fuelPriceInput.value) || 0,
            defaultCommission: parseFloat(defaultCommissionInput.value) || 0,
            extraExpenses: parseFloat(extraExpensesInput.value) || 0
        };
        localStorage.setItem('taxiSettings', JSON.stringify(settings));

        // Оновлюємо комісію в калькуляторі, якщо вона є
        if (settings.defaultCommission > 0) {
            commissionInput.value = settings.defaultCommission;
        }

        // Показ повідомлення про збереження
        settingsSavedMsg.style.display = 'block';
        setTimeout(() => {
            settingsSavedMsg.style.display = 'none';
        }, 2000);
    });

    // Розрахунок
    btnCalculate.addEventListener('click', () => {
        // Отримання налаштувань
        const carValue = parseFloat(carValueInput.value) || 0;
        const consumption = parseFloat(consumptionInput.value) || 0;
        const fuelPrice = parseFloat(fuelPriceInput.value) || 0;

        // Отримання даних поїздки
        const distance = parseFloat(tripDistanceInput.value) || 0;
        const orderValue = parseFloat(orderValueInput.value) || 0;
        const commissionPct = parseFloat(commissionInput.value) || 0;
        const extraExpensesTotal = parseFloat(extraExpensesInput.value) || 0;

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

        // Додаткові витрати за 1 км = extraExpensesTotal / 100000
        const extraPerKm = extraExpensesTotal / 100000;
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
                defaultCommissionInput.value = settings.defaultCommission || '';
                commissionInput.value = settings.defaultCommission || '';
                extraExpensesInput.value = settings.extraExpenses || '';
            } catch (e) {
                console.error('Помилка завантаження налаштувань', e);
            }
        }
    }
});
