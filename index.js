// Import Firebase functions
import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.7.0/firebase-app.js';
import { getFirestore, collection, addDoc, getDocs, query, where } from 'https://www.gstatic.com/firebasejs/10.7.0/firebase-firestore.js';

// Your Firebase configuration - Replace with your actual config values
const firebaseConfig = {
    apiKey: "AIzaSyAWrbiVnG6k_w_JZbjOmnDAW5xaBb8Riw0",
    authDomain: "personal-project-ffcb2.firebaseapp.com",
    projectId: "personal-project-ffcb2",
    storageBucket: "personal-project-ffcb2.firebasestorage.app",
    messagingSenderId: "1081374352989",
    appId: "1:1081374352989:web:7d64510bb12b306dcf0fb4",
    measurementId: "G-DBKD55X6H5"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Wait for DOM to load
document.addEventListener('DOMContentLoaded', function() {
    // Get the form element
    const productForm = document.getElementById('productForm');
    
    if (productForm) {
        productForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            
            // Disable submit button to prevent double submission
            const submitButton = document.getElementById('Addproduct');
            submitButton.disabled = true;
            submitButton.textContent = 'Adding...';
            
            try {
                // Get form values
                const productName = document.getElementById('productName').value.trim();
                const wholesalePrice = parseFloat(document.getElementById('wholesalePrice').value);
                const barcode = document.getElementById('barcode').value.trim();
                
                // Validate form values
                if (!productName || !wholesalePrice || !barcode) {
                    throw new Error('Please fill in all fields');
                }

                // Check if product with the same name and barcode already exists
                const productQuery = query(
                    collection(db, 'products'),
                    where('productName', '==', productName),
                    where('barcode', '==', barcode)
                );
                const querySnapshot = await getDocs(productQuery);
                
                if (!querySnapshot.empty) {
                    throw new Error('Product with the same name and barcode already exists.');
                }
                
                // Create product object
                const productData = {
                    productName: productName,
                    wholesalePrice: wholesalePrice,
                    barcode: barcode,
                    createdAt: new Date().toISOString()
                };
                
                // Get reference to products collection
                const productsRef = collection(db, 'products');
                
                // Add document to collection
                const docRef = await addDoc(productsRef, productData);
                
                console.log('Document written with ID:', docRef.id);
                alert('Product added successfully!');
                
                // Reset form
                productForm.reset();
                
                // Load the updated product list after adding a product
                loadInventory();
                
            } catch (error) {
                console.error('Error adding document:', error);
                alert(error.message || 'Error adding product. Please try again.');
                
            } finally {
                // Re-enable submit button
                submitButton.disabled = false;
                submitButton.textContent = 'Add Product';
            }
        });
    } else {
        console.error('Product form not found in the document');
    }
    
    // Load products when the page loads
    loadInventory();
    
    // Add event listener for search box input
    const searchBox = document.getElementById('searchBox');
    if (searchBox) {
        searchBox.addEventListener('input', function() {
            const searchTerm = searchBox.value.trim().toLowerCase();
            filterProducts(searchTerm);
        });
    }
});

// Function to load products from Firestore and display them in inventory
async function loadInventory() {
    const inventoryDisplayElement = document.getElementById("inventoryDisplay");
    
    try {
        // Fetch all products from the "products" collection
        const querySnapshot = await getDocs(collection(db, "products"));
        
        // Clear previous content
        inventoryDisplayElement.innerHTML = '';

        // Store product elements for later filtering
        window.productCards = [];

        // Loop through each document and create a card for the product
        querySnapshot.forEach((doc) => {
            const product = doc.data();  // Get data of the document

            // Create a card container for the product
            const card = document.createElement("div");
            card.classList.add(
                "bg-white", 
                "p-4", 
                "rounded-lg", 
                "shadow-lg", 
                "hover:shadow-2xl", 
                "transition-shadow", 
                "border",               
                "border-gray-200",      
                "mb-4",                 
                "mx-2"                  
            );

            // Card content with a quantity field and dropdown
            const cardContent = `
                <h3 class="text-xl font-semibold text-gray-800">${product.productName}</h3>
                <p class="text-gray-600">₱${product.wholesalePrice}</p>
                <p class="text-gray-500">${product.barcode}</p>

                <div class="mt-4">
                    <label class="block text-sm font-medium text-gray-700">Quantity</label>
                    <input type="number" class="quantityField w-full p-2 border rounded-lg" 
                        placeholder="Enter quantity" data-product-id="${doc.id}" 
                        min="0" />
                </div>

                <div class="mt-2">
                    <label class="block text-sm font-medium text-gray-700">Unit</label>
                    <select class="unitField w-full p-2 border rounded-lg" data-product-id="${doc.id}">
                        <option value="Pieces">Pieces</option>
                        <option value="Pack">Pack</option>
                        <option value="Tie">Tie</option>
                        <option value="Box">Box</option>
                    </select>
                </div>
            `;

            // Append card content to the card element
            card.innerHTML = cardContent;

            // Store the card in the global productCards array
            window.productCards.push({ card, productName: product.productName });

            // Append the card to the inventory display section
            inventoryDisplayElement.appendChild(card);
        });
    } catch (error) {
        console.error("Error fetching products: ", error);
        alert("Error fetching products.");
    }
}


