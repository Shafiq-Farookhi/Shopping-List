// Custom alert function
function showCustomAlert(message) {
    document.getElementById('alertMessage').textContent = message;
    document.getElementById('customAlert').style.display = 'block';
    document.getElementById('overlay').style.display = 'block';
}

function closeCustomAlert() {
    document.getElementById('customAlert').style.display = 'none';
    document.getElementById('overlay').style.display = 'none';
}

// Custom confirmation dialog
let confirmCallback;
function showCustomConfirm(message, callback) {
    document.getElementById('confirmMessage').textContent = message;
    document.getElementById('customConfirm').style.display = 'block';
    document.getElementById('overlay').style.display = 'block';
    confirmCallback = callback;
}

function confirmYes() {
    document.getElementById('customConfirm').style.display = 'none';
    document.getElementById('overlay').style.display = 'none';
    if (confirmCallback) confirmCallback(true);
}

function confirmNo() {
    document.getElementById('customConfirm').style.display = 'none';
    document.getElementById('overlay').style.display = 'none';
    if (confirmCallback) confirmCallback(false);
}

// Main JavaScript code
const itemForm = document.getElementById('item-form');
const itemInput = document.getElementById('item-input');
const amountInput = document.getElementById('amount-input');
const unitInput = document.getElementById('unit-input');
const itemList = document.getElementById('item-list');
const itemClear = document.getElementById('clear');
const itemFilter = document.getElementById('filter');
let isEditMode = false;
const formBtn = itemForm.querySelector('button');

// Display stored items on load
function displayItems() {
    const itemsFromStorage = getItemsFromStorage();
    itemsFromStorage.forEach(item => addItemToDOM(item));
    checkUI();
}

// Handle form submission to add new item or edit existing item
function onAddItemSubmit(e) {
    e.preventDefault();

    const newItem = itemInput.value.trim();
    const amount = amountInput.value.trim();
    const unit = unitInput.value.trim();

    if (newItem === '' || amount === '' || unit === '') {
        showCustomAlert('Please fill in all fields');
        return;
    }

    if (isEditMode) {
        // Find the item being edited
        const itemToEdit = itemList.querySelector('.edit-mode');
        
        // Update the item's text content directly
        const originalText = itemToEdit.dataset.item;
        itemToEdit.textContent = `${newItem} (${amount} ${unit})`;
        
        // Add the remove button back since textContent overwrites inner HTML
        const button = createButton('remove-item btn-link text-red');
        itemToEdit.appendChild(button);
        
        // Update item in local storage without removing it
        updateItemInStorage(originalText, newItem, amount, unit);
        
        // Remove the edit mode class
        itemToEdit.classList.remove('edit-mode');
        isEditMode = false;
    } else {
        if (checkIfItemExists(newItem, amount, unit)) {
            showCustomAlert('That item already exists!');
            return;
        }

        // Create item DOM element for new items
        const item = { name: newItem, amount, unit };
        addItemToDOM(item);
        addItemToStorage(item);
    }

    checkUI();
    itemInput.value = '';
    amountInput.value = '';
    unitInput.value = '';
}

// Update item in local storage
function updateItemInStorage(originalItem, updatedName, updatedAmount, updatedUnit) {
    let itemsFromStorage = getItemsFromStorage();
    const itemIndex = itemsFromStorage.findIndex(item => item.name === originalItem);
    if (itemIndex !== -1) {
        itemsFromStorage[itemIndex] = { name: updatedName, amount: updatedAmount, unit: updatedUnit };
    }
    localStorage.setItem('items', JSON.stringify(itemsFromStorage));
}

// Add item to DOM
function addItemToDOM(item) {
    const li = document.createElement('li');
    li.dataset.item = item.name;  // Store original item name in the dataset for easy reference during edit
    li.appendChild(document.createTextNode(`${item.name} (${item.amount} - ${item.unit})`));
    const button = createButton('remove-item btn-link text-red');
    li.appendChild(button);
    itemList.appendChild(li);
}

