import { BrowserRouter, Routes, Route, Link, Navigate } from 'react-router-dom'

import ConvenienceStoreModule from './modules/convenience-store/App';
import FashionShopApp from './modules/fashion-shop/App';
import SpaApp from './modules/spa/App';
import OnboardingScreen from './pages/OnboardingScreen';
import IndustrySelection from './pages/IndustrySelection';
import DebugPackageLoader from './components/DebugPackageLoader';
import RestaurantApp from './modules/restaurant/App';
import { ConvenienceLayout, SpaLayout, RestaurantLayout, FashionShopLayout } from './components/ConvenienceLayout';

function App() {

  
  return (
    <BrowserRouter>
      <div className="container">

        <div >
          <div>
            <div className='tailwind css-uwf2km css-exq74d'>
              <Routes>
                <Route element={<ConvenienceLayout />}>
                  <Route index element={<OnboardingScreen />} />
                <Route path="industry" element={<IndustrySelection />} />
              </Route>

                {/* MODULE ROUTES */}
                {/* <Route path="/spa/*" element={<SpaModule />} />
            <Route path="/restaurant/*" element={<RestaurantModule />} />
            <Route path="/fashion-shop/*" element={<FashionShopModule />} /> */}
                <Route element={<ConvenienceLayout />}>
                <Route path="/convenience/*" element={<ConvenienceStoreModule />} />
                </Route>
                  <Route element={<FashionShopLayout />}>
                <Route path="/fashion/shop/*" element={<FashionShopApp />} />
                </Route>
                <Route element={<SpaLayout />}>
                <Route path="/spa/*" element={<SpaApp />} />
                </Route>
                <Route element={<RestaurantLayout />}>
                <Route path="/restaurant/*" element={<RestaurantApp />} />
                </Route>

                {/* fallback */}
                {/* <Route path="*" element={<Navigate to="/" replace />} /> */}
              </Routes>
            </div>
          </div>
        </div>
      </div>
    </BrowserRouter>
  )
}

export default App