import React, { useState } from 'react';
import { useLocation } from "react-router-dom";
import { countryOptions, usStateOptions, caStateOptions } from '../data/countryStateCode';
import Select from 'react-select';

function Input() {
  const location = useLocation();
  const itemId = location.state?.itemId;

  const [form, setForm] = useState({
    name: "",
    address: "",
    quantity: 1,
    variantId: 22755, // Default variant ID
    city: "Toronto", // Default city
    statecode: "ON", // Default province code
    countrycode: "CA", // Default country code
    zip: "M2N 6N4", // Default postal code
    url: "https://images.pexels.com/photos/32207802/pexels-photo-32207802.jpeg" // Default image URL
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async () => {
    console.log("📨 handleSubmit called");

    try {
      const payload = {
        ...form,
        productId: itemId,
      };
      console.log("Sending payload:", payload);

      const response = await fetch("http://127.0.0.1:8000/api/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      console.log("Fetch finished:", response);
      const result = await response.json();
      console.log("✅ Order response:", result);

      // Output the result to alert
      // alert("Order submitted: " + JSON.stringify(result));
    } catch (error) {
      console.error("❌ Error in handleSubmit:", error);
      alert("Failed to submit order.");
    }
  };

  if (!itemId) {
    return <p style={{ color: "red", fontWeight: "bold" }}>Error: Missing item ID</p>;
  }

  return (
    <div style={{ padding: "2rem" }}>
      <h2>Submit Your Order</h2>
      <input
        name="name"
        placeholder="Your Name"
        value={form.name}
        onChange={handleChange}
        style={{ display: "block", margin: "1rem 0", padding: "0.5rem" }}
      />
      <input
        name="address"
        placeholder="Shipping Address"
        value={form.address}
        onChange={handleChange}
        style={{ display: "block", margin: "1rem 0", padding: "0.5rem" }}
      />
      <input
        type="number"
        name="quantity"
        placeholder="Quantity"
        value={form.quantity}
        onChange={handleChange}
        style={{ display: "block", margin: "1rem 0", padding: "0.5rem" }}
      />
      <input
        type="number"
        name="variantId"
        placeholder="Variant ID"
        value={form.variantId}
        onChange={handleChange}
        style={{ display: "block", margin: "1rem 0", padding: "0.5rem" }}
      />
      <input
        name="city"
        placeholder="City"
        value={form.city}
        onChange={handleChange}
        style={{ display: "block", margin: "1rem 0", padding: "0.5rem" }}
      />
      <input
        name="statecode"
        placeholder="State Code"
        value={form.statecode}
        onChange={handleChange}
        style={{ display: "block", margin: "1rem 0", padding: "0.5rem" }}
      />
      <input
        name="countrycode"
        placeholder="Country Code"
        value={form.countrycode}
        onChange={handleChange}
        style={{ display: "block", margin: "1rem 0", padding: "0.5rem" }}
      />
      <input
        name="zip"
        placeholder="Postal Code"
        value={form.zip}
        onChange={handleChange}
        style={{ display: "block", margin: "1rem 0", padding: "0.5rem" }}
      />
      <input
        name="url"
        placeholder="Image URL"
        value={form.url}
        onChange={handleChange}
        style={{ display: "block", margin: "1rem 0", padding: "0.5rem" }}
      />
      <Select
        name="state"
        options={usStateOptions}
        value={usStateOptions.find(option => option.value === form.state)}
        onChange={selected => handleChange({ target: { name: "state", value: selected.value }})}
      />
      <button onClick={handleSubmit} style={{ padding: "0.5rem 1rem" }}>
        Submit Order
      </button>
    </div>
  );
}

export default Input;
