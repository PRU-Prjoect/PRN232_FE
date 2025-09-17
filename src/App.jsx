import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import HomePage from './components/HomePage'
import ExamFileManager from './components/ExamFileManager'
import Login from './components/Login'
import Register from './components/Register'

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-white text-gray-900">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/course/:courseId" element={<ExamFileManager />} />
        </Routes>
      </div>
    </Router>
  )
}

export default App
