// // VideoPlayer.js
// import React, { useState, useRef, useEffect } from 'react';

// const VideoPlayer = () => {
//   const [isConnected, setIsConnected] = useState(false);
//   const [roomId, setRoomId] = useState('');
//   const [username, setUsername] = useState('');
//   const [isJoined, setIsJoined] = useState(false);
//   const [selectedFile, setSelectedFile] = useState(null);
//   const [isPlaying, setIsPlaying] = useState(false);
//   const [currentTime, setCurrentTime] = useState(0);
//   const [duration, setDuration] = useState(0);
//   const [roomMembers, setRoomMembers] = useState([]);
//   const [isSeeking, setIsSeeking] = useState(false);

//   const videoRef = useRef(null);
//   const wsRef = useRef(null);
//   const syncTimeoutRef = useRef(null);

//   useEffect(() => {
//     connectWebSocket();
//     return () => {
//       if (wsRef.current) {
//         wsRef.current.close();
//       }
//       if (syncTimeoutRef.current) {
//         clearTimeout(syncTimeoutRef.current);
//       }
//     };
//   }, []);

//   const connectWebSocket = () => {
//     wsRef.current = new WebSocket('wss://videosyncapplication.onrender.com');

//     wsRef.current.onopen = () => {
//       console.log('Connected to WebSocket server');
//       setIsConnected(true);
//     };

//     wsRef.current.onmessage = (event) => {
//       const data = JSON.parse(event.data);
//       handleWebSocketMessage(data);
//     };

//     wsRef.current.onclose = () => {
//       setIsConnected(false);
//       console.log('Disconnected from WebSocket server');
//       // Attempt to reconnect after 3 seconds
//       setTimeout(connectWebSocket, 3000);
//     };
//   };

//   const handleWebSocketMessage = (data) => {
//     switch (data.type) {
//       case 'roomStatus':
//         setRoomMembers(data.clients);
//         break;

//       case 'play':
//         if (!isSeeking) {
//           videoRef.current.currentTime = data.currentTime;
//           videoRef.current.play();
//           setIsPlaying(true);
//         }
//         break;

//       case 'pause':
//         if (!isSeeking) {
//           videoRef.current.pause();
//           setIsPlaying(false);
//         }
//         break;

//       case 'seek':
//         if (!isSeeking) {
//           videoRef.current.currentTime = data.currentTime;
//         }
//         break;

//       case 'timeUpdate':
//         if (!isSeeking && Math.abs(videoRef.current.currentTime - data.currentTime) > 1) {
//           videoRef.current.currentTime = data.currentTime;
//         }
//         break;

//       case 'syncState':
//         if (data.isPlaying) {
//           videoRef.current.currentTime = data.currentTime;
//           videoRef.current.play();
//           setIsPlaying(true);
//         } else {
//           videoRef.current.currentTime = data.currentTime;
//           videoRef.current.pause();
//           setIsPlaying(false);
//         }
//         break;
//     }
//   };

//   const sendWebSocketMessage = (type, additionalData = {}) => {
//     if (wsRef.current?.readyState === WebSocket.OPEN) {
//       wsRef.current.send(JSON.stringify({
//         type,
//         roomId,
//         ...additionalData
//       }));
//     }
//   };

//   const handleJoinRoom = () => {
//     if (roomId && username) {
//       sendWebSocketMessage('joinRoom', { username });
//       setIsJoined(true);
//     }
//   };

//   const handleFileSelect = (event) => {
//     const file = event.target.files[0];
//     if (file) {
//       setSelectedFile(URL.createObjectURL(file));
//       sendWebSocketMessage('fileSelected', { fileName: file.name });
//     }
//   };

//   const handlePlayPause = () => {
//     if (videoRef.current) {
//       if (videoRef.current.paused) {
//         videoRef.current.play();
//         sendWebSocketMessage('play', {
//           isPlaying: true,
//           currentTime: videoRef.current.currentTime,
//           duration: videoRef.current.duration
//         });
//       } else {
//         videoRef.current.pause();
//         sendWebSocketMessage('pause', {
//           isPlaying: false,
//           currentTime: videoRef.current.currentTime,
//           duration: videoRef.current.duration
//         });
//       }
//       setIsPlaying(!videoRef.current.paused);
//     }
//   };

