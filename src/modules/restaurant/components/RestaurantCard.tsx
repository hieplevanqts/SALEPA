import React from 'react';
import './RestaurantCard.css';

interface RestaurantCardProps {
  title: string;
  children: React.ReactNode;
  status?: 'ready' | 'preparing' | 'delivered';
}

const RestaurantCard: React.FC<RestaurantCardProps> = ({ title, children, status }) => {
  return (
    <div className={`restaurant-card ${status ? `restaurant-card--${status}` : ''}`}>
      <h3 className="restaurant-card__title">{title}</h3>
      <div className="restaurant-card__content">
        {children}
      </div>
    </div>
  );
};

export default RestaurantCard;