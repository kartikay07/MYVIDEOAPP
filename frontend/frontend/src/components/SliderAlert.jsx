import React, { useEffect } from 'react';

const SliderAlert = ({ message, type, onClose }) => {
  useEffect(() => {
    // Automatically close the alert after 3 seconds
    const timer = setTimeout(() => {
      onClose();
    }, 3000);

    return () => clearTimeout(timer); // Cleanup timer
  }, [onClose]);

  return (
    <div
      className={`fixed bottom-4 right-4 p-0 rounded-md shadow-lg transform transition-transform duration-500 ease-in-out ${
        type === 'error' ? 'bg-red-500' : 'bg-green-500'
      } text-white`}
    >
      {message}
    </div>
  );
};

export default SliderAlert;