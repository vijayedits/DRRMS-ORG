import React, { useState } from 'react';
import '../styles/RequestForm.css';

const RequestResource = () => {
  const [form, setForm] = useState({
    type: '',
    quantity: '',
    location: '',
    requester: '',
  });

  const handleChange = e => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = e => {
    e.preventDefault();
    alert(`Request submitted successfully:\n${JSON.stringify(form, null, 2)}`);
    setForm({ type: '', quantity: '', location: '', requester: '' });
  };

  return (
    <div className="request-form-container">
      <h2>Request a Resource</h2>
      <form className="request-form" onSubmit={handleSubmit}>
        <input name="type" placeholder="Resource Type" value={form.type} onChange={handleChange} required />
        <input name="quantity" placeholder="Quantity" type="number" value={form.quantity} onChange={handleChange} required />
        <input name="location" placeholder="Location" value={form.location} onChange={handleChange} required />
        <input name="requester" placeholder="Requester/Agency" value={form.requester} onChange={handleChange} required />
        <button type="submit">Submit Request</button>
      </form>
    </div>
  );
};

export default RequestResource;
