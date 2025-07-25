# Dearly – React + Vite + FastAPI
This project is a web application built using **React** (with **Vite** as the build tool) for the frontend and **FastAPI** for the backend. It includes routing via React Router and makes use of various useful packages for UI and backend request handling.

First, run 'git clone https://github.com/xinfay/dearly'
After, alter your .env.example into .env to avoid pulling conflicts.
- You may do this by:
```bash
cd 'to backend directory'
cp .env.example .env
```

## 🔧 Project Structure

```
dearly/
├── backend/
│   ├── create_order.py     # FastAPI backend to fulfill orders
│   └── confirm_order.py    # To validate payment and fulfill order (strech)
├── frontend/
│   ├── src/
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   ├── pages/
│   │   │   ├── Home.jsx
│   │   │   ├── Checkout.jsx
│   │   │   ├── View.jsx
│   │   │   └── Build.jsx
│   │   ├── data/
│   │   │   ├── countryStateCode.jsx     # stores API country codes and state codes
│   │   │   ├── items.jsx                # primitive copy of item metadata
│   │   │   ├── mockProduct.jsx          # actual set of item data and mock review to implement
│   │   │   └── testimonials.jsx         # meta reviews on frontpage
│   │   └── components/
│   │       ├── checkout/
│   │       │   ├── config/
│   │       │   │   └── PaymentMethods.js
│   │       │   ├── hooks/
│   │       │   │   └── useCheckout.js
│   │       │   ├── steps/
│   │       │   │   └── CheckoutSteps.jsx
│   │       │   ├── utils/
│   │       │   │   └── printful.js
│   │       │   ├── OrderSummary.jsx
│   │       │   └── ProgressSteps.jsx
│   │       ├── Header.jsx               # coupled with Layout.jsx to present navbar
│   │       ├── Layout.jsx               # called as like <entity> to present navbar
│   │       ├── imageGallery.jsx         # manages profile formatting for testimonials on frontpage
│   │       ├── ProductInfo.jsx          # handles formatting for presenting item in View.jsx
│   │       ├── ProductTabs.jsx          # handles/formats/tabulates section in View.jsx
│   │       └── StarRating.jsx           # formatting for reviews under View.jsx
├── .env
├── README.md
```

Under the .env file, you shouldinput your own Prinftul API key, which you may create from the Printful Developper platform
at https://developers.printful.com/. When creating your key, the access level you configure should only be to one store - this avoids conflict with pushing the same order to multiple stores.
it

## 📦 Requirements & Dependencies

### Frontend (React + Vite)
Make sure you have [Node.js](https://nodejs.org/) installed (recommended v18+).

Install these packages:
```bash
npm install
npm install react-router-dom
npm install react-select
```

This project uses:
- [`react-router-dom`](https://reactrouter.com/) for routing
- [`react-select`](https://react-select.com/) for dropdown components
- [`@vitejs/plugin-react`](https://github.com/vitejs/vite-plugin-react) for HMR with Babel (can be swapped with SWC)
- ESLint rules (you can expand this setup with TypeScript and `typescript-eslint`)

### Backend (Python + FastAPI)
Make sure Python 3.9+ is installed. Then set up and activate a virtual environment:

```bash
python -m venv venv
venv\Scripts\activate.bat  # On Windows
```

Install the required Python packages:
```bash
pip install requests==2.25.1
pip install python-dotenv
pip install fastapi uvicorn
```


## 🚀 Running the Project

### 1. Backend API (FastAPI)

In a new command prompt or bash terminal
From the backend directory (where `create_order.py` is located):

```bash
cd 'to the backend directory'
python -m uvicorn create_order:app --reload
```

This will start the FastAPI server on [http://127.0.0.1:8000](http://127.0.0.1:8000)

Make sure `.env` is configured properly for your order processing environment.

To deactivate the virtual environment when done:
```bash
deactivate
```
Or run Ctrl+C to terminate the process.


### 2. Frontend (React + Vite)

In a new separate command prompt or bash terminal
From the frontend directory:

```bash
cd 'to the dearly directory'
npm run dev
```

This starts the Vite development server. Open the provided local URL (typically [http://localhost:5173](http://localhost:5173)) to view the app.

Locally, you should just run http://localhost:5173. Fulfilling an order via Input will submit an order to the Printful API.
Likewise, run Ctrl+C to terminate the process.

## 💳 Stripe Integration

This project uses **Stripe Elements** to securely and compliantly collect credit card payments on the frontend. Stripe Elements ensures PCI compliance by rendering secure, hosted iframes for card inputs.

## 🔌 Installing Stripe

In your `frontend/` directory, install the Stripe libraries:

```bash
npm install @stripe/react-stripe-js @stripe/stripe-js
```

This provides React components and Stripe.js bindings for secure card handling.


### 🔑 Stripe Keys

1. Go to [https://dashboard.stripe.com](https://dashboard.stripe.com) and create a new project (or use an existing one).
2. In your `.env` file (for local development), add your **publishable** and **secret** keys:

```
VITE_STRIPE_PUBLIC_KEY=XXX
STRIPE_SECRET_KEY=XXX
```
Currently, we are running Stripe with test keys, which only allow for test cards to be validated. You may test different card keys for varying results to further improve security of dearly through:
https://docs.stripe.com/testing

> ⚠️ **Only the public key is used in the frontend.** The secret key should only be accessed on the backend.


## ✅ Notes

- This project uses **React Router** for navigation between `Home` and `Build` pages.
- Backend endpoints are powered by FastAPI and serve order fulfillment logic.
- Make sure both frontend and backend servers are running concurrently during development.
- ESLint is pre-configured and can be extended to include **TypeScript** and stricter linting via [`typescript-eslint`](https://typescript-eslint.io).

---

## 💡 Future Improvements

- Add TypeScript support
- Improve error handling and validation in API
- Setup automated tests for backend and frontend
- Dockerize backend for easy deployment
- Backend Payment Flow (Future) - The backend includes a placeholder script `confirm_order.py` intended to:
    - Receive the `paymentMethod.id` from the frontend
    - Confirm the payment using Stripe’s Python SDK
    - Fulfill the order on success