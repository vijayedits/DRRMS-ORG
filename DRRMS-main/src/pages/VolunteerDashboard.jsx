import React, { useEffect, useState } from 'react';
import '../styles/VolunteerDashboard.css';

const VolunteerDashboard = () => {
  const [requests, setRequests] = useState([]);
  const [resources, setResources] = useState([]);
  const [assignedTasks, setAssignedTasks] = useState([]);
  const [searchLocation, setSearchLocation] = useState('');
  const [searchResource, setSearchResource] = useState('');
  const [selectedType, setSelectedType] = useState('');
  const [activeTab, setActiveTab] = useState('allRequests');
  const [weatherAlerts, setWeatherAlerts] = useState([]);
  const volunteerId = 3; // Assuming volunteer_raj is logged in

  const fetchData = async () => {
    try {
      const [requestsRes, resourcesRes, tasksRes, weatherRes] = await Promise.all([
        fetch('http://localhost:4000/volunteers/requests'),
        fetch('http://localhost:4000/volunteers/resources'),
        fetch(`http://localhost:4000/volunteers/tasks?volunteer_id=${volunteerId}`),
        fetch('http://localhost:4000/weather-alerts'),
      ]);

      const [requestsData, resourcesData, tasksData, weatherData] = await Promise.all([
        requestsRes.json(),
        resourcesRes.json(),
        tasksRes.json(),
        weatherRes.json(),
      ]);

      setRequests(requestsData);
      setResources(resourcesData);
      setAssignedTasks(tasksData);
      setWeatherAlerts(weatherData);
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleAssign = async (requestId) => {
    try {
      await fetch('http://localhost:4000/volunteers/assign-task', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ volunteer_id: volunteerId, request_id: requestId }),
      });
      alert('Task assigned successfully!');
      fetchData();
    } catch (error) {
      console.error('Error assigning task:', error);
      alert('Failed to assign task');
    }
  };

  const handleCompleteTask = async (taskId) => {
    try {
      await fetch('http://localhost:4000/volunteers/complete-task', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ task_id: taskId }),
      });
      alert('Task marked as completed! Waiting for admin verification.');
      fetchData();
    } catch (error) {
      console.error('Error completing task:', error);
      alert('Failed to complete task');
    }
  };

  const filteredResources = resources.filter((r) => {
    const matchesLocation = r.location.toLowerCase().includes(searchLocation.toLowerCase());
    const matchesResource = r.name.toLowerCase().includes(searchResource.toLowerCase());
    const matchesType = selectedType === '' || r.type.toLowerCase() === selectedType.toLowerCase();
    return matchesLocation && matchesResource && matchesType;
  });

  const filteredRequests = activeTab === 'myTasks'
    ? requests.filter(request => {
        const assignedTask = assignedTasks.find(task => task.request_id === request.request_id);
        return assignedTask !== undefined;
      })
    : requests;

  return (
    <div className="volunteer-dashboard dashboard-container">
      <h1>Volunteer Dashboard</h1>

      {weatherAlerts.length > 0 && (
        <div className="weather-alerts">
          <h2 className="section-title">⚠️ Weather Alerts</h2>
          <div className="alert-grid">
            {weatherAlerts.map((alert, index) => (
              <div key={index} className={`alert-card alert-${alert.severity}`}>
                <h3>{alert.region}</h3>
                <p>{alert.message}</p>
                <span className="alert-severity">{alert.severity} alert</span>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="request-management">
        <div className="section-header">
          <h2 className="section-title">🆘 Help Requests</h2>
          <div className="tab-buttons">
            <button
              className={activeTab === 'allRequests' ? 'active' : ''}
              onClick={() => setActiveTab('allRequests')}
            >
              All Requests
            </button>
            <button
              className={activeTab === 'myTasks' ? 'active' : ''}
              onClick={() => setActiveTab('myTasks')}
            >
              My Tasks ({assignedTasks.length})
            </button>
          </div>
        </div>

        <div className="card-grid">
          {filteredRequests.length === 0 ? (
            <p className="no-requests-message">No requests found</p>
          ) : (
            filteredRequests.map((r) => {
              const assignedTask = assignedTasks.find(task => task.request_id === r.request_id);
              return (
                <div className="card" key={r.request_id}>
                  <div className="card-header">
                    <span className={`status-badge status-${r.status}`}>{r.status}</span>
                    <span className="request-time">
                      {new Date(r.request_time).toLocaleString()}
                    </span>
                  </div>
                  <p><b>Citizen:</b> {r.citizen}</p>
                  <p><b>Location:</b> {r.location}</p>
                  <p><b>Resource:</b> {r.resource} ({r.quantity_requested})</p>
                  <p><b>Remarks:</b> {r.remarks}</p>
                  <div className="card-buttons">
                    {r.status === 'pending' && (
                      <button onClick={() => handleAssign(r.request_id)}>Assign to Me</button>
                    )}
                    {assignedTask && (
                      <button 
                        className="complete-btn"
                        onClick={() => handleCompleteTask(assignedTask.task_id)}
                      >
                        Mark as Completed
                      </button>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      <div className="resource-management">
        <h2 className="section-title">📦 Available Resources</h2>
        <div className="search-filters">
          <input
            type="text"
            className="location-search"
            placeholder="Search by location..."
            value={searchLocation}
            onChange={(e) => setSearchLocation(e.target.value)}
          />
          <input
            type="text"
            className="resource-search"
            placeholder="Search by resource..."
            value={searchResource}
            onChange={(e) => setSearchResource(e.target.value)}
          />
          <select
            className="resource-filter"
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
          >
            <option value="">All Types</option>
            <option value="food">Food</option>
            <option value="water">Water</option>
            <option value="medical">Medical</option>
            <option value="clothing">Clothing</option>
            <option value="other">Other</option>
          </select>
        </div>

        <div className="resource-flex-container">
          {filteredResources.length === 0 ? (
            <p className="no-resources-message">❌ No resources found matching your criteria</p>
          ) : (
            filteredResources.map((res) => (
              <div className="card resource-card" key={res.id}>
                <div className="resource-header">
                  <span className={`resource-type type-${res.type}`}>{res.type}</span>
                  <span className="resource-updated">
                    Updated: {new Date(res.last_updated).toLocaleDateString()}
                  </span>
                </div>
                <p><b>Name:</b> {res.name}</p>
                <p><b>Qty:</b> {res.quantity} {res.unit}</p>
                <p><b>Location:</b> {res.location}</p>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default VolunteerDashboard;
