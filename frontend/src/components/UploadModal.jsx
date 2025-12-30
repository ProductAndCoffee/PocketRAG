import React, { useState } from 'react';
import { X, UploadCloud, Check, FileText } from 'lucide-react';

export default function UploadModal({ isOpen, onClose, onUpload, currentFolder }) {
    const [file, setFile] = useState(null);
    const [uploading, setUploading] = useState(false);
    const [dragActive, setDragActive] = useState(false);

    if (!isOpen) return null;

    const handleFileChange = (e) => {
        if (e.target.files[0]) {
            setFile(e.target.files[0]);
        }
    };

    const handleDrag = (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === "dragenter" || e.type === "dragover") {
            setDragActive(true);
        } else if (e.type === "dragleave") {
            setDragActive(false);
        }
    };

    const handleDrop = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);
        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            setFile(e.dataTransfer.files[0]);
        }
    };

    const handleUpload = async () => {
        if (!file) return;
        setUploading(true);
        await onUpload(file);
        setUploading(false);
        setFile(null);
        onClose();
    };

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 animate-in fade-in duration-200">
            <div className="bg-slate-900 border border-slate-700/50 rounded-2xl p-8 w-[480px] shadow-2xl transform transition-all scale-100">
                <div className="flex justify-between items-center mb-8">
                    <div>
                        <h3 className="text-xl font-bold text-white flex items-center gap-2">
                            Upload Document
                        </h3>
                        <p className="text-slate-400 text-sm mt-1">Add to <span className="text-indigo-400 font-medium">{currentFolder?.name}</span></p>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-slate-800 rounded-full text-slate-400 hover:text-white transition-colors">
                        <X size={20} />
                    </button>
                </div>

                <div
                    className={`border-2 border-dashed rounded-xl p-10 text-center transition-all duration-200 relative ${dragActive
                            ? 'border-indigo-500 bg-indigo-500/10 scale-[1.02]'
                            : 'border-slate-700 hover:border-slate-600 hover:bg-slate-800/50'
                        }`}
                    onDragEnter={handleDrag}
                    onDragLeave={handleDrag}
                    onDragOver={handleDrag}
                    onDrop={handleDrop}
                >
                    <input
                        type="file"
                        accept=".pdf"
                        onChange={handleFileChange}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                    />
                    <div className="flex flex-col items-center gap-4 text-slate-400 pointer-events-none">
                        {file ? (
                            <div className="bg-slate-800 px-4 py-3 rounded-lg flex items-center gap-3 border border-slate-700 shadow-lg animate-in zoom-in duration-200">
                                <div className="p-2 bg-green-500/20 rounded-full">
                                    <Check className="text-green-500" size={20} />
                                </div>
                                <div className="text-left">
                                    <p className="text-white font-medium text-sm">{file.name}</p>
                                    <p className="text-xs text-slate-500">{(file.size / 1024 / 1024).toFixed(2)} MB • PDF</p>
                                </div>
                            </div>
                        ) : (
                            <>
                                <div className={`p-4 rounded-full transition-colors ${dragActive ? 'bg-indigo-500/20 text-indigo-400' : 'bg-slate-800'}`}>
                                    <UploadCloud size={32} />
                                </div>
                                <div>
                                    <span className="text-indigo-400 font-medium">Click to browse</span>
                                    <span className="text-slate-500"> or drag file here</span>
                                </div>
                                <p className="text-xs text-slate-600 uppercase tracking-wider font-semibold">PDFs up to 10MB</p>
                            </>
                        )}
                    </div>
                </div>

                <div className="mt-8 flex justify-end gap-3">
                    <button
                        onClick={onClose}
                        className="px-5 py-2.5 text-slate-400 hover:text-white text-sm font-medium transition-colors"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleUpload}
                        disabled={!file || uploading}
                        className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg shadow-indigo-600/20 active:scale-95 font-medium flex items-center gap-2"
                    >
                        {uploading ? (
                            <>
                                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                Uploading...
                            </>
                        ) : (
                            'Upload Document'
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
}
