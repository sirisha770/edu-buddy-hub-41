import React, { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { User, Mail, Phone, GraduationCap, Loader2, Save } from 'lucide-react';
import DashboardLayout from '@/components/DashboardLayout';

const ProfilePage: React.FC = () => {
  const { user, profile, role, refreshProfile } = useAuth();
  const { toast } = useToast();
  const [form, setForm] = useState({ full_name: '', phone: '', batch: '' });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (profile) {
      setForm({ full_name: profile.full_name || '', phone: profile.phone || '', batch: profile.batch || '' });
    }
  }, [profile]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !form.full_name.trim()) {
      toast({ title: 'Validation Error', description: 'Full name is required.', variant: 'destructive' });
      return;
    }
    setSaving(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ full_name: form.full_name.trim(), phone: form.phone.trim() || null, batch: form.batch.trim() || null })
        .eq('user_id', user.id);
      if (error) throw error;
      await refreshProfile();
      toast({ title: 'Profile Updated', description: 'Your profile has been saved.' });
    } catch (err: any) {
      toast({ title: 'Error', description: err.message, variant: 'destructive' });
    } finally {
      setSaving(false);
    }
  };

  const roleColor = role === 'admin' ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
    : role === 'teacher' ? 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400'
    : 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400';

  return (
    <DashboardLayout title="My Profile" role={role || 'student'}>
      <div className="max-w-2xl mx-auto">
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-foreground">My Profile</h2>
          <p className="text-muted-foreground mt-1">View and update your personal information.</p>
        </div>

        {/* Avatar Card */}
        <Card className="border border-border/50 shadow-card mb-6">
          <CardContent className="p-6">
            <div className="flex items-center gap-5">
              <div className="w-20 h-20 rounded-2xl gradient-hero flex items-center justify-center text-white text-3xl font-bold flex-shrink-0 shadow-lg">
                {profile?.full_name?.[0] || user?.email?.[0]?.toUpperCase() || 'U'}
              </div>
              <div>
                <h3 className="text-xl font-bold text-foreground">{profile?.full_name || 'Your Name'}</h3>
                <p className="text-muted-foreground text-sm">{profile?.email || user?.email}</p>
                <span className={`inline-flex items-center gap-1 mt-2 px-2.5 py-0.5 rounded-full text-xs font-medium capitalize ${roleColor}`}>
                  <GraduationCap className="w-3 h-3" />
                  {role}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Edit Form */}
        <Card className="border border-border/50 shadow-card">
          <CardHeader>
            <CardTitle className="text-base">Edit Information</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSave} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="full_name">Full Name *</Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    id="full_name"
                    value={form.full_name}
                    onChange={e => setForm(p => ({ ...p, full_name: e.target.value }))}
                    placeholder="Your full name"
                    className="pl-9"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Email Address</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input value={profile?.email || user?.email || ''} className="pl-9 bg-muted/50" disabled />
                </div>
                <p className="text-xs text-muted-foreground">Email cannot be changed.</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number</Label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    id="phone"
                    value={form.phone}
                    onChange={e => setForm(p => ({ ...p, phone: e.target.value }))}
                    placeholder="+91 9876543210"
                    className="pl-9"
                  />
                </div>
              </div>

              {role === 'student' && (
                <div className="space-y-2">
                  <Label htmlFor="batch">Batch / Year</Label>
                  <Input
                    id="batch"
                    value={form.batch}
                    onChange={e => setForm(p => ({ ...p, batch: e.target.value }))}
                    placeholder="e.g. 2024-2026 or B.Tech 2nd Year"
                  />
                </div>
              )}

              <Button type="submit" className="w-full gradient-hero border-0 text-white mt-2" disabled={saving}>
                {saving ? <><Loader2 className="w-4 h-4 animate-spin mr-2" />Saving...</> : <><Save className="w-4 h-4 mr-2" />Save Changes</>}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default ProfilePage;
