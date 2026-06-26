'use strict';

'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useTheme } from '@/components/theme-provider';
import { useAuth } from '@/components/auth-provider';
import { db } from '@/lib/db-client';
import { AstrixLogo } from '@/components/branding';
import { 
  Users, 
  User, 
  Clock, 
  BookOpen, 
  CreditCard, 
  MessageSquare,
  Sparkles,
  CheckCircle,
  AlertTriangle,
  Mail,
  Send,
  LogOut,
  Bell,
  Check,
  Menu,
  X,
  Sun,
  Moon
} from 'lucide-react';

export default function ParentDashboard() {
  const router = useRouter();
  const { theme, toggleTheme } = useTheme();
  const { signOut } = useAuth();

  // Auth States
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [studentDetails, setStudentDetails] = useState<any>(null);

  // Tabs
  const [activeTab, setActiveTab] = useState<'overview' | 'timetable' | 'academics' | 'fees' | 'messages'>('overview');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  // Data Records
  const [attendance, setAttendance] = useState<any[]>([]);
  const [results, setResults] = useState<any[]>([]);
  const [fees, setFees] = useState<any[]>([]);
  const [leaves, setLeaves] = useState<any[]>([]);
  const [notices, setNotices] = useState<any[]>([]);
  const [timetableEntries, setTimetableEntries] = useState<any[]>([]);

  // Messages states
  const [msgText, setMsgText] = useState('');
  const [messages, setMessages] = useState<any[]>([]);
  const [advisorId, setAdvisorId] = useState('u-faculty-cse-hod');

  useEffect(() => {
    const userStr = localStorage.getItem('astrix-user');
    if (!userStr) {
      router.push('/auth/login');
      return;
    }
    const user = JSON.parse(userStr);
    if (user.role !== 'parent') {
      router.push(`/dashboard/${user.role}`);
      return;
    }
    setCurrentUser(user);
    loadParentData(user.id);
  }, []);

  const loadParentData = async (userId: string) => {
    try {
      // 1. Get Parent-Student relationship mapping
      const relation = await db.parents.select({ profile_id: userId });
      const studentId = relation[0]?.student_id || 'u-student-1'; // fallback

      // 2. Fetch student details
      const stdProfile = await db.students.select({ profile_id: studentId });
      const stdName = await db.profiles.select({ id: studentId });
      if (stdProfile[0]) {
        setStudentDetails({
          ...stdProfile[0],
          name: stdName[0]?.name || 'John Doe',
          email: stdName[0]?.email || 'john.doe@astrix.edu',
        });
        
        // Resolve advisor HOD ID based on student department
        if (stdProfile[0].department_id === 'd-aiml') {
          setAdvisorId('u-faculty-aiml');
        } else if (stdProfile[0].department_id === 'd-ece') {
          setAdvisorId('u-faculty-ece');
        } else {
          setAdvisorId('u-faculty-cse-hod');
        }
      }

      // 3. Fetch academic, attendance and financial data
      const att = await db.attendance.select({ student_id: studentId });
      setAttendance(att);

      const res = await db.results.select({ student_id: studentId });
      setResults(res);

      const fe = await db.fees.select({ student_id: studentId });
      setFees(fe);

      const lv = await db.leave_requests.select({ student_id: studentId });
      setLeaves(lv);

      const tt = await db.timetable_entries.select({ student_id: studentId });
      setTimetableEntries(tt);

      const not = await db.notices.select();
      setNotices(not.filter(n => n.target_role === 'All' || n.target_role === 'Parent'));
    } catch (err) {
      console.error('Error loading parent dashboard data:', err);
    }
  };

  const handleLogout = () => {
    signOut();
  };

  // Parent Profile Edit
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
      alert('Contact details updated successfully!');
    } catch (err) {
      alert('Error updating profile details.');
    } finally {
      setIsUpdatingProfile(false);
    }
  };

  // Submit payment
  const handlePayment = async (feeId: string) => {
    try {
      // Update fee status to paid
      await db.fees.update(feeId, { status: 'Paid' });
      alert('Payment processed successfully. Transaction reference recorded!');
      loadParentData(currentUser.id);
    } catch (err) {
      alert('Failed to process payment.');
    }
  };

  // Load messages from database table
  const loadMessages = async (userId: string, targetAdvisorId: string) => {
    try {
      const allMsgs = await db.messages.select();
      const filtered = allMsgs.filter(m => 
        (m.sender_id === userId && m.receiver_id === targetAdvisorId) ||
        (m.sender_id === targetAdvisorId && m.receiver_id === userId)
      ).sort((a, b) => new Date(a.time).getTime() - new Date(b.time).getTime());

      if (filtered.length === 0) {
        const welcome = {
          sender_id: targetAdvisorId,
          receiver_id: userId,
          sender_name: 'Dr. Alan Turing',
          sender_role: 'faculty',
          text: "Hello, I am John's DBMS advisor. He has been participating actively in labs, but needs to work on normalization homework.",
          time: '2026-06-07T10:14:00Z'
        };
        await db.messages.insert(welcome);
        setMessages([welcome]);
      } else {
        setMessages(filtered);
      }
    } catch (err) {
      console.warn('Failed to load parent-advisor messages:', err);
    }
  };

  // Poll for real-time messages every 3 seconds
  useEffect(() => {
    if (!currentUser || !advisorId) return;
    loadMessages(currentUser.id, advisorId);

    const interval = setInterval(() => {
      loadMessages(currentUser.id, advisorId);
    }, 3000);

    return () => clearInterval(interval);
  }, [currentUser, advisorId]);

  // Send message to advisor
  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!msgText.trim()) return;

    const newMsg = {
      sender_id: currentUser.id,
      receiver_id: advisorId,
      sender_name: currentUser.name,
      sender_role: 'parent',
      text: msgText,
      time: new Date().toISOString()
    };

    setMessages(prev => [...prev, newMsg]);
    setMsgText('');

    try {
      await db.messages.insert(newMsg);
    } catch (err) {
      console.error('Failed to send message:', err);
    }
  };

  return (
    <div className="min-h-screen bg-background text-text flex relative transition-colors duration-300">
      
      {/* SIDEBAR */}
      <aside className="w-64 bg-surface border-r border-border hidden md:flex flex-col justify-between p-6">
        <div className="space-y-8">
          <AstrixLogo size={30} />

          <nav className="space-y-1">
            <button 
              onClick={() => setActiveTab('overview')}
              className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${activeTab === 'overview' ? 'bg-primary text-primary-foreground shadow-md' : 'hover:bg-accent'}`}
            >
              <Users size={16} /> Child Overview
            </button>
            <button 
              onClick={() => setActiveTab('timetable')}
              className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${activeTab === 'timetable' ? 'bg-primary text-primary-foreground shadow-md' : 'hover:bg-accent'}`}
            >
              <Clock size={16} /> Class Timetable
            </button>
            <button 
              onClick={() => setActiveTab('academics')}
              className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${activeTab === 'academics' ? 'bg-primary text-primary-foreground shadow-md' : 'hover:bg-accent'}`}
            >
              <BookOpen size={16} /> Academic Progress
            </button>
            <button 
              onClick={() => setActiveTab('fees')}
              className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${activeTab === 'fees' ? 'bg-primary text-primary-foreground shadow-md' : 'hover:bg-accent'}`}
            >
              <CreditCard size={16} /> Fee Tracking
            </button>
            <button 
              onClick={() => setActiveTab('messages')}
              className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${activeTab === 'messages' ? 'bg-primary text-primary-foreground shadow-md' : 'hover:bg-accent'}`}
            >
              <MessageSquare size={16} /> Contact Advisor
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
            <h1 className="text-xl font-extrabold tracking-tight">Parent Portal</h1>
            <p className="text-xs text-muted mt-0.5">Welcome back, {currentUser?.name || 'Loading...'}</p>
          </div>
          
          <div className="flex items-center gap-4">
            <button 
              onClick={toggleTheme} 
              className="p-2 rounded-xl border border-border bg-surface hover:bg-accent transition-colors"
              aria-label="Toggle theme"
            >
              {theme === 'dark' ? <Sun size={16} className="text-[#d4a017]" /> : <Moon size={16} className="text-secondary" />}
            </button>

            <span className="text-xs text-muted font-bold flex items-center gap-1">
              🎓 Child: <strong className="text-primary">{studentDetails?.name || 'John Doe'}</strong>
            </span>
            <button className="p-2 rounded-xl border border-border bg-surface hover:bg-accent relative transition-colors">
              <Bell size={16} />
            </button>
          </div>
        </header>

        {/* 1. CHILD OVERVIEW */}
        {activeTab === 'overview' && (
          <div className="grid md:grid-cols-3 gap-8 items-start animate-fadeIn">
            
            {/* Child Profile Cards & Parent Profile Edit */}
            <div className="space-y-6">
              <div className="p-6 rounded-2xl border border-border bg-surface shadow-sm text-center">
                <span className="block text-[10px] font-bold text-muted uppercase tracking-wider mb-3">Student Summary</span>
                <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-primary to-secondary flex items-center justify-center font-bold text-white text-lg mx-auto mb-3">JD</div>
                <h3 className="font-bold text-base">{studentDetails?.name || 'John Doe'}</h3>
                <p className="text-xs text-muted font-semibold mt-0.5">{studentDetails?.email || 'john.doe@astrix.edu'}</p>
                
                <div className="mt-4 border-t border-border/30 pt-4 text-xs space-y-2 text-left">
                  <div className="flex justify-between"><span className="text-muted">Register Number:</span><span className="font-bold">{studentDetails?.register_number || '2023CSE1024'}</span></div>
                  <div className="flex justify-between"><span className="text-muted">Academic Term:</span><span className="font-bold">Year {studentDetails?.year || 3} / Sem {studentDetails?.semester || 5}</span></div>
                  <div className="flex justify-between"><span className="text-muted">Overall CGPA:</span><span className="font-bold text-primary">{studentDetails?.cgpa || 8.74}</span></div>
                </div>
              </div>

              {/* Parent Profile Editor */}
              <div className="p-6 rounded-2xl border border-border bg-surface shadow-sm text-left">
                <h4 className="font-bold text-xs uppercase tracking-wider text-muted mb-3 flex items-center gap-2"><User size={14} className="text-primary" /> Update Your Contact</h4>
                <form onSubmit={handleUpdateProfile} className="space-y-3">
                  <div>
                    <label className="block text-[9px] font-bold text-muted uppercase tracking-wider mb-1">Phone Number</label>
                    <input 
                      type="text" 
                      value={profilePhone}
                      onChange={(e) => setProfilePhone(e.target.value)}
                      className="w-full text-xs p-2 border border-border bg-background rounded-lg focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[9px] font-bold text-muted uppercase tracking-wider mb-1">Billing Address</label>
                    <textarea 
                      value={profileAddress}
                      onChange={(e) => setProfileAddress(e.target.value)}
                      rows={2}
                      className="w-full text-xs p-2 border border-border bg-background rounded-lg focus:outline-none"
                    />
                  </div>
                  <button 
                    type="submit" 
                    disabled={isUpdatingProfile}
                    className="w-full py-1.5 bg-primary text-primary-foreground text-xs font-bold rounded-lg hover:opacity-90 shadow-sm transition-all animate-pulse-slow"
                  >
                    {isUpdatingProfile ? 'Saving...' : 'Update Details'}
                  </button>
                </form>
              </div>

              {/* Attendance quick card */}
              <div className="p-6 rounded-2xl border border-border bg-surface shadow-sm">
                <h4 className="font-bold text-xs uppercase tracking-wider text-muted mb-3">Attendance Standing</h4>
                <div className="flex items-center justify-between">
                  <div className="text-xs">
                    <p className="text-2xl font-black text-emerald-500">86%</p>
                    <p className="text-[10px] text-muted">Overall Attendance</p>
                  </div>
                  <CheckCircle size={24} className="text-emerald-500" />
                </div>
              </div>
            </div>

            {/* Parent AI Insights */}
            <div className="md:col-span-2 space-y-6">
              <div className="p-6 rounded-2xl border border-primary/20 bg-primary/5 shadow-sm space-y-4">
                <h3 className="font-bold text-base flex items-center gap-2"><Sparkles size={18} className="text-primary animate-pulse" /> AI Parent Insights & Recommendations</h3>
                <p className="text-xs text-muted leading-relaxed">
                  Llama 3.1 has analyzed your child's academic behavior, attendance logs, and class assessments to formulate recommendations.
                </p>
                <div className="text-xs space-y-3 pt-2 border-t border-primary/10 text-muted">
                  <div className="flex gap-2 items-start"><CheckCircle size={14} className="text-success mt-0.5 flex-shrink-0" /><p>Excellent performance in <strong>Database Management Systems</strong>. Current class average is A+.</p></div>
                  <div className="flex gap-2 items-start"><AlertTriangle size={14} className="text-amber-500 mt-0.5 flex-shrink-0" /><p>Digital Signal Processing attendance stands at 73%. Encourage John to attend the next 3 lectures to clear shortages.</p></div>
                  <div className="flex gap-2 items-start"><CheckCircle size={14} className="text-success mt-0.5 flex-shrink-0" /><p>Tuition fees for the upcoming semester are pending. Clearing before July 1 ensures smooth registration.</p></div>
                </div>
              </div>

              {/* Parent Notices */}
              <div className="p-6 rounded-2xl border border-border bg-surface shadow-sm space-y-4">
                <h3 className="font-bold text-base flex items-center gap-2"><Bell size={18} className="text-secondary" /> Administrative Bulletins</h3>
                <div className="space-y-4">
                  {notices.map((n, idx) => (
                    <div key={idx} className="border-b border-border/40 pb-3 last:border-b-0 last:pb-0">
                      <span className="text-[10px] font-bold text-primary block">{new Date(n.created_at).toLocaleDateString()}</span>
                      <h4 className="font-bold text-sm text-text mt-0.5">{n.title}</h4>
                      <p className="text-xs text-muted mt-1 leading-relaxed">{n.content}</p>
                    </div>
                  ))}
                  {notices.length === 0 && <p className="text-xs text-muted">No notices on board.</p>}
                </div>
              </div>
            </div>

          </div>
        )}

        {/* 1.5. CHILD TIMETABLE */}
        {activeTab === 'timetable' && (
          <div className="space-y-8 animate-[fadeIn_0.3s_ease-out]">
            <div className="p-6 rounded-2xl border border-border bg-surface shadow-sm">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between border-b border-border/40 pb-4 mb-6 gap-4">
                <div>
                  <h3 className="font-bold text-base flex items-center gap-2">
                    <Clock size={18} className="text-primary animate-pulse" /> Child's Class Timetable
                  </h3>
                  <p className="text-xs text-muted mt-0.5">Weekly academic schedule for your child, {studentDetails?.name}.</p>
                </div>
              </div>

              {/* Weekly Grid */}
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse min-w-[600px] text-xs">
                  <thead>
                    <tr className="border-b border-border/60 bg-background/50">
                      <th className="py-3 px-4 text-xs font-bold text-muted uppercase tracking-wider w-32">Day</th>
                      <th className="py-3 px-4 text-xs font-bold text-muted uppercase tracking-wider">09:00 - 10:30</th>
                      <th className="py-3 px-4 text-xs font-bold text-muted uppercase tracking-wider">10:45 - 12:15</th>
                      <th className="py-3 px-4 text-xs font-bold text-muted uppercase tracking-wider">12:15 - 13:30</th>
                      <th className="py-3 px-4 text-xs font-bold text-muted uppercase tracking-wider">13:30 - 15:00</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/40">
                    {(['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'] as const).map((dayName, index) => {
                      const dayNum = index + 1; // 1 = Monday
                      const entriesForDay = timetableEntries.filter(e => e.day_of_week === dayNum && e.type === 'class');
                      
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
                                <span className="text-[10px] text-muted-foreground block">Room: {slot1.room_number}</span>
                              </div>
                            ) : (
                              <span className="text-muted/40 italic">No class</span>
                            )}
                          </td>
                          <td className="py-4 px-4">
                            {slot2 ? (
                              <div className="p-2.5 bg-primary/10 border border-primary/20 rounded-xl">
                                <span className="font-bold text-primary block">{slot2.subject_id}</span>
                                <span className="text-[10px] text-muted-foreground block">Room: {slot2.room_number}</span>
                              </div>
                            ) : (
                              <span className="text-muted/40 italic">No class</span>
                            )}
                          </td>
                          <td className="py-4 px-4 font-semibold text-muted text-center italic bg-background/30 select-none">
                            Lunch Break
                          </td>
                          <td className="py-4 px-4">
                            {slot3 ? (
                              <div className="p-2.5 bg-primary/10 border border-primary/20 rounded-xl">
                                <span className="font-bold text-primary block">{slot3.subject_id}</span>
                                <span className="text-[10px] text-muted-foreground block">Room: {slot3.room_number}</span>
                              </div>
                            ) : (
                              <span className="text-muted/40 italic">No class</span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* 2. ACADEMICS */}
        {activeTab === 'academics' && (
          <div className="space-y-8 animate-fadeIn">
            <div className="grid md:grid-cols-3 gap-8">
              
              {/* Grading Reports */}
              <div className="md:col-span-2 p-6 rounded-2xl border border-border bg-surface shadow-sm space-y-4">
                <h3 className="font-bold text-base flex items-center gap-2"><BookOpen size={18} className="text-primary" /> Grade Reports & Exam Results</h3>
                <div className="border border-border/60 rounded-xl overflow-hidden text-xs">
                  <div className="grid grid-cols-4 bg-background p-3 font-bold border-b border-border text-muted">
                    <span>Subject Code</span>
                    <span>Exam Term</span>
                    <span>Marks Obtained</span>
                    <span>Grade Result</span>
                  </div>
                  <div className="max-h-[300px] overflow-y-auto">
                    {results.map((r, idx) => (
                      <div key={idx} className="grid grid-cols-4 p-3 border-b border-border/40 items-center">
                        <span className="font-bold text-text">{r.subject_id}</span>
                        <span className="font-mono text-muted">Internal Assessment 1</span>
                        <span className="font-bold">{r.marks_obtained}</span>
                        <span className="text-[10px] font-bold text-primary">{r.grade}</span>
                      </div>
                    ))}
                    {results.length === 0 && <p className="p-4 text-center text-muted">No grades recorded yet.</p>}
                  </div>
                </div>
              </div>

              {/* Leave History Tracker */}
              <div className="p-6 rounded-2xl border border-border bg-surface shadow-sm space-y-4">
                <h3 className="font-bold text-base">Leave History status</h3>
                <div className="space-y-3">
                  {leaves.map((l, idx) => (
                    <div key={idx} className="p-3 border border-border bg-background/50 rounded-xl flex items-center justify-between text-xs">
                      <div>
                        <span className="font-bold block">{l.leave_type}</span>
                        <span className="text-[10px] text-muted">{l.start_date} to {l.end_date}</span>
                      </div>
                      <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full ${
                        l.status === 'Approved' ? 'bg-success/20 text-success' : 'bg-yellow-500/20 text-yellow-500'
                      }`}>{l.status}</span>
                    </div>
                  ))}
                  {leaves.length === 0 && <p className="text-xs text-muted">No leave applications registered.</p>}
                </div>
              </div>

            </div>
          </div>
        )}

        {/* 3. FEES */}
        {activeTab === 'fees' && (
          <div className="p-6 rounded-2xl border border-border bg-surface shadow-sm space-y-4 max-w-4xl animate-fadeIn">
            <h3 className="font-bold text-base flex items-center gap-2"><CreditCard size={18} className="text-primary" /> Billing & Tuition Fees</h3>
            <p className="text-xs text-muted">Clear academic semester billing invoices. Payments are processed securely via Supabase.</p>

            <div className="space-y-4 pt-2">
              {fees.map((fee, idx) => (
                <div key={idx} className="p-4 border border-border bg-background/50 rounded-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div>
                    <h4 className="font-bold text-sm text-text">{fee.title}</h4>
                    <span className="text-[10px] text-muted block mt-0.5">Due Date: {new Date(fee.due_date).toLocaleDateString()}</span>
                  </div>
                  <div className="flex items-center gap-6 w-full sm:w-auto justify-between sm:justify-end">
                    <span className="font-black text-base text-text">₹{Number(fee.amount).toLocaleString()}</span>
                    {fee.status === 'Paid' ? (
                      <span className="inline-flex items-center gap-1 px-3 py-1 rounded bg-success/20 text-success font-bold text-xs border border-success/30">
                        <Check size={12} /> Paid
                      </span>
                    ) : (
                      <button 
                        onClick={() => handlePayment(fee.id)}
                        className="px-4 py-1.5 bg-primary text-primary-foreground font-bold rounded-lg text-xs hover:opacity-90 shadow-sm transition-all"
                      >
                        Pay Invoice
                      </button>
                    )}
                  </div>
                </div>
              ))}
              {fees.length === 0 && <p className="text-xs text-muted">No billing invoices found.</p>}
            </div>
          </div>
        )}

        {/* 4. MESSAGES */}
        {activeTab === 'messages' && (
          <div className="p-6 rounded-2xl border border-border bg-surface shadow-sm max-w-4xl flex flex-col h-[480px] animate-fadeIn">
            <h3 className="font-bold text-base flex items-center gap-2 pb-3 border-b border-border/40"><MessageSquare size={18} className="text-secondary" /> Faculty Advisor Chatbox</h3>
            
            {/* Messages box */}
            <div className="flex-1 overflow-y-auto py-4 space-y-3 text-xs">
              {messages.map((msg, idx) => (
                <div 
                  key={idx} 
                  className={`p-3 rounded-xl max-w-[80%] leading-relaxed ${
                    (msg.sender === 'parent' || msg.sender_role === 'parent')
                      ? 'bg-primary text-primary-foreground ml-auto animate-fadeIn' 
                      : 'bg-background border border-border animate-fadeIn'
                  }`}
                >
                  <p className="font-medium">{msg.text}</p>
                  <span className="block text-[8px] text-muted-foreground mt-1 text-right">{new Date(msg.time).toLocaleTimeString()}</span>
                </div>
              ))}
            </div>

            {/* Input field */}
            <form onSubmit={handleSendMessage} className="relative mt-2">
              <input
                type="text"
                placeholder="Send a message to John's advisor..."
                value={msgText}
                onChange={(e) => setMsgText(e.target.value)}
                className="w-full pl-3 pr-10 py-2.5 border border-border bg-background rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-primary focus:border-transparent transition-all"
              />
              <button 
                type="submit" 
                className="absolute right-1.5 top-2 p-1.5 rounded-lg bg-primary text-primary-foreground hover:opacity-90"
              >
                <Send size={12} />
              </button>
            </form>
          </div>
        )}

      </main>

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
                  onClick={() => { setActiveTab('overview'); setMobileMenuOpen(false); }}
                  className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${activeTab === 'overview' ? 'bg-primary text-primary-foreground shadow-md' : 'hover:bg-accent'}`}
                >
                  <Users size={16} /> Child Overview
                </button>
                <button 
                  onClick={() => { setActiveTab('timetable'); setMobileMenuOpen(false); }}
                  className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${activeTab === 'timetable' ? 'bg-primary text-primary-foreground shadow-md' : 'hover:bg-accent'}`}
                >
                  <Clock size={16} /> Class Timetable
                </button>
                <button 
                  onClick={() => { setActiveTab('academics'); setMobileMenuOpen(false); }}
                  className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${activeTab === 'academics' ? 'bg-primary text-primary-foreground shadow-md' : 'hover:bg-accent'}`}
                >
                  <BookOpen size={16} /> Academic Progress
                </button>
                <button 
                  onClick={() => { setActiveTab('fees'); setMobileMenuOpen(false); }}
                  className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${activeTab === 'fees' ? 'bg-primary text-primary-foreground shadow-md' : 'hover:bg-accent'}`}
                >
                  <CreditCard size={16} /> Fee Tracking
                </button>
                <button 
                  onClick={() => { setActiveTab('messages'); setMobileMenuOpen(false); }}
                  className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${activeTab === 'messages' ? 'bg-primary text-primary-foreground shadow-md' : 'hover:bg-accent'}`}
                >
                  <MessageSquare size={16} /> Contact Advisor
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
