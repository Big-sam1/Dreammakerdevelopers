import React, { useEffect } from 'react';
import { BrowserRouter, Route, Routes, useLocation } from 'react-router-dom';
import { Layout } from './components/Layout';
import { Home } from './pages/Home';
import { About } from './pages/About';
import { Services } from './pages/Services';
import { Projects } from './pages/Projects';
import { News } from './pages/News';
import { Contact } from './pages/Contact';
import { StartProject } from './pages/StartProject';
import { NotFound } from './pages/NotFound';
import { AdminLogin } from './pages/admin/AdminLogin';
import { AdminDashboard } from './pages/admin/AdminDashboard';
import { CMSProvider, useCMS } from './context/CMSContext';

function DynamicFaviconHandler() {
  const { cms } = useCMS();

  useEffect(() => {
    if (cms.favicon) {
      let link: HTMLLinkElement | null = document.querySelector("link[rel~='icon']");
      if (!link) {
        link = document.createElement('link');
        link.rel = 'icon';
        document.head.appendChild(link);
      }
      link.href = cms.favicon;
    }
  }, [cms.favicon]);

  return null;
}

/**
 * Hides the Chatway live-chat widget on all /admin/* routes so it only
 * appears for public site visitors, not the admin team.
 */
function ChatwayGuard() {
  const { pathname } = useLocation();
  const isAdmin = pathname.startsWith('/admin');

  useEffect(() => {
    const chatwayEl = document.getElementById('chatway');
    // Also target the iframe/widget container Chatway injects into the body
    const chatwayContainer = document.querySelector('[id^="chatway"]') as HTMLElement | null;

    const setChatwayVisibility = (visible: boolean) => {
      // Hide/show the script tag itself (no visual effect, but signals intent)
      if (chatwayEl) {
        (chatwayEl as HTMLElement).style.display = visible ? '' : 'none';
      }
      // Chatway injects a widget container with class or id — hide all of them
      document.querySelectorAll<HTMLElement>(
        '[id*="chatway"], [class*="chatway"], iframe[src*="chatway"]'
      ).forEach((el) => {
        el.style.setProperty('display', visible ? '' : 'none', 'important');
        el.style.setProperty('visibility', visible ? '' : 'hidden', 'important');
        el.style.setProperty('pointer-events', visible ? '' : 'none', 'important');
      });
    };

    setChatwayVisibility(!isAdmin);

    // Chatway loads async — observe the DOM for its injected widget bubble
    const observer = new MutationObserver(() => {
      setChatwayVisibility(!isAdmin);
    });
    observer.observe(document.body, { childList: true, subtree: false });

    return () => observer.disconnect();
  }, [isAdmin]);

  return null;
}

export function App() {
  return (
    <CMSProvider>
      <DynamicFaviconHandler />
      <BrowserRouter>
        <ChatwayGuard />
        <Routes>
          {/* Admin Routes (Standalone dashboard shell — Chatway hidden here) */}
          <Route path="/admin/login" element={<AdminLogin />} />
          <Route path="/admin" element={<AdminDashboard />} />

          {/* Public Website Routes — Chatway visible */}
          <Route element={<Layout />}>
            <Route path="/" element={<Home />} />
            <Route path="/about" element={<About />} />
            <Route path="/services" element={<Services />} />
            <Route path="/projects" element={<Projects />} />
            <Route path="/news" element={<News />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/start-project" element={<StartProject />} />
            <Route path="/start-a-project" element={<StartProject />} />
            <Route path="*" element={<NotFound />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </CMSProvider>
  );
}