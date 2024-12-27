// import React, { useState, useRef, useEffect } from 'react';
// import './VideoPlayer.css';

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
//   const [isFullscreen, setIsFullscreen] = useState(false);

//   const videoRef = useRef(null);
//   const playerContainerRef = useRef(null);
//   const wsRef = useRef(null);
//   const syncTimeoutRef = useRef(null);

//   useEffect(() => {
//     connectWebSocket();
//     document.addEventListener('fullscreenchange', handleFullscreenChange);
    
//     return () => {
//       if (wsRef.current) {
//         wsRef.current.close();
//       }
//       if (syncTimeoutRef.current) {
//         clearTimeout(syncTimeoutRef.current);
//       }
//       document.removeEventListener('fullscreenchange', handleFullscreenChange);
//     };
//   }, []);

//   const handleFullscreenChange = () => {
//     setIsFullscreen(!!document.fullscreenElement);
//   };

//   const toggleFullscreen = () => {
//     if (!document.fullscreenElement) {
//       playerContainerRef.current.requestFullscreen();
//     } else {
//       document.exitFullscreen();
//     }
//   };

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
//     <div className="video-player-container">
//       {!isJoined ? (
        
//         <div className="join-form">
//           <div className={`connection-status ${isConnected ? 'connected' : 'disconnected'}`}>
//          {isConnected ? 'Connected' : 'Disconnected'}
//       </div>
//      {/* <center> <h3 className="app-title">Welcome,to a world where every moment with you feels like a beautiful dream.</h3></center> */}
//      <center> <h3 className="app-title">Welcome to this special space where every moment is made better with your presence</h3></center>
//           <center>
//           <div className='flexcon'>
//             <div>
//           <input
//             type="text"
//             placeholder="Enter your username"
//             value={username}
//             className='inputbox'
//             onChange={(e) => setUsername(e.target.value)}
//           /></div>
//           <div>
//           <input
//             type="text"
//             placeholder="Enter Room ID"
//             value={roomId}
//             className='inputbox'
//             onChange={(e) => setRoomId(e.target.value)}
//           />
//           </div>
//           <button
//             onClick={handleJoinRoom}
//             disabled={!isConnected || !roomId || !username}
//             className="primary-button"
//           >
//             Join Room
//           </button>
//           </div>
//           </center>
//         </div>
        
//       ) : (
//         <div className='newback'>
//           <div className={`connection-status ${isConnected ? 'connected' : 'disconnected'}`}>
//          {isConnected ? 'Connected' : 'Disconnected'}
//       </div>
//      {/* <center> <h3 className="app-titl">"Hey, you just walked into my world, and now it's all about you."</h3></center> */}
//      <center> <h3 className="app-titl">""Hello and welcome! This space is brighter and better now that you're here."</h3></center>

//           <div className="room-info">
//             <h3> Members ({roomMembers.length})</h3>
//             <ul className="member-list">
//               {roomMembers.map(member => (
//                 <li key={member.id}>
//                   {member.username} {member.hasFile ? `(${member.fileName})` : '(no file selected)'}
//                 </li>
//               ))}
//             </ul>
//           </div>

//           <div className="file-input">
//             <input
//               type="file"
//               accept="video/*"
//               onChange={handleFileSelect}
//             />
//           </div>

//           {selectedFile && (
//             <center>
//             <div ref={playerContainerRef} className="video-container">
//               <video
//                 ref={videoRef}
//                 src={selectedFile}
//                 onTimeUpdate={handleTimeUpdate}
//                 onLoadedMetadata={() => setDuration(videoRef.current.duration)}
//               />

//               <div className="video-controls">
//                 <div className="progress-bar">
//                   <input
//                     type="range"
//                     min="0"
//                     max={duration}
//                     value={currentTime}
//                     onChange={handleSeek}
//                     onMouseDown={() => setIsSeeking(true)}
//                     onMouseUp={() => setIsSeeking(false)}
//                   />
//                   <div className="time-display">
//                     <span>{formatTime(currentTime)}</span>
//                     <span>{formatTime(duration)}</span>
//                   </div>
//                 </div>

