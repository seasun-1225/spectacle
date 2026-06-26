import React, { useState, useEffect } from 'react';
import { useExperiences } from '../context/ExperienceContext';
import { FileText, Copy, Printer, Check, Settings, Sparkles, RefreshCw, Search, Database, Globe } from 'lucide-react';

const popularJobsDatabase = [
  {
    id: 'job-goog-se',
    company: 'Google',
    role: 'Senior Software Engineer, Frontend',
    desc: 'Requirements:\n- 5+ years experience building complex interactive React interfaces.\n- Strong layout system configuration, Swift/Vite configuration, and CSS micro-animations.\n- Proven track record optimizing rendering pipelines and dynamic code splitting.'
  },
  {
    id: 'job-meta-pd',
    company: 'Meta',
    role: 'Product Designer',
    desc: 'Requirements:\n- Experience styling rich, glassmorphic client dashboards and responsive network nodes.\n- Deep understanding of user behavior metrics and information density layouts.\n- Experience working with React frontend developers to translate SVG designs to production.'
  },
  {
    id: 'job-amzn-ca',
    company: 'Amazon',
    role: 'Cloud Architect',
    desc: 'Requirements:\n- cloud architect systems infrastructure planning and deployment.\n- Strong background with serverless patterns, cloud security profiles, and cost optimization databases.\n- Experience migrating monolithic infrastructure.'
  },
  {
    id: 'job-appl-swe',
    company: 'Apple',
    role: 'iOS Applications Engineer',
    desc: 'Requirements:\n- iOS application engineering expertise with Swift, SwiftUI, and local system frameworks.\n- Detail-oriented visual alignment, typography styling, and swift animation speeds.\n- Experience conducting unit testing and Swift CI integrations.'
  },
  {
    id: 'job-msft-ai',
    company: 'Microsoft',
    role: 'AI Interface Developer',
    desc: 'Requirements:\n- Experience crafting dashboard interfaces for large language models and prompt compilers.\n- Node.js, Python, and frontend React state management integration.\n- Familiarity with vector storage lookups and automated workflow pipelines.'
  }
];

