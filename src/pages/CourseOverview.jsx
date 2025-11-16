import React from 'react';
import { ArrowLeftOutlined } from '@ant-design/icons';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';

const CourseOverview = () => {
  const courses = [
    {
      code: "SWD392",
      name: "Software Architecture and Design",
      description: "Explore advanced software design principles, architectural patterns, and best practices in software engineering.",
      semester: "Kỳ 7",
      focus: ["Design Patterns", "Architectural Styles", "System Design"],
      prerequisites: ["PRN231", "SWE201"],
      icon: "🏗️"
    },
    {
      code: "PRN231",
      name: "Web Application Development",
      description: "Deep dive into building robust web applications using .NET Core and modern web technologies.",
      semester: "Kỳ 7",
      focus: ["ASP.NET Core", "Web APIs", "Frontend Integration"],
      prerequisites: ["SWE201"],
      icon: "💻"
    },
    {
      code: "PRN232",
      name: "Advanced Web Application",
      description: "Advanced topics in web development including API design, security, performance optimization, and real-world application development.",
      semester: "Kỳ 8",
      focus: ["Advanced APIs", "Security", "Performance Optimization"],
      prerequisites: ["PRN231"],
      icon: "🚀"
    },
    {
      code: "SWE201",
      name: "Introduction to Software Engineering",
      description: "Foundational course covering software development processes, methodologies, and fundamental engineering principles.",
      semester: "Kỳ 6",
      focus: ["SDLC", "Requirements Engineering", "Project Management"],
      prerequisites: [],
      icon: "📘"
    }
  ];


  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-16 px-4 relative">
      <motion.div 
        initial={{ opacity: 0, x: -50 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5 }}
        className="absolute top-6 left-6 z-10"
      >
        <Link 
          to="/" 
          className="flex items-center space-x-2 bg-white text-orange-600 hover:bg-orange-50 px-4 py-2 rounded-full shadow-md transition-all duration-300 group"
        >
          <ArrowLeftOutlined className="text-orange-500 group-hover:-translate-x-1 transition-transform" />
          <span className="font-medium">Trang Chủ</span>
        </Link>
      </motion.div>

      <motion.div 
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="max-w-6xl mx-auto bg-white shadow-2xl rounded-2xl overflow-hidden"
      >
        <div className="bg-gradient-to-r from-orange-500 to-red-600 text-white py-16 px-8 text-center">
          <motion.h1 
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="text-4xl md:text-5xl font-extrabold mb-4"
          >
            Tổng Quan Các Môn Học
          </motion.h1>
          <p className="text-xl max-w-2xl mx-auto text-white/90">
            Khám phá mối liên kết và sự phát triển kiến thức giữa các môn học trong chương trình
          </p>
        </div>
        <div className="p-8">
          <h2 className="text-3xl font-bold text-center text-orange-600 mb-12">Các Môn Học</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {courses.map((course, index) => (
              <motion.div 
                key={course.code}
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.2, duration: 0.5 }}
                whileHover={{ scale: 1.05 }}
                className="bg-white border border-gray-200 rounded-xl p-6 shadow-md hover:shadow-xl transition-all"
              >
                <div className="text-5xl mb-4 text-center">{course.icon}</div>
                <h3 className="text-xl font-bold text-orange-600 text-center mb-2">{course.code}</h3>
                <h4 className="text-lg font-semibold text-center mb-3">{course.name}</h4>
                <p className="text-gray-600 text-sm mb-4 text-center">{course.description}</p>
                <div className="space-y-2">
                  <div className="flex items-center">
                    <span className="text-gray-500 font-medium mr-2">Học kỳ:</span>
                    <span className="bg-orange-50 text-orange-600 px-2 py-1 rounded-full text-xs">
                      {course.semester}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-500 font-medium">Trọng tâm:</span>
                    <div className="flex flex-wrap gap-2 mt-1">
                      {course.focus.map((focus, idx) => (
                        <span 
                          key={idx} 
                          className="bg-gray-100 text-gray-700 px-2 py-1 rounded-full text-xs"
                        >
                          {focus}
                        </span>
                      ))}
                    </div>
                  </div>
                  {course.prerequisites.length > 0 && (
                    <div>
                      <span className="text-gray-500 font-medium">Điều kiện tiên quyết:</span>
                      <div className="flex flex-wrap gap-2 mt-1">
                        {course.prerequisites.map((prereq, idx) => (
                          <span 
                            key={idx} 
                            className="bg-green-50 text-green-600 px-2 py-1 rounded-full text-xs"
                          >
                            {prereq}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        <div className="p-8 bg-white text-center">
          <h2 className="text-2xl font-bold text-orange-600 mb-4">Lộ Trình Học Tập</h2>
          <p className="text-gray-700 max-w-xl mx-auto mb-6">
            Các môn học được thiết kế để xây dựng kiến thức một cách logic và liên tục, 
            giúp sinh viên phát triển kỹ năng chuyên sâu trong lĩnh vực phát triển phần mềm.
          </p>
        </div>
      </motion.div>
    </div>
  );
};

export default CourseOverview;
