// src/pages/HomePage.jsx
import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import useScrollAnimation from "../../hooks/useScrollAnimation";
import { useAuth } from "../../contexts/AuthContext";

const courses = [
  {
    id: "swd392",
    code: "SWD392",
    name: "Software Architecture and Design",
    description:
      "Learn design patterns, architecture styles and best practices in software design.",
  },
  {
    id: "prn231",
    code: "PRN231",
    name: "Web Application Development",
    description:
      "Building web applications using .NET Core and modern web technologies.",
  },
  {
    id: "prn232",
    code: "PRN232",
    name: "Advanced Web Application",
    description:
      "Advanced topics in web development including API design, security, and performance optimization.",
  },
  {
    id: "swe201",
    code: "SWE201",
    name: "Introduction to Software Engineering",
    description:
      "Fundamentals of software engineering, including development processes and methodologies.",
  },
];

const HomePage = () => {
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
  const navigate = useNavigate();
  const { user, isLoggedIn, logout, isLecturer, isAdmin } = useAuth();
  
  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const handleCourseAccess = (courseId) => {
    if (!isLoggedIn) {
      navigate("/login");
      return;
    }

    if (courseId === 'swd392') {
      navigate(`/course/${courseId}`);
    } else {
      navigate('/course/not-found');
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-white text-gray-900">
      <header className="sticky top-0 bg-white border-b border-gray-200 z-50">
        <div className="container mx-auto px-6 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-orange-500">FPT University</h1>
          <div className="flex space-x-4 items-center">
            <Link 
              to="/about" 
              className="px-4 py-2 text-gray-600 hover:text-orange-600 font-medium transition"
            >
              About
            </Link>
            <Link 
              to="/courses" 
              className="px-4 py-2 text-gray-600 hover:text-orange-600 font-medium transition"
            >
              Courses
            </Link>
            
            {isLoggedIn ? (
              <div className="relative">
                <button 
                  onClick={() => setIsProfileDropdownOpen(!isProfileDropdownOpen)}
                  className="flex items-center space-x-2 focus:outline-none"
                >
                  <span className="text-sm text-gray-700">
                    Welcome <span className="font-semibold">{user?.name}</span>
                  </span>
                  <span className={`text-xs px-2 py-1 rounded-full ${
                    user?.role === 'admin' ? 'bg-purple-100 text-purple-800' :
                    user?.role === 'lecturer' ? 'bg-blue-100 text-blue-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {user?.role || 'guest'}
                  </span>
                  <svg 
                    className={`w-4 h-4 transform transition-transform ${isProfileDropdownOpen ? 'rotate-180' : ''}`} 
                    fill="currentColor" 
                    viewBox="0 0 20 20"
                  >
                    <path 
                      fillRule="evenodd" 
                      d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" 
                      clipRule="evenodd" 
                    />
                  </svg>
                </button>

                {isProfileDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-64 bg-white border border-gray-200 rounded-lg shadow-lg">
                    <div className="p-4 border-b border-gray-200">
                      <h3 className="text-lg font-semibold">{user?.name || 'Email: '}</h3>
                      <p className="text-sm text-gray-600">{user?.email || 'student@fpt.edu.vn'}</p>
                    </div>
                    <div className="py-1">
                      {user?.studentId && (
                        <div className="px-4 py-2 text-sm text-gray-700">
                          <strong>Student ID:</strong> {user.studentId}
                        </div>
                      )}
                      <div className="px-4 py-2 text-sm text-gray-700">
                        <strong>Role:</strong> <span className={`px-2 py-1 rounded text-xs ${
                          user?.role === 'admin' ? 'bg-purple-100 text-purple-800' :
                          user?.role === 'lecturer' ? 'bg-blue-100 text-blue-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>{user?.role || 'Guest'}</span>
                      </div>
                      <div className="px-4 py-2 text-sm text-gray-700">
                        <strong>Department:</strong> {user?.department || 'Software Engineering'}
                      </div>
                      {isAdmin() && (
                        <div className="px-4 py-2 text-sm text-gray-700">
                          <strong>Permissions:</strong> 
                          <div className="flex flex-wrap gap-1 mt-1">
                            <span className="text-xs bg-purple-50 text-purple-700 px-2 py-0.5 rounded">Assign Submissions</span>
                            <span className="text-xs bg-purple-50 text-purple-700 px-2 py-0.5 rounded">Approve Scores</span>
                            <span className="text-xs bg-purple-50 text-purple-700 px-2 py-0.5 rounded">Manage Users</span>
                            <span className="text-xs bg-purple-50 text-purple-700 px-2 py-0.5 rounded">Export Reports</span>
                          </div>
                        </div>
                      )}
                      {isLecturer() && (
                        <div className="px-4 py-2 text-sm text-gray-700">
                          <strong>Permissions:</strong> 
                          <div className="flex flex-wrap gap-1 mt-1">
                            <span className="text-xs bg-blue-50 text-blue-700 px-2 py-0.5 rounded">Grade Submissions</span>
                            <span className="text-xs bg-blue-50 text-blue-700 px-2 py-0.5 rounded">View Details</span>
                            <span className="text-xs bg-blue-50 text-blue-700 px-2 py-0.5 rounded">Add Notes</span>
                          </div>
                        </div>
                      )}
                    </div>
                    <div className="border-t border-gray-200 py-1">
                      <button 
                        onClick={handleLogout}
                        className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition"
                      >
                        Logout
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <>
                <Link to="/register" className="px-5 py-2 border border-orange-500 text-orange-500 hover:bg-orange-50 rounded-lg font-medium shadow-sm transition inline-block">
                  Register
                </Link>
                <Link to="/login" className="px-5 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-lg font-medium shadow-sm transition inline-block">
                  Login
                </Link>
              </>
            )}
          </div>
        </div>
      </header>
      <section className="bg-white">
        <div className="container mx-auto px-6 py-20 flex flex-col md:flex-row items-center gap-12">
          {(() => {
            const [textRef, textVisible] = useScrollAnimation(0.1);
            return (
              <div 
                ref={textRef}
                className={`md:w-1/2 space-y-6 text-center md:text-left fade-in-left ${textVisible ? 'visible' : ''}`}
              >
                <h1 className="text-5xl font-extrabold leading-tight">
                  {isLoggedIn ? `Welcome back!` : 'Welcome to'} {" "}
                  <span className="text-orange-500">{isLoggedIn ? '👋' : 'FPT University'}</span>
                </h1>
                <p className="text-lg text-gray-700">
                  {isLoggedIn && isAdmin() ? 
                    'Manage exam assignments, approve scores, and oversee the grading process for lecturers.' :
                    isLoggedIn && isLecturer() ? 
                    'Grade student assignments, review submissions, and provide detailed feedback.' :
                    'FPT University provides high-quality education in software engineering, IT, and modern sciences. Explore our courses and start your journey today.'
                  }
                </p>
                {isLoggedIn && isAdmin() && (
                  <div className="bg-purple-50 border-l-4 border-purple-500 p-4 rounded">
                    <div className="flex">
                      <div className="flex-shrink-0">
                        <svg className="h-5 w-5 text-purple-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                        </svg>
                      </div>
                      <div className="ml-3">
                        <h3 className="text-sm font-medium text-purple-800">
                          Admin Dashboard
                        </h3>
                        <div className="mt-2 text-sm text-purple-700">
                          <p>Assign assignments to lecturers, approve scores, and manage system users.</p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
                {isLoggedIn && isLecturer() && (
                  <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded">
                    <div className="flex">
                      <div className="flex-shrink-0">
                        <svg className="h-5 w-5 text-blue-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                        </svg>
                      </div>
                      <div className="ml-3">
                        <h3 className="text-sm font-medium text-blue-800">
                          Lecturer Dashboard
                        </h3>
                        <div className="mt-2 text-sm text-blue-700">
                          <p>View assigned submissions, grade student work, and provide detailed feedback.</p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
                <div className="space-y-3">
                  <a
                    href="#courses"
                    className="inline-block px-6 py-3 bg-orange-500 hover:bg-orange-600 text-white font-semibold rounded-lg shadow-sm transition"
                  >
                    View Courses
                  </a>
                  {/* {isAdmin() && (
                    <Link
                      to="/assignments"
                      className="inline-block px-6 py-3 bg-purple-500 hover:bg-purple-600 text-white font-semibold rounded-lg shadow-sm transition"
                    >
                      Assignment Manager
                    </Link>
                  )} */}
                </div>
              </div>
            );
          })()}
          
          {(() => {
            const [imgRef, imgVisible] = useScrollAnimation(0.1);
            return (
              <div 
                ref={imgRef}
                className={`md:w-1/2 flex justify-center fade-in-right ${imgVisible ? 'visible' : ''}`}
              >
                <img
                  src="/images/logo.jpg"
                  alt="FPT Campus"
                  className="rounded-xl shadow-md max-w-md w-full"
                />
              </div>
            );
          })()}
        </div>
      </section>
      <section id="courses" className="py-20 bg-white">
        <div className="container mx-auto px-6">
          {(() => {
            const [titleRef, titleVisible] = useScrollAnimation(0.1);
            return (
              <div 
                ref={titleRef}
                className={`text-center mb-14 fade-in-up ${titleVisible ? 'visible' : ''}`}
              >
                <h2 className="text-3xl font-bold">Our Courses</h2>
                <p className="mt-3 text-gray-600 max-w-2xl mx-auto">
                  {isLoggedIn && isAdmin() ? 
                    'Assign exam submissions to lecturers and approve final scores.' :
                    isLoggedIn && isLecturer() ? 
                    'Grade assigned student submissions for each course.' :
                    'Select a course to manage exam submissions and view results.'
                  }
                </p>
              </div>
            );
          })()}
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {courses.map((course, index) => {
              const [courseRef, courseVisible] = useScrollAnimation(0.1);
              return (
                <div
                  key={course.id}
                  ref={courseRef}
                  className={`bg-white border border-gray-200 rounded-xl shadow-sm hover:shadow-md transition flex flex-col fade-in-up delay-${index * 100} ${courseVisible ? 'visible' : ''}`}
                >
                  <div className="p-6 flex flex-col flex-1">
                    <div className="px-3 py-1 text-xs font-semibold text-orange-600 bg-orange-50 rounded-full w-fit mb-3">
                      {course.code}
                    </div>
                    <h3 className="text-lg font-semibold mb-2">
                      {course.name}
                    </h3>
                    <p className="text-gray-600 flex-grow">{course.description}</p>
                    <div className="mt-6 pt-4 border-t border-gray-100">
                      {isLoggedIn ? (
                        <div className="space-y-2">
                          <button 
                            onClick={() => handleCourseAccess(course.id)}
                            className="w-full text-orange-600 hover:text-orange-700 font-medium transition py-2 text-center rounded-lg hover:bg-orange-50"
                          >
                            {isAdmin() ? 'Manage Assignments & Approve Scores' : isLecturer() ? 'Grade Assigned Submissions' : 'View Course'}
                          </button>
                          {isAdmin() && (
                            <div className="text-xs text-gray-500 flex items-center">
                              <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                                <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z"></path>
                                <path fillRule="evenodd" d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h3a1 1 0 100-2h-3zm-3 4a1 1 0 100 2h.01a1 1 0 100-2H7zm3 0a1 1 0 100 2h3a1 1 0 100-2h-3z" clipRule="evenodd"></path>
                              </svg>
                              Assign & approve submissions
                            </div>
                          )}
                          {isLecturer() && (
                            <div className="text-xs text-gray-500 flex items-center">
                              <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                                <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z"></path>
                                <path fillRule="evenodd" d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h3a1 1 0 100-2h-3zm-3 4a1 1 0 100 2h.01a1 1 0 100-2H7zm3 0a1 1 0 100 2h3a1 1 0 100-2h-3z" clipRule="evenodd"></path>
                              </svg>
                              Grade assigned work
                            </div>
                          )}
                        </div>
                      ) : (
                        <div className="flex items-center justify-between">
                          <span className="text-gray-400">Access Course</span>
                          <Link to="/login" className="text-xs bg-orange-100 text-orange-600 px-2 py-1 rounded">
                            Login Required
                          </Link>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>
      <section className="py-20 bg-white">
        <div className="container mx-auto px-6">
          {(() => {
            const [titleRef, titleVisible] = useScrollAnimation(0.1);
            return (
              <div 
                ref={titleRef}
                className={`text-center mb-14 fade-in-up ${titleVisible ? 'visible' : ''}`}
              >
                <h2 className="text-3xl font-bold">Why Choose FPT University</h2>
                <p className="mt-3 text-gray-600 max-w-2xl mx-auto">
                  We provide a comprehensive learning experience with modern facilities and expert faculty
                </p>
              </div>
            );
          })()}
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {(() => {
              const [feature1Ref, feature1Visible] = useScrollAnimation(0.1);
              return (
                <div 
                  ref={feature1Ref}
                  className={`bg-white border border-gray-200 rounded-xl p-6 text-center shadow-sm hover:shadow-md transition fade-in-up delay-100 ${feature1Visible ? 'visible' : ''}`}
                >
                  <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    🎓
                  </div>
                  <h3 className="text-xl font-semibold mb-3">Quality Education</h3>
                  <p className="text-gray-600">
                    Industry-aligned curriculum designed to prepare students for real-world challenges.
                  </p>
                </div>
              );
            })()}
            
            {(() => {
              const [feature2Ref, feature2Visible] = useScrollAnimation(0.1);
              return (
                <div 
                  ref={feature2Ref}
                  className={`bg-white border border-gray-200 rounded-xl p-6 text-center shadow-sm hover:shadow-md transition fade-in-up delay-200 ${feature2Visible ? 'visible' : ''}`}
                >
                  <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    💼
                  </div>
                  <h3 className="text-xl font-semibold mb-3">Career Opportunities</h3>
                  <p className="text-gray-600">
                    Strong industry connections and placement support for graduating students.
                  </p>
                </div>
              );
            })()}
            
            {(() => {
              const [feature3Ref, feature3Visible] = useScrollAnimation(0.1);
              return (
                <div 
                  ref={feature3Ref}
                  className={`bg-white border border-gray-200 rounded-xl p-6 text-center shadow-sm hover:shadow-md transition fade-in-up delay-300 ${feature3Visible ? 'visible' : ''}`}
                >
                  <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    🏫
                  </div>
                  <h3 className="text-xl font-semibold mb-3">Modern Facilities</h3>
                  <p className="text-gray-600">
                    State-of-the-art labs, libraries, and learning resources for students.
                  </p>
                </div>
              );
            })()}
          </div>
        </div>
      </section>
      <footer className="bg-white border-t border-gray-200 py-8 mt-auto">
        <div className="container mx-auto px-6 flex flex-col md:flex-row justify-between items-center">
          <p className="text-sm text-gray-600 mb-4 md:mb-0">
            © {new Date().getFullYear()} FPT University. All rights reserved.
          </p>
          <div className="flex space-x-6 text-sm">
            <a href="#" className="text-gray-600 hover:text-orange-600">
              Terms
            </a>
            <a href="#" className="text-gray-600 hover:text-orange-600">
              Privacy
            </a>
            <a href="#" className="text-gray-600 hover:text-orange-600">
              Contact
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default HomePage;