//   const handleTimeUpdate = () => {
//     if (!isSeeking && videoRef.current) {
//       setCurrentTime(videoRef.current.currentTime);
//       // Send time updates less frequently to reduce network traffic
//       if (syncTimeoutRef.current === null) {
//         syncTimeoutRef.current = setTimeout(() => {
//           sendWebSocketMessage('timeUpdate', {
//             currentTime: videoRef.current.currentTime,
//             isPlaying: !videoRef.current.paused,
//             duration: videoRef.current.duration
//           });
//           syncTimeoutRef.current = null;
//         }, 1000);
//       }
//     }
//   };

//   const handleSeek = (e) => {
//     const time = parseFloat(e.target.value);
//     setCurrentTime(time);
//     if (videoRef.current) {
//       videoRef.current.currentTime = time;
//       sendWebSocketMessage('seek', {
//         currentTime: time,
//         isPlaying: !videoRef.current.paused,
//         duration: videoRef.current.duration
//       });
//     }
//   };

//   const formatTime = (seconds) => {
//     const h = Math.floor(seconds / 3600);
//     const m = Math.floor((seconds % 3600) / 60);
//     const s = Math.floor(seconds % 60);
//     return `${h > 0 ? h + ':' : ''}${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
//   };

//   return (
//     <div style={{ maxWidth: '800px', margin: '0 auto', padding: '20px' }}>
//       {!isJoined ? (
//         <div style={{ marginBottom: '20px' }}>
//           <input
//             type="text"
//             placeholder="Enter your username"
//             value={username}
//             onChange={(e) => setUsername(e.target.value)}
//             style={{ padding: '8px', marginRight: '10px', marginBottom: '10px' }}
//           />
//           <br />
//           <input
//             type="text"
//             placeholder="Enter Room ID"
//             value={roomId}
//             onChange={(e) => setRoomId(e.target.value)}
//             style={{ padding: '8px', marginRight: '10px' }}
//           />
//           <button
//             onClick={handleJoinRoom}
//             disabled={!isConnected || !roomId || !username}
//             style={{
//               padding: '8px 16px',
//               backgroundColor: '#007bff',
//               color: 'white',
//               border: 'none',
//               borderRadius: '4px'
//             }}
//           >
//             Join Room
//           </button>
//         </div>
//       ) : (
//         <>
//           <div style={{ marginBottom: '20px' }}>
//             <h3>Room Members ({roomMembers.length})</h3>
//             <ul>
//               {roomMembers.map(member => (
//                 <li key={member.id}>
//                   {member.username} {member.hasFile ? `(${member.fileName})` : '(no file selected)'}
//                 </li>
//               ))}
//             </ul>
//           </div>

//           <div style={{ marginBottom: '20px' }}>
//             <input
//               type="file"
//               accept="video/*"
//               onChange={handleFileSelect}
//             />
//           </div>

//           {selectedFile && (
//             <div>
//               <video
//                 ref={videoRef}
//                 src={selectedFile}
//                 style={{ width: '100%', borderRadius: '8px', marginBottom: '10px' }}
//                 onTimeUpdate={handleTimeUpdate}
//                 onLoadedMetadata={() => setDuration(videoRef.current.duration)}
//               />

//               <div style={{ marginBottom: '10px' }}>
//                 <input
//                   type="range"
//                   min="0"
//                   max={duration}
//                   value={currentTime}
//                   onChange={handleSeek}
//                   onMouseDown={() => setIsSeeking(true)}
//                   onMouseUp={() => setIsSeeking(false)}
//                   style={{ width: '100%' }}
//                 />
//                 <div style={{ display: 'flex', justifyContent: 'space-between' }}>
//                   <span>{formatTime(currentTime)}</span>
//                   <span>{formatTime(duration)}</span>
//                 </div>
//               </div>

