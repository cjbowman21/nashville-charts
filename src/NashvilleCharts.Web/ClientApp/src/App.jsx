import { Routes, Route } from 'react-router-dom'
import { AuthProvider } from './contexts/AuthContext'
import Layout from './components/Layout/Layout'
import Home from './pages/Home'
import ChartEditor from './pages/ChartEditor'
import ChartView from './pages/ChartView'
import MyCharts from './pages/MyCharts'
import Browse from './pages/Browse'
import Login from './pages/Login'
import ChartDemo from './pages/ChartDemo'
import Feedback from './pages/Feedback'

function App() {
  return (
    <AuthProvider>
      <Layout>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/browse" element={<Browse />} />
          <Route path="/demo" element={<ChartDemo />} />
          <Route path="/charts/new" element={<ChartEditor />} />
          <Route path="/charts/:id" element={<ChartView />} />
          <Route path="/charts/:id/edit" element={<ChartEditor />} />
          <Route path="/my-charts" element={<MyCharts />} />
          <Route path="/feedback" element={<Feedback />} />
        </Routes>
      </Layout>
    </AuthProvider>
  )
}

export default App
