import React from 'react';

const LocationInput = ({ label, value, onChange, onSearch, onCurrentLocation }) => (
    <div className="location-input">
        <label>{label}</label>
        <div className="input-group">
            <input 
                type="text" 
                value={value} 
                onChange={onChange} 
                placeholder={`Enter ${label}`} 
            />
            <button onClick={onSearch}>🔍 Search</button>
            {onCurrentLocation && <button onClick={onCurrentLocation}>📍 Current Location</button>}
        </div>
    </div>
);

export default LocationInput;
