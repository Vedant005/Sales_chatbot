# E-ShopBot: AI-Powered E-commerce Platform

## Project Overview

E-ShopBot is an innovative e-commerce platform designed to enhance the online shopping experience through the integration of a smart sales chatbot. This project focuses on building a full-stack application where users can efficiently search for products, explore catalogs, manage their shopping carts, and interact with an AI assistant to streamline their purchase journey.

The platform is built with a Python Flask backend for API services and a React.js frontend for a dynamic and responsive user interface.

## Features

This project implements the following key functionalities:

### 1. User Authentication

- **Registration:** Users can create new accounts.
- **Login:** Users can log in with their credentials, receiving secure JWT (JSON Web Tokens) for session management.
- **Token Refresh:** Access tokens can be refreshed using long-lived refresh tokens without re-authenticating.
- **Logout:** Users can securely log out, invalidating their tokens on the server-side.
- **Protected Routes:** API endpoints are secured, requiring authentication with valid access tokens.

### 2. Product Management

- **Product Listing:** View a catalog of all available products.
- **Product Search:** Efficiently search for products by name.
- **Product Filtering:** Filter products by category, brand (via keywords in name/description), and price range (min/max).
- **Product Pagination:** Browse through products using pagination controls (page number, items per page).
- **Single Product View:** Retrieve detailed information for a specific product by its ID.

### 3. Shopping Cart Management

- **Add to Cart:** Add products to a user's persistent shopping cart.
- **View Cart:** See all items currently in the cart with quantities and total price.
- **Update Cart:** Adjust the quantity of specific items in the cart.
- **Remove from Cart:** Remove individual items from the cart.
- **Clear Cart:** Empty the entire shopping cart.
- **Simulated Checkout:** A placeholder for the checkout process, which clears the cart after "purchase." (Note: Actual payment processing and order fulfillment are not implemented).

### 4. Smart Sales Chatbot (AI Assistant)

The chatbot is designed to provide a conversational interface for various e-commerce tasks:

- **Conversational Interface:** A fixed-position sidebar/popup chatbot that integrates seamlessly into the shopping flow without disrupting the main content.
- **Intelligent Search:** Understands natural language queries to search and filter products.
- **Product Exploration:**
  - **Detailed Information:** Provide detailed specifications and links for specific products.
  - **Category Listing:** List available product categories.
- **Cart Interaction:**
  - **Add to Cart:** Users can instruct the chatbot to add specific products to their cart.
  - **View Cart:** The chatbot can display the current contents of the user's cart.
  - **Remove from Cart:** Users can ask the chatbot to remove items.
  - **Clear Cart:** Clear the entire cart via chatbot command.
  - **Checkout Initiation:** Guide users to initiate the simulated checkout process.
- **Contextual Understanding:** Remembers previously displayed products to allow follow-up questions (e.g., "details about the first one").
- **Basic Utilities:** Handles greetings, gratitude, and conversation resets.
- **Authentication Required:** Chatbot functionality is protected and requires a logged-in user.

## Technologies Used

### Backend

- **Python:** Programming Language
- **Flask:** Web Framework
- **Flask-SQLAlchemy:** ORM for database interaction
- **MySQL:** Relational Database
- **Flask-JWT-Extended:** For JWT-based authentication and authorization
- **Flask-CORS:** Handling Cross-Origin Resource Sharing
- **Werkzeug:** For password hashing
- **pandas & numpy:** For data processing (used in `seed_data.py`)
- **re (Regular Expressions):** For basic NLP/intent recognition in the chatbot

### Frontend

- **React.js (with TypeScript):** JavaScript library for building user interfaces
- **Zustand:** Lightweight state management library
- **Tailwind CSS:** Utility-first CSS framework for styling
- **Axios:** Promise-based HTTP client for API requests
- **React Router DOM:** For client-side routing

## Project Structure

