import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Sidebar from './components/Sidebar';
import ChatArea from './components/ChatArea';
import UploadModal from './components/UploadModal';

const API_BASE = 'http://localhost:8000';

function App() {
  const [folders, setFolders] = useState([]);
  const [currentFolder, setCurrentFolder] = useState(null);
  const [messages, setMessages] = useState([]);
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  // Fetch folders on mount
  useEffect(() => {
    fetchFolders();
  }, []);

  const fetchFolders = async () => {
    try {
      const res = await axios.get(`${API_BASE}/folders`);
      setFolders(res.data);
    } catch (err) {
      console.error("Failed to fetch folders", err);
    }
  };

  const handleCreateFolder = async (name) => {
    try {
      const res = await axios.post(`${API_BASE}/folders`, { name });
      setFolders([...folders, res.data]);
      setCurrentFolder(res.data);
      setMessages([]);
    } catch (err) {
      alert("Failed to create folder: " + (err.response?.data?.detail || err.message));
    }
  };

  const handleSelectFolder = (folder) => {
    setCurrentFolder(folder);
    setMessages([]); // Reset chat for new folder
    // Optionally fetch chat history if persisted
  };

  const handleRenameFolder = async (folderId, newName) => {
    try {
      const res = await axios.put(`${API_BASE}/folders/${folderId}`, { name: newName });
      setFolders(folders.map(f => f.id === folderId ? res.data : f));
      if (currentFolder?.id === folderId) {
        setCurrentFolder(res.data);
      }
    } catch (err) {
      alert("Failed to rename folder: " + (err.response?.data?.detail || err.message));
    }
  };

  const handleUpload = async (file) => {
    if (!currentFolder) return;
    const formData = new FormData();
    formData.append('file', file);

    try {
      await axios.post(`${API_BASE}/upload/${currentFolder.id}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      alert("Upload successful! Document is being indexed.");
    } catch (err) {
      alert("Upload failed");
      console.error(err);
    }
  };

  const handleSendMessage = async (text) => {
    const newMsg = { role: 'user', content: text };
    setMessages(prev => [...prev, newMsg]);
    setLoading(true);

    try {
      const res = await axios.post(`${API_BASE}/query`, {
        question: text,
        folder_id: currentFolder?.id
      });

      const botMsg = {
        role: 'assistant',
        content: res.data.answer,
        sources: res.data.sources
      };
      setMessages(prev => [...prev, botMsg]);
    } catch (err) {
      setMessages(prev => [...prev, { role: 'assistant', content: "Error: Could not get response." }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex h-screen w-full bg-[#0f172a] text-white">
      <Sidebar
        folders={folders}
        currentFolder={currentFolder}
        onSelectFolder={handleSelectFolder}
        onCreateFolder={handleCreateFolder}
        onRenameFolder={handleRenameFolder}
        onGoHome={() => handleSelectFolder(null)}
      />

      <main className="flex-1 flex relative">
        <ChatArea
          currentFolder={currentFolder}
          messages={messages}
          onSendMessage={handleSendMessage}
          onOpenUpload={() => setIsUploadOpen(true)}
          loading={loading}
        />
      </main>

      <UploadModal
        isOpen={isUploadOpen}
        onClose={() => setIsUploadOpen(false)}
        onUpload={handleUpload}
        currentFolder={currentFolder}
      />
    </div>
  );
}

export default App;
