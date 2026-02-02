import ConvenienceStoreRoutes from './router/index'
import { useModuleCss } from '../../utils/useModuleCss'

export default function ConvenienceStoreApp() {
  //   useModuleCss([
  //   () => import('./styles/convenience-globals.css'),
  //   () => import('./styles/convenience-index.css'),
  // ])

  return <ConvenienceStoreRoutes />


}
