import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldCheck, Lock, Mail, ArrowRight, Sparkles } from 'lucide-react';
import { useCMS } from '../../context/CMSContext';
import { loginWithSupabase } from '../../lib/supabase';

export function AdminLogin() {
  const navigate = useNavigate();
  const { cms } = useCMS();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showGuide, setShowGuide] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await loginWithSupabase(email, password);

      if (res.success) {
        sessionStorage.setItem('dmd_admin_auth', 'true');
        localStorage.setItem('dmd_admin_auth', 'true');
        navigate('/admin');
      } else {
        setError(res.error || 'Access denied: Invalid credentials.');
      }
    } catch (err: any) {
      setError('Connection error verifying credentials with Supabase.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-forest-deep flex flex-col justify-center items-center px-4 py-12 relative overflow-hidden text-cream selection:bg-lime selection:text-forest">
      {/* Background ambient lighting in DMD green & lime */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-forest rounded-full blur-[140px] opacity-60 pointer-events-none" />
      <div className="absolute -bottom-32 -right-32 w-96 h-96 bg-lime/10 rounded-full blur-[120px] pointer-events-none" />

      <div className="w-full max-w-md relative z-10">
        {/* Brand Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-forest border border-lime/30 shadow-xl shadow-lime/5 mb-4 group transition-transform hover:scale-105">
            {cms.adminProfile?.portalLogo || cms.navLogo ? (
              <img
                src={cms.adminProfile?.portalLogo || cms.navLogo}
                alt="Logo"
                className="w-10 h-10 object-contain"
              />
            ) : (
              <ShieldCheck className="w-8 h-8 text-lime" />
            )}
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-cream">
            DMD Management Portal
          </h1>
          <p className="text-cream/60 text-sm mt-1.5">
            Authorized Personnel Only &bull; Supabase Guard
          </p>
        </div>

        {/* Auth Card */}
        <div className="bg-forest/80 backdrop-blur-xl border border-cream/10 rounded-2xl p-6 sm:p-8 shadow-2xl relative">
          {error && (
            <div className="mb-5 p-3.5 rounded-lg bg-red-500/10 border border-red-500/30 text-red-300 text-xs leading-relaxed">
              {error}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
              <>
                <div>
                  <label className="block text-xs font-medium text-cream/70 mb-1.5">
                    Authorized Admin Email
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-cream/40 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      placeholder="admin@dreammakerdevelopers.com"
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-forest-deep/60 border border-cream/10 text-cream text-sm placeholder:text-cream/30 focus:outline-none focus:border-lime focus:ring-1 focus:ring-lime transition-all"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-cream/70 mb-1.5">
                    Admin Password
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-cream/40 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      placeholder="Enter your admin password"
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-forest-deep/60 border border-cream/10 text-cream text-sm placeholder:text-cream/30 focus:outline-none focus:border-lime focus:ring-1 focus:ring-lime transition-all"
                    />
                  </div>
                </div>
              </>

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 py-3 px-4 rounded-xl bg-lime hover:bg-lime/90 text-forest font-semibold text-sm flex items-center justify-center gap-2 transition-all shadow-lg shadow-lime/10 disabled:opacity-50 cursor-pointer"
            >
              {loading ? (
                <span>Verifying with Supabase...</span>
              ) : (
                <>
                  <span>Sign In to Dashboard</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Supabase setup helper */}
          <div className="mt-5 pt-4 border-t border-cream/10 text-center">
            <button
              type="button"
              onClick={() => setShowGuide(!showGuide)}
              className="text-[11px] text-lime hover:underline font-medium cursor-pointer"
            >
              {showGuide ? 'Hide setup guide' : 'Need help setting up admin access?'}
            </button>

            {showGuide && (
              <div className="mt-3 p-3.5 bg-forest-deep/80 rounded-xl border border-lime/20 text-left text-[11px] text-cream/80 space-y-2 leading-relaxed">
                <p className="font-semibold text-lime">How to configure the first admin:</p>
                <ol className="list-decimal list-inside space-y-1 text-cream/70">
                  <li>Set <strong>ADMIN_EMAIL</strong> and <strong>ADMIN_PASSWORD</strong> in the server <code>.env</code> file.</li>
                  <li>Start the API server. The first login automatically creates your admin record in Supabase.</li>
                </ol>
              </div>
            )}
          </div>
        </div>

        {/* Back to main site link */}
        <div className="text-center mt-6">
          <a
            href="/"
            className="text-xs text-cream/50 hover:text-cream transition-colors"
          >
            &larr; Return to Dream Maker Developers public site
          </a>
        </div>
      </div>
    </div>
  );
}