//               <div style={{ display: 'flex', justifyContent: 'center', gap: '10px' }}>
//                 <button
//                   onClick={() => {
//                     videoRef.current.currentTime -= 10;
//                     handleSeek({ target: { value: videoRef.current.currentTime } });
//                   }}
//                   style={{ padding: '8px 16px', backgroundColor: '#007bff', color: 'white', border: 'none', borderRadius: '4px' }}
//                 >
//                   -10s
//                 </button>
//                 <button
//                   onClick={handlePlayPause}
//                   style={{ padding: '8px 16px', backgroundColor: '#007bff', color: 'white', border: 'none', borderRadius: '4px' }}
//                 >
//                   {isPlaying ? 'Pause' : 'Play'}
//                 </button>
//                 <button
//                   onClick={() => {
//                     videoRef.current.currentTime += 10;
//                     handleSeek({ target: { value: videoRef.current.currentTime } });
//                   }}
//                   style={{ padding: '8px 16px', backgroundColor: '#007bff', color: 'white', border: 'none', borderRadius: '4px' }}
//                 >
//                   +10s
//                 </button>
//               </div>
//             </div>
//           )}
//         </>
//       )}

//       <div style={{ marginTop: '20px', textAlign: 'center', color: isConnected ? 'green' : 'red' }}>
//         Status: {isConnected ? 'Connected' : 'Disconnected'}
//       </div>
//     </div>
//   );
// };

// export default VideoPlayer;

import React, { useState, useRef, useEffect } from 'react';
import './VideoPlayer.css';

