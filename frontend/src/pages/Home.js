import React from 'react';
import { Link } from 'react-router-dom';
import './Home.css';

const Home = () => {
  return (
    <div className="home">
      <section className="hero">
        <h1>Welcome to E-Commerce Platform</h1>
        <p>Discover amazing products at great prices</p>
        <Link to="/products" className="btn btn-primary btn-large">
          Shop Now
        </Link>
      </section>

      <section className="features">
        <div className="feature-card">
          <h3>🚚 Free Shipping</h3>
          <p>On orders over $50</p>
        </div>
        <div className="feature-card">
          <h3>💳 Secure Payment</h3>
          <p>Protected by Stripe</p>
        </div>
        <div className="feature-card">
          <h3>📦 Easy Returns</h3>
          <p>30-day return policy</p>
        </div>
      </section>
    </div>
  );
};

export default Home;