//                 <div className="control-buttons">
//                   <button
//                     onClick={() => {
//                       videoRef.current.currentTime -= 10;
//                       handleSeek({ target: { value: videoRef.current.currentTime } });
//                     }}
//                     className="control-button"
//                   >
//                     -10s
//                   </button>
//                   <button
//                     onClick={handlePlayPause}
//                     className="control-button"
//                   >
//                     {isPlaying ? 'Pause' : 'Play'}
//                   </button>
//                   <button
//                     onClick={() => {
//                       videoRef.current.currentTime += 10;
//                       handleSeek({ target: { value: videoRef.current.currentTime } });
//                     }}
//                     className="control-button"
//                   >
//                     +10s
//                   </button>
//                   <button
//                     onClick={toggleFullscreen}
//                     className="control-button"
//                   >
//                     {isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}
//                   </button>
//                 </div>
//               </div>
//             </div>
//             </center>
//           )}
//         </div>
//       )}
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
    window.addEventListener('orientationchange', handleOrientationChange);
    
    return () => {
      if (wsRef.current) {
        wsRef.current.close();
      }
      if (syncTimeoutRef.current) {
        clearTimeout(syncTimeoutRef.current);
      }
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
      window.removeEventListener('orientationchange', handleOrientationChange);
    };
  }, []);

  const handleOrientationChange = () => {
    if (window.orientation === 90 || window.orientation === -90) {
      if (!document.fullscreenElement && playerContainerRef.current) {
        playerContainerRef.current.requestFullscreen();
      }
    } else {
      if (document.fullscreenElement) {
        document.exitFullscreen();
      }
    }
  };

  // Update only the relevant functions, rest of the code remains the same

  const handleFullscreenChange = () => {
    setIsFullscreen(!!document.fullscreenElement);
    
    if (document.fullscreenElement) {
      // Check if screen orientation API is available
      if (window.screen && window.screen.orientation) {
        try {
          window.screen.orientation.lock('landscape').catch((err) => {
            console.log('Orientation lock not supported');
          });
        } catch (err) {
          console.log('Screen orientation API not supported');
        }
      }
    } else {
      // Unlock orientation if screen API is available
      if (window.screen && window.screen.orientation) {
        try {
          window.screen.orientation.unlock();
        } catch (err) {
          console.log('Screen orientation API not supported');
        }
      }
    }
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      playerContainerRef.current.requestFullscreen().then(() => {
        // Check if screen orientation API is available
        if (window.screen && window.screen.orientation) {
          try {
            window.screen.orientation.lock('landscape').catch((err) => {
              console.log('Orientation lock not supported');
            });
          } catch (err) {
            console.log('Screen orientation API not supported');
          }
        }
      });
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
          <div className={`connection-status ${isConnected ? 'connected' : 'disconnected'}`}>
            {isConnected ? 'Connected' : 'Disconnected'}
          </div>
          <center><h3 className="app-title">Welcome to this special space where every moment is made better with your presence</h3></center>
          <center>
            <div className='flexcon'>
              <div>
                <input
                  type="text"
                  placeholder="Enter your username"
                  value={username}
                  className='inputbox'
                  onChange={(e) => setUsername(e.target.value)}
                />
              </div>
              <div>
                <input
                  type="text"
                  placeholder="Enter Room ID"
                  value={roomId}
                  className='inputbox'
                  onChange={(e) => setRoomId(e.target.value)}
                />
              </div>
              <button
                onClick={handleJoinRoom}
                disabled={!isConnected || !roomId || !username}
                className="primary-button"
              >
                Join Room
              </button>
            </div>
          </center>
        </div>
      ) : (
        <div className='newback'>
          <div className={`connection-status ${isConnected ? 'connected' : 'disconnected'}`}>
            {isConnected ? 'Connected' : 'Disconnected'}
          </div>
          <center><h3 className="app-titl">Hello and welcome! This space is brighter and better now that you're here.</h3></center>

          <div className="room-info">
            <h3>Members ({roomMembers.length})</h3>
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
            <center>
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
            </center>
          )}
        </div>
      )}
    </div>
  );
};

export default VideoPlayer;