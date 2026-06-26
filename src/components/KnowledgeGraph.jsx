import React, { useState, useEffect, useRef } from 'react';
import { useExperiences } from '../context/ExperienceContext';
import { Network, Plus, Trash2 } from 'lucide-react';

export default function KnowledgeGraph() {
  const { 
    userName,
    experiences, 
    activeExperienceId, 
    setActiveExperienceId, 
    updateExperience, 
    addExperience,
    deleteExperience
  } = useExperiences();

  const [nodes, setNodes] = useState([]);
  const [links, setLinks] = useState([]);
  const [selectedNode, setSelectedNode] = useState(null);
  const [editingText, setEditingText] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  
  const [newRole, setNewRole] = useState({ title: '', company: '', period: '', type: 'Work Experience', education: '', strengths: '' });

  const svgRef = useRef(null);
  const simulationRef = useRef(null);
  const dragNodeRef = useRef(null);

  const activeExp = experiences.find(e => e.id === activeExperienceId);

  // Generate taxonomy nodes and links based on Skills, Education, Experience, Strengths
  useEffect(() => {
    if (experiences.length === 0) {
      setNodes([]);
      setLinks([]);
      return;
    }

    const tempNodes = [];
    const tempLinks = [];

    // Center coordinates for a 600x450 canvas
    const cx = 300;
    const cy = 220;

    // 1. Central Anchor: User Name
    tempNodes.push({
      id: 'user-root',
      type: 'user-root',
      label: userName,
      x: cx,
      y: cy,
      vx: 0,
      vy: 0,
      size: 38,
      color: 'var(--accent)',
      borderColor: 'rgba(255, 255, 255, 0.5)'
    });

    // 2. Category Hubs (4 Areas) surrounding the user center - wider radius for breathing room
    const categories = [
      { id: 'cat-experience', label: 'Experience', color: 'rgba(37, 99, 235, 0.2)', border: 'var(--accent)', angle: -Math.PI / 4, radius: 95 },
      { id: 'cat-skills', label: 'Skills', color: 'rgba(2, 132, 199, 0.2)', border: '#0284c7', angle: Math.PI / 4, radius: 95 },
      { id: 'cat-education', label: 'Education', color: 'rgba(168, 85, 247, 0.2)', border: '#a855f7', angle: (3 * Math.PI) / 4, radius: 95 },
      { id: 'cat-strengths', label: 'Strength', color: 'rgba(245, 158, 11, 0.2)', border: '#f59e0b', angle: (-3 * Math.PI) / 4, radius: 95 }
    ];

    categories.forEach(cat => {
      tempNodes.push({
        id: cat.id,
        type: 'category',
        label: cat.label,
        x: cx + Math.cos(cat.angle) * cat.radius,
        y: cy + Math.sin(cat.angle) * cat.radius,
        vx: 0,
        vy: 0,
        size: 24,
        color: cat.color,
        borderColor: cat.border
      });

      tempLinks.push({
        source: 'user-root',
        target: cat.id,
        color: 'rgba(29, 78, 216, 0.3)'
      });
    });

    // 3. Add Experience Nodes under 'cat-experience'
    experiences.forEach((exp, idx) => {
      const isCurrentActive = exp.id === activeExperienceId;
      const angle = (idx * 2 * Math.PI) / experiences.length;
      
      tempNodes.push({
        id: exp.id,
        type: 'experience',
        label: exp.title,
        sublabel: exp.company,
        x: isCurrentActive ? cx + Math.cos(angle) * 35 : 100 + Math.random() * 400,
        y: isCurrentActive ? cy + Math.sin(angle) * 35 + 90 : 100 + Math.random() * 250,
        vx: 0,
        vy: 0,
        size: isCurrentActive ? 22 : 18,
        color: isCurrentActive ? 'rgba(37, 99, 235, 0.95)' : (activeExp ? 'rgba(203, 213, 225, 0.35)' : 'rgba(255, 255, 255, 0.85)'),
        borderColor: isCurrentActive ? 'var(--accent)' : (activeExp ? 'rgba(203, 213, 225, 0.5)' : 'var(--accent)'),
        completeness: exp.score,
        isHighlighted: isCurrentActive,
        isFaded: activeExp && !isCurrentActive
      });

      tempLinks.push({
        source: 'cat-experience',
        target: exp.id,
        color: isCurrentActive ? 'var(--accent)' : 'rgba(0, 0, 0, 0.08)'
      });
    });

    // 4. Add Skills Nodes under 'cat-skills' - limited to top 6 unique items to reduce clutter
    const allSkills = Array.from(new Set(experiences.flatMap(e => e.skills || []))).slice(0, 6);
    allSkills.forEach((skill, idx) => {
      const angle = (idx * 2 * Math.PI) / (allSkills.length || 1) + Math.PI / 6;
      const radius = 175;
      const skillNodeId = `skill-${skill}`;

      // Check if skill belongs to the active experience
      const isLinkedToActive = activeExp && activeExp.skills && activeExp.skills.includes(skill);

      tempNodes.push({
        id: skillNodeId,
        type: 'skill',
        label: skill,
        x: cx + Math.cos(angle) * radius,
        y: cy + Math.sin(angle) * radius,
        vx: 0,
        vy: 0,
        size: isLinkedToActive ? 16 : (activeExp ? 11 : 14),
        color: isLinkedToActive ? '#0284c7' : (activeExp ? 'rgba(203, 213, 225, 0.35)' : 'rgba(255, 255, 255, 0.75)'),
        borderColor: isLinkedToActive ? 'var(--accent)' : (activeExp ? 'rgba(203, 213, 225, 0.5)' : '#0284c7'),
        isHighlighted: isLinkedToActive,
        isFaded: activeExp && !isLinkedToActive
      });

      tempLinks.push({
        source: 'cat-skills',
        target: skillNodeId,
        color: 'rgba(2, 132, 199, 0.15)'
      });

      // Cross-link to active experience if applicable
      if (isLinkedToActive && activeExp) {
        tempLinks.push({
          source: activeExp.id,
          target: skillNodeId,
          color: 'rgba(2, 132, 199, 0.8)',
          dash: true
        });
      }
    });

    // 5. Add Education Nodes under 'cat-education' - limited to top 3 unique items
    const educationItems = Array.from(new Set(experiences.map(e => e.education).filter(Boolean))).slice(0, 3);
    educationItems.forEach((edu, idx) => {
      const angle = (idx * 2 * Math.PI) / (educationItems.length || 1) + Math.PI / 4;
      const radius = 160;
      const eduNodeId = `edu-${idx}`;

      // Is education linked to the active experience
      const isLinkedToActive = activeExp && activeExp.education === edu;

      tempNodes.push({
        id: eduNodeId,
        type: 'education',
        label: edu,
        x: cx + Math.cos(angle) * radius,
        y: cy + Math.sin(angle) * radius,
        vx: 0,
        vy: 0,
        size: isLinkedToActive ? 17 : (activeExp ? 11 : 15),
        color: isLinkedToActive ? '#a855f7' : (activeExp ? 'rgba(203, 213, 225, 0.35)' : 'rgba(255, 255, 255, 0.75)'),
        borderColor: isLinkedToActive ? 'var(--accent)' : (activeExp ? 'rgba(203, 213, 225, 0.5)' : '#a855f7'),
        isHighlighted: isLinkedToActive,
        isFaded: activeExp && !isLinkedToActive
      });

      tempLinks.push({
        source: 'cat-education',
        target: eduNodeId,
        color: 'rgba(168, 85, 247, 0.15)'
      });

      if (isLinkedToActive && activeExp) {
        tempLinks.push({
          source: activeExp.id,
          target: eduNodeId,
          color: 'rgba(168, 85, 247, 0.8)',
          dash: true
        });
      }
    });

    // 6. Add Strength Nodes under 'cat-strengths' - limited to top 4 unique items
    const allStrengths = Array.from(new Set(experiences.flatMap(e => e.strengths || []))).slice(0, 4);
    allStrengths.forEach((strength, idx) => {
      const angle = (idx * 2 * Math.PI) / (allStrengths.length || 1) - Math.PI / 4;
      const radius = 170;
      const strengthNodeId = `strength-${strength}`;

      const isLinkedToActive = activeExp && activeExp.strengths && activeExp.strengths.includes(strength);

      tempNodes.push({
        id: strengthNodeId,
        type: 'strength',
        label: strength,
        x: cx + Math.cos(angle) * radius,
        y: cy + Math.sin(angle) * radius,
        vx: 0,
        vy: 0,
        size: isLinkedToActive ? 16 : (activeExp ? 11 : 14),
        color: isLinkedToActive ? '#f59e0b' : (activeExp ? 'rgba(203, 213, 225, 0.35)' : 'rgba(255, 255, 255, 0.75)'),
        borderColor: isLinkedToActive ? 'var(--accent)' : (activeExp ? 'rgba(203, 213, 225, 0.5)' : '#f59e0b'),
        isHighlighted: isLinkedToActive,
        isFaded: activeExp && !isLinkedToActive
      });

      tempLinks.push({
        source: 'cat-strengths',
        target: strengthNodeId,
        color: 'rgba(245, 158, 11, 0.15)'
      });

      if (isLinkedToActive && activeExp) {
        tempLinks.push({
          source: activeExp.id,
          target: strengthNodeId,
          color: 'rgba(245, 158, 11, 0.8)',
          dash: true
        });
      }
    });

    setNodes(tempNodes);
    setLinks(tempLinks);
  }, [experiences, activeExperienceId, userName]);

  // Basic Physics Engine loop (Spring/Force-directed simulation)
  useEffect(() => {
    if (nodes.length === 0) return;

    const tick = () => {
      setNodes(prevNodes => {
        const nextNodes = prevNodes.map(n => ({ ...n }));
        const nodeMap = {};
        nextNodes.forEach(n => { nodeMap[n.id] = n; });

        // 1. Repulsion between nodes
        for (let i = 0; i < nextNodes.length; i++) {
          for (let j = i + 1; j < nextNodes.length; j++) {
            const n1 = nextNodes[i];
            const n2 = nextNodes[j];
            
            const dx = n2.x - n1.x;
            const dy = n2.y - n1.y;
            const dist = Math.sqrt(dx * dx + dy * dy) || 1;
            
            if (dist < 180) {
              const force = (180 - dist) * 0.012;
              const fx = (dx / dist) * force;
              const fy = (dy / dist) * force;
              
              if (dragNodeRef.current !== n1.id && n1.id !== 'user-root') {
                n1.x -= fx;
                n1.y -= fy;
              }
              if (dragNodeRef.current !== n2.id && n2.id !== 'user-root') {
                n2.x += fx;
                n2.y += fy;
              }
            }
          }
        }

        // 2. Attraction along link paths (Spring Force)
        links.forEach(link => {
          const n1 = nodeMap[link.source];
          const n2 = nodeMap[link.target];
          if (!n1 || !n2) return;

          const dx = n2.x - n1.x;
          const dy = n2.y - n1.y;
          const dist = Math.sqrt(dx * dx + dy * dy) || 1;
          const desiredDist = n2.type === 'category' ? 95 : 160;
          
          const force = (dist - desiredDist) * 0.02;
          const fx = (dx / dist) * force;
          const fy = (dy / dist) * force;

          if (dragNodeRef.current !== n1.id && n1.id !== 'user-root') {
            n1.x += fx;
            n1.y += fy;
          }
          if (dragNodeRef.current !== n2.id && n2.id !== 'user-root') {
            n2.x -= fx;
            n2.y -= fy;
          }
        });

        // 3. Gravity center pull to keep within boundaries
        nextNodes.forEach(n => {
          if (n.id === 'user-root') {
            n.x = 300;
            n.y = 220;
            return;
          }
          if (dragNodeRef.current === n.id) return;
          const centerX = 300;
          const centerY = 220;
          
          n.x += (centerX - n.x) * 0.008;
          n.y += (centerY - n.y) * 0.008;

          n.x = Math.max(30, Math.min(570, n.x));
          n.y = Math.max(30, Math.min(420, n.y));
        });

        return nextNodes;
      });

      simulationRef.current = requestAnimationFrame(tick);
    };

    simulationRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(simulationRef.current);
  }, [links]);

  // Drag listeners
  const handleMouseDown = (nodeId, e) => {
    e.stopPropagation();
    dragNodeRef.current = nodeId;
  };

  const handleMouseMove = (e) => {
    if (!dragNodeRef.current || !svgRef.current) return;
    const rect = svgRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    setNodes(prev => prev.map(n => {
      if (n.id === dragNodeRef.current) {
        return { ...n, x, y };
      }
      return n;
    }));
  };

  const handleMouseUp = () => {
    dragNodeRef.current = null;
  };

  const handleNodeClick = (node) => {
    if (node.type === 'experience') {
      setActiveExperienceId(node.id);
      setSelectedNode(null);
    } else if (node.type === 'skill' || node.type === 'strength' || node.type === 'education') {
      setSelectedNode(node);
      setEditingText(node.label || '');
    }
  };

  const handleSaveNodeEdit = () => {
    if (!selectedNode || !activeExperienceId) return;
    const activeExp = experiences.find(e => e.id === activeExperienceId);
    if (activeExp) {
      if (selectedNode.type === 'skill') {
        const nextSkills = activeExp.skills.map(s => s === selectedNode.label ? editingText : s);
        updateExperience(activeExperienceId, { skills: nextSkills });
      } else if (selectedNode.type === 'strength') {
        const nextStrengths = activeExp.strengths.map(s => s === selectedNode.label ? editingText : s);
        updateExperience(activeExperienceId, { strengths: nextStrengths });
      } else if (selectedNode.type === 'education') {
        updateExperience(activeExperienceId, { education: editingText });
      }
    }
    setSelectedNode(null);
  };

  const handleAddRoleSubmit = (e) => {
    e.preventDefault();
    if (!newRole.title || !newRole.company) return;
    
    // Split strengths if provided
    const strengthArr = newRole.strengths ? newRole.strengths.split(',').map(s => s.trim()).filter(Boolean) : [];
    
    addExperience({
      title: newRole.title,
      company: newRole.company,
      period: newRole.period,
      type: newRole.type,
      education: newRole.education,
      strengths: strengthArr
    });
    setNewRole({ title: '', company: '', period: '', type: 'Work Experience', education: '', strengths: '' });
    setShowAddForm(false);
  };

  const getNodeCoords = (nodeId) => {
    const n = nodes.find(x => x.id === nodeId);
    return n ? { x: n.x, y: n.y } : { x: 300, y: 220 };
  };

  return (
    <div className="glass-panel" style={{ padding: '1.5rem', height: '100%', display: 'flex', flexDirection: 'column' }}>
      
      {/* Header controls */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
        <h3 style={{ fontSize: '1.2rem', fontFamily: 'var(--font-display)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Network size={20} style={{ color: 'var(--accent)' }} />
          Portfolio Knowledge Network
        </h3>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button 
            className="btn btn-secondary" 
            onClick={() => setShowAddForm(!showAddForm)}
            style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem' }}
          >
            <Plus size={14} /> Add Portfolio Card
          </button>
        </div>
      </div>

      {/* Add New Experience Quick Form Overlay */}
      {showAddForm && (
        <form onSubmit={handleAddRoleSubmit} style={{
          padding: '1rem',
          background: 'rgba(255,255,255,0.03)',
          border: '1px solid var(--border-glass)',
          borderRadius: 'var(--radius-sm)',
          marginBottom: '1rem',
          display: 'flex',
          flexDirection: 'column',
          gap: '0.75rem',
          animation: 'fadeIn 0.2s ease-out'
        }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
            <input 
              type="text" 
              placeholder="Job Title / Project" 
              className="form-input"
              value={newRole.title}
              onChange={e => setNewRole({...newRole, title: e.target.value})}
              required
              style={{ padding: '0.4rem 0.75rem', fontSize: '0.85rem' }}
            />
            <input 
              type="text" 
              placeholder="Company / Org" 
              className="form-input"
              value={newRole.company}
              onChange={e => setNewRole({...newRole, company: e.target.value})}
              required
              style={{ padding: '0.4rem 0.75rem', fontSize: '0.85rem' }}
            />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
            <select 
              className="form-select"
              value={newRole.type}
              onChange={e => setNewRole({...newRole, type: e.target.value})}
              style={{ padding: '0.4rem 0.75rem', fontSize: '0.85rem' }}
            >
              <option value="Work Experience">Work Experience</option>
              <option value="Internship">Internship</option>
              <option value="Project">Personal Project</option>
            </select>
            <input 
              type="text" 
              placeholder="Period (e.g., 2024)" 
              className="form-input"
              value={newRole.period}
              onChange={e => setNewRole({...newRole, period: e.target.value})}
              style={{ padding: '0.4rem 0.75rem', fontSize: '0.85rem' }}
            />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
            <input 
              type="text" 
              placeholder="Education (e.g. BS in CS, MIT)" 
              className="form-input"
              value={newRole.education}
              onChange={e => setNewRole({...newRole, education: e.target.value})}
              style={{ padding: '0.4rem 0.75rem', fontSize: '0.85rem' }}
            />
            <input 
              type="text" 
              placeholder="Strengths (comma-separated, e.g. Leadership, Speed)" 
              className="form-input"
              value={newRole.strengths}
              onChange={e => setNewRole({...newRole, strengths: e.target.value})}
              style={{ padding: '0.4rem 0.75rem', fontSize: '0.85rem' }}
            />
          </div>
          <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
            <button type="submit" className="btn btn-primary" style={{ padding: '0.4rem 1rem', fontSize: '0.85rem' }}>
              Create Card
            </button>
          </div>
        </form>
      )}

      {/* SVG Canvas Area */}
      <div style={{ position: 'relative', flex: 1, minHeight: '350px', background: 'rgba(0,0,0,0.02)', border: '1px solid var(--border-glass)', borderRadius: 'var(--radius-md)', overflow: 'hidden' }}>
        <svg 
          ref={svgRef}
          width="100%" 
          height="100%" 
          viewBox="0 0 600 440"
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          style={{ cursor: dragNodeRef.current ? 'grabbing' : 'default' }}
        >
          <defs>
            <filter id="glow-s" x="-30%" y="-30%" width="160%" height="160%">
              <feGaussianBlur stdDeviation="5" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
          </defs>

          {/* Links */}
          {links.map((link, idx) => {
            const start = getNodeCoords(link.source);
            const end = getNodeCoords(link.target);
            
            // Check if link is connected to the active experience
            const isLinkActive = activeExperienceId && (link.source === activeExperienceId || link.target === activeExperienceId);
            const isHubLink = link.source === 'user-root' || link.target === 'user-root' || link.source === 'cat-experience' || link.target === 'cat-experience';
            
            let strokeColor = link.color;
            let strokeWidth = 1.5;
            
            if (activeExperienceId) {
              if (isLinkActive) {
                strokeColor = 'var(--accent)';
                strokeWidth = 2.5;
              } else if (!isHubLink) {
                strokeColor = 'rgba(203, 213, 225, 0.15)'; // faded out
              }
            }
            
            return (
              <line
                key={`link-${idx}`}
                x1={start.x}
                y1={start.y}
                x2={end.x}
                y2={end.y}
                stroke={strokeColor}
                strokeWidth={strokeWidth}
                strokeDasharray={link.dash ? '4 4' : '0'}
                style={{ transition: 'stroke 0.25s, stroke-width 0.25s' }}
              />
            );
          })}

          {/* Nodes */}
          {nodes.map((node) => {
            const isActive = node.id === activeExperienceId;
            return (
              <g 
                key={node.id} 
                transform={`translate(${node.x}, ${node.y})`}
                onMouseDown={(e) => handleMouseDown(node.id, e)}
                onClick={() => handleNodeClick(node)}
                style={{ cursor: 'pointer' }}
              >
                {isActive && (
                  <circle r={node.size + 5} fill="none" stroke="rgba(37, 99, 235, 0.25)" strokeWidth={1} filter="url(#glow-s)" />
                )}
                
                <circle
                  r={node.size}
                  fill={node.color}
                  stroke={node.borderColor || 'transparent'}
                  strokeWidth={node.isHighlighted ? 2.5 : (node.borderColor ? 1.5 : 0)}
                  style={{ transition: 'all 0.25s' }}
                />

                <text
                  textAnchor="middle"
                  dy={node.type === 'user-root' ? '.3em' : (node.type === 'experience' || node.type === 'category' ? '.3em' : '.35em')}
                  fill={node.type === 'user-root' ? '#fff' : (node.isHighlighted ? 'var(--text-primary)' : (node.isFaded ? 'rgba(148, 163, 184, 0.35)' : (node.type === 'skill' || node.type === 'strength' || node.type === 'education' ? 'var(--text-secondary)' : 'var(--text-primary)')))}
                  fontSize={node.type === 'user-root' ? '10px' : (node.type === 'experience' || node.type === 'category' ? '8.5px' : '7.5px')}
                  fontWeight={node.isHighlighted || node.type === 'user-root' || node.type === 'category' ? 800 : (node.type === 'experience' ? 700 : 500)}
                  style={{ pointerEvents: 'none', userSelect: 'none', transition: 'fill 0.25s, font-size 0.25s' }}
                >
                  {node.label.length > 18 ? `${node.label.substring(0, 15)}...` : node.label}
                </text>

                {node.type === 'experience' && (
                  <circle
                    cx={node.size - 3}
                    cy={-node.size + 3}
                    r={6.5}
                    fill={node.completeness >= 100 ? 'var(--color-r)' : 'var(--accent)'}
                  />
                )}
                {node.type === 'experience' && (
                  <text
                    x={node.size - 3}
                    y={-node.size + 5.5}
                    textAnchor="middle"
                    fill="#fff"
                    fontSize="6px"
                    fontWeight="bold"
                    style={{ pointerEvents: 'none', userSelect: 'none' }}
                  >
                    ✓
                  </text>
                )}
              </g>
            );
          })}
        </svg>

        {/* Legend overlays (Sky Blue/Blue aligned) */}
        <div style={{ position: 'absolute', bottom: '10px', left: '10px', display: 'flex', gap: '0.6rem', background: 'rgba(240, 249, 255, 0.85)', border: '1px solid var(--border-glass)', padding: '0.4rem 0.8rem', borderRadius: '999px', fontSize: '0.65rem' }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', color: 'var(--text-secondary)' }}>
            <span style={{ display: 'inline-block', width: '8px', height: '8px', borderRadius: '50%', background: 'var(--accent)' }}></span>User
          </span>
          <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', color: 'var(--text-secondary)' }}>
            <span style={{ display: 'inline-block', width: '8px', height: '8px', borderRadius: '50%', background: 'rgba(37,99,235,0.2)' }}></span>Hub Areas
          </span>
          <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', color: 'var(--text-secondary)' }}>
            <span style={{ display: 'inline-block', width: '8px', height: '8px', borderRadius: '50%', background: '#0284c7' }}></span>Skills
          </span>
          <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', color: 'var(--text-secondary)' }}>
            <span style={{ display: 'inline-block', width: '8px', height: '8px', borderRadius: '50%', background: '#a855f7' }}></span>Education
          </span>
          <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', color: 'var(--text-secondary)' }}>
            <span style={{ display: 'inline-block', width: '8px', height: '8px', borderRadius: '50%', background: '#f59e0b' }}></span>Strength
          </span>
        </div>
      </div>

      {/* Node Editing Panel / Overlay */}
      {selectedNode && (
        <div style={{
          marginTop: '1rem',
          padding: '1rem',
          background: 'rgba(0,0,0,0.01)',
          border: '1px solid var(--border-glass)',
          borderRadius: 'var(--radius-sm)',
          animation: 'fadeIn 0.25s'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
            <span style={{ 
              fontSize: '0.8rem', 
              fontWeight: 600, 
              color: 'var(--accent)',
              textTransform: 'uppercase'
            }}>
              Refine Details: {selectedNode.label}
            </span>
            <button className="btn-icon" style={{ width: '20px', height: '20px' }} onClick={() => setSelectedNode(null)}>×</button>
          </div>
          
          <input
            type="text"
            className="form-input"
            value={editingText}
            onChange={(e) => setEditingText(e.target.value)}
            style={{ fontSize: '0.85rem', marginBottom: '0.75rem' }}
          />
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem' }}>
            <button className="btn btn-secondary" onClick={() => setSelectedNode(null)} style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem' }}>
              Cancel
            </button>
            <button className="btn btn-primary" onClick={handleSaveNodeEdit} style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem' }}>
              Save Changes
            </button>
          </div>
        </div>
      )}

      {/* Horizontal list of experiences underneath */}
      <div style={{ marginTop: '1.25rem', borderTop: '1px solid var(--border-glass)', paddingTop: '1rem' }}>
        <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '0.6rem', fontWeight: 600 }}>Active Material Cards (Select to focus graph)</p>
        <div style={{ display: 'flex', gap: '0.75rem', overflowX: 'auto', paddingBottom: '0.5rem' }}>
          {experiences.map(exp => (
            <div 
              key={exp.id}
              onClick={() => setActiveExperienceId(exp.id)}
              style={{
                flex: '0 0 210px',
                padding: '0.75rem',
                borderRadius: '8px',
                background: exp.id === activeExperienceId ? 'rgba(37, 99, 235, 0.05)' : 'rgba(255,255,255,0.4)',
                border: `1px solid ${exp.id === activeExperienceId ? 'var(--accent)' : 'var(--border-glass)'}`,
                boxShadow: exp.id === activeExperienceId ? 'var(--shadow-sm)' : 'none',
                cursor: 'pointer',
                transition: 'all 0.2s',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                position: 'relative'
              }}
            >
              <div>
                <h5 style={{ fontSize: '0.85rem', fontWeight: 700, margin: 0, color: 'var(--text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {exp.title}
                </h5>
                <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', margin: '0.2rem 0 0.5rem 0' }}>
                  {exp.company}
                </p>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '0.4rem', borderTop: '1px solid rgba(0,0,0,0.03)', paddingTop: '0.4rem' }}>
                <span style={{ fontSize: '0.7rem', fontWeight: 700, color: exp.score >= 100 ? 'var(--color-r)' : 'var(--accent)' }}>
                  STAR: {exp.score}%
                </span>
                <button 
                  onClick={(e) => { e.stopPropagation(); deleteExperience(exp.id); }}
                  className="btn-icon" 
                  style={{ width: '22px', height: '22px', borderRadius: '4px', background: 'transparent', border: 'none', color: 'var(--text-muted)' }}
                  title="Delete Experience"
                >
                  <Trash2 size={12} />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}
