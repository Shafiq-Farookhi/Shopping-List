
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
    const itemList = document.getElementById('item-list');
    const itemClear = document.getElementById('clear');
    const itemFilter = document.getElementById('filter');
    let isEditMode = false;
    const formBtn = itemForm.querySelector('button');

    function displayItems() {
        const itemsFromStorage = getItemsFromStorage();
        itemsFromStorage.forEach(item => addItemToDOM(item));
        checkUI();
    }

    function onAddItemSubmit(e) {
        e.preventDefault();
        const newItem = itemInput.value;
    
        if (newItem === '') {
            showCustomAlert('Please add an item');
            return;
        }
    
        if (isEditMode) {
            // Find the item being edited
            const itemToEdit = itemList.querySelector('.edit-mode');
            
            // Update the item's text content directly
            const originalText = itemToEdit.textContent;
            itemToEdit.textContent = newItem;
    
            // Add the remove button back since textContent overwrites inner HTML
            const button = createButton('remove-item btn-link text-red');
            itemToEdit.appendChild(button);
            
            // Update item in local storage without removing it
            updateItemInStorage(originalText, newItem);
    
            // Remove the edit mode class
            itemToEdit.classList.remove('edit-mode');
            isEditMode = false;
        } else {
            if (checkIfItemExists(newItem)) {
                showCustomAlert('That item already exists!');
                return;
            }
    
            // Create item DOM element for new items
            addItemToDOM(newItem);
            addItemToStorage(newItem);
        }
    
        checkUI();
        itemInput.value = '';
    }



    function updateItemInStorage(originalItem, updatedItem) {
        let itemsFromStorage = getItemsFromStorage();
    
        // Find the index of the original item and update it
        const itemIndex = itemsFromStorage.indexOf(originalItem);
        if (itemIndex !== -1) {
            itemsFromStorage[itemIndex] = updatedItem;
        }
    
        // Save the updated array back to local storage
        localStorage.setItem('items', JSON.stringify(itemsFromStorage));
    }
    



    

    function addItemToDOM(item) {
        const li = document.createElement('li');
        li.appendChild(document.createTextNode(item));
        const button = createButton('remove-item btn-link text-red');
        li.appendChild(button);
        itemList.appendChild(li);
    }

    function createButton(classes) {
        const button = document.createElement('button');
        button.className = classes;
        const icon = createIcon('fa-solid fa-xmark');
        button.appendChild(icon);
        return button;
    }

    function createIcon(classes) {
        const icon = document.createElement('i');
        icon.className = classes;
        return icon;
    }

    function addItemToStorage(item) {
        let itemsFromStorage = getItemsFromStorage();
        itemsFromStorage.push(item);
        localStorage.setItem('items', JSON.stringify(itemsFromStorage));
    }

    function getItemsFromStorage() {
        let itemsFromStorage;
        if (localStorage.getItem('items') === null) {
            itemsFromStorage = [];
        } else {
            itemsFromStorage = JSON.parse(localStorage.getItem('items'));
        }
        return itemsFromStorage;
    }

    function onClickItem(e) {
        if (e.target.tagName === 'LI') {
            setItemToEdit(e.target);
        } else if (e.target.parentElement.classList.contains('remove-item')) {
            removeItem(e.target.parentElement.parentElement);
        }
    }
    

    function checkIfItemExists(item) {
        const itemsFromStorage = getItemsFromStorage();
        return itemsFromStorage.includes(item);
    }

    function setItemToEdit(item) {
        isEditMode = true;
        itemList.querySelectorAll('li').forEach(item => item.classList.remove('edit-mode'));
        item.classList.add('edit-mode');
        formBtn.innerHTML = '<i class="fa-solid fa-pen"></i> Update Item';
        itemInput.value = item.textContent;
        formBtn.style.backgroundColor = '#228B22';
    }

    function removeItem(item) {
        showCustomConfirm('Are you sure?', function (userConfirmed) {
            if (userConfirmed) {
                item.remove();
                removeItemFromStorage(item.textContent);
                checkUI();
            }
        });
    }

    function removeItemFromStorage(item) {
        let itemsFromStorage = getItemsFromStorage();
        itemsFromStorage = itemsFromStorage.filter((i) => i !== item);
        localStorage.setItem('items', JSON.stringify(itemsFromStorage));
    }

    function clearItems(e) {

        showCustomConfirm('Are you sure you want to clear all items?',function (response) {
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

    function checkUI() {
        itemInput.value = '';
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

    function init() {
        itemForm.addEventListener('submit', onAddItemSubmit);
        itemList.addEventListener('click', onClickItem);
        itemClear.addEventListener('click', clearItems);
        itemFilter.addEventListener('input', filterItems);
        document.addEventListener('DOMContentLoaded', displayItems);
        checkUI();
    }

    init();
