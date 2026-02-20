import React, { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import {
  Users, BookOpen, GraduationCap, Plus, Search, Edit2,
  Trash2, X, Loader2, UserCheck, AlertCircle
} from 'lucide-react';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import DashboardLayout from '@/components/DashboardLayout';

interface Profile { id: string; user_id: string; full_name: string; email: string; phone: string | null; batch: string | null; }
interface Course { id: string; title: string; code: string; description: string | null; credits: number | null; teacher_id: string | null; }
interface UserRole { id: string; user_id: string; role: string; profiles?: Profile; }

const StatCard: React.FC<{ title: string; value: number; icon: React.ReactNode; color: string }> = ({ title, value, icon, color }) => (
  <Card className="border border-border/50 shadow-card">
    <CardContent className="p-5 flex items-center gap-4">
      <div className={`w-12 h-12 rounded-xl ${color} flex items-center justify-center flex-shrink-0`}>{icon}</div>
      <div>
        <p className="text-2xl font-bold text-foreground">{value}</p>
        <p className="text-sm text-muted-foreground">{title}</p>
      </div>
    </CardContent>
  </Card>
);

const AdminDashboard: React.FC = () => {
  const { profile } = useAuth();
  const { toast } = useToast();
  const [students, setStudents] = useState<UserRole[]>([]);
  const [teachers, setTeachers] = useState<UserRole[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState<'students' | 'teachers' | 'courses'>('students');

  // Course form
  const [courseDialog, setCourseDialog] = useState(false);
  const [editCourse, setEditCourse] = useState<Course | null>(null);
  const [courseForm, setCourseForm] = useState({ title: '', code: '', description: '', credits: '3', teacher_id: '' });
  const [saving, setSaving] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [studentsRes, teachersRes, coursesRes] = await Promise.all([
        supabase.from('user_roles').select('*, profiles(*)').eq('role', 'student'),
        supabase.from('user_roles').select('*, profiles(*)').eq('role', 'teacher'),
        supabase.from('courses').select('*').order('created_at', { ascending: false }),
      ]);
      if (studentsRes.data) setStudents(studentsRes.data as any);
      if (teachersRes.data) setTeachers(teachersRes.data as any);
      if (coursesRes.data) setCourses(coursesRes.data);
    } catch (err) {
      toast({ title: 'Error', description: 'Failed to load data.', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const openCourseDialog = (course?: Course) => {
    if (course) {
      setEditCourse(course);
      setCourseForm({ title: course.title, code: course.code, description: course.description || '', credits: String(course.credits || 3), teacher_id: course.teacher_id || '' });
    } else {
      setEditCourse(null);
      setCourseForm({ title: '', code: '', description: '', credits: '3', teacher_id: '' });
    }
    setCourseDialog(true);
  };

  const saveCourse = async () => {
    if (!courseForm.title.trim() || !courseForm.code.trim()) {
      toast({ title: 'Validation Error', description: 'Title and code are required.', variant: 'destructive' });
      return;
    }
    setSaving(true);
    try {
      const payload = {
        title: courseForm.title.trim(),
        code: courseForm.code.trim().toUpperCase(),
        description: courseForm.description.trim() || null,
        credits: parseInt(courseForm.credits) || 3,
        teacher_id: courseForm.teacher_id || null,
      };
      if (editCourse) {
        const { error } = await supabase.from('courses').update(payload).eq('id', editCourse.id);
        if (error) throw error;
        toast({ title: 'Course Updated', description: `${payload.title} updated successfully.` });
      } else {
        const { error } = await supabase.from('courses').insert(payload);
        if (error) throw error;
        toast({ title: 'Course Created', description: `${payload.title} created successfully.` });
      }
      setCourseDialog(false);
      fetchData();
    } catch (err: any) {
      toast({ title: 'Error', description: err.message, variant: 'destructive' });
    } finally {
      setSaving(false);
    }
  };

  const deleteCourse = async (course: Course) => {
    if (!confirm(`Delete "${course.title}"? This will also remove all enrollments.`)) return;
    try {
      const { error } = await supabase.from('courses').delete().eq('id', course.id);
      if (error) throw error;
      toast({ title: 'Course Deleted', description: `${course.title} has been removed.` });
      fetchData();
    } catch (err: any) {
      toast({ title: 'Error', description: err.message, variant: 'destructive' });
    }
  };

  const promoteToTeacher = async (userId: string) => {
    try {
      await supabase.from('user_roles').update({ role: 'teacher' }).eq('user_id', userId);
      toast({ title: 'Role Updated', description: 'User promoted to Teacher.' });
      fetchData();
    } catch (err) {
      toast({ title: 'Error', description: 'Failed to update role.', variant: 'destructive' });
    }
  };

  const filteredStudents = students.filter(s => {
    const p = s.profiles as any;
    return !searchTerm || p?.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p?.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p?.batch?.toLowerCase().includes(searchTerm.toLowerCase());
  });

  const filteredCourses = courses.filter(c =>
    !searchTerm || c.title.toLowerCase().includes(searchTerm.toLowerCase()) || c.code.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const tabs = [
    { key: 'students', label: 'Students', count: students.length, icon: <Users className="w-4 h-4" /> },
    { key: 'teachers', label: 'Teachers', count: teachers.length, icon: <GraduationCap className="w-4 h-4" /> },
    { key: 'courses', label: 'Courses', count: courses.length, icon: <BookOpen className="w-4 h-4" /> },
  ] as const;

  return (
    <DashboardLayout title="Admin Dashboard" role="admin">
      {/* Welcome */}
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-foreground">Welcome, {profile?.full_name || 'Admin'} 👋</h2>
        <p className="text-muted-foreground mt-1">Manage your institution from one place.</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
        <StatCard title="Total Students" value={students.length} icon={<Users className="w-6 h-6 text-blue-600" />} color="bg-blue-100 dark:bg-blue-900/30" />
        <StatCard title="Total Teachers" value={teachers.length} icon={<GraduationCap className="w-6 h-6 text-purple-600" />} color="bg-purple-100 dark:bg-purple-900/30" />
        <StatCard title="Total Courses" value={courses.length} icon={<BookOpen className="w-6 h-6 text-green-600" />} color="bg-green-100 dark:bg-green-900/30" />
      </div>

      {/* Tabs */}
      <Card className="border border-border/50 shadow-card">
        <CardHeader className="pb-0">
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
            <div className="flex gap-1 p-1 bg-muted rounded-lg">
              {tabs.map(tab => (
                <button
                  key={tab.key}
                  onClick={() => { setActiveTab(tab.key); setSearchTerm(''); }}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-all ${activeTab === tab.key ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}
                >
                  {tab.icon} {tab.label}
                  <Badge variant="secondary" className="text-xs h-4 px-1">{tab.count}</Badge>
                </button>
              ))}
            </div>
            <div className="flex gap-2 w-full sm:w-auto">
              <div className="relative flex-1 sm:flex-none">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input placeholder={`Search ${activeTab}...`} value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="pl-9 w-full sm:w-52" />
                {searchTerm && <button onClick={() => setSearchTerm('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"><X className="w-3.5 h-3.5" /></button>}
              </div>
              {activeTab === 'courses' && (
                <Button onClick={() => openCourseDialog()} size="sm" className="gradient-hero border-0 text-white whitespace-nowrap">
                  <Plus className="w-4 h-4 mr-1" /> Add Course
                </Button>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-4">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
          ) : (
            <>
              {/* Students Tab */}
              {activeTab === 'students' && (
                <div className="space-y-2">
                  {filteredStudents.length === 0 ? (
                    <EmptyState icon={<Users />} message="No students found" />
                  ) : filteredStudents.map(s => {
                    const p = s.profiles as any;
                    return (
                      <div key={s.id} className="flex items-center gap-3 p-3 rounded-lg border border-border/50 hover:bg-muted/30 transition-colors">
                        <div className="w-9 h-9 rounded-full gradient-hero flex items-center justify-center flex-shrink-0">
                          <span className="text-white text-sm font-semibold">{p?.full_name?.[0] || 'S'}</span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-sm truncate">{p?.full_name || 'Unknown'}</p>
                          <p className="text-xs text-muted-foreground truncate">{p?.email} {p?.batch ? `• Batch: ${p.batch}` : ''}</p>
                        </div>
                        <div className="flex gap-2 flex-shrink-0">
                          <Badge variant="secondary" className="text-xs">Student</Badge>
                          <Button size="sm" variant="outline" onClick={() => promoteToTeacher(s.user_id)} className="h-7 text-xs">
                            <UserCheck className="w-3 h-3 mr-1" /> Promote
                          </Button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Teachers Tab */}
              {activeTab === 'teachers' && (
                <div className="space-y-2">
                  {teachers.length === 0 ? (
                    <EmptyState icon={<GraduationCap />} message="No teachers found" />
                  ) : teachers.map(t => {
                    const p = t.profiles as any;
                    const teacherCourses = courses.filter(c => c.teacher_id === t.user_id);
                    return (
                      <div key={t.id} className="flex items-center gap-3 p-3 rounded-lg border border-border/50 hover:bg-muted/30 transition-colors">
                        <div className="w-9 h-9 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center flex-shrink-0">
                          <span className="text-purple-600 text-sm font-semibold">{p?.full_name?.[0] || 'T'}</span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-sm truncate">{p?.full_name || 'Unknown'}</p>
                          <p className="text-xs text-muted-foreground truncate">{p?.email}</p>
                        </div>
                        <Badge variant="outline" className="text-xs flex-shrink-0">{teacherCourses.length} course{teacherCourses.length !== 1 ? 's' : ''}</Badge>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Courses Tab */}
              {activeTab === 'courses' && (
                <div className="space-y-2">
                  {filteredCourses.length === 0 ? (
                    <EmptyState icon={<BookOpen />} message="No courses found" action={<Button size="sm" onClick={() => openCourseDialog()} className="gradient-hero border-0 text-white"><Plus className="w-3.5 h-3.5 mr-1" />Add First Course</Button>} />
                  ) : filteredCourses.map(course => {
                    const teacher = teachers.find(t => t.user_id === course.teacher_id);
                    const tp = teacher?.profiles as any;
                    return (
                      <div key={course.id} className="flex items-center gap-3 p-3 rounded-lg border border-border/50 hover:bg-muted/30 transition-colors">
                        <div className="w-9 h-9 rounded-lg bg-green-100 dark:bg-green-900/30 flex items-center justify-center flex-shrink-0">
                          <BookOpen className="w-4 h-4 text-green-600" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-sm truncate">{course.title}</p>
                          <p className="text-xs text-muted-foreground truncate">
                            {course.code} • {course.credits} credits
                            {tp ? ` • ${tp.full_name}` : ' • No teacher assigned'}
                          </p>
                        </div>
                        <div className="flex gap-1.5 flex-shrink-0">
                          <Button size="sm" variant="ghost" onClick={() => openCourseDialog(course)} className="h-7 w-7 p-0">
                            <Edit2 className="w-3.5 h-3.5" />
                          </Button>
                          <Button size="sm" variant="ghost" onClick={() => deleteCourse(course)} className="h-7 w-7 p-0 text-destructive hover:text-destructive">
                            <Trash2 className="w-3.5 h-3.5" />
                          </Button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>

      {/* Course Dialog */}
      <Dialog open={courseDialog} onOpenChange={setCourseDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{editCourse ? 'Edit Course' : 'Add New Course'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-1.5">
              <Label>Course Title *</Label>
              <Input placeholder="e.g. Data Structures" value={courseForm.title} onChange={e => setCourseForm(p => ({ ...p, title: e.target.value }))} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>Course Code *</Label>
                <Input placeholder="e.g. CS201" value={courseForm.code} onChange={e => setCourseForm(p => ({ ...p, code: e.target.value }))} />
              </div>
              <div className="space-y-1.5">
                <Label>Credits</Label>
                <Select value={courseForm.credits} onValueChange={v => setCourseForm(p => ({ ...p, credits: v }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {[1, 2, 3, 4, 5].map(n => <SelectItem key={n} value={String(n)}>{n} Credit{n > 1 ? 's' : ''}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-1.5">
              <Label>Description</Label>
              <Input placeholder="Brief description..." value={courseForm.description} onChange={e => setCourseForm(p => ({ ...p, description: e.target.value }))} />
            </div>
            <div className="space-y-1.5">
              <Label>Assign Teacher</Label>
              <Select value={courseForm.teacher_id} onValueChange={v => setCourseForm(p => ({ ...p, teacher_id: v }))}>
                <SelectTrigger><SelectValue placeholder="Select teacher (optional)" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">No teacher</SelectItem>
                  {teachers.map(t => {
                    const p = t.profiles as any;
                    return <SelectItem key={t.user_id} value={t.user_id}>{p?.full_name || 'Unknown'}</SelectItem>;
                  })}
                </SelectContent>
              </Select>
            </div>
            <div className="flex gap-2 pt-2">
              <Button variant="outline" className="flex-1" onClick={() => setCourseDialog(false)}>Cancel</Button>
              <Button className="flex-1 gradient-hero border-0 text-white" onClick={saveCourse} disabled={saving}>
                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : editCourse ? 'Update' : 'Create'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
};

const EmptyState: React.FC<{ icon: React.ReactNode; message: string; action?: React.ReactNode }> = ({ icon, message, action }) => (
  <div className="flex flex-col items-center justify-center py-12 text-center">
    <div className="w-14 h-14 rounded-2xl bg-muted flex items-center justify-center mb-3 text-muted-foreground">
      {icon}
    </div>
    <p className="text-muted-foreground font-medium">{message}</p>
    {action && <div className="mt-4">{action}</div>}
  </div>
);

export default AdminDashboard;
