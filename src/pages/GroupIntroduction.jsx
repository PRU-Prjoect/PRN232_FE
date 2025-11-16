import React from 'react';
import { ArrowLeftOutlined } from '@ant-design/icons';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';

const GroupIntroduction = () => {
  const teamMembers = [
    { 
      name: "Hoàng Võ Đông Nghi ", 
      role: "Team Leader", 
      studentId: "HE123456", 
      avatar: "https://randomuser.me/api/portraits/women/2.jpg",
      skills: ["Project Management", "Backend Development"]
    },
    { 
      name: "Huỳnh Gia Bảo", 
      role: "Backend Developer", 
      studentId: "HE654321", 
      avatar: "https://randomuser.me/api/portraits/men/1.jpg",
      skills: ["Node.js", "Database Design"]
    },
    { 
      name: "Hoàng Văn An", 
      role: "Frontend Developer", 
      studentId: "HE789012", 
      avatar: "https://randomuser.me/api/portraits/men/1.jpg",
      skills: ["React", "UI/UX Design"]
    },
    { 
      name: "Mai Phạm Nồng Hậu", 
      role: "UI/UX Designer", 
      studentId: "HE210987", 
      avatar: "https://randomuser.me/api/portraits/men/1.jpg",
      skills: ["Figma", "User Research"]
    },
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
            Nhóm 2 - PRN232 Project
          </motion.h1>
        </div>

        <div className="grid md:grid-cols-2 gap-8 p-8">
          <div className="space-y-4">
            <h2 className="text-2xl font-bold text-orange-600 mb-4">Giới Thiệu Dự Án</h2>
            <p className="text-gray-700 leading-relaxed">
              Chúng tôi là nhóm 2 trong môn học PRN232, với mục tiêu phát triển một hệ thống quản lý và chấm bài thi hiệu quả. 
              Dự án của chúng tôi tập trung vào việc xây dựng một nền tảng trực tuyến giúp giảng viên và sinh viên 
              có thể tương tác, nộp bài và đánh giá bài thi một cách thuận tiện và chính xác.
            </p>
          </div>
          <div className="flex items-center justify-center">
            <motion.div 
              whileHover={{ scale: 1.05 }}
              className="bg-orange-50 p-6 rounded-xl border-2 border-orange-200"
            >
              <h3 className="text-xl font-semibold text-orange-600 mb-2">Mục Tiêu</h3>
              <ul className="space-y-2 text-gray-700">
                <li className="flex items-center">
                  <svg className="w-5 h-5 text-orange-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  Tối ưu hóa quy trình chấm bài
                </li>
                <li className="flex items-center">
                  <svg className="w-5 h-5 text-orange-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  Nâng cao trải nghiệm người dùng
                </li>
                <li className="flex items-center">
                  <svg className="w-5 h-5 text-orange-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  Đảm bảo tính minh bạch
                </li>
              </ul>
            </motion.div>
          </div>
        </div>

        <div className="bg-gray-50 p-8">
          <h2 className="text-3xl font-bold text-center text-orange-600 mb-12">Thành Viên Nhóm</h2>
          <div className="grid md:grid-cols-2 gap-8">
            {teamMembers.map((member, index) => (
              <motion.div 
                key={index}
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.2, duration: 0.5 }}
                whileHover={{ scale: 1.05 }}
                className="bg-white rounded-xl shadow-lg overflow-hidden transform transition-all duration-300 hover:shadow-xl"
              >
                <div className="p-6 text-center">
                  <img 
                    src={member.avatar} 
                    alt={member.name} 
                    className="w-32 h-32 rounded-full mx-auto mb-4 object-cover border-4 border-orange-100"
                  />
                  <h3 className="text-xl font-semibold text-gray-800">{member.name}</h3>
                  <p className="text-orange-600 font-medium mb-2">{member.role}</p>
                  <p className="text-gray-600 mb-2">Mã SV: {member.studentId}</p>
                  <div className="flex flex-wrap justify-center gap-2 mt-4">
                    {member.skills.map((skill, skillIndex) => (
                      <span 
                        key={skillIndex} 
                        className="bg-orange-50 text-orange-600 text-xs px-2 py-1 rounded-full"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        <div className="p-8 bg-white text-center">
          <h2 className="text-2xl font-bold text-orange-600 mb-4">Liên Hệ</h2>
          <p className="text-gray-700 max-w-xl mx-auto mb-6">
            Chúng tôi luôn sẵn sàng hợp tác và tiếp nhận ý kiến đóng góp. 
            Hãy liên hệ với chúng tôi để trao đổi thêm về dự án.
          </p>
        </div>
      </motion.div>
    </div>
  );
};

export default GroupIntroduction;
