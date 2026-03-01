import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Camera, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface ProfileEditorProps {
  userId: string;
  onClose: () => void;
  onUpdated: () => void;
}

export const ProfileEditor = ({ userId, onClose, onUpdated }: ProfileEditorProps) => {
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    const fetchProfile = async () => {
      const { data } = await supabase
        .from('profiles')
        .select('full_name, phone, avatar_url')
        .eq('user_id', userId)
        .single();

      if (data) {
        setFullName(data.full_name || '');
        setPhone(data.phone || '');
        setAvatarUrl(data.avatar_url || '');
      }
      setLoading(false);
    };
    fetchProfile();
  }, [userId]);

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) {
      toast({ title: 'File too large', description: 'Max 2MB allowed.', variant: 'destructive' });
      return;
    }

    setUploading(true);
    const ext = file.name.split('.').pop();
    const path = `avatars/${userId}.${ext}`;

    const { error } = await supabase.storage
      .from('product-images')
      .upload(path, file, { upsert: true });

    if (error) {
      toast({ title: 'Upload failed', description: error.message, variant: 'destructive' });
    } else {
      const { data: { publicUrl } } = supabase.storage.from('product-images').getPublicUrl(path);
      setAvatarUrl(publicUrl + '?t=' + Date.now());
    }
    setUploading(false);
  };

  const handleSave = async () => {
    if (!fullName.trim()) {
      toast({ title: 'Name required', description: 'Please enter your name.', variant: 'destructive' });
      return;
    }
    setSaving(true);

    const { error } = await supabase
      .from('profiles')
      .update({ full_name: fullName.trim(), phone: phone.trim(), avatar_url: avatarUrl || null })
      .eq('user_id', userId);

    if (error) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    } else {
      // Also update auth metadata so Navbar reflects it
      await supabase.auth.updateUser({
        data: { full_name: fullName.trim(), avatar_url: avatarUrl || undefined },
      });
      toast({ title: 'Profile updated!' });
      onUpdated();
      onClose();
    }
    setSaving(false);
  };

  const initials = fullName ? fullName.slice(0, 2).toUpperCase() : '?';

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 20 }}
        className="glass-card rounded-2xl p-6 mb-6"
      >
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-lg font-bold">Edit Profile</h2>
          <button onClick={onClose} className="p-1 rounded-full hover:bg-muted transition-colors">
            <X className="w-5 h-5 text-muted-foreground" />
          </button>
        </div>

        {loading ? (
          <div className="flex justify-center py-8">
            <Loader2 className="w-6 h-6 animate-spin text-accent" />
          </div>
        ) : (
          <div className="space-y-5">
            {/* Avatar */}
            <div className="flex flex-col items-center gap-3">
              <div className="relative">
                {avatarUrl ? (
                  <img src={avatarUrl} alt="Avatar" className="w-20 h-20 rounded-full object-cover ring-2 ring-accent/30" />
                ) : (
                  <div className="w-20 h-20 rounded-full bg-accent/20 flex items-center justify-center ring-2 ring-accent/30">
                    <span className="text-2xl font-bold text-accent">{initials}</span>
                  </div>
                )}
                <label className="absolute bottom-0 right-0 w-7 h-7 rounded-full bg-accent flex items-center justify-center cursor-pointer hover:bg-accent/80 transition-colors">
                  {uploading ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin text-accent-foreground" />
                  ) : (
                    <Camera className="w-3.5 h-3.5 text-accent-foreground" />
                  )}
                  <input type="file" accept="image/*" className="hidden" onChange={handleAvatarUpload} disabled={uploading} />
                </label>
              </div>
              <p className="text-xs text-muted-foreground">Tap camera to change photo</p>
            </div>

            <div>
              <Label htmlFor="edit-name">Full Name</Label>
              <Input id="edit-name" value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder="Your name" className="mt-1.5" />
            </div>

            <div>
              <Label htmlFor="edit-phone">Phone Number</Label>
              <Input id="edit-phone" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+91 XXXXX XXXXX" className="mt-1.5" />
            </div>

            <Button onClick={handleSave} disabled={saving} className="w-full h-11 btn-luxury">
              {saving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
              Save Changes
            </Button>
          </div>
        )}
      </motion.div>
    </AnimatePresence>
  );
};