.
├── backend/
│ ├── app/
│ │ ├── init.py # Flask app creation, DB/JWT/CORS initialization, blueprint registration
│ │ ├── config.py # Configuration settings (DB URI, JWT Secret, etc.)
│ │ ├── models/
│ │ │ ├── init.py # Makes 'models' a Python package
│ │ │ ├── user.py # User model (ORM definition)
│ │ │ ├── product.py # Product model (ORM definition)
│ │ │ └── cart.py # Cart and CartItem models (ORM definition)
│ │ └── routes/
│ │ ├── init.py # Makes 'routes' a Python package
│ │ ├── auth.py # Authentication routes (register, login, refresh, logout)
│ │ ├── product.py # Product listing and detail routes
│ │ ├── cart.py # Shopping cart management routes
│ │ └── chatbot.py # Chatbot conversation logic route
│ ├── run.py # Script to run the Flask application
│ ├── seed_data.py # Script to initialize database tables and populate product data from CSV
│ └── requirements.txt # Python dependencies
├── frontend/
│ ├── public/
│ │ └── ... # Public assets
│ ├── src/
│ │ ├── App.tsx # Main React application component and routing
│ │ ├── index.css # Tailwind CSS entry point
│ │ ├── main.tsx # React entry point
│ │ ├── components/
│ │ │ ├── Header.tsx # Website header with navigation
│ │ │ ├── Filter.tsx # Product filtering component
│ │ │ ├── ProductCard.tsx # Displays single product information
│ │ │ └── ChatbotSidebar.tsx# The interactive chatbot UI widget
│ │ ├── pages/
│ │ │ ├── HomePage.tsx # Introduction/landing page
│ │ │ ├── LoginPage.tsx # User login page
│ │ │ ├── SignupPage.tsx # User registration page
│ │ │ ├── ProductsPage.tsx # Product catalog page with filters and pagination
│ │ │ └── CartPage.tsx # Shopping cart view and management page
│ │ └── stores/
│ │ ├── useAuthStore.ts # Zustand store for authentication state and actions
│ │ ├── useProductStore.ts# Zustand store for product data and actions
│ │ ├── useCartStore.ts # Zustand store for shopping cart data and actions
│ │ └── useChatbotStore.ts# Zustand store for chatbot conversation state and actions
│ ├── package.json # Frontend dependencies and scripts
│ ├── postcss.config.js
│ ├── tailwind.config.js
│ └── tsconfig.json
└── README.md # This file

## Setup and Installation

Follow these steps to set up and run the project locally.

### Prerequisites

- Python 3.8+
- Node.js (LTS version) & npm (or yarn)
- MySQL Server running (e.g., via XAMPP, Docker, or native installation)

### 1. Backend Setup

1.  **Clone the repository:**
    ```bash
    git clone <repository_url>
    cd sales_chatbot
    ```
2.  **Navigate to the backend directory:**
    ```bash
    cd backend
    ```
3.  **Create a Python virtual environment:**
    ```bash
    python -m venv venv
    ```
4.  **Activate the virtual environment:**
    - **Windows:** `.\venv\Scripts\activate`
    - **macOS/Linux:** `source venv/bin/activate`
5.  **Install Python dependencies:**
    ```bash
    pip install -r requirements.txt
    ```
6.  **Configure your MySQL Database:**
    - Open `backend/app/config.py`.
    - Update the `SQLALCHEMY_DATABASE_URI` with your MySQL credentials and database name.
      ```python
      # Example:
      SQLALCHEMY_DATABASE_URI = 'mysql+pymysql://your_user:your_password@localhost/your_database_name'
      ```
    - **Create an empty database** in your MySQL server (e.g., `CREATE DATABASE your_database_name;`).
7.  **Seed the Database (Create Tables & Populate Data):**
    This script will drop any existing tables and recreate them based on your models, then populate product data from `cleaned_amazon_products.csv`.

    ```bash
    python seed_data.py
    ```

    - **Important:** Ensure `cleaned_amazon_products.csv` is in the `backend` directory.

8.  **Run the Flask Backend:**
    ```bash
    python run.py
    ```
    The backend should now be running on `http://127.0.0.1:5000`.

### 2. Frontend Setup

1.  **Navigate to the frontend directory:**
    ```bash
    cd ../frontend
    ```
2.  **Install Node.js dependencies:**
    ```bash
    npm install
    # or
    yarn install
    ```
3.  **Configure API Base URL:**

    - Open `frontend/src/stores/useAuthStore.ts`, `useProductStore.ts`, `useCartStore.ts`, and `useChatbotStore.ts`.
    - Ensure `const API_BASE_URL = 'http://127.0.0.1:5000';` is correctly set in all of them.

4.  **Run the React Frontend:**
    ```bash
    npm run dev
    # or
    yarn dev
    ```
    The frontend should now be running, typically on `http://localhost:5173` (or a similar port).

## API Endpoints (Backend)

The backend provides the following RESTful API endpoints:

### Authentication (`/auth`)

- **`POST /auth/register`**: Register a new user.
  - **Body:** `{"username": "string", "email": "string", "password": "string"}`
- **`POST /auth/login`**: Log in a user and get access/refresh tokens.
  - **Body:** `{"email": "string", "password": "string"}`
  - **Response:** `{"access_token": "jwt_string", "user": {}, "message": "Login successful"}`
- **`POST /auth/refresh`**: Get a new access token using a refresh token (browser automatically sends refresh token cookie).
- **`POST /auth/logout`**: Log out (revokes current access token).
  - **Headers:** `Authorization: Bearer <access_token>`
- **`POST /auth/logout_refresh`**: Log out (revokes refresh token).
- **`GET /auth/protected`**: Test a protected route (requires valid access token).
  - **Headers:** `Authorization: Bearer <access_token>`

### Products (`/products`)

- **`GET /products`**: Get a paginated list of products.
  - **Query Params:** `name` (string), `category` (string), `page` (int, default 1), `per_page` (int, default 12)
