import FashionShopRouter from './router/index'
import { useModuleCss } from '../../utils/useModuleCss'

export default function FashionShopApp() {
  // useModuleCss([
  //   () => import('../convenience-store/styles/convenience-index.css'),
  //   () => import('../convenience-store/styles/convenience-globals.css'),
  // ])
  return <FashionShopRouter/>

}