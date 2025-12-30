import React, { useState, useEffect } from 'react';
import { Folder, Plus, FileText, ChevronRight, Hash, Pencil } from 'lucide-react';

export default function Sidebar({ folders, currentFolder, onSelectFolder, onCreateFolder, onGoHome, onRenameFolder }) {
    const [newFolderName, setNewFolderName] = useState('');
    const [isCreating, setIsCreating] = useState(false);

    const handleSubmit = (e) => {
        e.preventDefault();
        if (newFolderName.trim()) {
            onCreateFolder(newFolderName);
            setNewFolderName('');
            setIsCreating(false);
        }
    };

    return (
        <div className="w-72 bg-slate-900 border-r border-slate-800 flex flex-col h-full font-sans shadow-xl z-20">
            {/* Header */}
            <div className="p-6 border-b border-slate-800 bg-slate-900/50 backdrop-blur-sm">
                <button
                    onClick={onGoHome}
                    className="text-xl font-bold flex items-center gap-3 text-white tracking-tight hover:opacity-80 transition-opacity w-full text-left"
                >
                    <img src="/logo.png" alt="PocketRAG" className="w-8 h-8 rounded-lg shadow-lg shadow-indigo-600/20" />
                    PocketRAG
                </button>
            </div>

            {/* Content */}
            <div className="p-4 flex-1 overflow-y-auto custom-scrollbar">
                <div className="flex justify-between items-center mb-6 px-2">
                    <h2 className="text-xs font-bold text-slate-500 uppercase tracking-widest">Library</h2>
                    <button
                        onClick={() => setIsCreating(true)}
                        className="p-1.5 hover:bg-slate-800 rounded-md text-slate-400 hover:text-indigo-400 transition-all duration-200"
                        title="New Subject"
                    >
                        <Plus size={16} strokeWidth={2.5} />
                    </button>
                </div>

                {isCreating && (
                    <form onSubmit={handleSubmit} className="mb-4 px-2 animate-in fade-in slide-in-from-left-2 duration-200">
                        <div className="relative">
                            <input
                                autoFocus
                                type="text"
                                value={newFolderName}
                                onChange={(e) => setNewFolderName(e.target.value)}
                                placeholder="Subject name..."
                                className="w-full bg-slate-800 border border-indigo-500/50 rounded-lg px-3 py-2 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all"
                                onBlur={() => !newFolderName && setIsCreating(false)}
                            />
                        </div>
                    </form>
                )}

                <div className="space-y-1">
                    {folders.length === 0 && !isCreating && (
                        <div className="px-4 py-8 text-center border-2 border-dashed border-slate-800 rounded-xl">
                            <p className="text-slate-500 text-sm">No folders yet</p>
                            <button
                                onClick={() => setIsCreating(true)}
                                className="mt-2 text-xs text-indigo-400 hover:text-indigo-300 font-medium"
                            >
                                Create one
                            </button>
                        </div>
                    )}

                    {folders.map(folder => (
                        <FolderItem
                            key={folder.id}
                            folder={folder}
                            isActive={currentFolder?.id === folder.id}
                            onSelect={() => onSelectFolder(folder)}
                            onRename={onRenameFolder}
                        />
                    ))}
                </div>
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-slate-800 bg-slate-900/50 text-center">
                <p className="text-[10px] text-slate-600 font-medium">
                    PocketRAG v1.0
                </p>
            </div>
        </div>
    );
}

function FolderItem({ folder, isActive, onSelect, onRename }) {
    const [isEditing, setIsEditing] = useState(false);
    const [editName, setEditName] = useState(folder.name);

    // Reset edit name when folder changes or editing stops
    useEffect(() => {
        if (isEditing) setEditName(folder.name);
    }, [isEditing, folder.name]);

    const handleSave = (e) => {
        e.stopPropagation();
        if (editName.trim() && editName !== folder.name) {
            onRename(folder.id, editName.trim());
        }
        setIsEditing(false);
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter') handleSave(e);
        if (e.key === 'Escape') setIsEditing(false);
    };

    if (isEditing) {
        return (
            <div className="px-2 py-1">
                <input
                    autoFocus
                    type="text"
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    onBlur={handleSave}
                    onKeyDown={handleKeyDown}
                    onClick={(e) => e.stopPropagation()}
                    className="w-full bg-slate-800 border-2 border-indigo-500 rounded px-2 py-1 text-sm text-white focus:outline-none"
                />
            </div>
        );
    }

    return (
        <div
            className={`group w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all duration-200 border border-transparent cursor-pointer ${isActive
                ? 'bg-indigo-600/10 text-indigo-400 border-indigo-500/20 shadow-sm'
                : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'
                }`}
            onClick={onSelect}
        >
            <div className={`p-1.5 rounded-lg transition-colors ${isActive ? 'bg-indigo-500/20' : 'bg-slate-800 group-hover:bg-slate-700'
                }`}>
                {isActive ? (
                    <Folder size={16} className="fill-current" />
                ) : (
                    <Hash size={16} />
                )}
            </div>

            <span className="font-medium truncate flex-1 text-left">{folder.name}</span>

            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                    onClick={(e) => { e.stopPropagation(); setIsEditing(true); }}
                    className="p-1 hover:bg-slate-700 rounded text-slate-500 hover:text-white transition-colors"
                    title="Rename"
                >
                    <Pencil size={12} />
                </button>
                {isActive && <ChevronRight size={14} className="opacity-50" />}
            </div>
        </div>
    );
}