- **`GET /products/<int:id>`**: Get details for a single product by ID.

### Cart Management (`/api`)

- **`POST /api/cart/add`**: Add a product to the authenticated user's cart or update quantity.
  - **Headers:** `Authorization: Bearer <access_token>`
  - **Body:** `{"product_id": int, "quantity": int}`
- **`GET /api/cart`**: View the authenticated user's cart contents.
  - **Headers:** `Authorization: Bearer <access_token>`
- **`PUT /api/cart/update/<int:item_id>`**: Update the quantity of a specific cart item.
  - **Headers:** `Authorization: Bearer <access_token>`
  - **Body:** `{"quantity": int}` (set to 0 to remove)
- **`DELETE /api/cart/remove/<int:item_id>`**: Remove a specific cart item.
  - **Headers:** `Authorization: Bearer <access_token>`
- **`DELETE /api/cart/clear`**: Clear all items from the authenticated user's cart.
  - **Headers:** `Authorization: Bearer <access_token>`
- **`POST /api/checkout`**: Simulate checkout (clears cart).
  - **Headers:** `Authorization: Bearer <access_token>`

### Chatbot (`/chatbot`)

- **`POST /chatbot/converse`**: Send a message to the chatbot and get a response.
  - **Headers:** `Authorization: Bearer <access_token>`
  - **Body:** `{"message": "string"}`
  - **Response:** `{"response": "chatbot_reply_string", "products": [product_objects]}`

## Chatbot Commands and Usage

Here's a list of prompts the chatbot can understand:

- **Greetings:**
  - `Hello`
  - `Hi`
- **Gratitude:**
  - `Thank you`
  - `Thanks`
- **Conversation Reset:**
  - `Reset`
  - `Start over`
  - `Clear chat`
- **Product Search:**
  - `Search for [product name]` (e.g., `Search for laptops`)
  - `Find [product name]` (e.g., `Find headphones`)
  - `Show me [product name]` (e.g., `Show me cameras`)
- **Search with Category Filter:**
  - `Show me products in category [category name]` (e.g., `Show me products in category electronics`)
  - `Find clothing in category [category name]`
- **Search with Brand Filter (will search brand name in product name/description):**
  - `Find mobiles by brand [brand name]` (e.g., `Find mobiles by brand Samsung`)
  - `Show me headphones by brand [brand name]`
- **Search with Price Filter:**
  - `Show me products under [price]` (e.g., `Show me laptops under 50000`)
  - `Find earphones over [price]` (e.g., `Find earphones over 1000`)
  - `Search for TVs between [price1] and [price2]` (e.g., `Search for TVs between 20000 and 50000`)
- **Combine Filters:**
  - `Show me products under 10000 by brand Xiaomi`
- **Product Exploration:**
  - `List categories`
  - `Show categories`
  - **Get Details (after a search result is shown, referring to items by number):**
    - `Details about the first one`
    - `Tell me more about the third one`
    - `Specs of [product name]` (e.g., `Specs of iPhone 13`)
- **Cart Management:**
  - **Add to Cart:**
    - `Add the first one to cart` (after a search result)
    - `Buy the second one` (after a search result)
    - `Add [product name] to cart` (e.g., `Add Apple MacBook Pro to cart`)
  - **View Cart:**
    - `View cart`
    - `Show my cart`
    - `What's in my cart?`
  - **Remove from Cart:**
    - `Remove [product name] from cart` (e.g., `Remove earphones from cart`)
    - `Remove the first one from cart` (after `view cart` and seeing a numbered list)
  - **Clear Cart:**
    - `Clear cart`
    - `Empty my cart`
  - **Checkout:**
    - `Checkout`
    - `Buy now`
    - `Place order`

## Future Enhancements

- **Advanced NLP:** Integrate a more sophisticated NLP library (e.g., NLTK, SpaCy) or a dedicated NLU service (Rasa, Dialogflow) for better intent recognition, entity extraction, and dialogue management.
- **Conversational Context Persistence:** Store chatbot conversational context in a persistent database (e.g., Redis, or a dedicated table) instead of in-memory for server restarts and horizontal scaling.
- **Recommendation Engine:** Implement product recommendations based on user history, browsing patterns, or chatbot interactions.
- **User Profile & Order History:** Develop dedicated pages and API endpoints for users to view and manage their profile and past orders.
- **Payment Gateway Integration:** Integrate with a real payment gateway (e.g., Stripe, PayPal) for actual checkout functionality.
- **Product Reviews & Ratings:** Allow users to submit reviews and ratings for products.
- **Admin Dashboard:** Create an admin interface for managing products, users, and orders.
- **More Robust Error Handling & Notifications:** Implement global error boundaries and user-friendly toast notifications for API responses.
- **Frontend UI/UX Polish:** Further refine the UI/UX for animations, responsiveness, and ac
