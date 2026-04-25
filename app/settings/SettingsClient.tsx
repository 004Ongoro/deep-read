"use client";

import { useState, useEffect } from "react";
import { User, Mail, Save, Loader2, BookOpen, Type, Sun, CheckCircle2 } from "lucide-react";

interface SettingsClientProps {
  user: {
    name: string;
    email: string;
  };
}

export default function SettingsClient({ user }: SettingsClientProps) {
  const [name, setName] = useState(user.name);
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [profileMessage, setProfileMessage] = useState({ text: "", type: "" });

  // Reading Preferences
  const [fontSize, setFontSize] = useState(20);
  const [theme, setTheme] = useState<"light" | "sepia">("light");
  const [bionicReading, setBionicReading] = useState(false);
  const [isSavingPrefs, setIsSavingPrefs] = useState(false);
  const [prefsMessage, setPrefsMessage] = useState({ text: "", type: "" });

  useEffect(() => {
    const savedPrefs = localStorage.getItem("deep-read-settings");
    if (savedPrefs) {
      try {
        const parsed = JSON.parse(savedPrefs);
        if (parsed.fontSize) setFontSize(parsed.fontSize);
        if (parsed.theme) setTheme(parsed.theme);
        if (parsed.bionicReading !== undefined) setBionicReading(parsed.bionicReading);
      } catch (e) {
        console.error("Failed to parse settings");
      }
    }
  }, []);

  const handleSaveProfile = async () => {
    setIsSavingProfile(true);
    setProfileMessage({ text: "", type: "" });
    try {
      const res = await fetch("/api/user/update", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name }),
      });

      if (res.ok) {
        setProfileMessage({ text: "Profile updated successfully!", type: "success" });
      } else {
        const data = await res.json();
        setProfileMessage({ text: data.message || "Failed to update profile", type: "error" });
      }
    } catch (err) {
      setProfileMessage({ text: "Network error occurred", type: "error" });
    } finally {
      setIsSavingProfile(false);
      setTimeout(() => setProfileMessage({ text: "", type: "" }), 3000);
    }
  };

  const handleSavePreferences = () => {
    setIsSavingPrefs(true);
    setPrefsMessage({ text: "", type: "" });
    try {
      const prefs = { fontSize, theme, bionicReading };
      localStorage.setItem("deep-read-settings", JSON.stringify(prefs));
      setPrefsMessage({ text: "Reading preferences saved!", type: "success" });
    } catch (e) {
      setPrefsMessage({ text: "Failed to save preferences", type: "error" });
    } finally {
      setIsSavingPrefs(false);
      setTimeout(() => setPrefsMessage({ text: "", type: "" }), 3000);
    }
  };

  return (
    <div className="space-y-12">
      {/* Profile Settings */}
      <section className="rounded-3xl border border-border bg-card p-8 shadow-sm">
        <h2 className="mb-6 text-2xl font-bold text-foreground flex items-center gap-2">
          <User size={24} className="text-accent" /> Account Details
        </h2>
        
        <div className="space-y-6 max-w-xl">
          <div className="space-y-2">
            <label className="text-xs font-black uppercase tracking-[0.2em] text-muted-foreground/70 ml-1">Email Address</label>
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground/40" size={20} />
              <input 
                type="email" 
                value={user.email}
                disabled
                className="w-full rounded-2xl border border-border bg-muted/40 py-4 pl-12 pr-6 outline-none text-muted-foreground cursor-not-allowed"
              />
            </div>
            <p className="text-xs text-muted-foreground ml-1">Email cannot be changed.</p>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-black uppercase tracking-[0.2em] text-muted-foreground/70 ml-1">Full Name</label>
            <div className="relative">
              <User className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground/40" size={20} />
              <input 
                type="text" 
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Your Name"
                className="w-full rounded-2xl border border-border bg-muted/20 py-4 pl-12 pr-6 outline-none focus:border-accent focus:ring-4 focus:ring-accent/10 transition-all text-foreground"
              />
            </div>
          </div>

          <div className="flex items-center gap-4 pt-2">
            <button 
              onClick={handleSaveProfile}
              disabled={isSavingProfile || name === user.name}
              className="flex items-center gap-2 rounded-xl bg-accent px-8 py-3 font-bold text-accent-foreground hover:opacity-90 disabled:opacity-50 transition-all active:scale-95 shadow-lg shadow-accent/20"
            >
              {isSavingProfile ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
              Save Profile
            </button>
            {profileMessage.text && (
              <span className={`text-sm font-bold flex items-center gap-1 ${profileMessage.type === 'success' ? 'text-green-500' : 'text-red-500'}`}>
                {profileMessage.type === 'success' && <CheckCircle2 size={16} />}
                {profileMessage.text}
              </span>
            )}
          </div>
        </div>
      </section>

      {/* Default Reader Settings */}
      <section className="rounded-3xl border border-border bg-card p-8 shadow-sm">
        <h2 className="mb-6 text-2xl font-bold text-foreground flex items-center gap-2">
          <BookOpen size={24} className="text-accent" /> Default Reader Settings
        </h2>
        <p className="text-muted-foreground mb-8">These settings will be applied automatically when you open a new document.</p>

        <div className="space-y-8 max-w-xl">
          {/* Theme */}
          <div className="space-y-4">
            <label className="text-sm font-black uppercase tracking-[0.1em] text-foreground flex items-center gap-2">
              <Sun size={18} className="text-muted-foreground" /> Default Theme
            </label>
            <div className="flex gap-4">
              <button 
                onClick={() => setTheme("light")}
                className={`flex-1 py-4 rounded-2xl border-2 font-bold transition-all ${theme === 'light' ? 'border-accent bg-accent/5 text-accent' : 'border-border bg-card text-muted-foreground hover:border-accent/30'}`}
              >
                Light
              </button>
              <button 
                onClick={() => setTheme("sepia")}
                className={`flex-1 py-4 rounded-2xl border-2 font-bold transition-all ${theme === 'sepia' ? 'border-[#5b4636] bg-[#f4ecd8] text-[#5b4636]' : 'border-border bg-card text-muted-foreground hover:border-[#5b4636]/30'}`}
              >
                Sepia
              </button>
            </div>
          </div>

          {/* Font Size */}
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <label className="text-sm font-black uppercase tracking-[0.1em] text-foreground flex items-center gap-2">
                <Type size={18} className="text-muted-foreground" /> Base Font Size
              </label>
              <span className="font-bold text-accent">{fontSize}px</span>
            </div>
            <input 
              type="range" 
              min="14" max="32" step="2"
              value={fontSize}
              onChange={(e) => setFontSize(parseInt(e.target.value))}
              className="w-full accent-accent cursor-pointer"
            />
            <div className="flex justify-between text-xs text-muted-foreground font-medium">
              <span>Small (14px)</span>
              <span>Large (32px)</span>
            </div>
          </div>

          {/* Bionic Reading */}
          <div className="space-y-4 pt-4 border-t border-border">
            <div className="flex items-center justify-between">
              <div>
                <label className="text-sm font-black uppercase tracking-[0.1em] text-foreground flex items-center gap-2">
                  <BookOpen size={18} className="text-muted-foreground" /> Bionic Reading Default
                </label>
                <p className="text-xs text-muted-foreground mt-1">Automatically enable bionic reading highlights.</p>
              </div>
              
              <button 
                onClick={() => setBionicReading(!bionicReading)}
                className={`relative inline-flex h-7 w-14 items-center rounded-full transition-colors ${bionicReading ? 'bg-accent' : 'bg-muted-foreground/30'}`}
              >
                <span className={`inline-block h-5 w-5 transform rounded-full bg-white transition-transform ${bionicReading ? 'translate-x-8' : 'translate-x-1'}`} />
              </button>
            </div>
          </div>

          <div className="flex items-center gap-4 pt-6">
            <button 
              onClick={handleSavePreferences}
              disabled={isSavingPrefs}
              className="flex items-center gap-2 rounded-xl bg-foreground px-8 py-3 font-bold text-background hover:opacity-90 transition-all active:scale-95 shadow-lg"
            >
              {isSavingPrefs ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
              Save Preferences
            </button>
            {prefsMessage.text && (
              <span className={`text-sm font-bold flex items-center gap-1 ${prefsMessage.type === 'success' ? 'text-green-500' : 'text-red-500'}`}>
                {prefsMessage.type === 'success' && <CheckCircle2 size={16} />}
                {prefsMessage.text}
              </span>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}