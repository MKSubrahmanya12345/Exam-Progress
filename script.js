const categoriesContainer = document.getElementById('categories');
const deletedBarsContainer = document.getElementById('deleted-bars');
const aggregateProgress = document.getElementById('aggregate-progress');

// Data Storage
let categories = JSON.parse(localStorage.getItem('categories')) || [];
let deletedBars = JSON.parse(localStorage.getItem('deletedBars')) || [];

// Save data to localStorage
function saveData() {
    localStorage.setItem('categories', JSON.stringify(categories));
    localStorage.setItem('deletedBars', JSON.stringify(deletedBars));
}

// Render Categories
function renderCategories() {
    categoriesContainer.innerHTML = '';
    categories.forEach((category, categoryIndex) => {
        const categoryDiv = document.createElement('div');
        categoryDiv.className = 'category';

        const progressBarsHTML = category.progressBars
            .map((bar, barIndex) => {
                const percentage = calculatePercentage(bar.pagesDone, bar.totalPages);
                return `
                    <div class="progress-bar-container">
                        <div>${bar.name}</div>
                        <div>
                            <label>Pages Done: </label>
                            <input type="number" value="${bar.pagesDone}" 
                                onchange="updatePagesDone(${categoryIndex}, ${barIndex}, this.value)" />
                            <label>Total Pages: </label>
                            <input type="number" value="${bar.totalPages}" 
                                onchange="updateTotalPages(${categoryIndex}, ${barIndex}, this.value)" />
                        </div>
                        <div class="progress-bar-wrapper">
                            <div class="progress-bar" style="width: ${percentage}%">${percentage}%</div>
                        </div>
                        <button onclick="deleteProgressBar(${categoryIndex}, ${barIndex})">Delete</button>
                    </div>
                `;
            })
            .join('');

        categoryDiv.innerHTML = `
            <h2>${category.name}</h2>
            <div class="subcategories">
                <button onclick="addProgressBar(${categoryIndex})">Add Progress Bar</button>
                ${progressBarsHTML}
            </div>
        `;

        categoriesContainer.appendChild(categoryDiv);
    });

    updateAggregateProgress();
}

// Render Deleted Bars
function renderDeletedBars() {
    deletedBarsContainer.innerHTML = '';

    deletedBars.forEach((deletedBar, index) => {
        const barDiv = document.createElement('div');
        barDiv.className = 'progress-bar-container';
        barDiv.innerHTML = `
            <div>${deletedBar.name}</div>
            <button onclick="restoreDeletedBar(${index})">Undo</button>
            <button onclick="permanentlyDeleteBar(${index})">Permanently Delete</button>
        `;
        deletedBarsContainer.appendChild(barDiv);
    });
}

// Add New Category
function addCategory() {
    const name = prompt('Enter category name:');
    if (name) {
        categories.push({ name, progressBars: [] });
        saveData();
        renderCategories();
    }
}

// Add Progress Bar to a Category
function addProgressBar(categoryIndex) {
    const name = prompt('Enter progress bar name:');
    if (name) {
        categories[categoryIndex].progressBars.push({ name, pagesDone: 0, totalPages: 1 });
        saveData();
        renderCategories();
    }
}

// Update Pages Done
function updatePagesDone(categoryIndex, barIndex, value) {
    categories[categoryIndex].progressBars[barIndex].pagesDone = Math.max(0, parseInt(value, 10) || 0);
    saveData();
    renderCategories();
}

// Update Total Pages
function updateTotalPages(categoryIndex, barIndex, value) {
    const newTotal = Math.max(1, parseInt(value, 10) || 1);
    categories[categoryIndex].progressBars[barIndex].totalPages = newTotal;
    saveData();
    renderCategories();
}

// Delete Progress Bar (Move to Deleted Section)
function deleteProgressBar(categoryIndex, barIndex) {
    const deletedBar = categories[categoryIndex].progressBars.splice(barIndex, 1)[0];
    deletedBars.push({ ...deletedBar, categoryIndex });
    saveData();
    renderCategories();
    renderDeletedBars();
}

// Restore Deleted Progress Bar
function restoreDeletedBar(index) {
    const bar = deletedBars.splice(index, 1)[0];
    categories[bar.categoryIndex].progressBars.push(bar);
    saveData();
    renderCategories();
    renderDeletedBars();
}

// Permanently Delete Progress Bar
function permanentlyDeleteBar(index) {
    deletedBars.splice(index, 1);
    saveData();
    renderDeletedBars();
}

// Calculate Percentage
function calculatePercentage(done, total) {
    return Math.min(100, Math.round((done / total) * 100));
}

// Update Aggregate Progress
function updateAggregateProgress() {
    let totalBars = 0;
    let totalProgress = 0;

    categories.forEach((category) => {
        category.progressBars.forEach((bar) => {
            totalBars++;
            totalProgress += calculatePercentage(bar.pagesDone, bar.totalPages);
        });
    });

    const avgProgress = totalBars > 0 ? Math.round(totalProgress / totalBars) : 0;
    aggregateProgress.textContent = `Total Progress: ${avgProgress}%`;
}

// Initial Render
renderCategories();
renderDeletedBars();
