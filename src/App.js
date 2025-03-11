import React from 'react';
import MapComponent from './components/MapComponent';
import './App.css';   // Correct path


const App = () => {
    return (
        <div className="App">
            <center><h1>Real-Time Location Map</h1></center>
            <MapComponent />
        </div>
    );
};

export default App;