const VideoPlayer = () => {
  const [isConnected, setIsConnected] = useState(false);
  const [roomId, setRoomId] = useState('');
  const [username, setUsername] = useState('');
  const [isJoined, setIsJoined] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [roomMembers, setRoomMembers] = useState([]);
  const [isSeeking, setIsSeeking] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const videoRef = useRef(null);
  const playerContainerRef = useRef(null);
  const wsRef = useRef(null);
  const syncTimeoutRef = useRef(null);

  useEffect(() => {
    connectWebSocket();
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    
    return () => {
      if (wsRef.current) {
        wsRef.current.close();
      }
      if (syncTimeoutRef.current) {
        clearTimeout(syncTimeoutRef.current);
      }
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
    };
  }, []);

  const handleFullscreenChange = () => {
    setIsFullscreen(!!document.fullscreenElement);
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      playerContainerRef.current.requestFullscreen();
    } else {
      document.exitFullscreen();
    }
  };

  const connectWebSocket = () => {
    wsRef.current = new WebSocket('wss://videosyncapplication.onrender.com');

    wsRef.current.onopen = () => {
      console.log('Connected to WebSocket server');
      setIsConnected(true);
    };

    wsRef.current.onmessage = (event) => {
      const data = JSON.parse(event.data);
      handleWebSocketMessage(data);
    };

    wsRef.current.onclose = () => {
      setIsConnected(false);
      console.log('Disconnected from WebSocket server');
      // Attempt to reconnect after 3 seconds
      setTimeout(connectWebSocket, 3000);
    };
  };

  const handleWebSocketMessage = (data) => {
    switch (data.type) {
      case 'roomStatus':
        setRoomMembers(data.clients);
        break;

      case 'play':
        if (!isSeeking) {
          videoRef.current.currentTime = data.currentTime;
          videoRef.current.play();
          setIsPlaying(true);
        }
        break;

      case 'pause':
        if (!isSeeking) {
          videoRef.current.pause();
          setIsPlaying(false);
        }
        break;

      case 'seek':
        if (!isSeeking) {
          videoRef.current.currentTime = data.currentTime;
        }
        break;

      case 'timeUpdate':
        if (!isSeeking && Math.abs(videoRef.current.currentTime - data.currentTime) > 1) {
          videoRef.current.currentTime = data.currentTime;
        }
        break;

      case 'syncState':
        if (data.isPlaying) {
          videoRef.current.currentTime = data.currentTime;
          videoRef.current.play();
          setIsPlaying(true);
        } else {
          videoRef.current.currentTime = data.currentTime;
          videoRef.current.pause();
          setIsPlaying(false);
        }
        break;
    }
  };

  const sendWebSocketMessage = (type, additionalData = {}) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({
        type,
        roomId,
        ...additionalData
      }));
    }
  };

  const handleJoinRoom = () => {
    if (roomId && username) {
      sendWebSocketMessage('joinRoom', { username });
      setIsJoined(true);
    }
  };

  const handleFileSelect = (event) => {
    const file = event.target.files[0];
    if (file) {
      setSelectedFile(URL.createObjectURL(file));
      sendWebSocketMessage('fileSelected', { fileName: file.name });
    }
  };

  const handlePlayPause = () => {
    if (videoRef.current) {
      if (videoRef.current.paused) {
        videoRef.current.play();
        sendWebSocketMessage('play', {
          isPlaying: true,
          currentTime: videoRef.current.currentTime,
          duration: videoRef.current.duration
        });
      } else {
        videoRef.current.pause();
        sendWebSocketMessage('pause', {
          isPlaying: false,
          currentTime: videoRef.current.currentTime,
          duration: videoRef.current.duration
        });
      }
      setIsPlaying(!videoRef.current.paused);
    }
  };

  const handleTimeUpdate = () => {
    if (!isSeeking && videoRef.current) {
      setCurrentTime(videoRef.current.currentTime);
      // Send time updates less frequently to reduce network traffic
      if (syncTimeoutRef.current === null) {
        syncTimeoutRef.current = setTimeout(() => {
          sendWebSocketMessage('timeUpdate', {
            currentTime: videoRef.current.currentTime,
            isPlaying: !videoRef.current.paused,
            duration: videoRef.current.duration
          });
          syncTimeoutRef.current = null;
        }, 1000);
      }
    }
  };

  const handleSeek = (e) => {
    const time = parseFloat(e.target.value);
    setCurrentTime(time);
    if (videoRef.current) {
      videoRef.current.currentTime = time;
      sendWebSocketMessage('seek', {
        currentTime: time,
        isPlaying: !videoRef.current.paused,
        duration: videoRef.current.duration
      });
    }
  };

  const formatTime = (seconds) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = Math.floor(seconds % 60);
    return `${h > 0 ? h + ':' : ''}${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div className="video-player-container">
      {!isJoined ? (
        <div className="join-form">
          <input
            type="text"
            placeholder="Enter your username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
          <input
            type="text"
            placeholder="Enter Room ID"
            value={roomId}
            onChange={(e) => setRoomId(e.target.value)}
          />
          <button
            onClick={handleJoinRoom}
            disabled={!isConnected || !roomId || !username}
            className="primary-button"
          >
            Join Room
          </button>
        </div>
      ) : (
        <>
          <div className="room-info">
            <h3>Room Members ({roomMembers.length})</h3>
            <ul className="member-list">
              {roomMembers.map(member => (
                <li key={member.id}>
                  {member.username} {member.hasFile ? `(${member.fileName})` : '(no file selected)'}
                </li>
              ))}
            </ul>
          </div>

          <div className="file-input">
            <input
              type="file"
              accept="video/*"
              onChange={handleFileSelect}
            />
          </div>

          {selectedFile && (
            <div ref={playerContainerRef} className="video-container">
              <video
                ref={videoRef}
                src={selectedFile}
                onTimeUpdate={handleTimeUpdate}
                onLoadedMetadata={() => setDuration(videoRef.current.duration)}
              />

              <div className="video-controls">
                <div className="progress-bar">
                  <input
                    type="range"
                    min="0"
                    max={duration}
                    value={currentTime}
                    onChange={handleSeek}
                    onMouseDown={() => setIsSeeking(true)}
                    onMouseUp={() => setIsSeeking(false)}
                  />
                  <div className="time-display">
                    <span>{formatTime(currentTime)}</span>
                    <span>{formatTime(duration)}</span>
                  </div>
                </div>

                <div className="control-buttons">
                  <button
                    onClick={() => {
                      videoRef.current.currentTime -= 10;
                      handleSeek({ target: { value: videoRef.current.currentTime } });
                    }}
                    className="control-button"
                  >
                    -10s
                  </button>
                  <button
                    onClick={handlePlayPause}
                    className="control-button"
                  >
                    {isPlaying ? 'Pause' : 'Play'}
                  </button>
                  <button
                    onClick={() => {
                      videoRef.current.currentTime += 10;
                      handleSeek({ target: { value: videoRef.current.currentTime } });
                    }}
                    className="control-button"
                  >
                    +10s
                  </button>
                  <button
                    onClick={toggleFullscreen}
                    className="control-button"
                  >
                    {isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}
                  </button>
                </div>
              </div>
            </div>
          )}
        </>
      )}

      <div className={`connection-status ${isConnected ? 'connected' : 'disconnected'}`}>
        Status: {isConnected ? 'Connected' : 'Disconnected'}
      </div>
    </div>
  );
};

export default VideoPlayer;