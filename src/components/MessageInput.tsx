import React, { useState } from "react";
import { TextField, Button, Box } from "@mui/material";
import { SocketMessageTypes, TelepartyClient } from "teleparty-websocket-lib";

interface MessageInputProps {
  onSendMessage: (message: string) => void;
  isTyping: boolean;
  setIsTyping: (typing: boolean) => void;
  client: TelepartyClient | null;
}

const MessageInput: React.FC<MessageInputProps> = ({
  onSendMessage,
  isTyping,
  setIsTyping,
  client,
}) => {
  const [message, setMessage] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim() || !client) return;
    onSendMessage(message);
    setMessage("");
    if (isTyping) {
      setIsTyping(false);
      client.sendMessage(SocketMessageTypes.SET_TYPING_PRESENCE, {
        typing: false,
      });
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setMessage(e.target.value);

    if (!client) return;

    if (e.target.value && !isTyping) {
      setIsTyping(true);
      client.sendMessage(SocketMessageTypes.SET_TYPING_PRESENCE, {
        typing: true,
      });
    } else if (!e.target.value && isTyping) {
      setIsTyping(false);
      client.sendMessage(SocketMessageTypes.SET_TYPING_PRESENCE, {
        typing: false,
      });
    }
  };

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
