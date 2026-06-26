import React, { createContext, useState, useContext, useEffect } from 'react';

const ExperienceContext = createContext();

// Restored initial experiences based on STAR framework
const initialExperiences = [
  {
    id: 'exp-1',
    title: 'Senior Software Engineer',
    company: 'InnovateTech Corp',
    period: '2023 - Present',
    description: 'Led the frontend transition from a legacy monolithic app to a modular React architecture.',
    star: {
      situation: 'The company was operating on a legacy monolith platform that suffered from slow load times (> 5s) and low developer velocity due to complex deployment pipelines.',
      task: 'My goal was to migrate the core checkout flow to a modern, decoupled React frontend while maintaining system uptime and improving rendering speed.',
      action: 'I spearheaded the transition to Vite and React, established a custom CSS-in-JS pattern for glassmorphism panels, and split the codebase into reusable components. I also set up dynamic code splitting.',
      result: '' // Empty to demonstrate chatbot prompts
    },
    education: 'BS in Computer Science, State University',
    strengths: ['Systems Migration', 'React Development', 'Developer Velocity'],
    skills: ['React', 'Vite', 'CSS', 'Code Splitting', 'System Architecture'],
    score: 75
  },
  {
    id: 'exp-2',
    title: 'Frontend Developer Intern',
    company: 'AppForge Studios',
    period: '2022 - 2023',
    description: 'Assisted in building responsive dashboards and customer portals using vanilla technologies.',
    star: {
      situation: 'AppForge needed a customer onboarding dashboard to track registration progress, but the team was bottlenecked with backend tasks.',
      task: 'Establish a responsive onboarding interface to collect registration details and increase user conversions.',
      action: 'I built the responsive onboarding dashboard using HTML5, CSS3 transitions, and raw JS, connecting to an internal JSON API. I implemented micro-interactions for step completion.',
      result: 'The dashboard increased user registration completion rate by 18% and saved support teams 10 hours per week in manual verification.'
    },
    education: 'Web Development Certification, AppForge Academy',
    strengths: ['UI UIX', 'API Integration', 'Micro-interactions'],
    skills: ['JavaScript', 'HTML5', 'CSS3', 'API Integration', 'UI/UX'],
    score: 100
  }
];