export default function ResumeBuilder() {
  const { 
    userName,
    setUserName,
    experiences, 
    applicationProfile, 
    updateApplicationProfile,
    geminiApiKey 
  } = useExperiences();

  const [activeTab, setActiveTab] = useState('resume'); // 'resume' | 'coverletter'
  const [styleTemplate, setStyleTemplate] = useState('minimal'); // 'dark' | 'minimal' | 'executive'
  const [generatedResume, setGeneratedResume] = useState('');
  const [generatedLetter, setGeneratedLetter] = useState('');
  const [copied, setCopied] = useState(false);
  const [isCompiling, setIsCompiling] = useState(false);

  // Wiki API States
  const [wikiLoading, setWikiLoading] = useState(false);
  const [wikiResult, setWikiResult] = useState('');

  // Auto compile documents when experiences or job details change
  useEffect(() => {
    compileDocuments();
  }, [experiences, applicationProfile, userName, activeTab]);

  const compileDocuments = async () => {
    setIsCompiling(true);
    
    const validExperiences = Array.isArray(experiences) ? experiences.filter(Boolean) : [];

    // If Gemini key is loaded, use it!
    if (geminiApiKey.trim()) {
      try {
        const query = activeTab === 'resume' ? 
          `Create a professional, ATS-friendly markdown resume for a ${applicationProfile.targetRole} role at ${applicationProfile.targetCompany} based on the following STAR experiences.
          Job Description: ${applicationProfile.targetJobDesc}
          Experiences: ${JSON.stringify(validExperiences.map(e => ({ title: e.title || '', company: e.company || '', period: e.period || '', star: e.star || {}, skills: e.skills || [] })))}
          Format with sections: HEADER, PROFESSIONAL SUMMARY, WORK EXPERIENCE (structure with STAR bullet points), SKILLS.` :
          `Create a professional cover letter for a ${applicationProfile.targetRole} role at ${applicationProfile.targetCompany} based on the following STAR experiences.
          Job Description: ${applicationProfile.targetJobDesc}
          Experiences: ${JSON.stringify(validExperiences.map(e => ({ title: e.title || '', company: e.company || '', period: e.period || '', star: e.star || {}, skills: e.skills || [] })))}
          Format cleanly in business cover letter style.`;

        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${geminiApiKey}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ parts: [{ text: query }] }]
          })
        });

        const data = await response.json();
        const outputText = data.candidates?.[0]?.content?.parts?.[0]?.text;
        
        if (outputText) {
          if (activeTab === 'resume') {
            setGeneratedResume(outputText);
          } else {
            setGeneratedLetter(outputText);
          }
          setIsCompiling(false);
          return;
        }
      } catch (err) {
        console.error("Gemini Document Compiler failed, falling back to local template:", err);
      }
    }

    // LOCAL COMPILE / STATIC FALLBACK (High quality compiler)
    await new Promise(r => setTimeout(r, 1200));

    // Compile Resume
    const allSkills = Array.from(new Set(validExperiences.flatMap(e => e.skills || [])));
    
    let resumeText = `# Resume: ${userName}\n\n`;
    resumeText += `**Target Role**: ${applicationProfile.targetRole}  \n`;
    resumeText += `**Target Company**: ${applicationProfile.targetCompany}  \n\n`;
    resumeText += `---\n\n`;
    resumeText += `## Professional Summary\n`;
    resumeText += `Results-oriented professional with specialized expertise in ${allSkills.slice(0, 4).join(', ')}. Proven track record of leveraging structured STAR frameworks to deliver impactful initiatives at high-growth organizations. Highly aligned to the requirements for the ${applicationProfile.targetRole} position at ${applicationProfile.targetCompany}.\n\n`;
    resumeText += `## Work Experience\n\n`;

    validExperiences.forEach(exp => {
      resumeText += `### ${exp.title || 'Specialist'} | ${exp.company || 'Company'}\n`;
      resumeText += `*${exp.period || 'Period'}*\n\n`;
      const star = exp.star || {};
      if (star.situation) {
        resumeText += `- **Situation**: ${star.situation}\n`;
      }
      if (star.task) {
        resumeText += `- **Task**: ${star.task}\n`;
      }
      if (star.action) {
        resumeText += `- **Action**: ${star.action}\n`;
      }
      if (star.result) {
        resumeText += `- **Result**: ${star.result}\n`;
      }
      if (!star.situation && !star.task && !star.action && !star.result) {
        resumeText += `- ${exp.description || 'Details coming soon...'}\n`;
      }
      resumeText += `\n`;
    });

    resumeText += `## Core Skills\n`;
    resumeText += `${allSkills.join(' • ')}\n`;

    // Compile Cover Letter
    let letterText = `Dear Hiring Team at ${applicationProfile.targetCompany},\n\n`;
    letterText += `I am writing to express my enthusiastic interest in the ${applicationProfile.targetRole} position at ${applicationProfile.targetCompany}. With a rich background across multiple technology spaces and a proven history of execution, I am confident in my ability to make an immediate impact on your team.\n\n`;

    if (validExperiences.length > 0) {
      const topExp = validExperiences[0];
      const star = topExp.star || {};
      letterText += `In my recent role as ${topExp.title || 'Specialist'} at ${topExp.company || 'Company'}, I faced a key challenge: ${star.situation || topExp.description || 'coordinating system needs'}. Recognizing the target, I set out to ${star.task || 'implement solutions'}. Specifically, I ${star.action || 'coordinated core requirements'}. As a direct result, our efforts led to ${star.result || 'substantial workflow improvements'}.\n\n`;
    }

    letterText += `I am excited to bring my core skills in ${allSkills.slice(0, 5).join(', ')} to your organization and contribute to your ongoing success. Thank you for your time and consideration.\n\n`;
    letterText += `Sincerely,\n${userName}`;

    setGeneratedResume(resumeText);
    setGeneratedLetter(letterText);
    setIsCompiling(false);
  };

  const handleCopy = () => {
    const textToCopy = activeTab === 'resume' ? generatedResume : generatedLetter;
    navigator.clipboard.writeText(textToCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handlePrint = () => {
    window.print();
  };

  // Wikipedia Company Info Fetch API
  const handleWikiLookup = async () => {
    if (!applicationProfile.targetCompany.trim()) return;
    setWikiLoading(true);
    setWikiResult('');
    try {
      const searchRes = await fetch(
        `https://en.wikipedia.org/w/api.php?action=query&format=json&origin=*&list=search&srsearch=${encodeURIComponent(applicationProfile.targetCompany + ' company')}`
      );
      const searchData = await searchRes.json();
      const firstResult = searchData.query?.search?.[0];

      if (firstResult) {
        const pageRes = await fetch(
          `https://en.wikipedia.org/w/api.php?action=query&format=json&origin=*&prop=extracts&exintro=1&explaintext=1&titles=${encodeURIComponent(firstResult.title)}`
        );
        const pageData = await pageRes.json();
        const pages = pageData.query?.pages;
        const pageId = Object.keys(pages)[0];
        const extract = pages[pageId]?.extract;

        if (extract) {
          const cleanExtract = extract.substring(0, 240) + '...';
          setWikiResult(cleanExtract);
          
          updateApplicationProfile({
            targetJobDesc: `[Company Insight - Wiki Database]: ${cleanExtract}\n\n[Requirements Profile]:\n${applicationProfile.targetJobDesc}`
          });
        } else {
          setWikiResult('Company page loaded, but no brief summary was extracted.');
        }
      } else {
        setWikiResult('No matches found in Wikipedia records.');
      }
    } catch (e) {
      console.error(e);
      setWikiResult('Failed to connect to Wikipedia API.');
    } finally {
      setWikiLoading(false);
    }
  };

  // Job Posting Directory Selection
  const handleSelectPreloadedJob = (jobId) => {
    if (!jobId) return;
    const selected = popularJobsDatabase.find(j => j.id === jobId);
    if (selected) {
      updateApplicationProfile({
        targetCompany: selected.company,
        targetRole: selected.role,
        targetJobDesc: selected.desc
      });
      setWikiResult(`Loaded job description template for ${selected.company}. Click 'API Lookup' to pull corporate records.`);
    }
  };

  const renderPreviewHtml = (text) => {
    if (!text) return <p style={{ color: 'var(--text-muted)' }}>Generating...</p>;

    return text.split('\n').map((line, idx) => {
      if (line.startsWith('# ')) {
        return <h1 key={idx} style={{ borderBottom: '2px solid var(--accent)', paddingBottom: '0.5rem', marginBottom: '1rem', marginTop: '1rem', fontFamily: 'var(--font-display)' }}>{line.replace('# ', '')}</h1>;
      }
      if (line.startsWith('## ')) {
        return <h2 key={idx} style={{ borderBottom: '1px solid var(--border-glass)', paddingBottom: '0.25rem', marginBottom: '0.75rem', marginTop: '1.25rem', color: 'var(--accent)', fontFamily: 'var(--font-display)' }}>{line.replace('## ', '')}</h2>;
      }
      if (line.startsWith('### ')) {
        return <h3 key={idx} style={{ marginBottom: '0.25rem', marginTop: '0.75rem', fontSize: '1.1rem' }}>{line.replace('### ', '')}</h3>;
      }
      if (line.startsWith('*') && line.endsWith('*')) {
        return <p key={idx} style={{ fontStyle: 'italic', color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '0.5rem' }}>{line.replace(/\*/g, '')}</p>;
      }
      if (line.startsWith('- ')) {
        const cleanLine = line.replace('- ', '');
        const parts = cleanLine.split('**');
        return (
          <li key={idx} style={{ marginLeft: '1.5rem', marginBottom: '0.4rem', fontSize: '0.9rem', lineHeight: '1.4' }}>
            {parts.map((part, pIdx) => pIdx % 2 === 1 ? <strong key={pIdx} style={{ color: 'var(--text-primary)' }}>{part}</strong> : part)}
          </li>
        );
      }
      if (line.trim() === '---') {
        return <hr key={idx} style={{ border: 'none', borderBottom: '1px solid var(--border-glass)', margin: '1rem 0' }} />;
      }
      if (line.trim().length > 0) {
        const parts = line.split('**');
        return (
          <p key={idx} style={{ marginBottom: '0.8rem', fontSize: '0.9rem', lineHeight: '1.45', color: 'var(--text-secondary)' }}>
            {parts.map((part, pIdx) => pIdx % 2 === 1 ? <strong key={pIdx} style={{ color: 'var(--text-primary)' }}>{part}</strong> : part)}
          </p>
        );
      }
      return <div key={idx} style={{ height: '0.5rem' }} />;
    });
  };

  const getPreviewStyles = () => {
    switch(styleTemplate) {
      case 'dark':
        return {
          background: '#0d1117',
          color: '#c9d1d9',
          fontFamily: 'Courier New, monospace',
          borderColor: '#30363d'
        };
      case 'executive':
        return {
          background: '#fff',
          color: '#1a1a1a',
          fontFamily: 'Georgia, serif',
          borderColor: '#1e3a8a',
          padding: '2.5rem'
        };
      case 'minimal':
      default:
        return {
          background: 'rgba(255, 255, 255, 0.4)',
          color: 'var(--text-secondary)',
          fontFamily: 'var(--font-body)',
          borderColor: 'var(--border-glass)'
        };
    }
  };

  return (
    <div className="glass-panel" style={{ padding: '1.5rem', height: '100%', display: 'flex', flexDirection: 'column' }}>
      
      {/* 3-Column Settings Grid (Job Target + Wikipedia Search + Text Details) */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.1fr 1.2fr 1.7fr', gap: '1.5rem', marginBottom: '1.5rem', borderBottom: '1px solid var(--border-glass)', paddingBottom: '1.5rem' }}>
        
        {/* Column 1: Manual alignment targets */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          <h4 style={{ fontSize: '0.9rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--text-primary)' }}>
            <Settings size={14} style={{ color: 'var(--accent)' }} />
            1. Manual Targets
          </h4>
          <div>
            <label className="form-label" style={{ fontSize: '0.75rem', marginBottom: '0.2rem' }}>Your Name</label>
            <input 
              type="text" 
              className="form-input" 
              value={userName}
              onChange={e => setUserName(e.target.value)}
              placeholder="e.g. Jane Doe"
              style={{ padding: '0.4rem 0.6rem', fontSize: '0.8rem' }}
            />
          </div>
          <div>
            <label className="form-label" style={{ fontSize: '0.75rem', marginBottom: '0.2rem' }}>Company</label>
            <input 
              type="text" 
              className="form-input" 
              value={applicationProfile.targetCompany}
              onChange={e => updateApplicationProfile({ targetCompany: e.target.value })}
              placeholder="e.g. Google"
              style={{ padding: '0.4rem 0.6rem', fontSize: '0.8rem' }}
            />
          </div>
          <div>
            <label className="form-label" style={{ fontSize: '0.75rem', marginBottom: '0.2rem' }}>Role Title</label>
            <input 
              type="text" 
              className="form-input" 
              value={applicationProfile.targetRole}
              onChange={e => updateApplicationProfile({ targetRole: e.target.value })}
              placeholder="e.g. Frontend Engineer"
              style={{ padding: '0.4rem 0.6rem', fontSize: '0.8rem' }}
            />
          </div>
        </div>

        {/* Column 2: External Database Connection */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', borderLeft: '1px solid var(--border-glass)', paddingLeft: '1.25rem', borderRight: '1px solid var(--border-glass)', paddingRight: '1.25rem' }}>
          <h4 style={{ fontSize: '0.9rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--text-primary)' }}>
            <Database size={14} style={{ color: 'var(--color-s)' }} />
            2. Directory & API Lookup
          </h4>
          
          <div>
            <label className="form-label" style={{ fontSize: '0.75rem', marginBottom: '0.2rem' }}>Job Posting Database</label>
            <select 
              className="form-select" 
              onChange={e => handleSelectPreloadedJob(e.target.value)}
              defaultValue=""
              style={{ padding: '0.4rem 0.6rem', fontSize: '0.8rem' }}
            >
              <option value="" disabled>-- Query Active Job Board --</option>
              {popularJobsDatabase.map(j => (
                <option key={j.id} value={j.id}>{j.company} - {j.role}</option>
              ))}
            </select>
          </div>

          <div style={{ marginTop: '0.25rem' }}>
            <label className="form-label" style={{ fontSize: '0.75rem', marginBottom: '0.2rem' }}>Company Wikidata API</label>
            <div style={{ display: 'flex', gap: '0.35rem' }}>
              <input 
                type="text"
                className="form-input"
                placeholder="Lookup in Wikipedia..."
                value={applicationProfile.targetCompany}
                onChange={e => updateApplicationProfile({ targetCompany: e.target.value })}
                style={{ padding: '0.4rem 0.6rem', fontSize: '0.8rem', flex: 1 }}
              />
              <button 
                type="button" 
                onClick={handleWikiLookup} 
                className="btn btn-secondary"
                disabled={wikiLoading}
                style={{ padding: '0.4rem 0.75rem', display: 'flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.8rem', flexShrink: 0 }}
              >
                {wikiLoading ? <RefreshCw size={12} className="animate-spin" style={{ animation: 'spin 2s linear infinite' }} /> : <Globe size={12} />}
                API
              </button>
            </div>
          </div>

          {wikiResult && (
            <div style={{
              marginTop: '0.25rem',
              padding: '0.5rem',
              borderRadius: '4px',
              background: 'rgba(255,255,255,0.2)',
              border: '1px solid rgba(0,0,0,0.05)',
              fontSize: '0.7rem',
              color: 'var(--text-secondary)',
              lineHeight: 1.3,
              maxHeight: '65px',
              overflowY: 'auto'
            }}>
              {wikiResult}
            </div>
          )}
        </div>

        {/* Column 3: Tailoring Job Requirements Context */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
          <h4 style={{ fontSize: '0.9rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--text-primary)' }}>
            <FileText size={14} style={{ color: 'var(--color-a)' }} />
            3. Job Description Details
          </h4>
          <textarea 
            className="form-textarea" 
            value={applicationProfile.targetJobDesc}
            onChange={e => updateApplicationProfile({ targetJobDesc: e.target.value })}
            placeholder="Selected job descriptions populate here. You can manually edit or paste target requirements..."
            style={{ fontSize: '0.8rem', minHeight: '125px', flex: 1 }}
          />
        </div>
      </div>

      {/* Tabs and document actions */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.5rem' }}>
        <div style={{ display: 'flex', gap: '0.5rem', background: 'rgba(0,0,0,0.03)', padding: '0.25rem', borderRadius: 'var(--radius-sm)' }}>
          <button 
            onClick={() => setActiveTab('resume')}
            style={{
              padding: '0.4rem 0.8rem',
              fontSize: '0.85rem',
              fontWeight: 600,
              background: activeTab === 'resume' ? 'var(--accent-grad)' : 'transparent',
              color: activeTab === 'resume' ? '#fff' : 'var(--text-secondary)',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              transition: 'all 0.15s'
            }}
          >
            Tailored Resume
          </button>
          <button 
            onClick={() => setActiveTab('coverletter')}
            style={{
              padding: '0.4rem 0.8rem',
              fontSize: '0.85rem',
              fontWeight: 600,
              background: activeTab === 'coverletter' ? 'var(--accent-grad)' : 'transparent',
              color: activeTab === 'coverletter' ? '#fff' : 'var(--text-secondary)',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              transition: 'all 0.15s'
            }}
          >
            Cover Letter
          </button>
        </div>

        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
          {activeTab === 'resume' && (
            <select 
              className="form-select" 
              value={styleTemplate} 
              onChange={e => setStyleTemplate(e.target.value)}
              style={{ padding: '0.35rem 0.75rem', fontSize: '0.8rem', width: 'auto' }}
            >
              <option value="minimal">Sleek Minimal</option>
              <option value="dark">Retro Terminal</option>
              <option value="executive">Corporate Print</option>
            </select>
          )}

          <button 
            onClick={handleCopy} 
            className="btn btn-secondary" 
            style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '0.3rem' }}
          >
            {copied ? <Check size={14} style={{ color: 'var(--color-r)' }} /> : <Copy size={14} />}
            {copied ? 'Copied' : 'Copy'}
          </button>

          <button 
            onClick={handlePrint} 
            className="btn btn-secondary" 
            style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '0.3rem' }}
          >
            <Printer size={14} />
            Print / PDF
          </button>

          <button 
            onClick={compileDocuments} 
            className="btn btn-primary" 
            style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '0.3rem' }}
            disabled={isCompiling}
          >
            {isCompiling ? <RefreshCw size={14} className="animate-spin" style={{ animation: 'spin 2s linear infinite' }} /> : <Sparkles size={14} />}
            Re-Generate
          </button>
        </div>
      </div>

      {/* Preview container */}
      <div 
        className="resume-print-container"
        style={{
          flex: 1,
          overflowY: 'auto',
          padding: '2rem',
          borderRadius: 'var(--radius-sm)',
          border: '1px solid',
          transition: 'all 0.3s',
          ...getPreviewStyles()
        }}
      >
        {isCompiling ? (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', gap: '1rem' }}>
            <RefreshCw size={36} className="animate-spin" style={{ color: 'var(--accent)', animation: 'spin 2s linear infinite' }} />
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Tailoring document alignment to target database constraints...</p>
          </div>
        ) : (
          renderPreviewHtml(activeTab === 'resume' ? generatedResume : generatedLetter)
        )}
      </div>

    </div>
  );
}
