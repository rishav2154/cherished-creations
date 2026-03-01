import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Plus, Pencil, Trash2, X, MapPin, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface Address {
  id: string;
  full_name: string;
  phone: string;
  address_line1: string;
  address_line2: string | null;
  city: string;
  state: string;
  pincode: string;
  is_default: boolean | null;
}

const emptyForm = {
  full_name: '', phone: '', address_line1: '', address_line2: '',
  city: '', state: '', pincode: '',
};

interface AddressManagerProps {
  userId: string;
}

export const AddressManager = ({ userId }: AddressManagerProps) => {
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const { toast } = useToast();

  const fetchAddresses = async () => {
    const { data } = await supabase
      .from('addresses')
      .select('*')
      .eq('user_id', userId)
      .order('is_default', { ascending: false });
    setAddresses(data || []);
    setLoading(false);
  };

  useEffect(() => { fetchAddresses(); }, [userId]);

  const handleEdit = (addr: Address) => {
    setEditingId(addr.id);
    setForm({
      full_name: addr.full_name,
      phone: addr.phone,
      address_line1: addr.address_line1,
      address_line2: addr.address_line2 || '',
      city: addr.city,
      state: addr.state,
      pincode: addr.pincode,
    });
    setShowForm(true);
  };

  const handleAdd = () => {
    setEditingId(null);
    setForm(emptyForm);
    setShowForm(true);
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingId(null);
    setForm(emptyForm);
  };

  const handleSave = async () => {
    if (!form.full_name.trim() || !form.phone.trim() || !form.address_line1.trim() || !form.city.trim() || !form.state.trim() || !form.pincode.trim()) {
      toast({ title: 'Missing fields', description: 'Please fill all required fields.', variant: 'destructive' });
      return;
    }
    setSaving(true);

    const payload = {
      full_name: form.full_name.trim(),
      phone: form.phone.trim(),
      address_line1: form.address_line1.trim(),
      address_line2: form.address_line2.trim() || null,
      city: form.city.trim(),
      state: form.state.trim(),
      pincode: form.pincode.trim(),
      user_id: userId,
    };

    if (editingId) {
      const { error } = await supabase.from('addresses').update(payload).eq('id', editingId);
      if (error) toast({ title: 'Error', description: error.message, variant: 'destructive' });
      else toast({ title: 'Address updated!' });
    } else {
      const isFirst = addresses.length === 0;
      const { error } = await supabase.from('addresses').insert({ ...payload, is_default: isFirst });
      if (error) toast({ title: 'Error', description: error.message, variant: 'destructive' });
      else toast({ title: 'Address added!' });
    }

    setSaving(false);
    handleCancel();
    fetchAddresses();
  };

  const handleDelete = async (id: string) => {
    setDeletingId(id);
    const { error } = await supabase.from('addresses').delete().eq('id', id);
    if (error) toast({ title: 'Error', description: error.message, variant: 'destructive' });
    else toast({ title: 'Address deleted' });
    setDeletingId(null);
    fetchAddresses();
  };

  const handleSetDefault = async (id: string) => {
    // Remove default from all, then set
    await supabase.from('addresses').update({ is_default: false }).eq('user_id', userId);
    await supabase.from('addresses').update({ is_default: true }).eq('id', id);
    toast({ title: 'Default address updated' });
    fetchAddresses();
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.15 }}
      className="glass-card rounded-2xl p-5 mb-6"
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <MapPin className="w-5 h-5 text-accent" />
          <h2 className="text-lg font-bold">Saved Addresses</h2>
        </div>
        {!showForm && (
          <Button variant="ghost" size="sm" onClick={handleAdd} className="text-accent hover:text-accent">
            <Plus className="w-4 h-4 mr-1" /> Add
          </Button>
        )}
      </div>

      {loading ? (
        <div className="flex justify-center py-6"><Loader2 className="w-5 h-5 animate-spin text-accent" /></div>
      ) : (
        <>
          {/* Form */}
          <AnimatePresence>
            {showForm && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="overflow-hidden"
              >
                <div className="p-4 bg-muted/30 rounded-xl mb-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <p className="font-medium text-sm">{editingId ? 'Edit Address' : 'New Address'}</p>
                    <button onClick={handleCancel}><X className="w-4 h-4 text-muted-foreground" /></button>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="col-span-2 sm:col-span-1">
                      <Label className="text-xs">Full Name *</Label>
                      <Input value={form.full_name} onChange={(e) => setForm({ ...form, full_name: e.target.value })} className="mt-1 h-9 text-sm" />
                    </div>
                    <div className="col-span-2 sm:col-span-1">
                      <Label className="text-xs">Phone *</Label>
                      <Input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} className="mt-1 h-9 text-sm" />
                    </div>
                    <div className="col-span-2">
                      <Label className="text-xs">Address Line 1 *</Label>
                      <Input value={form.address_line1} onChange={(e) => setForm({ ...form, address_line1: e.target.value })} className="mt-1 h-9 text-sm" />
                    </div>
                    <div className="col-span-2">
                      <Label className="text-xs">Address Line 2</Label>
                      <Input value={form.address_line2} onChange={(e) => setForm({ ...form, address_line2: e.target.value })} className="mt-1 h-9 text-sm" />
                    </div>
                    <div>
                      <Label className="text-xs">City *</Label>
                      <Input value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} className="mt-1 h-9 text-sm" />
                    </div>
                    <div>
                      <Label className="text-xs">State *</Label>
                      <Input value={form.state} onChange={(e) => setForm({ ...form, state: e.target.value })} className="mt-1 h-9 text-sm" />
                    </div>
                    <div>
                      <Label className="text-xs">Pincode *</Label>
                      <Input value={form.pincode} onChange={(e) => setForm({ ...form, pincode: e.target.value })} className="mt-1 h-9 text-sm" />
                    </div>
                  </div>
                  <div className="flex gap-2 pt-1">
                    <Button onClick={handleSave} disabled={saving} size="sm" className="btn-luxury flex-1">
                      {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin mr-1" /> : null}
                      {editingId ? 'Update' : 'Save'}
                    </Button>
                    <Button variant="outline" size="sm" onClick={handleCancel}>Cancel</Button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Address List */}
          {addresses.length === 0 && !showForm ? (
            <p className="text-sm text-muted-foreground text-center py-4">No saved addresses yet.</p>
          ) : (
            <div className="space-y-3">
              {addresses.map((addr) => (
                <div key={addr.id} className="p-4 bg-muted/20 rounded-xl relative group">
                  {addr.is_default && (
                    <span className="absolute top-3 right-3 text-[10px] font-semibold px-2 py-0.5 rounded-full bg-accent/15 text-accent">Default</span>
                  )}
                  <p className="font-medium text-sm">{addr.full_name}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {addr.address_line1}{addr.address_line2 ? `, ${addr.address_line2}` : ''}
                  </p>
                  <p className="text-xs text-muted-foreground">{addr.city}, {addr.state} - {addr.pincode}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">📞 {addr.phone}</p>

                  <div className="flex items-center gap-2 mt-3">
                    <Button variant="ghost" size="sm" className="h-7 text-xs" onClick={() => handleEdit(addr)}>
                      <Pencil className="w-3 h-3 mr-1" /> Edit
                    </Button>
                    <Button variant="ghost" size="sm" className="h-7 text-xs text-destructive hover:text-destructive" onClick={() => handleDelete(addr.id)} disabled={deletingId === addr.id}>
                      {deletingId === addr.id ? <Loader2 className="w-3 h-3 animate-spin mr-1" /> : <Trash2 className="w-3 h-3 mr-1" />}
                      Delete
                    </Button>
                    {!addr.is_default && (
                      <Button variant="ghost" size="sm" className="h-7 text-xs text-accent hover:text-accent" onClick={() => handleSetDefault(addr.id)}>
                        <Check className="w-3 h-3 mr-1" /> Set Default
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </motion.div>
  );
};
