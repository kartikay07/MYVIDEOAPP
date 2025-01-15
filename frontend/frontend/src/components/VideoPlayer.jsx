import React from 'react';

const VideoPlayer = ({ videoUrl }) => {
  return (
    <video controls src={videoUrl} className="w-full rounded-lg shadow-md" />
  );
};

export default VideoPlayer;