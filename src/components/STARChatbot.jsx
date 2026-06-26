import React, { useState, useRef, useEffect } from 'react';
import { useExperiences } from '../context/ExperienceContext';
import { Send, Key, Check, Info, HelpCircle, ShieldAlert, Sparkles } from 'lucide-react';

export default function STARChatbot() {
  const { 
    experiences, 
    activeExperienceId, 
    chatHistory, 
    sendMessageToInterviewer,
    geminiApiKey,
    setGeminiApiKey
  } = useExperiences();

  const [input, setInput] = useState('');
  const [showKeyInput, setShowKeyInput] = useState(false);
  const [tempKey, setTempKey] = useState(geminiApiKey);
  const messagesEndRef = useRef(null);

  const activeExp = experiences.find(e => e.id === activeExperienceId);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [chatHistory]);

  const handleSend = (e) => {
    e.preventDefault();
    if (!input.trim()) return;
    sendMessageToInterviewer(input);
    setInput('');
  };

  const handleSaveKey = (e) => {
    e.preventDefault();
    setGeminiApiKey(tempKey);
    setShowKeyInput(false);
  };

  // Helper to render completion dots/indicators
  const renderStarIndicator = (val, key, label) => {
    const isDone = val && val.trim().length > 10;
    return (
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '0.4rem',
        padding: '0.25rem 0.6rem',
        borderRadius: '999px',
        fontSize: '0.75rem',
        fontWeight: 600,
        background: isDone 
          ? `rgba(var(--color-${key}-rgb), 0.15)` 
          : 'rgba(255,255,255,0.03)',
        border: `1px solid ${isDone ? `rgba(var(--color-${key}-rgb), 0.3)` : 'rgba(255,255,255,0.05)'}`,
        color: isDone ? `var(--color-${key})` : 'var(--text-muted)'
      }}>
        {isDone ? <Check size={12} /> : <HelpCircle size={12} />}
        <span>{label}</span>
      </div>
    );
  };

  return (
    <div className="glass-panel" style={{ 
      display: 'flex', 
      flexDirection: 'column', 
      height: '100%',
      overflow: 'hidden'
    }}>
      {/* Header */}
      <div style={{ 
        padding: '1.25rem 1.5rem', 
        borderBottom: '1px solid var(--border-glass)',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        background: 'rgba(0, 0, 0, 0.1)'
      }}>
        <div>
          <h3 style={{ fontSize: '1.2rem', fontFamily: 'var(--font-display)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Sparkles size={20} style={{ color: 'var(--accent)' }} />
            STAR Career Coach
          </h3>
          {activeExp ? (
            <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
              Interviewing for: <strong style={{ color: 'var(--text-primary)' }}>{activeExp.title} ({activeExp.company})</strong>
            </p>
          ) : (
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>No experience selected</p>
          )}
        </div>
        
        {/* Gemini Key Config */}
        <button 
          onClick={() => setShowKeyInput(!showKeyInput)} 
          className="btn-icon" 
          title="Configure Gemini API Key"
          style={{ color: geminiApiKey ? 'var(--color-r)' : 'var(--text-muted)' }}
        >
          <Key size={18} />
        </button>
      </div>

      {/* API Key Modal Config Overlay */}
      {showKeyInput && (
        <div style={{
          padding: '1rem 1.5rem',
          background: 'rgba(99, 102, 241, 0.1)',
          borderBottom: '1px solid rgba(99, 102, 241, 0.2)',
          display: 'flex',
          flexDirection: 'column',
          gap: '0.50rem'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.85rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <Key size={14} style={{ color: 'var(--accent)' }} /> Optional: Gemini API Key
            </span>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Required for real-time live AI responses</span>
          </div>
          <form onSubmit={handleSaveKey} style={{ display: 'flex', gap: '0.5rem' }}>
            <input 
              type="password"
              className="form-input"
              placeholder="Paste AI Studio Key here..."
              value={tempKey}
              onChange={(e) => setTempKey(e.target.value)}
              style={{ padding: '0.4rem 0.8rem', fontSize: '0.85rem' }}
            />
            <button type="submit" className="btn btn-primary" style={{ padding: '0.4rem 1rem', fontSize: '0.85rem' }}>
              Save
            </button>
          </form>
        </div>
      )}

      {/* Active Experience completeness checklist */}
      {activeExp && (
        <div style={{
          display: 'flex',
          gap: '0.5rem',
          padding: '0.75rem 1.5rem',
          background: 'rgba(255, 255, 255, 0.01)',
          borderBottom: '1px solid var(--border-glass)',
          flexWrap: 'wrap',
          alignItems: 'center'
        }}>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 500, marginRight: '0.25rem' }}>
            STAR Completion:
          </span>
          {renderStarIndicator(activeExp.star?.situation, 's', 'Situation')}
          {renderStarIndicator(activeExp.star?.task, 't', 'Task')}
          {renderStarIndicator(activeExp.star?.action, 'a', 'Action')}
          {renderStarIndicator(activeExp.star?.result, 'r', 'Result')}
          <span style={{ 
            marginLeft: 'auto', 
            fontSize: '0.75rem', 
            fontWeight: 700, 
            color: activeExp.score >= 100 ? 'var(--color-r)' : 'var(--accent)'
          }}>
            STAR Completion: {activeExp.score}%
          </span>
        </div>
      )}

      {/* Messages Window */}
      <div style={{ 
        flex: 1, 
        overflowY: 'auto', 
        padding: '1.5rem', 
        display: 'flex', 
        flexDirection: 'column', 
        gap: '1.25rem' 
      }}>
        {chatHistory.map((msg) => {
          const isUser = msg.sender === 'user';
          return (
            <div 
              key={msg.id}
              style={{
                display: 'flex',
                justifyContent: isUser ? 'flex-end' : 'flex-start',
                width: '100%',
                animation: 'fadeIn 0.25s ease-out forwards'
              }}
            >
              <div style={{
                maxWidth: '85%',
                padding: '0.85rem 1.15rem',
                borderRadius: '12px',
                borderTopRightRadius: isUser ? '2px' : '12px',
                borderTopLeftRadius: isUser ? '12px' : '2px',
                background: isUser 
                  ? 'var(--accent-grad)' 
                  : 'rgba(255, 255, 255, 0.04)',
                border: isUser 
                  ? 'none' 
                  : '1px solid rgba(255, 255, 255, 0.05)',
                color: isUser ? '#fff' : 'var(--text-primary)',
                fontSize: '0.9rem',
                lineHeight: 1.45,
                whiteSpace: 'pre-wrap',
                boxShadow: isUser ? '0 4px 12px rgba(99, 102, 241, 0.2)' : 'none'
              }}>
                {msg.text}
              </div>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      {/* Chat Footer Input */}
      <form onSubmit={handleSend} style={{ 
        padding: '1.25rem 1.5rem', 
        borderTop: '1px solid var(--border-glass)',
        background: 'rgba(0, 0, 0, 0.15)',
        display: 'flex',
        gap: '0.75rem'
      }}>
        <input 
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={activeExp ? `Tell me more about your ${activeExp.title} role...` : "Choose an experience to start the interview..."}
          disabled={!activeExp}
          className="form-input"
          style={{ flex: 1 }}
        />
        <button 
          type="submit" 
          disabled={!input.trim() || !activeExp}
          className="btn btn-primary"
          style={{ padding: '0.75rem 1.25rem', flexShrink: 0 }}
        >
          <Send size={16} />
        </button>
      </form>
    </div>
  );
}