// Create a remove button
function createButton(classes) {
    const button = document.createElement('button');
    button.className = classes;
    const icon = createIcon('fa-solid fa-xmark');
    button.appendChild(icon);
    return button;
}

// Create an icon element
function createIcon(classes) {
    const icon = document.createElement('i');
    icon.className = classes;
    return icon;
}

// Add item to local storage
function addItemToStorage(item) {
    let itemsFromStorage = getItemsFromStorage();
    itemsFromStorage.push(item);
    localStorage.setItem('items', JSON.stringify(itemsFromStorage));
}

// Get items from local storage
function getItemsFromStorage() {
    let itemsFromStorage;
    if (localStorage.getItem('items') === null) {
        itemsFromStorage = [];
    } else {
        itemsFromStorage = JSON.parse(localStorage.getItem('items'));
    }
    return itemsFromStorage;
}

// Handle item click (edit or remove)
function onClickItem(e) {
    if (e.target.tagName === 'LI') {
        setItemToEdit(e.target);
    } else if (e.target.parentElement.classList.contains('remove-item')) {
        removeItem(e.target.parentElement.parentElement);
    }
}

// Check if an item exists
function checkIfItemExists(itemName, itemAmount, itemUnit) {
    const itemsFromStorage = getItemsFromStorage();
    return itemsFromStorage.some(item => item.name === itemName && item.amount === itemAmount && item.unit === itemUnit);
}

// Set item to edit
function setItemToEdit(item) {
    isEditMode = true;
    itemList.querySelectorAll('li').forEach(item => item.classList.remove('edit-mode'));
    item.classList.add('edit-mode');
    formBtn.innerHTML = '<i class="fa-solid fa-pen"></i> Update Item';
    const [name, amountWithUnit] = item.textContent.split(' (');
    const [amount, unit] = amountWithUnit.slice(0, -1).split(' ');
    itemInput.value = name;
    amountInput.value = amount;
    unitInput.value = unit;
    formBtn.style.backgroundColor = '#228B22';
}

// Remove item from DOM and local storage
function removeItem(item) {
    showCustomConfirm('Are you sure?', function (userConfirmed) {
        if (userConfirmed) {
            item.remove();
            removeItemFromStorage(item.dataset.item);
            checkUI();
        }
    });
}

// Remove item from local storage
function removeItemFromStorage(itemName) {
    let itemsFromStorage = getItemsFromStorage();
    itemsFromStorage = itemsFromStorage.filter(item => item.name !== itemName);
    localStorage.setItem('items', JSON.stringify(itemsFromStorage));
}

// Clear all items
function clearItems(e) {
    showCustomConfirm('Are you sure you want to clear all items?', function (response) {
        if (response) {
            while (itemList.firstChild) {
                itemList.removeChild(itemList.firstChild);
            }
            localStorage.removeItem('items');
            checkUI();
            showCustomAlert('All items have been cleared!');
        }
    });
}

// Filter items
function filterItems(e) {
    const items = itemList.querySelectorAll('li');
    const text = e.target.value.toLowerCase();
    items.forEach(item => {
        const itemName = item.firstChild.textContent.toLowerCase();
        if (itemName.indexOf(text) != -1) {
            item.style.display = 'flex';
        } else {
            item.style.display = 'none';
        }
    });
}

// Check UI elements visibility
function checkUI() {
    itemInput.value = '';
    amountInput.value = '';
    unitInput.value = '';
    const items = itemList.querySelectorAll('li');
    if (items.length === 0) {
        itemClear.style.display = 'none';
        itemFilter.style.display = 'none';
    } else {
        itemClear.style.display = 'block';
        itemFilter.style.display = 'block';
    }
    formBtn.innerHTML = '<i class="fa-solid fa-plus"></i> Add Item';
    formBtn.style.backgroundColor = '#333';
    isEditMode = false;
}

// Initialize
function init() {
    itemForm.addEventListener('submit', onAddItemSubmit);
    itemList.addEventListener('click', onClickItem);
    itemClear.addEventListener('click', clearItems);
    itemFilter.addEventListener('input', filterItems);
    document.addEventListener('DOMContentLoaded', displayItems);
    checkUI();
}

init();
