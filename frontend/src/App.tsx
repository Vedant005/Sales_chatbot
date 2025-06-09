import { Routes, Route } from "react-router-dom";
import "./App.css";
import HomePage from "./pages/home";
import ProductsPage from "./pages/ProductPage";
import LoginPage from "./pages/Login";
import SignupPage from "./pages/Signup";
import ChatbotSidebar from "./components/Chatbot";
import CartPage from "./pages/Cart";

function App() {
  return (
    <>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/products" element={<ProductsPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />
        <Route path="/cart" element={<CartPage />} />
      </Routes>
      <ChatbotSidebar />
    </>
  );
}

export default App;
