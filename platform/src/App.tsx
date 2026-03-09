import { Routes, Route } from 'react-router-dom'
import { Layout } from './components/Layout'
import Home from './pages/Home'
import Browse from './pages/Browse'
import Category from './pages/Category'
import Detail from './pages/Detail'
import Wings from './pages/Wings'
import WingDetail from './pages/WingDetail'

function App() {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/browse" element={<Browse />} />
        <Route path="/category/:category" element={<Category />} />
        <Route path="/skill/:id" element={<Detail />} />
        <Route path="/wings" element={<Wings />} />
        <Route path="/wings/:wingId" element={<WingDetail />} />
      </Routes>
    </Layout>
  )
}

export default App
