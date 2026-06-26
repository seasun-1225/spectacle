import React, { useState } from 'react';
import { ExperienceProvider } from './context/ExperienceContext';
import DocumentUpload from './components/DocumentUpload';
import STARChatbot from './components/STARChatbot';
import KnowledgeGraph from './components/KnowledgeGraph';
import ResumeBuilder from './components/ResumeBuilder';
import ExperienceRepository from './components/ExperienceRepository';
import { Network, FileText, Archive, Glasses, Code } from 'lucide-react';

function Dashboard() {
  const [activeTab, setActiveTab] = useState('workspace'); // 'workspace' | 'repository' | 'ats'

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      
      {/* Background Gradient Mesh */}
      <div className="bg-mesh" />

      {/* Top Navbar */}
      <header className="no-print" style={{
        background: 'rgba(240, 249, 255, 0.65)',
        backdropFilter: 'blur(20px)',
        borderBottom: '1px solid var(--border-glass)',
        padding: '1rem 2rem',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        position: 'sticky',
        top: 0,
        zIndex: 50
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div style={{
            background: 'var(--accent-grad)',
            width: '40px',
            height: '40px',
            borderRadius: '12px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 4px 12px rgba(29, 78, 216, 0.2)'
          }}>
            <Glasses size={20} color="#fff" />
          </div>
          <div>
            <h1 style={{ fontSize: '1.45rem', fontFamily: 'var(--font-display)', fontWeight: 800, letterSpacing: '-0.02em', background: 'linear-gradient(to right, #1c1917, #57534e)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              Spectacle.
            </h1>
            <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Interactive Visual Career Portfolio & STAR Compiler</p>
          </div>
        </div>

        {/* Navigation Tabs */}
        <nav style={{ display: 'flex', gap: '0.75rem' }}>
          <button 
            onClick={() => setActiveTab('workspace')}
            className="btn"
            style={{
              padding: '0.5rem 1.25rem',
              fontSize: '0.85rem',
              background: activeTab === 'workspace' ? 'rgba(255,255,255,0.75)' : 'transparent',
              border: activeTab === 'workspace' ? '1px solid var(--border-glass-hover)' : '1px solid transparent',
              color: activeTab === 'workspace' ? 'var(--accent)' : 'var(--text-secondary)'
            }}
          >
            <Network size={16} />
            Career Builder
          </button>

          <button 
            onClick={() => setActiveTab('repository')}
            className="btn"
            style={{
              padding: '0.5rem 1.25rem',
              fontSize: '0.85rem',
              background: activeTab === 'repository' ? 'rgba(255,255,255,0.75)' : 'transparent',
              border: activeTab === 'repository' ? '1px solid var(--border-glass-hover)' : '1px solid transparent',
              color: activeTab === 'repository' ? 'var(--accent)' : 'var(--text-secondary)'
            }}
          >
            <Archive size={16} />
            Experience Repository
          </button>

          <button 
            onClick={() => setActiveTab('ats')}
            className="btn"
            style={{
              padding: '0.5rem 1.25rem',
              fontSize: '0.85rem',
              background: activeTab === 'ats' ? 'rgba(255,255,255,0.75)' : 'transparent',
              border: activeTab === 'ats' ? '1px solid var(--border-glass-hover)' : '1px solid transparent',
              color: activeTab === 'ats' ? 'var(--accent)' : 'var(--text-secondary)'
            }}
          >
            <FileText size={16} />
            Resume Builder
          </button>
        </nav>
      </header>

      {/* Main Content Area */}
      <main style={{ flex: 1, padding: '2rem', display: 'flex', flexDirection: 'column', maxWidth: '1480px', width: '100%', margin: '0 auto' }}>
        
        {/* Workspace Layout */}
        {activeTab === 'workspace' && (
          <div 
            className="animate-fade-in"
            style={{
              display: 'grid',
              gridTemplateColumns: '1.2fr 1fr',
              gap: '2rem',
              flex: 1,
              alignItems: 'stretch',
              height: 'calc(100vh - 160px)',
              minHeight: '650px'
            }}
          >
            <div style={{ height: '100%' }}>
              <KnowledgeGraph />
            </div>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', height: '100%' }}>
              <div style={{ flexShrink: 0 }}>
                <DocumentUpload />
              </div>
              
              <div style={{ flex: 1, minHeight: 0 }}>
                <STARChatbot />
              </div>
            </div>
          </div>
        )}

        {/* Experience Repository View */}
        {activeTab === 'repository' && (
          <div className="animate-fade-in" style={{ flex: 1, minHeight: '600px' }}>
            <ExperienceRepository />
          </div>
        )}

        {/* Resume Builder View */}
        {activeTab === 'ats' && (
          <div className="animate-fade-in" style={{ flex: 1, minHeight: '600px' }}>
            <ResumeBuilder />
          </div>
        )}

      </main>

      {/* Footer */}
      <footer className="no-print" style={{
        textAlign: 'center',
        padding: '1.5rem',
        borderTop: '1px solid var(--border-glass)',
        fontSize: '0.75rem',
        color: 'var(--text-muted)',
        background: 'rgba(255, 255, 255, 0.25)'
      }}>
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.5rem' }}>
          <Code size={12} />
          <span>Spectacle Developer Suite • Powered by React & Google Gemini 3.5</span>
        </div>
      </footer>
    </div>
  );
}

export default function App() {
  return (
    <ExperienceProvider>
      <Dashboard />
    </ExperienceProvider>
  );
}