document.getElementById("printButton").addEventListener("click", printInventory);

function printInventory() {
    // Get current date and time
    const currentDate = new Date();
    const formattedDate = currentDate.toLocaleDateString();
    const formattedTime = currentDate.toLocaleTimeString();
    
    // Get all products with quantities
    const inventoryDisplayElement = document.getElementById("inventoryDisplay");
    const productCards = inventoryDisplayElement.querySelectorAll(".bg-white");
    
    // Initialize counters and arrays
    let totalItems = 0;
    const orderItems = [];

    // Process each product card
    productCards.forEach((card) => {
        const quantityField = card.querySelector(".quantityField");
        const unitField = card.querySelector(".unitField");
        const quantity = parseInt(quantityField?.value || 0, 10);
        const unit = unitField?.value || 'pcs';

        if (quantity > 0) {
            const productName = card.querySelector("h3").textContent;
            const priceText = card.querySelector("p").textContent;
            const price = parseFloat(priceText.replace('₱', '').trim());

            totalItems += quantity;

            orderItems.push({
                productName,
                price,
                quantity,
                unit
            });
        }
    });

    // Create the HTML content
    const printContent = `
        <html>
        <head>
            <title>Order List - ${formattedDate}</title>
            <style>
                @page { size: A4; margin: 1cm; }
                body {
                    font-family: Arial, sans-serif;
                    line-height: 1.4;
                    margin: 0;
                    padding: 20px;
                    font-size: 12px;  /* Smaller text for the whole body */
                }
                .header {
                    text-align: center;
                    margin-bottom: 30px;
                    padding-bottom: 20px;
                    border-bottom: 2px solid #333;
                }
                .store-name {
                    font-size: 18px;  /* Smaller store name */
                    font-weight: bold;
                    margin: 0;
                    color: #1a1a1a;
                }
                .store-details {
                    font-size: 10px;  /* Smaller store details */
                    color: #666;
                    margin: 5px 0;
                }
                .order-meta {
                    display: flex;
                    justify-content: space-between;
                    margin: 20px 0;
                    padding: 10px;
                    background-color: #f8f8f8;
                    font-size: 10px;  /* Smaller meta text */
                }
                .items-container {
                    margin: 20px 0;
                }
                .item {
                    padding: 8px;
                    border-bottom: 1px solid #eee;
                    display: grid;
                    grid-template-columns: 2fr 1fr 1fr;  /* Adjusted layout for quantity */
                    gap: 8px;
                    font-size: 10px;  /* Smaller item text */
                }
                .item-header {
                    font-weight: bold;
                    background-color: #f0f0f0;
                }
                .summary {
                    margin-top: 30px;
                    padding: 20px;
                    background-color: #f8f8f8;
                    font-size: 10px;  /* Smaller summary text */
                }
                .footer {
                    margin-top: 50px;
                    padding-top: 20px;
                    border-top: 1px solid #eee;
                    font-size: 10px;
                    color: #666;
                    text-align: center;
                }
                @media print {
                    .no-print {
                        display: none;
                    }
                }
            </style>
        </head>
        <body>
            <div class="header">
                <h1 class="store-name">Cadiz Store</h1>
                <p class="store-details">Order List</p>
                <p class="store-details">📍 Cadiz Store, Antipolo City</p>
            </div>

            <div class="order-meta">
                <div>
                    <p><strong>Date:</strong> ${formattedDate}</p>
                    <p><strong>Time:</strong> ${formattedTime}</p>
                </div>
                <div>
                    <p><strong>Order ID:</strong> ${Date.now().toString().slice(-6)}</p>
                    <p><strong>Total Items:</strong> ${totalItems}</p>
                </div>
            </div>

            <div class="items-container">
                <div class="item item-header">
                    <div>Product</div>
                    <div>Quantity</div>
                </div>
                ${orderItems.map(item => `
                    <div class="item">
                        <div>${item.productName}</div>
                        <div>${item.quantity} ${item.unit}</div>
                    </div>
                `).join('')}
            </div>

            <button class="no-print" onclick="window.print()" style="
                position: fixed;
                top: 20px;
                right: 20px;
                padding: 10px 20px;
                background-color: #007bff;
                color: white;
                border: none;
                border-radius: 5px;
                cursor: pointer;
            ">
                Print Order
            </button>
        </body>
        </html>
    `;

    // Open new window and print
    const printWindow = window.open('', '_blank');
    printWindow.document.write(printContent);
    printWindow.document.close();
}





// Function to filter and display products based on search term
function filterProducts(searchTerm) {
    const inventoryDisplayElement = document.getElementById("inventoryDisplay");
    
    // Filter the product cards based on the search term (case-insensitive)
    const filteredProducts = window.productCards.filter(product => 
        product.productName.toLowerCase().includes(searchTerm)
    );
    
    // Clear the inventory display and add only the filtered products
    inventoryDisplayElement.innerHTML = '';
    
    filteredProducts.forEach(filteredProduct => {
        inventoryDisplayElement.appendChild(filteredProduct.card);
    });
}
