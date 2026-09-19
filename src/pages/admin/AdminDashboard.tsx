import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Palette,
  BarChart3,
  MessageSquareQuote,
  Users,
  Building2,
  Video,
  Wrench,
  FolderGit2,
  Newspaper,
  Image as ImageIcon,
  Share2,
  Inbox,
  LogOut,
  Upload,
  Plus,
  Trash2,
  ExternalLink,
  Globe2,
  Sparkles,
  Smartphone,
  Monitor,
  Activity,
  Layers,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Sun,
  Moon,
  MapPin,
  CheckSquare,
  Square,
  Eye,
  EyeOff,
  UserCheck,
  KeyRound,
  Edit3,
  X,
  Menu
} from 'lucide-react';
import {
  useCMS,
  ServiceItem,
  ProjectItem,
  NewsItem,
  TestimonialItem,
  TeamMemberItem,
  BranchLocation,
} from '../../context/CMSContext';
import { makeCircularFavicon, saveCmsStateToSupabase, uploadImageToSupabase } from '../../lib/supabase';
import { BackToTop } from '../../components/BackToTop';
import mapsImage from '../../data/maps.png';

type TabType =
  | 'overview'
  | 'map'
  | 'branding'
  | 'titles'
  | 'stats'
  | 'testimonials'
  | 'team'
  | 'partners'
  | 'workflow'
  | 'services'
  | 'projects'
  | 'news'
  | 'workspaces'
  | 'company'
  | 'heroes'
  | 'ctas'
  | 'inbox'
  | 'profile';

// Generic Pagination component
function PaginationBar({
  currentPage,
  totalItems,
  pageSize,
  onPageChange,
  isLight,
}: {
  currentPage: number;
  totalItems: number;
  pageSize: number;
  onPageChange: (page: number) => void;
  isLight: boolean;
}) {
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
  if (totalPages <= 1) return null;

  return (
    <div className="flex items-center justify-between pt-4 border-t border-cream/10 text-xs">
      <span className={isLight ? 'text-gray-500' : 'text-cream/50'}>
        Showing {totalItems > 0 ? (currentPage - 1) * pageSize + 1 : 0} -{' '}
        {Math.min(currentPage * pageSize, totalItems)} of {totalItems} items
      </span>
      <div className="flex items-center gap-2">
        <button
          type="button"
          disabled={currentPage === 1}
          onClick={() => onPageChange(currentPage - 1)}
          className={`p-1.5 rounded-lg border disabled:opacity-30 disabled:cursor-not-allowed transition-colors ${
            isLight
              ? 'border-gray-200 text-gray-700 hover:bg-gray-100'
              : 'border-cream/15 text-cream/80 hover:bg-forest-deep'
          }`}
        >
          <ChevronLeft className="w-4 h-4" />
        </button>
        <span className={`px-2 font-medium ${isLight ? 'text-gray-800' : 'text-cream'}`}>
          Page {currentPage} of {totalPages}
        </span>
        <button
          type="button"
          disabled={currentPage === totalPages}
          onClick={() => onPageChange(currentPage + 1)}
          className={`p-1.5 rounded-lg border disabled:opacity-30 disabled:cursor-not-allowed transition-colors ${
            isLight
              ? 'border-gray-200 text-gray-700 hover:bg-gray-100'
              : 'border-cream/15 text-cream/80 hover:bg-forest-deep'
          }`}
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}

export function AdminDashboard() {
  const navigate = useNavigate();
  const {
    cms,
    syncStatus,
    updateCMS,
    updateStats,
    updateCompany,
    updateSocialLinks,
    updateLogos,
    updateWorkflow,
    updateWorkspaceImages,
    updatePageHero,
    updateCtaSection,
    updateHeroDescription,
    addProject,
    updateProject,
    deleteProject,
    addNewsArticle,
    updateNewsArticle,
    deleteNewsArticle,
    addTestimonial,
    updateTestimonial,
    deleteTestimonial,
    updateTeamMember,
    addTeamMember,
    deleteTeamMember,
    updatePartnerImages,
    updateService,
    addBranch,
    updateBranch,
    deleteBranch,
    updateAdminProfile,
    updateWebsiteBackground,
    updateSectionTitles,
    markSubmissionsRead,
    deleteSubmissions,
    resetToDefaults,
  } = useCMS();

  // Authentication check
  useEffect(() => {
    const isAuth =
      sessionStorage.getItem('dmd_admin_auth') ||
      localStorage.getItem('dmd_admin_auth');
    // A dashboard marker alone is not enough: uploads and Supabase writes
    // require the real Vercel API session token.
    if (!isAuth || !localStorage.getItem('dmd_admin_token')) {
      navigate('/admin/login');
    }
  }, [navigate]);

  const [activeTab, setActiveTab] = useState<TabType>('overview');
  const [themeMode, setThemeMode] = useState<'light' | 'dark'>(() =>
    localStorage.getItem('dmd_admin_theme') === 'light' ? 'light' : 'dark'
  );
  const [saveToast, setSaveToast] = useState<string | null>(null);
  const [uploadingField, setUploadingField] = useState<string | null>(null);

  const isLight = themeMode === 'light';
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  const handleTabSelect = (tab: TabType) => {
    setActiveTab(tab);
    setMobileSidebarOpen(false);
  };

  useEffect(() => {
    localStorage.setItem('dmd_admin_theme', themeMode);
  }, [themeMode]);

  const showToast = (message: string) => {
    setSaveToast(message);
    setTimeout(() => setSaveToast(null), 3000);
  };

  const handleLogout = () => {
    sessionStorage.removeItem('dmd_admin_auth');
    localStorage.removeItem('dmd_admin_auth');
    localStorage.removeItem('dmd_admin_token');
    navigate('/admin/login');
  };

  // Permanent media upload helper
  const handleFileUpload = async (
    e: React.ChangeEvent<HTMLInputElement>,
    fieldName: string,
    onUploaded: (url: string) => void | Promise<void>
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingField(fieldName);
    try {
      const publicUrl = await uploadImageToSupabase(
        fieldName === 'favicon' ? await makeCircularFavicon(file) : file
      );
      await onUploaded(publicUrl);
    } catch (err) {
      console.error('Failed to upload image:', err);
      showToast(err instanceof Error ? err.message : 'Upload failed. Please check your connection.');
    } finally {
      setUploadingField(null);
    }
  };

  // Website custom full-page background & transparent containers
  const bg = cms.websiteBackground;
  const hasCustomBg = Boolean(bg && bg.enabled && bg.imageUrl);

  // Theme container classes (supports glassmorphic transparent mode for admin)
  const mainBgClass = hasCustomBg
    ? isLight
      ? 'dmd-admin-glass-mode text-gray-900'
      : 'dmd-admin-glass-mode text-cream'
    : isLight
    ? 'bg-[#f4f6f8] text-gray-900'
    : 'bg-forest-deep text-cream';

  const cardBgClass = hasCustomBg
    ? isLight
      ? 'bg-white/60 backdrop-blur-xl border-white/60 shadow-lg text-gray-900'
      : 'bg-forest/35 backdrop-blur-xl border-cream/15 shadow-2xl text-cream'
    : isLight
    ? 'bg-white border-gray-200/80 shadow-sm'
    : 'bg-forest/70 border-cream/10';

  const inputBgClass = hasCustomBg
    ? isLight
      ? 'bg-white/70 border-gray-300 text-gray-900 focus:border-forest backdrop-blur-md placeholder:text-gray-400'
      : 'bg-forest-deep/50 border-cream/20 text-cream focus:border-lime backdrop-blur-md placeholder:text-cream/40'
    : isLight
    ? 'bg-gray-50 border-gray-200 text-gray-900 focus:border-forest'
    : 'bg-forest-deep/60 border-cream/10 text-cream focus:border-lime';

  return (
    <div className={`min-h-screen relative flex font-sans selection:bg-lime selection:text-forest transition-colors duration-200 ${mainBgClass}`}>
      {/* Full-Page Background Image for Admin Portal (when enabled) */}
      {hasCustomBg && (
        <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
          <img
            src={bg.imageUrl}
            alt="Admin Portal Custom Background"
            className="w-full h-full object-cover object-center"
            style={{ opacity: bg.opacity || 0.25 }}
          />
          {/* Transparent crisp overlay so typography & interactive elements remain ultra-sharp */}
          <div
            className={`absolute inset-0 ${
              isLight
                ? 'bg-white/65 backdrop-blur-[2px]'
                : 'bg-forest-deep/60 backdrop-blur-[2px]'
            }`}
          />
        </div>
      )}

      {/* Toast Notification */}
      {saveToast && (
        <div className="fixed top-5 right-5 z-50 flex items-center gap-2 bg-lime text-forest font-semibold text-xs py-2.5 px-4 rounded-xl shadow-2xl animate-fade-in">
          <CheckCircle2 className="w-4 h-4" />
          <span>{saveToast}</span>
        </div>
      )}

      {/* MOBILE SIDEBAR BACKDROP */}
      {mobileSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden transition-opacity"
          onClick={() => setMobileSidebarOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* MOBILE SLIDING SIDEBAR DRAWER (< lg devices & phones) */}
      <aside
        className={`fixed inset-y-0 left-0 w-72 max-w-[85vw] border-r flex flex-col h-full overflow-y-auto text-cream z-50 transition-transform duration-300 lg:hidden ${
          mobileSidebarOpen ? 'translate-x-0' : '-translate-x-full'
        } ${
          hasCustomBg
            ? 'bg-forest/95 backdrop-blur-2xl border-cream/15 shadow-2xl'
            : 'bg-forest border-cream/10 shadow-2xl'
        }`}
      >
        {/* Brand / Portal Header with Close button */}
        <div className="p-4 border-b border-cream/10 flex items-center justify-between">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-xl bg-forest-deep border border-lime/30 flex items-center justify-center overflow-hidden shrink-0">
              {cms.adminProfile?.portalLogo || cms.navLogo ? (
                <img
                  src={cms.adminProfile?.portalLogo || cms.navLogo}
                  alt="Logo"
                  className="w-7 h-7 object-contain"
                />
              ) : (
                <Activity className="w-5 h-5 text-lime" />
              )}
            </div>
            <div className="min-w-0">
              <h2 className="text-sm font-bold text-cream truncate">
                {cms.adminProfile?.name || 'DMD Console'}
              </h2>
              <p className="text-[11px] text-lime flex items-center gap-1.5 font-medium">
                <span className="w-1.5 h-1.5 rounded-full bg-lime animate-pulse" />
                Live &bull; Rwanda HQ
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setMobileSidebarOpen(false)}
            className="p-1.5 rounded-lg text-cream/70 hover:text-cream hover:bg-forest-deep"
            aria-label="Close navigation drawer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Admin Profile Box */}
        <div
          onClick={() => handleTabSelect('profile')}
          className="px-4 py-3 border-b border-cream/5 bg-forest-deep/40 flex items-center gap-3 cursor-pointer hover:bg-forest-deep transition-colors"
        >
          <div className="w-8 h-8 rounded-full overflow-hidden border border-lime/40 flex items-center justify-center bg-lime/20 text-lime font-bold text-xs shrink-0">
            {cms.adminProfile?.avatar ? (
              <img src={cms.adminProfile.avatar} alt="Admin" className="w-full h-full object-cover" />
            ) : (
              'AD'
            )}
          </div>
          <div className="min-w-0 flex-1">
            <div className="text-xs font-semibold text-cream truncate flex items-center justify-between">
              <span>{cms.adminProfile?.name || 'Administrator'}</span>
              <Edit3 className="w-3 h-3 text-cream/40" />
            </div>
            <div className="text-[10px] text-cream/50 truncate font-mono">
              {cms.adminProfile?.email || 'admin@dmd.rw'}
            </div>
          </div>
        </div>

        {/* Mobile Navigation Links */}
        <nav className="p-3 space-y-1 flex-1">
          <div className="px-3 py-1.5 text-[10px] font-bold text-cream/40 uppercase tracking-wider">
            Analytics & Operations
          </div>

          <button
            onClick={() => handleTabSelect('overview')}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-medium transition-all ${
              activeTab === 'overview'
                ? 'bg-lime text-forest font-semibold shadow-md shadow-lime/10'
                : 'text-cream/70 hover:bg-forest-deep hover:text-cream'
            }`}
          >
            <LayoutDashboard className="w-4 h-4" />
            <span>Virtual Map & KPI</span>
          </button>

          <button
            onClick={() => handleTabSelect('map')}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-medium transition-all ${
              activeTab === 'map'
                ? 'bg-lime text-forest font-semibold shadow-md shadow-lime/10'
                : 'text-cream/70 hover:bg-forest-deep hover:text-cream'
            }`}
          >
            <MapPin className="w-4 h-4 text-lime" />
            <span>Map Branches & Pins</span>
          </button>

          <button
            onClick={() => handleTabSelect('inbox')}
            className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-medium transition-all ${
              activeTab === 'inbox'
                ? 'bg-lime text-forest font-semibold shadow-md shadow-lime/10'
                : 'text-cream/70 hover:bg-forest-deep hover:text-cream'
            }`}
          >
            <div className="flex items-center gap-3">
              <Inbox className="w-4 h-4" />
              <span>Submissions Inbox</span>
            </div>
            {cms.projectSubmissions.length + cms.contactSubmissions.length > 0 && (
              <span
                className={`text-[10px] px-1.5 py-0.5 rounded-full font-bold ${
                  activeTab === 'inbox' ? 'bg-forest text-lime' : 'bg-lime/20 text-lime'
                }`}
              >
                {cms.projectSubmissions.length + cms.contactSubmissions.length}
              </span>
            )}
          </button>

          <div className="pt-3 px-3 py-1.5 text-[10px] font-bold text-cream/40 uppercase tracking-wider">
            Customization & Titles
          </div>

          {[
            { id: 'titles', label: 'Section Titles & Text', icon: Edit3 },
            { id: 'branding', label: 'Logos & Favicon', icon: Palette },
            { id: 'heroes', label: 'Page Heroes & Texts', icon: Layers },
            { id: 'ctas', label: 'Call to Action Sections', icon: Sparkles },
            { id: 'stats', label: 'Numbers & Counters', icon: BarChart3 },
            { id: 'testimonials', label: 'Client Stories', icon: MessageSquareQuote },
            { id: 'team', label: 'Our Team (10 Staff)', icon: Users },
            { id: 'partners', label: 'Sliding Partners', icon: Building2 },
            { id: 'workflow', label: 'Workflow Video', icon: Video },
            { id: 'services', label: 'Services (6 Items)', icon: Wrench },
            { id: 'projects', label: 'Projects Showcase', icon: FolderGit2 },
            { id: 'news', label: 'News & Articles', icon: Newspaper },
            { id: 'workspaces', label: 'Kagarama Hub Photos', icon: ImageIcon },
            { id: 'company', label: 'Company & Social Links', icon: Share2 },
            { id: 'profile', label: 'Admin Profile & Security', icon: KeyRound },
          ].map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleTabSelect(item.id as TabType)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-medium transition-all ${
                  isActive
                    ? 'bg-lime text-forest font-semibold shadow-md shadow-lime/10'
                    : 'text-cream/70 hover:bg-forest-deep hover:text-cream'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span className="truncate">{item.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Mobile Drawer Footer */}
        <div className="p-3 border-t border-cream/10 space-y-1">
          <a
            href="/"
            target="_blank"
            rel="noreferrer"
            className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs text-cream/70 hover:text-cream hover:bg-forest-deep transition-all"
          >
            <span className="flex items-center gap-2">
              <Globe2 className="w-4 h-4 text-lime" />
              <span>View Public Site</span>
            </span>
            <ExternalLink className="w-3.5 h-3.5 text-cream/40" />
          </a>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs text-red-400/80 hover:text-red-300 hover:bg-red-500/10 transition-all cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* DESKTOP SIDEBAR (visible on lg screens and up) */}
      <aside
        className={`hidden lg:flex w-64 border-r flex-col shrink-0 min-h-screen sticky top-0 h-screen overflow-y-auto text-cream z-20 transition-all ${
          hasCustomBg
            ? 'bg-forest/45 backdrop-blur-2xl border-cream/15 shadow-2xl'
            : 'bg-forest border-cream/10'
        }`}
      >
        {/* Brand / Portal Header */}
        <div className="p-5 border-b border-cream/10 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-forest-deep border border-lime/30 flex items-center justify-center overflow-hidden shrink-0">
            {cms.adminProfile?.portalLogo || cms.navLogo ? (
              <img
                src={cms.adminProfile?.portalLogo || cms.navLogo}
                alt="Logo"
                className="w-7 h-7 object-contain"
              />
            ) : (
              <Activity className="w-5 h-5 text-lime" />
            )}
          </div>
          <div className="min-w-0">
            <h2 className="text-sm font-bold text-cream truncate">
              {cms.adminProfile?.name || 'DMD Console'}
            </h2>
            <p className="text-[11px] text-lime flex items-center gap-1.5 font-medium">
              <span className="w-1.5 h-1.5 rounded-full bg-lime animate-pulse" />
              Live &bull; Rwanda HQ
            </p>
          </div>
        </div>

        {/* Admin Profile Box */}
        <div
          onClick={() => setActiveTab('profile')}
          className="px-5 py-4 border-b border-cream/5 bg-forest-deep/40 flex items-center gap-3 cursor-pointer hover:bg-forest-deep transition-colors"
        >
          <div className="w-9 h-9 rounded-full overflow-hidden border border-lime/40 flex items-center justify-center bg-lime/20 text-lime font-bold text-xs shrink-0">
            {cms.adminProfile?.avatar ? (
              <img src={cms.adminProfile.avatar} alt="Admin" className="w-full h-full object-cover" />
            ) : (
              'AD'
            )}
          </div>
          <div className="min-w-0 flex-1">
            <div className="text-xs font-semibold text-cream truncate flex items-center justify-between">
              <span>{cms.adminProfile?.name || 'Administrator'}</span>
              <Edit3 className="w-3 h-3 text-cream/40" />
            </div>
            <div className="text-[10px] text-cream/50 truncate font-mono">
              {cms.adminProfile?.email || 'admin@dmd.rw'}
            </div>
          </div>
        </div>

        {/* Navigation Menu */}
        <nav className="p-3 space-y-1 flex-1">
          <div className="px-3 py-1.5 text-[10px] font-bold text-cream/40 uppercase tracking-wider">
            Analytics & Operations
          </div>

          <button
            onClick={() => setActiveTab('overview')}
            className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-medium transition-all ${
              activeTab === 'overview'
                ? 'bg-lime text-forest font-semibold shadow-md shadow-lime/10'
                : 'text-cream/70 hover:bg-forest-deep hover:text-cream'
            }`}
          >
            <LayoutDashboard className="w-4 h-4" />
            <span>Virtual Map & KPI</span>
          </button>

          <button
            onClick={() => setActiveTab('map')}
            className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-medium transition-all ${
              activeTab === 'map'
                ? 'bg-lime text-forest font-semibold shadow-md shadow-lime/10'
                : 'text-cream/70 hover:bg-forest-deep hover:text-cream'
            }`}
          >
            <MapPin className="w-4 h-4 text-lime" />
            <span>Map Branches & Pins</span>
          </button>

          <button
            onClick={() => setActiveTab('inbox')}
            className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium transition-all ${
              activeTab === 'inbox'
                ? 'bg-lime text-forest font-semibold shadow-md shadow-lime/10'
                : 'text-cream/70 hover:bg-forest-deep hover:text-cream'
            }`}
          >
            <div className="flex items-center gap-3">
              <Inbox className="w-4 h-4" />
              <span>Submissions Inbox</span>
            </div>
            {cms.projectSubmissions.length + cms.contactSubmissions.length > 0 && (
              <span
                className={`text-[10px] px-1.5 py-0.5 rounded-full font-bold ${
                  activeTab === 'inbox' ? 'bg-forest text-lime' : 'bg-lime/20 text-lime'
                }`}
              >
                {cms.projectSubmissions.length + cms.contactSubmissions.length}
              </span>
            )}
          </button>

          <div className="pt-3 px-3 py-1.5 text-[10px] font-bold text-cream/40 uppercase tracking-wider">
            Customization & Titles
          </div>

          {[
            { id: 'titles', label: 'Section Titles & Text', icon: Edit3 },
            { id: 'branding', label: 'Logos & Favicon', icon: Palette },
            { id: 'heroes', label: 'Page Heroes & Texts', icon: Layers },
            { id: 'ctas', label: 'Call to Action Sections', icon: Sparkles },
            { id: 'stats', label: 'Numbers & Counters', icon: BarChart3 },
            { id: 'testimonials', label: 'Client Stories', icon: MessageSquareQuote },
            { id: 'team', label: 'Our Team (10 Staff)', icon: Users },
            { id: 'partners', label: 'Sliding Partners', icon: Building2 },
            { id: 'workflow', label: 'Workflow Video', icon: Video },
            { id: 'services', label: 'Services (6 Items)', icon: Wrench },
            { id: 'projects', label: 'Projects Showcase', icon: FolderGit2 },
            { id: 'news', label: 'News & Articles', icon: Newspaper },
            { id: 'workspaces', label: 'Kagarama Hub Photos', icon: ImageIcon },
            { id: 'company', label: 'Company & Social Links', icon: Share2 },
            { id: 'profile', label: 'Admin Profile & Security', icon: KeyRound },
          ].map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id as TabType)}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-medium transition-all ${
                  isActive
                    ? 'bg-lime text-forest font-semibold shadow-md shadow-lime/10'
                    : 'text-cream/70 hover:bg-forest-deep hover:text-cream'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span className="truncate">{item.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Sidebar Footer */}
        <div className="p-3 border-t border-cream/10 space-y-1">
          <a
            href="/"
            target="_blank"
            rel="noreferrer"
            className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs text-cream/70 hover:text-cream hover:bg-forest-deep transition-all"
          >
            <span className="flex items-center gap-2">
              <Globe2 className="w-4 h-4 text-lime" />
              <span>View Public Site</span>
            </span>
            <ExternalLink className="w-3.5 h-3.5 text-cream/40" />
          </a>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs text-red-400/80 hover:text-red-300 hover:bg-red-500/10 transition-all cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* MAIN CONTENT AREA */}
      <main id="admin-main-scroll" className="flex-1 flex flex-col min-w-0 overflow-y-auto z-10 relative">
        {/* Top Header Bar */}
        <header
          className={`h-16 border-b px-3.5 sm:px-6 lg:px-8 flex items-center justify-between sticky top-0 z-30 transition-all ${
            hasCustomBg
              ? isLight
                ? 'bg-white/50 backdrop-blur-xl border-gray-200/50 shadow-sm'
                : 'bg-forest/40 backdrop-blur-xl border-cream/15 shadow-md'
              : isLight
              ? 'bg-white/95 backdrop-blur-md border-gray-200'
              : 'bg-forest/80 backdrop-blur-md border-cream/10'
          }`}
        >
          <div className="flex items-center gap-2 sm:gap-3 min-w-0">
            {/* Mobile / Tablet Hamburger Toggle */}
            <button
              type="button"
              onClick={() => setMobileSidebarOpen(true)}
              className={`p-2 rounded-xl border text-xs font-medium lg:hidden transition-all shrink-0 ${
                isLight
                  ? 'border-gray-200 text-gray-700 bg-gray-50 hover:bg-gray-100'
                  : 'border-cream/15 text-cream/80 hover:bg-forest-deep'
              }`}
              aria-label="Open portal navigation menu"
            >
              <Menu className="w-5 h-5" />
            </button>

            <span className={`text-xs hidden md:inline truncate ${isLight ? 'text-gray-400' : 'text-cream/50'}`}>
              Dream Maker Developers /
            </span>
            <span
              className={`text-xs font-bold uppercase tracking-wider truncate ${
                isLight ? 'text-forest font-extrabold' : 'text-lime'
              }`}
            >
              {activeTab.replace('-', ' ')}
            </span>
          </div>

          <div className="flex items-center gap-1.5 sm:gap-3 shrink-0">
            <span
              title={syncStatus === 'error' ? 'Supabase did not confirm this save. Check the server environment variables and sign in again.' : undefined}
              className={`hidden md:inline-flex items-center gap-1.5 rounded-lg border px-2.5 py-1.5 text-xs font-semibold ${
                syncStatus === 'saved'
                  ? 'border-lime/40 bg-lime/15 text-lime'
                  : syncStatus === 'error'
                    ? 'border-red-400/50 bg-red-500/10 text-red-400'
                    : isLight
                      ? 'border-gray-200 bg-gray-50 text-gray-600'
                      : 'border-cream/15 text-cream/70'
              }`}
            >
              {syncStatus === 'saved' ? 'Saved to Supabase' : syncStatus === 'saving' ? 'Saving…' : syncStatus === 'error' ? 'Save failed' : 'Loading…'}
            </span>
            {/* Light / Dark Mode Toggle Button */}
            <button
              onClick={() => setThemeMode(isLight ? 'dark' : 'light')}
              className={`flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-lg border text-xs font-medium transition-all ${
                isLight
                  ? 'border-gray-200 text-gray-700 bg-gray-50 hover:bg-gray-100'
                  : 'border-cream/15 text-cream/70 hover:bg-forest-deep'
              }`}
              title="Toggle Light/Dark Portal Mode"
            >
              {isLight ? (
                <>
                  <Moon className="w-3.5 h-3.5 text-forest" />
                  <span className="hidden sm:inline">Dark</span>
                </>
              ) : (
                <>
                  <Sun className="w-3.5 h-3.5 text-lime" />
                  <span className="hidden sm:inline">Light</span>
                </>
              )}
            </button>

            <button
              onClick={() => {
                if (window.confirm('Reset all CMS content to factory defaults?')) {
                  resetToDefaults();
                  showToast('Reset to default content.');
                }
              }}
              className={`hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-medium transition-all ${
                isLight
                  ? 'border-gray-200 text-gray-600 hover:bg-gray-100'
                  : 'border-cream/15 text-cream/60 hover:bg-forest-deep'
              }`}
            >
              <span>Reset Defaults</span>
            </button>

            <a
              href="/"
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-1.5 px-2.5 sm:px-3.5 py-1.5 rounded-lg bg-lime hover:bg-lime/90 text-forest text-xs font-semibold shadow-sm transition-all"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Public Live Site</span>
              <span className="sm:hidden">Site</span>
            </a>
          </div>
        </header>

        {/* Tab Content Container */}
        <div className="p-3.5 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto space-y-6 sm:space-y-8 min-w-0">
          {activeTab === 'overview' && (
            <OverviewSection cms={cms} setActiveTab={setActiveTab} isLight={isLight} cardBgClass={cardBgClass} />
          )}

          {activeTab === 'map' && (
            <MapBranchesSection
              cms={cms}
              updateCMS={updateCMS}
              addBranch={addBranch}
              updateBranch={updateBranch}
              deleteBranch={deleteBranch}
              showToast={showToast}
              isLight={isLight}
              cardBgClass={cardBgClass}
              inputBgClass={inputBgClass}
            />
          )}

          {activeTab === 'titles' && (
            <SectionTitlesSection
              cms={cms}
              updateSectionTitles={updateSectionTitles}
              showToast={showToast}
              isLight={isLight}
              cardBgClass={cardBgClass}
              inputBgClass={inputBgClass}
            />
          )}

          {activeTab === 'profile' && (
            <AdminProfileSection
              cms={cms}
              updateAdminProfile={updateAdminProfile}
              handleFileUpload={handleFileUpload}
              uploadingField={uploadingField}
              showToast={showToast}
              isLight={isLight}
              cardBgClass={cardBgClass}
              inputBgClass={inputBgClass}
            />
          )}

          {activeTab === 'inbox' && (
            <InboxSection
              cms={cms}
              markSubmissionsRead={markSubmissionsRead}
              deleteSubmissions={deleteSubmissions}
              showToast={showToast}
              isLight={isLight}
              cardBgClass={cardBgClass}
            />
          )}

          {activeTab === 'branding' && (
            <BrandingSection
              cms={cms}
              updateLogos={updateLogos}
              handleFileUpload={handleFileUpload}
              uploadingField={uploadingField}
              showToast={showToast}
              isLight={isLight}
              cardBgClass={cardBgClass}
              inputBgClass={inputBgClass}
            />
          )}

          {activeTab === 'heroes' && (
            <PageHeroesSection
              cms={cms}
              updateCMS={updateCMS}
              updatePageHero={updatePageHero}
              updateHeroDescription={updateHeroDescription}
              handleFileUpload={handleFileUpload}
              uploadingField={uploadingField}
              showToast={showToast}
              isLight={isLight}
              cardBgClass={cardBgClass}
              inputBgClass={inputBgClass}
            />
          )}

          {activeTab === 'ctas' && (
            <CTASectionsEditor cms={cms} updateCtaSection={updateCtaSection} showToast={showToast} isLight={isLight} cardBgClass={cardBgClass} inputBgClass={inputBgClass} />
          )}

          {activeTab === 'stats' && (
            <StatsSection
              cms={cms}
              updateStats={updateStats}
              showToast={showToast}
              isLight={isLight}
              cardBgClass={cardBgClass}
              inputBgClass={inputBgClass}
            />
          )}

          {activeTab === 'testimonials' && (
            <TestimonialsSection
              cms={cms}
              addTestimonial={addTestimonial}
              updateTestimonial={updateTestimonial}
              deleteTestimonial={deleteTestimonial}
              handleFileUpload={handleFileUpload}
              uploadingField={uploadingField}
              showToast={showToast}
              isLight={isLight}
              cardBgClass={cardBgClass}
              inputBgClass={inputBgClass}
            />
          )}

          {activeTab === 'team' && (
            <TeamSection
              cms={cms}
              updateTeamMember={updateTeamMember}
              addTeamMember={addTeamMember}
              deleteTeamMember={deleteTeamMember}
              handleFileUpload={handleFileUpload}
              uploadingField={uploadingField}
              showToast={showToast}
              isLight={isLight}
              cardBgClass={cardBgClass}
              inputBgClass={inputBgClass}
            />
          )}

          {activeTab === 'partners' && (
            <PartnersSection
              cms={cms}
              updatePartnerImages={updatePartnerImages}
              handleFileUpload={handleFileUpload}
              uploadingField={uploadingField}
              showToast={showToast}
              isLight={isLight}
              cardBgClass={cardBgClass}
            />
          )}

          {activeTab === 'workflow' && (
            <WorkflowSection
              cms={cms}
              updateWorkflow={updateWorkflow}
              handleFileUpload={handleFileUpload}
              uploadingField={uploadingField}
              showToast={showToast}
              isLight={isLight}
              cardBgClass={cardBgClass}
              inputBgClass={inputBgClass}
            />
          )}

          {activeTab === 'services' && (
            <ServicesSection
              cms={cms}
              updateService={updateService}
              showToast={showToast}
              isLight={isLight}
              cardBgClass={cardBgClass}
              inputBgClass={inputBgClass}
            />
          )}

          {activeTab === 'projects' && (
            <ProjectsSection
              cms={cms}
              addProject={addProject}
              updateProject={updateProject}
              deleteProject={deleteProject}
              handleFileUpload={handleFileUpload}
              uploadingField={uploadingField}
              showToast={showToast}
              isLight={isLight}
              cardBgClass={cardBgClass}
              inputBgClass={inputBgClass}
            />
          )}

          {activeTab === 'news' && (
            <NewsSection
              cms={cms}
              addNewsArticle={addNewsArticle}
              updateNewsArticle={updateNewsArticle}
              deleteNewsArticle={deleteNewsArticle}
              handleFileUpload={handleFileUpload}
              uploadingField={uploadingField}
              showToast={showToast}
              isLight={isLight}
              cardBgClass={cardBgClass}
              inputBgClass={inputBgClass}
            />
          )}

          {activeTab === 'workspaces' && (
            <WorkspaceSection
              cms={cms}
              updateWorkspaceImages={updateWorkspaceImages}
              handleFileUpload={handleFileUpload}
              uploadingField={uploadingField}
              showToast={showToast}
              isLight={isLight}
              cardBgClass={cardBgClass}
              inputBgClass={inputBgClass}
            />
          )}

          {activeTab === 'company' && (
            <CompanySection
              cms={cms}
              updateCompany={updateCompany}
              updateSocialLinks={updateSocialLinks}
              showToast={showToast}
              isLight={isLight}
              cardBgClass={cardBgClass}
              inputBgClass={inputBgClass}
            />
          )}
        </div>

        {/* Floating Back to Top Button for Admin (responsive on small, medium, large screens) */}
        <BackToTop scrollContainerId="admin-main-scroll" />
      </main>
    </div>
  );
}

