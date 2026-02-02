import SpaRouter from './router'
import { useModuleCss } from '../../utils/useModuleCss'


export default function SpaApp() {
  // useModuleCss([
  //   () => import('./styles/spa-globals.css'),
  //   () => import('./styles/spa-index.css'),
  // ])
  return <SpaRouter />
}