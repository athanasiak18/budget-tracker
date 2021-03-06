let db;

const request = indexDB.open('budget', 1);

request.onupgradeneeded = function(e) {
    const db = e.target.result;
    db.createObjectStore("budget_data", { autoIncrement: true });
  };

  request.onsuccess = function(e) {
    db = e.target.result;
    if (navigator.onLine) {refresh();} 
  };
  request.onerror = function(e) {
    console.log("N/A" + e.target.errorCode);
  };

  function saveRecord(record) {
    const transaction = db.transaction(["budget_data"], "readwrite"); 
    const store = transaction.objectStore("budget_data"); 
    store.add(record);
  };

function refresh() {
    const transaction = db.transaction(["budget_data"], "readwrite");
    const store = transaction.objectStore("budget_data");
    const getAll = store.getAll();

  getAll.onsuccess = function() {
    if (getAll.result.length > 0) {
      fetch("/api/transaction/bulk", {
        method: "POST",
        body: JSON.stringify(getAll.result),
        headers: {
          Accept: "application/json, text/plain, */*",
          "Content-Type": "application/json"
        }
      })
      .then(response => response.json())
      .then(() => {
        const transaction = db.transaction(["budget_data"], "readwrite");
        const store = transaction.objectStore("budget_data"); 
        store.clear(); 
      });
    }
  };
};

window.addEventListener("online", refresh);
