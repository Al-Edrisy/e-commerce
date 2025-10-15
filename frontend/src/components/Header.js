import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import './Header.css';

const Header = () => {
  const { user, logout } = useAuth();
  const { getTotalItems } = useCart();

  return (
    <header className="header">
      <div className="container header-content">
        <Link to="/" className="logo">
          E-Commerce
        </Link>
        
        <nav className="nav">
          <Link to="/" className="nav-link">Home</Link>
          <Link to="/products" className="nav-link">Products</Link>
          
          {user ? (
            <>
              <Link to="/orders" className="nav-link">Orders</Link>
              <div className="cart-icon">
                🛒 <span className="cart-count">{getTotalItems()}</span>
              </div>
              <button onClick={logout} className="btn btn-secondary">
                Logout
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="btn btn-primary">Login</Link>
              <Link to="/register" className="btn btn-secondary">Register</Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
};

export default Header;

