const { request } = require("express");

const indexedDB = window.indexedDB || window.mozIndexedDB || webkitIndexedDB || window.msIndexedDB || window.shimIndexedDB;
let db; 
const req = indexedDB.open('budget', 1);

request.onupgradeneeded = ({target }) => {
    let db = target.result;

    db.createObjectStore('pending', {
        autoIncrement: true,
    });
};
request.onsuccess = ({target }) => {
    let db = target.result;
    if(navigator.onLine) {
        checkDatabase();
    }
};

request.onerror = function(event) {
    console.log('Could not find Database ' + event.target.errorCode);

};

function saveRecord (record) {
    const transaction = db.transaction(['pending'], 'readWrite');
    const store = transaction.objectStore('pending');

    store.add(record);
}

function checkDatabase () {
    const transaction = db.transaction(['pending'], 'readWrite');
    const store = transaction.objectStore('pending');
    const getAll = store.getAll();

    getAll.onsuccess = function() {
        if(getAll.result.length > 0) {
            fetch("/api/transaction", {
                method: "POST",
                body: JSON.stringify(transaction),
                headers: {
                  Accept: "application/json, text/plain, */*",
                  "Content-Type": "application/json"
                }
              })
              .then(response => {    
                return response.json();
              }).then(() => {
                const transaction = db.transaction(['pending'], 'readWrite');
                const store = transaction.objectStore('pending');
                store.clear();
            
              });
        }
    };
}
window.addEventListener('online', checkDatabase);