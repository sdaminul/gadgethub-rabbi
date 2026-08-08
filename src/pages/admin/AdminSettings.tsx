import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { AdminLayout } from './AdminLayout';
import { useSettings } from '@/lib/hooks';
import { uploadImage } from '@/lib/utils';
import type { SiteSettings } from '@/lib/types';
import { Save, Loader2, AlertCircle, CheckCircle2, Upload, X } from 'lucide-react';

export function AdminSettings() {
  const { settings, loading } = useSettings();
  const [form, setForm] = useState<Partial<SiteSettings>>({});
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const [uploading, setUploading] = useState<string | null>(null);

  useEffect(() => {
    if (settings) setForm(settings);
  }, [settings]);

  const handleImageUpload = async (field: 'logo_url' | 'about_banner_url', file: File | null) => {
    if (!file) return;
    setUploading(field);
    try {
      const url = await uploadImage(file, 'site');
      setForm((f) => ({ ...f, [field]: url }));
    } catch (e: any) {
      setError(e.message);
    }
    setUploading(null);
  };

  const handleSave = async () => {
    setSaving(true);
    setError(null);
    setSaved(false);
    try {
      if (settings?.id) {
        const { error: e } = await supabase
          .from('site_settings')
          .update(form)
          .eq('id', settings.id);
        if (e) throw new Error(e.message);
      } else {
        const { error: e } = await supabase.from('site_settings').insert(form);
        if (e) throw new Error(e.message);
      }
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (e: any) {
      setError(e.message);
    }
    setSaving(false);
  };

  if (loading) {
    return (
      <AdminLayout active="settings">
        <div className="h-64 skeleton rounded-2xl" />
      </AdminLayout>
    );
  }

  return (
    <AdminLayout active="settings">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-700 text-ink-900">Site Settings</h1>
          <p className="mt-1 text-ink-500">Manage your website information, contact details, and social links.</p>
        </div>
        <button
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-2 rounded-xl bg-brand-600 px-4 py-2.5 text-sm font-600 text-white hover:bg-brand-500 disabled:opacity-60"
        >
          {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
          Save Changes
        </button>
      </div>

      {error && (
        <div className="mb-6 flex items-center gap-2 rounded-xl bg-error/10 px-4 py-3 text-sm text-error">
          <AlertCircle size={16} /> {error}
        </div>
      )}
      {saved && (
        <div className="mb-6 flex items-center gap-2 rounded-xl bg-success/10 px-4 py-3 text-sm text-success">
          <CheckCircle2 size={16} /> Settings saved successfully!
        </div>
      )}

      <div className="space-y-6">
        <Section title="General">
          <div className="grid sm:grid-cols-2 gap-4">
            <Field label="Site Name">
              <input type="text" value={form.site_name || ''} onChange={(e) => setForm({ ...form, site_name: e.target.value })} className={inputClass} />
            </Field>
            <Field label="Tagline">
              <input type="text" value={form.tagline || ''} onChange={(e) => setForm({ ...form, tagline: e.target.value })} className={inputClass} />
            </Field>
          </div>
        </Section>

        <Section title="About Page">
          <Field label="About Title">
            <input type="text" value={form.about_title || ''} onChange={(e) => setForm({ ...form, about_title: e.target.value })} className={inputClass} />
          </Field>
          <Field label="About Description">
            <textarea value={form.about_description || ''} onChange={(e) => setForm({ ...form, about_description: e.target.value })} rows={4} className={inputClass} />
          </Field>
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <span className="block text-sm font-600 text-ink-700 mb-1.5">Logo</span>
              {form.logo_url ? (
                <div className="relative inline-block">
                  <img src={form.logo_url} alt="" className="h-20 w-20 rounded-xl object-cover border border-ink-200" />
                  <button onClick={() => setForm({ ...form, logo_url: null })} className="absolute -top-2 -right-2 flex h-6 w-6 items-center justify-center rounded-full bg-error text-white">
                    <X size={12} />
                  </button>
                </div>
              ) : (
                <label className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-ink-200 bg-ink-50 p-6 cursor-pointer hover:border-brand-400 h-20 w-20">
                  <Upload size={16} className="text-ink-400" />
                  <input type="file" accept="image/*" className="hidden" onChange={(e) => handleImageUpload('logo_url', e.target.files?.[0] || null)} />
                </label>
              )}
            </div>
            <div>
              <span className="block text-sm font-600 text-ink-700 mb-1.5">About Banner</span>
              {form.about_banner_url ? (
                <div className="relative inline-block">
                  <img src={form.about_banner_url} alt="" className="h-20 w-40 rounded-xl object-cover border border-ink-200" />
                  <button onClick={() => setForm({ ...form, about_banner_url: null })} className="absolute -top-2 -right-2 flex h-6 w-6 items-center justify-center rounded-full bg-error text-white">
                    <X size={12} />
                  </button>
                </div>
              ) : (
                <label className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-ink-200 bg-ink-50 p-6 cursor-pointer hover:border-brand-400 h-20 w-40">
                  <Upload size={16} className="text-ink-400" />
                  <input type="file" accept="image/*" className="hidden" onChange={(e) => handleImageUpload('about_banner_url', e.target.files?.[0] || null)} />
                </label>
              )}
            </div>
          </div>
        </Section>

        <Section title="Contact Information">
          <div className="grid sm:grid-cols-2 gap-4">
            <Field label="Phone Number">
              <input type="text" value={form.phone || ''} onChange={(e) => setForm({ ...form, phone: e.target.value })} className={inputClass} />
            </Field>
            <Field label="WhatsApp Number">
              <input type="text" value={form.whatsapp || ''} onChange={(e) => setForm({ ...form, whatsapp: e.target.value })} className={inputClass} placeholder="+1234567890" />
            </Field>
            <Field label="Email">
              <input type="email" value={form.email || ''} onChange={(e) => setForm({ ...form, email: e.target.value })} className={inputClass} />
            </Field>
            <Field label="Address">
              <input type="text" value={form.address || ''} onChange={(e) => setForm({ ...form, address: e.target.value })} className={inputClass} />
            </Field>
          </div>
          <Field label="Google Map Embed URL">
            <input type="text" value={form.map_embed_url || ''} onChange={(e) => setForm({ ...form, map_embed_url: e.target.value })} className={inputClass} placeholder="https://www.google.com/maps/embed?..." />
          </Field>
        </Section>

        <Section title="Social Links">
          <div className="grid sm:grid-cols-2 gap-4">
            <Field label="Facebook URL">
              <input type="url" value={form.facebook_url || ''} onChange={(e) => setForm({ ...form, facebook_url: e.target.value })} className={inputClass} />
            </Field>
            <Field label="Instagram URL">
              <input type="url" value={form.instagram_url || ''} onChange={(e) => setForm({ ...form, instagram_url: e.target.value })} className={inputClass} />
            </Field>
            <Field label="Twitter/X URL">
              <input type="url" value={form.twitter_url || ''} onChange={(e) => setForm({ ...form, twitter_url: e.target.value })} className={inputClass} />
            </Field>
            <Field label="LinkedIn URL">
              <input type="url" value={form.linkedin_url || ''} onChange={(e) => setForm({ ...form, linkedin_url: e.target.value })} className={inputClass} />
            </Field>
          </div>
        </Section>
      </div>
    </AdminLayout>
  );
}

const inputClass =
  'w-full rounded-xl border border-ink-200 bg-white px-3.5 py-2.5 text-sm text-ink-900 outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20';

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-ink-200/60 bg-white p-6 shadow-card">
      <h2 className="font-display text-lg font-700 text-ink-900 mb-4">{title}</h2>
      <div className="space-y-4">{children}</div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="block text-sm font-600 text-ink-700 mb-1.5">{label}</span>
      {children}
    </label>
  );
}
