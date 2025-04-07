import React from 'react';
import '../styles/Dashboard.css';
import MapWithUserLocation from '../components/MapWithUserLocation';

const stats = [
  { label: 'Resources', count: 1280 },
  { label: 'Requests', count: 87 },
  { label: 'Shelters', count: 42 },
  { label: 'Volunteers', count: 509 },
];

const Dashboard = () => {
  return (
    <div className="dashboard">
      <h1>Welcome to DRRMS</h1>

      <div className="dashboard-grid">
        {stats.map((item, index) => (
          <div key={index} className="dashboard-card">
            <h2>{item.count}</h2>
            <p>{item.label}</p>
          </div>
        ))}
      </div>

      <div className="dashboard-map">
        <h3>Live User Location</h3>
        <MapWithUserLocation />
      </div>
    </div>
  );
};

export default Dashboard;
