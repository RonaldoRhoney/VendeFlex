import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Home from './pages/Home'
import PoliticaPrivacidade from './pages/PoliticaPrivacidade'
import TermosUso from './pages/TermosUso'
import Contato from './pages/Contato'
import Painel from './pages/admin/Painel'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/admin" element={<Painel />} />
        <Route path="/privacidade" element={<PoliticaPrivacidade />} />
        <Route path="/termos" element={<TermosUso />} />
        <Route path="/contato" element={<Contato />} />
      </Routes>
    </BrowserRouter>
  )
}
