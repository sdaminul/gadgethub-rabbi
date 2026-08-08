import { useState } from 'react';
import { useSettings } from '@/lib/hooks';
import { Breadcrumbs } from '@/components/Breadcrumbs';
import {
  Phone,
  Mail,
  MapPin,
  MessageCircle,
  Send,
  CheckCircle2,
} from 'lucide-react';
import { FacebookIcon } from '@/components/SocialIcons';

export function ContactPage() {
  const { settings } = useSettings();
  const [form, setForm] = useState({ name: '', email: '', message: '' });
  const [sent, setSent] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.message) return;
    const subject = encodeURIComponent(`Contact from ${form.name}`);
    const body = encodeURIComponent(`${form.message}\n\nFrom: ${form.name}\nEmail: ${form.email}`);
    window.location.href = `mailto:${settings?.email || 'hello@lumiere.example'}?subject=${subject}&body=${body}`;
    setSent(true);
    setForm({ name: '', email: '', message: '' });
    setTimeout(() => setSent(false), 5000);
  };

  const whatsappNumber = settings?.whatsapp?.replace(/[^0-9]/g, '') || '';

  return (
    <div className="min-h-screen bg-ink-50 animate-fade-in">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
        <Breadcrumbs items={[{ label: 'Contact' }]} />

        <div className="mt-8 mb-10">
          <h1 className="font-display text-3xl sm:text-4xl font-800 text-ink-900">Get in Touch</h1>
          <p className="mt-2 text-ink-500">We'd love to hear from you. Reach out through any of these channels.</p>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          <div className="space-y-4">
            {settings?.phone && (
              <ContactCard
                icon={<Phone size={20} />}
                title="Phone"
                value={settings.phone}
                href={`tel:${settings.phone}`}
              />
            )}
            {whatsappNumber && (
              <ContactCard
                icon={<MessageCircle size={20} />}
                title="WhatsApp"
                value={settings?.whatsapp || ''}
                href={`https://wa.me/${whatsappNumber}`}
                accent="success"
              />
            )}
            {settings?.email && (
              <ContactCard
                icon={<Mail size={20} />}
                title="Email"
                value={settings.email}
                href={`mailto:${settings.email}`}
              />
            )}
            {settings?.facebook_url && (
              <ContactCard
                icon={<FacebookIcon size={20} />}
                title="Facebook"
                value="Visit our page"
                href={settings.facebook_url}
              />
            )}
            {settings?.address && (
              <div className="rounded-2xl border border-ink-200/60 bg-white p-6 shadow-card">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-brand-50 text-brand-600">
                  <MapPin size={20} />
                </div>
                <h3 className="mt-4 font-display text-lg font-700 text-ink-900">Address</h3>
                <p className="mt-2 text-sm text-ink-600 leading-relaxed">{settings.address}</p>
              </div>
            )}
          </div>

          <div className="lg:col-span-2 space-y-6">
            <div className="rounded-2xl border border-ink-200/60 bg-white p-6 shadow-card sm:p-8">
              <h2 className="font-display text-xl font-700 text-ink-900">Send us a message</h2>
              <p className="mt-1 text-sm text-ink-500">Fill out the form below and we'll get back to you.</p>
              {sent ? (
                <div className="mt-6 flex items-center gap-3 rounded-xl bg-success/10 p-4 text-success">
                  <CheckCircle2 size={20} />
                  <span className="font-600">Your email client has opened. Thank you for reaching out!</span>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="mt-6 space-y-4">
                  <div className="grid sm:grid-cols-2 gap-4">
                    <Field label="Your Name">
                      <input
                        type="text"
                        required
                        value={form.name}
                        onChange={(e) => setForm({ ...form, name: e.target.value })}
                        className="w-full rounded-xl border border-ink-200 bg-ink-50 px-4 py-3 text-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20"
                      />
                    </Field>
                    <Field label="Email">
                      <input
                        type="email"
                        required
                        value={form.email}
                        onChange={(e) => setForm({ ...form, email: e.target.value })}
                        className="w-full rounded-xl border border-ink-200 bg-ink-50 px-4 py-3 text-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20"
                      />
                    </Field>
                  </div>
                  <Field label="Message">
                    <textarea
                      required
                      rows={5}
                      value={form.message}
                      onChange={(e) => setForm({ ...form, message: e.target.value })}
                      className="w-full rounded-xl border border-ink-200 bg-ink-50 px-4 py-3 text-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 resize-none"
                    />
                  </Field>
                  <button
                    type="submit"
                    className="flex items-center gap-2 rounded-xl bg-brand-600 px-6 py-3 text-sm font-700 text-white hover:bg-brand-500 transition-colors"
                  >
                    <Send size={16} /> Send Message
                  </button>
                </form>
              )}
            </div>

            {settings?.map_embed_url ? (
              <div className="rounded-2xl border border-ink-200/60 bg-white p-2 shadow-card overflow-hidden">
                <iframe
                  src={settings.map_embed_url}
                  className="w-full h-72 rounded-xl border-0"
                  loading="lazy"
                  title="Location map"
                />
              </div>
            ) : (
              <div className="rounded-2xl border border-ink-200/60 bg-white shadow-card overflow-hidden">
                <iframe
                  src="https://www.openstreetmap.org/export/embed.html?bbox=-122.43%2C37.76%2C-122.39%2C37.80&layer=mapnik"
                  className="w-full h-72 border-0"
                  loading="lazy"
                  title="Location map"
                />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function ContactCard({
  icon,
  title,
  value,
  href,
  accent = 'brand',
}: {
  icon: React.ReactNode;
  title: string;
  value: string;
  href: string;
  accent?: 'brand' | 'success';
}) {
  const colors =
    accent === 'success'
      ? 'bg-success/10 text-success'
      : 'bg-brand-50 text-brand-600';
  return (
    <a
      href={href}
      target={href.startsWith('http') ? '_blank' : undefined}
      rel="noopener noreferrer"
      className="flex items-center gap-4 rounded-2xl border border-ink-200/60 bg-white p-6 shadow-card hover:shadow-float hover:-translate-y-0.5 transition-all"
    >
      <div className={`flex h-12 w-12 items-center justify-center rounded-xl ${colors}`}>
        {icon}
      </div>
      <div className="min-w-0">
        <h3 className="font-display text-lg font-700 text-ink-900">{title}</h3>
        <p className="text-sm text-ink-600 truncate">{value}</p>
      </div>
    </a>
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
