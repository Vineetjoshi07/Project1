
document.addEventListener('DOMContentLoaded', function() {
    
    const homePage = document.getElementById('home-page');
    const expenseListPage = document.getElementById('expense-list-page');
    const expenseForm = document.getElementById('expense-form');
    const recentExpensesList = document.getElementById('recent-expenses');
    const fullExpenseList = document.getElementById('full-expense-list');
    const totalExpensesElement = document.getElementById('total-expenses');
    const viewAllBtn = document.getElementById('view-all-btn');
    const backBtn = document.getElementById('back-btn');
    const filterBtn = document.getElementById('filter-btn');
    const resetFiltersBtn = document.getElementById('reset-filters-btn');
    const expenseChartCtx = document.getElementById('expense-chart').getContext('2d');

    
    let expenseChart = new Chart(expenseChartCtx, {
        type: 'pie',
        data: {
            labels: [],
            datasets: [{
                data: [],
                backgroundColor: [
                    '#FF6384',
                    '#36A2EB',
                    '#FFCE56',
                    '#4BC0C0',
                    '#9966FF',
                    '#FF9F40',
                    '#8AC24A',
                    '#607D8B',
                    '#E91E63'
                ]
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false
        }
    });

    
    document.getElementById('expense-date').valueAsDate = new Date();

    // Load expenses from localStorage
    let expenses = JSON.parse(localStorage.getItem('expenses')) || [];

    
    renderRecentExpenses();
    updateTotalExpenses();

    // Add new expense
    expenseForm.addEventListener('submit', function(e) {
        e.preventDefault();

        const name = document.getElementById('expense-name').value;
        const amount = parseFloat(document.getElementById('expense-amount').value);
        const category = document.getElementById('expense-category').value;
        const date = document.getElementById('expense-date').value;

        if (!name || isNaN(amount) || !category || !date) {
            alert('Please fill all fields correctly');
            return;
        }

        const expense = {
            id: Date.now(),
            name,
            amount,
            category,
            date
        };

        expenses.push(expense);
        saveExpenses();
        renderRecentExpenses();
        updateTotalExpenses();

        
        expenseForm.reset();
        document.getElementById('expense-date').valueAsDate = new Date();
    });

    
    viewAllBtn.addEventListener('click', function() {
        homePage.style.display = 'none';
        expenseListPage.style.display = 'block';
        renderFullExpenseList(expenses);
        updateChart();
        resetFilters();
    });

    
    backBtn.addEventListener('click', function() {
        homePage.style.display = 'block';
        expenseListPage.style.display = 'none';
    });

    
    filterBtn.addEventListener('click', function() {
        const category = document.getElementById('filter-category').value;
        const startDate = document.getElementById('filter-start-date').value;
        const endDate = document.getElementById('filter-end-date').value;

        let filteredExpenses = [...expenses];

        if (category) {
            filteredExpenses = filteredExpenses.filter(exp => exp.category === category);
        }

        if (startDate) {
            filteredExpenses = filteredExpenses.filter(exp => exp.date >= startDate);
        }

        if (endDate) {
            filteredExpenses = filteredExpenses.filter(exp => exp.date <= endDate);
        }

        renderFullExpenseList(filteredExpenses);
    });

    
    resetFiltersBtn.addEventListener('click', function() {
        resetFilters();
        renderFullExpenseList(expenses);
    });

    
    fullExpenseList.addEventListener('click', function(e) {
        if (e.target.classList.contains('delete-btn')) {
            const expenseId = parseInt(e.target.closest('tr').getAttribute('data-id'));
            expenses = expenses.filter(exp => exp.id !== expenseId);
            saveExpenses();
            renderRecentExpenses();
            renderFullExpenseList(expenses);
            updateTotalExpenses();
            updateChart();
        }
    });

    
    recentExpensesList.addEventListener('click', function(e) {
        if (e.target.classList.contains('delete-btn')) {
            const expenseId = parseInt(e.target.closest('li').getAttribute('data-id'));
            expenses = expenses.filter(exp => exp.id !== expenseId);
            saveExpenses();
            renderRecentExpenses();
            updateTotalExpenses();
        }
    });

    
    function renderRecentExpenses() {
        if (expenses.length === 0) {
            recentExpensesList.innerHTML = '<li class="no-expenses">No expenses added yet. Add your first expense!</li>';
            return;
        }

      
        const sortedExpenses = [...expenses].sort((a, b) => new Date(b.date) - new Date(a.date));
        const recentExpenses = sortedExpenses.slice(0, 4);

        recentExpensesList.innerHTML = '';
        recentExpenses.forEach(expense => {
            const li = document.createElement('li');
            li.className = 'expense-item';
            li.setAttribute('data-id', expense.id);

            li.innerHTML = `
                <div class="expense-details">
                    <span class="expense-category">${expense.category}</span>
                    <strong>${expense.name}</strong>
                    <div class="expense-date">${formatDate(expense.date)}</div>
                </div>
                <div class="expense-amount">₹${expense.amount.toFixed(2)}</div>
                <div class="expense-actions">
                    <button class="delete-btn btn-danger">Delete</button>
                </div>
            `;

            recentExpensesList.appendChild(li);
        });
    }

    function renderFullExpenseList(expensesToRender) {
        if (expensesToRender.length === 0) {
            fullExpenseList.innerHTML = `
                <tr>
                    <td colspan="5" class="no-expenses">No expenses found</td>
                </tr>
            `;
            return;
        }

        fullExpenseList.innerHTML = '';
        
        
        const sortedExpenses = [...expensesToRender].sort((a, b) => new Date(b.date) - new Date(a.date));

        sortedExpenses.forEach(expense => {
            const tr = document.createElement('tr');
            tr.setAttribute('data-id', expense.id);

            tr.innerHTML = `
                <td>${formatDate(expense.date)}</td>
                <td>${expense.name}</td>
                <td><span class="expense-category">${expense.category}</span></td>
                <td>₹${expense.amount.toFixed(2)}</td>
                <td><button class="delete-btn btn-danger">Delete</button></td>
            `;

            fullExpenseList.appendChild(tr);
        });
    }

    function updateTotalExpenses() {
        const total = expenses.reduce((sum, expense) => sum + expense.amount, 0);
        totalExpensesElement.textContent = `₹${total.toFixed(2)}`;
    }

    function updateChart() {
        const categories = {};
        expenses.forEach(expense => {
            if (categories[expense.category]) {
                categories[expense.category] += expense.amount;
            } else {
                categories[expense.category] = expense.amount;
            }
        });

        expenseChart.data.labels = Object.keys(categories);
        expenseChart.data.datasets[0].data = Object.values(categories);
        expenseChart.update();
    }

    function saveExpenses() {
        localStorage.setItem('expenses', JSON.stringify(expenses));
    }

    function formatDate(dateString) {
        const options = { year: 'numeric', month: 'short', day: 'numeric' };
        return new Date(dateString).toLocaleDateString(undefined, options);
    }

    function resetFilters() {
        document.getElementById('filter-category').value = '';
        document.getElementById('filter-start-date').value = '';
        document.getElementById('filter-end-date').value = '';
    }
});