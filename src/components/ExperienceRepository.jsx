import React, { useState } from 'react';
import { useExperiences } from '../context/ExperienceContext';
import { Archive, Tag, CheckCircle2, FileText, MessageSquare, Calendar, Briefcase, Search, Filter, Download, ArrowRight, Award } from 'lucide-react';

export default function ExperienceRepository() {
  const { experiences, chatHistory } = useExperiences();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState('All');
  const [expandedCardId, setExpandedCardId] = useState(null);

  const experienceTypes = ['All', 'Work Experience', 'Internship', 'Project'];

  // Search and filter logic
  const filteredExperiences = experiences.filter(exp => {
    const star = exp.star || {};
    const matchesSearch = 
      exp.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      exp.company.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (exp.skills && exp.skills.some(s => s.toLowerCase().includes(searchQuery.toLowerCase()))) ||
      (star.situation && star.situation.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (star.result && star.result.toLowerCase().includes(searchQuery.toLowerCase()));
    
    const matchesType = selectedType === 'All' || exp.type === selectedType;

    return matchesSearch && matchesType;
  });

  const toggleExpandCard = (id) => {
    setExpandedCardId(expandedCardId === id ? null : id);
  };

  const handleExportJSON = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(experiences, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `Spectacle_Career_Repository.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const getRelevantChatLogs = (expTitle, expCompany) => {
    return chatHistory.filter(msg => {
      const text = msg.text.toLowerCase();
      return text.includes(expTitle.toLowerCase()) || text.includes(expCompany.toLowerCase());
    });
  };

  return (
    <div className="glass-panel animate-fade-in" style={{ padding: '2rem', height: '100%', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      
      {/* Top Header controls */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', borderBottom: '1px solid var(--border-glass)', paddingBottom: '1.5rem' }}>
        <div>
          <h3 style={{ fontSize: '1.5rem', fontFamily: 'var(--font-display)', display: 'flex', alignItems: 'center', gap: '0.6rem', color: 'var(--text-primary)' }}>
            <Archive size={28} style={{ color: 'var(--accent)' }} />
            Career Material Repository
          </h3>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
            Your compiled, structured, and verified STAR accomplishments ready for Resume building.
          </p>
        </div>

        <button 
          onClick={handleExportJSON}
          className="btn btn-secondary"
          style={{ padding: '0.6rem 1.25rem', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}
        >
          <Download size={16} /> Export JSON Data
        </button>
      </div>

      {/* Search and Filters Layout */}
      <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'center' }}>
        <div style={{ position: 'relative', flex: 1, minWidth: '250px' }}>
          <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
          <input 
            type="text" 
            placeholder="Search roles, skills, or achievements..." 
            className="form-input"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            style={{ paddingLeft: '2.5rem', fontSize: '0.9rem' }}
          />
        </div>

        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', alignItems: 'center' }}>
          <Filter size={16} style={{ color: 'var(--text-muted)', marginRight: '0.25rem' }} />
          {experienceTypes.map(type => (
            <button
              key={type}
              onClick={() => setSelectedType(type)}
              style={{
                padding: '0.4rem 1rem',
                fontSize: '0.8rem',
                fontWeight: 600,
                borderRadius: '999px',
                border: `1px solid ${selectedType === type ? 'var(--accent)' : 'var(--border-glass)'}`,
                background: selectedType === type ? 'var(--accent-grad)' : 'rgba(255,255,255,0.4)',
                color: selectedType === type ? '#fff' : 'var(--text-secondary)',
                cursor: 'pointer',
                transition: 'all 0.2s'
              }}
            >
              {type}
            </button>
          ))}
        </div>
      </div>

      {/* Repository List Grid */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', overflowY: 'auto', flex: 1, maxHeight: 'calc(100vh - 350px)', paddingRight: '0.5rem' }}>
        {filteredExperiences.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '4rem 2rem', color: 'var(--text-muted)' }}>
            <Archive size={48} style={{ strokeWidth: 1, marginBottom: '1rem', color: 'var(--text-muted)' }} />
            <p style={{ fontWeight: 600, fontSize: '1rem' }}>No experiences found</p>
            <p style={{ fontSize: '0.85rem' }}>Add items in the workspace or refine your filters.</p>
          </div>
        ) : (
          filteredExperiences.map(exp => {
            const isExpanded = expandedCardId === exp.id;
            const relevantChats = getRelevantChatLogs(exp.title, exp.company);
            const skills = exp.skills || [];
            const strengths = exp.strengths || [];
            const star = exp.star || {};

            return (
              <div 
                key={exp.id}
                className="glass-card animate-fade-in"
                style={{
                  padding: '1.5rem',
                  borderRadius: 'var(--radius-md)',
                  background: 'rgba(255,255,255,0.4)',
                  border: `1px solid ${isExpanded ? 'rgba(37,99,235,0.2)' : 'var(--border-glass)'}`,
                  boxShadow: isExpanded ? 'var(--shadow-md)' : 'var(--shadow-sm)'
                }}
              >
                {/* Card Title Header */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '0.75rem', cursor: 'pointer' }} onClick={() => toggleExpandCard(exp.id)}>
                  <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                    <div style={{
                      background: 'rgba(37,99,235,0.1)',
                      width: '40px',
                      height: '40px',
                      borderRadius: '8px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: 'var(--accent)'
                    }}>
                      <Briefcase size={20} />
                    </div>
                    <div>
                      <h4 style={{ fontSize: '1.15rem', fontWeight: 700, color: 'var(--text-primary)' }}>{exp.title}</h4>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '0.2rem' }}>
                        <span>{exp.company}</span>
                        <span>•</span>
                        <Calendar size={12} />
                        <span>{exp.period}</span>
                      </div>
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <span className="badge badge-s" style={{ fontSize: '0.7rem' }}>{exp.type || 'Work'}</span>
                    <div style={{
                      fontSize: '0.8rem',
                      fontWeight: 700,
                      color: exp.score >= 100 ? 'var(--color-r)' : 'var(--accent)'
                    }}>
                      STAR Completion: {exp.score}%
                    </div>
                  </div>
                </div>

                {/* STAR Structured narrative */}
                <div style={{ marginTop: '1.25rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  
                  {/* Situation, Task, Action, Result panels */}
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                    <div style={{ background: 'rgba(255,255,255,0.2)', padding: '0.75rem', borderRadius: '6px', borderLeft: '3px solid var(--color-s)' }}>
                      <strong style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--color-s)', display: 'block', marginBottom: '0.2rem' }}>Situation</strong>
                      <p style={{ fontSize: '0.8rem', lineHeight: 1.35 }}>{star.situation || 'Pending details...'}</p>
                    </div>
                    <div style={{ background: 'rgba(255,255,255,0.2)', padding: '0.75rem', borderRadius: '6px', borderLeft: '3px solid var(--color-t)' }}>
                      <strong style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--color-t)', display: 'block', marginBottom: '0.2rem' }}>Task</strong>
                      <p style={{ fontSize: '0.8rem', lineHeight: 1.35 }}>{star.task || 'Pending details...'}</p>
                    </div>
                    <div style={{ background: 'rgba(255,255,255,0.2)', padding: '0.75rem', borderRadius: '6px', borderLeft: '3px solid var(--color-a)' }}>
                      <strong style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--color-a)', display: 'block', marginBottom: '0.2rem' }}>Action</strong>
                      <p style={{ fontSize: '0.8rem', lineHeight: 1.35 }}>{star.action || 'Pending details...'}</p>
                    </div>
                    <div style={{ background: 'rgba(255,255,255,0.2)', padding: '0.75rem', borderRadius: '6px', borderLeft: '3px solid var(--color-r)' }}>
                      <strong style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--color-r)', display: 'block', marginBottom: '0.2rem' }}>Result</strong>
                      <p style={{ fontSize: '0.8rem', lineHeight: 1.35 }}>{star.result || 'Pending details...'}</p>
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                    {/* Skills tags */}
                    <div>
                      <h5 style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.35rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                        <Tag size={14} style={{ color: 'var(--accent)' }} />
                        Skills inventory
                      </h5>
                      {skills.length === 0 ? (
                        <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontStyle: 'italic' }}>No skills logged.</p>
                      ) : (
                        <div style={{ display: 'flex', gap: '0.3rem', flexWrap: 'wrap' }}>
                          {skills.map(s => (
                            <span key={s} style={{ fontSize: '0.75rem', fontWeight: 600, background: 'rgba(37,99,235,0.06)', border: '1px solid rgba(37,99,235,0.12)', color: 'var(--accent)', padding: '0.2rem 0.5rem', borderRadius: '4px' }}>{s}</span>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Strengths tags */}
                    <div>
                      <h5 style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.35rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                        <Award size={14} style={{ color: '#f59e0b' }} />
                        Strengths
                      </h5>
                      {strengths.length === 0 ? (
                        <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontStyle: 'italic' }}>No strengths logged.</p>
                      ) : (
                        <div style={{ display: 'flex', gap: '0.3rem', flexWrap: 'wrap' }}>
                          {strengths.map(s => (
                            <span key={s} style={{ fontSize: '0.75rem', fontWeight: 600, background: 'rgba(245, 158, 11, 0.06)', border: '1px solid rgba(245, 158, 11, 0.12)', color: '#b45309', padding: '0.2rem 0.5rem', borderRadius: '4px' }}>{s}</span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Expand Toggle Button */}
                <div style={{ marginTop: '1rem', borderTop: '1px solid var(--border-glass)', paddingTop: '0.75rem', display: 'flex', justifyContent: 'flex-end' }}>
                  <button 
                    onClick={() => toggleExpandCard(exp.id)}
                    style={{
                      background: 'transparent',
                      border: 'none',
                      color: 'var(--accent)',
                      fontSize: '0.8rem',
                      fontWeight: 600,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.25rem'
                    }}
                  >
                    {isExpanded ? 'Hide Audits' : 'View Audits & Education details'}
                    <ArrowRight size={12} style={{ transform: isExpanded ? 'rotate(-90deg)' : 'rotate(90deg)', transition: 'transform 0.2s' }} />
                  </button>
                </div>

                {/* Expanded Details: Chat Log + Raw Extracts */}
                {isExpanded && (
                  <div style={{ marginTop: '1rem', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', borderTop: '1px dashed var(--border-glass)', paddingTop: '1.25rem', animation: 'fadeIn 0.25s' }}>
                    
                    {/* Chat Logs Archive */}
                    <div>
                      <h5 style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                        <MessageSquare size={14} style={{ color: 'var(--color-s)' }} />
                        Refinement Chat Audits ({relevantChats.length})
                      </h5>
                      <div style={{
                        maxHeight: '180px',
                        overflowY: 'auto',
                        padding: '0.75rem',
                        background: 'rgba(255,255,255,0.3)',
                        borderRadius: 'var(--radius-sm)',
                        border: '1px solid var(--border-glass)',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '0.6rem'
                      }}>
                        {relevantChats.length === 0 ? (
                          <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontStyle: 'italic' }}>
                            No specific dialogue logs recorded.
                          </p>
                        ) : (
                          relevantChats.map(c => (
                            <div key={c.id} style={{ fontSize: '0.75rem', lineHeight: 1.35 }}>
                              <strong style={{ color: c.sender === 'user' ? 'var(--accent)' : 'var(--color-r)' }}>
                                {c.sender === 'user' ? 'You: ' : 'Coach: '}
                              </strong>
                              <span style={{ color: 'var(--text-secondary)' }}>{c.text}</span>
                            </div>
                          ))
                        )}
                      </div>
                    </div>

                    {/* Original Raw Extracts & Education */}
                    <div>
                      <h5 style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '0.3rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                        <Award size={14} style={{ color: '#a855f7' }} />
                        Education details
                      </h5>
                      <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '0.75rem', background: 'rgba(255,255,255,0.3)', padding: '0.5rem', borderRadius: '4px', border: '1px solid var(--border-glass)' }}>
                        {exp.education || 'No education details linked.'}
                      </p>

                      <h5 style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '0.3rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                        <FileText size={14} style={{ color: 'var(--text-muted)' }} />
                        Source Material Snippet
                      </h5>
                      <div style={{
                        padding: '0.75rem',
                        background: 'rgba(255,255,255,0.3)',
                        borderRadius: 'var(--radius-sm)',
                        border: '1px solid var(--border-glass)',
                        fontSize: '0.75rem',
                        color: 'var(--text-muted)',
                        lineHeight: 1.4,
                        maxHeight: '100px',
                        overflowY: 'auto',
                        whiteSpace: 'pre-wrap'
                      }}>
                        {exp.description || 'No raw material text attached. Created manually from dashboard workspace.'}
                      </div>
                    </div>

                  </div>
                )}

              </div>
            );
          })
        )}
      </div>

    </div>
  );
}
