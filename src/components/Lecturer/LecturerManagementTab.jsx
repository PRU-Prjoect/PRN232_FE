import React, { useState, useEffect } from 'react';
import { Table, Button, Space, Popconfirm } from 'antd';
import { PlusOutlined, EyeOutlined, DeleteOutlined, CheckCircleOutlined } from '@ant-design/icons';
import { lecturerService } from '../../services';
import { parseResponseData, getTotalCount } from '../../utils/apiHelpers';
import LoadingSpinner from '../common/LoadingSpinner';
import ErrorAlert from '../common/ErrorAlert';
import EmptyState from '../common/EmptyState';
import Pagination from '../common/Pagination';
import Modal from '../common/Modal';

const LecturerManagementTab = () => {
  const [lecturers, setLecturers] = useState([]);
  const [lecturersLoading, setLecturersLoading] = useState(false);
  const [lecturersError, setLecturersError] = useState('');
  const [lecturerPage, setLecturerPage] = useState(1);
  const [lecturerPageSize, setLecturerPageSize] = useState(10);
  const [lecturerTotal, setLecturerTotal] = useState(0);
  const [showAddLecturer, setShowAddLecturer] = useState(false);
  const [showLecturerDetail, setShowLecturerDetail] = useState(false);
  const [selectedLecturer, setSelectedLecturer] = useState(null);
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState('');
  const [createForm, setCreateForm] = useState({ fullName: '', email: '', password: '', role: 'lecturer' });

  const loadLecturers = async () => {
    try {
      setLecturersLoading(true);
      setLecturersError('');
      const result = await lecturerService.getLecturers({
        page: lecturerPage,
        pageSize: lecturerPageSize
      });
      const lecturersData = parseResponseData(result);
      const total = getTotalCount(result) || lecturersData.length;
      setLecturers(lecturersData || []);
      setLecturerTotal(total);
    } catch (err) {
      console.error('Error loading lecturers:', err);
      setLecturersError(err.message || 'Failed to load lecturers');
      setLecturers([]);
    } finally {
      setLecturersLoading(false);
    }
  };

  useEffect(() => {
    loadLecturers();
  }, [lecturerPage, lecturerPageSize]);

  const handleViewLecturer = async (lec) => {
    setSelectedLecturer(lec);
    setShowLecturerDetail(true);
  };

  const handleCreateLecturer = async (e) => {
    e.preventDefault();
    try {
      setCreating(true);
      setCreateError('');
      await lecturerService.createLecturer(createForm);
      setShowAddLecturer(false);
      setCreateForm({ fullName: '', email: '', password: '', role: 'lecturer' });
      loadLecturers();
    } catch (err) {
      console.error('Error creating lecturer:', err);
      setCreateError(err.message || 'Failed to create lecturer');
    } finally {
      setCreating(false);
    }
  };

  const handleDeleteLecturer = async (lecturerId) => {
    try {
      await lecturerService.deleteLecturer(lecturerId);
      loadLecturers();
    } catch (err) {
      console.error('Error deleting lecturer:', err);
      alert('Failed to delete lecturer');
    }
  };

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center">
          <div className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-purple-100 mr-3">
            <CheckCircleOutlined className="text-purple-600 text-xl" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Manage Lecturers</h3>
          </div>
        </div>
        <div className="flex items-center space-x-3">
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => setShowAddLecturer(true)}
          >
            Add Lecturer
          </Button>
        </div>
      </div>

      {lecturersError && (
        <ErrorAlert message={lecturersError} />
      )}

      <Table
        dataSource={lecturers}
        loading={lecturersLoading}
        rowKey={(record) => {
          if (record.id) return record.id;
          if (record.email) return record.email;
          const name = record.name || record.fullName || `${record.firstName || ''} ${record.lastName || ''}`.trim();
          return `lecturer-${name || 'unknown'}`;
        }}
        columns={[
          {
            title: 'ID',
            dataIndex: 'id',
            key: 'id',
            render: (_, __, index) => (lecturerPage - 1) * lecturerPageSize + index + 1,
          },
          {
            title: 'Name',
            dataIndex: 'name',
            key: 'name',
            render: (_, record) => record.name || record.fullName || `${record.firstName || ''} ${record.lastName || ''}`.trim() || '—',
          },
          {
            title: 'Email',
            dataIndex: 'email',
            key: 'email',
            render: (email) => email || '—',
          },
          {
            title: 'Actions',
            key: 'actions',
            render: (_, record) => (
              <Space>
                <Button
                  icon={<EyeOutlined />}
                  onClick={() => handleViewLecturer(record)}
                >
                  View
                </Button>
                <Popconfirm
                  title="Delete lecturer"
                  description="Are you sure to delete this lecturer?"
                  onConfirm={() => handleDeleteLecturer(record.id)}
                  okText="Yes"
                  cancelText="No"
                >
                  <Button danger icon={<DeleteOutlined />}>
                    Delete
                  </Button>
                </Popconfirm>
              </Space>
            ),
          },
        ]}
        pagination={false}
        locale={{ emptyText: <EmptyState title="No lecturers found" message="" /> }}
      />

      <Pagination
        currentPage={lecturerPage}
        onPrevPage={() => setLecturerPage(p => Math.max(1, p - 1))}
        onNextPage={() => setLecturerPage(p => p + 1)}
        isLoading={lecturersLoading}
        hasMore={lecturers.length >= lecturerPageSize}
      />

      <Modal
        isOpen={showAddLecturer}
        onClose={() => { setShowAddLecturer(false); setCreateError(''); }}
        title="Add Lecturer"
        size="sm"
      >
        {createError && (
          <ErrorAlert message={createError} className="text-sm" />
        )}
        <form onSubmit={handleCreateLecturer} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Full name</label>
            <input
              type="text"
              value={createForm.fullName}
              onChange={(e) => setCreateForm(f => ({ ...f, fullName: e.target.value }))}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-1 focus:ring-purple-600"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input
              type="email"
              value={createForm.email}
              onChange={(e) => setCreateForm(f => ({ ...f, email: e.target.value }))}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-1 focus:ring-purple-600"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
            <input
              type="password"
              value={createForm.password}
              onChange={(e) => setCreateForm(f => ({ ...f, password: e.target.value }))}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-1 focus:ring-purple-600"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
            <select
              value={createForm.role}
              onChange={(e) => setCreateForm(f => ({ ...f, role: e.target.value }))}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-1 focus:ring-purple-600"
              required
            >
              <option value="lecturer">lecturer</option>
              <option value="admin">admin</option>
            </select>
          </div>
          <div className="flex justify-end space-x-2 pt-2">
            <button
              type="button"
              onClick={() => { setShowAddLecturer(false); setCreateError(''); }}
              className="px-3 py-2 border rounded-md text-sm text-gray-700 hover:bg-gray-50"
              disabled={creating}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-3 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-md text-sm disabled:opacity-50"
              disabled={creating}
            >
              {creating ? 'Creating...' : 'Create'}
            </button>
          </div>
        </form>
      </Modal>

      <Modal
        isOpen={showLecturerDetail}
        onClose={() => setShowLecturerDetail(false)}
        title="Lecturer Detail"
        size="sm"
        footer={
          <button
            onClick={() => setShowLecturerDetail(false)}
            className="px-3 py-2 border rounded-md text-sm text-gray-700 hover:bg-gray-50"
          >
            Close
          </button>
        }
      >
        <div className="space-y-2 text-sm">
          <div className="flex justify-between"><span className="text-gray-600">Full name</span><span className="font-medium text-gray-900">{selectedLecturer?.fullName || selectedLecturer?.name || '—'}</span></div>
          <div className="flex justify-between"><span className="text-gray-600">Email</span><span className="font-medium text-gray-900">{selectedLecturer?.email || '—'}</span></div>
          {selectedLecturer?.role && (
            <div className="flex justify-between"><span className="text-gray-600">Role</span><span className="font-medium text-gray-900">{selectedLecturer.role}</span></div>
          )}
        </div>
      </Modal>
    </div>
  );
};

export default LecturerManagementTab;

