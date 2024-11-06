const itemForm = document.getElementById('item-form');
const itemInput = document.getElementById('item-input');
const itemList = document.getElementById('item-list');
const itemClear = document.getElementById('clear');
const itemFilter = document.getElementById('filter');

function displayItems() {
    const itemsFromStorage = getItemsFromStorage();
    itemsFromStorage.forEach(item => addItemToDOM(item));
    checkUI();
}

function onAddItemSubmit(e) {
    e.preventDefault();
    const newItem = itemInput.value;

    if (newItem === '') {
        alert('Please add an item');
        return;
    };

        // create item DOM element
    addItemToDOM(newItem);

    // add item to loccal storage
    addItemToStorage(newItem);


    checkUI();

    itemInput.value = '';
}

function addItemToDOM(item) {
     // Create List Item
     const li = document.createElement('li');
     li.appendChild(document.createTextNode(item));
     const button = createButton('remove-item btn-link text-red');
     li.appendChild(button);
     
     // Add li to the DOM
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


    // Add new item to Array
    itemsFromStorage.push(item);

    // convert to JSON string and set to localstorage

    localStorage.setItem('items',JSON.stringify(itemsFromStorage));

}

function getItemsFromStorage() {
    let itemsFromStorage;

    if(localStorage.getItem('items') === null){
        itemsFromStorage = [];
    }else{
        itemsFromStorage = JSON.parse(localStorage.getItem('items'));
    }
    return itemsFromStorage;
    
}

function onClickItem(e) {
    if(e.target.parentElement.classList.contains('remove-item')) {
        removeItem(e.target.parentElement.parentElement);
    }
}

function removeItem(item) {

    if (confirm('Are you sure?')) {
        // remove item from DOM
        item.remove();

        // remove item from storage
        removeItemFromStorage(item.textContent);

        checkUI();
    }

    // if(e.target.parentElement.classList.contains('remove-item')) {
    //     if (confirm('Are you sure?')) {
    //         e.target.parentElement.parentElement.remove();
    //         checkUI();
    //     }
        
    // }
}

function removeItemFromStorage(item) {
    let itemsFromStorage = getItemsFromStorage();

    // filter out items to be removed
    itemsFromStorage = itemsFromStorage.filter((i) => i !== item );

    // re-set to local storge 
    localStorage.setItem('items', JSON.stringify(itemsFromStorage));

}

function clearItems(e) {
    // itemList.innerHTML = '';
    while (itemList.firstChild) {
        itemList.removeChild(itemList.firstChild);
    }
    if (confirm('Are you sure?')) {
    }

    // clear from local storage
    localStorage.removeItem('items');


    checkUI();
}

function filterItems(e)  {
    const items = itemList.querySelectorAll('li');
    const text = e.target.value.toLowerCase();

    items.forEach(item => {
        const itemName = item.firstChild.textContent.toLowerCase();

        if(itemName.indexOf(text) != -1){
            item.style.display = 'flex';
        }else{
            item.style.display = 'none';
        }
    });
}

function checkUI() {
    const items = itemList.querySelectorAll('li');
    if (items.length === 0) {
    itemClear.style.display = 'none';
    itemFilter.style.display = 'none';
    }else{
        itemClear.style.display = 'block';
        itemFilter.style.display = 'block';
    }
}

// initialize app

function init() {
    
    
    // addEventListener
    itemForm.addEventListener('submit', onAddItemSubmit);
    itemList.addEventListener('click', onClickItem);
    itemClear.addEventListener('click', clearItems);
    itemFilter.addEventListener('input', filterItems);
    document.addEventListener('DOMContentLoaded', displayItems);
    
    checkUI();

}

init();