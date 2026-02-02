import React from 'react';
import './RestaurantDashboard.css';

const RestaurantDashboard = () => {
  return (
    <div className="restaurant-dashboard">
      <h2>Restaurant Management Dashboard</h2>
      <div className="restaurant-sections">
        <section className="orders">
          <h3>Current Orders</h3>
          <p>Track pending, preparing, and completed orders</p>
        </section>
        <section className="menu">
          <h3>Menu Management</h3>
          <p>Add, update, or remove menu items and categories</p>
        </section>
        <section className="reservations">
          <h3>Table Reservations</h3>
          <p>Manage reservations and seating arrangements</p>
        </section>
      </div>
    </div>
  );
};

export default RestaurantDashboard;