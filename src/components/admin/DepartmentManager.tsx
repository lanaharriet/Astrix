'use client';

import React, { useState, useEffect } from 'react';
import { db } from '@/lib/db-client';
import { 
  Plus, 
  Search, 
  Edit2, 
  Trash2, 
  ChevronLeft, 
  ChevronRight, 
  Loader2, 
  AlertTriangle, 
  CheckCircle,
  Building,
  X
} from 'lucide-react';

type Department = {
  id: string;
  name: string;
  code: string;
  description: string;
  created_at?: string;
  updated_at?: string;
};

export default function DepartmentManager() {
  const [departments, setDepartments] = useState<Department[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  // Modal states
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  // Form states
  const [selectedDept, setSelectedDept] = useState<Department | null>(null);
  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [description, setDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Alert/Toast states
  const [toast, setToast] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const fetchDepartments = async () => {
    setIsLoading(true);
    try {
      const data = await db.departments.select();
      setDepartments(data || []);
    } catch (err: any) {
      triggerToast('error', err.message || 'Failed to load departments');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDepartments();
  }, []);

  const triggerToast = (type: 'success' | 'error', text: string) => {
    setToast({ type, text });
    setTimeout(() => setToast(null), 3000);
  };

  // Filter and search logic
  const filteredDepartments = departments.filter((dept) => {
    const query = searchQuery.toLowerCase();
    return (
      dept.name.toLowerCase().includes(query) ||
      dept.code.toLowerCase().includes(query) ||
      (dept.description && dept.description.toLowerCase().includes(query))
    );
  });

  // Pagination calculations
  const totalPages = Math.ceil(filteredDepartments.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedDepts = filteredDepartments.slice(startIndex, startIndex + itemsPerPage);

  const handleOpenAdd = () => {
    setName('');
    setCode('');
    setDescription('');
    setShowAddModal(true);
  };

  const handleOpenEdit = (dept: Department) => {
    setSelectedDept(dept);
    setName(dept.name);
    setCode(dept.code);
    setDescription(dept.description || '');
    setShowEditModal(true);
  };

  const handleOpenDelete = (dept: Department) => {
    setSelectedDept(dept);
    setShowDeleteModal(true);
  };

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !code) {
      triggerToast('error', 'Department name and code are required.');
      return;
    }
    
    setIsSubmitting(true);
    try {
      const response = await db.departments.insert({
        name,
        code: code.toUpperCase(),
        description
      });
      setDepartments([response, ...departments]);
      setShowAddModal(false);
      triggerToast('success', `Department "${code.toUpperCase()}" created successfully!`);
    } catch (err: any) {
      triggerToast('error', err.message || 'Error creating department.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedDept) return;
    if (!name || !code) {
      triggerToast('error', 'Department name and code are required.');
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await db.departments.update(selectedDept.id, {
        name,
        code: code.toUpperCase(),
        description
      });
      setDepartments(departments.map(d => d.id === selectedDept.id ? response : d));
      setShowEditModal(false);
      triggerToast('success', `Department "${code.toUpperCase()}" updated successfully!`);
    } catch (err: any) {
      triggerToast('error', err.message || 'Error updating department.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedDept) return;
    setIsSubmitting(true);
    try {
      await db.departments.delete(selectedDept.id);
      setDepartments(departments.filter(d => d.id !== selectedDept.id));
      setShowDeleteModal(false);
      triggerToast('success', `Department "${selectedDept.code}" deleted successfully.`);
      if (paginatedDepts.length === 1 && currentPage > 1) {
        setCurrentPage(currentPage - 1);
      }
    } catch (err: any) {
      triggerToast('error', err.message || 'Error deleting department.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const ShimmerRow = () => (
    <tr className="border-b border-border/40 animate-pulse">
      <td className="p-4"><div className="h-4 bg-muted/30 rounded w-16" /></td>
      <td className="p-4"><div className="h-4 bg-muted/30 rounded w-44" /></td>
      <td className="p-4"><div className="h-4 bg-muted/30 rounded w-64" /></td>
      <td className="p-4 flex gap-2"><div className="h-8 bg-muted/30 rounded w-8" /><div className="h-8 bg-muted/30 rounded w-8" /></td>
    </tr>
  );

  return (
    <div className="space-y-6">
      {/* Toast Alert */}
      {toast && (
        <div className={`fixed bottom-6 right-6 z-50 p-4 rounded-xl border shadow-2xl flex items-center gap-3 transition-all duration-300 max-w-sm animate-fadeIn ${
          toast.type === 'success' 
            ? 'bg-success/10 border-success/30 text-success backdrop-blur-md' 
            : 'bg-red-500/10 border-red-500/30 text-red-500 backdrop-blur-md'
        }`}>
          {toast.type === 'success' ? <CheckCircle size={18} /> : <AlertTriangle size={18} />}
          <span className="text-xs font-bold">{toast.text}</span>
        </div>
      )}

      {/* Header bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-text flex items-center gap-2">
            <Building className="text-primary" size={22} /> Department Management
          </h2>
          <p className="text-xs text-muted font-medium mt-0.5">Define and maintain institutional fields of study</p>
        </div>
        <button 
          onClick={handleOpenAdd}
          className="flex items-center justify-center gap-1.5 px-4 py-2 border border-transparent rounded-xl bg-primary text-primary-foreground text-xs font-bold shadow-md hover:opacity-90 transition-all cursor-pointer"
        >
          <Plus size={14} /> Add Department
        </button>
      </div>

      {/* Actions / Search Bar */}
      <div className="glass p-4 border border-border bg-surface shadow-sm rounded-2xl flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="relative w-full md:max-w-xs">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-muted">
            <Search size={14} />
          </div>
          <input
            type="text"
            placeholder="Search departments..."
            value={searchQuery}
            onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
            className="block w-full pl-9 pr-3 py-1.5 border border-border rounded-xl bg-background text-text text-xs focus:outline-none focus:ring-1 focus:ring-primary focus:border-transparent transition-all"
          />
        </div>
        <div className="text-xs font-bold text-muted">
          Showing {filteredDepartments.length} total departments
        </div>
      </div>

      {/* Table grid */}
      <div className="glass border border-border bg-surface shadow-sm rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-border bg-background/50 font-bold uppercase tracking-wider text-muted text-[10px]">
                <th className="p-4 w-28">Code</th>
                <th className="p-4 w-60">Department Name</th>
                <th className="p-4">Description</th>
                <th className="p-4 w-24 text-center">Actions</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <>
                  <ShimmerRow />
                  <ShimmerRow />
                  <ShimmerRow />
                  <ShimmerRow />
                  <ShimmerRow />
                </>
              ) : paginatedDepts.length > 0 ? (
                paginatedDepts.map((dept) => (
                  <tr key={dept.id} className="border-b border-border/40 hover:bg-muted/10 transition-colors">
                    <td className="p-4 font-extrabold text-primary">{dept.code}</td>
                    <td className="p-4 font-semibold text-text">{dept.name}</td>
                    <td className="p-4 text-muted font-medium line-clamp-2 md:line-clamp-none max-w-sm mt-1">{dept.description || <span className="italic text-muted/65">No description</span>}</td>
                    <td className="p-4 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <button 
                          onClick={() => handleOpenEdit(dept)}
                          className="p-1.5 rounded-lg border border-border hover:bg-accent text-text transition-all cursor-pointer"
                          title="Edit"
                        >
                          <Edit2 size={13} />
                        </button>
                        <button 
                          onClick={() => handleOpenDelete(dept)}
                          className="p-1.5 rounded-lg border border-red-500/20 hover:bg-red-500/10 text-red-500 transition-all cursor-pointer"
                          title="Delete"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={4} className="p-10 text-center text-muted font-bold text-sm">
                    <div className="flex flex-col items-center justify-center space-y-2">
                      <Building size={36} className="text-muted/50" />
                      <span>No departments found.</span>
                      {searchQuery && (
                        <button 
                          onClick={() => setSearchQuery('')}
                          className="text-xs text-primary underline font-semibold mt-1"
                        >
                          Clear search query
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination controls */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between border-t border-border px-4 py-3 bg-background/30 text-xs">
            <span className="font-semibold text-muted">
              Page {currentPage} of {totalPages}
            </span>
            <div className="flex gap-2">
              <button
                onClick={() => setCurrentPage(currentPage - 1)}
                disabled={currentPage === 1}
                className="p-1.5 rounded-lg border border-border hover:bg-accent disabled:opacity-40 disabled:hover:bg-transparent transition-all cursor-pointer"
              >
                <ChevronLeft size={14} />
              </button>
              <button
                onClick={() => setCurrentPage(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="p-1.5 rounded-lg border border-border hover:bg-accent disabled:opacity-40 disabled:hover:bg-transparent transition-all cursor-pointer"
              >
                <ChevronRight size={14} />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Add Department Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="glass max-w-md w-full p-6 border border-white/10 rounded-2xl shadow-2xl space-y-4 animate-scaleUp">
            <div className="flex items-center justify-between pb-2 border-b border-border/50">
              <h3 className="font-bold text-sm text-text flex items-center gap-2">
                <Building size={16} className="text-primary" /> Create Department
              </h3>
              <button onClick={() => setShowAddModal(false)} className="text-muted hover:text-text cursor-pointer">
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleAdd} className="space-y-4">
              <div>
                <label className="block text-[10px] font-bold text-muted uppercase tracking-wider mb-1">Code *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. CSE"
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  className="w-full text-xs p-2 border border-border bg-background rounded-xl focus:outline-none focus:ring-1 focus:ring-primary focus:border-transparent transition-all uppercase"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-muted uppercase tracking-wider mb-1">Department Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Computer Science and Engineering"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full text-xs p-2 border border-border bg-background rounded-xl focus:outline-none focus:ring-1 focus:ring-primary focus:border-transparent transition-all"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-muted uppercase tracking-wider mb-1">Description</label>
                <textarea
                  placeholder="Department details and focus area..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={3}
                  className="w-full text-xs p-2 border border-border bg-background rounded-xl focus:outline-none focus:ring-1 focus:ring-primary focus:border-transparent transition-all resize-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-3 py-1.5 border border-border rounded-xl text-xs font-semibold hover:bg-accent transition-all cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex items-center justify-center gap-1 px-4 py-1.5 border border-transparent rounded-xl bg-primary text-primary-foreground text-xs font-bold shadow-md hover:opacity-90 transition-all cursor-pointer disabled:opacity-50"
                >
                  {isSubmitting && <Loader2 size={12} className="animate-spin" />}
                  Create
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Department Modal */}
      {showEditModal && selectedDept && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="glass max-w-md w-full p-6 border border-white/10 rounded-2xl shadow-2xl space-y-4 animate-scaleUp">
            <div className="flex items-center justify-between pb-2 border-b border-border/50">
              <h3 className="font-bold text-sm text-text flex items-center gap-2">
                <Building size={16} className="text-primary" /> Update Department
              </h3>
              <button onClick={() => setShowEditModal(false)} className="text-muted hover:text-text cursor-pointer">
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleEdit} className="space-y-4">
              <div>
                <label className="block text-[10px] font-bold text-muted uppercase tracking-wider mb-1">Code *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. CSE"
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  className="w-full text-xs p-2 border border-border bg-background rounded-xl focus:outline-none focus:ring-1 focus:ring-primary focus:border-transparent transition-all uppercase"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-muted uppercase tracking-wider mb-1">Department Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Computer Science and Engineering"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full text-xs p-2 border border-border bg-background rounded-xl focus:outline-none focus:ring-1 focus:ring-primary focus:border-transparent transition-all"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-muted uppercase tracking-wider mb-1">Description</label>
                <textarea
                  placeholder="Department details..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={3}
                  className="w-full text-xs p-2 border border-border bg-background rounded-xl focus:outline-none focus:ring-1 focus:ring-primary focus:border-transparent transition-all resize-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  className="px-3 py-1.5 border border-border rounded-xl text-xs font-semibold hover:bg-accent transition-all cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex items-center justify-center gap-1 px-4 py-1.5 border border-transparent rounded-xl bg-primary text-primary-foreground text-xs font-bold shadow-md hover:opacity-90 transition-all cursor-pointer disabled:opacity-50"
                >
                  {isSubmitting && <Loader2 size={12} className="animate-spin" />}
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Department Confirmation Modal */}
      {showDeleteModal && selectedDept && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="glass max-w-sm w-full p-6 border border-white/10 rounded-2xl shadow-2xl space-y-4 animate-scaleUp">
            <div className="flex flex-col items-center justify-center text-center space-y-3">
              <div className="p-3 bg-red-500/10 text-red-500 rounded-full border border-red-500/20">
                <AlertTriangle size={24} />
              </div>
              <h3 className="font-extrabold text-sm text-text">Confirm Delete</h3>
              <p className="text-xs text-muted font-medium">
                Are you sure you want to permanently delete the department <strong>{selectedDept.name} ({selectedDept.code})</strong>? This action cannot be undone.
              </p>
            </div>

            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowDeleteModal(false)}
                className="w-full py-2 border border-border rounded-xl text-xs font-bold hover:bg-accent transition-all cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDelete}
                disabled={isSubmitting}
                className="w-full flex items-center justify-center gap-1 py-2 border border-transparent rounded-xl bg-red-500 text-white text-xs font-bold shadow-md hover:bg-red-600 transition-all cursor-pointer disabled:opacity-50"
              >
                {isSubmitting && <Loader2 size={12} className="animate-spin" />}
                Yes, Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
