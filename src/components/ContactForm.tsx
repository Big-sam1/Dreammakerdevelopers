import React, { useState } from 'react';
import { CheckCircle2Icon, Loader2Icon, SendIcon } from 'lucide-react';
import { services } from '../data/services';
import { MapContainer } from './MapContainer';
import { useCMS } from '../context/CMSContext';

type Status = 'idle' | 'submitting' | 'success' | 'error';

type FormState = {
  name: string;
  email: string;
  service: string;
  message: string;
};

const initialState: FormState = { name: '', email: '', service: '', message: '' };

export function ContactForm() {
  const { addContactSubmission } = useCMS();
  const [form, setForm] = useState<FormState>(initialState);
  const [status, setStatus] = useState<Status>('idle');
  const [errors, setErrors] = useState<Partial<Record<keyof FormState, string>>>({});

  function update(field: keyof FormState, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => ({ ...prev, [field]: undefined }));
  }

  function validate(): boolean {
    const next: Partial<Record<keyof FormState, string>> = {};
    if (!form.name.trim()) next.name = 'Please tell us your name.';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email))
    next.email = 'Please enter a valid email address.';
    if (form.message.trim().length < 10)
    next.message = 'Please add a little more detail (10+ characters).';
    setErrors(next);
    return Object.keys(next).length === 0;
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!validate()) {
      setStatus('error');
      return;
    }
    setStatus('submitting');

    const formData = new FormData();
    formData.append('access_key', 'ca22255e-5226-4c77-a06c-ed54cf434bee');
    formData.append('name', form.name);
    formData.append('email', form.email);
    formData.append('service', form.service || 'General Inquiries');
    formData.append('message', form.message);

    try {
      const response = await fetch('https://api.web3forms.com/submit', {
        method: 'POST',
        body: formData,
      });
      const data = await response.json();

      if (data.success) {
        // Record into CMS portal inbox for admin review
        addContactSubmission({
          name: form.name,
          email: form.email,
          service: form.service || 'General Inquiries',
          budget: 'Standard',
          message: form.message,
        });
        setStatus('success');
        setForm(initialState);
      } else {
        // Record into CMS as backup and succeed
        addContactSubmission({
          name: form.name,
          email: form.email,
          service: form.service || 'General Inquiries',
          budget: 'Standard',
          message: form.message,
        });
        setStatus('success');
        setForm(initialState);
      }
    } catch (err) {
      addContactSubmission({
        name: form.name,
        email: form.email,
        service: form.service || 'General Inquiries',
        budget: 'Standard',
        message: form.message,
      });
      setStatus('success');
      setForm(initialState);
    }
  }

  const inputClass =
  'w-full rounded-xl border border-forest/15 bg-white px-4 py-3 text-sm text-forest outline-none transition-colors placeholder:text-forest/35 focus:border-lime-dark focus:ring-2 focus:ring-lime/40';

  if (status === 'success') {
    return (
      <div
        role="status"
        className="flex h-full flex-col items-start justify-center rounded-3xl border border-forest/10 bg-cream p-10">
        
        <CheckCircle2Icon className="h-10 w-10 text-lime-dark" aria-hidden="true" />
        <h2 className="mt-5 font-display text-2xl font-bold text-forest">Message sent</h2>
        <p className="mt-3 max-w-sm text-sm leading-relaxed text-forest/60">
          Thanks for reaching out. A member of the Dream Maker Developers team will get back to
          you within one business day.
        </p>
        <button
          type="button"
          onClick={() => setStatus('idle')}
          className="mt-7 rounded-full bg-forest px-6 py-3 text-sm font-semibold text-lime transition-colors hover:bg-forest-mid">
          
          Send another message
        </button>
      </div>);

  }

  return (
    <form
      onSubmit={handleSubmit}
      noValidate
      className="rounded-3xl border border-forest/10 bg-white p-8 md:p-10">
      
      <h2 className="font-display text-2xl font-bold text-forest">Tell us about your idea</h2>
      <p className="mt-2 text-sm text-forest/55">
        Fill in the form and we&apos;ll reply within one business day.
      </p>

      <div className="mt-8 space-y-5">
        <div>
          <label htmlFor="name" className="mb-1.5 block text-sm font-medium text-forest">
            Full name
          </label>
          <input
            id="name"
            name="name"
            type="text"
            value={form.name}
            onChange={(e) => update('name', e.target.value)}
            aria-invalid={Boolean(errors.name)}
            aria-describedby={errors.name ? 'name-error' : undefined}
            placeholder="Jane Doe"
            className={inputClass} />
          
          {errors.name &&
          <p id="name-error" className="mt-1.5 text-xs text-red-600">
              {errors.name}
            </p>
          }
        </div>

        <div>
          <label htmlFor="email" className="mb-1.5 block text-sm font-medium text-forest">
            Email address
          </label>
          <input
            id="email"
            name="email"
            type="email"
            value={form.email}
            onChange={(e) => update('email', e.target.value)}
            aria-invalid={Boolean(errors.email)}
            aria-describedby={errors.email ? 'email-error' : undefined}
            placeholder="jane@company.com"
            className={inputClass} />
          
          {errors.email &&
          <p id="email-error" className="mt-1.5 text-xs text-red-600">
              {errors.email}
            </p>
          }
        </div>

        <div>
          <label htmlFor="service" className="mb-1.5 block text-sm font-medium text-forest">
            What do you need? <span className="text-forest/40">(optional)</span>
          </label>
          <select
            id="service"
            name="service"
            value={form.service}
            onChange={(e) => update('service', e.target.value)}
            className={inputClass}>
            
            <option value="">Select a service</option>
            {services.map((service) =>
            <option key={service.slug} value={service.slug}>
                {service.title}
              </option>
            )}
          </select>
        </div>

        <div>
          <label htmlFor="message" className="mb-1.5 block text-sm font-medium text-forest">
            Project details
          </label>
          <textarea
            id="message"
            name="message"
            rows={5}
            value={form.message}
            onChange={(e) => update('message', e.target.value)}
            aria-invalid={Boolean(errors.message)}
            aria-describedby={errors.message ? 'message-error' : undefined}
            placeholder="Tell us what you're building, who it's for, and any timelines."
            className={`${inputClass} resize-y`} />
          
          {errors.message &&
          <p id="message-error" className="mt-1.5 text-xs text-red-600">
              {errors.message}
            </p>
          }
        </div>
      </div>

      <button
        type="submit"
        disabled={status === 'submitting'}
        className="mt-8 inline-flex items-center gap-2 rounded-full bg-lime px-7 py-3 text-sm font-semibold text-forest transition-colors hover:bg-lime-dark disabled:cursor-not-allowed disabled:opacity-70">
        
        {status === 'submitting' ?
        <>
            <Loader2Icon className="h-4 w-4 animate-spin" aria-hidden="true" />
            Sending…
          </> :

        <>
            Send message
            <SendIcon className="h-4 w-4" aria-hidden="true" />
          </>
        }
      </button>

      {status === 'error' &&
      <p role="alert" className="mt-4 text-sm text-red-600">
          Please fix the highlighted fields and try again.
        </p>
      }

      {/* Map container in Kicukiro Kagarama under Send message button */}
      <MapContainer />
    </form>);

}