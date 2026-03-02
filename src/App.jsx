import React, { useState, useRef, useCallback } from 'react';
import { 
  Pencil, 
  Plus, 
  Download, 
  Trash2, 
  X, 
  ChevronDown, 
  ChevronUp,
  Briefcase,
  GraduationCap,
  Globe,
  Award,
  Link as LinkIcon,
  Mail,
  Phone,
  Calendar,
  User,
  Upload,
  Image as ImageIcon,
  Move,
  ZoomIn,
  ZoomOut
} from 'lucide-react';
import html2pdf from 'html2pdf.js';

// Initial empty data
const initialData = {
  contact: {
    name: '',
    birthYear: '',
    phone: '',
    email: ''
  },
  summary: '',
  skills: [],
  experience: [],
  education: [],
  languages: [],
  courses: [],
  links: []
};

// Modal Component
function Modal({ isOpen, onClose, title, children }) {
  if (!isOpen) return null;
  
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold">{title}</h3>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X size={20} />
          </button>
        </div>
        <div className="p-4">
          {children}
        </div>
      </div>
    </div>
  );
}

function App() {
  const [data, setData] = useState(initialData);
  const [editingSection, setEditingSection] = useState(null);
  const [expandedExp, setExpandedExp] = useState({});
  const cvRef = useRef(null);

  // Contact Edit Modal
  const [contactForm, setContactForm] = useState(data.contact);
  
  // Summary Edit
  const [summaryText, setSummaryText] = useState(data.summary);
  
  // Skills Edit
  const [newSkill, setNewSkill] = useState('');
  
  // Experience Edit
  const [expForm, setExpForm] = useState({ title: '', company: '', period: '', description: '', skills: [] });
  const [editingExpId, setEditingExpId] = useState(null);
  const [newExpSkill, setNewExpSkill] = useState('');
  
  // Education Edit
  const [eduForm, setEduForm] = useState({ degree: '', school: '', level: '' });
  const [editingEduId, setEditingEduId] = useState(null);
  
  // Language Edit
  const [langForm, setLangForm] = useState({ name: '', level: '', flag: '' });
  const [editingLangId, setEditingLangId] = useState(null);
  
  // Course Edit
  const [courseForm, setCourseForm] = useState({ name: '', issuer: '', year: '' });
  
  // Link Edit
  const [linkForm, setLinkForm] = useState({ title: '', url: '' });
  const [editingLinkId, setEditingLinkId] = useState(null);

  // Photo state
  const [photo, setPhoto] = useState(null);
  const [photoModalOpen, setPhotoModalOpen] = useState(false);
  const [tempPhoto, setTempPhoto] = useState(null);
  const [photoPosition, setPhotoPosition] = useState({ x: 0, y: 0 });
  const [photoScale, setPhotoScale] = useState(1);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const canvasRef = useRef(null);
  const fileInputRef = useRef(null);

  const handleDownloadPDF = () => {
    const element = cvRef.current;
    
    // Temporarily hide no-print elements
    const noPrintElements = element.querySelectorAll('.no-print');
    noPrintElements.forEach(el => el.style.display = 'none');
    
    const opt = {
      margin: [10, 10],
      filename: 'CV.pdf',
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 2, useCORS: true },
      jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
    };
    
    html2pdf().set(opt).from(element).save().then(() => {
      // Restore no-print elements after PDF generation
      noPrintElements.forEach(el => el.style.display = '');
    });
  };

  // Contact handlers
  const saveContact = () => {
    setData({ ...data, contact: contactForm });
    setEditingSection(null);
  };

  // Summary handlers
  const saveSummary = () => {
    setData({ ...data, summary: summaryText });
    setEditingSection(null);
  };

  // Skill handlers
  const addSkill = () => {
    if (newSkill.trim() && !data.skills.includes(newSkill.trim())) {
      setData({ ...data, skills: [...data.skills, newSkill.trim()] });
      setNewSkill('');
    }
  };

  const removeSkill = (skillToRemove) => {
    setData({ ...data, skills: data.skills.filter(s => s !== skillToRemove) });
  };

  // Experience handlers
  const saveExperience = () => {
    if (editingExpId) {
      setData({
        ...data,
        experience: data.experience.map(exp => exp.id === editingExpId ? { ...expForm, id: editingExpId } : exp)
      });
    } else {
      setData({
        ...data,
        experience: [...data.experience, { ...expForm, id: Date.now() }]
      });
    }
    setExpForm({ title: '', company: '', period: '', description: '', skills: [] });
    setEditingExpId(null);
    setEditingSection(null);
  };

  const deleteExperience = (id) => {
    setData({ ...data, experience: data.experience.filter(exp => exp.id !== id) });
  };

  const addExpSkill = () => {
    if (newExpSkill.trim() && !expForm.skills.includes(newExpSkill.trim())) {
      setExpForm({ ...expForm, skills: [...expForm.skills, newExpSkill.trim()] });
      setNewExpSkill('');
    }
  };

  const removeExpSkill = (skill) => {
    setExpForm({ ...expForm, skills: expForm.skills.filter(s => s !== skill) });
  };

  // Education handlers
  const saveEducation = () => {
    if (editingEduId) {
      setData({
        ...data,
        education: data.education.map(edu => edu.id === editingEduId ? { ...eduForm, id: editingEduId } : edu)
      });
    } else {
      setData({
        ...data,
        education: [...data.education, { ...eduForm, id: Date.now() }]
      });
    }
    setEduForm({ degree: '', school: '', level: '' });
    setEditingEduId(null);
    setEditingSection(null);
  };

  const deleteEducation = (id) => {
    setData({ ...data, education: data.education.filter(edu => edu.id !== id) });
  };

  // Language handlers
  const saveLanguage = () => {
    if (editingLangId) {
      setData({
        ...data,
        languages: data.languages.map(lang => lang.id === editingLangId ? { ...langForm, id: editingLangId } : lang)
      });
    } else {
      setData({
        ...data,
        languages: [...data.languages, { ...langForm, id: Date.now() }]
      });
    }
    setLangForm({ name: '', level: '', flag: '' });
    setEditingLangId(null);
    setEditingSection(null);
  };

  const deleteLanguage = (id) => {
    setData({ ...data, languages: data.languages.filter(lang => lang.id !== id) });
  };

  // Course handlers
  const saveCourse = () => {
    if (courseForm.name.trim()) {
      setData({
        ...data,
        courses: [...data.courses, { ...courseForm, id: Date.now() }]
      });
      setCourseForm({ name: '', issuer: '', year: '' });
      setEditingSection(null);
    }
  };

  const deleteCourse = (id) => {
    setData({ ...data, courses: data.courses.filter(c => c.id !== id) });
  };

  // Link handlers
  const saveLink = () => {
    if (editingLinkId) {
      setData({
        ...data,
        links: data.links.map(link => link.id === editingLinkId ? { ...linkForm, id: editingLinkId } : link)
      });
    } else {
      setData({
        ...data,
        links: [...data.links, { ...linkForm, id: Date.now() }]
      });
    }
    setLinkForm({ title: '', url: '' });
    setEditingLinkId(null);
    setEditingSection(null);
  };

  const deleteLink = (id) => {
    setData({ ...data, links: data.links.filter(link => link.id !== id) });
  };

  const toggleExp = (id) => {
    setExpandedExp({ ...expandedExp, [id]: !expandedExp[id] });
  };

  // Photo handlers
  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const img = new Image();
        img.onload = () => {
          setTempPhoto(img);
          // Center the image initially
          setPhotoPosition({ x: 0, y: 0 });
          setPhotoScale(1);
        };
        img.src = event.target.result;
      };
      reader.readAsDataURL(file);
    }
  };

  const handleMouseDown = (e) => {
    if (!tempPhoto) return;
    setIsDragging(true);
    setDragStart({
      x: e.clientX - photoPosition.x,
      y: e.clientY - photoPosition.y
    });
  };

  const handleMouseMove = useCallback((e) => {
    if (!isDragging || !tempPhoto) return;
    setPhotoPosition({
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y
    });
  }, [isDragging, dragStart, tempPhoto]);

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleZoomIn = () => {
    setPhotoScale(prev => Math.min(prev + 0.1, 3));
  };

  const handleZoomOut = () => {
    setPhotoScale(prev => Math.max(prev - 0.1, 0.5));
  };

  const cropAndSavePhoto = () => {
    if (!tempPhoto || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const size = 300; // Output size

    canvas.width = size;
    canvas.height = size;

    // Clear canvas
    ctx.fillStyle = '#f3f4f6';
    ctx.fillRect(0, 0, size, size);

    // Calculate source and destination
    const displaySize = 200; // The size shown in the modal
    const scale = photoScale;
    
    // Draw the image cropped to a square
    const sourceSize = Math.min(tempPhoto.width, tempPhoto.height);
    const sourceX = (tempPhoto.width - sourceSize) / 2;
    const sourceY = (tempPhoto.height - sourceSize) / 2;

    ctx.save();
    ctx.beginPath();
    ctx.arc(size / 2, size / 2, size / 2, 0, Math.PI * 2);
    ctx.clip();

    // Draw image centered and scaled
    const drawSize = sourceSize * scale;
    const offsetX = photoPosition.x * (sourceSize / displaySize);
    const offsetY = photoPosition.y * (sourceSize / displaySize);

    ctx.drawImage(
      tempPhoto,
      sourceX - offsetX / scale,
      sourceY - offsetY / scale,
      sourceSize / scale,
      sourceSize / scale,
      0,
      0,
      size,
      size
    );

    ctx.restore();

    // Convert to data URL and save
    setPhoto(canvas.toDataURL('image/jpeg', 0.9));
    setPhotoModalOpen(false);
    setTempPhoto(null);
  };

  const deletePhoto = () => {
    setPhoto(null);
    setTempPhoto(null);
    setPhotoPosition({ x: 0, y: 0 });
    setPhotoScale(1);
  };

  React.useEffect(() => {
    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
      return () => {
        window.removeEventListener('mousemove', handleMouseMove);
        window.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isDragging, handleMouseMove]);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-5xl mx-auto px-4 py-4 flex items-center justify-between">
          <h1 className="text-xl font-bold text-gray-900">CV Generator</h1>
          <button 
            onClick={handleDownloadPDF}
            className="btn-primary flex items-center gap-2 no-print"
          >
            <Download size={18} />
            Last ned PDF
          </button>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-8">
        <div ref={cvRef} className="cv-container bg-white shadow-lg rounded-lg overflow-hidden">
          {/* Contact Information */}
          <section className="cv-section">
            <div className="flex flex-col md:flex-row gap-6">
              {/* Left side - Contact info */}
              <div className="flex-1">
                <div className="cv-section-title">
                  <span>Kontaktinformasjon</span>
                  <button 
                    onClick={() => {
                      setContactForm(data.contact);
                      setEditingSection('contact');
                    }}
                    className="edit-btn no-print"
                  >
                    <Pencil size={16} />
                    Rediger
                  </button>
                </div>
                <p className="text-sm text-gray-500 mb-4">Rediger din kontaktinformasjon</p>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-700 block mb-1">Navn og etternavn</label>
                    <div className="flex items-center gap-2 text-gray-900">
                      <User size={18} className="text-gray-400" />
                      {data.contact.name || <span className="text-gray-400 italic">Ikke fylt ut</span>}
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700 block mb-1">Fødselsår</label>
                    <div className="flex items-center gap-2 text-gray-900">
                      <Calendar size={18} className="text-gray-400" />
                      {data.contact.birthYear || <span className="text-gray-400 italic">Ikke fylt ut</span>}
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700 block mb-1">Telefonnummer</label>
                    <div className="flex items-center gap-2 text-gray-900">
                      <Phone size={18} className="text-gray-400" />
                      {data.contact.phone || <span className="text-gray-400 italic">Ikke fylt ut</span>}
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700 block mb-1">E-post</label>
                    <div className="flex items-center gap-2 text-gray-900">
                      <Mail size={18} className="text-gray-400" />
                      {data.contact.email || <span className="text-gray-400 italic">Ikke fylt ut</span>}
                    </div>
                  </div>
                </div>
              </div>

              {/* Right side - Photo */}
              <div className="flex flex-col items-center">
                <div className="relative">
                  {photo ? (
                    <div className="relative">
                      <img 
                        src={photo} 
                        alt="Profilbilde" 
                        className="w-32 h-32 rounded-full object-cover border-4 border-gray-200"
                      />
                      <div className="absolute -bottom-2 -right-2 flex gap-1 no-print">
                        <button
                          onClick={() => {
                            setTempPhoto(null);
                            setPhotoModalOpen(true);
                          }}
                          className="bg-primary-600 text-white p-2 rounded-full hover:bg-primary-700 shadow-md"
                          title="Endre bilde"
                        >
                          <Pencil size={14} />
                        </button>
                        <button
                          onClick={deletePhoto}
                          className="bg-red-500 text-white p-2 rounded-full hover:bg-red-600 shadow-md"
                          title="Slett bilde"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                  ) : (
                    <button
                      onClick={() => {
                        setTempPhoto(null);
                        setPhotoModalOpen(true);
                      }}
                      className="w-32 h-32 rounded-full bg-gray-100 border-4 border-dashed border-gray-300 flex flex-col items-center justify-center text-gray-400 hover:bg-gray-200 hover:border-gray-400 transition-colors no-print"
                    >
                      <ImageIcon size={32} />
                      <span className="text-xs mt-1">Legg til bilde</span>
                    </button>
                  )}
                </div>
                {!photo && <p className="text-xs text-gray-400 mt-2 text-center no-print">Klikk for å laste opp</p>}
              </div>
            </div>
          </section>

          {/* Personal Summary */}
          <section className="cv-section">
            <div className="cv-section-title">
              <span>Personlig oppsummering</span>
              <button 
                onClick={() => {
                  setSummaryText(data.summary);
                  setEditingSection('summary');
                }}
                className="edit-btn no-print"
              >
                <Pencil size={16} />
                Rediger
              </button>
            </div>
            <p className="text-sm text-gray-500 mb-4">Skriv kort om deg selv, gjerne med fokus på dine sterkeste egenskaper</p>
            <p className="text-gray-700 leading-relaxed">
              {data.summary || <span className="text-gray-400 italic">Ingen oppsummering lagt til ennå. Klikk "Rediger" for å legge til.</span>}
            </p>
          </section>

          {/* Skills */}
          <section className="cv-section">
            <div className="cv-section-title">
              <span>Ferdigheter</span>
              <button 
                onClick={() => setEditingSection('skills')}
                className="edit-btn no-print"
              >
                <Pencil size={16} />
                Rediger
              </button>
            </div>
            <p className="text-sm text-gray-500 mb-4">Fremhev dine nøkkelferdigheter</p>
            <div className="flex flex-wrap gap-2">
              {data.skills.length === 0 ? (
                <span className="text-gray-400 italic">Ingen ferdigheter lagt til ennå. Klikk "Rediger" for å legge til.</span>
              ) : (
                data.skills.map((skill, idx) => (
                  <span key={idx} className="skill-tag">
                    {skill}
                    <button 
                      onClick={() => removeSkill(skill)}
                      className="ml-2 text-gray-400 hover:text-red-500 no-print"
                    >
                      <X size={14} />
                    </button>
                  </span>
                ))
              )}
            </div>
          </section>

          {/* Work Experience */}
          <section className="cv-section">
            <div className="cv-section-title">
              <span>Arbeidserfaring</span>
              <button 
                onClick={() => {
                  setExpForm({ title: '', company: '', period: '', description: '', skills: [] });
                  setEditingExpId(null);
                  setEditingSection('experience-add');
                }}
                className="edit-btn no-print"
              >
                <Plus size={16} />
                Legg til
              </button>
            </div>
            <p className="text-sm text-gray-500 mb-4">Legg til arbeidserfaring</p>
            
            <div className="space-y-4">
              {data.experience.length === 0 ? (
                <div className="text-center py-8 text-gray-400">
                  <Briefcase size={48} className="mx-auto mb-2 opacity-50" />
                  <p className="font-medium">Ingen arbeidserfaring lagt til</p>
                  <p className="text-sm">Klikk "Legg til" for å legge til din arbeidserfaring.</p>
                </div>
              ) : (
                data.experience.map((exp) => (
                <div key={exp.id} className="border-b border-gray-100 last:border-0 pb-4 last:pb-0">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h4 className="font-semibold text-gray-900">{exp.title}</h4>
                      <p className="text-gray-600">{exp.company}</p>
                      {exp.period && <p className="text-sm text-gray-500">{exp.period}</p>}
                    </div>
                    <div className="flex items-center gap-2 no-print">
                      <button 
                        onClick={() => {
                          setExpForm(exp);
                          setEditingExpId(exp.id);
                          setEditingSection('experience-edit');
                        }}
                        className="text-gray-400 hover:text-primary-600"
                      >
                        <Pencil size={16} />
                      </button>
                      <button 
                        onClick={() => deleteExperience(exp.id)}
                        className="text-gray-400 hover:text-red-500"
                      >
                        <Trash2 size={16} />
                      </button>
                      <button 
                        onClick={() => toggleExp(exp.id)}
                        className="text-gray-400 hover:text-gray-600"
                      >
                        {expandedExp[exp.id] ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                      </button>
                    </div>
                  </div>
                  
                  {(expandedExp[exp.id] || true) && (
                    <>
                      <p className="text-gray-700 mt-2 text-sm leading-relaxed">{exp.description}</p>
                      {exp.skills.length > 0 && (
                        <div className="flex flex-wrap gap-2 mt-3">
                          {exp.skills.slice(0, 3).map((skill, idx) => (
                            <span key={idx} className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">{skill}</span>
                          ))}
                          {exp.skills.length > 3 && (
                            <span className="text-xs text-gray-500">+ {exp.skills.length - 3}</span>
                          )}
                        </div>
                      )}
                    </>
                  )}
                </div>
              ))
              )}
            </div>
          </section>

          {/* Education */}
          <section className="cv-section">
            <div className="cv-section-title">
              <span>Utdanning</span>
              <button 
                onClick={() => {
                  setEduForm({ degree: '', school: '', level: '' });
                  setEditingEduId(null);
                  setEditingSection('education-add');
                }}
                className="edit-btn no-print"
              >
                <Plus size={16} />
                Legg til
              </button>
            </div>
            <p className="text-sm text-gray-500 mb-4">Legg til utdanning eller fagbrev</p>
            
            <div className="space-y-3">
              {data.education.length === 0 ? (
                <div className="text-center py-6 text-gray-400">
                  <GraduationCap size={40} className="mx-auto mb-2 opacity-50" />
                  <p className="text-sm">Ingen utdanning lagt til ennå.</p>
                </div>
              ) : (
                data.education.map((edu) => (
                <div key={edu.id} className="flex items-start justify-between group">
                  <div>
                    <h4 className="font-medium text-gray-900">{edu.degree}</h4>
                    <p className="text-gray-600 text-sm">{edu.school}</p>
                    <p className="text-gray-500 text-sm">{edu.level}</p>
                  </div>
                  <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity no-print">
                    <button 
                      onClick={() => {
                        setEduForm(edu);
                        setEditingEduId(edu.id);
                        setEditingSection('education-edit');
                      }}
                      className="text-gray-400 hover:text-primary-600"
                    >
                      <Pencil size={16} />
                    </button>
                    <button 
                      onClick={() => deleteEducation(edu.id)}
                      className="text-gray-400 hover:text-red-500"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              ))
              )}
            </div>
          </section>

          {/* Languages */}
          <section className="cv-section">
            <div className="cv-section-title">
              <span>Språk</span>
              <button 
                onClick={() => {
                  setLangForm({ name: '', level: '', flag: '' });
                  setEditingLangId(null);
                  setEditingSection('language-add');
                }}
                className="edit-btn no-print"
              >
                <Plus size={16} />
                Legg til
              </button>
            </div>
            <p className="text-sm text-gray-500 mb-4">Legg til språk du kan kommunisere på</p>
            
            <div className="space-y-3">
              {data.languages.length === 0 ? (
                <div className="text-center py-6 text-gray-400">
                  <Globe size={40} className="mx-auto mb-2 opacity-50" />
                  <p className="text-sm">Ingen språk lagt til ennå.</p>
                </div>
              ) : (
                data.languages.map((lang) => (
                <div key={lang.id} className="flex items-center justify-between group">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{lang.flag}</span>
                    <div>
                      <span className="font-medium text-gray-900">{lang.name}</span>
                      <span className="text-gray-500 text-sm ml-2">{lang.level}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity no-print">
                    <button 
                      onClick={() => {
                        setLangForm(lang);
                        setEditingLangId(lang.id);
                        setEditingSection('language-edit');
                      }}
                      className="text-gray-400 hover:text-primary-600"
                    >
                      <Pencil size={16} />
                    </button>
                    <button 
                      onClick={() => deleteLanguage(lang.id)}
                      className="text-gray-400 hover:text-red-500"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              ))
              )}
            </div>
          </section>

          {/* Courses & Certifications */}
          <section className="cv-section">
            <div className="cv-section-title">
              <span>Kurs og sertifiseringer</span>
              <button 
                onClick={() => {
                  setCourseForm({ name: '', issuer: '', year: '' });
                  setEditingSection('course-add');
                }}
                className="edit-btn no-print"
              >
                <Plus size={16} />
                Legg til
              </button>
            </div>
            <p className="text-sm text-gray-500 mb-4">Legg til dine kurs og sertifiseringer</p>
            
            {data.courses.length === 0 ? (
              <div className="text-center py-8 text-gray-400">
                <Award size={48} className="mx-auto mb-2 opacity-50" />
                <p className="font-medium">Her var det tomt</p>
                <p className="text-sm">Fyll inn litt for å kanskje fange de beste jobbene.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {data.courses.map((course) => (
                  <div key={course.id} className="flex items-start justify-between group">
                    <div>
                      <h4 className="font-medium text-gray-900">{course.name}</h4>
                      {course.issuer && <p className="text-gray-600 text-sm">{course.issuer}</p>}
                      {course.year && <p className="text-gray-500 text-sm">{course.year}</p>}
                    </div>
                    <button 
                      onClick={() => deleteCourse(course.id)}
                      className="text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity no-print"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </section>

          {/* Links */}
          <section className="cv-section">
            <div className="cv-section-title">
              <span>Lenker</span>
              <button 
                onClick={() => {
                  setLinkForm({ title: '', url: '' });
                  setEditingLinkId(null);
                  setEditingSection('link-add');
                }}
                className="edit-btn no-print"
              >
                <Plus size={16} />
                Legg til
              </button>
            </div>
            <p className="text-sm text-gray-500 mb-4">Legg ved lenker</p>
            
            <div className="space-y-3">
              {data.links.length === 0 ? (
                <div className="text-center py-6 text-gray-400">
                  <LinkIcon size={40} className="mx-auto mb-2 opacity-50" />
                  <p className="text-sm">Ingen lenker lagt til ennå.</p>
                </div>
              ) : (
                data.links.map((link) => (
                <div key={link.id} className="flex items-start justify-between group">
                  <div>
                    <h4 className="font-medium text-gray-900">{link.title}</h4>
                    <a 
                      href={link.url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-primary-600 hover:text-primary-700 text-sm break-all"
                    >
                      {link.url}
                    </a>
                  </div>
                  <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity no-print">
                    <button 
                      onClick={() => {
                        setLinkForm(link);
                        setEditingLinkId(link.id);
                        setEditingSection('link-edit');
                      }}
                      className="text-gray-400 hover:text-primary-600"
                    >
                      <Pencil size={16} />
                    </button>
                    <button 
                      onClick={() => deleteLink(link.id)}
                      className="text-gray-400 hover:text-red-500"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              ))
              )}
            </div>
          </section>
        </div>
      </main>

      {/* Modals */}
      
      {/* Contact Modal */}
      <Modal 
        isOpen={editingSection === 'contact'} 
        onClose={() => setEditingSection(null)}
        title="Rediger kontaktinformasjon"
      >
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium text-gray-700 block mb-1">Navn og etternavn</label>
            <input 
              type="text"
              value={contactForm.name}
              onChange={(e) => setContactForm({...contactForm, name: e.target.value})}
              className="input-field"
            />
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700 block mb-1">Fødselsår</label>
            <input 
              type="text"
              value={contactForm.birthYear}
              onChange={(e) => setContactForm({...contactForm, birthYear: e.target.value})}
              className="input-field"
            />
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700 block mb-1">Telefonnummer</label>
            <input 
              type="text"
              value={contactForm.phone}
              onChange={(e) => setContactForm({...contactForm, phone: e.target.value})}
              className="input-field"
            />
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700 block mb-1">E-post</label>
            <input 
              type="email"
              value={contactForm.email}
              onChange={(e) => setContactForm({...contactForm, email: e.target.value})}
              className="input-field"
            />
          </div>
          <div className="flex gap-2 pt-2">
            <button onClick={saveContact} className="btn-primary flex-1">Lagre</button>
            <button onClick={() => setEditingSection(null)} className="btn-secondary flex-1">Avbryt</button>
          </div>
        </div>
      </Modal>

      {/* Summary Modal */}
      <Modal 
        isOpen={editingSection === 'summary'} 
        onClose={() => setEditingSection(null)}
        title="Rediger personlig oppsummering"
      >
        <div className="space-y-4">
          <textarea
            value={summaryText}
            onChange={(e) => setSummaryText(e.target.value)}
            rows={6}
            className="input-field resize-none"
            placeholder="Skriv kort om deg selv..."
          />
          <div className="flex gap-2">
            <button onClick={saveSummary} className="btn-primary flex-1">Lagre</button>
            <button onClick={() => setEditingSection(null)} className="btn-secondary flex-1">Avbryt</button>
          </div>
        </div>
      </Modal>

      {/* Skills Modal */}
      <Modal 
        isOpen={editingSection === 'skills'} 
        onClose={() => setEditingSection(null)}
        title="Rediger ferdigheter"
      >
        <div className="space-y-4">
          <div className="flex gap-2">
            <input
              type="text"
              value={newSkill}
              onChange={(e) => setNewSkill(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && addSkill()}
              placeholder="Legg til ny ferdighet"
              className="input-field flex-1"
            />
            <button onClick={addSkill} className="btn-primary">Legg til</button>
          </div>
          <div className="flex flex-wrap gap-2 max-h-60 overflow-y-auto">
            {data.skills.map((skill, idx) => (
              <span key={idx} className="skill-tag">
                {skill}
                <button onClick={() => removeSkill(skill)} className="ml-2 text-gray-400 hover:text-red-500">
                  <X size={14} />
                </button>
              </span>
            ))}
          </div>
          <button onClick={() => setEditingSection(null)} className="btn-secondary w-full">Lukk</button>
        </div>
      </Modal>

      {/* Experience Add/Edit Modal */}
      <Modal 
        isOpen={editingSection === 'experience-add' || editingSection === 'experience-edit'} 
        onClose={() => setEditingSection(null)}
        title={editingExpId ? 'Rediger arbeidserfaring' : 'Legg til arbeidserfaring'}
      >
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium text-gray-700 block mb-1">Stillingstittel</label>
            <input 
              type="text"
              value={expForm.title}
              onChange={(e) => setExpForm({...expForm, title: e.target.value})}
              className="input-field"
            />
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700 block mb-1">Bedrift</label>
            <input 
              type="text"
              value={expForm.company}
              onChange={(e) => setExpForm({...expForm, company: e.target.value})}
              className="input-field"
            />
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700 block mb-1">Periode</label>
            <input 
              type="text"
              value={expForm.period}
              onChange={(e) => setExpForm({...expForm, period: e.target.value})}
              placeholder="f.eks. januar 2022 - januar 2024"
              className="input-field"
            />
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700 block mb-1">Beskrivelse</label>
            <textarea
              value={expForm.description}
              onChange={(e) => setExpForm({...expForm, description: e.target.value})}
              rows={4}
              className="input-field resize-none"
            />
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700 block mb-1">Ferdigheter</label>
            <div className="flex gap-2 mb-2">
              <input
                type="text"
                value={newExpSkill}
                onChange={(e) => setNewExpSkill(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && addExpSkill()}
                placeholder="Legg til ferdighet"
                className="input-field flex-1"
              />
              <button onClick={addExpSkill} className="btn-primary">Legg til</button>
            </div>
            <div className="flex flex-wrap gap-2">
              {expForm.skills.map((skill, idx) => (
                <span key={idx} className="skill-tag">
                  {skill}
                  <button onClick={() => removeExpSkill(skill)} className="ml-2 text-gray-400 hover:text-red-500">
                    <X size={14} />
                  </button>
                </span>
              ))}
            </div>
          </div>
          <div className="flex gap-2 pt-2">
            <button onClick={saveExperience} className="btn-primary flex-1">Lagre</button>
            <button onClick={() => setEditingSection(null)} className="btn-secondary flex-1">Avbryt</button>
          </div>
        </div>
      </Modal>

      {/* Education Add/Edit Modal */}
      <Modal 
        isOpen={editingSection === 'education-add' || editingSection === 'education-edit'} 
        onClose={() => setEditingSection(null)}
        title={editingEduId ? 'Rediger utdanning' : 'Legg til utdanning'}
      >
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium text-gray-700 block mb-1">Studieretning/utdanning</label>
            <input 
              type="text"
              value={eduForm.degree}
              onChange={(e) => setEduForm({...eduForm, degree: e.target.value})}
              className="input-field"
            />
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700 block mb-1">Skole/institusjon</label>
            <input 
              type="text"
              value={eduForm.school}
              onChange={(e) => setEduForm({...eduForm, school: e.target.value})}
              className="input-field"
            />
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700 block mb-1">Nivå</label>
            <input 
              type="text"
              value={eduForm.level}
              onChange={(e) => setEduForm({...eduForm, level: e.target.value})}
              placeholder="f.eks. Bachelor (eller tilsvarende)"
              className="input-field"
            />
          </div>
          <div className="flex gap-2 pt-2">
            <button onClick={saveEducation} className="btn-primary flex-1">Lagre</button>
            <button onClick={() => setEditingSection(null)} className="btn-secondary flex-1">Avbryt</button>
          </div>
        </div>
      </Modal>

      {/* Language Add/Edit Modal */}
      <Modal 
        isOpen={editingSection === 'language-add' || editingSection === 'language-edit'} 
        onClose={() => setEditingSection(null)}
        title={editingLangId ? 'Rediger språk' : 'Legg til språk'}
      >
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium text-gray-700 block mb-1">Språk</label>
            <select
              value={langForm.name ? `${langForm.name}|${langForm.flag}` : ''}
              onChange={(e) => {
                if (e.target.value) {
                  const [name, flag] = e.target.value.split('|');
                  setLangForm({...langForm, name, flag});
                } else {
                  setLangForm({...langForm, name: '', flag: ''});
                }
              }}
              className="input-field"
            >
              <option value="">Velg språk</option>
              <option value="Norsk|🇳🇴">🇳🇴 Norsk</option>
              <option value="Svensk|🇸🇪">🇸🇪 Svensk</option>
              <option value="Dansk|🇩🇰">🇩🇰 Dansk</option>
              <option value="Engelsk|🇬🇧">🇬🇧 Engelsk</option>
              <option value="Amerikansk engelsk|🇺🇸">🇺🇸 Amerikansk engelsk</option>
              <option value="Tysk|🇩🇪">🇩🇪 Tysk</option>
              <option value="Fransk|🇫🇷">🇫🇷 Fransk</option>
              <option value="Spansk|🇪🇸">🇪🇸 Spansk</option>
              <option value="Italiensk|🇮🇹">🇮🇹 Italiensk</option>
              <option value="Portugisisk|🇵🇹">🇵🇹 Portugisisk</option>
              <option value="Nederlandsk|🇳🇱">🇳🇱 Nederlands</option>
              <option value="Russisk|🇷🇺">🇷🇺 Russisk</option>
              <option value="Ukrainsk|🇺🇦">🇺🇦 Ukrainsk</option>
              <option value="Polsk|🇵🇱">🇵🇱 Polsk</option>
              <option value="Tsjekkisk|🇨🇿">🇨🇿 Tsjekkisk</option>
              <option value="Ungarsk|🇭🇺">🇭🇺 Ungarsk</option>
              <option value="Rumensk|🇷🇴">🇷🇴 Rumensk</option>
              <option value="Kinesisk|🇨🇳">🇨🇳 Kinesisk</option>
              <option value="Japansk|🇯🇵">🇯🇵 Japansk</option>
              <option value="Koreansk|🇰🇷">🇰🇷 Koreansk</option>
              <option value="Arabisk|🇸🇦">🇸🇦 Arabisk</option>
              <option value="Hindi|🇮🇳">🇮🇳 Hindi</option>
              <option value="Tyrkisk|🇹🇷">🇹🇷 Tyrkisk</option>
              <option value="Gresk|🇬🇷">🇬🇷 Gresk</option>
              <option value="Hebraisk|🇮🇱">🇮🇱 Hebraisk</option>
              <option value="Finsk|🇫🇮">🇫🇮 Finsk</option>
            </select>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700 block mb-1">Nivå</label>
            <select
              value={langForm.level}
              onChange={(e) => setLangForm({...langForm, level: e.target.value})}
              className="input-field"
            >
              <option value="">Velg nivå</option>
              <option value="Morsmål">Morsmål</option>
              <option value="Flytende">Flytende</option>
              <option value="God">God</option>
              <option value="Grunnleggende">Grunnleggende</option>
            </select>
          </div>
          <div className="flex gap-2 pt-2">
            <button onClick={saveLanguage} className="btn-primary flex-1">Lagre</button>
            <button onClick={() => setEditingSection(null)} className="btn-secondary flex-1">Avbryt</button>
          </div>
        </div>
      </Modal>

      {/* Course Add Modal */}
      <Modal 
        isOpen={editingSection === 'course-add'} 
        onClose={() => setEditingSection(null)}
        title="Legg til kurs eller sertifisering"
      >
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium text-gray-700 block mb-1">Kursnavn</label>
            <input 
              type="text"
              value={courseForm.name}
              onChange={(e) => setCourseForm({...courseForm, name: e.target.value})}
              className="input-field"
            />
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700 block mb-1">Utsteder</label>
            <input 
              type="text"
              value={courseForm.issuer}
              onChange={(e) => setCourseForm({...courseForm, issuer: e.target.value})}
              className="input-field"
            />
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700 block mb-1">År</label>
            <input 
              type="text"
              value={courseForm.year}
              onChange={(e) => setCourseForm({...courseForm, year: e.target.value})}
              className="input-field"
            />
          </div>
          <div className="flex gap-2 pt-2">
            <button onClick={saveCourse} className="btn-primary flex-1">Lagre</button>
            <button onClick={() => setEditingSection(null)} className="btn-secondary flex-1">Avbryt</button>
          </div>
        </div>
      </Modal>

      {/* Link Add/Edit Modal */}
      <Modal 
        isOpen={editingSection === 'link-add' || editingSection === 'link-edit'} 
        onClose={() => setEditingSection(null)}
        title={editingLinkId ? 'Rediger lenke' : 'Legg til lenke'}
      >
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium text-gray-700 block mb-1">Tittel</label>
            <input 
              type="text"
              value={linkForm.title}
              onChange={(e) => setLinkForm({...linkForm, title: e.target.value})}
              placeholder="f.eks. LinkedIn"
              className="input-field"
            />
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700 block mb-1">URL</label>
            <input 
              type="url"
              value={linkForm.url}
              onChange={(e) => setLinkForm({...linkForm, url: e.target.value})}
              placeholder="https://..."
              className="input-field"
            />
          </div>
          <div className="flex gap-2 pt-2">
            <button onClick={saveLink} className="btn-primary flex-1">Lagre</button>
            <button onClick={() => setEditingSection(null)} className="btn-secondary flex-1">Avbryt</button>
          </div>
        </div>
      </Modal>

      {/* Photo Upload Modal */}
      <Modal 
        isOpen={photoModalOpen} 
        onClose={() => {
          setPhotoModalOpen(false);
          setTempPhoto(null);
          setPhotoPosition({ x: 0, y: 0 });
          setPhotoScale(1);
        }}
        title="Last opp profilbilde"
      >
        <div className="space-y-4">
          {!tempPhoto ? (
            <>
              <div 
                className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:bg-gray-50 cursor-pointer transition-colors"
                onClick={() => fileInputRef.current?.click()}
              >
                <Upload size={48} className="mx-auto text-gray-400 mb-4" />
                <p className="text-gray-600 font-medium">Klikk for å velge bilde</p>
                <p className="text-sm text-gray-400 mt-1">eller dra og slipp her</p>
                <p className="text-xs text-gray-400 mt-2">PNG, JPG opptil 5MB</p>
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileUpload}
                className="hidden"
              />
            </>
          ) : (
            <>
              <div className="text-center">
                <p className="text-sm text-gray-600 mb-4">
                  <Move size={16} className="inline mr-1" />
                  Dra for å justere posisjon • Bruk zoom-knappene for å endre størrelse
                </p>
                
                {/* Preview container */}
                <div className="relative inline-block">
                  <div 
                    className="w-[200px] h-[200px] rounded-full overflow-hidden bg-gray-100 border-4 border-gray-200 mx-auto cursor-move relative"
                    onMouseDown={handleMouseDown}
                    style={{
                      backgroundImage: `url(${tempPhoto.src})`,
                      backgroundSize: `${photoScale * 100}%`,
                      backgroundPosition: `calc(50% + ${photoPosition.x}px) calc(50% + ${photoPosition.y}px)`,
                      backgroundRepeat: 'no-repeat'
                    }}
                  >
                    {/* Grid overlay */}
                    <div className="absolute inset-0 pointer-events-none">
                      <div className="w-full h-full border-2 border-dashed border-white/50 rounded-full"></div>
                      <div className="absolute top-1/2 left-0 w-full h-px bg-white/30"></div>
                      <div className="absolute left-1/2 top-0 h-full w-px bg-white/30"></div>
                    </div>
                  </div>

                  {/* Zoom controls */}
                  <div className="flex justify-center gap-2 mt-4">
                    <button
                      onClick={handleZoomOut}
                      className="p-2 bg-gray-100 hover:bg-gray-200 rounded-full transition-colors"
                      title="Zoom ut"
                    >
                      <ZoomOut size={20} />
                    </button>
                    <span className="px-4 py-2 bg-gray-100 rounded-full text-sm font-medium min-w-[80px]">
                      {Math.round(photoScale * 100)}%
                    </span>
                    <button
                      onClick={handleZoomIn}
                      className="p-2 bg-gray-100 hover:bg-gray-200 rounded-full transition-colors"
                      title="Zoom inn"
                    >
                      <ZoomIn size={20} />
                    </button>
                  </div>
                </div>
              </div>

              {/* Hidden canvas for cropping */}
              <canvas ref={canvasRef} className="hidden" />

              <div className="flex gap-2 pt-4">
                <button 
                  onClick={cropAndSavePhoto} 
                  className="btn-primary flex-1"
                >
                  Lagre bilde
                </button>
                <button 
                  onClick={() => {
                    setTempPhoto(null);
                    setPhotoPosition({ x: 0, y: 0 });
                    setPhotoScale(1);
                  }} 
                  className="btn-secondary"
                >
                  Velg nytt
                </button>
                <button 
                  onClick={() => {
                    setPhotoModalOpen(false);
                    setTempPhoto(null);
                    setPhotoPosition({ x: 0, y: 0 });
                    setPhotoScale(1);
                  }} 
                  className="btn-secondary flex-1"
                >
                  Avbryt
                </button>
              </div>
            </>
          )}
        </div>
      </Modal>
    </div>
  );
}

export default App;
