'use strict';

'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useTheme } from '@/components/theme-provider';
import { db } from '@/lib/db-client';
import { AstrixLogo } from '@/components/branding';
import { 
  ShieldCheck, 
  UserPlus, 
  Users, 
  Building2, 
  Calendar, 
  FileText, 
  Settings, 
  Activity, 
  Download, 
  Upload, 
  Trash, 
  Plus, 
  LogOut,
  GraduationCap,
  Briefcase,
  Layers,
  Bell,
  RefreshCw,
  Loader2,
  Menu,
  X,
  Sun,
  Moon
} from 'lucide-react';

export default function AdminDashboard() {
  const router = useRouter();
  const { theme, toggleTheme } = useTheme();

  // Auth
  const [currentUser, setCurrentUser] = useState<any>(null);

  // Tab views
  const [activeTab, setActiveTab] = useState<'analytics' | 'timetable' | 'users' | 'csv' | 'governance' | 'notices' | 'audit'>('analytics');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  // Data Records
  const [profiles, setProfiles] = useState<any[]>([]);
  const [students, setStudents] = useState<any[]>([]);
  const [faculty, setFaculty] = useState<any[]>([]);
  const [departments, setDepartments] = useState<any[]>([]);
  const [notices, setNotices] = useState<any[]>([]);
  const [events, setEvents] = useState<any[]>([]);
  const [auditLogs, setAuditLogs] = useState<any[]>([]);
  const [subjects, setSubjects] = useState<any[]>([]);
  
  // Timetables CRUD states
  const [timetableList, setTimetableList] = useState<any[]>([]);
  const [timetableEntries, setTimetableEntries] = useState<any[]>([]);
  
  // Create Timetable Form
  const [newTtName, setNewTtName] = useState('');
  const [isCreatingTt, setIsCreatingTt] = useState(false);

  // Create/Edit Timetable Entry Form
  const [selectedTimetableId, setSelectedTimetableId] = useState('');
  const [entryDay, setEntryDay] = useState(1);
  const [entryStartTime, setEntryStartTime] = useState('09:00');
  const [entryEndTime, setEntryEndTime] = useState('10:30');
  const [entrySubject, setEntrySubject] = useState('');
  const [entryRoom, setEntryRoom] = useState('');
  const [entryType, setEntryType] = useState<'class' | 'teaching' | 'invigilation' | 'exam'>('class');
  const [entryStudentId, setEntryStudentId] = useState('');
  const [entryFacultyId, setEntryFacultyId] = useState('');
  const [isCreatingEntry, setIsCreatingEntry] = useState(false);

  // Admin profile edit state
  const [profilePhone, setProfilePhone] = useState('');
  const [profileAddress, setProfileAddress] = useState('');
  const [isUpdatingProfile, setIsUpdatingProfile] = useState(false);
  
  // Create User Form
  const [newUserName, setNewUserName] = useState('');
  const [newUserEmail, setNewUserEmail] = useState('');
  const [newUserRole, setNewUserRole] = useState<'student' | 'faculty' | 'parent' | 'admin'>('student');
  const [isCreatingUser, setIsCreatingUser] = useState(false);

  // CSV Import state
  const [csvContent, setCsvContent] = useState('');
  const [isImporting, setIsImporting] = useState(false);

  // System Settings state
  const [academicYear, setAcademicYear] = useState('2025-2026');
  const [semesterType, setSemesterType] = useState('Odd Semester');
  const [isReseeding, setIsReseeding] = useState(false);

  // Publish Board forms
  const [noticeTitle, setNoticeTitle] = useState('');
  const [noticeTarget, setNoticeTarget] = useState<'All' | 'Student' | 'Faculty' | 'Parent'>('All');
  const [noticeBody, setNoticeBody] = useState('');
  
  const [eventTitle, setEventTitle] = useState('');
  const [eventLocation, setEventLocation] = useState('');
  const [eventDate, setEventDate] = useState('');
  const [eventDesc, setEventDesc] = useState('');

  useEffect(() => {
    const userStr = localStorage.getItem('astrix-user');
    if (!userStr) {
      router.push('/auth/login');
      return;
    }
    const user = JSON.parse(userStr);
    if (user.role !== 'admin') {
      router.push(`/dashboard/${user.role}`);
      return;
    }
    setCurrentUser(user);
    loadAdminData();
  }, []);

  const loadAdminData = async () => {
    try {
      const profs = await db.profiles.select();
      setProfiles(profs);

      const studs = await db.students.select();
      setStudents(studs);

      const facs = await db.faculty.select();
      setFaculty(facs);

      const depts = await db.departments.select();
      setDepartments(depts);

      const nots = await db.notices.select();
      setNotices(nots);

      const evs = await db.events.select();
      setEvents(evs);

      const logs = await db.audit_logs.select();
      setAuditLogs(logs);

      const subs = await db.subjects.select();
      setSubjects(subs);

      const timetables = await db.timetables.select();
      setTimetableList(timetables);

      const entries = await db.timetable_entries.select();
      setTimetableEntries(entries);
    } catch (err) {
      console.error('Error loading admin dashboard data:', err);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('astrix-user');
    router.push('/auth/login');
  };

  // Profile update handler
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
      alert('Admin contact updated successfully!');
    } catch (err) {
      alert('Error updating contact details.');
    } finally {
      setIsUpdatingProfile(false);
    }
  };

  // Timetables CRUD handlers
  const handleCreateTimetable = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTtName.trim()) return;
    setIsCreatingTt(true);
    try {
      await db.timetables.insert({
        name: newTtName,
        semester_id: 'sem-active',
        is_active: true
      });
      alert('Timetable created successfully!');
      setNewTtName('');
      loadAdminData();
    } catch (err) {
      alert('Failed to create timetable.');
    } finally {
      setIsCreatingTt(false);
    }
  };

  const handleCreateEntry = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTimetableId || !entrySubject || !entryRoom) {
      alert('Timetable, Subject, and Room are required.');
      return;
    }
    setIsCreatingEntry(true);
    try {
      await db.timetable_entries.insert({
        timetable_id: selectedTimetableId,
        day_of_week: Number(entryDay),
        start_time: entryStartTime,
        end_time: entryEndTime,
        subject_id: entrySubject,
        room_number: entryRoom,
        type: entryType,
        student_id: entryType === 'class' ? entryStudentId || undefined : undefined,
        faculty_id: (entryType === 'teaching' || entryType === 'invigilation' || entryType === 'class') ? entryFacultyId || undefined : undefined
      });
      alert('Timetable entry added successfully!');
      loadAdminData();
    } catch (err) {
      alert('Failed to add timetable entry.');
    } finally {
      setIsCreatingEntry(false);
    }
  };

  const handleDeleteEntry = async (entryId: string) => {
    if (!confirm('Are you sure you want to delete this timetable entry?')) return;
    try {
      await db.timetable_entries.delete(entryId);
      alert('Entry deleted successfully.');
      loadAdminData();
    } catch (err) {
      alert('Failed to delete entry.');
    }
  };

  // Add User CRUD
  const handleAddUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUserName || !newUserEmail) return;
    setIsCreatingUser(true);

    try {
      // 1. Insert Profile
      const profile = await db.profiles.insert({
        name: newUserName,
        email: newUserEmail,
        role: newUserRole,
      });

      // 2. Insert role-specific record
      if (newUserRole === 'student') {
        await db.students.insert({
          profile_id: profile.id,
          register_number: `REG${Math.floor(100000 + Math.random() * 900000)}`,
          department_id: departments[0]?.id || 'd-cse',
          year: 1,
          semester: 1,
          cgpa: 0.00
        });
      } else if (newUserRole === 'faculty') {
        await db.faculty.insert({
          profile_id: profile.id,
          faculty_id: `FAC-${Math.floor(1000 + Math.random() * 9000)}`,
          department_id: departments[0]?.id || 'd-cse',
          designation: 'Lecturer'
        });
      }

      // Log action
      await db.audit_logs.insert({
        user_id: currentUser.id,
        table_name: 'profiles',
        action: 'INSERT',
        new_data: profile
      });

      alert(`Account for ${newUserName} successfully created!`);
      setNewUserName('');
      setNewUserEmail('');
      loadAdminData();
    } catch (err) {
      alert('Failed to create account.');
    } finally {
      setIsCreatingUser(false);
    }
  };

  // Delete User CRUD
  const handleDeleteUser = async (profileId: string) => {
    if (!confirm('Are you sure you want to delete this user?')) return;
    try {
      await db.profiles.delete(profileId);
      
      // Log action
      await db.audit_logs.insert({
        user_id: currentUser.id,
        table_name: 'profiles',
        action: 'DELETE',
        old_data: { id: profileId }
      });

      alert('User deleted successfully.');
      loadAdminData();
    } catch (err) {
      alert('Failed to delete user.');
    }
  };

  // Assign HOD to Department
  const handleAssignHOD = async (deptId: string, facultyId: string) => {
    try {
      await db.departments.update(deptId, { hod_id: facultyId });
      
      await db.audit_logs.insert({
        user_id: currentUser.id,
        table_name: 'departments',
        action: 'UPDATE_HOD',
        new_data: { id: deptId, hod_id: facultyId }
      });

      alert('HOD assigned successfully!');
      loadAdminData();
    } catch (err) {
      alert('Failed to assign HOD.');
    }
  };

  // Promote Semester
  const handlePromoteSemester = async () => {
    if (!confirm('Warning! This will promote all active students by 1 semester. Proceed?')) return;
    try {
      for (const s of students) {
        let nextSemester = s.semester + 1;
        let nextYear = s.year;
        
        // Semester boundaries (max semester 8, year 4)
        if (nextSemester > 8) {
          nextSemester = 8; // Max reached, ready for graduation
        } else {
          nextYear = Math.ceil(nextSemester / 2);
        }

        await db.students.update(s.profile_id, {
          semester: nextSemester,
          year: nextYear
        });
      }

      await db.audit_logs.insert({
        user_id: currentUser.id,
        table_name: 'students',
        action: 'SEMESTER_PROMOTION',
        new_data: { count: students.length }
      });

      alert('All students promoted successfully!');
      loadAdminData();
    } catch (err) {
      alert('Failed to execute semester promotion.');
    }
  };

  // Bulk CSV Import parser
  const handleCsvImport = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!csvContent.trim()) return;
    setIsImporting(true);

    try {
      const rows = csvContent.split('\n');
      let importCount = 0;
      
      // Expected CSV format: Name, Email, RegisterNumber
      for (const row of rows) {
        const columns = row.split(',');
        if (columns.length < 3) continue;
        
        const name = columns[0].trim();
        const email = columns[1].trim();
        const regNo = columns[2].trim();

        if (name && email && regNo) {
          const profile = await db.profiles.insert({
            name,
            email,
            role: 'student'
          });

          await db.students.insert({
            profile_id: profile.id,
            register_number: regNo,
            department_id: departments[0]?.id || 'd-cse',
            year: 1,
            semester: 1,
            cgpa: 0.00
          });
          importCount++;
        }
      }

      await db.audit_logs.insert({
        user_id: currentUser.id,
        table_name: 'profiles',
        action: 'BULK_CSV_IMPORT',
        new_data: { count: importCount }
      });

      alert(`Successfully imported ${importCount} students!`);
      setCsvContent('');
      loadAdminData();
    } catch (err) {
      alert('CSV import encountered errors. Check column formats.');
    } finally {
      setIsImporting(false);
    }
  };

  // CSV Export simulator
  const handleCsvExport = () => {
    const header = "Name,Email,RegisterNumber,Year,Semester,CGPA\n";
    const rows = students.map(s => `"${s.name}","${s.email}","${s.register_number}",${s.year},${s.semester},${s.cgpa}`).join('\n');
    const blob = new Blob([header + rows], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'astrix_students_export.csv';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  // Publish Notice
  const handlePublishNotice = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!noticeTitle || !noticeBody) return;
    try {
      await db.notices.insert({
        title: noticeTitle,
        content: noticeBody,
        target_role: noticeTarget,
        created_by: currentUser.id
      });
      alert('Notice published!');
      setNoticeTitle('');
      setNoticeBody('');
      loadAdminData();
    } catch (err) {
      alert('Failed to publish notice.');
    }
  };

  // Publish Event
  const handlePublishEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!eventTitle || !eventLocation || !eventDate) return;
    try {
      await db.events.insert({
        title: eventTitle,
        description: eventDesc,
        location: eventLocation,
        date: new Date(eventDate).toISOString(),
        organizer_id: currentUser.id
      });
      alert('Event published!');
      setEventTitle('');
      setEventLocation('');
      setEventDate('');
      setEventDesc('');
      loadAdminData();
    } catch (err) {
      alert('Failed to publish event.');
    }
  };

  // Reset database DDL/DML seeder
  const handleResetDatabase = async () => {
    if (!confirm('Warning! This will erase and rebuild the database back to default seed records. Proceed?')) return;
    setIsReseeding(true);
    try {
      const response = await fetch('/api/admin/seed', { method: 'POST' });
      const data = await response.json();
      if (data.status === 'success') {
        alert('Database successfully reset and reseeded!');
        loadAdminData();
      } else {
        alert('Reset failed.');
      }
    } catch (err) {
      alert('Reset failed.');
    } finally {
      setIsReseeding(false);
    }
  };

  // Computed metrics
  const totalStudents = students.length;
  const totalFaculty = faculty.length;
  const totalDepartments = departments.length;

  return (
    <div className="min-h-screen bg-background text-text flex relative transition-colors duration-300">
      
      {/* SIDEBAR */}
      <aside className="w-64 bg-surface border-r border-border hidden md:flex flex-col justify-between p-6">
        <div className="space-y-8">
          <AstrixLogo size={30} />

          <nav className="space-y-1">
            <button 
              onClick={() => setActiveTab('analytics')}
              className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${activeTab === 'analytics' ? 'bg-primary text-primary-foreground shadow-md' : 'hover:bg-accent'}`}
            >
              <Activity size={16} /> Analytics & Settings
            </button>
            <button 
              onClick={() => setActiveTab('timetable')}
              className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${activeTab === 'timetable' ? 'bg-primary text-primary-foreground shadow-md' : 'hover:bg-accent'}`}
            >
              <Calendar size={16} /> Timetable Builder
            </button>
            <button 
              onClick={() => setActiveTab('users')}
              className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${activeTab === 'users' ? 'bg-primary text-primary-foreground shadow-md' : 'hover:bg-accent'}`}
            >
              <Users size={16} /> User Manager
            </button>
            <button 
              onClick={() => setActiveTab('csv')}
              className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${activeTab === 'csv' ? 'bg-primary text-primary-foreground shadow-md' : 'hover:bg-accent'}`}
            >
              <Upload size={16} /> Bulk CSV Hub
            </button>
            <button 
              onClick={() => setActiveTab('governance')}
              className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${activeTab === 'governance' ? 'bg-primary text-primary-foreground shadow-md' : 'hover:bg-accent'}`}
            >
              <Building2 size={16} /> Governance & HODs
            </button>
            <button 
              onClick={() => setActiveTab('notices')}
              className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${activeTab === 'notices' ? 'bg-primary text-primary-foreground shadow-md' : 'hover:bg-accent'}`}
            >
              <Bell size={16} /> Notices & Events
            </button>
            <button 
              onClick={() => setActiveTab('audit')}
              className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${activeTab === 'audit' ? 'bg-primary text-primary-foreground shadow-md' : 'hover:bg-accent'}`}
            >
              <FileText size={16} /> Audit & Activity Logs
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
            <h1 className="text-xl font-extrabold tracking-tight">Admin Console</h1>
            <p className="text-xs text-muted mt-0.5">Control Tower | {currentUser?.name || 'Loading...'}</p>
          </div>
          
          <div className="flex items-center gap-4">
            <button 
              onClick={toggleTheme} 
              className="p-2 rounded-xl border border-border bg-surface hover:bg-accent transition-colors"
              aria-label="Toggle theme"
            >
              {theme === 'dark' ? <Sun size={16} className="text-[#d4a017]" /> : <Moon size={16} className="text-secondary" />}
            </button>

            <div className="flex items-center gap-3 text-xs bg-red-500/10 border border-red-500/20 px-3 py-1.5 rounded-xl text-red-500 font-bold uppercase tracking-wider">
              <ShieldCheck size={14} /> Root Clearance
            </div>
          </div>
        </header>

        {/* 1. ANALYTICS & SETTINGS */}
        {activeTab === 'analytics' && (
          <div className="space-y-8 animate-fadeIn">
            {/* Stats Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              <div className="p-5 bg-surface border border-border rounded-2xl shadow-sm text-center">
                <GraduationCap size={24} className="mx-auto text-primary mb-2" />
                <span className="block text-2xl font-black">{totalStudents}</span>
                <span className="block text-xs text-muted font-bold">Total Students</span>
              </div>
              <div className="p-5 bg-surface border border-border rounded-2xl shadow-sm text-center">
                <Briefcase size={24} className="mx-auto text-secondary mb-2" />
                <span className="block text-2xl font-black">{totalFaculty}</span>
                <span className="block text-xs text-muted font-bold">Faculty Members</span>
              </div>
              <div className="p-5 bg-surface border border-border rounded-2xl shadow-sm text-center">
                <Building2 size={24} className="mx-auto text-primary mb-2" />
                <span className="block text-2xl font-black">{totalDepartments}</span>
                <span className="block text-xs text-muted font-bold">Departments</span>
              </div>
              <div className="p-5 bg-surface border border-border rounded-2xl shadow-sm text-center">
                <Activity size={24} className="mx-auto text-red-500 mb-2" />
                <span className="block text-2xl font-black">{auditLogs.length}</span>
                <span className="block text-xs text-muted font-bold">Logged Queries</span>
              </div>
            </div>

            {/* System settings, Profile edit & Reset */}
            <div className="grid md:grid-cols-3 gap-6">
              {/* Settings Form */}
              <div className="p-6 rounded-2xl border border-border bg-surface shadow-sm space-y-4">
                <h3 className="font-bold text-base flex items-center gap-2"><Settings size={18} className="text-primary" /> System Configuration</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-bold text-muted uppercase tracking-wider mb-1">Academic Year</label>
                    <input 
                      type="text" 
                      value={academicYear} 
                      onChange={(e) => setAcademicYear(e.target.value)}
                      className="w-full text-xs p-2 border border-border bg-background rounded-xl focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-muted uppercase tracking-wider mb-1">Semester Type</label>
                    <select
                      value={semesterType}
                      onChange={(e) => setSemesterType(e.target.value)}
                      className="w-full text-xs p-2 border border-border bg-background rounded-xl focus:outline-none"
                    >
                      <option value="Odd Semester">Odd Semester</option>
                      <option value="Even Semester">Even Semester</option>
                    </select>
                  </div>
                </div>
                <button 
                  onClick={() => alert('Settings updated!')}
                  className="w-full py-2 bg-primary text-primary-foreground font-bold rounded-xl text-xs shadow-sm hover:opacity-90"
                >
                  Save Settings
                </button>
              </div>

              {/* Admin Profile Edit */}
              <div className="p-6 rounded-2xl border border-border bg-surface shadow-sm space-y-4">
                <h3 className="font-bold text-base flex items-center gap-2 text-secondary"><Users size={18} /> Admin Contact</h3>
                <form onSubmit={handleUpdateProfile} className="space-y-3">
                  <div>
                    <label className="block text-[10px] font-bold text-muted uppercase tracking-wider mb-1">Phone Number</label>
                    <input 
                      type="text" 
                      value={profilePhone}
                      onChange={(e) => setProfilePhone(e.target.value)}
                      className="w-full text-xs p-2 border border-border bg-background rounded-xl focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-muted uppercase tracking-wider mb-1">Office Cabin / Location</label>
                    <input 
                      type="text" 
                      value={profileAddress}
                      onChange={(e) => setProfileAddress(e.target.value)}
                      className="w-full text-xs p-2 border border-border bg-background rounded-xl focus:outline-none"
                    />
                  </div>
                  <button 
                    type="submit" 
                    disabled={isUpdatingProfile}
                    className="w-full py-2 bg-secondary text-white font-bold rounded-xl text-xs shadow-sm hover:opacity-90 transition-all animate-pulse-slow"
                  >
                    {isUpdatingProfile ? 'Saving...' : 'Update Admin Contact'}
                  </button>
                </form>
              </div>

              {/* Reset database card */}
              <div className="p-6 rounded-2xl border border-red-500/20 bg-red-500/5 shadow-sm space-y-4 flex flex-col justify-between">
                <div>
                  <h3 className="font-bold text-base text-red-500 flex items-center gap-2"><RefreshCw size={18} /> Re-seed Database</h3>
                  <p className="text-xs text-muted mt-2 leading-relaxed">
                    Instantly wipes all tables and executes default seed data. Useful for developer testing. Mapped to local storage or Supabase tables depending on connection settings.
                  </p>
                </div>
                <button 
                  onClick={handleResetDatabase}
                  disabled={isReseeding}
                  className="w-full py-2.5 bg-red-500 text-white font-bold rounded-xl text-xs shadow-md hover:bg-red-600 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {isReseeding ? <Loader2 size={14} className="animate-spin" /> : 'Run Database Reset'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* 1.5. TIMETABLE BUILDER */}
        {activeTab === 'timetable' && (
          <div className="space-y-8 animate-[fadeIn_0.3s_ease-out]">
            <div className="grid md:grid-cols-3 gap-8 items-start">
              {/* Creator Forms */}
              <div className="space-y-6 md:col-span-1">
                {/* Create Timetable */}
                <div className="p-6 rounded-2xl border border-border bg-surface shadow-sm space-y-4">
                  <h3 className="font-bold text-base flex items-center gap-2"><Calendar size={18} className="text-primary" /> Create Timetable</h3>
                  <form onSubmit={handleCreateTimetable} className="space-y-3">
                    <div>
                      <label className="block text-[10px] font-bold text-muted uppercase tracking-wider mb-1.5">Timetable Name</label>
                      <input 
                        type="text" 
                        required
                        value={newTtName}
                        onChange={(e) => setNewTtName(e.target.value)}
                        placeholder="e.g. Fall 2026 CS Timetable"
                        className="w-full text-xs p-2.5 border border-border bg-background rounded-xl focus:outline-none"
                      />
                    </div>
                    <button 
                      type="submit" 
                      disabled={isCreatingTt}
                      className="w-full py-2 bg-primary text-primary-foreground font-bold rounded-xl text-xs shadow-md hover:opacity-90 disabled:opacity-50"
                    >
                      {isCreatingTt ? 'Creating...' : 'Create Timetable'}
                    </button>
                  </form>
                </div>

                {/* Create Timetable Entry */}
                <div className="p-6 rounded-2xl border border-border bg-surface shadow-sm space-y-4">
                  <h3 className="font-bold text-base flex items-center gap-2"><Plus size={18} className="text-secondary" /> Add Schedule Entry</h3>
                  <form onSubmit={handleCreateEntry} className="space-y-3">
                    <div>
                      <label className="block text-[10px] font-bold text-muted uppercase tracking-wider mb-1">Select Timetable</label>
                      <select
                        value={selectedTimetableId}
                        onChange={(e) => setSelectedTimetableId(e.target.value)}
                        className="w-full text-xs p-2 border border-border bg-background rounded-xl focus:outline-none"
                        required
                      >
                        <option value="">Choose Timetable</option>
                        {timetableList.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                      </select>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block text-[10px] font-bold text-muted uppercase tracking-wider mb-1">Day of Week</label>
                        <select
                          value={entryDay}
                          onChange={(e) => setEntryDay(Number(e.target.value))}
                          className="w-full text-xs p-2 border border-border bg-background rounded-xl focus:outline-none"
                        >
                          <option value={1}>Monday</option>
                          <option value={2}>Tuesday</option>
                          <option value={3}>Wednesday</option>
                          <option value={4}>Thursday</option>
                          <option value={5}>Friday</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-muted uppercase tracking-wider mb-1">Entry Type</label>
                        <select
                          value={entryType}
                          onChange={(e) => setEntryType(e.target.value as any)}
                          className="w-full text-xs p-2 border border-border bg-background rounded-xl focus:outline-none"
                        >
                          <option value="class">Student Class</option>
                          <option value="teaching">Faculty Lecture</option>
                          <option value="invigilation">Invigilation Duty</option>
                        </select>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block text-[10px] font-bold text-muted uppercase tracking-wider mb-1">Start Time</label>
                        <input 
                          type="text" 
                          value={entryStartTime}
                          onChange={(e) => setEntryStartTime(e.target.value)}
                          placeholder="09:00"
                          className="w-full text-xs p-2 border border-border bg-background rounded-xl focus:outline-none"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-muted uppercase tracking-wider mb-1">End Time</label>
                        <input 
                          type="text" 
                          value={entryEndTime}
                          onChange={(e) => setEntryEndTime(e.target.value)}
                          placeholder="10:30"
                          className="w-full text-xs p-2 border border-border bg-background rounded-xl focus:outline-none"
                          required
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-muted uppercase tracking-wider mb-1">Subject Code</label>
                      <select
                        value={entrySubject}
                        onChange={(e) => setEntrySubject(e.target.value)}
                        className="w-full text-xs p-2 border border-border bg-background rounded-xl focus:outline-none"
                        required
                      >
                        <option value="">Choose Subject</option>
                        {subjects.map(s => <option key={s.id} value={s.id}>{s.name} ({s.code})</option>)}
                      </select>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block text-[10px] font-bold text-muted uppercase tracking-wider mb-1">Room No</label>
                        <input 
                          type="text" 
                          value={entryRoom}
                          onChange={(e) => setEntryRoom(e.target.value)}
                          placeholder="e.g. A-301"
                          className="w-full text-xs p-2 border border-border bg-background rounded-xl focus:outline-none"
                          required
                        />
                      </div>
                      {entryType === 'class' ? (
                        <div>
                          <label className="block text-[10px] font-bold text-muted uppercase tracking-wider mb-1">Student</label>
                          <select
                            value={entryStudentId}
                            onChange={(e) => setEntryStudentId(e.target.value)}
                            className="w-full text-xs p-2 border border-border bg-background rounded-xl focus:outline-none"
                          >
                            <option value="">Choose Student</option>
                            {profiles.filter(p => p.role === 'student').map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                          </select>
                        </div>
                      ) : (
                        <div>
                          <label className="block text-[10px] font-bold text-muted uppercase tracking-wider mb-1">Faculty</label>
                          <select
                            value={entryFacultyId}
                            onChange={(e) => setEntryFacultyId(e.target.value)}
                            className="w-full text-xs p-2 border border-border bg-background rounded-xl focus:outline-none"
                          >
                            <option value="">Choose Faculty</option>
                            {profiles.filter(p => p.role === 'faculty').map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                          </select>
                        </div>
                      )}
                    </div>
                    <button 
                      type="submit" 
                      disabled={isCreatingEntry}
                      className="w-full py-2 bg-secondary text-white font-bold rounded-xl text-xs shadow-md hover:opacity-90 disabled:opacity-50"
                    >
                      {isCreatingEntry ? 'Saving...' : 'Add Schedule Entry'}
                    </button>
                  </form>
                </div>
              </div>

              {/* Entries Grid */}
              <div className="md:col-span-2 p-6 rounded-2xl border border-border bg-surface shadow-sm space-y-4">
                <h3 className="font-bold text-base">Timetable Entries Registry</h3>
                <div className="border border-border/60 rounded-xl overflow-hidden text-xs">
                  <div className="grid grid-cols-6 bg-background p-3 font-bold border-b border-border text-muted">
                    <span>Day</span>
                    <span>Time</span>
                    <span>Subject</span>
                    <span>Room</span>
                    <span>Target Type</span>
                    <span className="text-right">Actions</span>
                  </div>
                  <div className="max-h-[500px] overflow-y-auto">
                    {timetableEntries.map((e, idx) => {
                      const dayNames = ['', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
                      return (
                        <div key={idx} className="grid grid-cols-6 p-3 border-b border-border/40 items-center hover:bg-accent/20">
                          <span className="font-bold">{dayNames[e.day_of_week] || 'Monday'}</span>
                          <span>{e.start_time} - {e.end_time}</span>
                          <span className="font-bold text-primary">{e.subject_id}</span>
                          <span>{e.room_number}</span>
                          <span className="capitalize">{e.type}</span>
                          <div className="text-right">
                            <button 
                              onClick={() => handleDeleteEntry(e.id)}
                              className="p-1 text-red-500 hover:bg-red-500/10 rounded-lg transition-colors"
                              title="Delete entry"
                            >
                              <Trash size={14} />
                            </button>
                          </div>
                        </div>
                      );
                    })}
                    {timetableEntries.length === 0 && <p className="p-4 text-center text-muted">No timetable entries set.</p>}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 2. USER MANAGER */}
        {activeTab === 'users' && (
          <div className="space-y-8 animate-fadeIn">
            <div className="grid md:grid-cols-3 gap-8 items-start">
              {/* Add User Console */}
              <div className="p-6 rounded-2xl border border-border bg-surface shadow-sm space-y-4">
                <h3 className="font-bold text-base flex items-center gap-2"><UserPlus size={18} className="text-primary" /> Create User Profile</h3>
                <form onSubmit={handleAddUser} className="space-y-4">
                  <div>
                    <label className="block text-[10px] font-bold text-muted uppercase tracking-wider mb-1">Full Name</label>
                    <input 
                      type="text" 
                      required
                      value={newUserName}
                      onChange={(e) => setNewUserName(e.target.value)}
                      placeholder="e.g. John Doe"
                      className="w-full text-xs p-2 border border-border bg-background rounded-xl"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-muted uppercase tracking-wider mb-1">Email Address</label>
                    <input 
                      type="email" 
                      required
                      value={newUserEmail}
                      onChange={(e) => setNewUserEmail(e.target.value)}
                      placeholder="e.g. student@astrix.edu"
                      className="w-full text-xs p-2 border border-border bg-background rounded-xl"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-muted uppercase tracking-wider mb-1">Assigned Role</label>
                    <select
                      value={newUserRole}
                      onChange={(e) => setNewUserRole(e.target.value as any)}
                      className="w-full text-xs p-2 border border-border bg-background rounded-xl"
                    >
                      <option value="student">Student</option>
                      <option value="faculty">Faculty</option>
                      <option value="parent">Parent</option>
                      <option value="admin">Admin</option>
                    </select>
                  </div>
                  <button 
                    type="submit" 
                    disabled={isCreatingUser}
                    className="w-full py-2 bg-primary text-primary-foreground font-bold rounded-xl text-xs shadow-md hover:opacity-90 flex justify-center items-center gap-2 disabled:opacity-50"
                  >
                    {isCreatingUser ? <Loader2 size={12} className="animate-spin" /> : 'Create User'}
                  </button>
                </form>
              </div>

              {/* User Directory console */}
              <div className="md:col-span-2 p-6 rounded-2xl border border-border bg-surface shadow-sm space-y-4">
                <h3 className="font-bold text-base">Registered Profiles</h3>
                <div className="border border-border/60 rounded-xl overflow-hidden text-xs">
                  <div className="grid grid-cols-4 bg-background p-3 font-bold border-b border-border text-muted">
                    <span>Name</span>
                    <span>Email</span>
                    <span>Role</span>
                    <span className="text-right">Actions</span>
                  </div>
                  <div className="max-h-[350px] overflow-y-auto">
                    {profiles.map((p, idx) => (
                      <div key={idx} className="grid grid-cols-4 p-3 border-b border-border/40 items-center hover:bg-accent/20">
                        <span className="font-bold text-text">{p.name}</span>
                        <span className="text-muted truncate pr-2">{p.email}</span>
                        <span className="capitalize">{p.role}</span>
                        <div className="text-right">
                          <button 
                            onClick={() => handleDeleteUser(p.id)}
                            className="p-1 text-red-500 hover:bg-red-500/10 rounded-lg transition-colors"
                            title="Delete User"
                          >
                            <Trash size={14} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 3. BULK CSV OPERATIONS */}
        {activeTab === 'csv' && (
          <div className="space-y-8 max-w-4xl animate-fadeIn">
            <div className="p-6 rounded-2xl border border-border bg-surface shadow-sm space-y-4">
              <h3 className="font-bold text-base flex items-center gap-2"><Upload size={18} className="text-primary" /> Bulk Student CSV Import</h3>
              <p className="text-xs text-muted">Paste CSV rows directly. Format requirement: <strong>Name, Email, RegisterNumber</strong> (one row per student).</p>
              <form onSubmit={handleCsvImport} className="space-y-4">
                <textarea
                  value={csvContent}
                  onChange={(e) => setCsvContent(e.target.value)}
                  placeholder="John Doe, john.doe@astrix.edu, 2023CSE1024&#10;Jane Smith, jane.smith@astrix.edu, 2024AIML2056"
                  rows={6}
                  className="w-full text-xs p-3.5 border border-border bg-background rounded-xl font-mono focus:outline-none"
                />
                <button 
                  type="submit" 
                  disabled={isImporting || !csvContent.trim()}
                  className="px-5 py-2 bg-primary text-primary-foreground font-bold rounded-xl text-xs hover:opacity-90 shadow-md flex items-center gap-2 disabled:opacity-50"
                >
                  {isImporting ? <Loader2 size={12} className="animate-spin" /> : 'Run Bulk Import'}
                </button>
              </form>
            </div>

            <div className="p-6 rounded-2xl border border-border bg-surface shadow-sm space-y-4">
              <h3 className="font-bold text-base flex items-center gap-2"><Download size={18} className="text-secondary" /> Student Registry CSV Export</h3>
              <p className="text-xs text-muted">Generate and download a CSV containing names, registers, semester standings, and CGPA metrics.</p>
              <button 
                onClick={handleCsvExport}
                className="px-5 py-2 bg-secondary text-white font-bold rounded-xl text-xs hover:opacity-90 shadow-md flex items-center gap-2"
              >
                Download Student Registry CSV
              </button>
            </div>
          </div>
        )}

        {/* 4. ACADEMIC GOVERNANCE */}
        {activeTab === 'governance' && (
          <div className="space-y-8 animate-fadeIn">
            {/* Semester Promotion Trigger */}
            <div className="p-6 rounded-2xl border border-border bg-surface shadow-sm space-y-4 max-w-2xl">
              <h3 className="font-bold text-base flex items-center gap-2"><RefreshCw size={18} className="text-primary" /> Global Semester Promotion</h3>
              <p className="text-xs text-muted leading-relaxed">
                Executes campus-wide promotions. Increments student semesters by 1 and scales their academic years accordingly. Max semester caps at 8.
              </p>
              <button 
                onClick={handlePromoteSemester}
                className="px-5 py-2.5 bg-primary text-primary-foreground font-bold rounded-xl text-xs hover:opacity-90 shadow-md"
              >
                Promote All Active Students
              </button>
            </div>

            {/* Department Listings and HODs */}
            <div className="p-6 rounded-2xl border border-border bg-surface shadow-sm space-y-4">
              <h3 className="font-bold text-base">Department & HOD Administration</h3>
              <div className="border border-border/60 rounded-xl overflow-hidden text-xs">
                <div className="grid grid-cols-4 bg-background p-3 font-bold border-b border-border text-muted">
                  <span>Dept Code</span>
                  <span>Department Name</span>
                  <span>Current HOD</span>
                  <span className="text-right">Reassign HOD</span>
                </div>
                <div className="max-h-[300px] overflow-y-auto">
                  {departments.map((d, idx) => (
                    <div key={idx} className="grid grid-cols-4 p-3 border-b border-border/40 items-center">
                      <span className="font-bold text-text">{d.code}</span>
                      <span className="text-muted">{d.name}</span>
                      <span className="font-semibold text-primary">{d.hod_id || 'Not Assigned'}</span>
                      <div className="text-right">
                        <select
                          value={d.hod_id || ''}
                          onChange={(e) => handleAssignHOD(d.id, e.target.value)}
                          className="border border-border bg-background rounded p-1 text-xs focus:outline-none"
                        >
                          <option value="">Choose HOD</option>
                          {faculty.map(f => (
                            <option key={f.profile_id} value={f.profile_id}>{f.profile_id}</option>
                          ))}
                        </select>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 5. PUBLISHING BOARD */}
        {activeTab === 'notices' && (
          <div className="space-y-8 animate-fadeIn">
            <div className="grid md:grid-cols-2 gap-8">
              {/* Notice board publish */}
              <div className="p-6 rounded-2xl border border-border bg-surface shadow-sm space-y-4">
                <h3 className="font-bold text-base flex items-center gap-2"><Bell size={18} className="text-primary" /> Publish Notice</h3>
                <form onSubmit={handlePublishNotice} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[10px] font-bold text-muted uppercase tracking-wider mb-1">Notice Title</label>
                      <input 
                        type="text" 
                        required
                        value={noticeTitle}
                        onChange={(e) => setNoticeTitle(e.target.value)}
                        placeholder="e.g. Exam registration extension"
                        className="w-full text-xs p-2 border border-border bg-background rounded-xl"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-muted uppercase tracking-wider mb-1">Target Role audience</label>
                      <select
                        value={noticeTarget}
                        onChange={(e) => setNoticeTarget(e.target.value as any)}
                        className="w-full text-xs p-2 border border-border bg-background rounded-xl"
                      >
                        <option value="All">All</option>
                        <option value="Student">Student</option>
                        <option value="Faculty">Faculty</option>
                        <option value="Parent">Parent</option>
                      </select>
                    </div>
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-muted uppercase tracking-wider mb-1">Notice Body Content</label>
                    <textarea 
                      required
                      value={noticeBody}
                      onChange={(e) => setNoticeBody(e.target.value)}
                      placeholder="Write notice description..."
                      rows={3}
                      className="w-full text-xs p-2 border border-border bg-background rounded-xl focus:outline-none"
                    />
                  </div>
                  <button type="submit" className="w-full py-2 bg-primary text-primary-foreground font-bold rounded-xl text-xs shadow-md">
                    Publish to Board
                  </button>
                </form>
              </div>

              {/* Event Board publish */}
              <div className="p-6 rounded-2xl border border-border bg-surface shadow-sm space-y-4">
                <h3 className="font-bold text-base flex items-center gap-2"><Calendar size={18} className="text-secondary" /> Create Campus Event</h3>
                <form onSubmit={handlePublishEvent} className="space-y-4">
                  <div className="grid grid-cols-3 gap-2">
                    <div className="col-span-2">
                      <label className="block text-[10px] font-bold text-muted uppercase tracking-wider mb-1">Event Title</label>
                      <input 
                        type="text" 
                        required
                        value={eventTitle}
                        onChange={(e) => setEventTitle(e.target.value)}
                        placeholder="e.g. Tech Symposium 2026"
                        className="w-full text-xs p-2 border border-border bg-background rounded-xl"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-muted uppercase tracking-wider mb-1">Event Date</label>
                      <input 
                        type="date" 
                        required
                        value={eventDate}
                        onChange={(e) => setEventDate(e.target.value)}
                        className="w-full text-xs p-2 border border-border bg-background rounded-xl"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-muted uppercase tracking-wider mb-1">Location Venue</label>
                    <input 
                      type="text" 
                      required
                      value={eventLocation}
                      onChange={(e) => setEventLocation(e.target.value)}
                      placeholder="e.g. Central Auditorium"
                      className="w-full text-xs p-2 border border-border bg-background rounded-xl"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-muted uppercase tracking-wider mb-1">Description Details</label>
                    <input 
                      type="text"
                      value={eventDesc}
                      onChange={(e) => setEventDesc(e.target.value)}
                      placeholder="e.g. Annual technical paper presentations."
                      className="w-full text-xs p-2 border border-border bg-background rounded-xl focus:outline-none"
                    />
                  </div>
                  <button type="submit" className="w-full py-2 bg-secondary text-white font-bold rounded-xl text-xs shadow-md">
                    Schedule Event
                  </button>
                </form>
              </div>
            </div>
          </div>
        )}

        {/* 6. AUDIT LOGS */}
        {activeTab === 'audit' && (
          <div className="p-6 rounded-2xl border border-border bg-surface shadow-sm space-y-4 animate-fadeIn">
            <h3 className="font-bold text-base flex items-center gap-2"><Activity size={18} className="text-primary" /> Audit Logs & Security Trails</h3>
            <p className="text-xs text-muted">Real-time log of administrative database mutations and operations.</p>
            
            <div className="border border-border/60 rounded-xl overflow-hidden text-xs">
              <div className="grid grid-cols-4 bg-background p-3 font-bold border-b border-border text-muted">
                <span>Timestamp</span>
                <span>User Initiated</span>
                <span>DB Action</span>
                <span>Affected Table</span>
              </div>
              <div className="max-h-[350px] overflow-y-auto">
                {auditLogs.map((l, idx) => (
                  <div key={idx} className="grid grid-cols-4 p-3 border-b border-border/40 hover:bg-accent/10 items-center">
                    <span className="font-mono text-muted">{new Date(l.created_at).toLocaleString()}</span>
                    <span>Admin Profile</span>
                    <span className="font-bold text-primary">{l.action}</span>
                    <span className="font-mono text-muted">{l.table_name}</span>
                  </div>
                ))}
                {auditLogs.length === 0 && <p className="p-4 text-center text-muted">No audit trails registered yet.</p>}
              </div>
            </div>
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
                  onClick={() => { setActiveTab('analytics'); setMobileMenuOpen(false); }}
                  className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${activeTab === 'analytics' ? 'bg-primary text-primary-foreground shadow-md' : 'hover:bg-accent'}`}
                >
                  <Activity size={16} /> Analytics & Settings
                </button>
                <button 
                  onClick={() => { setActiveTab('timetable'); setMobileMenuOpen(false); }}
                  className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${activeTab === 'timetable' ? 'bg-primary text-primary-foreground shadow-md' : 'hover:bg-accent'}`}
                >
                  <Calendar size={16} /> Timetable Builder
                </button>
                <button 
                  onClick={() => { setActiveTab('users'); setMobileMenuOpen(false); }}
                  className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${activeTab === 'users' ? 'bg-primary text-primary-foreground shadow-md' : 'hover:bg-accent'}`}
                >
                  <Users size={16} /> User Manager
                </button>
                <button 
                  onClick={() => { setActiveTab('csv'); setMobileMenuOpen(false); }}
                  className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${activeTab === 'csv' ? 'bg-primary text-primary-foreground shadow-md' : 'hover:bg-accent'}`}
                >
                  <Upload size={16} /> Bulk CSV Hub
                </button>
                <button 
                  onClick={() => { setActiveTab('governance'); setMobileMenuOpen(false); }}
                  className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${activeTab === 'governance' ? 'bg-primary text-primary-foreground shadow-md' : 'hover:bg-accent'}`}
                >
                  <Building2 size={16} /> Governance & HODs
                </button>
                <button 
                  onClick={() => { setActiveTab('notices'); setMobileMenuOpen(false); }}
                  className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${activeTab === 'notices' ? 'bg-primary text-primary-foreground shadow-md' : 'hover:bg-accent'}`}
                >
                  <Bell size={16} /> Notices & Events
                </button>
                <button 
                  onClick={() => { setActiveTab('audit'); setMobileMenuOpen(false); }}
                  className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${activeTab === 'audit' ? 'bg-primary text-primary-foreground shadow-md' : 'hover:bg-accent'}`}
                >
                  <FileText size={16} /> Audit & Activity Logs
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
