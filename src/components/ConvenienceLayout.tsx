import { Outlet } from 'react-router-dom';
import { useModuleCss } from '../utils/useModuleCss';
export function ConvenienceLayout() {
  useModuleCss([
    () => import('../modules/convenience-store/styles/convenience-globals.css'),
    () => import('../modules/convenience-store/styles/convenience-index.css'),
  ]);

  return <Outlet />;
}
export function FashionShopLayout() {
  useModuleCss([
    () => import('../modules/fashion-shop/styles/fashion-shop-globals.css'),
    () => import('../modules/fashion-shop/styles/fashion-shop-index.css'),
  ]);

  return <Outlet />;
}
export function SpaLayout() {
  useModuleCss([
    () => import('../modules/spa/styles/spa-globals.css'),
    () => import('../modules/spa/styles/spa-index.css'),
  ]);

  return <Outlet />;
}
export function RestaurantLayout() {
  useModuleCss([
    () => import('../modules/restaurant/styles/restaurant-globals.css'),
    () => import('../modules/restaurant/styles/restaurant-index.css'),
  ]);

  return <Outlet />;
}