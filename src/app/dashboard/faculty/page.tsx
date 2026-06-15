'use strict';

'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useTheme } from '@/components/theme-provider';
import { db } from '@/lib/db-client';
import DigitalIdCard from '@/components/DigitalIdCard';
import { AstrixLogo } from '@/components/branding';
import { 
  Briefcase, 
  User, 
  Users, 
  Clock, 
  CheckCircle, 
  XCircle, 
  Send,
  Sparkles,
  Search,
  BookOpen,
  PlusCircle,
  FileSpreadsheet,
  AlertOctagon,
  LogOut,
  Mail,
  Loader2,
  Bell,
  QrCode,
  Menu,
  X,
  Sun,
  Moon
} from 'lucide-react';

export default function FacultyDashboard() {
  const router = useRouter();
  const { theme, toggleTheme } = useTheme();

  // Auth & Profile
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [facultyProfile, setFacultyProfile] = useState<any>(null);

  // Tab views
  const [activeTab, setActiveTab] = useState<'directory' | 'timetable' | 'attendance' | 'grading' | 'watchlist' | 'approvals'>('directory');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [copilotOpen, setCopilotOpen] = useState(false);
  const [chatInput, setChatInput] = useState('');
  const [chatMessages, setChatMessages] = useState<any[]>([
    { role: 'assistant', content: 'Welcome Dr. Turing. I am your Faculty Copilot. I can assist with syllabus status, student grades calculation, or drafting notices.' }
  ]);
  const [isAiLoading, setIsAiLoading] = useState(false);

  // Loaded database records
  const [students, setStudents] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [leaves, setLeaves] = useState<any[]>([]);
  const [certificates, setCertificates] = useState<any[]>([]);
  const [subjects, setSubjects] = useState<any[]>([]);
  const [attendanceLogs, setAttendanceLogs] = useState<any[]>([]);
  const [timetableEntries, setTimetableEntries] = useState<any[]>([]);

  // QR Attendance states
  const [qrSubject, setQrSubject] = useState('');
  const [qrCodeString, setQrCodeString] = useState('');
  const [isQrGenerating, setIsQrGenerating] = useState(false);

  // Marks Entry states
  const [selectedStudent, setSelectedStudent] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('');
  const [examType, setExamType] = useState('Internal-1');
  const [enteredMarks, setEnteredMarks] = useState('');
  
  // Calculator states
  const [calcQuiz, setCalcQuiz] = useState(10);
  const [calcMidterm, setCalcMidterm] = useState(40);
  const [calcAssignment, setCalcAssignment] = useState(10);
  const [calcOutcome, setCalcOutcome] = useState<number | null>(null);

  useEffect(() => {
    const userStr = localStorage.getItem('astrix-user');
    if (!userStr) {
      router.push('/auth/login');
      return;
    }
    const user = JSON.parse(userStr);
    if (user.role !== 'faculty') {
      router.push(`/dashboard/${user.role}`);
      return;
    }
    setCurrentUser(user);
    loadFacultyData(user.id);
  }, []);

  const loadFacultyData = async (userId: string) => {
    try {
      // 1. Fetch Faculty Profile
      const facs = await db.faculty.select({ profile_id: userId });
      if (facs[0]) {
        setFacultyProfile(facs[0]);
      }

      // 2. Fetch Students Directory & joins
      const studs = await db.students.select();
      const profiles = await db.profiles.select({ role: 'student' });
      // Map profiles onto students
      const mappedStuds = studs.map(s => {
        const p = profiles.find(pr => pr.id === s.profile_id);
        return { ...s, name: p?.name || 'Loading Student...', email: p?.email || '' };
      });
      setStudents(mappedStuds);

      // 3. Approvals logs
      const lv = await db.leave_requests.select({ status: 'Pending' });
      setLeaves(lv);

      const certs = await db.certificate_requests.select({ status: 'Pending' });
      setCertificates(certs);

      // 4. Subjects
      const subs = await db.subjects.select();
      setSubjects(subs);

      // 5. Attendance
      const logs = await db.attendance.select();
      setAttendanceLogs(logs);

      // 6. Timetables
      const tt = await db.timetable_entries.select({ faculty_id: userId });
      setTimetableEntries(tt);
    } catch (err) {
      console.error('Error loading faculty dashboard data:', err);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('astrix-user');
    router.push('/auth/login');
  };

  // Profile updates
  const [profilePhone, setProfilePhone] = useState('');
  const [profileAddress, setProfileAddress] = useState('');
  const [isUpdatingProfile, setIsUpdatingProfile] = useState(false);

  useEffect(() => {
    if (currentUser) {
      setProfilePhone(currentUser.phone || '');
      setProfileAddress(currentUser.address || '');
    }
  }, [currentUser]);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsUpdatingProfile(true);
    try {
      const updated = await db.profiles.update(currentUser.id, {
        phone: profilePhone,
        address: profileAddress,
      });
      setCurrentUser(updated);
      localStorage.setItem('astrix-user', JSON.stringify(updated));
      alert('Profile updated successfully!');
    } catch (err) {
      alert('Error updating profile.');
    } finally {
      setIsUpdatingProfile(false);
    }
  };

  // QR Code generator simulator
  const handleGenerateQR = (e: React.FormEvent) => {
    e.preventDefault();
    if (!qrSubject) return;
    setIsQrGenerating(true);
    setTimeout(() => {
      setQrCodeString(`ASTRIX-ATT-${qrSubject}-${Date.now()}`);
      setIsQrGenerating(false);
    }, 600);
  };

  // Submit Grade
  const handleEnterGrade = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStudent || !selectedSubject || !enteredMarks) return;

    try {
      const gpaMock = Number(enteredMarks) >= 90 ? 'O' : Number(enteredMarks) >= 80 ? 'A+' : 'B+';
      await db.results.insert({
        student_id: selectedStudent,
        subject_id: selectedSubject,
        exam_id: 'exam-int-1',
        marks_obtained: Number(enteredMarks),
        grade: gpaMock
      });
      alert('Marks recorded successfully!');
      setEnteredMarks('');
      loadFacultyData(currentUser.id);
    } catch (err) {
      alert('Failed to enter marks. Record might already exist.');
    }
  };

  // Calculation outcomes
  const calculateInternals = (e: React.FormEvent) => {
    e.preventDefault();
    // Formulas: Quiz (10%) + Midterm (40%) + Assignment (10%) = Total (60%) scaled
    const total = Number(calcQuiz) + (Number(calcMidterm) / 50 * 40) + Number(calcAssignment);
    setCalcOutcome(Math.round(total));
  };

  // Approve Leave
  const handleLeaveDecision = async (id: string, status: 'Approved' | 'Rejected') => {
    try {
      await db.leave_requests.update(id, {
        status,
        approved_by: currentUser.id
      });
      alert(`Leave request ${status.toLowerCase()}!`);
      loadFacultyData(currentUser.id);
    } catch (err) {
      alert('Failed to update leave.');
    }
  };

  // Approve Certificate
  const handleCertDecision = async (id: string, status: 'Approved' | 'Rejected') => {
    try {
      await db.certificate_requests.update(id, {
        status,
        approved_by: currentUser.id,
        document_url: status === 'Approved' ? '/documents/approved_certificate.pdf' : undefined
      });
      alert(`Certificate request ${status.toLowerCase()}!`);
      loadFacultyData(currentUser.id);
    } catch (err) {
      alert('Failed to update certificate.');
    }
  };

  // AI Copilot chat
  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim()) return;

    const userMsg = { role: 'user', content: chatInput };
    setChatMessages(prev => [...prev, userMsg]);
    setChatInput('');
    setIsAiLoading(true);

    try {
      const response = await fetch('/api/ai/copilot', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [...chatMessages, userMsg],
          userId: currentUser?.id
        })
      });

      const data = await response.json();
      if (data.response) {
        setChatMessages(prev => [...prev, { role: 'assistant', content: data.response }]);
      } else {
        setChatMessages(prev => [...prev, { role: 'assistant', content: 'Error getting feedback.' }]);
      }
    } catch (error) {
      setChatMessages(prev => [...prev, { role: 'assistant', content: 'Connection error.' }]);
    } finally {
      setIsAiLoading(false);
    }
  };

  // Watchlist computation: filter students at risk
  const riskWatchlist = useMemo(() => {
    return students.filter(s => {
      // Find their attendance records
      const studentAtt = attendanceLogs.filter(al => al.student_id === s.profile_id);
      const presentCount = studentAtt.filter(al => al.status === 'Present' || al.status === 'Late').length;
      const rate = studentAtt.length > 0 ? (presentCount / studentAtt.length) * 100 : 100;
      
      // Risk condition: GPA < 8.0 OR attendance < 75%
      return s.cgpa < 8.0 || rate < 75;
    });
  }, [students, attendanceLogs]);

  // Filter student directory search
  const filteredStudents = useMemo(() => {
    return students.filter(s => 
      s.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
      s.register_number.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [students, searchQuery]);

  return (
    <div className="min-h-screen bg-background text-text flex relative transition-colors duration-300">
      
      {/* SIDEBAR */}
      <aside className="w-64 bg-surface border-r border-border hidden md:flex flex-col justify-between p-6">
        <div className="space-y-8">
          <AstrixLogo size={30} />

          <nav className="space-y-1">
            <button 
              onClick={() => setActiveTab('directory')}
              className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${activeTab === 'directory' ? 'bg-primary text-primary-foreground shadow-md' : 'hover:bg-accent'}`}
            >
              <Users size={16} /> Student Directory
            </button>
            <button 
              onClick={() => setActiveTab('timetable')}
              className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${activeTab === 'timetable' ? 'bg-primary text-primary-foreground shadow-md' : 'hover:bg-accent'}`}
            >
              <Clock size={16} /> Timetable & Teaching
            </button>
            <button 
              onClick={() => setActiveTab('attendance')}
              className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${activeTab === 'attendance' ? 'bg-primary text-primary-foreground shadow-md' : 'hover:bg-accent'}`}
            >
              <Clock size={16} /> Attendance Hub
            </button>
            <button 
              onClick={() => setActiveTab('grading')}
              className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${activeTab === 'grading' ? 'bg-primary text-primary-foreground shadow-md' : 'hover:bg-accent'}`}
            >
              <BookOpen size={16} /> Grading & Calculator
            </button>
            <button 
              onClick={() => setActiveTab('watchlist')}
              className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${activeTab === 'watchlist' ? 'bg-primary text-primary-foreground shadow-md' : 'hover:bg-accent'}`}
            >
              <AlertOctagon size={16} /> Risk Watchlist
            </button>
            <button 
              onClick={() => setActiveTab('approvals')}
              className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${activeTab === 'approvals' ? 'bg-primary text-primary-foreground shadow-md' : 'hover:bg-accent'}`}
            >
              <CheckCircle size={16} /> Approvals Desk
            </button>
          </nav>
        </div>

        <button 
          onClick={handleLogout}
          className="flex items-center gap-3 px-4 py-2 rounded-xl text-xs font-bold hover:bg-red-500/10 hover:text-red-500 transition-colors w-full text-left"
        >
          <LogOut size={16} /> Sign Out
        </button>
      </aside>

      {/* MAIN CONTAINER */}
      <main className="flex-1 flex flex-col min-w-0 overflow-y-auto h-screen p-6 md:p-8">
        
        {/* Mobile Header Bar */}
        <div className="flex md:hidden items-center justify-between bg-surface border-b border-border px-4 py-3 sticky top-0 z-30 w-full mb-6 rounded-2xl">
          <AstrixLogo size={24} />
          <div className="flex items-center gap-3">
            <button 
              onClick={toggleTheme} 
              className="p-1.5 rounded-lg border border-border bg-background hover:bg-accent text-text transition-colors"
              aria-label="Toggle theme"
            >
              {theme === 'dark' ? <Sun size={14} className="text-[#d4a017]" /> : <Moon size={14} className="text-secondary" />}
            </button>
            <button 
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-1.5 rounded-lg border border-border bg-background hover:bg-accent text-text transition-colors"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X size={14} /> : <Menu size={14} />}
            </button>
          </div>
        </div>

        {/* HEADER */}
        <header className="flex items-center justify-between border-b border-border/40 pb-4 mb-8">
          <div>
            <h1 className="text-xl font-extrabold tracking-tight">Faculty Management</h1>
            <p className="text-xs text-muted mt-0.5">Academic Session, {currentUser?.name || 'Loading...'}</p>
          </div>
          
          <div className="flex items-center gap-4">
            <button 
              onClick={toggleTheme} 
              className="p-2 rounded-xl border border-border bg-surface hover:bg-accent transition-colors"
              aria-label="Toggle theme"
            >
              {theme === 'dark' ? <Sun size={16} className="text-[#d4a017]" /> : <Moon size={16} className="text-secondary" />}
            </button>
            
            <button 
              onClick={() => setCopilotOpen(!copilotOpen)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-primary/20 bg-primary/5 hover:bg-primary/10 text-primary text-xs font-bold transition-all"
            >
              <Sparkles size={14} className="animate-pulse" /> Ask AI Copilot
            </button>
            <button className="p-2 rounded-xl border border-border bg-surface hover:bg-accent relative transition-colors">
              <Bell size={16} />
            </button>
          </div>
        </header>

        {/* 1. STUDENT DIRECTORY */}
        {activeTab === 'directory' && (
          <div className="space-y-8">
            <div className="grid md:grid-cols-3 gap-8 items-start">
              {/* ID Card Display */}
              <div className="md:col-span-1 flex flex-col items-center">
                <span className="block text-xs font-bold text-muted uppercase tracking-wider mb-4 font-sans">Digital Faculty ID</span>
                <DigitalIdCard 
                  user={{
                    id: currentUser?.id || 'fac-id',
                    name: currentUser?.name || 'Dr. Alan Turing',
                    email: currentUser?.email || 'turing@astrix.edu',
                    role: 'faculty',
                    avatar_url: currentUser?.avatar_url,
                    faculty_id: facultyProfile?.faculty_id,
                  }}
                />
              </div>

              {/* Directory Listing & Profile Edit */}
              <div className="md:col-span-2 space-y-6">
                {/* Profile Edit Form */}
                <div className="p-6 rounded-2xl border border-border bg-surface shadow-sm">
                  <h3 className="font-bold text-base mb-4 flex items-center gap-2"><User size={18} className="text-primary" /> Update Cabin & Profile</h3>
                  <form onSubmit={handleUpdateProfile} className="space-y-4">
                    <div className="grid sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-[10px] font-bold text-muted uppercase tracking-wider mb-1.5">Phone Number</label>
                        <input 
                          type="text" 
                          value={profilePhone}
                          onChange={(e) => setProfilePhone(e.target.value)}
                          className="w-full text-xs p-2.5 border border-border bg-background rounded-xl focus:outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-muted uppercase tracking-wider mb-1.5">Office Cabin Address</label>
                        <input 
                          type="text" 
                          value={profileAddress}
                          onChange={(e) => setProfileAddress(e.target.value)}
                          className="w-full text-xs p-2.5 border border-border bg-background rounded-xl focus:outline-none"
                        />
                      </div>
                    </div>
                    <button 
                      type="submit" 
                      disabled={isUpdatingProfile}
                      className="px-4 py-2 rounded-xl bg-primary text-primary-foreground text-xs font-bold shadow-md flex items-center gap-2 hover:opacity-90"
                    >
                      {isUpdatingProfile ? <Loader2 size={12} className="animate-spin" /> : 'Save Cabin Details'}
                    </button>
                  </form>
                </div>

                <div className="p-6 rounded-2xl border border-border bg-surface shadow-sm space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="font-bold text-base">Students Directory</h3>
                    <div className="relative w-48">
                      <input 
                        type="text" 
                        placeholder="Search student..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full text-xs pl-8 pr-3 py-1.5 border border-border bg-background rounded-lg focus:outline-none"
                      />
                      <Search size={12} className="absolute left-2.5 top-2.5 text-muted" />
                    </div>
                  </div>

                  <div className="border border-border/60 rounded-xl overflow-hidden text-xs">
                    <div className="grid grid-cols-4 bg-background p-3 font-bold border-b border-border text-muted">
                      <span>Name</span>
                      <span>Register No</span>
                      <span>CGPA</span>
                      <span>Contact</span>
                    </div>
                    <div className="max-h-[300px] overflow-y-auto">
                      {filteredStudents.map((s, idx) => (
                        <div key={idx} className="grid grid-cols-4 p-3 border-b border-border/40 hover:bg-accent/30 items-center">
                          <span className="font-bold text-text">{s.name}</span>
                          <span className="font-mono text-muted">{s.register_number}</span>
                          <span className="font-bold text-primary">{s.cgpa}</span>
                          <span className="text-[10px] text-muted truncate">{s.email}</span>
                        </div>
                      ))}
                      {filteredStudents.length === 0 && <p className="p-4 text-center text-muted">No students matching search.</p>}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 1.5. TIMETABLE & SCHEDULE */}
        {activeTab === 'timetable' && (
          <div className="space-y-8 animate-[fadeIn_0.3s_ease-out]">
            <div className="p-6 rounded-2xl border border-border bg-surface shadow-sm">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between border-b border-border/40 pb-4 mb-6 gap-4">
                <div>
                  <h3 className="font-bold text-base flex items-center gap-2">
                    <Clock size={18} className="text-primary animate-pulse" /> Teaching Schedule & Invigilations
                  </h3>
                  <p className="text-xs text-muted mt-0.5">Your official teaching classes and invigilation duties.</p>
                </div>
              </div>

              {/* Weekly Grid */}
              <div className="space-y-6">
                <div>
                  <h4 className="font-bold text-sm text-text mb-3">Weekly Lecture Plan</h4>
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse min-w-[600px]">
                      <thead>
                        <tr className="border-b border-border/60 bg-background/50">
                          <th className="py-3 px-4 text-xs font-bold text-muted uppercase tracking-wider w-32">Day</th>
                          <th className="py-3 px-4 text-xs font-bold text-muted uppercase tracking-wider">09:00 - 10:30</th>
                          <th className="py-3 px-4 text-xs font-bold text-muted uppercase tracking-wider">10:45 - 12:15</th>
                          <th className="py-3 px-4 text-xs font-bold text-muted uppercase tracking-wider">12:15 - 13:30</th>
                          <th className="py-3 px-4 text-xs font-bold text-muted uppercase tracking-wider">13:30 - 15:00</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border/40 text-xs">
                        {(['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'] as const).map((dayName, index) => {
                          const dayNum = index + 1; // 1 = Monday
                          const entriesForDay = timetableEntries.filter(e => e.day_of_week === dayNum && e.type === 'teaching');
                          
                          // Helper to find entry matching slot time
                          const getSlotEntry = (startTime: string) => {
                            return entriesForDay.find(e => e.start_time === startTime);
                          };

                          const slot1 = getSlotEntry('09:00');
                          const slot2 = getSlotEntry('10:45');
                          const slot3 = getSlotEntry('13:30');

                          return (
                            <tr key={dayName} className="hover:bg-accent/20 transition-colors">
                              <td className="py-4 px-4 font-bold text-muted uppercase tracking-wider">{dayName}</td>
                              <td className="py-4 px-4">
                                {slot1 ? (
                                  <div className="p-2.5 bg-primary/10 border border-primary/20 rounded-xl">
                                    <span className="font-bold text-primary block">{slot1.subject_id}</span>
                                    <span className="text-[10px] text-muted-foreground block font-medium">Room: {slot1.room_number}</span>
                                  </div>
                                ) : (
                                  <span className="text-muted/40 italic">No lecture</span>
                                )}
                              </td>
                              <td className="py-4 px-4">
                                {slot2 ? (
                                  <div className="p-2.5 bg-primary/10 border border-primary/20 rounded-xl">
                                    <span className="font-bold text-primary block">{slot2.subject_id}</span>
                                    <span className="text-[10px] text-muted-foreground block font-medium">Room: {slot2.room_number}</span>
                                  </div>
                                ) : (
                                  <span className="text-muted/40 italic">No lecture</span>
                                )}
                              </td>
                              <td className="py-4 px-4 font-semibold text-muted text-center italic bg-background/30 select-none">
                                Lunch Break
                              </td>
                              <td className="py-4 px-4">
                                {slot3 ? (
                                  <div className="p-2.5 bg-primary/10 border border-primary/20 rounded-xl">
                                    <span className="font-bold text-primary block">{slot3.subject_id}</span>
                                    <span className="text-[10px] text-muted-foreground block font-medium">Room: {slot3.room_number}</span>
                                  </div>
                                ) : (
                                  <span className="text-muted/40 italic">No lecture</span>
                                )}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Invigilations */}
                <div className="border-t border-border/40 pt-6">
                  <div className="p-5 border border-border/50 bg-background/20 rounded-2xl">
                    <h4 className="font-bold text-xs uppercase tracking-wider text-muted mb-3 flex items-center gap-1.5"><Briefcase size={14} className="text-secondary" /> Exam Invigilation Slots</h4>
                    <div className="space-y-2.5">
                      {timetableEntries.filter(e => e.type === 'invigilation').map((c, idx) => (
                        <div key={idx} className="p-3 bg-surface border border-border rounded-xl flex items-center justify-between">
                          <div>
                            <span className="font-bold block text-text">Exam: {c.subject_id}</span>
                            <span className="text-[10px] text-muted block">Time: {c.start_time} - {c.end_time} | Venue: Room {c.room_number}</span>
                          </div>
                          <span className="px-2 py-0.5 rounded bg-secondary/10 text-secondary text-[9px] font-bold">Duty Assigned</span>
                        </div>
                      ))}
                      {timetableEntries.filter(e => e.type === 'invigilation').length === 0 && (
                        <p className="text-xs text-muted italic">No invigilations assigned.</p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 2. ATTENDANCE HUB */}
        {activeTab === 'attendance' && (
          <div className="space-y-8">
            <div className="grid md:grid-cols-2 gap-8">
              {/* QR Code Generator */}
              <div className="p-6 rounded-2xl border border-border bg-surface shadow-sm space-y-4">
                <h3 className="font-bold text-base flex items-center gap-2"><QrCode size={18} className="text-primary" /> QR Attendance Generator</h3>
                <p className="text-xs text-muted">Generate a dynamic student attendance check-in token for today's lecture.</p>
                <form onSubmit={handleGenerateQR} className="space-y-4">
                  <div>
                    <label className="block text-[10px] font-bold text-muted uppercase tracking-wider mb-1">Select Subject</label>
                    <select
                      value={qrSubject}
                      onChange={(e) => setQrSubject(e.target.value)}
                      className="w-full text-xs p-2.5 border border-border bg-background rounded-xl"
                    >
                      <option value="">Choose Subject</option>
                      {subjects.map(s => <option key={s.id} value={s.id}>{s.name} ({s.code})</option>)}
                    </select>
                  </div>
                  <button type="submit" className="w-full py-2 bg-primary text-primary-foreground text-xs font-bold rounded-xl shadow-md hover:opacity-90">
                    Generate Attendance QR Token
                  </button>
                </form>

                {qrCodeString && (
                  <div className="flex flex-col items-center border border-border bg-background p-4 rounded-xl space-y-3">
                    <span className="text-[10px] font-bold text-success animate-pulse block">● Active QR Scanning Token</span>
                    <div className="w-36 h-36 bg-white p-2 rounded-lg flex items-center justify-center border">
                      <svg className="w-full h-full" viewBox="0 0 100 100" fill="black" xmlns="http://www.w3.org/2000/svg">
                        <rect x="0" y="0" width="100" height="100" fill="white"/>
                        <rect x="5" y="5" width="20" height="20" fill="black" />
                        <rect x="8" y="8" width="14" height="14" fill="white" />
                        <rect x="75" y="5" width="20" height="20" fill="black" />
                        <rect x="78" y="8" width="14" height="14" fill="white" />
                        <rect x="5" y="75" width="20" height="20" fill="black" />
                        <rect x="8" y="78" width="14" height="14" fill="white" />
                        {/* Mock grid lines */}
                        <rect x="35" y="15" width="30" height="4" fill="black" />
                        <rect x="40" y="30" width="4" height="30" fill="black" />
                        <rect x="55" y="55" width="35" height="4" fill="black" />
                        <rect x="70" y="70" width="4" height="20" fill="black" />
                        <rect x="45" y="45" width="15" height="15" fill="black" />
                      </svg>
                    </div>
                    <span className="text-[9px] font-mono text-muted">{qrCodeString}</span>
                  </div>
                )}
              </div>

              {/* Attendance Log check */}
              <div className="p-6 rounded-2xl border border-border bg-surface shadow-sm space-y-4">
                <h3 className="font-bold text-base">Lecture Log Overview</h3>
                <p className="text-xs text-muted">Recent attendance check-ins logs mapped on databases.</p>
                <div className="space-y-2.5 max-h-80 overflow-y-auto pr-1">
                  {attendanceLogs.slice(0, 10).map((l, i) => (
                    <div key={i} className="text-xs p-3 border border-border/40 bg-background/30 rounded-xl flex items-center justify-between">
                      <div>
                        <span className="font-bold block">Student ID: {l.student_id}</span>
                        <span className="text-[10px] text-muted">Checked in {l.date}</span>
                      </div>
                      <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full ${
                        l.status === 'Present' ? 'bg-success/20 text-success' : 'bg-red-500/20 text-red-500'
                      }`}>{l.status}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 3. GRADING & CALCULATOR */}
        {activeTab === 'grading' && (
          <div className="space-y-8">
            <div className="grid md:grid-cols-2 gap-8">
              {/* Enter Marks Form */}
              <div className="p-6 rounded-2xl border border-border bg-surface shadow-sm space-y-4">
                <h3 className="font-bold text-base flex items-center gap-2"><PlusCircle size={18} className="text-primary" /> Grade and Mark Registry</h3>
                <form onSubmit={handleEnterGrade} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[10px] font-bold text-muted uppercase tracking-wider mb-1">Select Student</label>
                      <select
                        value={selectedStudent}
                        onChange={(e) => setSelectedStudent(e.target.value)}
                        className="w-full text-xs p-2 border border-border bg-background rounded-xl"
                      >
                        <option value="">Choose Student</option>
                        {students.map(s => <option key={s.profile_id} value={s.profile_id}>{s.name}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-muted uppercase tracking-wider mb-1">Select Subject</label>
                      <select
                        value={selectedSubject}
                        onChange={(e) => setSelectedSubject(e.target.value)}
                        className="w-full text-xs p-2 border border-border bg-background rounded-xl"
                      >
                        <option value="">Choose Subject</option>
                        {subjects.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[10px] font-bold text-muted uppercase tracking-wider mb-1">Exam Term</label>
                      <select
                        value={examType}
                        onChange={(e) => setExamType(e.target.value)}
                        className="w-full text-xs p-2 border border-border bg-background rounded-xl"
                      >
                        <option value="Internal-1">Internal Assessment 1</option>
                        <option value="Internal-2">Internal Assessment 2</option>
                        <option value="Model">Model Exams</option>
                        <option value="Semester">Semester Examinations</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-muted uppercase tracking-wider mb-1">Entered Marks (Max 100)</label>
                      <input
                        type="number"
                        min="0"
                        max="100"
                        value={enteredMarks}
                        onChange={(e) => setEnteredMarks(e.target.value)}
                        placeholder="e.g. 88"
                        className="w-full text-xs p-2 border border-border bg-background rounded-xl focus:outline-none"
                      />
                    </div>
                  </div>

                  <button type="submit" className="w-full py-2 bg-primary text-primary-foreground text-xs font-bold rounded-xl shadow-md hover:opacity-90">
                    Record Grade Marks
                  </button>
                </form>
              </div>

              {/* Internal Marks Calculator */}
              <div className="p-6 rounded-2xl border border-border bg-surface shadow-sm space-y-4">
                <h3 className="font-bold text-base flex items-center gap-2"><FileSpreadsheet size={18} className="text-secondary" /> Internal Marks Calculator</h3>
                <p className="text-xs text-muted">Scales and calculates internal assessment grades based on university rules.</p>
                <form onSubmit={calculateInternals} className="space-y-4">
                  <div className="grid grid-cols-3 gap-2">
                    <div>
                      <label className="block text-[9px] font-bold text-muted uppercase tracking-wider mb-1">Quizzes (Max 10)</label>
                      <input 
                        type="number" 
                        max="10" 
                        value={calcQuiz} 
                        onChange={(e) => setCalcQuiz(Number(e.target.value))}
                        className="w-full text-xs p-2 border border-border bg-background rounded-lg"
                      />
                    </div>
                    <div>
                      <label className="block text-[9px] font-bold text-muted uppercase tracking-wider mb-1">Midterm (Max 50)</label>
                      <input 
                        type="number" 
                        max="50" 
                        value={calcMidterm} 
                        onChange={(e) => setCalcMidterm(Number(e.target.value))}
                        className="w-full text-xs p-2 border border-border bg-background rounded-lg"
                      />
                    </div>
                    <div>
                      <label className="block text-[9px] font-bold text-muted uppercase tracking-wider mb-1">Asg (Max 10)</label>
                      <input 
                        type="number" 
                        max="10" 
                        value={calcAssignment} 
                        onChange={(e) => setCalcAssignment(Number(e.target.value))}
                        className="w-full text-xs p-2 border border-border bg-background rounded-lg"
                      />
                    </div>
                  </div>
                  <button type="submit" className="w-full py-2 bg-secondary text-white text-xs font-bold rounded-xl hover:opacity-90">
                    Calculate Scaled Internals
                  </button>
                </form>

                {calcOutcome !== null && (
                  <div className="p-4 bg-background border border-border rounded-xl text-center">
                    <span className="text-[10px] font-bold text-muted uppercase block">Calculated Result (Scale of 60)</span>
                    <span className="text-3xl font-black text-secondary block mt-1">{calcOutcome} / 60</span>
                    <span className="text-[10px] text-success font-semibold mt-1 block">Scaled successfully. Save this to Marks Entry.</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* 4. WATCHLIST & RISKS */}
        {activeTab === 'watchlist' && (
          <div className="space-y-6">
            <div className="p-6 rounded-2xl border border-border bg-surface shadow-sm">
              <h3 className="font-bold text-base mb-1 flex items-center gap-2 text-red-500"><AlertOctagon size={18} /> Student Risk Watchlist</h3>
              <p className="text-xs text-muted mb-4">Highlights students falling below academic CGPA (8.0) or attendance thresholds (75%).</p>

              <div className="space-y-3">
                {riskWatchlist.map((s, idx) => (
                  <div key={idx} className="p-4 border border-red-500/20 bg-red-500/5 rounded-xl flex items-center justify-between">
                    <div>
                      <h4 className="font-bold text-sm text-text">{s.name}</h4>
                      <p className="text-[10px] text-muted">Reg No: {s.register_number} | Semester {s.semester}</p>
                    </div>
                    <div className="text-right">
                      <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-red-500/20 text-red-500 border border-red-500/30">
                        {s.cgpa < 8.0 ? `GPA Risk: ${s.cgpa}` : 'Attendance Alert'}
                      </span>
                    </div>
                  </div>
                ))}
                {riskWatchlist.length === 0 && <p className="text-xs text-muted text-center py-6">All students currently meet academic thresholds.</p>}
              </div>
            </div>
          </div>
        )}

        {/* 5. APPROVALS DESK */}
        {activeTab === 'approvals' && (
          <div className="space-y-8">
            <div className="grid md:grid-cols-2 gap-8">
              {/* Leave Requests Approvals */}
              <div className="p-6 rounded-2xl border border-border bg-surface shadow-sm space-y-4">
                <h3 className="font-bold text-base flex items-center gap-2"><Clock size={18} className="text-primary" /> Leave Requests approvals</h3>
                <div className="space-y-3 max-h-[400px] overflow-y-auto pr-1">
                  {leaves.map((l, idx) => (
                    <div key={idx} className="p-4 border border-border bg-background/50 rounded-xl space-y-2.5">
                      <div className="flex items-start justify-between">
                        <div>
                          <span className="text-[9px] font-bold text-primary block uppercase">{l.leave_type}</span>
                          <span className="text-xs font-bold text-text">Student Profile: {l.student_id}</span>
                        </div>
                        <span className="text-[9px] font-bold text-muted">{new Date(l.requested_at).toLocaleDateString()}</span>
                      </div>
                      <p className="text-xs text-muted-foreground italic">"{l.reason}"</p>
                      <div className="flex gap-2 pt-1.5 border-t border-border/20">
                        <button 
                          onClick={() => handleLeaveDecision(l.id, 'Approved')}
                          className="flex-1 py-1.5 bg-success text-white font-bold rounded-lg text-[10px] hover:opacity-90"
                        >
                          Approve
                        </button>
                        <button 
                          onClick={() => handleLeaveDecision(l.id, 'Rejected')}
                          className="flex-1 py-1.5 bg-red-500 text-white font-bold rounded-lg text-[10px] hover:opacity-90"
                        >
                          Reject
                        </button>
                      </div>
                    </div>
                  ))}
                  {leaves.length === 0 && <p className="text-xs text-muted">No pending leave requests.</p>}
                </div>
              </div>

              {/* Certificate Requests Approvals */}
              <div className="p-6 rounded-2xl border border-border bg-surface shadow-sm space-y-4">
                <h3 className="font-bold text-base flex items-center gap-2"><CheckCircle size={18} className="text-secondary" /> Certificate Requests approvals</h3>
                <div className="space-y-3 max-h-[400px] overflow-y-auto pr-1">
                  {certificates.map((c, idx) => (
                    <div key={idx} className="p-4 border border-border bg-background/50 rounded-xl space-y-2.5">
                      <div className="flex items-start justify-between">
                        <div>
                          <span className="text-[9px] font-bold text-secondary block uppercase">Document Request</span>
                          <span className="text-xs font-bold text-text">{c.certificate_type}</span>
                        </div>
                        <span className="text-[9px] font-bold text-muted">{new Date(c.requested_at).toLocaleDateString()}</span>
                      </div>
                      <div className="flex gap-2 pt-1.5 border-t border-border/20">
                        <button 
                          onClick={() => handleCertDecision(c.id, 'Approved')}
                          className="flex-1 py-1.5 bg-success text-white font-bold rounded-lg text-[10px] hover:opacity-90"
                        >
                          Approve & Generate
                        </button>
                        <button 
                          onClick={() => handleCertDecision(c.id, 'Rejected')}
                          className="flex-1 py-1.5 bg-red-500 text-white font-bold rounded-lg text-[10px] hover:opacity-90"
                        >
                          Reject
                        </button>
                      </div>
                    </div>
                  ))}
                  {certificates.length === 0 && <p className="text-xs text-muted">No pending certificate requests.</p>}
                </div>
              </div>
            </div>
          </div>
        )}

      </main>

      {/* COLLAPSIBLE FACULTY COPILOT PANEL */}
      {copilotOpen && (
        <aside className="w-80 bg-surface border-l border-border flex flex-col h-screen p-4 justify-between z-40 fixed md:static right-0 top-0 shadow-2xl md:shadow-none animate-slideLeft">
          <div className="flex items-center justify-between border-b border-border/40 pb-3">
            <div className="flex items-center gap-1.5">
              <Sparkles size={16} className="text-primary animate-pulse" />
              <span className="font-extrabold text-sm">Faculty Copilot</span>
            </div>
            <button 
              onClick={() => setCopilotOpen(false)}
              className="text-xs text-muted hover:text-text font-bold"
            >
              Close
            </button>
          </div>

          <div className="flex-1 overflow-y-auto py-4 space-y-3 pr-1 text-xs">
            {chatMessages.map((msg, idx) => (
              <div 
                key={idx} 
                className={`p-3 rounded-xl max-w-[85%] leading-relaxed ${
                  msg.role === 'user' 
                    ? 'bg-primary text-primary-foreground ml-auto' 
                    : 'bg-background border border-border'
                }`}
              >
                <span className="whitespace-pre-line font-medium">{msg.content}</span>
              </div>
            ))}
            {isAiLoading && (
              <div className="bg-background border border-border p-3 rounded-xl max-w-[85%] flex items-center gap-2 text-muted">
                <Loader2 size={12} className="animate-spin" /> Fetching model context...
              </div>
            )}
          </div>

          <form onSubmit={handleSendMessage} className="relative mt-2">
            <input
              type="text"
              placeholder="Ask Copilot for text templates..."
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              className="w-full pl-3 pr-10 py-2 border border-border bg-background rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-primary focus:border-transparent"
            />
            <button 
              type="submit" 
              className="absolute right-1.5 top-1.5 p-1 rounded-lg bg-primary text-primary-foreground hover:opacity-90"
              aria-label="Send message"
            >
              <Send size={12} />
            </button>
          </form>
        </aside>
      )}

      {/* Mobile Sidebar Overlay (Drawer) */}
      {mobileMenuOpen && (
        <div className="md:hidden fixed inset-0 z-[100] flex animate-[fadeIn_0.25s_ease-out]">
          {/* Backdrop */}
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setMobileMenuOpen(false)} />
          
          {/* Sidebar Drawer */}
          <div className="relative w-64 max-w-xs bg-surface border-r border-border p-6 flex flex-col justify-between h-full z-50 animate-[slideRight_0.25s_ease-out]">
            <div className="space-y-6">
              <div className="flex items-center justify-between border-b border-border pb-3">
                <AstrixLogo size={26} />
                <button onClick={() => setMobileMenuOpen(false)} className="p-1 rounded-lg border border-border hover:bg-accent text-text">
                  <X size={14} />
                </button>
              </div>
              
              <nav className="space-y-1">
                <button 
                  onClick={() => { setActiveTab('directory'); setMobileMenuOpen(false); }}
                  className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${activeTab === 'directory' ? 'bg-primary text-primary-foreground shadow-md' : 'hover:bg-accent'}`}
                >
                  <Users size={16} /> Student Directory
                </button>
                <button 
                  onClick={() => { setActiveTab('timetable'); setMobileMenuOpen(false); }}
                  className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${activeTab === 'timetable' ? 'bg-primary text-primary-foreground shadow-md' : 'hover:bg-accent'}`}
                >
                  <Clock size={16} /> Timetable & Teaching
                </button>
                <button 
                  onClick={() => { setActiveTab('attendance'); setMobileMenuOpen(false); }}
                  className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${activeTab === 'attendance' ? 'bg-primary text-primary-foreground shadow-md' : 'hover:bg-accent'}`}
                >
                  <Clock size={16} /> Attendance Hub
                </button>
                <button 
                  onClick={() => { setActiveTab('grading'); setMobileMenuOpen(false); }}
                  className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${activeTab === 'grading' ? 'bg-primary text-primary-foreground shadow-md' : 'hover:bg-accent'}`}
                >
                  <BookOpen size={16} /> Grading & Calculator
                </button>
                <button 
                  onClick={() => { setActiveTab('watchlist'); setMobileMenuOpen(false); }}
                  className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${activeTab === 'watchlist' ? 'bg-primary text-primary-foreground shadow-md' : 'hover:bg-accent'}`}
                >
                  <AlertOctagon size={16} /> Risk Watchlist
                </button>
                <button 
                  onClick={() => { setActiveTab('approvals'); setMobileMenuOpen(false); }}
                  className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${activeTab === 'approvals' ? 'bg-primary text-primary-foreground shadow-md' : 'hover:bg-accent'}`}
                >
                  <CheckCircle size={16} /> Approvals Desk
                </button>
              </nav>
            </div>
            
            <button 
              onClick={() => { handleLogout(); setMobileMenuOpen(false); }}
              className="flex items-center gap-3 px-4 py-2 rounded-xl text-xs font-bold hover:bg-red-500/10 hover:text-red-500 transition-colors w-full text-left"
            >
              <LogOut size={16} /> Sign Out
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
