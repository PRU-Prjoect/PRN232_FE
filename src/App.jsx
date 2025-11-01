import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import HomePage from './components/Home/HomePage'
import ExamFileManager from './components/ExamFileManager'
import Login from './components/Home/Login'
import Register from './components/Home/Register'
import GroupIntroduction from './pages/GroupIntroduction'
import CourseOverview from './pages/CourseOverview'
import AssignmentManager from './pages/AssignmentManager'
import NotFound from './pages/NotFound'

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-white text-gray-900">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/course/swd392" element={<ExamFileManager />} />
          <Route path="/course/not-found" element={<NotFound />} />
          <Route path="/course/:courseId" element={<NotFound />} />
          <Route path="/about" element={<GroupIntroduction />} />
          <Route path="/courses" element={<CourseOverview />} />
          <Route path="/assignments" element={<AssignmentManager />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </div>
    </Router>
  )
}

export default App
