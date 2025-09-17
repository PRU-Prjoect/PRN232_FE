// src/pages/HomePage.jsx
import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import useScrollAnimation from "../../hooks/useScrollAnimation";

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
  const [user, setUser] = useState(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const loggedIn = localStorage.getItem("isLoggedIn") === "true";
    setIsLoggedIn(loggedIn);
        if (loggedIn) {
      const userData = JSON.parse(localStorage.getItem("user") || "{}");
      setUser(userData);
    }
  }, []);
  
  const handleLogout = () => {
    localStorage.removeItem("isLoggedIn");
    localStorage.removeItem("user");
    setIsLoggedIn(false);
    setUser(null);
    navigate("/login");
  };

  return (
    <div className="min-h-screen flex flex-col bg-white text-gray-900">
      <header className="sticky top-0 bg-white border-b border-gray-200 z-50">
        <div className="container mx-auto px-6 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-orange-500">FPT University</h1>
          <div className="flex space-x-4 items-center">
            <button className="px-4 py-2 text-gray-600 hover:text-orange-600 font-medium transition">
              About
            </button>
            
            {isLoggedIn ? (
              <>
                <div className="flex items-center">
                  <span className="text-sm text-gray-700 mr-2">
                    Welcome, <span className="font-semibold">{user?.name || 'User'}</span>
                  </span>
                  <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">
                    {user?.role || 'User'}
                  </span>
                </div>
                <button 
                  onClick={handleLogout}
                  className="px-5 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-lg font-medium shadow-sm transition"
                >
                  Logout
                </button>
              </>
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
                  Welcome to{" "}
                  <span className="text-orange-500">FPT University</span>
                </h1>
                <p className="text-lg text-gray-700">
                  FPT University provides high-quality education in software
                  engineering, IT, and modern sciences. Explore our courses and
                  start your journey today.
                </p>
                <a
                  href="#courses"
                  className="inline-block px-6 py-3 bg-orange-500 hover:bg-orange-600 text-white font-semibold rounded-lg shadow-sm transition"
                >
                  View Courses
                </a>
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
                  Select a course to manage exam submissions and view study
                  materials.
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
                        <Link to={`/course/${course.id}`} className="text-orange-600 font-medium hover:text-orange-700">
                          Access Course
                        </Link>
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
