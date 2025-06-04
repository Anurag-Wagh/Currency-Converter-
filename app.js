// Updated API endpoints with fallback mechanism
const BASE_URLS = [
    'https://cdn.jsdelivr.net/npm/@fawazahmed0/currency-api@latest/v1/currencies',
    'https://latest.currency-api.pages.dev/v1/currencies'
];

const dropdowns = document.querySelectorAll(".dropdown select");
const btn = document.querySelector("form button");
const fromCurr = document.querySelector(".from select");
const toCurr = document.querySelector(".to select");
const msg = document.querySelector(".msg"); // Fixed selector - was missing dot

window.addEventListener("load", () => {
    updateExchangeRate();
});

// Populate dropdowns with currency codes
for (let select of dropdowns) {
    for (currCode in countryList) {
        let newOption = document.createElement("option");
        newOption.innerText = currCode;
        newOption.value = currCode;
        if (select.name === "from" && currCode === "USD") {
            newOption.selected = "selected";
        }
        else if (select.name === "to" && currCode === "INR") {
            newOption.selected = "selected";
        }
        select.append(newOption);
    }
    
    select.addEventListener("change", (evt) => {
        updateFlag(evt.target);
    });
}

const updateFlag = (element) => {
    let currCode = element.value;
    let countryCode = countryList[currCode];
    let newSrc = `https://flagsapi.com/${countryCode}/flat/64.png`;
    let img = element.parentElement.querySelector("img");
    img.src = newSrc;
};

btn.addEventListener("click", async (evt) => {
    evt.preventDefault();
    updateExchangeRate();
});

// Function to try multiple API endpoints
const fetchWithFallback = async (fromCurrency, toCurrency) => {
    const endpoints = [
        `${BASE_URLS[0]}/${fromCurrency.toLowerCase()}.json`,
        `${BASE_URLS[1]}/${fromCurrency.toLowerCase()}.json`
    ];
    
    for (let endpoint of endpoints) {
        try {
            const response = await fetch(endpoint);
            if (response.ok) {
                const data = await response.json();
                return data;
            }
        } catch (error) {
            console.log(`Failed to fetch from ${endpoint}:`, error);
            continue;
        }
    }
    
    throw new Error('All API endpoints failed');
};

const updateExchangeRate = async () => {
    try {
        let amount = document.querySelector(".amount input");
        let amtVal = amount.value;
        
        // Fixed the condition logic
        if (amtVal === "" || amtVal < 1) {
            amtVal = 1;
            amount.value = "1";
        }

        const fromCurrency = fromCurr.value.toLowerCase();
        const toCurrency = toCurr.value.toLowerCase();
        
        // Fetch exchange rate data
        const data = await fetchWithFallback(fromCurrency, toCurrency);
        
        // Extract rate from the correct data structure
        const rate = data[fromCurrency][toCurrency];
        
        if (!rate) {
            throw new Error(`Exchange rate not found for ${fromCurrency} to ${toCurrency}`);
        }
        
        let finalAmount = (amtVal * rate).toFixed(2);
        
        msg.innerText = `${amtVal} ${fromCurr.value} = ${finalAmount} ${toCurr.value}`;
        
    } catch (error) {
        console.error('Error fetching exchange rate:', error);
        msg.innerText = "Error fetching exchange rate. Please try again.";
    }
};