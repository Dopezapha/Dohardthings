import React from 'react';

export const PredictionList = ({ predictions }) => {
  return (
    <div className="prediction-list">
      <h2>Active Predictions</h2>
      {predictions.length === 0 ? (
        <p>No active predictions found.</p>
      ) : (
        <ul>
          {predictions.map((prediction) => (
            <li key={prediction.id} className="prediction-item">
              <h3>{prediction.query}</h3>
              <p>Closing Block: {prediction.closingBlock}</p>
              {/* Add more details as needed */}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};
