import React, { useState, useEffect, useRef } from "react";
import {
  TelepartyClient,
  SocketEventHandler,
  SocketMessageTypes,
  SessionChatMessage,
} from "teleparty-websocket-lib";
import LoginForm from "./components/LoginForm";
import ChatRoom from "./components/ChatRoom";
import "./App.css";

interface User {
  nickname: string;
  roomId: string;
  userIcon?: string;
}

type RoomOperation = (() => Promise<void>) | null;

const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(() => {
    const saved = localStorage.getItem("teleparty-session");
    return saved ? JSON.parse(saved) : null;
  });
  const [client, setClient] = useState<TelepartyClient | null>(null);
  const [messages, setMessages] = useState<SessionChatMessage[]>([]);
  const [connectionError, setConnectionError] = useState<string | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [usersTyping, setUsersTyping] = useState<string[]>([]);
  const roomOperationQueue = useRef<RoomOperation>(null);
  const clientRef = useRef<TelepartyClient | null>(null);

  // Restore session on refresh
  useEffect(() => {
    const restoreSession = async () => {
      if (user && !clientRef.current) {
        await handleLogin(user.nickname, user.roomId, false, user.userIcon);
      }
    };
    restoreSession();
  }, [user]);

  useEffect(() => {
    if (user) {
      localStorage.setItem("teleparty-session", JSON.stringify(user));
    } else {
      localStorage.removeItem("teleparty-session");
    }
  }, [user]);

  const handleLogin = async (
    nickname: string,
    roomId: string,
    isCreating: boolean,
    userIcon?: string
  ) => {
    try {
      setIsConnecting(true);
      setConnectionError(null);
      setIsConnected(false);
      setMessages([]);

      const eventHandler: SocketEventHandler = {
        onConnectionReady: () => {
          console.log("Connection ready");
          setIsConnected(true);
          setIsConnecting(false);
          if (roomOperationQueue.current) {
            roomOperationQueue.current();
            roomOperationQueue.current = null;
          }
        },
        onClose: () => {
          setIsConnected(false);
          setConnectionError("Connection lost. Reconnecting...");
          setTimeout(() => {
            if (user) {
              handleLogin(user.nickname, user.roomId, false, user.userIcon);
            }
          }, 3000);
        },
        onMessage: (message: { type: any; data: { usersTyping: any } }) => {
          if (message.type === SocketMessageTypes.SEND_MESSAGE) {
            setMessages((prev) => [
              ...prev,
              message.data as unknown as SessionChatMessage,
            ]);
          }
          // Handle typing presence updates
          if (message.type === SocketMessageTypes.SET_TYPING_PRESENCE) {
            setUsersTyping(message.data.usersTyping || []);
          }
        },
      };

      const newClient = new TelepartyClient(eventHandler);
      clientRef.current = newClient;
      setClient(newClient);

      const performRoomOperation = async () => {
        try {
          let roomIdResult: string;
          if (isCreating) {
            roomIdResult = await newClient.createChatRoom(nickname, userIcon);
          } else {
            await newClient.joinChatRoom(nickname, roomId, userIcon);
            roomIdResult = roomId;
          }
          setUser({ nickname, roomId: roomIdResult, userIcon });
        } catch (error) {
          console.error("Room operation error:", error);
          setConnectionError("Failed to create/join room. Please try again.");
        }
      };

      roomOperationQueue.current = performRoomOperation;

      if (isConnected) {
        await performRoomOperation();
        roomOperationQueue.current = null;
      }
    } catch (error) {
      console.error("Connection error:", error);
      setConnectionError("Failed to initialize connection. Please try again.");
      setIsConnecting(false);
      roomOperationQueue.current = null;
    }
  };

  const handleLogout = () => {
    if (clientRef.current) {
      // Properly clean up the connection
      clientRef.current = null;
    }
    setUser(null);
    setClient(null);
    setMessages([]);
    setConnectionError(null);
    setIsConnected(false);
  };

  return (
    <div className="app">
      <h1>Teleparty Chat</h1>
      <div
        className={`connection-status ${
          isConnected ? "connected" : "disconnected"
        }`}
      >
        {isConnected ? "Online" : "Offline"}
      </div>
      {connectionError && <div className="error">{connectionError}</div>}
      {isConnecting && <div className="loading">Connecting...</div>}
      {!user ? (
        <LoginForm onLogin={handleLogin} />
      ) : (
        <ChatRoom
          user={user}
          client={client}
          messages={messages}
          onLogout={handleLogout}
          usersTyping={usersTyping}
        />
      )}
    </div>
  );
};

export default App;
