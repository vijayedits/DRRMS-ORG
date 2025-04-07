import React, { useEffect, useState } from 'react';
import axios from 'axios';
import '../styles/AdminDashboard.css';

type Request = {
  request_id: number;
  citizen: string;
  location: string;
  resource: string;
  quantity_requested: number;
  status: string;
  remarks: string;
  volunteer?: string;
};

const AdminDashboard = () => {
  const [requests, setRequests] = useState<Request[]>([]);
  const [filter, setFilter] = useState('all');

  const fetchRequests = async () => {
    try {
      const res = await axios.get('http://localhost:4000/admin/requests');
      setRequests(res.data);
    } catch (err) {
      console.error('Failed to fetch requests:', err);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  const fulfillRequest = async (id: number) => {
    try {
      await axios.post('http://localhost:4000/volunteers/update-task', {
        request_id: id,
        new_status: 'fulfilled',
        volunteer_id: 1 // admin
      });
      fetchRequests(); // auto-refresh
    } catch (err) {
      console.error('Failed to update request:', err);
    }
  };

  const filteredRequests = requests.filter((r) =>
    filter === 'all' ? true : r.status === filter
  );

  return (
    <div className="admin-dashboard dashboard-container">
      <h1>Admin Dashboard</h1>

      <div className="filters">
        <label>Filter by Status:</label>
        <select value={filter} onChange={(e) => setFilter(e.target.value)}>
          <option value="all">All</option>
          <option value="pending">Pending</option>
          <option value="fulfilled">Fulfilled</option>
        </select>
      </div>

      <div className="card-grid">
        {filteredRequests.length === 0 ? (
          <p>No requests to show</p>
        ) : (
          filteredRequests.map((req) => (
            <div className="card" key={req.request_id}>
              <p><b>Citizen:</b> {req.citizen}</p>
              <p><b>Location:</b> {req.location}</p>
              <p><b>Resource:</b> {req.resource} ({req.quantity_requested})</p>
              <p>
                <b>Status:</b>{' '}
                <span className={req.status === 'fulfilled' ? 'status-fulfilled' : 'status-pending'}>
                  {req.status}
                </span>
              </p>
              <p><b>Remarks:</b> {req.remarks}</p>
              {req.volunteer && <p><b>Fulfilled by:</b> {req.volunteer}</p>}
              <div className="card-buttons">
                {req.status !== 'fulfilled' && (
                  <button onClick={() => fulfillRequest(req.request_id)}>Mark as Fulfilled</button>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;
