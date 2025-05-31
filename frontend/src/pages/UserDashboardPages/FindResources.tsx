import React, { useEffect, useState } from 'react';
import '../../styles/Resources.css'; 
interface Resource {
  id: number;
  name: string;
  type: string;
  quantity: number;
  unit: string;
  location: string;
}

const VolunteerDashboard = () => {
  const [requests, setRequests] = useState<any[]>([]);
  const [resources, setResources] = useState<Resource[]>([]);
  const [searchLocation, setSearchLocation] = useState('');
  const volunteerId = 2;

  const fetchData = async () => {
    try {
      const requestsRes = await fetch('http://localhost:4000/volunteers/requests');
      const requestsData = await requestsRes.json();
      setRequests(requestsData);

      const resourcesRes = await fetch('http://localhost:4000/volunteers/resources');
      const resourcesData = await resourcesRes.json();
      setResources(resourcesData);
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const filteredResources = resources.filter((res) =>
    res.location.toLowerCase().includes(searchLocation.toLowerCase())
  );

  return (
    <div className="volunteer-dashboard">
      <h2 className="section-title">📦 Available Resources</h2>

      <input
        type="text"
        className="location-search"
        placeholder="Search by location..."
        value={searchLocation}
        onChange={(e) => setSearchLocation(e.target.value)}
      />

      <div className="resource-flex-container">
        {filteredResources.length === 0 ? (
          <p className="no-resources-message">
            ❌ No resources found for the location "{searchLocation}"
          </p>
        ) : (
          filteredResources.map((res) => (
            <div className="card resource-card" key={res.id}>
              <p><b>Name:</b> {res.name}</p>
              <p><b>Type:</b> {res.type}</p>
              <p><b>Qty:</b> {res.quantity} {res.unit}</p>
              <p><b>Location:</b> {res.location}</p>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default VolunteerDashboard;
