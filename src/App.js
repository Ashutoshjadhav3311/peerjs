import React, { useState, useEffect } from 'react';
import Peer from 'peerjs';

const App = () => {
  const [peer, setPeer] = useState(null);
  const [messages, setMessages] = useState([]);
  const [message, setMessage] = useState('');
  const [friendId, setFriendId] = useState('');
  const [ownId, setOwnId] = useState('');

  useEffect(() => {
    const newPeer = new Peer();

    newPeer.on('open', id => {
      setOwnId(id);
      console.log(ownId)
    });

    newPeer.on('connection', connection => {
      connection.on('data', data => {
        if (data.type === 'image') {
          // Handle image data received from peer
          setMessages(prev => [...prev, { type: 'image', data: data.data }]);
        } else {
          // Handle other types of data
          setMessages(prev => [...prev, { type: 'text', data }]);
        }
      });
    });

    setPeer(newPeer);

    return () => {
      newPeer.disconnect();
    };
  }, []);

  useEffect(() => {
    if (friendId && peer) {
      const connection = peer.connect(friendId);
      connection.on('open', () => {
        console.log('Connected to friend');
      });
    }
  }, [friendId, peer]);

  const sendMessage = () => {
    if (peer) {
      for (const [_, connection] of Object.entries(peer.connections)) {
        connection.forEach(conn => {
          conn.send(message);
        });
      }
    }
  };

  const handleImageSelect = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      if (peer) {
        for (const connection of Object.values(peer.connections)) {
          connection.forEach(conn => {
            conn.send({ type: 'image', data: reader.result });
          });
        }
      }
    };
    reader.readAsDataURL(file);
  };

  const selectImage = () => {
    document.getElementById('fileInput').click();
  };

  return (
    <div>
      <h1>Peer to Peer Image and Message Transfer</h1>
      <div>
        <h3>Your Connection ID:</h3>
        <p>{ownId}</p>
      </div>
      <div>
        <input
          type="text"
          placeholder="Enter friend's connection info"
          value={friendId}
          onChange={(e) => setFriendId(e.target.value)}
        />
        <button onClick={() => setFriendId(friendId)}>Connect to Friend</button>
      </div>
      <div>
        <input
          id="fileInput"
          type="file"
          accept="image/*"
          style={{ display: 'none' }}
          onChange={handleImageSelect}
        />
        <button onClick={selectImage}>Select Image</button>
      </div>
      <div>
        <input type="text" value={message} onChange={(e) => setMessage(e.target.value)} />
        <button onClick={sendMessage}>Send Message</button>
      </div>
      <div>
        <h2>Messages</h2>
        <ul>
          {messages.map((msg, index) => {
            if (msg.type === 'image') {
              return <li key={index}><img src={msg.data} alt="Received" /></li>;
            } else {
              return <li key={index}>{msg.data}</li>;
            }
          })}
        </ul>
      </div>
    </div>
  );
};

export default App;
