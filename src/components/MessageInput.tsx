import React, { useState, useEffect, useRef } from "react";
import { TextField, Button, Box } from "@mui/material";
import { SocketMessageTypes, TelepartyClient } from "teleparty-websocket-lib";

interface MessageInputProps {
  onSendMessage: (message: string) => void;
  client: TelepartyClient | null;
  currentUser: string;
}

const MessageInput: React.FC<MessageInputProps> = ({
  onSendMessage,
  client,
  currentUser,
}) => {
  const [message, setMessage] = useState("");
  const typingTimeout = useRef<NodeJS.Timeout>(null);

  const sendTypingStatus = (isTyping: boolean) => {
    if (!client) return;
    client.sendMessage(SocketMessageTypes.SET_TYPING_PRESENCE, {
      typing: isTyping,
      nickname: currentUser,
    });
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setMessage(e.target.value);

    if (!client) return;

    // Clear any existing timeout
    if (typingTimeout.current) {
      clearTimeout(typingTimeout.current);
    }

    if (e.target.value) {
      sendTypingStatus(true);

      typingTimeout.current = setTimeout(() => {
        sendTypingStatus(false);
      }, 3000);
    } else {
      sendTypingStatus(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim() || !client) return;
    onSendMessage(message);
    setMessage("");
    sendTypingStatus(false);
  };

  useEffect(() => {
    return () => {
      if (typingTimeout.current) {
        clearTimeout(typingTimeout.current);
      }
      sendTypingStatus(false);
    };
  }, []);

  return (
    <Box component="form" onSubmit={handleSubmit}>
      <Box display="flex" gap={1}>
        <TextField
          fullWidth
          variant="outlined"
          placeholder="Type a message..."
          value={message}
          onChange={handleChange}
        />
        <Button type="submit" variant="contained" disabled={!message.trim()}>
          Send
        </Button>
      </Box>
    </Box>
  );
};

export default MessageInput;
