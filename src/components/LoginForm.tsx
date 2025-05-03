import React, { useState } from "react";
import {
  TextField,
  Button,
  Box,
  Typography,
  Paper,
  Tabs,
  Tab,
} from "@mui/material";

interface LoginFormProps {
  onLogin: (
    nickname: string,
    roomId: string,
    isCreating: boolean,
    userIcon?: string
  ) => void;
}

const LoginForm: React.FC<LoginFormProps> = ({ onLogin }) => {
  const [nickname, setNickname] = useState("");
  const [roomId, setRoomId] = useState("");
  const [activeTab, setActiveTab] = useState(0);
  const [userIcon, setUserIcon] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nickname.trim()) return;
    onLogin(nickname, roomId, activeTab === 0, userIcon || undefined);
  };

  const handleIconChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setUserIcon(event.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <Paper elevation={3} sx={{ padding: 3, maxWidth: 400, margin: "auto" }}>
      <Tabs
        value={activeTab}
        onChange={(_, newValue) => setActiveTab(newValue)}
      >
        <Tab label="Create Room" />
        <Tab label="Join Room" />
      </Tabs>
      <Box component="form" onSubmit={handleSubmit} sx={{ mt: 2 }}>
        <TextField
          label="Your Nickname"
          variant="outlined"
          fullWidth
          required
          value={nickname}
          onChange={(e) => setNickname(e.target.value)}
          sx={{ mb: 2 }}
        />
        {activeTab === 1 && (
          <TextField
            label="Room ID"
            variant="outlined"
            fullWidth
            required
            value={roomId}
            onChange={(e) => setRoomId(e.target.value)}
            sx={{ mb: 2 }}
          />
        )}
        <Box sx={{ mb: 2 }}>
          <Typography variant="body2" sx={{ mb: 1 }}>
            Profile Icon (optional):
          </Typography>
          <input type="file" accept="image/*" onChange={handleIconChange} />
        </Box>
        <Button type="submit" variant="contained" fullWidth size="large">
          {activeTab === 0 ? "Create Room" : "Join Room"}
        </Button>
      </Box>
    </Paper>
  );
};

export default LoginForm;