export const ExperienceProvider = ({ children }) => {
  const [userName, setUserName] = useState(() => {
    return localStorage.getItem('star_user_name') || 'Jane Doe';
  });

  const [experiences, setExperiences] = useState(() => {
    const saved = localStorage.getItem('star_experiences');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        // Schema validator: if loaded items lack the STAR schema, reset
        if (parsed.length > 0 && !parsed[0].hasOwnProperty('star')) {
          localStorage.removeItem('star_experiences');
          return initialExperiences;
        }
        return parsed;
      } catch (e) {
        return initialExperiences;
      }
    }
    return initialExperiences;
  });

  const [activeExperienceId, setActiveExperienceId] = useState(
    experiences.length > 0 ? experiences[0].id : null
  );

  const [applicationProfile, setApplicationProfile] = useState(() => {
    const saved = localStorage.getItem('star_app_profile');
    return saved ? JSON.parse(saved) : {
      targetCompany: 'Google',
      targetRole: 'Senior Frontend Engineer',
      targetJobDesc: 'We are looking for a Senior Frontend Engineer with experience building high-performance, visually stunning React web applications. Experience with layout engines, CSS animations, and performance profiling is highly desired.'
    };
  });

  const [geminiApiKey, setGeminiApiKey] = useState(() => {
    return localStorage.getItem('star_gemini_key') || '';
  });

  const [chatHistory, setChatHistory] = useState([
    {
      id: 'msg-init-1',
      sender: 'assistant',
      text: 'Hi there! I am your Spectacle STAR career coach. I will help you structure your experiences using the STAR (Situation, Task, Action, Result) framework to build a visual career network and compile high-impact resumes.\n\nLooking at your active profile, your experience at InnovateTech Corp is missing a **Result/Resolution**. What was the final impact or business outcome of your migration to React? (e.g., site speed-up, cost reduction, or conversion gains?)',
      timestamp: new Date().toISOString()
    }
  ]);

  const [isGenerating, setIsGenerating] = useState(false);

  useEffect(() => {
    localStorage.setItem('star_user_name', userName);
  }, [userName]);

  useEffect(() => {
    localStorage.setItem('star_experiences', JSON.stringify(experiences));
  }, [experiences]);

  useEffect(() => {
    localStorage.setItem('star_app_profile', JSON.stringify(applicationProfile));
  }, [applicationProfile]);

  useEffect(() => {
    localStorage.setItem('star_gemini_key', geminiApiKey);
  }, [geminiApiKey]);

  // Calculate completeness score based on STAR categories (25% each)
  const calculateCompleteness = (star) => {
    if (!star) return 0;
    let score = 0;
    if (star.situation && star.situation.trim().length > 10) score += 25;
    if (star.task && star.task.trim().length > 10) score += 25;
    if (star.action && star.action.trim().length > 10) score += 25;
    if (star.result && star.result.trim().length > 10) score += 25;
    return score;
  };

  const addExperience = (newExp) => {
    const id = `exp-${Date.now()}`;
    const formatted = {
      id,
      title: newExp.title || 'New Role',
      company: newExp.company || 'New Company',
      period: newExp.period || '2024 - Present',
      description: newExp.description || '',
      type: newExp.type || 'Work Experience',
      star: {
        situation: newExp.star?.situation || '',
        task: newExp.star?.task || '',
        action: newExp.star?.action || '',
        result: newExp.star?.result || '',
      },
      education: newExp.education || 'Self-Directed Study',
      strengths: newExp.strengths || ['Problem Solving', 'Adaptability'],
      skills: newExp.skills || [],
      score: 0
    };
    formatted.score = calculateCompleteness(formatted.star);
    setExperiences(prev => [...prev, formatted]);
    setActiveExperienceId(id);
    return formatted;
  };

  const updateExperience = (id, updatedFields) => {
    setExperiences(prev => prev.map(exp => {
      if (exp.id === id) {
        const merged = { ...exp, ...updatedFields };
        if (updatedFields.star) {
          merged.star = { ...exp.star, ...updatedFields.star };
        }
        merged.score = calculateCompleteness(merged.star);
        return merged;
      }
      return exp;
    }));
  };

  const deleteExperience = (id) => {
    setExperiences(prev => {
      const filtered = prev.filter(exp => exp.id !== id);
      if (activeExperienceId === id && filtered.length > 0) {
        setActiveExperienceId(filtered[0].id);
      } else if (filtered.length === 0) {
        setActiveExperienceId(null);
      }
      return filtered;
    });
  };

  const updateApplicationProfile = (profile) => {
    setApplicationProfile(prev => ({ ...prev, ...profile }));
  };

  // Parser
  const parseDocumentContent = async (text, fileName) => {
    setIsGenerating(true);
    
    if (geminiApiKey.trim()) {
      try {
        const prompt = `You are an expert career agent. Extract experiences and structure them into the STAR framework (Situation, Task, Action, Result).
Text file: ${text}
Output JSON format only. Use this EXACT structure:
{
  "experiences": [
    {
      "title": "Role Title",
      "company": "Company Name",
      "period": "Start Year - End Year",
      "description": "Short brief of experience",
      "star": {
        "situation": "Situation context",
        "task": "Task assigned",
        "action": "Actions taken",
        "result": "Quantifiable results"
      },
      "education": "University degree details if found",
      "strengths": ["Strength 1", "Strength 2"],
      "skills": ["Skill1", "Skill2"]
    }
  ]
}`;
        
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${geminiApiKey}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }],
            generationConfig: { responseMimeType: 'application/json' }
          })
        });
        
        const data = await response.json();
        const jsonText = data.candidates?.[0]?.content?.parts?.[0]?.text;
        if (jsonText) {
          const parsed = JSON.parse(jsonText);
          if (parsed.experiences && parsed.experiences.length > 0) {
            parsed.experiences.forEach(exp => addExperience(exp));
            setIsGenerating(false);
            return;
          }
        }
      } catch (err) {
        console.error("Gemini document parse failed, falling back to simulated extraction:", err);
      }
    }

    // Mock fallback
    await new Promise(r => setTimeout(r, 2000));
    
    const titleMatch = text.match(/(Senior|Lead|Junior|Manager|Intern|Developer|Engineer|Consultant)\s+[a-zA-Z\s]+/i);
    const companyMatch = text.match(/(at|for)\s+([A-Z][a-zA-Z0-9\s]+)/);
    
    const parsedRole = {
      title: titleMatch ? titleMatch[0].trim() : 'Project Specialist',
      company: companyMatch ? companyMatch[2].trim().split('\n')[0] : fileName.replace(/\.[^/.]+$/, ""),
      period: '2023 - 2024',
      description: text.substring(0, 150) + '...',
      type: 'Work Experience',
      star: {
        situation: text.substring(0, 180) + '...',
        task: '',
        action: '',
        result: ''
      },
      education: 'Self-Directed Studies',
      strengths: ['Analysis', 'Technical Design'],
      skills: Array.from(new Set(
        ['React', 'Node.js', 'Python', 'AWS', 'Docker', 'SQL', 'TypeScript', 'Project Management', 'Agile']
          .filter(skill => text.toLowerCase().includes(skill.toLowerCase()))
      ))
    };

    if (parsedRole.skills.length === 0) {
      parsedRole.skills = ['Project Management', 'Collaboration'];
    }

    addExperience(parsedRole);
    
    setChatHistory(prev => [
      ...prev,
      {
        id: `msg-${Date.now()}`,
        sender: 'assistant',
        text: `Successfully uploaded and extracted details from **${fileName}**! I added a new role: **${parsedRole.title}** at **${parsedRole.company}** to your network.\n\nLet's refine this role. I was able to extract the **Situation**, but I couldn't find a clear **Task** or **Result**. What specific targets were you trying to reach, and what was the outcome?`,
        timestamp: new Date().toISOString()
      }
    ]);

    setIsGenerating(false);
  };

  // Chatbot responder
  const sendMessageToInterviewer = async (messageText) => {
    if (!messageText.trim()) return;

    const userMsg = {
      id: `msg-${Date.now()}-user`,
      sender: 'user',
      text: messageText,
      timestamp: new Date().toISOString()
    };

    setChatHistory(prev => [...prev, userMsg]);

    setTimeout(async () => {
      const activeExp = experiences.find(e => e.id === activeExperienceId);
      
      if (!activeExp) {
        setChatHistory(prev => [
          ...prev,
          {
            id: `msg-${Date.now()}-assistant`,
            sender: 'assistant',
            text: "I don't see any experiences in your profile yet. Please upload a file to get started!",
            timestamp: new Date().toISOString()
          }
        ]);
        return;
      }

      if (geminiApiKey.trim()) {
        try {
          const prompt = `You are a conversational STAR Interviewer helping the user complete their resume portfolio.
Active Experience:
Role: ${activeExp.title}
Company: ${activeExp.company}
STAR Framework Current State:
- Situation: ${activeExp.star.situation || 'MISSING'}
- Task: ${activeExp.star.task || 'MISSING'}
- Action: ${activeExp.star.action || 'MISSING'}
- Result: ${activeExp.star.result || 'MISSING'}

User message response: "${messageText}"

Your goals:
1. Parse the user's message to see if it provides details to fill in any MISSING fields. Update those fields in your mind.
2. Ask the user a targeted, supportive follow-up question to fill in the REMAINING missing fields. Keep your response short and conversational (2-3 sentences).
3. Output a JSON object with:
   - "reply": "Your conversational response to the user"
   - "updateStar": { "situation": "updated situation text if user added info, otherwise null", "task": "updated task text if user added info, otherwise null", "action": "updated action text if user added info, otherwise null", "result": "updated result text if user added info, otherwise null" }
   - "extractedSkills": ["new skill 1", "new skill 2"],
   - "extractedStrengths": ["new strength 1", "new strength 2"]
   
Return JSON only.`;

          const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${geminiApiKey}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              contents: [{ parts: [{ text: prompt }] }],
              generationConfig: { responseMimeType: 'application/json' }
            })
          });

          const data = await response.json();
          const jsonText = data.candidates?.[0]?.content?.parts?.[0]?.text;
          if (jsonText) {
            const parsed = JSON.parse(jsonText);
            
            const starUpdates = {};
            let updated = false;
            
            if (parsed.updateStar) {
              ['situation', 'task', 'action', 'result'].forEach(k => {
                if (parsed.updateStar[k]) {
                  starUpdates[k] = (activeExp.star[k] ? activeExp.star[k] + ' ' : '') + parsed.updateStar[k];
                  updated = true;
                }
              });
            }

            let newSkills = activeExp.skills;
            if (parsed.extractedSkills && parsed.extractedSkills.length > 0) {
              newSkills = Array.from(new Set([...activeExp.skills, ...parsed.extractedSkills]));
              updated = true;
            }

            let newStrengths = activeExp.strengths || [];
            if (parsed.extractedStrengths && parsed.extractedStrengths.length > 0) {
              newStrengths = Array.from(new Set([...newStrengths, ...parsed.extractedStrengths]));
              updated = true;
            }

            if (updated) {
              updateExperience(activeExp.id, {
                star: Object.keys(starUpdates).length > 0 ? { ...activeExp.star, ...starUpdates } : activeExp.star,
                skills: newSkills,
                strengths: newStrengths
              });
            }

            setChatHistory(prev => [
              ...prev,
              {
                id: `msg-${Date.now()}-assistant`,
                sender: 'assistant',
                text: parsed.reply,
                timestamp: new Date().toISOString()
              }
            ]);
            return;
          }
        } catch (err) {
          console.error("Gemini chatbot error, falling back to simulated intelligence:", err);
        }
      }

      // Simulated intelligence loop
      const star = activeExp.star;
      let replyText = '';
      let fieldToUpdate = null;

      if (!star.situation) {
        fieldToUpdate = 'situation';
      } else if (!star.task) {
        fieldToUpdate = 'task';
      } else if (!star.action) {
        fieldToUpdate = 'action';
      } else if (!star.result) {
        fieldToUpdate = 'result';
      }

      if (fieldToUpdate) {
        const newStar = { ...star };
        newStar[fieldToUpdate] = messageText;
        
        const skillsFound = ['React', 'Node.js', 'Python', 'AWS', 'Docker', 'SQL', 'TypeScript', 'Figma', 'Jest', 'Agile', 'Scrum', 'Next.js']
          .filter(sk => messageText.toLowerCase().includes(sk.toLowerCase()));
        
        const mergedSkills = Array.from(new Set([...activeExp.skills, ...skillsFound]));

        updateExperience(activeExp.id, {
          star: newStar,
          skills: mergedSkills
        });

        const nextMissing = !newStar.situation ? 'Situation' : 
                            !newStar.task ? 'Task' : 
                            !newStar.action ? 'Action' : 
                            !newStar.result ? 'Result' : null;

        if (nextMissing) {
          const prompts = {
            Situation: `Great! I've added that detail. To set the scene for your role as ${activeExp.title}, what initial company challenges or team needs were you facing?`,
            Task: `Thank you! What were your main goals or core objectives in handling that situation?`,
            Action: `Got it. What specific steps did you take to achieve that? What tools, technologies, or processes did you design or execute?`,
            Result: `Understood! What was the final result or outcome? Try to describe the measurable impact if possible (e.g., speed increases, costs saved, or client satisfaction).`
          };
          replyText = prompts[nextMissing];
        } else {
          replyText = `Fantastic job! Your experience as **${activeExp.title}** is now 100% complete and fully mapped to the STAR framework! I've updated your Knowledge Graph.\n\nWould you like me to generate your tailored resume or cover letter for **${applicationProfile.targetCompany}** now?`;
        }
      } else {
        replyText = `Your active experience **${activeExp.title}** is already fully complete! If you have other roles, click them in the graph to refine them. Otherwise, let's head over to the **Resume Builder** tab to compile your resume.`;
      }

      setChatHistory(prev => [
        ...prev,
        {
          id: `msg-${Date.now()}-assistant`,
          sender: 'assistant',
          text: replyText,
          timestamp: new Date().toISOString()
        }
      ]);
    }, 1000);
  };

  return (
    <ExperienceContext.Provider value={{
      userName,
      setUserName,
      experiences,
      activeExperienceId,
      setActiveExperienceId,
      applicationProfile,
      geminiApiKey,
      chatHistory,
      isGenerating,
      setExperiences,
      setGeminiApiKey,
      addExperience,
      updateExperience,
      deleteExperience,
      updateApplicationProfile,
      parseDocumentContent,
      sendMessageToInterviewer,
      setIsGenerating
    }}>
      {children}
    </ExperienceContext.Provider>
  );
};

export const useExperiences = () => useContext(ExperienceContext);
