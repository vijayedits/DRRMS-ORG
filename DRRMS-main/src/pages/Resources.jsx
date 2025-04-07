import React, { useEffect, useState } from 'react';
import ResourceCard from '../components/ResourceCard';
import '../styles/Resources.css';

const Resources = () => {
  const [resources, setResources] = useState([]);
  const [searchLocation, setSearchLocation] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('http://localhost:4000/volunteers/resources') // Ensure your backend is running
      .then(res => res.json())
      .then(data => {
        setResources(data);
        setLoading(false);
      })
      .catch(err => {
        console.error('Error fetching resources:', err);
        setLoading(false);
      });
  }, []);

  const filteredResources = resources.filter((r) =>
    r.location.toLowerCase().includes(searchLocation.toLowerCase())
  );

  return (
    <div className="resources">
      <h2>Available Resources</h2>

      <input
        type="text"
        className="location-search"
        placeholder="Search by location..."
        value={searchLocation}
        onChange={(e) => setSearchLocation(e.target.value)}
      />

      {loading ? (
        <p>Loading resources...</p>
      ) : (
        <div className="resources-list">
          {filteredResources.length > 0 ? (
            filteredResources.map((r, idx) => (
              <ResourceCard key={idx} resource={r} />
            ))
          ) : (
            <p className="no-resources">No resources found for this location.</p>
          )}
        </div>
      )}
    </div>
  );
};

export default Resources;
