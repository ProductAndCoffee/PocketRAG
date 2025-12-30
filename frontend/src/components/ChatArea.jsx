import React, { useState, useRef, useEffect } from 'react';
import { Send, Upload, BookOpen, ChevronRight, AlertCircle } from 'lucide-react';
import DocumentListModal from './DocumentListModal';

export default function ChatArea({ currentFolder, messages, onSendMessage, onOpenUpload, loading }) {
    const [input, setInput] = useState('');
    const [isDocListOpen, setIsDocListOpen] = useState(false);
    const messagesEndRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(scrollToBottom, [messages, loading]);

    const handleSubmit = (e) => {
        e.preventDefault();
        if (input.trim() && !loading) {
            onSendMessage(input);
            setInput('');
        }
    };

    return (
        <div className="flex-1 flex flex-col h-full relative bg-[#0f172a]">
            {/* Header */}
            <div className="h-20 border-b border-slate-800 flex items-center justify-between px-8 bg-[#0f172a]/80 backdrop-blur-xl absolute top-0 left-0 right-0 z-10 shadow-sm">
                <div>
                    <h2 className="text-xl font-bold text-white flex items-center gap-3">
                        {currentFolder ? currentFolder.name : "All Documents"}
                        <span className="px-2 py-0.5 rounded-full bg-slate-800 text-[10px] text-slate-400 border border-slate-700 font-mono">
                            {currentFolder ? "SUBJECT" : "GLOBAL CONTEXT"}
                        </span>
                    </h2>
                </div>
                {currentFolder && (
                    <div className="flex gap-2">
                        <button
                            onClick={() => setIsDocListOpen(true)}
                            className="flex items-center gap-2 px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-sm font-medium rounded-xl transition-all border border-slate-700 active:scale-95"
                            title="Manage Files"
                        >
                            <BookOpen size={18} />
                            <span className="hidden md:inline">Files</span>
                        </button>
                        <button
                            onClick={onOpenUpload}
                            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium rounded-xl transition-all shadow-lg shadow-indigo-600/20 active:scale-95"
                        >
                            <Upload size={18} />
                            <span className="hidden md:inline">Upload PDF</span>
                        </button>
                    </div>
                )}
            </div>

            {/* Document List Modal */}
            <DocumentListModal
                isOpen={isDocListOpen}
                onClose={() => setIsDocListOpen(false)}
                currentFolder={currentFolder}
            />

            {/* Messages */}
            <div className="flex-1 overflow-y-auto pt-28 pb-8 px-4 md:px-20 lg:px-40 space-y-6 scroll-smooth">
                {messages.length === 0 && (
                    <div className="flex flex-col items-center justify-center h-2/3 text-slate-500 opacity-0 animate-in fade-in slide-in-from-bottom-4 duration-700 fill-mode-forwards">
                        <div className="mb-6 animate-bounce" style={{ animationDuration: '3s' }}>
                            <img src="/logo.png" alt="PocketRAG" className="w-20 h-20 drop-shadow-2xl" />
                        </div>
                        <h2 className="text-3xl font-bold text-white mb-2 tracking-tight">PocketRAG</h2>
                        <p className="text-sm">Ask a question to verify your knowledge.</p>
                    </div>
                )}

                {messages.map((msg, idx) => (
                    <div key={idx} className={`flex gap-4 ${msg.role === 'user' ? 'justify-end' : 'justify-start'} animate-in fade-in slide-in-from-bottom-2 duration-300`}>
                        {msg.role === 'user' ? (
                            <div className="max-w-[85%] bg-indigo-600 text-white px-5 py-3.5 rounded-2xl rounded-tr-sm shadow-xl shadow-indigo-900/20">
                                <p className="leading-relaxed">{msg.content}</p>
                            </div>
                        ) : (
                            <div className="max-w-[85%] space-y-3">
                                <div className="bg-slate-800 text-slate-200 px-6 py-5 rounded-2xl rounded-tl-sm shadow-xl border border-slate-700/50">
                                    <p className="leading-relaxed whitespace-pre-wrap">{msg.content}</p>
                                </div>

                                {/* Sources */}
                                {msg.sources && msg.sources.length > 0 && (
                                    <CollapsibleSources sources={msg.sources} />
                                )}
                            </div>
                        )}
                    </div>
                ))}
                {loading && (
                    <div className="flex justify-start animate-pulse">
                        <div className="bg-slate-800 px-5 py-3 rounded-2xl rounded-tl-sm text-slate-400 border border-slate-700/50 flex items-center gap-2">
                            <div className="w-2 h-2 bg-indigo-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                            <div className="w-2 h-2 bg-indigo-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                            <div className="w-2 h-2 bg-indigo-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                        </div>
                    </div>
                )}
                <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="p-6 bg-[#0f172a] absolute bottom-0 left-0 right-0 z-10">
                <form onSubmit={handleSubmit} className="max-w-4xl mx-auto relative group">
                    <div className="absolute inset-0 bg-indigo-500/20 blur-xl rounded-full opacity-0 group-hover:opacity-10 transition-opacity duration-500 pointer-events-none" />
                    <input
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        placeholder={`Ask about ${currentFolder ? currentFolder.name : 'all documents'}...`}
                        className="w-full bg-slate-800 text-slate-200 pl-6 pr-14 py-4 rounded-2xl border border-slate-700 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 focus:outline-none transition-all shadow-2xl placeholder:text-slate-500"
                    />
                    <button
                        type="submit"
                        disabled={!input.trim() || loading}
                        className="absolute right-3 top-3 p-2 bg-indigo-600 text-white rounded-xl hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg active:scale-95"
                    >
                        <Send size={18} />
                    </button>
                </form>
            </div>
        </div>
    );
}

function CollapsibleSources({ sources }) {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <div className="ml-4 mt-2">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center gap-2 text-xs font-bold text-slate-500 uppercase tracking-widest hover:text-indigo-400 transition-colors mb-2 pl-1"
            >
                <div className={`transform transition-transform duration-200 ${isOpen ? 'rotate-90' : ''}`}>
                    <ChevronRight size={12} />
                </div>
                {sources.length} Sources
            </button>

            {isOpen && (
                <div className="grid gap-2 animate-in slide-in-from-top-2 fade-in duration-200">
                    {sources.map((source, sIdx) => (
                        <div key={sIdx} className="bg-slate-900/80 p-3 rounded-xl border border-slate-800 hover:border-indigo-500/30 transition-all cursor-help group">
                            <div className="flex items-center justify-between mb-1">
                                <span className="text-xs font-semibold text-indigo-400">{source.document_title}</span>
                                <span className="text-[10px] bg-slate-800 px-1.5 py-0.5 rounded text-slate-400 group-hover:bg-indigo-900/30 group-hover:text-indigo-300 transition-colors">
                                    Page {source.page_number}
                                </span>
                            </div>
                            <p className="text-xs text-slate-400 italic leading-relaxed border-l-2 border-slate-700 pl-2 group-hover:border-indigo-500/50 transition-colors">
                                "{source.snippet.substring(0, 150)}..."
                            </p>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
