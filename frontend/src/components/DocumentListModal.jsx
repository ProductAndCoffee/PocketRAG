import React, { useState, useEffect } from 'react';
import { X, Trash2, FileText, AlertCircle } from 'lucide-react';
import axios from 'axios';

const API_BASE = 'http://localhost:8000';

export default function DocumentListModal({ isOpen, onClose, currentFolder }) {
    const [documents, setDocuments] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (isOpen && currentFolder) {
            fetchDocuments();
        }
    }, [isOpen, currentFolder]);

    const fetchDocuments = async () => {
        setLoading(true);
        setError(null);
        try {
            const res = await axios.get(`${API_BASE}/folders/${currentFolder.id}/documents`);
            setDocuments(res.data);
        } catch (err) {
            console.error("Failed to fetch docs", err);
            setError("Could not load documents.");
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (docId) => {
        if (!confirm("Are you sure you want to delete this document? This cannot be undone.")) return;

        try {
            await axios.delete(`${API_BASE}/documents/${docId}`);
            setDocuments(documents.filter(d => d.id !== docId));
        } catch (err) {
            alert("Failed to delete document: " + (err.response?.data?.detail || err.message));
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
            <div
                className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-md shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div className="p-6 border-b border-slate-800 flex items-center justify-between bg-slate-900">
                    <h2 className="text-xl font-bold text-white">Manage Documents</h2>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-slate-800 rounded-full text-slate-400 hover:text-white transition-colors"
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* Content */}
                <div className="p-6 max-h-[60vh] overflow-y-auto custom-scrollbar">
                    {loading ? (
                        <div className="flex justify-center py-8">
                            <div className="w-6 h-6 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
                        </div>
                    ) : error ? (
                        <div className="text-center py-8 text-red-400 flex flex-col items-center gap-2">
                            <AlertCircle size={24} />
                            <p>{error}</p>
                        </div>
                    ) : documents.length === 0 ? (
                        <div className="text-center py-8 text-slate-500">
                            <p>No documents found in this folder.</p>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {documents.map((doc) => (
                                <div key={doc.id} className="flex items-center justify-between p-3 bg-slate-800/50 rounded-xl border border-slate-800 hover:border-indigo-500/30 transition-all group">
                                    <div className="flex items-center gap-3 overflow-hidden">
                                        <div className="p-2 bg-indigo-500/10 rounded-lg text-indigo-400">
                                            <FileText size={18} />
                                        </div>
                                        <div className="min-w-0">
                                            <p className="text-sm font-medium text-slate-200 truncate">{doc.filename}</p>
                                            <p className="text-[10px] text-slate-500 uppercase">{doc.status}</p>
                                        </div>
                                    </div>

                                    <button
                                        onClick={() => handleDelete(doc.id)}
                                        className="p-2 text-slate-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
                                        title="Delete Document"
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