/* =========================================================================
   1. OVERVIEW & VIRTUAL MAP SECTION
   ========================================================================= */
function OverviewSection({
  cms,
  setActiveTab,
  isLight,
  cardBgClass,
}: {
  cms: ReturnType<typeof useCMS>['cms'];
  setActiveTab: (t: TabType) => void;
  isLight: boolean;
  cardBgClass: string;
}) {
  return (
    <div className="space-y-8">
      {/* Header Banner */}
      <div
        className={`flex flex-col sm:flex-row sm:items-center justify-between gap-4 border rounded-2xl p-6 ${cardBgClass}`}
      >
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            Executive Overview & Global Reach
          </h1>
          <p className={`text-xs mt-1 ${isLight ? 'text-gray-500' : 'text-cream/60'}`}>
            Real-time platform activity, interactive branch pinning, and global telemetry.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-forest border border-lime/30 text-lime text-xs font-semibold">
            <span className="w-2 h-2 rounded-full bg-lime animate-ping" />
            Live Cloud Status: Operational
          </span>
        </div>
      </div>

      {/* 4 KPI METRIC CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {[
          { label: 'Bounce Rate', value: '32.53%', badge: '-2.4%', note: 'Industry avg. 48.2%', path: 'M0,20 Q20,5 40,15 T80,8 T100,12' },
          { label: 'Page Views', value: '7,682', badge: '+14.8%', note: 'High conversion interest', path: 'M0,22 Q25,18 50,10 T85,6 T100,3' },
          { label: 'New Sessions', value: '68.8%', badge: '+6.2%', note: 'First-time discovery', path: 'M0,18 Q30,12 60,20 T90,5 T100,7' },
          { label: 'Avg. Time on Site', value: '2m:35s', badge: '+22s', note: 'Deep portfolio reads', path: 'M0,15 Q35,8 70,12 T95,4 T100,5' },
        ].map((kpi) => (
          <div key={kpi.label} className={`border rounded-2xl p-5 shadow-sm ${cardBgClass}`}>
            <div className="flex items-center justify-between text-xs mb-2">
              <span className="font-semibold uppercase tracking-wider text-[10px] opacity-70">
                {kpi.label}
              </span>
              <span className="text-forest text-[11px] font-bold bg-lime px-2 py-0.5 rounded-md">
                {kpi.badge}
              </span>
            </div>
            <div className="text-3xl font-extrabold mb-3">{kpi.value}</div>
            <div className="h-9 w-full">
              <svg className="w-full h-full" viewBox="0 0 100 25" preserveAspectRatio="none">
                <path d={kpi.path} fill="none" stroke="#14493a" strokeWidth="2.5" strokeLinecap="round" />
              </svg>
            </div>
            <p className="text-[11px] opacity-50 mt-1">{kpi.note}</p>
          </div>
        ))}
      </div>

      {/* VIRTUAL WORLD MAP USING maps.jpg */}
      <div className={`border rounded-2xl p-6 ${cardBgClass}`}>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-base font-bold">
              {cms.sectionTitles?.mapTitle || 'Visitor Geo Distribution & Virtual Map'}
            </h2>
            <p className={`text-xs ${isLight ? 'text-gray-500' : 'text-cream/50'}`}>
              Using official satellite & cartographic model from <code className="text-xs text-lime bg-forest px-1.5 py-0.5 rounded">src/data/maps.png</code>
            </p>
          </div>
          <button
            onClick={() => setActiveTab('map')}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-lime text-forest text-xs font-bold shadow-sm hover:bg-lime/90 cursor-pointer"
          >
            <MapPin className="w-3.5 h-3.5" />
            <span>Manage Map Pins & Branches &rarr;</span>
          </button>
        </div>

        {/* Pinned map frame */}
        <div className="relative w-full aspect-[2/1] rounded-2xl overflow-hidden border border-gray-300/30 shadow-md bg-forest-deep">
          <img src={mapsImage} alt="World Map" className="w-full h-full object-cover select-none" />

          {/* Overlaid location pins */}
          {cms.branches?.map((pin) => (
            <div
              key={pin.id}
              style={{ left: `${pin.x}%`, top: `${pin.y}%` }}
              className="absolute -translate-x-1/2 -translate-y-1/2 group z-20 cursor-pointer"
            >
              <div className="relative flex items-center justify-center">
                <span className="absolute w-6 h-6 rounded-full bg-lime/40 animate-ping" />
                <span
                  className={`w-3.5 h-3.5 rounded-full border-2 border-white shadow-lg ${
                    pin.status === 'headquarters' ? 'bg-lime' : 'bg-forest'
                  }`}
                />
              </div>

              {/* Pin Caption Tooltip */}
              <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:flex flex-col items-center pointer-events-none z-30">
                <div className="bg-forest border border-lime/40 text-cream px-3 py-1.5 rounded-xl shadow-2xl text-center whitespace-nowrap">
                  <div className="font-bold text-xs text-lime">{pin.name}</div>
                  <div className="text-[10px] text-cream/70">{pin.city}, {pin.country}</div>
                  <div className="text-[10px] text-cream/50 max-w-xs truncate">{pin.caption}</div>
                </div>
                <div className="w-2 h-2 bg-forest rotate-45 -mt-1 border-r border-b border-lime/40" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* =========================================================================
   2. MAP BRANCHES & INTERACTIVE PINNING (Using src/data/maps.png)
   ========================================================================= */
function MapBranchesSection({
  cms,
  addBranch,
  updateBranch,
  deleteBranch,
  showToast,
  isLight,
  cardBgClass,
  inputBgClass,
}: {
  cms: ReturnType<typeof useCMS>['cms'];
  addBranch: ReturnType<typeof useCMS>['addBranch'];
  updateBranch: ReturnType<typeof useCMS>['updateBranch'];
  deleteBranch: ReturnType<typeof useCMS>['deleteBranch'];
  showToast: (m: string) => void;
  isLight: boolean;
  cardBgClass: string;
  inputBgClass: string;
}) {
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 4;

  const [form, setForm] = useState<Partial<BranchLocation>>({
    name: '',
    city: '',
    country: '',
    caption: '',
    x: 54.5,
    y: 56.5,
    status: 'active',
    visitors: '850 visits',
  });
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);

  // Click on map to place pin
  const handleMapClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const xPct = Math.round(((e.clientX - rect.left) / rect.width) * 1000) / 10;
    const yPct = Math.round(((e.clientY - rect.top) / rect.height) * 1000) / 10;
    setForm((prev) => ({ ...prev, x: xPct, y: yPct }));
    showToast(`Pin location set to X: ${xPct}%, Y: ${yPct}%`);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.country) return;

    if (editingId) {
      updateBranch({
        id: editingId,
        name: form.name || 'Branch',
        city: form.city || '',
        country: form.country || '',
        caption: form.caption || '',
        x: form.x || 50,
        y: form.y || 50,
        status: form.status as any || 'active',
        visitors: form.visitors || '500 visits',
      });
      showToast('Branch location updated successfully!');
    } else {
      addBranch({
        id: `branch-${Date.now()}`,
        name: form.name || 'Branch',
        city: form.city || '',
        country: form.country || '',
        caption: form.caption || '',
        x: form.x || 50,
        y: form.y || 50,
        status: form.status as any || 'active',
        visitors: form.visitors || '500 visits',
      });
      showToast('New location pin added to the map!');
    }

    setShowAddModal(false);
    setEditingId(null);
    setForm({ name: '', city: '', country: '', caption: '', x: 50, y: 50, status: 'active', visitors: '' });
  };

  const paginatedBranches = cms.branches?.slice((currentPage - 1) * pageSize, currentPage * pageSize) || [];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Interactive Map & Regional Hubs</h1>
          <p className={`text-xs ${isLight ? 'text-gray-500' : 'text-cream/60'}`}>
            Click anywhere on the map to place a pin, or use the form to manage branch coordinates and captions.
          </p>
        </div>

        <button
          onClick={() => {
            setEditingId(null);
            setForm({ name: '', city: '', country: '', caption: '', x: 50, y: 50, status: 'active', visitors: '' });
            setShowAddModal(true);
          }}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-lime hover:bg-lime/90 text-forest font-semibold text-xs cursor-pointer shadow-sm"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Location Pin</span>
        </button>
      </div>

      {/* Interactive Map Canvas */}
      <div className={`border rounded-2xl p-5 ${cardBgClass}`}>
        <div className="flex items-center justify-between mb-3 text-xs">
          <span className="font-semibold flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-lime" />
            <span>Click directly on the map to position new coordinates</span>
          </span>
          <span className="font-mono text-lime bg-forest px-2 py-0.5 rounded">
            Selected Pin: X={form.x}% &bull; Y={form.y}%
          </span>
        </div>

        <div
          onClick={handleMapClick}
          className="relative w-full aspect-[2/1] rounded-2xl overflow-hidden border border-gray-300/30 cursor-crosshair shadow-lg bg-forest-deep"
        >
          <img src={mapsImage} alt="World Map" className="w-full h-full object-cover select-none pointer-events-none" />

          {/* Active target placement pin */}
          <div
            style={{ left: `${form.x}%`, top: `${form.y}%` }}
            className="absolute -translate-x-1/2 -translate-y-1/2 z-30 pointer-events-none"
          >
            <div className="w-6 h-6 rounded-full border-2 border-dashed border-lime animate-spin" />
          </div>

          {/* Pinned locations */}
          {cms.branches?.map((pin) => (
            <div
              key={pin.id}
              style={{ left: `${pin.x}%`, top: `${pin.y}%` }}
              className="absolute -translate-x-1/2 -translate-y-1/2 group z-20 cursor-pointer"
            >
              <div className="relative flex items-center justify-center">
                <span className="absolute w-5 h-5 rounded-full bg-lime/40 animate-ping" />
                <span
                  className={`w-3.5 h-3.5 rounded-full border-2 border-white shadow-md ${
                    pin.status === 'headquarters' ? 'bg-lime' : 'bg-forest'
                  }`}
                />
              </div>

              {/* Pin Caption Box */}
              <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:flex flex-col items-center z-40">
                <div className="bg-forest border border-lime/40 text-cream px-3 py-1.5 rounded-xl shadow-2xl text-center whitespace-nowrap">
                  <div className="font-bold text-xs text-lime">{pin.name}</div>
                  <div className="text-[10px] text-cream/70">{pin.city}, {pin.country}</div>
                  <div className="text-[10px] text-cream/50 max-w-xs truncate">{pin.caption}</div>
                </div>
                <div className="w-2 h-2 bg-forest rotate-45 -mt-1 border-r border-b border-lime/40" />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Add / Edit Form Modal */}
      {showAddModal && (
        <form onSubmit={handleSubmit} className={`border rounded-2xl p-6 space-y-4 shadow-xl ${cardBgClass}`}>
          <h3 className="text-sm font-bold text-forest flex items-center gap-2">
            <MapPin className="w-4 h-4 text-lime" />
            <span>{editingId ? 'Edit Location Pin' : 'Create New Branch Location Pin'}</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="text-xs font-medium block mb-1">Branch / Pin Name:</label>
              <input
                type="text"
                required
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="e.g. Kigali Headquarters Hub"
                className={`w-full px-3 py-2 rounded-xl text-xs focus:outline-none ${inputBgClass}`}
              />
            </div>
            <div>
              <label className="text-xs font-medium block mb-1">City:</label>
              <input
                type="text"
                value={form.city}
                onChange={(e) => setForm({ ...form, city: e.target.value })}
                placeholder="e.g. Kigali"
                className={`w-full px-3 py-2 rounded-xl text-xs focus:outline-none ${inputBgClass}`}
              />
            </div>
            <div>
              <label className="text-xs font-medium block mb-1">Country:</label>
              <input
                type="text"
                required
                value={form.country}
                onChange={(e) => setForm({ ...form, country: e.target.value })}
                placeholder="e.g. Rwanda"
                className={`w-full px-3 py-2 rounded-xl text-xs focus:outline-none ${inputBgClass}`}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="text-xs font-medium block mb-1">Status:</label>
              <select
                value={form.status}
                onChange={(e) => setForm({ ...form, status: e.target.value as any })}
                className={`w-full px-3 py-2 rounded-xl text-xs focus:outline-none ${inputBgClass}`}
              >
                <option value="headquarters">Headquarters</option>
                <option value="active">Active Branch</option>
                <option value="planned">Planned Expansion</option>
              </select>
            </div>
            <div>
              <label className="text-xs font-medium block mb-1">Map Position X (%):</label>
              <input
                type="number"
                step="0.1"
                min="0"
                max="100"
                value={form.x}
                onChange={(e) => setForm({ ...form, x: parseFloat(e.target.value) || 0 })}
                className={`w-full px-3 py-2 rounded-xl text-xs focus:outline-none ${inputBgClass}`}
              />
            </div>
            <div>
              <label className="text-xs font-medium block mb-1">Map Position Y (%):</label>
              <input
                type="number"
                step="0.1"
                min="0"
                max="100"
                value={form.y}
                onChange={(e) => setForm({ ...form, y: parseFloat(e.target.value) || 0 })}
                className={`w-full px-3 py-2 rounded-xl text-xs focus:outline-none ${inputBgClass}`}
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-medium block mb-1">Pin Caption / Description:</label>
            <textarea
              rows={2}
              value={form.caption}
              onChange={(e) => setForm({ ...form, caption: e.target.value })}
              placeholder="e.g. Primary Engineering Labs, Distributed Cloud & AI Systems Hub"
              className={`w-full px-3 py-2 rounded-xl text-xs focus:outline-none ${inputBgClass}`}
            />
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={() => setShowAddModal(false)}
              className="px-4 py-2 rounded-xl text-xs opacity-60 hover:opacity-100"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-lime text-forest font-semibold text-xs shadow-sm cursor-pointer"
            >
              Save Pin & Location
            </button>
          </div>
        </form>
      )}

      {/* Pinned Branches Table with Pagination */}
      <div className={`border rounded-2xl p-6 ${cardBgClass}`}>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-bold">Configured Locations ({cms.branches?.length || 0})</h3>
          <span className="text-xs opacity-50">Page size: {pageSize}</span>
        </div>

        <div className="space-y-3">
          {paginatedBranches.map((pin) => (
            <div
              key={pin.id}
              className={`flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-xl border transition-all ${
                isLight ? 'border-gray-200 bg-gray-50 hover:bg-white' : 'border-cream/5 bg-forest-deep/60 hover:bg-forest'
              }`}
            >
              <div className="flex items-center gap-3 min-w-0">
                <span
                  className={`w-3.5 h-3.5 rounded-full shrink-0 ${
                    pin.status === 'headquarters' ? 'bg-lime' : 'bg-forest border border-lime/50'
                  }`}
                />
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-xs">{pin.name}</span>
                    <span className="text-[10px] px-2 py-0.5 rounded-md bg-lime/20 text-forest font-semibold uppercase">
                      {pin.status}
                    </span>
                  </div>
                  <p className="text-xs opacity-60 line-clamp-1">{pin.caption}</p>
                  <span className="text-[10px] opacity-40 font-mono">
                    Coord: ({pin.x}%, {pin.y}%) &bull; {pin.city}, {pin.country}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                <button
                  type="button"
                  onClick={() => {
                    setEditingId(pin.id);
                    setForm(pin);
                    setShowAddModal(true);
                  }}
                  className="px-3 py-1.5 rounded-lg border text-xs font-semibold hover:bg-lime hover:text-forest transition-colors"
                >
                  Edit
                </button>
                <button
                  type="button"
                  onClick={() => {
                    if (window.confirm(`Delete ${pin.name}?`)) {
                      deleteBranch(pin.id);
                      showToast('Pin removed.');
                    }
                  }}
                  className="p-1.5 rounded-lg text-red-500 hover:bg-red-500/10"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>

        <PaginationBar
          currentPage={currentPage}
          totalItems={cms.branches?.length || 0}
          pageSize={pageSize}
          onPageChange={setCurrentPage}
          isLight={isLight}
        />
      </div>
    </div>
  );
}

/* =========================================================================
   3. SECTION TITLES & EDIT ANYTHING SECTION
   ========================================================================= */
function SectionTitlesSection({
  cms,
  updateSectionTitles,
  showToast,
  isLight,
  cardBgClass,
  inputBgClass,
}: {
  cms: ReturnType<typeof useCMS>['cms'];
  updateSectionTitles: ReturnType<typeof useCMS>['updateSectionTitles'];
  showToast: (m: string) => void;
  isLight: boolean;
  cardBgClass: string;
  inputBgClass: string;
}) {
  const [titles, setTitles] = useState(cms.sectionTitles || {});

  useEffect(() => {
    if (cms.sectionTitles) {
      setTitles(cms.sectionTitles);
    }
  }, [cms.sectionTitles]);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    updateSectionTitles(titles);
    showToast('All section titles & subtitles updated live across the website!');
  };

  return (
    <form onSubmit={handleSave} className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Customize Any Section Title & Headline</h1>
        <p className={`text-xs ${isLight ? 'text-gray-500' : 'text-cream/60'}`}>
          Edit titles and descriptors for every component shown on the website (e.g. &ldquo;Curated Projects Showcase&rdquo;, &ldquo;Client Testimonials&rdquo;, etc.).
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {[
          { keyTitle: 'projectsTitle', keySub: 'projectsSubtitle', label: 'Projects Section' },
          { keyTitle: 'testimonialsTitle', keySub: 'testimonialsSubtitle', label: 'Testimonials Section' },
          { keyTitle: 'teamTitle', keySub: 'teamSubtitle', label: 'Our Team Section' },
          { keyTitle: 'servicesTitle', keySub: 'servicesSubtitle', label: 'Services Section' },
          { keyTitle: 'newsTitle', keySub: 'newsSubtitle', label: 'News & Publications' },
          { keyTitle: 'mapTitle', keySub: 'mapSubtitle', label: 'Virtual Map & Hubs' },
          { keyTitle: 'workspacesTitle', keySub: 'workspacesSubtitle', label: 'Hub Workspaces Gallery' },
          { keyTitle: 'inboxTitle', keySub: 'inboxSubtitle', label: 'Inquiries & Briefs' },
        ].map((item) => (
          <div key={item.label} className={`border rounded-2xl p-5 space-y-3 ${cardBgClass}`}>
            <h3 className={`text-xs font-bold uppercase tracking-wider ${isLight ? 'text-forest' : 'text-lime'}`}>{item.label}</h3>
            <div>
              <label className="text-xs opacity-70 block mb-1">Headline / Title:</label>
              <input
                type="text"
                value={(titles as any)?.[item.keyTitle] || ''}
                onChange={(e) => setTitles((prev) => ({ ...prev, [item.keyTitle]: e.target.value }))}
                className={`w-full px-3 py-2 rounded-xl text-xs focus:outline-none ${inputBgClass}`}
              />
            </div>
            <div>
              <label className="text-xs opacity-70 block mb-1">Subtitle / Descriptor:</label>
              <textarea
                rows={2}
                value={(titles as any)?.[item.keySub] || ''}
                onChange={(e) => setTitles((prev) => ({ ...prev, [item.keySub]: e.target.value }))}
                className={`w-full px-3 py-2 rounded-xl text-xs focus:outline-none ${inputBgClass}`}
              />
            </div>
          </div>
        ))}
      </div>

      <button
        type="submit"
        className="px-6 py-3 rounded-xl bg-lime hover:bg-lime/90 text-forest font-semibold text-sm transition-all shadow-md cursor-pointer"
      >
        Save All Section Headlines
      </button>
    </form>
  );
}

/* =========================================================================
   4. FULL-PAGE WEBSITE BACKGROUND & TRANSPARENT CONTAINERS (GLASS MODE)
   ========================================================================= */
function WebsiteBackgroundSection({
  cms,
  updateWebsiteBackground,
  handleFileUpload,
  uploadingField,
  showToast,
  isLight,
  cardBgClass,
  inputBgClass,
}: {
  cms: ReturnType<typeof useCMS>['cms'];
  updateWebsiteBackground: ReturnType<typeof useCMS>['updateWebsiteBackground'];
  handleFileUpload: (
    e: React.ChangeEvent<HTMLInputElement>,
    f: string,
    cb: (url: string) => void
  ) => void;
  uploadingField: string | null;
  showToast: (m: string) => void;
  isLight: boolean;
  cardBgClass: string;
  inputBgClass: string;
}) {
  const [bg, setBg] = useState(
    cms.websiteBackground || { enabled: false, imageUrl: '', opacity: 0.15, transparentContainers: true }
  );

  useEffect(() => {
    if (cms.websiteBackground) {
      setBg(cms.websiteBackground);
    }
  }, [cms.websiteBackground]);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    updateWebsiteBackground(bg);
    showToast('Website background settings saved permanently to MongoDB!');
  };

  return (
    <form onSubmit={handleSave} className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Website Background & Transparent Containers</h1>
        <p className={`text-xs ${isLight ? 'text-gray-500' : 'text-cream/60'}`}>
          Apply a custom full-page background image from your device. When enabled, all containers automatically become glassmorphic and transparent so only texts, logos, and interactive elements remain sharp!
        </p>
      </div>

      <div className={`border rounded-2xl p-6 space-y-5 ${cardBgClass}`}>
        {/* Toggle 1: Enable Custom Background */}
        <div className="flex items-center justify-between border-b pb-4">
          <div>
            <h3 className="text-sm font-bold">Enable Full-Page Custom Background</h3>
            <p className="text-xs opacity-60">Display the background image across public website pages and the admin portal</p>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={Boolean(bg?.enabled)}
              onChange={(e) => {
                const isChecked = e.target.checked;
                const updated = {
                  ...bg,
                  enabled: isChecked,
                  transparentContainers: isChecked ? (bg.transparentContainers ?? true) : false,
                };
                setBg(updated);
                updateWebsiteBackground(updated);
              }}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-gray-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-lime"></div>
          </label>
        </div>

        {/* Toggle 2: Glassmorphic Transparent Containers */}
        <div className="flex items-center justify-between border-b pb-4">
          <div>
            <h3 className="text-sm font-bold">Glassmorphic Transparent Containers</h3>
            <p className="text-xs opacity-60">Make all container panels, sidebar, header, and cards translucent so the background image shows through</p>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={Boolean(bg?.transparentContainers)}
              onChange={(e) => {
                const updated = { ...bg, transparentContainers: e.target.checked };
                setBg(updated);
                updateWebsiteBackground(updated);
              }}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-gray-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-lime"></div>
          </label>
        </div>

        {/* Image Preview & Upload */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="text-xs font-medium block mb-1.5">Upload Background from Device:</label>
            <input
              type="file"
              accept="image/*"
              disabled={uploadingField === 'bgImage'}
              onChange={(e) =>
                handleFileUpload(e, 'bgImage', (url) => {
                  const updated = { ...bg, imageUrl: url, enabled: true, transparentContainers: true };
                  setBg(updated);
                  updateWebsiteBackground(updated);
                  showToast('Custom background image uploaded & activated live!');
                })
              }
              className="w-full text-xs file:mr-3 file:py-2 file:px-3 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-lime file:text-forest file:cursor-pointer"
            />
            <div className="mt-3">
              <label className="text-xs opacity-60 block mb-1">Image URL / Path:</label>
              <input
                type="text"
                value={bg?.imageUrl || ''}
                onChange={(e) => {
                  const updated = { ...bg, imageUrl: e.target.value };
                  setBg(updated);
                  updateWebsiteBackground(updated);
                }}
                placeholder="https://... or /custom-bg.jpg"
                className={`w-full px-3 py-2 rounded-xl text-xs focus:outline-none ${inputBgClass}`}
              />
            </div>
          </div>

          <div className="h-44 rounded-xl overflow-hidden border flex items-center justify-center relative bg-forest-deep/60 backdrop-blur-md">
            {bg.imageUrl ? (
              <img src={bg.imageUrl} alt="Background Preview" className="w-full h-full object-cover" />
            ) : (
              <span className="text-xs opacity-40">No background image active</span>
            )}
          </div>
        </div>

        {/* Opacity slider */}
        <div>
          <div className="flex items-center justify-between text-xs mb-1">
            <span className="font-medium">Background Opacity</span>
            <span className="font-mono font-bold">{Math.round((bg.opacity || 0.25) * 100)}%</span>
          </div>
          <input
            type="range"
            min="0.05"
            max="0.8"
            step="0.05"
            value={bg.opacity || 0.25}
            onChange={(e) => {
              const updated = { ...bg, opacity: parseFloat(e.target.value) };
              setBg(updated);
              updateWebsiteBackground(updated);
            }}
            className="w-full accent-lime cursor-pointer"
          />
        </div>
      </div>

      <button
        type="submit"
        className="px-6 py-3 rounded-xl bg-lime hover:bg-lime/90 text-forest font-semibold text-sm transition-all shadow-md cursor-pointer"
      >
        Save Background Settings
      </button>
    </form>
  );
}

/* =========================================================================
   5. ADMIN PERSONAL INFO & PORTAL BRANDING SECTION
   ========================================================================= */
function AdminProfileSection({
  cms,
  updateAdminProfile,
  handleFileUpload,
  uploadingField,
  showToast,
  isLight,
  cardBgClass,
  inputBgClass,
}: {
  cms: ReturnType<typeof useCMS>['cms'];
  updateAdminProfile: ReturnType<typeof useCMS>['updateAdminProfile'];
  handleFileUpload: (
    e: React.ChangeEvent<HTMLInputElement>,
    f: string,
    cb: (url: string) => void
  ) => void;
  uploadingField: string | null;
  showToast: (m: string) => void;
  isLight: boolean;
  cardBgClass: string;
  inputBgClass: string;
}) {
  const [profile, setProfile] = useState(
    cms.adminProfile || {
      name: 'Chief Administrator',
      email: 'admin@dreammakerdevelopers.com',
      role: 'Super Admin & Lead Architect',
      avatar: '',
      portalLogo: '/logonav.png',
    }
  );
  // Track the first persisted admin profile loaded from MongoDB.
  const initializedRef = React.useRef(false);

  useEffect(() => {
    if (cms.adminProfile && !initializedRef.current) {
      // First time we get real data from MongoDB: fully sync to local form state.
      // After initialization we do NOT re-sync from cms.adminProfile because:
      // 1. The upload callbacks already call setProfile() with the new URL immediately.
      // 2. Re-syncing here after an upload would overwrite the freshly-set local URL
      //    with the stale value still in cms.adminProfile (async update race), causing
      //    the image to disappear right after upload.
      initializedRef.current = true;
      setProfile(cms.adminProfile);
    }
  }, [cms.adminProfile]);

  const persistProfile = (changes: Partial<typeof profile>) => {
    const nextProfile = { ...cms.adminProfile, ...changes };
    updateAdminProfile(nextProfile);
    showToast('Profile saved and will sync permanently.');
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    persistProfile(profile);
  };

  return (
    <form onSubmit={handleSave} className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Admin Personal Info & Portal Branding</h1>
        <p className={`text-xs ${isLight ? 'text-gray-500' : 'text-cream/60'}`}>
          Update your name, avatar photo, and custom admin portal logo from your device.
        </p>
      </div>

      <div className={`border rounded-2xl p-6 space-y-5 ${cardBgClass}`}>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          {/* Admin Avatar Upload */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider">Admin Avatar Photo</h3>
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-lime shadow-md shrink-0 bg-forest-deep flex items-center justify-center">
                {profile.avatar ? (
                  <img src={profile.avatar} alt="Admin Avatar" className="w-full h-full object-cover" />
                ) : (
                  <span className="text-xs opacity-40 text-center">No photo</span>
                )}
              </div>
              <label className="block">
                <span className="text-xs opacity-70 block mb-1">Upload from Device:</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) =>
                    handleFileUpload(e, 'adminAvatar', async (url) => {
                      // Use functional update to avoid stale closure of profile
                      setProfile((prev) => ({ ...prev, avatar: url }));
                      // Keep the sidebar and every other admin view in sync
                      // immediately; the CMS provider persists this change.
                      persistProfile({ avatar: url });
                    })
                  }
                  className="w-full text-xs file:mr-2 file:py-1.5 file:px-2.5 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-lime file:text-forest file:cursor-pointer"
                />
              </label>
            </div>
          </div>

          {/* Admin Portal Logo Upload */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider">Admin Portal Logo</h3>
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-2xl overflow-hidden border border-lime/30 p-2 shadow-md shrink-0 bg-forest-deep flex items-center justify-center">
                {profile.portalLogo ? (
                  <img src={profile.portalLogo} alt="Portal Logo" className="max-h-full max-w-full object-contain" />
                ) : (
                  <span className="text-xs opacity-40">No logo</span>
                )}
              </div>
              <label className="block">
                <span className="text-xs opacity-70 block mb-1">Upload Portal Logo:</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) =>
                    handleFileUpload(e, 'adminPortalLogo', async (url) => {
                      // Functional update to avoid stale closure
                      setProfile((prev) => ({ ...prev, portalLogo: url }));
                      // Push only the changed field so the sidebar portal logo updates immediately
                      persistProfile({ portalLogo: url });
                    })
                  }
                  className="w-full text-xs file:mr-2 file:py-1.5 file:px-2.5 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-lime file:text-forest file:cursor-pointer"
                />
              </label>
            </div>
          </div>
        </div>

        {/* Name, Email, Role */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t">
          <div>
            <label className="text-xs font-medium block mb-1">Display Name:</label>
            <input
              type="text"
              value={profile.name}
              onChange={(e) => setProfile({ ...profile, name: e.target.value })}
              className={`w-full px-3 py-2 rounded-xl text-xs focus:outline-none ${inputBgClass}`}
            />
          </div>
          <div>
            <label className="text-xs font-medium block mb-1">Role / Title:</label>
            <input
              type="text"
              value={profile.role}
              onChange={(e) => setProfile({ ...profile, role: e.target.value })}
              className={`w-full px-3 py-2 rounded-xl text-xs focus:outline-none ${inputBgClass}`}
            />
          </div>
        </div>

        <div className="pt-4 border-t">
          <div>
            <label className="text-xs font-medium block mb-1">Contact Email:</label>
            <input
              type="email"
              required
              value={profile.email}
              onChange={(e) => setProfile({ ...profile, email: e.target.value })}
              className={`w-full px-3 py-2 rounded-xl text-xs focus:outline-none ${inputBgClass}`}
            />
          </div>
        </div>
      </div>

      <button
        type="submit"
        className="px-6 py-3 rounded-xl bg-lime hover:bg-lime/90 text-forest font-semibold text-sm transition-all shadow-md cursor-pointer"
      >
        Save Profile Permanently
      </button>
    </form>
  );
}

/* =========================================================================
   6. SUBMISSIONS INBOX SECTION WITH MULTI-SELECTION & PAGINATION
   ========================================================================= */
function InboxSection({
  cms,
  markSubmissionsRead,
  deleteSubmissions,
  showToast,
  isLight,
  cardBgClass,
}: {
  cms: ReturnType<typeof useCMS>['cms'];
  markSubmissionsRead: ReturnType<typeof useCMS>['markSubmissionsRead'];
  deleteSubmissions: ReturnType<typeof useCMS>['deleteSubmissions'];
  showToast: (m: string) => void;
  isLight: boolean;
  cardBgClass: string;
}) {
  const [activeSubTab, setActiveSubTab] = useState<'projects' | 'contacts'>('projects');
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 4;

  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  const items = activeSubTab === 'projects' ? cms.projectSubmissions : cms.contactSubmissions;

  const toggleSelectAll = () => {
    if (selectedIds.length === items.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(items.map((i) => i.id));
    }
  };

  const toggleSelectOne = (id: string) => {
    if (selectedIds.includes(id)) {
      setSelectedIds(selectedIds.filter((x) => x !== id));
    } else {
      setSelectedIds([...selectedIds, id]);
    }
  };

  const handleBulkRead = (read: boolean) => {
    markSubmissionsRead(selectedIds, activeSubTab, read);
    showToast(`Marked ${selectedIds.length} item(s) as ${read ? 'read' : 'unread'}.`);
    setSelectedIds([]);
  };

  const handleBulkDelete = () => {
    if (window.confirm(`Delete ${selectedIds.length} selected submission(s)?`)) {
      deleteSubmissions(selectedIds, activeSubTab);
      showToast(`Deleted ${selectedIds.length} item(s).`);
      setSelectedIds([]);
    }
  };

  const paginatedItems = items.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">
            {cms.sectionTitles?.inboxTitle || 'Client Inquiries & Briefs'}
          </h1>
          <p className={`text-xs ${isLight ? 'text-gray-500' : 'text-cream/60'}`}>
            Incoming briefs from &ldquo;Start a Project&rdquo; and Web3Forms contact submissions.
          </p>
        </div>

        <div className="flex rounded-xl border p-1 bg-forest text-cream">
          <button
            onClick={() => {
              setActiveSubTab('projects');
              setSelectedIds([]);
              setCurrentPage(1);
            }}
            className={`px-4 py-2 text-xs font-semibold rounded-lg transition-all ${
              activeSubTab === 'projects' ? 'bg-lime text-forest shadow-md' : 'opacity-60 hover:opacity-100'
            }`}
          >
            Project Briefs ({cms.projectSubmissions.length})
          </button>
          <button
            onClick={() => {
              setActiveSubTab('contacts');
              setSelectedIds([]);
              setCurrentPage(1);
            }}
            className={`px-4 py-2 text-xs font-semibold rounded-lg transition-all ${
              activeSubTab === 'contacts' ? 'bg-lime text-forest shadow-md' : 'opacity-60 hover:opacity-100'
            }`}
          >
            Web3Forms Inquiries ({cms.contactSubmissions.length})
          </button>
        </div>
      </div>

      {/* Multi-selection Bulk Action Bar */}
      <div className={`flex flex-wrap items-center justify-between gap-3 p-4 rounded-2xl border ${cardBgClass}`}>
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={toggleSelectAll}
            className="flex items-center gap-2 text-xs font-semibold"
          >
            {selectedIds.length > 0 && selectedIds.length === items.length ? (
              <CheckSquare className="w-4 h-4 text-forest" />
            ) : (
              <Square className="w-4 h-4 opacity-50" />
            )}
            <span>Select All ({items.length})</span>
          </button>
          {selectedIds.length > 0 && (
            <span className="text-xs px-2 py-0.5 rounded bg-lime/20 text-forest font-bold">
              {selectedIds.length} Selected
            </span>
          )}
        </div>

        {selectedIds.length > 0 && (
          <div className="flex items-center gap-2 animate-fade-in">
            <button
              onClick={() => handleBulkRead(true)}
              className="flex items-center gap-1 px-3 py-1.5 rounded-lg border text-xs font-semibold hover:bg-lime hover:text-forest transition-colors"
            >
              <Eye className="w-3.5 h-3.5" />
              <span>Mark as Read</span>
            </button>
            <button
              onClick={() => handleBulkRead(false)}
              className="flex items-center gap-1 px-3 py-1.5 rounded-lg border text-xs font-semibold hover:bg-gray-200 transition-colors"
            >
              <EyeOff className="w-3.5 h-3.5" />
              <span>Mark as Unread</span>
            </button>
            <button
              onClick={handleBulkDelete}
              className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-red-500/10 text-red-600 border border-red-500/30 text-xs font-semibold hover:bg-red-500 hover:text-white transition-colors"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Delete Selected</span>
            </button>
          </div>
        )}
      </div>

      {/* Submissions List with Pagination */}
      <div className="space-y-4">
        {items.length === 0 ? (
          <div className={`text-center py-16 border rounded-2xl ${cardBgClass}`}>
            <Inbox className="w-12 h-12 opacity-30 mx-auto mb-3" />
            <div className="text-sm font-semibold">No submissions received yet</div>
            <p className="text-xs opacity-50 mt-1">Submissions will appear here live without refreshing.</p>
          </div>
        ) : (
          paginatedItems.map((sub: any) => {
            const isSelected = selectedIds.includes(sub.id);
            return (
              <div
                key={sub.id}
                className={`border rounded-2xl p-6 space-y-4 transition-all ${cardBgClass} ${
                  isSelected ? 'ring-2 ring-forest' : ''
                }`}
              >
                <div className="flex flex-wrap items-center justify-between gap-3 border-b pb-4">
                  <div className="flex items-center gap-3">
                    <button type="button" onClick={() => toggleSelectOne(sub.id)}>
                      {isSelected ? (
                        <CheckSquare className="w-4 h-4 text-forest" />
                      ) : (
                        <Square className="w-4 h-4 opacity-40" />
                      )}
                    </button>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-base font-bold">{sub.name}</h3>
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
                            sub.read
                              ? 'bg-gray-100 text-gray-600'
                              : 'bg-lime text-forest shadow-sm animate-pulse'
                          }`}
                        >
                          {sub.read ? 'READ' : 'UNREAD'}
                        </span>
                      </div>
                      <div className="text-xs opacity-60 flex items-center gap-2 mt-0.5">
                        <span>{sub.email}</span>
                        {sub.company && <span>&bull; {sub.company}</span>}
                        {sub.phone && <span>&bull; {sub.phone}</span>}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => markSubmissionsRead([sub.id], activeSubTab, !sub.read)}
                      className="px-2.5 py-1 rounded-lg border text-xs hover:bg-gray-100"
                    >
                      {sub.read ? 'Mark Unread' : 'Mark Read'}
                    </button>
                    <span className="text-xs opacity-40">
                      {new Date(sub.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>

                {sub.budget && sub.timeline && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                    <div className="p-3 rounded-xl border bg-gray-50/50">
                      <span className="opacity-50 block mb-1 font-medium">Budget Scope:</span>
                      <span className="font-bold text-forest">{sub.budget}</span>
                    </div>
                    <div className="p-3 rounded-xl border bg-gray-50/50">
                      <span className="opacity-50 block mb-1 font-medium">Expected Timeline:</span>
                      <span className="font-bold">{sub.timeline}</span>
                    </div>
                  </div>
                )}

                <div className="p-4 rounded-xl border bg-gray-50/60 text-xs leading-relaxed">
                  <span className="block text-[11px] font-bold opacity-50 uppercase mb-1">
                    Message / Vision:
                  </span>
                  {sub.description || sub.message}
                </div>
              </div>
            );
          })
        )}
      </div>

      <PaginationBar
        currentPage={currentPage}
        totalItems={items.length}
        pageSize={pageSize}
        onPageChange={setCurrentPage}
        isLight={isLight}
      />
    </div>
  );
}

/* =========================================================================
   7. BRANDING & LOGOS SECTION
   ========================================================================= */
function BrandingSection({
  cms,
  updateLogos,
  handleFileUpload,
  uploadingField,
  showToast,
  isLight,
  cardBgClass,
  inputBgClass,
}: {
  cms: ReturnType<typeof useCMS>['cms'];
  updateLogos: ReturnType<typeof useCMS>['updateLogos'];
  handleFileUpload: (e: React.ChangeEvent<HTMLInputElement>, f: string, cb: (url: string) => void) => void;
  uploadingField: string | null;
  showToast: (m: string) => void;
  isLight: boolean;
  cardBgClass: string;
  inputBgClass: string;
}) {
  const [navLogo, setNavLogo] = useState(cms.navLogo);
  const [footerLogo, setFooterLogo] = useState(cms.footerLogo);
  const [favicon, setFavicon] = useState(cms.favicon);
  const [brandName, setBrandName] = useState(cms.brandName);
  const [brandSubtitle, setBrandSubtitle] = useState(cms.brandSubtitle);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    updateLogos({ navLogo, footerLogo, favicon, brandName, brandSubtitle });
    showToast('Logos & favicon updated live on the site!');
  };

  return (
    <form onSubmit={handleSave} className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Logos, Favicon & Brand Identity</h1>
        <p className={`text-xs ${isLight ? 'text-gray-500' : 'text-cream/60'}`}>
          Upload navbar logo, dark footer logo, circular browser favicon, and typography from your device.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Nav Logo */}
        <div className={`border rounded-2xl p-5 space-y-4 ${cardBgClass}`}>
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold">Navigation Bar Logo</h3>
            <span className="text-[10px] font-mono opacity-50">PNG / SVG</span>
          </div>
          <div className="h-28 rounded-xl border flex items-center justify-center p-4 bg-gray-50">
            {navLogo ? <img src={navLogo} alt="Nav Logo" className="max-h-20 max-w-full object-contain" /> : <span className="text-xs opacity-30">No logo</span>}
          </div>
          <label className="block">
            <span className="text-xs opacity-70 block mb-1">Upload from Device:</span>
            <input
              type="file"
              accept="image/*"
              disabled={uploadingField === 'navLogo'}
              onChange={(e) => handleFileUpload(e, 'navLogo', setNavLogo)}
              className="w-full text-xs file:mr-2 file:py-1.5 file:px-2.5 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-lime file:text-forest"
            />
          </label>
        </div>

        {/* Footer Logo */}
        <div className={`border rounded-2xl p-5 space-y-4 ${cardBgClass}`}>
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold">Footer Logo</h3>
            <span className="text-[10px] font-mono opacity-50">PNG / SVG</span>
          </div>
          <div className="h-28 rounded-xl border flex items-center justify-center p-4 bg-forest-deep">
            {footerLogo ? <img src={footerLogo} alt="Footer Logo" className="max-h-20 max-w-full object-contain" /> : <span className="text-xs opacity-30">No logo</span>}
          </div>
          <label className="block">
            <span className="text-xs opacity-70 block mb-1">Upload from Device:</span>
            <input
              type="file"
              accept="image/*"
              disabled={uploadingField === 'footerLogo'}
              onChange={(e) => handleFileUpload(e, 'footerLogo', setFooterLogo)}
              className="w-full text-xs file:mr-2 file:py-1.5 file:px-2.5 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-lime file:text-forest"
            />
          </label>
        </div>

        {/* Circular Favicon */}
        <div className={`border rounded-2xl p-5 space-y-4 ${cardBgClass}`}>
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold">Browser Circular Favicon</h3>
            <span className="text-[10px] font-mono opacity-50">Circle format</span>
          </div>
          <div className="h-28 rounded-xl border flex items-center justify-center p-4 bg-gray-50">
            {favicon ? (
              <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-lime shadow-md">
                <img src={favicon} alt="Favicon" className="w-full h-full object-cover" />
              </div>
            ) : (
              <span className="text-xs opacity-30">No favicon</span>
            )}
          </div>
          <label className="block">
            <span className="text-xs opacity-70 block mb-1">Upload from Device:</span>
            <input
              type="file"
              accept="image/*"
              disabled={uploadingField === 'favicon'}
              onChange={(e) => handleFileUpload(e, 'favicon', setFavicon)}
              className="w-full text-xs file:mr-2 file:py-1.5 file:px-2.5 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-lime file:text-forest"
            />
          </label>
        </div>
      </div>

      <div className={`border rounded-2xl p-6 space-y-4 ${cardBgClass}`}>
        <h3 className="text-sm font-bold">Brand Name & Tagline</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="text-xs opacity-70 block mb-1">Brand Name:</label>
            <input
              type="text"
              value={brandName}
              onChange={(e) => setBrandName(e.target.value)}
              className={`w-full px-3 py-2 rounded-xl text-xs focus:outline-none ${inputBgClass}`}
            />
          </div>
          <div>
            <label className="text-xs opacity-70 block mb-1">Subtitle / Descriptor:</label>
            <input
              type="text"
              value={brandSubtitle}
              onChange={(e) => setBrandSubtitle(e.target.value)}
              className={`w-full px-3 py-2 rounded-xl text-xs focus:outline-none ${inputBgClass}`}
            />
          </div>
        </div>
      </div>

      <button
        type="submit"
        className="px-6 py-3 rounded-xl bg-lime hover:bg-lime/90 text-forest font-semibold text-sm transition-all shadow-md cursor-pointer"
      >
        Save Logos & Identity
      </button>
    </form>
  );
}

/* =========================================================================
   8. PAGE HEROES SECTION
   ========================================================================= */
function PageHeroesSection({
  cms,
  updateCMS,
  updatePageHero,
  updateHeroDescription,
  handleFileUpload,
  uploadingField,
  showToast,
  isLight,
  cardBgClass,
  inputBgClass,
}: {
  cms: ReturnType<typeof useCMS>['cms'];
  updateCMS: ReturnType<typeof useCMS>['updateCMS'];
  updatePageHero: ReturnType<typeof useCMS>['updatePageHero'];
  updateHeroDescription: ReturnType<typeof useCMS>['updateHeroDescription'];
  handleFileUpload: (e: React.ChangeEvent<HTMLInputElement>, f: string, cb: (url: string) => void) => void;
  uploadingField: string | null;
  showToast: (m: string) => void;
  isLight: boolean;
  cardBgClass: string;
  inputBgClass: string;
}) {
  const pages: (keyof typeof cms.pageHeroes)[] = ['about', 'services', 'projects', 'contact', 'startProject'];
  const [heroes, setHeroes] = useState(cms.pageHeroes || {});
  const [heroPhrases, setHeroPhrases] = useState(cms.heroPhrases || []);
  const [homeBackgroundImage, setHomeBackgroundImage] = useState(cms.heroBackgroundImage || '');
  const [heroDescription, setHeroDescription] = useState(cms.heroDescription || '');

  useEffect(() => {
    if (cms.pageHeroes) {
      setHeroes(cms.pageHeroes);
    }
    setHeroPhrases(cms.heroPhrases || []);
    setHomeBackgroundImage(cms.heroBackgroundImage || '');
    setHeroDescription(cms.heroDescription || '');
  }, [cms.pageHeroes, cms.heroPhrases, cms.heroBackgroundImage, cms.heroDescription]);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    pages.forEach((p) => {
      if (heroes[p]) {
        updatePageHero(p, heroes[p]);
      }
    });
    updateCMS((prev) => ({
      ...prev,
      heroPhrases: heroPhrases.map((phrase) => phrase.trim()).filter(Boolean).slice(0, 3),
      heroBackgroundImage: homeBackgroundImage.trim() || cms.heroBackgroundImage,
    }));
    updateHeroDescription(heroDescription.trim());
    showToast('Hero text saved. It will sync permanently to every device.');
  };

  const pageLabels: Record<string, string> = {
    about: 'About Page Hero',
    services: 'Services Page Hero',
    projects: 'Projects Showcase Hero',
    contact: 'Contact Page Hero',
    startProject: 'Start a Project Hero',
  };

  const blurMap: Record<string, string> = {
    none: 'blur-none',
    sm: 'blur-sm',
    md: 'blur-md',
    lg: 'blur-lg',
    xl: 'blur-xl',
  };

  return (
    <form onSubmit={handleSave} className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Page Heroes, Backgrounds & Blur Filters</h1>
        <p className={`text-xs ${isLight ? 'text-gray-500' : 'text-cream/60'}`}>
          Customize headline copy, upload custom background images, set image blur intensity, and tune the green overlay opacity for every public page hero.
        </p>
      </div>

      <div className={`border rounded-2xl p-5 space-y-3 ${cardBgClass}`}>
        <h2 className="text-sm font-bold">Home headline rotating phrases</h2>
        <p className={`text-xs ${isLight ? 'text-gray-500' : 'text-cream/60'}`}>These three phrases type, pause, and change in “We turn bold ideas into …” on the home page.</p>
        {[0, 1, 2].map((index) => (
          <input
            key={index}
            type="text"
            value={heroPhrases[index] || ''}
            placeholder={`Phrase ${index + 1}`}
            onChange={(e) => setHeroPhrases((previous) => {
              const next = [...previous];
              next[index] = e.target.value;
              return next;
            })}
            className={`w-full px-3 py-2 rounded-xl text-xs focus:outline-none ${inputBgClass}`}
          />
        ))}
      </div>

      <div className={`border rounded-2xl p-5 space-y-3 ${cardBgClass}`}>
        <h2 className="text-sm font-bold">Home hero description</h2>
        <textarea rows={3} value={heroDescription} onChange={(e) => setHeroDescription(e.target.value)} className={`w-full px-3 py-2 rounded-xl text-xs focus:outline-none ${inputBgClass}`} />
      </div>

      <div className={`border rounded-2xl p-5 space-y-3 ${cardBgClass}`}>
        <h2 className="text-sm font-bold">Home hero background image</h2>
        <p className={`text-xs ${isLight ? 'text-gray-500' : 'text-cream/60'}`}>
          This image appears behind “We turn bold ideas into …” on the home page.
        </p>
        <div className="flex gap-2 items-center">
          <input
            type="text"
            placeholder="Image URL or upload below..."
            value={homeBackgroundImage}
            onChange={(e) => setHomeBackgroundImage(e.target.value)}
            className={`flex-1 px-3 py-2 rounded-xl text-xs focus:outline-none ${inputBgClass}`}
          />
          {homeBackgroundImage && (
            <button
              type="button"
              onClick={() => setHomeBackgroundImage('')}
              className="px-2 py-1.5 text-xs rounded-lg text-red-400 hover:bg-red-500/10 border border-red-500/20"
            >
              Clear
            </button>
          )}
        </div>
        <label className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-dashed text-xs cursor-pointer hover:border-lime transition-colors">
          <Upload className="w-3.5 h-3.5 text-lime" />
          <span>{uploadingField === 'homeHeroBg' ? 'Uploading...' : 'Upload from Device'}</span>
          <input
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => handleFileUpload(e, 'homeHeroBg', (url) => {
              setHomeBackgroundImage(url);
              updateCMS((prev) => ({ ...prev, heroBackgroundImage: url }));
              showToast('Home hero background image uploaded.');
            })}
          />
        </label>
      </div>

      <div className="space-y-6">
        {pages.map((p) => {
          const item = heroes[p] || {
            eyebrow: '',
            title: '',
            description: '',
            backgroundImage: '',
            blur: 'none',
            overlayOpacity: 0.85,
          };
          const blurClass = blurMap[item.blur || 'none'] || 'blur-none';
          const overlayOp = typeof item.overlayOpacity === 'number' ? item.overlayOpacity : 0.85;

          return (
            <div key={p} className={`border rounded-2xl p-5 space-y-4 ${cardBgClass}`}>
              <div className="flex items-center justify-between border-b pb-2">
                <span className={`text-xs font-bold uppercase tracking-wider ${isLight ? 'text-forest' : 'text-lime'}`}>
                  {pageLabels[p] || `${p} Hero`}
                </span>
                <span className="text-xs opacity-40 font-mono">/{p === 'startProject' ? 'start-project' : p}</span>
              </div>

              {/* Eyebrow and Title */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-medium block mb-1">Eyebrow Badge:</label>
                  <input
                    type="text"
                    value={item.eyebrow || ''}
                    onChange={(e) =>
                      setHeroes((prev) => ({
                        ...prev,
                        [p]: { ...item, eyebrow: e.target.value },
                      }))
                    }
                    className={`w-full px-3 py-2 rounded-xl text-xs focus:outline-none ${inputBgClass}`}
                  />
                </div>
                <div>
                  <label className="text-xs font-medium block mb-1">Hero Heading:</label>
                  <input
                    type="text"
                    value={item.title || ''}
                    onChange={(e) =>
                      setHeroes((prev) => ({
                        ...prev,
                        [p]: { ...item, title: e.target.value },
                      }))
                    }
                    className={`w-full px-3 py-2 rounded-xl text-xs focus:outline-none ${inputBgClass}`}
                  />
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="text-xs font-medium block mb-1">Hero Subtitle / Description:</label>
                <textarea
                  rows={2}
                  value={item.description || ''}
                  onChange={(e) =>
                    setHeroes((prev) => ({
                      ...prev,
                      [p]: { ...item, description: e.target.value },
                    }))
                  }
                  className={`w-full px-3 py-2 rounded-xl text-xs focus:outline-none ${inputBgClass}`}
                />
              </div>

              {/* Background Image, Blur Filter, and Overlay Opacity */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-3 border-t">
                {/* Background Image Upload & URL */}
                <div className="space-y-2">
                  <label className="text-xs font-medium block">Hero Background Image:</label>
                  <div className="flex gap-2 items-center">
                    <input
                      type="text"
                      placeholder="Image URL or upload below..."
                      value={item.backgroundImage || ''}
                      onChange={(e) =>
                        setHeroes((prev) => ({
                          ...prev,
                          [p]: { ...item, backgroundImage: e.target.value },
                        }))
                      }
                      className={`flex-1 px-3 py-2 rounded-xl text-xs focus:outline-none ${inputBgClass}`}
                    />
                    {item.backgroundImage && (
                      <button
                        type="button"
                        onClick={() =>
                          setHeroes((prev) => ({
                            ...prev,
                            [p]: { ...item, backgroundImage: '' },
                          }))
                        }
                        className="px-2 py-1.5 text-xs rounded-lg text-red-400 hover:bg-red-500/10 border border-red-500/20"
                        title="Remove image"
                      >
                        Clear
                      </button>
                    )}
                  </div>
                  <label className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-dashed text-xs cursor-pointer hover:border-lime transition-colors">
                    <Upload className="w-3.5 h-3.5 text-lime" />
                    <span>{uploadingField === `heroBg-${p}` ? 'Uploading...' : 'Upload from Device'}</span>
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) =>
                        handleFileUpload(e, `heroBg-${p}`, (url) => {
                          setHeroes((prev) => ({
                            ...prev,
                            [p]: { ...item, backgroundImage: url },
                          }));
                          updatePageHero(p, { ...item, backgroundImage: url });
                          showToast(`Background image uploaded for ${pageLabels[p]}`);
                        })
                      }
                    />
                  </label>
                </div>

                {/* Blur Filter Selector */}
                <div className="space-y-2">
                  <label className="text-xs font-medium block">Blur Filter Amount:</label>
                  <select
                    value={item.blur || 'none'}
                    onChange={(e) =>
                      setHeroes((prev) => ({
                        ...prev,
                        [p]: { ...item, blur: e.target.value },
                      }))
                    }
                    className={`w-full px-3 py-2 rounded-xl text-xs focus:outline-none ${inputBgClass}`}
                  >
                    <option value="none">No Blur (Sharp & Crisp)</option>
                    <option value="sm">Subtle Blur (sm - 4px)</option>
                    <option value="md">Medium Blur (md - 8px)</option>
                    <option value="lg">High Blur (lg - 16px)</option>
                    <option value="xl">Maximum Cinematic Blur (xl - 24px)</option>
                  </select>
                  <p className="text-[11px] opacity-60">
                    Controls backdrop defocus for optimal text readability.
                  </p>
                </div>

                {/* Green Overlay Opacity Slider */}
                <div className="space-y-2">
                  <div className="flex justify-between items-center text-xs">
                    <label className="font-medium">Green Overlay Opacity:</label>
                    <span className="font-mono text-lime font-bold">
                      {Math.round(overlayOp * 100)}%
                    </span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.05"
                    value={overlayOp}
                    onChange={(e) =>
                      setHeroes((prev) => ({
                        ...prev,
                        [p]: { ...item, overlayOpacity: parseFloat(e.target.value) },
                      }))
                    }
                    className="w-full accent-lime cursor-pointer"
                  />
                  <p className="text-[11px] opacity-60">
                    Adjusts DMD forest green dark overlay on top of the image.
                  </p>
                </div>
              </div>

              {/* Live Preview Card */}
              <div className="pt-2">
                <span className="text-[11px] font-bold uppercase tracking-wider text-lime block mb-2">
                  Live Hero Preview
                </span>
                <div className="relative rounded-xl overflow-hidden border border-cream/15 p-6 bg-forest-deep text-cream min-h-[140px] flex flex-col justify-center">
                  {item.backgroundImage ? (
                    <>
                      <img
                        src={item.backgroundImage}
                        alt="Hero background preview"
                        className={`absolute inset-0 w-full h-full object-cover scale-105 ${blurClass}`}
                      />
                      <div
                        className="absolute inset-0 bg-[#0f241a]"
                        style={{ opacity: overlayOp }}
                      />
                    </>
                  ) : (
                    <div className="absolute inset-0 bg-gradient-to-b from-[#163828] to-[#0f241a]" />
                  )}

                  <div className="relative z-10 space-y-2 max-w-xl">
                    <span className="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-lime/20 text-lime border border-lime/30 uppercase tracking-widest">
                      {item.eyebrow || 'Eyebrow'}
                    </span>
                    <h3 className="text-lg font-bold text-cream leading-snug">
                      {item.title || 'Hero Heading Preview'}
                    </h3>
                    <p className="text-xs text-cream/70 line-clamp-2">
                      {item.description || 'Hero description preview text...'}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <button
        type="submit"
        className="px-6 py-3 rounded-xl bg-lime hover:bg-lime/90 text-forest font-semibold text-sm transition-all shadow-md cursor-pointer"
      >
        Save All Page Heroes & Blur Settings
      </button>
    </form>
  );
}

/* =========================================================================
   9. STATS & COUNTERS SECTION
   ========================================================================= */
function CTASectionsEditor({ cms, updateCtaSection, showToast, isLight, cardBgClass, inputBgClass }: {
  cms: ReturnType<typeof useCMS>['cms'];
  updateCtaSection: ReturnType<typeof useCMS>['updateCtaSection'];
  showToast: (message: string) => void;
  isLight: boolean;
  cardBgClass: string;
  inputBgClass: string;
}) {
  const [sections, setSections] = useState(cms.ctaSections);
  useEffect(() => setSections(cms.ctaSections), [cms.ctaSections]);
  const labels: Record<keyof typeof sections, string> = { home: 'Home', about: 'About', services: 'Services', projects: 'Projects', startProject: 'Start a Project', news: 'News' };
  const update = (key: keyof typeof sections, field: keyof typeof sections[typeof key], value: string) => {
    setSections((current) => ({ ...current, [key]: { ...current[key], [field]: value } }));
  };
  const save = (event: React.FormEvent) => {
    event.preventDefault();
    (Object.keys(sections) as Array<keyof typeof sections>).forEach((key) => updateCtaSection(key, sections[key]));
    showToast('CTA sections saved and syncing permanently.');
  };
  return <form onSubmit={save} className="space-y-6">
    <div><h1 className="text-2xl font-bold">Call to Action Sections</h1><p className={`text-xs ${isLight ? 'text-gray-500' : 'text-cream/60'}`}>Edit the closing CTA on each public page.</p></div>
    {(Object.keys(sections) as Array<keyof typeof sections>).map((key) => {
      const item = sections[key];
      return <div key={key} className={`border rounded-2xl p-5 space-y-3 ${cardBgClass}`}>
        <h2 className="text-sm font-bold">{labels[key]} CTA</h2>
        <input value={item.title} onChange={(e) => update(key, 'title', e.target.value)} placeholder="Title" className={`w-full px-3 py-2 rounded-xl text-xs ${inputBgClass}`} />
        <textarea rows={2} value={item.description} onChange={(e) => update(key, 'description', e.target.value)} placeholder="Description" className={`w-full px-3 py-2 rounded-xl text-xs ${inputBgClass}`} />
        <div className="grid gap-3 sm:grid-cols-2"><input value={item.image} onChange={(e) => update(key, 'image', e.target.value)} placeholder="Image URL" className={`px-3 py-2 rounded-xl text-xs ${inputBgClass}`} /><input value={item.imageAlt} onChange={(e) => update(key, 'imageAlt', e.target.value)} placeholder="Image alt text" className={`px-3 py-2 rounded-xl text-xs ${inputBgClass}`} /></div>
        <div className="grid gap-3 sm:grid-cols-2"><input value={item.buttonText} onChange={(e) => update(key, 'buttonText', e.target.value)} placeholder="Button text" className={`px-3 py-2 rounded-xl text-xs ${inputBgClass}`} /><input value={item.buttonTo} onChange={(e) => update(key, 'buttonTo', e.target.value)} placeholder="Button path" className={`px-3 py-2 rounded-xl text-xs ${inputBgClass}`} /></div>
      </div>;
    })}
    <button className="px-6 py-3 rounded-xl bg-lime text-forest font-semibold text-sm">Save CTA Sections</button>
  </form>;
}

function StatsSection({
  cms,
  updateStats,
  showToast,
  isLight,
  cardBgClass,
  inputBgClass,
}: {
  cms: ReturnType<typeof useCMS>['cms'];
  updateStats: ReturnType<typeof useCMS>['updateStats'];
  showToast: (m: string) => void;
  isLight: boolean;
  cardBgClass: string;
  inputBgClass: string;
}) {
  const [stats, setStats] = useState(cms.stats || {});

  useEffect(() => {
    if (cms.stats) {
      setStats(cms.stats);
    }
  }, [cms.stats]);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    updateStats(stats);
    showToast('Public counters updated live!');
  };

  return (
    <form onSubmit={handleSave} className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Public Numbers & Counters</h1>
        <p className={`text-xs ${isLight ? 'text-gray-500' : 'text-cream/60'}`}>
          Update the 4 primary impact numbers displayed across the site.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {[
          { label: 'Projects Delivered', key: 'projectsDelivered', orig: '120+' },
          { label: 'Happy Clients', key: 'happyClients', orig: '45+' },
          { label: 'Countries Served', key: 'countriesServed', orig: '9' },
          { label: 'Average Rating', key: 'averageRating', orig: '4.9' },
        ].map((s) => (
          <div key={s.label} className={`border rounded-2xl p-5 space-y-2 ${cardBgClass}`}>
            <label className={`text-xs font-bold uppercase block ${isLight ? 'text-forest' : 'text-lime'}`}>{s.label}</label>
            <input
              type="text"
              value={(stats as any)?.[s.key] || ''}
              onChange={(e) => setStats({ ...stats, [s.key]: e.target.value })}
              className={`w-full px-3 py-2 text-2xl font-black rounded-xl focus:outline-none ${inputBgClass}`}
            />
            <span className="text-[11px] opacity-50 block">Original: {s.orig}</span>
          </div>
        ))}
      </div>

      <button
        type="submit"
        className="px-6 py-3 rounded-xl bg-lime hover:bg-lime/90 text-forest font-semibold text-sm transition-all shadow-md cursor-pointer"
      >
        Update Public Numbers
      </button>
    </form>
  );
}

/* =========================================================================
   10. TESTIMONIALS SECTION WITH PAGINATION
   ========================================================================= */
function TestimonialsSection({
  cms,
  addTestimonial,
  updateTestimonial,
  deleteTestimonial,
  handleFileUpload,
  uploadingField,
  showToast,
  isLight,
  cardBgClass,
  inputBgClass,
}: {
  cms: ReturnType<typeof useCMS>['cms'];
  addTestimonial: ReturnType<typeof useCMS>['addTestimonial'];
  updateTestimonial: ReturnType<typeof useCMS>['updateTestimonial'];
  deleteTestimonial: ReturnType<typeof useCMS>['deleteTestimonial'];
  handleFileUpload: (e: React.ChangeEvent<HTMLInputElement>, f: string, cb: (url: string) => void) => void;
  uploadingField: string | null;
  showToast: (m: string) => void;
  isLight: boolean;
  cardBgClass: string;
  inputBgClass: string;
}) {
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 3;

  const [showAdd, setShowAdd] = useState(false);
  const [newItem, setNewItem] = useState({ name: '', role: '', quote: '', image: '' });
  const [editing, setEditing] = useState<TestimonialItem | null>(null);

  const saveTestimonials = async (next: TestimonialItem[]) => {
    const saved = await saveCmsStateToSupabase({ ...cms, testimonials: next });
    if (!saved) {
      showToast('Not saved: Supabase did not confirm the testimonial update. Please sign in again and retry.');
      return false;
    }
    return true;
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newItem.name || !newItem.quote) return;
    const item: TestimonialItem = {
      id: `test-${Date.now()}`,
      name: newItem.name,
      role: newItem.role || 'Partner',
      quote: newItem.quote,
      image: newItem.image || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80',
    };
    if (!await saveTestimonials([...cms.testimonials, item])) return;
    addTestimonial(item);
    setShowAdd(false);
    setNewItem({ name: '', role: '', quote: '', image: '' });
    showToast('Testimonial saved permanently to Supabase.');
  };

  const paginatedTestimonials = cms.testimonials.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">
            {cms.sectionTitles?.testimonialsTitle || 'Client Testimonials & Stories'}
          </h1>
          <p className={`text-xs ${isLight ? 'text-gray-500' : 'text-cream/60'}`}>
            Manage the client endorsement stories rotating on the home page.
          </p>
        </div>
        <button
          onClick={() => setShowAdd(!showAdd)}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-lime text-forest font-semibold text-xs cursor-pointer shadow-sm"
        >
          <Plus className="w-4 h-4" />
          <span>Add Client Story</span>
        </button>
      </div>

      {showAdd && (
        <form onSubmit={handleCreate} className={`border rounded-2xl p-6 space-y-4 shadow-xl ${cardBgClass}`}>
          <h3 className="text-sm font-bold text-forest">New Client Story</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <input
              type="text"
              required
              placeholder="Client Name"
              value={newItem.name}
              onChange={(e) => setNewItem({ ...newItem, name: e.target.value })}
              className={`w-full px-3 py-2 rounded-xl text-xs focus:outline-none ${inputBgClass}`}
            />
            <input
              type="text"
              placeholder="Role / Organization"
              value={newItem.role}
              onChange={(e) => setNewItem({ ...newItem, role: e.target.value })}
              className={`w-full px-3 py-2 rounded-xl text-xs focus:outline-none ${inputBgClass}`}
            />
          </div>
          <textarea
            rows={3}
            required
            placeholder="Testimonial Quote"
            value={newItem.quote}
            onChange={(e) => setNewItem({ ...newItem, quote: e.target.value })}
            className={`w-full px-3 py-2 rounded-xl text-xs focus:outline-none ${inputBgClass}`}
          />
          <input
            type="file"
            accept="image/*"
            onChange={(e) => handleFileUpload(e, 'newTest', (url) => setNewItem({ ...newItem, image: url }))}
            className="w-full text-xs file:mr-2 file:py-1.5 file:px-2.5 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-lime file:text-forest"
          />
          <div className="flex justify-end gap-2">
            <button type="button" onClick={() => setShowAdd(false)} className="px-4 py-2 text-xs opacity-60">Cancel</button>
            <button type="submit" className="px-5 py-2 rounded-xl bg-lime text-forest font-semibold text-xs">Save</button>
          </div>
        </form>
      )}

      <div className="space-y-4">
        {paginatedTestimonials.map((t) => (
          <div key={t.id} className={`border rounded-2xl p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 ${cardBgClass}`}>
            <div className="flex items-center gap-4 min-w-0">
              <div className="w-14 h-14 rounded-full overflow-hidden shrink-0 border-2 border-lime">
                <img src={t.image} alt={t.name} onError={(event) => { event.currentTarget.src = '/favicon.png'; }} className="w-full h-full object-cover" />
              </div>
              <div>
                <h4 className="text-sm font-bold">{t.name}</h4>
                <p className="text-xs text-forest font-medium">{t.role}</p>
                <p className="text-xs opacity-70 italic line-clamp-2 mt-1">&ldquo;{t.quote}&rdquo;</p>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0 self-end md:self-center">
              <label className="cursor-pointer px-3 py-1.5 rounded-lg border text-xs hover:bg-gray-100">
                <span>Upload Photo</span>
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) =>
                    handleFileUpload(e, t.id, (url) => {
                      const updated = { ...t, image: url };
                      void saveTestimonials(cms.testimonials.map((item) => item.id === t.id ? updated : item)).then((saved) => {
                        if (saved) {
                          updateTestimonial(updated);
                          showToast(`Photo for ${t.name} is permanently saved.`);
                        }
                      });
                    })
                  }
                />
              </label>
              <button onClick={() => setEditing({ ...t })} className="p-2 rounded-lg border hover:bg-lime/20" title="Edit testimonial">
                <Edit3 className="w-4 h-4" />
              </button>
              <button
                onClick={() => {
                  if (window.confirm(`Delete ${t.name}?`)) {
                    deleteTestimonial(t.id);
                    showToast('Deleted testimonial.');
                  }
                }}
                className="p-2 text-red-500 hover:bg-red-500/10 rounded-lg"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {editing && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-black/55 p-4">
          <form onSubmit={async (e) => { e.preventDefault(); if (await saveTestimonials(cms.testimonials.map((item) => item.id === editing.id ? editing : item))) { updateTestimonial(editing); setEditing(null); showToast('Testimonial saved permanently to Supabase.'); } }} className={`w-full max-w-xl rounded-2xl border p-6 space-y-4 shadow-2xl ${cardBgClass}`}>
            <div className="flex items-center justify-between"><h2 className="font-bold">Edit client testimonial</h2><button type="button" onClick={() => setEditing(null)}><X className="w-5 h-5" /></button></div>
            <input value={editing.name} onChange={(e) => setEditing({ ...editing, name: e.target.value })} className={`w-full rounded-xl px-3 py-2 text-sm ${inputBgClass}`} placeholder="Client name" />
            <input value={editing.role} onChange={(e) => setEditing({ ...editing, role: e.target.value })} className={`w-full rounded-xl px-3 py-2 text-sm ${inputBgClass}`} placeholder="Role" />
            <textarea rows={5} value={editing.quote} onChange={(e) => setEditing({ ...editing, quote: e.target.value })} className={`w-full rounded-xl px-3 py-2 text-sm ${inputBgClass}`} placeholder="Quote" />
            <div className="flex justify-end gap-2"><button type="button" onClick={() => setEditing(null)} className="px-4 py-2 text-sm">Cancel</button><button className="rounded-xl bg-lime px-4 py-2 text-sm font-semibold text-forest">Save changes</button></div>
          </form>
        </div>
      )}

      <PaginationBar
        currentPage={currentPage}
        totalItems={cms.testimonials.length}
        pageSize={pageSize}
        onPageChange={setCurrentPage}
        isLight={isLight}
      />
    </div>
  );
}

/* =========================================================================
   11. TEAM MEMBERS SECTION WITH PAGINATION
   ========================================================================= */
function TeamSection({
  cms,
  updateTeamMember,
  addTeamMember,
  deleteTeamMember,
  handleFileUpload,
  uploadingField,
  showToast,
  isLight,
  cardBgClass,
  inputBgClass,
}: {
  cms: ReturnType<typeof useCMS>['cms'];
  updateTeamMember: ReturnType<typeof useCMS>['updateTeamMember'];
  addTeamMember: ReturnType<typeof useCMS>['addTeamMember'];
  deleteTeamMember: ReturnType<typeof useCMS>['deleteTeamMember'];
  handleFileUpload: (e: React.ChangeEvent<HTMLInputElement>, f: string, cb: (url: string) => void) => void;
  uploadingField: string | null;
  showToast: (m: string) => void;
  isLight: boolean;
  cardBgClass: string;
  inputBgClass: string;
}) {
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 4;

  const [showAddModal, setShowAddModal] = useState(false);
  const [newMember, setNewMember] = useState<TeamMemberItem>({
    name: '',
    role: '',
    specialty: '',
    image: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
  });

  const [editingMemberIdx, setEditingMemberIdx] = useState<number | null>(null);
  const [editFormData, setEditFormData] = useState<TeamMemberItem | null>(null);

  const team = cms.team || [];
  const paginatedTeam = team.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMember.name.trim()) {
      showToast('Please enter the team member name.');
      return;
    }
    addTeamMember({
      name: newMember.name.trim(),
      role: newMember.role.trim() || 'Software Engineer',
      specialty: newMember.specialty.trim() || 'Systems Engineering',
      image: newMember.image.trim() || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
    });
    setNewMember({
      name: '',
      role: '',
      specialty: '',
      image: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
    });
    setShowAddModal(false);
    showToast('New team member added successfully!');
  };

  const handleStartEdit = (idx: number, member: TeamMemberItem) => {
    setEditingMemberIdx(idx);
    setEditFormData({ ...member });
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingMemberIdx !== null && editFormData) {
      updateTeamMember(editingMemberIdx, editFormData);
      setEditingMemberIdx(null);
      setEditFormData(null);
      showToast('Team member updated successfully!');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">
            {cms.sectionTitles?.teamTitle || 'Meet the minds behind Dream Maker Developers'}
          </h1>
          <p className={`text-xs ${isLight ? 'text-gray-500' : 'text-cream/60'}`}>
            Add new engineers, edit roles, specialties, and upload high-resolution portrait photos.
          </p>
        </div>
        <button
          type="button"
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-lime text-forest font-semibold text-xs cursor-pointer shadow-md hover:bg-lime/90 transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>Add Staff Member</span>
        </button>
      </div>

      {/* Add Staff Member Form / Modal */}
      {showAddModal && (
        <div className={`border-2 border-lime/40 rounded-2xl p-6 space-y-4 shadow-xl ${cardBgClass} animate-fade-in`}>
          <div className="flex items-center justify-between border-b pb-3">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-lime animate-pulse" />
              <h3 className="text-sm font-bold uppercase tracking-wider text-lime">Add New Team Member</h3>
            </div>
            <button
              type="button"
              onClick={() => setShowAddModal(false)}
              className="text-xs opacity-60 hover:opacity-100 hover:underline"
            >
              Cancel
            </button>
          </div>

          <form onSubmit={handleAddSubmit} className="space-y-4">
            <div className="flex flex-col sm:flex-row gap-5 items-start">
              {/* Photo preview and upload */}
              <div className="flex flex-col items-center gap-3 shrink-0">
                <div className="w-24 h-24 rounded-2xl overflow-hidden border-2 border-lime shadow-md bg-forest-deep flex items-center justify-center">
                  {newMember.image ? (
                    <img src={newMember.image} alt="Preview" className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-xs opacity-40">No photo</span>
                  )}
                </div>
                <label className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-lime/20 text-lime hover:bg-lime/30 text-xs font-semibold cursor-pointer border border-lime/30 transition-colors">
                  <Upload className="w-3.5 h-3.5" />
                  <span>{uploadingField === 'team-new' ? 'Uploading...' : 'Upload Photo'}</span>
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) =>
                      handleFileUpload(e, 'team-new', (url) =>
                        setNewMember((prev) => ({ ...prev, image: url }))
                      )
                    }
                  />
                </label>
              </div>

              {/* Text fields */}
              <div className="flex-1 w-full space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-medium block mb-1">Full Name:</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Marie Claire Uwase"
                      value={newMember.name}
                      onChange={(e) => setNewMember({ ...newMember, name: e.target.value })}
                      className={`w-full px-3 py-2 rounded-xl text-xs focus:outline-none ${inputBgClass}`}
                    />
                  </div>
                  <div>
                    <label className="text-xs font-medium block mb-1">Role / Job Title:</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Senior Machine Learning Engineer"
                      value={newMember.role}
                      onChange={(e) => setNewMember({ ...newMember, role: e.target.value })}
                      className={`w-full px-3 py-2 rounded-xl text-xs focus:outline-none ${inputBgClass}`}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-medium block mb-1">Specialty / Disciplines:</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. PyTorch, LLMs & Computer Vision"
                      value={newMember.specialty}
                      onChange={(e) => setNewMember({ ...newMember, specialty: e.target.value })}
                      className={`w-full px-3 py-2 rounded-xl text-xs focus:outline-none ${inputBgClass}`}
                    />
                  </div>
                  <div>
                    <label className="text-xs font-medium block mb-1">Photo Image URL (or use Upload above):</label>
                    <input
                      type="text"
                      placeholder="https://..."
                      value={newMember.image}
                      onChange={(e) => setNewMember({ ...newMember, image: e.target.value })}
                      className={`w-full px-3 py-2 rounded-xl text-xs focus:outline-none ${inputBgClass}`}
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t">
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="px-4 py-2 rounded-xl text-xs opacity-70 hover:opacity-100 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 rounded-xl bg-lime text-forest font-semibold text-xs cursor-pointer shadow-md hover:bg-lime/90 transition-all flex items-center gap-1.5"
              >
                <Plus className="w-4 h-4" />
                <span>Save Staff Member</span>
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Edit Staff Member Modal */}
      {editingMemberIdx !== null && editFormData && (
        <div className={`border-2 border-forest-light/60 rounded-2xl p-6 space-y-4 shadow-xl ${cardBgClass} animate-fade-in`}>
          <div className="flex items-center justify-between border-b pb-3">
            <div className="flex items-center gap-2">
              <Edit3 className="w-4 h-4 text-lime" />
              <h3 className="text-sm font-bold uppercase tracking-wider text-lime">Edit Team Member #{editingMemberIdx + 1}</h3>
            </div>
            <button
              type="button"
              onClick={() => {
                setEditingMemberIdx(null);
                setEditFormData(null);
              }}
              className="text-xs opacity-60 hover:opacity-100 hover:underline"
            >
              Cancel
            </button>
          </div>

          <form onSubmit={handleSaveEdit} className="space-y-4">
            <div className="flex flex-col sm:flex-row gap-5 items-start">
              {/* Photo preview and upload */}
              <div className="flex flex-col items-center gap-3 shrink-0">
                <div className="w-24 h-24 rounded-2xl overflow-hidden border-2 border-lime shadow-md bg-forest-deep flex items-center justify-center">
                  {editFormData.image ? (
                    <img src={editFormData.image} alt="Preview" className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-xs opacity-40">No photo</span>
                  )}
                </div>
                <label className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-lime/20 text-lime hover:bg-lime/30 text-xs font-semibold cursor-pointer border border-lime/30 transition-colors">
                  <Upload className="w-3.5 h-3.5" />
                  <span>{uploadingField === `team-edit-${editingMemberIdx}` ? 'Uploading...' : 'Replace Photo'}</span>
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) =>
                      handleFileUpload(e, `team-edit-${editingMemberIdx}`, (url) =>
                        setEditFormData((prev) => (prev ? { ...prev, image: url } : prev))
                      )
                    }
                  />
                </label>
              </div>

              {/* Text fields */}
              <div className="flex-1 w-full space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-medium block mb-1">Full Name:</label>
                    <input
                      type="text"
                      required
                      value={editFormData.name}
                      onChange={(e) => setEditFormData({ ...editFormData, name: e.target.value })}
                      className={`w-full px-3 py-2 rounded-xl text-xs focus:outline-none ${inputBgClass}`}
                    />
                  </div>
                  <div>
                    <label className="text-xs font-medium block mb-1">Role / Job Title:</label>
                    <input
                      type="text"
                      required
                      value={editFormData.role}
                      onChange={(e) => setEditFormData({ ...editFormData, role: e.target.value })}
                      className={`w-full px-3 py-2 rounded-xl text-xs focus:outline-none ${inputBgClass}`}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-medium block mb-1">Specialty / Disciplines:</label>
                    <input
                      type="text"
                      required
                      value={editFormData.specialty}
                      onChange={(e) => setEditFormData({ ...editFormData, specialty: e.target.value })}
                      className={`w-full px-3 py-2 rounded-xl text-xs focus:outline-none ${inputBgClass}`}
                    />
                  </div>
                  <div>
                    <label className="text-xs font-medium block mb-1">Photo Image URL:</label>
                    <input
                      type="text"
                      value={editFormData.image}
                      onChange={(e) => setEditFormData({ ...editFormData, image: e.target.value })}
                      className={`w-full px-3 py-2 rounded-xl text-xs focus:outline-none ${inputBgClass}`}
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t">
              <button
                type="button"
                onClick={() => {
                  setEditingMemberIdx(null);
                  setEditFormData(null);
                }}
                className="px-4 py-2 rounded-xl text-xs opacity-70 hover:opacity-100 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 rounded-xl bg-lime text-forest font-semibold text-xs cursor-pointer shadow-md hover:bg-lime/90 transition-all flex items-center gap-1.5"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Save Changes</span>
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Team Member Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {paginatedTeam.map((member, localIdx) => {
          const actualIdx = (currentPage - 1) * pageSize + localIdx;
          return (
            <div key={actualIdx} className={`border rounded-2xl p-5 space-y-4 ${cardBgClass}`}>
              <div className="flex items-start gap-4">
                <div className="w-16 h-16 rounded-xl overflow-hidden shrink-0 border bg-forest-deep">
                  <img src={member.image} alt={member.name} className="w-full h-full object-cover" />
                </div>
                <div className="flex-1 space-y-2">
                  <div className="flex items-center justify-between">
                    <input
                      type="text"
                      value={member.name || ''}
                      onChange={(e) => updateTeamMember(actualIdx, { ...member, name: e.target.value })}
                      className={`font-bold text-sm border-b pb-1 focus:outline-none w-full mr-2 ${
                        isLight ? 'text-gray-900 border-gray-200' : 'text-cream border-cream/20 bg-transparent'
                      }`}
                      placeholder="Full Name"
                    />
                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        type="button"
                        onClick={() => handleStartEdit(actualIdx, member)}
                        className="text-forest hover:text-forest-dark p-1 rounded hover:bg-lime/20"
                        title="Edit member in full form"
                      >
                        <Edit3 className="w-3.5 h-3.5 text-lime" />
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          if (window.confirm(`Delete ${member.name}?`)) {
                            deleteTeamMember(actualIdx);
                            showToast('Deleted team member.');
                          }
                        }}
                        className="text-red-500 p-1 hover:bg-red-500/10 rounded"
                        title="Delete member"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                  <input
                    type="text"
                    value={member.role || ''}
                    onChange={(e) => updateTeamMember(actualIdx, { ...member, role: e.target.value })}
                    className={`text-xs font-semibold border-b pb-1 focus:outline-none w-full ${
                      isLight ? 'text-forest border-gray-200' : 'text-lime border-cream/15 bg-transparent'
                    }`}
                    placeholder="Role"
                  />
                  <input
                    type="text"
                    value={member.specialty || ''}
                    onChange={(e) => updateTeamMember(actualIdx, { ...member, specialty: e.target.value })}
                    className={`text-[11px] border-b pb-1 focus:outline-none w-full ${
                      isLight ? 'text-gray-500 border-gray-200' : 'text-cream/70 border-cream/10 bg-transparent'
                    }`}
                    placeholder="Specialty"
                  />
                </div>
              </div>

              <div className="pt-2 border-t flex items-center justify-between text-xs">
                <label className={`cursor-pointer font-semibold hover:underline flex items-center gap-1.5 ${isLight ? 'text-forest' : 'text-lime'}`}>
                  <Upload className="w-3.5 h-3.5" />
                  <span>Upload Photo</span>
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) =>
                      handleFileUpload(e, `team-${actualIdx}`, (url) => {
                        updateTeamMember(actualIdx, { ...member, image: url });
                        showToast(`Photo updated for ${member.name}`);
                      })
                    }
                  />
                </label>
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => handleStartEdit(actualIdx, member)}
                    className="text-[11px] text-lime hover:underline font-medium"
                  >
                    Edit Form
                  </button>
                  <span className="text-[10px] opacity-40">Staff #{actualIdx + 1}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <PaginationBar
        currentPage={currentPage}
        totalItems={team.length}
        pageSize={pageSize}
        onPageChange={setCurrentPage}
        isLight={isLight}
      />
    </div>
  );
}

/* =========================================================================
   12. SLIDING PARTNERS SECTION WITH PAGINATION
   ========================================================================= */
function PartnersSection({
  cms,
  updatePartnerImages,
  handleFileUpload,
  uploadingField,
  showToast,
  isLight,
  cardBgClass,
}: {
  cms: ReturnType<typeof useCMS>['cms'];
  updatePartnerImages: ReturnType<typeof useCMS>['updatePartnerImages'];
  handleFileUpload: (e: React.ChangeEvent<HTMLInputElement>, f: string, cb: (url: string) => void) => void;
  uploadingField: string | null;
  showToast: (m: string) => void;
  isLight: boolean;
  cardBgClass: string;
}) {
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 8;

  const handleDelete = (index: number) => {
    const updated = cms.partnerImages.filter((_, i) => i !== index);
    updatePartnerImages(updated);
    showToast('Partner logo removed.');
  };

  const handleAdd = (url: string) => {
    updatePartnerImages([...cms.partnerImages, url]);
    showToast('Partner logo added!');
  };

  const partnerImages = cms.partnerImages || [];
  const paginatedImages = partnerImages.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Sliding Partner Badges</h1>
          <p className={`text-xs ${isLight ? 'text-gray-500' : 'text-cream/60'}`}>
            Manage the animated partner badges sliding in the About section.
          </p>
        </div>

        <label className="flex items-center gap-2 px-4 py-2 rounded-xl bg-lime text-forest font-semibold text-xs cursor-pointer shadow-sm">
          <Upload className="w-4 h-4" />
          <span>Upload Partner Logo</span>
          <input type="file" accept="image/*" className="hidden" onChange={(e) => handleFileUpload(e, 'partner', handleAdd)} />
        </label>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {paginatedImages.map((img, localIdx) => {
          const actualIdx = (currentPage - 1) * pageSize + localIdx;
          return (
            <div key={actualIdx} className={`border rounded-2xl p-4 flex flex-col items-center justify-center relative group ${cardBgClass}`}>
              <div className="h-16 w-full flex items-center justify-center p-2">
                <img src={img} alt={`Partner ${actualIdx}`} className="max-h-12 max-w-full object-contain" />
              </div>
              <button
                onClick={() => handleDelete(actualIdx)}
                className="absolute top-2 right-2 p-1.5 rounded-lg bg-red-500/10 text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          );
        })}
      </div>

      <PaginationBar
        currentPage={currentPage}
        totalItems={partnerImages.length}
        pageSize={pageSize}
        onPageChange={setCurrentPage}
        isLight={isLight}
      />
    </div>
  );
}

/* =========================================================================
   13. WORKFLOW VIDEO SECTION
   ========================================================================= */
function WorkflowSection({
  cms,
  updateWorkflow,
  handleFileUpload,
  uploadingField,
  showToast,
  isLight,
  cardBgClass,
  inputBgClass,
}: {
  cms: ReturnType<typeof useCMS>['cms'];
  updateWorkflow: ReturnType<typeof useCMS>['updateWorkflow'];
  handleFileUpload: (e: React.ChangeEvent<HTMLInputElement>, f: string, cb: (url: string) => void) => void;
  uploadingField: string | null;
  showToast: (m: string) => void;
  isLight: boolean;
  cardBgClass: string;
  inputBgClass: string;
}) {
  const [workflow, setWorkflow] = useState(
    cms.workflow || { videoUrl: '', poster: '', title: '', description: '' }
  );

  useEffect(() => {
    if (cms.workflow) {
      setWorkflow(cms.workflow);
    }
  }, [cms.workflow]);

  const publishWorkflow = async (nextWorkflow: typeof workflow) => {
    updateWorkflow(nextWorkflow);
    const saved = await saveCmsStateToSupabase({ ...cms, workflow: nextWorkflow });
    showToast(saved ? 'Workflow video saved and published to the About page.' : 'The file uploaded, but the workflow details could not be saved. Please retry.');
    return saved;
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    await publishWorkflow(workflow);
  };

  return (
    <form onSubmit={handleSave} className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Workflow in Action Video</h1>
        <p className={`text-xs ${isLight ? 'text-gray-500' : 'text-cream/60'}`}>
          Configure the video stream URL, poster thumbnail, and narrative copy on the About page.
        </p>
      </div>

      <div className={`border rounded-2xl p-6 space-y-4 ${cardBgClass}`}>
        <div>
          <label className="text-xs font-medium block mb-1">Video Stream URL (MP4 / WebM):</label>
          <input
            type="text"
            value={workflow?.videoUrl || ''}
            onChange={(e) => setWorkflow((prev) => ({ ...prev, videoUrl: e.target.value }))}
            className={`w-full px-3 py-2 rounded-xl text-xs font-mono focus:outline-none ${inputBgClass}`}
          />
          <label className="mt-3 block text-xs font-medium">
            Upload video from device (MP4 / WebM, maximum 100 MB):
            <input
              type="file"
              accept="video/mp4,video/webm"
              disabled={uploadingField === 'workflowVideo'}
              onChange={(e) => handleFileUpload(e, 'workflowVideo', async (url) => {
                const nextWorkflow = { ...workflow, videoUrl: url };
                setWorkflow(nextWorkflow);
                await publishWorkflow(nextWorkflow);
              })}
              className="mt-1 w-full text-xs file:mr-2 file:py-1.5 file:px-2.5 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-lime file:text-forest"
            />
          </label>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="text-xs font-medium block mb-1">Poster Image URL:</label>
            <input
              type="text"
              value={workflow?.poster || ''}
              onChange={(e) => setWorkflow((prev) => ({ ...prev, poster: e.target.value }))}
              className={`w-full px-3 py-2 rounded-xl text-xs font-mono focus:outline-none ${inputBgClass}`}
            />
          </div>
          <div>
            <label className="text-xs font-medium block mb-1">Upload Poster from Device:</label>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => handleFileUpload(e, 'wfPoster', async (url) => {
                const nextWorkflow = { ...workflow, poster: url };
                setWorkflow(nextWorkflow);
                await publishWorkflow(nextWorkflow);
              })}
              className="w-full text-xs file:mr-2 file:py-1.5 file:px-2.5 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-lime file:text-forest"
            />
          </div>
        </div>

        <div>
          <label className="text-xs font-medium block mb-1">Section Title:</label>
          <input
            type="text"
            value={workflow?.title || ''}
            onChange={(e) => setWorkflow((prev) => ({ ...prev, title: e.target.value }))}
            className={`w-full px-3 py-2 rounded-xl text-xs focus:outline-none ${inputBgClass}`}
          />
        </div>

        <div>
          <label className="text-xs font-medium block mb-1">Narrative Description:</label>
          <textarea
            rows={3}
            value={workflow?.description || ''}
            onChange={(e) => setWorkflow((prev) => ({ ...prev, description: e.target.value }))}
            className={`w-full px-3 py-2 rounded-xl text-xs focus:outline-none ${inputBgClass}`}
          />
        </div>
      </div>

      <button
        type="submit"
        className="px-6 py-3 rounded-xl bg-lime hover:bg-lime/90 text-forest font-semibold text-sm transition-all shadow-md cursor-pointer"
      >
        Save Workflow Video
      </button>
    </form>
  );
}

/* =========================================================================
   14. SERVICES SECTION
   ========================================================================= */
function ServicesSection({
  cms,
  updateService,
  showToast,
  isLight,
  cardBgClass,
  inputBgClass,
}: {
  cms: ReturnType<typeof useCMS>['cms'];
  updateService: ReturnType<typeof useCMS>['updateService'];
  showToast: (m: string) => void;
  isLight: boolean;
  cardBgClass: string;
  inputBgClass: string;
}) {
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [draft, setDraft] = useState<ServiceItem | null>(null);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">
          {cms.sectionTitles?.servicesTitle || 'Engineered For Scale & Performance'}
        </h1>
        <p className={`text-xs ${isLight ? 'text-gray-500' : 'text-cream/60'}`}>
          Edit service titles, summaries, in-depth descriptions, and deliverables.
        </p>
      </div>

      <div className={`overflow-hidden rounded-2xl border ${cardBgClass}`}>
        <div className="grid grid-cols-[auto_1fr_auto] gap-4 border-b px-5 py-3 text-[11px] font-bold uppercase tracking-wider opacity-60">
          <span>#</span><span>Service</span><span>Action</span>
        </div>
        {(cms.services || []).map((srv, idx) => (
          <div key={srv.slug || idx} className="grid grid-cols-[auto_1fr_auto] items-center gap-4 border-b px-5 py-4 last:border-0">
            <span className="text-xs opacity-50">{idx + 1}</span>
            <button onClick={() => { setEditingIndex(idx); setDraft({ ...srv, deliverables: [...srv.deliverables] }); }} className="min-w-0 text-left"><strong className="block truncate text-sm">{srv.title}</strong><span className="block truncate text-xs opacity-60">{srv.summary}</span></button>
            <button onClick={() => { setEditingIndex(idx); setDraft({ ...srv, deliverables: [...srv.deliverables] }); }} className="rounded-lg border p-2 hover:bg-lime/20" title="Edit service"><Edit3 className="h-4 w-4" /></button>
          </div>
        ))}
      </div>

      {draft && editingIndex !== null && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-black/55 p-4">
          <form onSubmit={(e) => { e.preventDefault(); updateService(editingIndex, draft); setEditingIndex(null); setDraft(null); showToast('Service updated and saved.'); }} className={`w-full max-w-2xl rounded-2xl border p-6 space-y-4 shadow-2xl ${cardBgClass}`}>
            <div className="flex items-center justify-between"><h2 className="font-bold">Edit service</h2><button type="button" onClick={() => { setEditingIndex(null); setDraft(null); }}><X className="w-5 h-5" /></button></div>
            <input value={draft.title} onChange={(e) => setDraft({ ...draft, title: e.target.value })} className={`w-full rounded-xl px-3 py-2 text-sm ${inputBgClass}`} placeholder="Title" />
            <input value={draft.summary} onChange={(e) => setDraft({ ...draft, summary: e.target.value })} className={`w-full rounded-xl px-3 py-2 text-sm ${inputBgClass}`} placeholder="Summary" />
            <textarea rows={5} value={draft.details} onChange={(e) => setDraft({ ...draft, details: e.target.value })} className={`w-full rounded-xl px-3 py-2 text-sm ${inputBgClass}`} placeholder="Full description" />
            <input value={draft.deliverables.join(', ')} onChange={(e) => setDraft({ ...draft, deliverables: e.target.value.split(',').map((item) => item.trim()).filter(Boolean) })} className={`w-full rounded-xl px-3 py-2 text-sm ${inputBgClass}`} placeholder="Deliverables, comma separated" />
            <div className="flex justify-end gap-2"><button type="button" onClick={() => { setEditingIndex(null); setDraft(null); }} className="px-4 py-2 text-sm">Cancel</button><button className="rounded-xl bg-lime px-4 py-2 text-sm font-semibold text-forest">Save changes</button></div>
          </form>
        </div>
      )}
    </div>
  );
}

/* =========================================================================
   15. PROJECTS SECTION WITH PAGINATION
   ========================================================================= */
function ProjectsSection({
  cms,
  addProject,
  updateProject,
  deleteProject,
  handleFileUpload,
  uploadingField,
  showToast,
  isLight,
  cardBgClass,
  inputBgClass,
}: {
  cms: ReturnType<typeof useCMS>['cms'];
  addProject: ReturnType<typeof useCMS>['addProject'];
  updateProject: ReturnType<typeof useCMS>['updateProject'];
  deleteProject: ReturnType<typeof useCMS>['deleteProject'];
  handleFileUpload: (e: React.ChangeEvent<HTMLInputElement>, f: string, cb: (url: string) => void) => void;
  uploadingField: string | null;
  showToast: (m: string) => void;
  isLight: boolean;
  cardBgClass: string;
  inputBgClass: string;
}) {
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 4;

  const [showAdd, setShowAdd] = useState(false);
  const [editing, setEditing] = useState<ProjectItem | null>(null);
  const [newProj, setNewProj] = useState<Partial<ProjectItem>>({
    title: '',
    category: 'software',
    categoryLabel: 'Software & Web',
    summary: '',
    impact: '',
    image: '',
    tags: ['React', 'TypeScript'],
  });

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProj.title) return;
    addProject({
      id: `proj-${Date.now()}`,
      title: newProj.title,
      category: newProj.category as any || 'software',
      categoryLabel: newProj.categoryLabel || 'Software & Web',
      summary: newProj.summary || '',
      impact: newProj.impact || '',
      image: newProj.image || '/5bfe9030-9ed1-4761-a332-2c3df8f3bfbb.jpg',
      tags: newProj.tags || ['Next.js'],
      link: newProj.link || '',
    });
    setShowAdd(false);
    showToast(`Project "${newProj.title}" added to showcase!`);
  };

  const projects = cms.projects || [];
  const paginatedProjects = projects.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">
            {cms.sectionTitles?.projectsTitle || 'Curated Projects Showcase'}
          </h1>
          <p className={`text-xs ${isLight ? 'text-gray-500' : 'text-cream/60'}`}>
            Manage projects, metrics, tech tags, and showcase images with pagination.
          </p>
        </div>
        <button
          onClick={() => setShowAdd(!showAdd)}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-lime text-forest font-semibold text-xs cursor-pointer shadow-sm"
        >
          <Plus className="w-4 h-4" />
          <span>Add Project</span>
        </button>
      </div>

      {showAdd && (
        <form onSubmit={handleCreate} className={`border rounded-2xl p-6 space-y-4 shadow-xl ${cardBgClass}`}>
          <h3 className="text-sm font-bold text-forest">New Project Showcase</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <input
              type="text"
              required
              placeholder="Project Title"
              value={newProj.title}
              onChange={(e) => setNewProj({ ...newProj, title: e.target.value })}
              className={`w-full px-3 py-2 rounded-xl text-xs focus:outline-none ${inputBgClass}`}
            />
            <select
              value={newProj.category}
              onChange={(e) =>
                setNewProj({
                  ...newProj,
                  category: e.target.value as any,
                  categoryLabel: e.target.options[e.target.selectedIndex].text,
                })
              }
              className={`w-full px-3 py-2 rounded-xl text-xs focus:outline-none ${inputBgClass}`}
            >
              <option value="software">Software & Web</option>
              <option value="mobile">Mobile Apps</option>
              <option value="ai">Artificial Intelligence</option>
              <option value="design">UI/UX Design</option>
              <option value="consulting">IT Consulting</option>
            </select>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <input
              type="text"
              placeholder="Impact Metric (e.g. Processed $42M+ in year one)"
              value={newProj.impact}
              onChange={(e) => setNewProj({ ...newProj, impact: e.target.value })}
              className={`w-full px-3 py-2 rounded-xl text-xs focus:outline-none ${inputBgClass}`}
            />
            <input
              type="text"
              placeholder="Live URL (optional)"
              value={newProj.link}
              onChange={(e) => setNewProj({ ...newProj, link: e.target.value })}
              className={`w-full px-3 py-2 rounded-xl text-xs focus:outline-none ${inputBgClass}`}
            />
          </div>

          <textarea
            rows={2}
            placeholder="Project Summary"
            value={newProj.summary}
            onChange={(e) => setNewProj({ ...newProj, summary: e.target.value })}
            className={`w-full px-3 py-2 rounded-xl text-xs focus:outline-none ${inputBgClass}`}
          />

          <input
            type="file"
            accept="image/*"
            onChange={(e) => handleFileUpload(e, 'newProj', (url) => setNewProj({ ...newProj, image: url }))}
            className="w-full text-xs file:mr-2 file:py-1.5 file:px-2.5 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-lime file:text-forest"
          />

          <div className="flex justify-end gap-2">
            <button type="button" onClick={() => setShowAdd(false)} className="px-4 py-2 text-xs opacity-60">Cancel</button>
            <button type="submit" className="px-5 py-2 rounded-xl bg-lime text-forest font-semibold text-xs">Add Project</button>
          </div>
        </form>
      )}

      <div className="space-y-4">
        {paginatedProjects.map((proj) => (
          <div key={proj.id} className={`border rounded-2xl p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 ${cardBgClass}`}>
            <div className="flex items-center gap-4 min-w-0">
              <div className="w-20 h-16 rounded-xl overflow-hidden shrink-0 border">
                <img src={proj.image} alt={proj.title} className="w-full h-full object-cover" />
              </div>
              <div>
                <span className="text-[10px] font-bold uppercase text-forest">{proj.categoryLabel}</span>
                <h4 className="text-sm font-bold truncate">{proj.title}</h4>
                <p className="text-xs opacity-60 line-clamp-1">{proj.summary}</p>
                <span className="text-[11px] font-medium text-forest block">{proj.impact}</span>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0 self-end md:self-center">
              <label className="cursor-pointer px-3 py-1.5 rounded-lg border text-xs hover:bg-gray-100">
                <span>Upload Image</span>
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) =>
                    handleFileUpload(e, proj.id, (url) => {
                      updateProject({ ...proj, image: url });
                      showToast(`Image updated for ${proj.title}`);
                    })
                  }
                />
              </label>
              <button onClick={() => setEditing({ ...proj })} className="p-2 rounded-lg border hover:bg-lime/20" title="Edit project"><Edit3 className="w-4 h-4" /></button>
              <button
                onClick={() => {
                  if (window.confirm(`Delete ${proj.title}?`)) {
                    deleteProject(proj.id);
                    showToast('Project deleted.');
                  }
                }}
                className="p-2 text-red-500 hover:bg-red-500/10 rounded-lg"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {editing && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-black/55 p-4">
          <form onSubmit={(e) => { e.preventDefault(); updateProject(editing); setEditing(null); showToast('Project updated and saved.'); }} className={`w-full max-w-2xl rounded-2xl border p-6 space-y-4 shadow-2xl ${cardBgClass}`}>
            <div className="flex items-center justify-between"><h2 className="font-bold">Edit project</h2><button type="button" onClick={() => setEditing(null)}><X className="w-5 h-5" /></button></div>
            <input value={editing.title} onChange={(e) => setEditing({ ...editing, title: e.target.value })} className={`w-full rounded-xl px-3 py-2 text-sm ${inputBgClass}`} placeholder="Title" />
            <div className="grid gap-3 sm:grid-cols-2"><input value={editing.categoryLabel} onChange={(e) => setEditing({ ...editing, categoryLabel: e.target.value })} className={`rounded-xl px-3 py-2 text-sm ${inputBgClass}`} placeholder="Category" /><input value={editing.impact} onChange={(e) => setEditing({ ...editing, impact: e.target.value })} className={`rounded-xl px-3 py-2 text-sm ${inputBgClass}`} placeholder="Impact" /></div>
            <textarea rows={4} value={editing.summary} onChange={(e) => setEditing({ ...editing, summary: e.target.value })} className={`w-full rounded-xl px-3 py-2 text-sm ${inputBgClass}`} placeholder="Summary" />
            <input value={editing.tags.join(', ')} onChange={(e) => setEditing({ ...editing, tags: e.target.value.split(',').map((tag) => tag.trim()).filter(Boolean) })} className={`w-full rounded-xl px-3 py-2 text-sm ${inputBgClass}`} placeholder="Tags" />
            <div className="flex justify-end gap-2"><button type="button" onClick={() => setEditing(null)} className="px-4 py-2 text-sm">Cancel</button><button className="rounded-xl bg-lime px-4 py-2 text-sm font-semibold text-forest">Save changes</button></div>
          </form>
        </div>
      )}

      <PaginationBar
        currentPage={currentPage}
        totalItems={cms.projects.length}
        pageSize={pageSize}
        onPageChange={setCurrentPage}
        isLight={isLight}
      />
    </div>
  );
}

/* =========================================================================
   16. NEWS & ARTICLES SECTION WITH PAGINATION
   ========================================================================= */
function NewsSection({
  cms,
  addNewsArticle,
  updateNewsArticle,
  deleteNewsArticle,
  handleFileUpload,
  uploadingField,
  showToast,
  isLight,
  cardBgClass,
  inputBgClass,
}: {
  cms: ReturnType<typeof useCMS>['cms'];
  addNewsArticle: ReturnType<typeof useCMS>['addNewsArticle'];
  updateNewsArticle: ReturnType<typeof useCMS>['updateNewsArticle'];
  deleteNewsArticle: ReturnType<typeof useCMS>['deleteNewsArticle'];
  handleFileUpload: (e: React.ChangeEvent<HTMLInputElement>, f: string, cb: (url: string) => void) => void;
  uploadingField: string | null;
  showToast: (m: string) => void;
  isLight: boolean;
  cardBgClass: string;
  inputBgClass: string;
}) {
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 3;

  const [showAdd, setShowAdd] = useState(false);
  const [editing, setEditing] = useState<NewsItem | null>(null);
  const [newArticle, setNewArticle] = useState<Partial<NewsItem>>({
    title: '',
    category: 'EDITORIAL',
    date: new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }),
    author: 'Sarah Gakire',
    authorRole: 'Head of AI, DMD',
    authorImage: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80',
    excerpt: '',
    content: [''],
    image: '/5bfe9030-9ed1-4761-a332-2c3df8f3bfbb.jpg',
  });

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newArticle.title) return;
    addNewsArticle({
      id: `art-${Date.now()}`,
      title: newArticle.title,
      category: newArticle.category || 'EDITORIAL',
      date: newArticle.date || 'Today',
      readTime: '5 min read',
      author: newArticle.author || 'DMD Editorial',
      authorRole: newArticle.authorRole || 'Contributor',
      authorImage: newArticle.authorImage || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80',
      excerpt: newArticle.excerpt || '',
      content: newArticle.content?.length ? newArticle.content : ['Full editorial story.'],
      image: newArticle.image || '/5bfe9030-9ed1-4761-a332-2c3df8f3bfbb.jpg',
    });
    setShowAdd(false);
    showToast(`Article "${newArticle.title}" published!`);
  };

  const paginatedNews = cms.newsArticles.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">
            {cms.sectionTitles?.newsTitle || 'News, Opinions & Publications'}
          </h1>
          <p className={`text-xs ${isLight ? 'text-gray-500' : 'text-cream/60'}`}>
            Publish opinions, technical analyses, and author portraits with pagination.
          </p>
        </div>
        <button
          onClick={() => setShowAdd(!showAdd)}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-lime text-forest font-semibold text-xs cursor-pointer shadow-sm"
        >
          <Plus className="w-4 h-4" />
          <span>Publish Article</span>
        </button>
      </div>

      {showAdd && (
        <form onSubmit={handleCreate} className={`border rounded-2xl p-6 space-y-4 shadow-xl ${cardBgClass}`}>
          <h3 className="text-sm font-bold text-forest">New Editorial Article</h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <input
              type="text"
              required
              placeholder="Headline"
              value={newArticle.title}
              onChange={(e) => setNewArticle({ ...newArticle, title: e.target.value })}
              className={`sm:col-span-2 px-3 py-2 rounded-xl text-xs focus:outline-none ${inputBgClass}`}
            />
            <input
              type="text"
              placeholder="Category (OPINION / TECH)"
              value={newArticle.category}
              onChange={(e) => setNewArticle({ ...newArticle, category: e.target.value.toUpperCase() })}
              className={`px-3 py-2 rounded-xl text-xs font-mono focus:outline-none ${inputBgClass}`}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <input
              type="text"
              placeholder="Author Name"
              value={newArticle.author}
              onChange={(e) => setNewArticle({ ...newArticle, author: e.target.value })}
              className={`px-3 py-2 rounded-xl text-xs focus:outline-none ${inputBgClass}`}
            />
            <input
              type="text"
              placeholder="Author Role"
              value={newArticle.authorRole}
              onChange={(e) => setNewArticle({ ...newArticle, authorRole: e.target.value })}
              className={`px-3 py-2 rounded-xl text-xs focus:outline-none ${inputBgClass}`}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <label className="block text-xs opacity-70">
              <span>Author Photo:</span>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => handleFileUpload(e, 'author', (url) => setNewArticle({ ...newArticle, authorImage: url }))}
                className="w-full mt-1 text-xs file:mr-2 file:py-1 file:px-2 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-lime file:text-forest"
              />
            </label>
            <label className="block text-xs opacity-70">
              <span>Featured Article Image:</span>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => handleFileUpload(e, 'article', (url) => setNewArticle({ ...newArticle, image: url }))}
                className="w-full mt-1 text-xs file:mr-2 file:py-1 file:px-2 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-lime file:text-forest"
              />
            </label>
          </div>

          <textarea
            rows={2}
            placeholder="Excerpt / Hook"
            value={newArticle.excerpt}
            onChange={(e) => setNewArticle({ ...newArticle, excerpt: e.target.value })}
            className={`w-full px-3 py-2 rounded-xl text-xs focus:outline-none ${inputBgClass}`}
          />

          <textarea
            rows={4}
            placeholder="Full Article Content (paragraphs separated by double enter)"
            value={newArticle.content?.join('\n\n')}
            onChange={(e) => setNewArticle({ ...newArticle, content: e.target.value.split('\n\n').filter(Boolean) })}
            className={`w-full px-3 py-2 rounded-xl text-xs font-serif focus:outline-none ${inputBgClass}`}
          />

          <div className="flex justify-end gap-2">
            <button type="button" onClick={() => setShowAdd(false)} className="px-4 py-2 text-xs opacity-60">Cancel</button>
            <button type="submit" className="px-5 py-2 rounded-xl bg-lime text-forest font-semibold text-xs">Publish</button>
          </div>
        </form>
      )}

      <div className="space-y-4">
        {paginatedNews.map((article) => (
          <div key={article.id} className={`border rounded-2xl p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 ${cardBgClass}`}>
            <div className="flex items-center gap-4 min-w-0">
              <div className="w-20 h-16 rounded-xl overflow-hidden shrink-0 border">
                <img src={article.image} alt={article.title} className="w-full h-full object-cover" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-bold uppercase text-forest">{article.category}</span>
                  <span className="text-[10px] opacity-40">&bull; {article.date}</span>
                </div>
                <h4 className="text-sm font-bold truncate">{article.title}</h4>
                <div className="flex items-center gap-2 mt-1">
                  <img src={article.authorImage} alt={article.author} className="w-4 h-4 rounded-full object-cover" />
                  <span className="text-xs opacity-70">{article.author} ({article.authorRole})</span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0 self-end md:self-center">
              <label className="cursor-pointer px-3 py-1.5 rounded-lg border text-xs hover:bg-gray-100">
                <span>Upload Image</span>
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) =>
                    handleFileUpload(e, article.id, (url) => {
                      updateNewsArticle({ ...article, image: url });
                      showToast('Article image updated!');
                    })
                  }
                />
              </label>
              <button onClick={() => setEditing({ ...article, content: [...article.content] })} className="p-2 rounded-lg border hover:bg-lime/20" title="Edit article"><Edit3 className="w-4 h-4" /></button>
              <button
                onClick={() => {
                  if (window.confirm(`Delete ${article.title}?`)) {
                    deleteNewsArticle(article.id);
                    showToast('Article deleted.');
                  }
                }}
                className="p-2 text-red-500 hover:bg-red-500/10 rounded-lg"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {editing && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-black/55 p-4">
          <form onSubmit={(e) => { e.preventDefault(); updateNewsArticle(editing); setEditing(null); showToast('Article updated and saved.'); }} className={`w-full max-w-2xl rounded-2xl border p-6 space-y-4 shadow-2xl ${cardBgClass}`}>
            <div className="flex items-center justify-between"><h2 className="font-bold">Edit article</h2><button type="button" onClick={() => setEditing(null)}><X className="w-5 h-5" /></button></div>
            <input value={editing.title} onChange={(e) => setEditing({ ...editing, title: e.target.value })} className={`w-full rounded-xl px-3 py-2 text-sm ${inputBgClass}`} placeholder="Headline" />
            <div className="grid gap-3 sm:grid-cols-2"><input value={editing.category} onChange={(e) => setEditing({ ...editing, category: e.target.value })} className={`rounded-xl px-3 py-2 text-sm ${inputBgClass}`} placeholder="Category" /><input value={editing.author} onChange={(e) => setEditing({ ...editing, author: e.target.value })} className={`rounded-xl px-3 py-2 text-sm ${inputBgClass}`} placeholder="Author" /></div>
            <textarea rows={2} value={editing.excerpt} onChange={(e) => setEditing({ ...editing, excerpt: e.target.value })} className={`w-full rounded-xl px-3 py-2 text-sm ${inputBgClass}`} placeholder="Excerpt" />
            <textarea rows={7} value={editing.content.join('\n\n')} onChange={(e) => setEditing({ ...editing, content: e.target.value.split('\n\n').filter(Boolean) })} className={`w-full rounded-xl px-3 py-2 text-sm ${inputBgClass}`} placeholder="Article body" />
            <div className="flex justify-end gap-2"><button type="button" onClick={() => setEditing(null)} className="px-4 py-2 text-sm">Cancel</button><button className="rounded-xl bg-lime px-4 py-2 text-sm font-semibold text-forest">Save changes</button></div>
          </form>
        </div>
      )}

      <PaginationBar
        currentPage={currentPage}
        totalItems={cms.newsArticles.length}
        pageSize={pageSize}
        onPageChange={setCurrentPage}
        isLight={isLight}
      />
    </div>
  );
}

/* =========================================================================
   17. WORKSPACE PHOTOS SECTION
   ========================================================================= */
function WorkspaceSection({
  cms,
  updateWorkspaceImages,
  handleFileUpload,
  uploadingField,
  showToast,
  isLight,
  cardBgClass,
  inputBgClass,
}: {
  cms: ReturnType<typeof useCMS>['cms'];
  updateWorkspaceImages: ReturnType<typeof useCMS>['updateWorkspaceImages'];
  handleFileUpload: (e: React.ChangeEvent<HTMLInputElement>, f: string, cb: (url: string) => void) => void;
  uploadingField: string | null;
  showToast: (m: string) => void;
  isLight: boolean;
  cardBgClass: string;
  inputBgClass: string;
}) {
  const [images, setImages] = useState(cms.workspaceImages);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    updateWorkspaceImages(images);
    showToast('Kagarama Hub workspace photos saved!');
  };

  return (
    <form onSubmit={handleSave} className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">
          {cms.sectionTitles?.workspacesTitle || 'Our Kagarama Hub & Workspaces'}
        </h1>
        <p className={`text-xs ${isLight ? 'text-gray-500' : 'text-cream/60'}`}>
          Upload the 3 studio and engineering frames displayed alongside the FAQ in Contact.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[
          { key: 'lab', label: 'Systems Lab', desc: 'Hardware & distributed infrastructure' },
          { key: 'studio', label: 'Design Studio', desc: 'Interface design and ergonomics suite' },
          { key: 'lounge', label: 'Collab Lounge', desc: 'Client sprint rooms and demo staging' },
        ].map((hub) => {
          const imgKey = hub.key as keyof typeof images;
          const currentUrl = images[imgKey];
          return (
            <div key={hub.key} className={`border rounded-2xl p-5 space-y-4 ${cardBgClass}`}>
              <div>
                <h3 className="text-sm font-bold">{hub.label}</h3>
                <p className="text-[11px] opacity-50">{hub.desc}</p>
              </div>
              <div className="h-44 rounded-xl overflow-hidden border">
                <img src={currentUrl} alt={hub.label} className="w-full h-full object-cover" />
              </div>
              <label className="block">
                <span className="text-xs opacity-70 block mb-1">Upload from Device:</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) =>
                    handleFileUpload(e, hub.key, (url) => setImages((prev) => ({ ...prev, [imgKey]: url })))
                  }
                  className="w-full text-xs file:mr-2 file:py-1.5 file:px-2.5 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-lime file:text-forest"
                />
              </label>
            </div>
          );
        })}
      </div>

      <button
        type="submit"
        className="px-6 py-3 rounded-xl bg-lime hover:bg-lime/90 text-forest font-semibold text-sm transition-all shadow-md cursor-pointer"
      >
        Save Workspace Photos
      </button>
    </form>
  );
}

/* =========================================================================
   18. COMPANY & FOOTER LINKS SECTION
   ========================================================================= */
function CompanySection({
  cms,
  updateCompany,
  updateSocialLinks,
  showToast,
  isLight,
  cardBgClass,
  inputBgClass,
}: {
  cms: ReturnType<typeof useCMS>['cms'];
  updateCompany: ReturnType<typeof useCMS>['updateCompany'];
  updateSocialLinks: ReturnType<typeof useCMS>['updateSocialLinks'];
  showToast: (m: string) => void;
  isLight: boolean;
  cardBgClass: string;
  inputBgClass: string;
}) {
  const [company, setCompany] = useState(cms.company);
  const [socialLinks, setSocialLinks] = useState(cms.socialLinks);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    updateCompany(company);
    updateSocialLinks(socialLinks);
    showToast('Company details & social links saved!');
  };

  return (
    <form onSubmit={handleSave} className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Company Coordinates & Social Links</h1>
        <p className={`text-xs ${isLight ? 'text-gray-500' : 'text-cream/60'}`}>
          Manage contact email, telephone, physical address, and all 4 footer social channels.
        </p>
      </div>

      <div className={`border rounded-2xl p-6 space-y-4 ${cardBgClass}`}>
        <h3 className="text-sm font-bold">4 Footer Social Media Channels</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {socialLinks.map((link, idx) => (
            <div key={link.label}>
              <label className="text-xs font-semibold text-forest block mb-1">{link.label} URL:</label>
              <input
                type="text"
                value={link.url}
                onChange={(e) => {
                  const copy = [...socialLinks];
                  copy[idx] = { ...copy[idx], url: e.target.value };
                  setSocialLinks(copy);
                }}
                className={`w-full px-3 py-2 rounded-xl text-xs focus:outline-none ${inputBgClass}`}
              />
            </div>
          ))}
        </div>
      </div>

      <div className={`border rounded-2xl p-6 space-y-4 ${cardBgClass}`}>
        <h3 className="text-sm font-bold">Contact Coordinates</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="text-xs opacity-70 block mb-1">Email:</label>
            <input
              type="email"
              value={company.email}
              onChange={(e) => setCompany({ ...company, email: e.target.value })}
              className={`w-full px-3 py-2 rounded-xl text-xs focus:outline-none ${inputBgClass}`}
            />
          </div>
          <div>
            <label className="text-xs opacity-70 block mb-1">Phone:</label>
            <input
              type="text"
              value={company.phone}
              onChange={(e) => setCompany({ ...company, phone: e.target.value })}
              className={`w-full px-3 py-2 rounded-xl text-xs focus:outline-none ${inputBgClass}`}
            />
          </div>
        </div>
        <div>
          <label className="text-xs opacity-70 block mb-1">Physical Address:</label>
          <input
            type="text"
            value={company.address}
            onChange={(e) => setCompany({ ...company, address: e.target.value })}
            className={`w-full px-3 py-2 rounded-xl text-xs focus:outline-none ${inputBgClass}`}
          />
        </div>
      </div>

      <button
        type="submit"
        className="px-6 py-3 rounded-xl bg-lime hover:bg-lime/90 text-forest font-semibold text-sm transition-all shadow-md cursor-pointer"
      >
        Save Contact Coordinates
      </button>
    </form>
  );
}
