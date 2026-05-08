/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Heart, 
  LayoutDashboard, 
  CheckSquare, 
  DollarSign, 
  Users, 
  Calendar,
  Plus,
  Trash2,
  ChevronRight,
  TrendingUp,
  Award,
  CircleCheck,
  Circle,
  Clock,
  ExternalLink,
  Settings,
  X,
  Edit,
  Filter,
  Star
} from 'lucide-react';
import { Button, Card, StatCard, Modal } from './components/UI';
import { 
  INITIAL_TASKS, 
  INITIAL_BUDGET, 
  INITIAL_VENDORS, 
  TaskItem, 
  BudgetItem, 
  Vendor, 
  Guest, 
  TimelineEvent, 
  TaskCategory, 
  INITIAL_CATEGORIES, 
  INITIAL_GUESTS, 
  INITIAL_TIMELINE 
} from './types';
import { aiService } from './services/aiService';
import { Sparkles, Loader2, MessageSquare, AlertCircle } from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'checklist' | 'budget' | 'vendors' | 'guests' | 'timeline' | 'comparison'>('dashboard');
  const [selectedVendorToContact, setSelectedVendorToContact] = useState<Vendor | null>(null);
  const [isSendingMessage, setIsSendingMessage] = useState(false);
  const [messageSent, setMessageSent] = useState(false);
  
  // State with LocalStorage Persistence
  const [tasks, setTasks] = useState<TaskItem[]>(() => {
    const saved = localStorage.getItem('wedding_tasks');
    return saved ? JSON.parse(saved) : INITIAL_TASKS;
  });

  const [budget, setBudget] = useState<BudgetItem[]>(() => {
    const saved = localStorage.getItem('wedding_budget');
    return saved ? JSON.parse(saved) : INITIAL_BUDGET;
  });

  const [guests, setGuests] = useState<Guest[]>(() => {
    const saved = localStorage.getItem('wedding_guests');
    return saved ? JSON.parse(saved) : INITIAL_GUESTS;
  });

  const [timeline, setTimeline] = useState<TimelineEvent[]>(() => {
    const saved = localStorage.getItem('wedding_timeline');
    return saved ? JSON.parse(saved) : INITIAL_TIMELINE;
  });

  const [compareVendors, setCompareVendors] = useState<string[]>([]);

  const [categories, setCategories] = useState<TaskCategory[]>(() => {
    const saved = localStorage.getItem('wedding_categories');
    return saved ? JSON.parse(saved) : INITIAL_CATEGORIES;
  });

  const [activeCategoryFilter, setActiveCategoryFilter] = useState<string>('all');
  const [quickTaskTitle, setQuickTaskTitle] = useState('');
  const [isManagingCategories, setIsManagingCategories] = useState(false);
  const [newTaskCategory, setNewTaskCategory] = useState(categories[0]?.name || 'Planning');
  const [guestToConfirm, setGuestToConfirm] = useState<Guest | null>(null);
  const [isSetDateModalOpen, setIsSetDateModalOpen] = useState(false);
  const [isQuickActionModalOpen, setIsQuickActionModalOpen] = useState(false);
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [aiDraftMessage, setAiDraftMessage] = useState('');
  const [isAiConciergeOpen, setIsAiConciergeOpen] = useState(false);
  const [targetBudget, setTargetBudget] = useState<number>(() => {
    const saved = localStorage.getItem('wedding_target_budget');
    return saved ? parseInt(saved) : 25000;
  });
  const [isTargetBudgetModalOpen, setIsTargetBudgetModalOpen] = useState(false);
  const [editingBudgetItem, setEditingBudgetItem] = useState<BudgetItem | null>(null);
  const [isBudgetItemModalOpen, setIsBudgetItemModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<TaskItem | null>(null);
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [editingGuest, setEditingGuest] = useState<Guest | null>(null);
  const [isGuestModalOpen, setIsGuestModalOpen] = useState(false);
  const [vendors, setVendors] = useState<Vendor[]>(() => {
    const saved = localStorage.getItem('wedding_vendors');
    return saved ? JSON.parse(saved) : INITIAL_VENDORS;
  });
  const [editingVendor, setEditingVendor] = useState<Vendor | null>(null);
  const [isVendorModalOpen, setIsVendorModalOpen] = useState(false);

  const [weddingDate, setWeddingDate] = useState<string>(() => {
    const saved = localStorage.getItem('wedding_date');
    const defaultDate = new Date();
    defaultDate.setMonth(defaultDate.getMonth() + 6);
    return saved || defaultDate.toISOString().split('T')[0];
  });

  useEffect(() => {
    localStorage.setItem('wedding_date', weddingDate);
  }, [weddingDate]);

  useEffect(() => {
    if (activeCategoryFilter !== 'all') {
      setNewTaskCategory(activeCategoryFilter);
    }
  }, [activeCategoryFilter]);

  const daysRemaining = Math.max(0, Math.ceil((new Date(weddingDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)));

  useEffect(() => {
    localStorage.setItem('wedding_tasks', JSON.stringify(tasks));
  }, [tasks]);

  useEffect(() => {
    localStorage.setItem('wedding_budget', JSON.stringify(budget));
  }, [budget]);

  useEffect(() => {
    localStorage.setItem('wedding_guests', JSON.stringify(guests));
  }, [guests]);

  useEffect(() => {
    localStorage.setItem('wedding_timeline', JSON.stringify(timeline));
  }, [timeline]);

  useEffect(() => {
    localStorage.setItem('wedding_categories', JSON.stringify(categories));
  }, [categories]);

  useEffect(() => {
    localStorage.setItem('wedding_vendors', JSON.stringify(vendors));
  }, [vendors]);

  useEffect(() => {
    localStorage.setItem('wedding_target_budget', targetBudget.toString());
  }, [targetBudget]);

  // Derived Stats
  const totalBudget = budget.reduce((acc, curr) => acc + curr.estimated, 0);
  const spentBudget = budget.reduce((acc, curr) => acc + curr.actual, 0);
  const completedTasks = tasks.filter(t => t.completed).length;
  const progressPercent = Math.round((completedTasks / tasks.length) * 100);

  // Actions
  const toggleTask = (id: string) => {
    setTasks(prev => prev.map(t => t.id === id ? { ...t, completed: !t.completed } : t));
  };

  const addTask = (data: Omit<TaskItem, 'id'>) => {
    const newTask: TaskItem = {
      ...data,
      id: Math.random().toString(36).substr(2, 9),
    };
    setTasks(prev => [...prev, newTask]);
  };

  const updateTask = (id: string, updates: Partial<TaskItem>) => {
    setTasks(prev => prev.map(t => t.id === id ? { ...t, ...updates } : t));
  };

  const addCategory = (name: string) => {
    if (!name || categories.some(c => c.name === name)) return;
    const newCat = { id: Math.random().toString(36).substr(2, 9), name };
    setCategories(prev => [...prev, newCat]);
  };

  const deleteCategory = (id: string) => {
    setCategories(prev => prev.filter(c => c.id !== id));
  };

  const updateCategory = (id: string, name: string) => {
    setCategories(prev => prev.map(c => c.id === id ? { ...c, name } : c));
  };

  const filteredTasks = activeCategoryFilter === 'all' 
    ? tasks 
    : tasks.filter(t => t.category === activeCategoryFilter);

  const deleteTask = (id: string) => {
    if (window.confirm('Are you sure you want to delete this task?')) {
      setTasks(prev => prev.filter(t => t.id !== id));
    }
  };

  const updateBudgetActual = (id: string, amount: number) => {
    setBudget(prev => prev.map(item => item.id === id ? { ...item, actual: amount } : item));
  };

  const addGuest = (data: Omit<Guest, 'id'>) => {
    const newGuest: Guest = {
      ...data,
      id: Math.random().toString(36).substr(2, 9),
    };
    setGuests(prev => [...prev, newGuest]);
  };

  const updateGuest = (id: string, updates: Partial<Guest>) => {
    setGuests(prev => prev.map(g => g.id === id ? { ...g, ...updates } : g));
  };

  const deleteGuest = (id: string) => {
    if (window.confirm('Are you sure you want to remove this guest?')) {
      setGuests(prev => prev.filter(g => g.id !== id));
    }
  };

  const addTimelineEvent = (title: string, time: string) => {
    const newEvent: TimelineEvent = {
      id: Math.random().toString(36).substr(2, 9),
      title,
      time,
      description: '',
      category: 'Transitions'
    };
    setTimeline(prev => [...prev, newEvent].sort((a,b) => a.time.localeCompare(b.time)));
  };

  const deleteTimelineEvent = (id: string) => {
    setTimeline(prev => prev.filter(e => e.id !== id));
  };

  const addVendor = (newVendor: Omit<Vendor, 'id'>) => {
    const vendor: Vendor = {
      ...newVendor,
      id: Math.random().toString(36).substr(2, 9),
    };
    setVendors(prev => [...prev, vendor]);
  };

  const updateVendor = (id: string, updates: Partial<Vendor>) => {
    setVendors(prev => prev.map(v => v.id === id ? { ...v, ...updates } : v));
  };

  const deleteVendor = (id: string) => {
    if (window.confirm('Are you sure you want to remove this vendor?')) {
      setVendors(prev => prev.filter(v => v.id !== id));
    }
  };

  const toggleFavoriteVendor = (id: string) => {
    setVendors(prev => prev.map(v => v.id === id ? { ...v, isFavorite: !v.isFavorite } : v));
  };
  
  const handleAiChecklist = async () => {
    setIsAiLoading(true);
    const suggestions = await aiService.generateChecklist(weddingDate);
    if (suggestions && suggestions.length > 0) {
      const newTasks = suggestions.map((s: any) => ({
        id: Math.random().toString(36).substr(2, 9),
        title: s.title,
        category: s.category,
        completed: false
      }));
      setTasks(prev => [...prev, ...newTasks]);
    }
    setIsAiLoading(false);
  };

  const handleAiBudget = async () => {
    setIsAiLoading(true);
    const suggestions = await aiService.suggestBudgetAllocation(targetBudget);
    if (suggestions && suggestions.length > 0) {
      const updatedBudget = suggestions.map((s: any) => ({
        id: Math.random().toString(36).substr(2, 9),
        category: s.category,
        name: `Estimated ${s.category}`,
        estimated: s.amount,
        actual: 0
      }));
      setBudget(updatedBudget);
    }
    setIsAiLoading(false);
  };

  const addBudgetItem = (item: Omit<BudgetItem, 'id'>) => {
    setBudget(prev => [...prev, { ...item, id: Math.random().toString(36).substr(2, 9) }]);
  };

  const updateBudgetItem = (id: string, updates: Partial<BudgetItem>) => {
    setBudget(prev => prev.map(item => item.id === id ? { ...item, ...updates } : item));
  };

  const deleteBudgetItem = (id: string) => {
    setBudget(prev => prev.filter(item => item.id !== id));
  };

  const handleAiDraft = async (vendor: Vendor) => {
    setIsAiLoading(true);
    const draft = await aiService.draftInquiry(vendor.name, vendor.type, `Wedding on ${weddingDate}`);
    setAiDraftMessage(draft);
    setIsAiLoading(false);
  };

  const vendorCards = vendors.map(vendor => (
    <VendorCard 
      key={vendor.id} 
      vendor={vendor} 
      onContact={() => setSelectedVendorToContact(vendor)}
      onEdit={() => { setEditingVendor(vendor); setIsVendorModalOpen(true); }}
      onDelete={() => deleteVendor(vendor.id)}
      onToggleFavorite={() => toggleFavoriteVendor(vendor.id)}
      onCompare={() => {
        setCompareVendors(prev => 
          prev.includes(vendor.id) 
          ? prev.filter(id => id !== vendor.id) 
          : [...prev, vendor.id]
        );
      }}
      isComparing={compareVendors.includes(vendor.id)}
    />
  ));

  return (
    <div className="min-h-screen pb-20 md:pb-0 md:pl-64 flex flex-col">
      {/* Sidebar - Desktop */}
      <aside className="fixed left-0 top-0 hidden md:flex h-full w-64 flex-col bg-paper border-r border-brand/10 p-6 z-50">
        <div className="flex items-center gap-3 mb-12">
          <div className="w-10 h-10 bg-brand rounded-full flex items-center justify-center text-white">
            <Heart size={20} fill="currentColor" />
          </div>
          <h1 className="text-2xl font-serif text-brand font-bold">Vow & View</h1>
        </div>

        <nav className="flex flex-col gap-2">
          <NavButton 
            active={activeTab === 'dashboard'} 
            onClick={() => setActiveTab('dashboard')} 
            icon={LayoutDashboard} 
            label="Dashboard" 
          />
          <NavButton 
            active={activeTab === 'guests'} 
            onClick={() => setActiveTab('guests')} 
            icon={Users} 
            label="Guest List" 
          />
          <NavButton 
            active={activeTab === 'checklist'} 
            onClick={() => setActiveTab('checklist')} 
            icon={CheckSquare} 
            label="Checklist" 
          />
          <NavButton 
            active={activeTab === 'timeline'} 
            onClick={() => setActiveTab('timeline')} 
            icon={Clock} 
            label="Timeline" 
          />
          <NavButton 
            active={activeTab === 'budget'} 
            onClick={() => setActiveTab('budget')} 
            icon={DollarSign} 
            label="Budget" 
          />
          <NavButton 
            active={activeTab === 'vendors'} 
            onClick={() => setActiveTab('vendors')} 
            icon={Award} 
            label="Vendors" 
          />
          <NavButton 
            active={activeTab === 'comparison'} 
            onClick={() => setActiveTab('comparison')} 
            icon={TrendingUp} 
            label="Comparison" 
          />
        </nav>

        <div className="mt-auto">
          <Card className="p-4 bg-brand/5 border-none">
            <p className="text-xs font-semibold text-brand/60 uppercase tracking-widest mb-2">Featured Partner</p>
            <div className="space-y-3">
              <img 
                src="https://picsum.photos/seed/wedding_ad/300/200" 
                className="rounded-xl w-full h-24 object-cover" 
                alt="Ad"
                referrerPolicy="no-referrer"
              />
              <p className="text-sm font-medium leading-tight text-stone-800">Plan your dream honeymoon with luxury escapes.</p>
              <Button size="sm" variant="outline" className="w-full text-[10px] py-1">View Offers</Button>
            </div>
          </Card>
        </div>
      </aside>

      {/* Mobile Nav */}
      <nav className="fixed bottom-0 left-0 w-full md:hidden bg-paper border-t border-brand/10 flex justify-around p-4 z-50">
        <MobileNavButton active={activeTab === 'dashboard'} onClick={() => setActiveTab('dashboard')} icon={LayoutDashboard} />
        <MobileNavButton active={activeTab === 'guests'} onClick={() => setActiveTab('guests')} icon={Users} />
        <MobileNavButton active={activeTab === 'checklist'} onClick={() => setActiveTab('checklist')} icon={CheckSquare} />
        <MobileNavButton active={activeTab === 'timeline'} onClick={() => setActiveTab('timeline')} icon={Clock} />
        <MobileNavButton active={activeTab === 'budget'} onClick={() => setActiveTab('budget')} icon={DollarSign} />
      </nav>

      <main className="flex-1 p-6 md:p-12 overflow-x-hidden">
        <AnimatePresence mode="wait">
          {activeTab === 'dashboard' && (
            <motion.div
              key="dashboard"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="max-w-5xl mx-auto space-y-8"
            >
              <header className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div>
                  <h2 className="text-4xl md:text-5xl font-serif text-brand mb-2">Welcome, Beloved</h2>
                  <p className={`
                    text-stone-500 font-light italic transition-all duration-700 px-4 py-2 rounded-2xl inline-block
                    ${daysRemaining === 0 ? 'bg-brand/10 border-2 border-brand scale-105 shadow-lg shadow-brand/20 text-brand font-bold not-italic' : 
                      daysRemaining === 1 ? 'bg-brand/5 border border-brand/40 text-stone-800 font-medium' :
                      daysRemaining <= 7 ? 'bg-brand/5 border border-brand/20 text-stone-700' : 
                      daysRemaining <= 30 ? 'bg-stone-50 border border-stone-100 text-stone-600' : 
                      ''
                    }
                  `}>
                    {daysRemaining === 0 ? (
                      <span>Today is your beautiful day! ❤️</span>
                    ) : daysRemaining === 1 ? (
                      <span>Only 24 hours until your "I Do"! The excitement is real.</span>
                    ) : (
                      <>
                        Your wedding is on{' '}
                        <span className="font-medium text-stone-700 not-italic">
                          {new Date(weddingDate).toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
                        </span>
                        . That's {daysRemaining} days to go!
                      </>
                    )}
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" onClick={() => setIsAiConciergeOpen(true)} className="border-brand/20 text-brand">
                    <Sparkles size={16} className="mr-2" /> AI Concierge
                  </Button>
                  <Button variant="outline" onClick={() => setIsSetDateModalOpen(true)}><Calendar size={16} className="mr-2" /> Set Date</Button>
                  <Button onClick={() => setIsQuickActionModalOpen(true)}><Plus size={16} className="mr-2" /> Quick Action</Button>
                </div>
              </header>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <StatCard label="Total Budget" value={`$${totalBudget.toLocaleString()}`} icon={DollarSign} />
                <StatCard label="Tasks Completed" value={`${progressPercent}%`} icon={TrendingUp} />
                <StatCard label="Guest Count" value="120" icon={Users} />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <Card id="sponsored-highlight" className="bg-brand text-white border-none overflow-hidden relative group cursor-pointer">
                  <div className="relative z-10 flex flex-col h-full justify-between">
                    <div>
                      <span className="text-[10px] uppercase font-bold tracking-[0.2em] opacity-60">Sponsored Highlight</span>
                      <h3 className="text-3xl font-serif mt-2 leading-tight">The Amalfi Dream:<br/>Honeymoon Packages</h3>
                      <p className="mt-4 text-sm font-light opacity-80 max-w-[200px]">Escape to Italy with our exclusive curated honeymoon retreats.</p>
                    </div>
                    <div className="mt-8">
                      <Button variant="secondary" size="sm" className="text-brand">Explore Collection</Button>
                    </div>
                  </div>
                  <img 
                    src="https://picsum.photos/seed/italy/600/600" 
                    className="absolute right-[-10%] bottom-[-10%] w-64 h-64 object-cover rounded-full opacity-40 group-hover:scale-110 transition-transform duration-700" 
                    alt="Honeymoon"
                    referrerPolicy="no-referrer"
                  />
                </Card>

                <Card id="recent-tasks">
                  <div className="flex justify-between items-center mb-6">
                    <h3 className="text-xl font-serif">Recent Tasks</h3>
                    <Button variant="ghost" size="sm" onClick={() => setActiveTab('checklist')}>View All <ChevronRight size={14} className="ml-1" /></Button>
                  </div>
                  <div className="space-y-4">
                    {tasks.slice(0, 4).map(task => (
                      <div key={task.id} className="flex items-center justify-between p-3 hover:bg-warm-bg rounded-2xl transition-colors cursor-pointer group" onClick={() => toggleTask(task.id)}>
                        <div className="flex items-center gap-3">
                          {task.completed ? <CircleCheck size={20} className="text-brand" /> : <Circle size={20} className="text-stone-300" />}
                          <span className={`${task.completed ? 'line-through text-stone-400' : 'text-stone-700'}`}>{task.title}</span>
                        </div>
                        <span className="text-[10px] uppercase tracking-widest text-stone-400 opacity-0 group-hover:opacity-100 transition-opacity">{task.category}</span>
                      </div>
                    ))}
                  </div>
                </Card>

                <Card id="budget-summary">
                  <div className="flex justify-between items-center mb-6">
                    <h3 className="text-xl font-serif">Budget Pulse</h3>
                    <Button variant="ghost" size="sm" onClick={() => setActiveTab('budget')}>Details <ChevronRight size={14} className="ml-1" /></Button>
                  </div>
                  <div className="space-y-6">
                    <div>
                      <div className="flex justify-between text-sm mb-2">
                        <span className="text-stone-500">Total Spent</span>
                        <span className="font-medium">${spentBudget.toLocaleString()} / ${totalBudget.toLocaleString()}</span>
                      </div>
                      <div className="h-2 bg-stone-100 rounded-full overflow-hidden">
                        <motion.div 
                          className="h-full bg-brand"
                          initial={{ width: 0 }}
                          animate={{ width: `${(spentBudget / totalBudget) * 100}%` }}
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="p-4 bg-stone-50 rounded-2xl">
                        <p className="text-[10px] text-stone-400 uppercase tracking-widest mb-1">Savings</p>
                        <p className="text-lg font-serif text-green-600">${(totalBudget - spentBudget).toLocaleString()}</p>
                      </div>
                      <div className="p-4 bg-stone-50 rounded-2xl">
                        <p className="text-[10px] text-stone-400 uppercase tracking-widest mb-1">Vendors Paid</p>
                        <p className="text-lg font-serif">2 / 12</p>
                      </div>
                    </div>
                  </div>
                </Card>
              </div>

              <section>
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-2xl font-serif">Premium Partners</h3>
                  <span className="text-xs text-stone-400 italic">Curated services for your day</span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {vendors.filter(v => v.featured || v.isFavorite).sort((a,b) => (a.isFavorite === b.isFavorite) ? 0 : a.isFavorite ? -1 : 1).slice(0, 3).map(vendor => (
                    <VendorCard 
                      key={vendor.id} 
                      vendor={vendor} 
                      onContact={() => setSelectedVendorToContact(vendor)}
                      onEdit={() => { setEditingVendor(vendor); setIsVendorModalOpen(true); }}
                      onDelete={() => deleteVendor(vendor.id)}
                      onToggleFavorite={() => toggleFavoriteVendor(vendor.id)}
                    />
                  ))}
                </div>
              </section>
            </motion.div>
          )}

          {activeTab === 'checklist' && (
            <motion.div
              key="checklist"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="max-w-4xl mx-auto space-y-8"
            >
              <header className="flex justify-between items-end">
                <div>
                  <h2 className="text-4xl font-serif text-brand mb-2">The Checklist</h2>
                  <p className="text-stone-500 italic font-light">Small steps lead to your big day.</p>
                </div>
                <div className="flex gap-2">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={handleAiChecklist} 
                    disabled={isAiLoading}
                    className="border-brand/20 text-brand"
                  >
                    {isAiLoading ? <Loader2 size={14} className="mr-2 animate-spin" /> : <Sparkles size={14} className="mr-2" />}
                    AI Suggestions
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => setIsManagingCategories(!isManagingCategories)}>
                    <Settings size={14} className="mr-2" /> 
                    {isManagingCategories ? 'Back to List' : 'Manage Categories'}
                  </Button>
                </div>
              </header>

              {isManagingCategories ? (
                <Card className="p-8 space-y-6">
                  <h3 className="text-xl font-serif">Manage Categories</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {categories.map(cat => (
                      <div key={cat.id} className="flex items-center justify-between p-4 bg-stone-50 rounded-2xl group transition-all hover:bg-stone-100">
                        <input 
                          type="text" 
                          value={cat.name} 
                          onChange={(e) => updateCategory(cat.id, e.target.value)}
                          className="bg-transparent border-none focus:ring-0 font-medium text-stone-700 w-full"
                        />
                        <button 
                          onClick={() => deleteCategory(cat.id)}
                          className="text-stone-300 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-all"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    ))}
                    <div className="flex items-center gap-2 p-4 border-2 border-dashed border-stone-200 rounded-2xl">
                      <input 
                        type="text" 
                        placeholder="Add category..." 
                        className="flex-1 bg-transparent border-none focus:ring-0 text-stone-500"
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' && e.currentTarget.value) {
                            addCategory(e.currentTarget.value);
                            e.currentTarget.value = '';
                          }
                        }}
                      />
                      <Plus size={16} className="text-stone-300" />
                    </div>
                  </div>
                </Card>
              ) : (
                <>
                  <div className="flex flex-wrap gap-2 py-2">
                    <button 
                      onClick={() => setActiveCategoryFilter('all')}
                      className={`px-4 py-1.5 rounded-full text-xs font-medium transition-all ${
                        activeCategoryFilter === 'all' 
                        ? 'bg-brand text-white shadow-md' 
                        : 'bg-white text-stone-500 hover:bg-stone-100'
                      }`}
                    >
                      All Tasks
                    </button>
                    {categories.map(cat => (
                      <button 
                        key={cat.id}
                        onClick={() => setActiveCategoryFilter(cat.name)}
                        className={`px-4 py-1.5 rounded-full text-xs font-medium transition-all ${
                          activeCategoryFilter === cat.name 
                          ? 'bg-brand text-white shadow-md' 
                          : 'bg-white text-stone-500 hover:bg-stone-100'
                        }`}
                      >
                        {cat.name}
                      </button>
                    ))}
                  </div>

                  <Card className="p-2 overflow-hidden flex flex-col">
                    <div className="p-6 border-b border-brand/5 flex flex-col md:flex-row md:items-center justify-between gap-4">
                      <div className="flex-1 flex items-center gap-4">
                        <div className="relative flex-1">
                          <input 
                            type="text" 
                            placeholder="Add a new task..." 
                            className="w-full bg-transparent border-none focus:ring-0 text-lg placeholder:text-stone-300 pr-10"
                            value={quickTaskTitle}
                            onChange={(e) => setQuickTaskTitle(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter' && quickTaskTitle.trim()) {
                                addTask({ title: quickTaskTitle.trim(), category: newTaskCategory, completed: false });
                                setQuickTaskTitle('');
                              }
                            }}
                          />
                        </div>
                        <select 
                          value={newTaskCategory}
                          onChange={(e) => setNewTaskCategory(e.target.value)}
                          className="bg-stone-50 border-none rounded-xl text-sm text-stone-500 focus:ring-0 px-4 py-2 cursor-pointer"
                        >
                          {categories.map(cat => (
                            <option key={cat.id} value={cat.name}>{cat.name}</option>
                          ))}
                        </select>
                      </div>
                      <div className="flex gap-2">
                          <Button size="sm" onClick={() => {
                            if (quickTaskTitle.trim()) {
                              addTask({ title: quickTaskTitle.trim(), category: newTaskCategory, completed: false });
                              setQuickTaskTitle('');
                            }
                          }}>Add Task</Button>
                          <Button 
                            variant="ghost" 
                            size="icon"
                            onClick={() => {
                              setEditingTask(null);
                              setIsTaskModalOpen(true);
                            }}
                          >
                            <Settings size={18} className="text-stone-400" />
                          </Button>
                      </div>
                    </div>

                    <div className="divide-y divide-brand/5 max-h-[600px] overflow-y-auto custom-scrollbar">
                      {filteredTasks.map(task => (
                        <motion.div 
                          layout
                          key={task.id} 
                          className="flex items-center justify-between p-6 hover:bg-stone-50/50 group transition-colors"
                        >
                          <div className="flex items-center gap-4 flex-1">
                            <div 
                              className="transition-transform group-active:scale-90 cursor-pointer"
                              onClick={() => toggleTask(task.id)}
                            >
                              {task.completed ? <CircleCheck size={24} className="text-brand" /> : <Circle size={24} className="text-stone-200" />}
                            </div>
                            <div className="flex-1">
                              <div className="flex items-center gap-3">
                                <p className={`text-lg transition-all ${task.completed ? 'line-through text-stone-300' : 'text-stone-800'}`}>{task.title}</p>
                                <button 
                                  onClick={() => { setEditingTask(task); setIsTaskModalOpen(true); }}
                                  className="text-stone-300 hover:text-brand opacity-0 group-hover:opacity-100 transition-all p-1"
                                >
                                  <Edit size={14} />
                                </button>
                              </div>
                              <div className="flex items-center gap-2 mt-1">
                                <span className="text-[10px] font-semibold bg-brand/10 text-brand px-2 py-0.5 rounded-full uppercase tracking-tighter">{task.category}</span>
                                {task.dueDate && (
                                  <span className="text-[10px] text-stone-400 flex items-center gap-1">
                                    <Clock size={10} /> {task.dueDate}
                                  </span>
                                )}
                              </div>
                              {task.image && (
                                <div className="mt-3 relative w-full h-40 md:w-64 md:h-40 rounded-xl overflow-hidden shadow-sm border border-brand/5">
                                  <img src={task.image} className="w-full h-full object-cover" alt={task.title} referrerPolicy="no-referrer" />
                                </div>
                              )}
                            </div>
                          </div>
                          <button 
                            onClick={() => deleteTask(task.id)}
                            className="p-2 text-stone-300 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-all hover:bg-red-50 rounded-full"
                          >
                            <Trash2 size={18} />
                          </button>
                        </motion.div>
                      ))}
                      {filteredTasks.length === 0 && (
                        <div className="p-20 text-center text-stone-300 italic">
                          No tasks in this category.
                        </div>
                      )}
                    </div>
                  </Card>
                </>
              )}
            </motion.div>
          )}

          {activeTab === 'budget' && (
            <motion.div
              key="budget"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="max-w-4xl mx-auto space-y-8"
            >
              <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
                <div className="flex-1">
                  <h2 className="text-4xl font-serif text-brand mb-2">Budget Master</h2>
                  <p className="text-stone-500 italic font-light">Manage your investment for the future.</p>
                  <div className="flex flex-wrap gap-2 mt-4">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => setIsTargetBudgetModalOpen(true)}
                      className="border-brand/20 text-brand"
                    >
                      <Edit size={14} className="mr-2" /> Set Target Budget
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={handleAiBudget} 
                      disabled={isAiLoading}
                      className="text-brand hover:bg-brand/5"
                    >
                      {isAiLoading ? <Loader2 size={14} className="mr-2 animate-spin" /> : <Sparkles size={14} className="mr-2" />}
                      Redistribute with AI
                    </Button>
                  </div>
                </div>
                <div className="text-left md:text-right space-y-2">
                   <div>
                    <p className="text-[10px] text-stone-400 uppercase tracking-widest">Target Budget</p>
                    <p className="text-3xl font-serif text-brand">${targetBudget.toLocaleString()}</p>
                   </div>
                   <div>
                    <p className="text-[10px] text-stone-400 uppercase tracking-widest">Total Estimated</p>
                    <p className={`text-xl font-serif ${totalBudget > targetBudget ? 'text-red-500' : 'text-stone-400'}`}>
                      ${totalBudget.toLocaleString()}
                    </p>
                   </div>
                </div>
              </header>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                <StatCard 
                  label="Used Budget" 
                  value={`$${spentBudget.toLocaleString()}`} 
                  icon={DollarSign} 
                  color="bg-stone-500"
                />
                <StatCard 
                  label="Remaining (Target)" 
                  value={`$${(targetBudget - spentBudget).toLocaleString()}`} 
                  icon={TrendingUp} 
                  color={targetBudget - spentBudget < 0 ? 'bg-red-500' : 'bg-green-500'}
                />
                <StatCard 
                  label="Budget Balance" 
                  value={`$${Math.abs(targetBudget - totalBudget).toLocaleString()}`} 
                  icon={AlertCircle} 
                  color={totalBudget > targetBudget ? 'bg-red-500' : 'bg-brand'}
                />
              </div>

              <div className="flex justify-between items-center bg-stone-50 p-4 rounded-2xl">
                 <p className="text-sm text-stone-500 italic">Plan your individual expenses below</p>
                 <Button size="sm" onClick={() => { setEditingBudgetItem(null); setIsBudgetItemModalOpen(true); }}>
                    <Plus size={14} className="mr-2" /> Add Item
                 </Button>
              </div>

              <div className="grid grid-cols-1 gap-6">
                {budget.map(item => (
                  <Card key={item.id} className="p-6 group">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-1">
                          <h4 className="text-xl font-medium text-stone-800">{item.name}</h4>
                          <span className="text-[10px] font-semibold text-stone-400 bg-stone-100 px-2 py-0.5 rounded-full uppercase tracking-tighter">{item.category}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <p className="text-sm text-stone-400 font-light">Estimated: ${item.estimated.toLocaleString()}</p>
                          <button 
                            onClick={() => { setEditingBudgetItem(item); setIsBudgetItemModalOpen(true); }}
                            className="p-1 text-stone-300 hover:text-brand opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <Edit size={12} />
                          </button>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-4 bg-warm-bg rounded-2xl p-2 px-6">
                        <div className="text-xs text-stone-500 mr-2">Actual:</div>
                        <span className="text-stone-400 pr-1">$</span>
                        <input 
                          type="number" 
                          value={item.actual || ''} 
                          onChange={(e) => updateBudgetItem(item.id, { actual: Number(e.target.value) || 0 })}
                          placeholder="0"
                          className="w-32 bg-transparent border-none focus:ring-0 text-xl font-serif text-brand font-bold p-0"
                        />
                      </div>

                      <div className="flex items-center gap-2">
                        <div className="w-full md:w-32">
                          <div className="flex justify-between text-[10px] text-stone-400 uppercase tracking-widest mb-2">
                            <span>Usage</span>
                            <span>{Math.round((item.actual / item.estimated) * 100 || 0)}%</span>
                          </div>
                          <div className="h-1 bg-stone-100 rounded-full overflow-hidden">
                            <motion.div 
                                initial={{ width: 0 }}
                                animate={{ width: `${Math.min(100, (item.actual / item.estimated) * 100 || 0)}%` }}
                                className={`h-full ${item.actual > item.estimated ? 'bg-red-500' : 'bg-brand'}`}
                            />
                          </div>
                        </div>
                        <button 
                          onClick={() => deleteBudgetItem(item.id)}
                          className="p-2 text-stone-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </motion.div>
          )}

          {activeTab === 'vendors' && (
            <motion.div
              key="vendors"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              className="max-w-6xl mx-auto space-y-12"
            >
              <header className="text-center relative">
                <h2 className="text-5xl font-serif text-brand mb-4">The Directory</h2>
                <p className="text-stone-500 max-w-lg mx-auto italic font-light">A curated list of professionals dedicated to making your dream wedding a reality.</p>
                <div className="mt-8 flex justify-center gap-4">
                  <Button onClick={() => { setEditingVendor(null); setIsVendorModalOpen(true); }}>
                    <Plus size={16} className="mr-2" /> Add New Vendor
                  </Button>
                </div>
              </header>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {vendorCards}
                
                {/* Simulated "Ad" slot */}
                <Card className="flex flex-col items-center justify-center p-12 text-center border-dashed border-stone-200 bg-stone-50/30">
                  <div className="w-16 h-16 rounded-full bg-stone-100 flex items-center justify-center text-stone-300 mb-4">
                    <Plus size={32} />
                  </div>
                  <h4 className="text-xl font-serif text-stone-400 mb-2">Are you a vendor?</h4>
                  <p className="text-sm text-stone-400 mb-6">List your services and reach thousands of matching couples.</p>
                  <Button variant="outline" size="sm">Get Listed</Button>
                </Card>
              </div>

              {compareVendors.length > 0 && (
                <motion.div 
                  initial={{ y: 100 }}
                  animate={{ y: 0 }}
                  className="fixed bottom-24 left-1/2 -translate-x-1/2 bg-brand text-white p-4 px-8 rounded-full shadow-2xl flex items-center gap-6 z-[60]"
                >
                  <span className="text-sm font-medium">{compareVendors.length} vendors selected</span>
                  <div className="h-6 w-px bg-white/20" />
                  <Button 
                    variant="secondary" 
                    size="sm" 
                    onClick={() => setActiveTab('comparison')}
                  >
                    Compare Now
                  </Button>
                  <button onClick={() => setCompareVendors([])} className="p-1 hover:bg-white/10 rounded-full transition-colors">
                    <Trash2 size={16} />
                  </button>
                </motion.div>
              )}
            </motion.div>
          )}

          {activeTab === 'guests' && (
            <motion.div
              key="guests"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="max-w-5xl mx-auto space-y-8"
            >
              <header className="flex justify-between items-end">
                <div>
                  <h2 className="text-4xl font-serif text-brand mb-2">Guest Management</h2>
                  <p className="text-stone-500 italic font-light">Keep track of your loved ones.</p>
                </div>
                <div className="flex gap-4">
                  <StatCard label="Confirmed" value={guests.filter(g => g.status === 'confirmed').length.toString()} icon={CircleCheck} />
                </div>
              </header>

              <Card className="p-0 overflow-hidden">
                <div className="p-6 bg-brand/5 border-b border-brand/10">
                  <div className="flex gap-4">
                    <input 
                      type="text" 
                      placeholder="Enter guest name..." 
                      className="flex-1 bg-white border border-brand/10 rounded-xl px-4 py-2 focus:ring-2 focus:ring-brand/20 outline-none"
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && e.currentTarget.value) {
                          addGuest({ name: e.currentTarget.value, status: 'invited', mealPreference: 'Standard' });
                          e.currentTarget.value = '';
                        }
                      }}
                    />
                    <Button onClick={() => {
                      const input = document.querySelector('input[placeholder="Enter guest name..."]') as HTMLInputElement;
                      if(input.value) {
                        addGuest({ name: input.value, status: 'invited', mealPreference: 'Standard' });
                        input.value = '';
                      }
                    }}>Add Guest</Button>
                    <Button variant="outline" onClick={() => { setEditingGuest(null); setIsGuestModalOpen(true); }}>
                      <Plus size={16} className="mr-2" /> Detailed Add
                    </Button>
                  </div>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead className="bg-stone-50 text-[10px] uppercase tracking-widest text-stone-400 border-b border-brand/5">
                      <tr>
                        <th className="px-6 py-4 font-semibold">Guest</th>
                        <th className="px-6 py-4 font-semibold">Status</th>
                        <th className="px-6 py-4 font-semibold">Meal Preference</th>
                        <th className="px-6 py-4 font-semibold">Table</th>
                        <th className="px-6 py-4 font-semibold"></th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-brand/5">
                      {guests.map(guest => (
                        <tr key={guest.id} className="hover:bg-stone-50/50 transition-colors group">
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                              {guest.image ? (
                                <img src={guest.image} className="w-10 h-10 rounded-full object-cover border border-brand/10" alt={guest.name} referrerPolicy="no-referrer" />
                              ) : (
                                <div className="w-10 h-10 rounded-full bg-stone-100 flex items-center justify-center text-stone-400">
                                  <Users size={16} />
                                </div>
                              )}
                              <div>
                                <p className="font-medium text-stone-800">{guest.name}</p>
                                {guest.email && <p className="text-[10px] text-stone-400">{guest.email}</p>}
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <select 
                              value={guest.status}
                              onChange={(e) => {
                                const newStatus = e.target.value as any;
                                if (newStatus === 'confirmed') {
                                  setGuestToConfirm(guest);
                                } else {
                                  updateGuest(guest.id, { status: newStatus });
                                }
                              }}
                              className="bg-transparent text-sm border-none focus:ring-0 cursor-pointer"
                            >
                              <option value="invited">Invited</option>
                              <option value="confirmed">Confirmed</option>
                              <option value="declined">Declined</option>
                            </select>
                          </td>
                          <td className="px-6 py-4">
                            <select 
                              value={guest.mealPreference}
                              onChange={(e) => updateGuest(guest.id, { mealPreference: e.target.value as any })}
                              className="bg-transparent text-sm border-none focus:ring-0 cursor-pointer"
                            >
                              <option value="Standard">Standard</option>
                              <option value="Vegetarian">Vegetarian</option>
                              <option value="Vegan">Vegan</option>
                              <option value="Gluten-Free">Gluten-Free</option>
                            </select>
                          </td>
                        <td className="px-6 py-4">
                           <input 
                             type="number" 
                             value={guest.tableNumber || ''} 
                             onChange={(e) => {
                               const val = e.target.value;
                               updateGuest(guest.id, { tableNumber: val ? Number(val) : undefined });
                             }}
                             placeholder="-"
                             className="w-12 bg-transparent border-none focus:ring-0 text-sm"
                           />
                        </td>
                          <td className="px-6 py-4 text-right">
                             <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                               <button onClick={() => { setEditingGuest(guest); setIsGuestModalOpen(true); }} className="text-stone-300 hover:text-brand">
                                 <Edit size={16} />
                               </button>
                               <button onClick={() => deleteGuest(guest.id)} className="text-stone-300 hover:text-red-400">
                                 <Trash2 size={16} />
                               </button>
                             </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </Card>
            </motion.div>
          )}

          {activeTab === 'timeline' && (
            <motion.div
              key="timeline"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="max-w-4xl mx-auto space-y-12"
            >
              <header className="text-center">
                <h2 className="text-4xl font-serif text-brand mb-2">The Timeline</h2>
                <p className="text-stone-500 italic font-light">Synchronizing the magic moments.</p>
              </header>

              <div className="relative border-l-2 border-brand/10 ml-4 md:ml-32 space-y-12 pb-12">
                {timeline.map((event, idx) => (
                  <motion.div 
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    key={event.id} 
                    className="relative group"
                  >
                    <div className="absolute -left-[9px] top-2 w-4 h-4 rounded-full bg-brand shadow-[0_0_0_4px_rgba(90,90,64,0.1)]" />
                    <div className="absolute right-full mr-8 top-0 hidden md:block text-right">
                       <p className="text-2xl font-serif text-brand font-light">{event.time}</p>
                       <span className="text-[10px] uppercase tracking-widest text-stone-400">{event.category}</span>
                    </div>
                    
                    <Card className="ml-8 p-6 group-hover:shadow-lg transition-all border-none bg-stone-50/50">
                       <div className="flex justify-between items-start">
                          <div>
                            <div className="md:hidden flex items-center gap-2 mb-2">
                               <span className="font-serif text-brand font-bold">{event.time}</span>
                               <span className="text-[10px] uppercase tracking-widest text-stone-400">• {event.category}</span>
                            </div>
                            <h4 className="text-xl font-medium text-stone-800 mb-1">{event.title}</h4>
                            <p className="text-sm text-stone-500 font-light leading-relaxed">{event.description || 'Set details for this event...'}</p>
                          </div>
                          <button onClick={() => deleteTimelineEvent(event.id)} className="opacity-0 group-hover:opacity-100 text-stone-300 hover:text-red-400 transition-opacity">
                             <Trash2 size={18} />
                          </button>
                       </div>
                    </Card>
                  </motion.div>
                ))}
                
                <div className="ml-8">
                  <Button variant="outline" className="border-dashed" onClick={() => addTimelineEvent('New Event', '12:00')}>
                    <Plus size={16} className="mr-2" /> Add Timeline Event
                  </Button>
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === 'comparison' && (
            <motion.div
              key="comparison"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="max-w-6xl mx-auto space-y-8"
            >
              <header className="flex justify-between items-center">
                <div>
                  <h2 className="text-4xl font-serif text-brand mb-2">Side-by-Side Comparison</h2>
                  <p className="text-stone-500 italic font-light">Make informed decisions for your celebration.</p>
                </div>
                <Button variant="ghost" onClick={() => setCompareVendors([])}>Clear All</Button>
              </header>

              {compareVendors.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 items-start">
                  {compareVendors.map(id => {
                    const vendor = vendors.find(v => v.id === id);
                    if(!vendor) return null;
                    return (
                      <Card key={vendor.id} className="p-0 overflow-hidden">
                        <img src={vendor.image} className="w-full h-48 object-cover" alt={vendor.name} referrerPolicy="no-referrer" />
                        <div className="p-6 space-y-6">
                           <div>
                              <h3 className="text-2xl font-serif text-brand mb-1">{vendor.name}</h3>
                              <p className="text-xs text-stone-400 uppercase tracking-widest">{vendor.type}</p>
                           </div>
                           
                           <div className="grid grid-cols-2 gap-4 border-y border-stone-100 py-4">
                              <div>
                                 <p className="text-[10px] text-stone-400 uppercase mb-1">Price Point</p>
                                 <p className="font-serif text-lg">{vendor.priceRange}</p>
                              </div>
                              <div>
                                 <p className="text-[10px] text-stone-400 uppercase mb-1">Rating</p>
                                 <p className="font-serif text-lg">{vendor.rating}/5.0</p>
                              </div>
                           </div>

                           <div className="space-y-4">
                              {vendor.notes && (
                                <div>
                                  <p className="text-xs font-semibold text-stone-500 mb-1">User Notes</p>
                                  <p className="text-xs text-stone-500 italic leading-relaxed bg-stone-50 p-2 rounded-lg">{vendor.notes}</p>
                                </div>
                              )}
                              
                              <div className="grid grid-cols-1 gap-3">
                                {vendor.pros && vendor.pros.length > 0 && (
                                  <div>
                                    <p className="text-xs font-semibold text-green-600 mb-1 flex items-center gap-1">
                                      <TrendingUp size={12} /> Pros
                                    </p>
                                    <ul className="space-y-1">
                                      {vendor.pros.map(pro => (
                                        <li key={pro} className="text-[11px] text-stone-600 flex items-start gap-2">
                                          <CircleCheck size={12} className="text-green-500 mt-0.5 shrink-0" /> {pro}
                                        </li>
                                      ))}
                                    </ul>
                                  </div>
                                )}
                                
                                {vendor.cons && vendor.cons.length > 0 && (
                                  <div>
                                    <p className="text-xs font-semibold text-red-600 mb-1 flex items-center gap-1">
                                      <X size={12} /> Cons
                                    </p>
                                    <ul className="space-y-1">
                                      {vendor.cons.map(con => (
                                        <li key={con} className="text-[11px] text-stone-600 flex items-start gap-2">
                                          <X size={12} className="text-red-400 mt-0.5 shrink-0" /> {con}
                                        </li>
                                      ))}
                                    </ul>
                                  </div>
                                )}
                              </div>
                              <Button className="w-full" onClick={() => setSelectedVendorToContact(vendor)}>Inquire Now</Button>
                           </div>
                        </div>
                      </Card>
                    );
                  })}
                </div>
              ) : (
                <div className="p-32 text-center border-2 border-dashed border-stone-100 rounded-[32px]">
                   <Users size={48} className="mx-auto text-stone-200 mb-4" />
                   <p className="text-stone-400 italic">No vendors selected for comparison.</p>
                   <Button variant="ghost" className="mt-4" onClick={() => setActiveTab('vendors')}>Return to Directory</Button>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      <Modal 
        isOpen={isVendorModalOpen} 
        onClose={() => { setIsVendorModalOpen(false); setEditingVendor(null); }} 
        title={editingVendor ? 'Edit Vendor' : 'Add New Vendor'}
      >
        <VendorForm 
          vendor={editingVendor} 
          onSubmit={(data) => {
            if (editingVendor) {
              updateVendor(editingVendor.id, data);
            } else {
              addVendor({
                ...data,
                image: data.image || 'https://picsum.photos/seed/newvendor/600/400',
                featured: false,
                rating: 0
              });
            }
            setIsVendorModalOpen(false);
            setEditingVendor(null);
          }}
          onCancel={() => { setIsVendorModalOpen(false); setEditingVendor(null); }}
        />
      </Modal>

      <Modal 
        isOpen={!!guestToConfirm} 
        onClose={() => setGuestToConfirm(null)} 
        title="Confirm Guest Attendance"
      >
        {guestToConfirm && (
          <div className="space-y-6">
            <div className="p-4 bg-brand/5 rounded-2xl">
              <p className="text-xs text-stone-400 uppercase tracking-widest mb-1">Guest</p>
              <p className="text-xl font-serif text-brand font-bold">{guestToConfirm.name}</p>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="text-[10px] text-stone-400 uppercase tracking-widest block mb-1">Meal Preference</label>
                <select 
                  value={guestToConfirm.mealPreference}
                  onChange={(e) => setGuestToConfirm({ ...guestToConfirm, mealPreference: e.target.value as any })}
                  className="w-full bg-stone-50 border-none rounded-xl px-4 py-3 focus:ring-0 cursor-pointer text-stone-700"
                >
                  <option value="Standard">Standard</option>
                  <option value="Vegetarian">Vegetarian</option>
                  <option value="Vegan">Vegan</option>
                  <option value="Gluten-Free">Gluten-Free</option>
                </select>
              </div>

              <div>
                <label className="text-[10px] text-stone-400 uppercase tracking-widest block mb-1">Table Assignment</label>
                <input 
                  type="number" 
                  value={guestToConfirm.tableNumber || ''} 
                  onChange={(e) => setGuestToConfirm({ ...guestToConfirm, tableNumber: Number(e.target.value) })}
                  placeholder="No table assigned"
                  className="w-full bg-stone-50 border-none rounded-xl px-4 py-3 focus:ring-0 text-stone-700"
                />
              </div>
            </div>

            <div className="pt-4 flex gap-3">
              <Button variant="ghost" className="flex-1" onClick={() => setGuestToConfirm(null)}>Cancel</Button>
              <Button className="flex-1" onClick={() => {
                updateGuest(guestToConfirm.id, { 
                  status: 'confirmed', 
                  mealPreference: guestToConfirm.mealPreference,
                  tableNumber: guestToConfirm.tableNumber 
                });
                setGuestToConfirm(null);
              }}>Confirm Guest</Button>
            </div>
          </div>
        )}
      </Modal>

      <Modal 
        isOpen={!!selectedVendorToContact} 
        onClose={() => { setSelectedVendorToContact(null); setMessageSent(false); }} 
        title={`Inquire with ${selectedVendorToContact?.name}`}
      >
        {selectedVendorToContact && (
          <div className="space-y-6">
            {!messageSent ? (
              <>
                <div className="flex items-center gap-4 p-4 bg-brand/5 rounded-2xl mb-4">
                  <img src={selectedVendorToContact.image} className="w-16 h-16 rounded-xl object-cover" alt={selectedVendorToContact.name} referrerPolicy="no-referrer" />
                  <div>
                    <p className="text-xs text-stone-400 uppercase tracking-widest">{selectedVendorToContact.type}</p>
                    <p className="font-serif text-brand font-bold">{selectedVendorToContact.name}</p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex justify-between items-center mb-1">
                    <label className="text-[10px] text-stone-400 uppercase tracking-widest block">Message</label>
                    <button 
                      onClick={() => handleAiDraft(selectedVendorToContact)}
                      disabled={isAiLoading}
                      className="text-[10px] text-brand hover:underline flex items-center gap-1"
                    >
                      {isAiLoading ? <Loader2 size={10} className="animate-spin" /> : <Sparkles size={10} />}
                      Draft with AI
                    </button>
                  </div>
                  <div>
                    <textarea 
                      rows={4} 
                      value={aiDraftMessage}
                      onChange={(e) => setAiDraftMessage(e.target.value)}
                      placeholder={`Hi ${selectedVendorToContact.name}, we'd love to learn more about your services for our wedding...`}
                      className="w-full bg-stone-50 border-none rounded-xl px-4 py-3 focus:ring-0 text-stone-700 resize-none"
                    />
                  </div>
                </div>

                <div className="flex gap-3">
                  <Button variant="ghost" className="flex-1" onClick={() => setSelectedVendorToContact(null)}>Cancel</Button>
                  <Button 
                    className="flex-1" 
                    onClick={() => {
                      setIsSendingMessage(true);
                      setTimeout(() => {
                        setIsSendingMessage(false);
                        setMessageSent(true);
                      }, 1500);
                    }}
                    disabled={isSendingMessage}
                  >
                    {isSendingMessage ? 'Sending...' : 'Send Message'}
                  </Button>
                </div>
              </>
            ) : (
              <motion.div 
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center py-8"
              >
                <div className="w-16 h-16 bg-green-50 text-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CircleCheck size={32} />
                </div>
                <h4 className="text-2xl font-serif text-brand mb-2">Message Sent!</h4>
                <p className="text-stone-500 italic mb-6">Your inquiry has been delivered. {selectedVendorToContact.name} usually responds within 24 hours.</p>
                <Button className="w-full" onClick={() => setSelectedVendorToContact(null)}>Close</Button>
              </motion.div>
            )}
          </div>
        )}
      </Modal>

      <Modal 
        isOpen={isTargetBudgetModalOpen} 
        onClose={() => setIsTargetBudgetModalOpen(false)} 
        title="Set Target Budget"
      >
        <div className="space-y-6">
          <p className="text-stone-500 text-sm italic">What is your total budget for the wedding? We'll help you track your estimates against this goal.</p>
          <div className="relative">
            <span className="absolute left-6 top-1/2 -translate-y-1/2 text-brand font-serif text-xl">$</span>
            <input 
              type="number" 
              value={targetBudget}
              onChange={(e) => setTargetBudget(parseInt(e.target.value) || 0)}
              className="w-full bg-stone-50 border-none rounded-2xl pl-12 pr-6 py-4 text-xl font-serif text-brand focus:ring-2 focus:ring-brand/20 outline-none"
            />
          </div>
          <Button className="w-full" onClick={() => setIsTargetBudgetModalOpen(false)}>Save Target</Button>
        </div>
      </Modal>

      <Modal 
        isOpen={isBudgetItemModalOpen} 
        onClose={() => setIsBudgetItemModalOpen(false)} 
        title={editingBudgetItem ? 'Edit Budget Item' : 'Add Budget Item'}
      >
        <BudgetItemForm 
          item={editingBudgetItem}
          onSubmit={(data) => {
            if (editingBudgetItem) {
              updateBudgetItem(editingBudgetItem.id, data);
            } else {
              addBudgetItem(data);
            }
            setIsBudgetItemModalOpen(false);
          }}
          onCancel={() => setIsBudgetItemModalOpen(false)}
        />
      </Modal>

      <Modal 
        isOpen={isAiConciergeOpen} 
        onClose={() => setIsAiConciergeOpen(false)} 
        title="AI Wedding Concierge"
      >
        <div className="space-y-6">
          <div className="p-6 bg-brand/5 rounded-[32px] text-center">
            <div className="w-16 h-16 bg-brand text-white rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg shadow-brand/20">
              <Sparkles size={32} />
            </div>
            <h4 className="text-xl font-serif text-brand mb-2">How can I help you today?</h4>
            <p className="text-sm text-stone-500 italic">I can assist with your checklist, budget, or vendor communications.</p>
          </div>

          <div className="grid grid-cols-1 gap-3">
            <button 
              onClick={() => { handleAiChecklist(); setIsAiConciergeOpen(false); setActiveTab('checklist'); }}
              className="flex items-center gap-4 p-4 hover:bg-stone-50 rounded-2xl transition-all border border-brand/5 group"
            >
              <div className="p-3 rounded-xl bg-brand/10 text-brand group-hover:bg-brand group-hover:text-white transition-colors">
                <CheckSquare size={20} />
              </div>
              <div className="text-left">
                <p className="font-medium text-stone-800">Smart Checklist</p>
                <p className="text-xs text-stone-400">Generate suggested tasks for your timeline</p>
              </div>
              <ChevronRight size={16} className="ml-auto text-stone-300" />
            </button>

            <button 
              onClick={() => { handleAiBudget(); setIsAiConciergeOpen(false); setActiveTab('budget'); }}
              className="flex items-center gap-4 p-4 hover:bg-stone-50 rounded-2xl transition-all border border-brand/5 group"
            >
              <div className="p-3 rounded-xl bg-brand/10 text-brand group-hover:bg-brand group-hover:text-white transition-colors">
                <DollarSign size={20} />
              </div>
              <div className="text-left">
                <p className="font-medium text-stone-800">Budget Optimizer</p>
                <p className="text-xs text-stone-400">Review and suggest budget allocations</p>
              </div>
              <ChevronRight size={16} className="ml-auto text-stone-300" />
            </button>

            <button 
              onClick={() => { setIsAiConciergeOpen(false); setActiveTab('vendors'); }}
              className="flex items-center gap-4 p-4 hover:bg-stone-50 rounded-2xl transition-all border border-brand/5 group"
            >
              <div className="p-3 rounded-xl bg-brand/10 text-brand group-hover:bg-brand group-hover:text-white transition-colors">
                <MessageSquare size={20} />
              </div>
              <div className="text-left">
                <p className="font-medium text-stone-800">Vendor Assistant</p>
                <p className="text-xs text-stone-400">Draft professional inquiries for vendors</p>
              </div>
              <ChevronRight size={16} className="ml-auto text-stone-300" />
            </button>
          </div>
        </div>
      </Modal>

      <Modal 
        isOpen={isSetDateModalOpen} 
        onClose={() => setIsSetDateModalOpen(false)} 
        title="Set Wedding Date"
      >
        <div className="space-y-6">
          <p className="text-stone-500 text-sm italic">When is your big day? We'll help you stay on track.</p>
          <input 
            type="date" 
            value={weddingDate}
            onChange={(e) => setWeddingDate(e.target.value)}
            className="w-full bg-stone-50 border-none rounded-2xl px-6 py-4 text-xl font-serif text-brand focus:ring-2 focus:ring-brand/20 outline-none"
          />
          <Button className="w-full" onClick={() => setIsSetDateModalOpen(false)}>Save Date</Button>
        </div>
      </Modal>

      <Modal 
        isOpen={isQuickActionModalOpen} 
        onClose={() => setIsQuickActionModalOpen(false)} 
        title="Quick Actions"
      >
        <div className="grid grid-cols-1 gap-4">
          <button 
            onClick={() => { setActiveTab('checklist'); setIsQuickActionModalOpen(false); }}
            className="flex items-center gap-4 p-4 hover:bg-stone-50 rounded-2xl transition-all border border-brand/5"
          >
            <div className="p-3 rounded-xl bg-brand/10 text-brand">
              <CheckSquare size={20} />
            </div>
            <div className="text-left">
              <p className="font-medium text-stone-800">Add New Task</p>
              <p className="text-xs text-stone-400">Jump to your checklist</p>
            </div>
            <ChevronRight size={16} className="ml-auto text-stone-300" />
          </button>

          <button 
            onClick={() => { setActiveTab('guests'); setIsQuickActionModalOpen(false); }}
            className="flex items-center gap-4 p-4 hover:bg-stone-50 rounded-2xl transition-all border border-brand/5"
          >
            <div className="p-3 rounded-xl bg-brand/10 text-brand">
              <Users size={20} />
            </div>
            <div className="text-left">
              <p className="font-medium text-stone-800">Add New Guest</p>
              <p className="text-xs text-stone-400">Manage your guest list</p>
            </div>
            <ChevronRight size={16} className="ml-auto text-stone-300" />
          </button>

          <button 
            onClick={() => { setActiveTab('vendors'); setIsQuickActionModalOpen(false); }}
            className="flex items-center gap-4 p-4 hover:bg-stone-50 rounded-2xl transition-all border border-brand/5"
          >
            <div className="p-3 rounded-xl bg-brand/10 text-brand">
              <Award size={20} />
            </div>
            <div className="text-left">
              <p className="font-medium text-stone-800">Find Vendors</p>
              <p className="text-xs text-stone-400">Explore the directory</p>
            </div>
            <ChevronRight size={16} className="ml-auto text-stone-300" />
          </button>
        </div>
      </Modal>

      <Modal 
        isOpen={isTaskModalOpen} 
        onClose={() => { setIsTaskModalOpen(false); setEditingTask(null); }} 
        title={editingTask ? 'Edit Task' : 'Add Task'}
      >
        <TaskForm 
          task={editingTask}
          categories={categories}
          onSubmit={(data) => {
            if (editingTask) {
              updateTask(editingTask.id, data);
            } else {
              addTask(data);
            }
            setIsTaskModalOpen(false);
            setEditingTask(null);
          }}
          onCancel={() => { setIsTaskModalOpen(false); setEditingTask(null); }}
        />
      </Modal>

      <Modal 
        isOpen={isGuestModalOpen} 
        onClose={() => { setIsGuestModalOpen(false); setEditingGuest(null); }} 
        title={editingGuest ? 'Edit Guest' : 'Add Guest'}
      >
        <GuestForm 
          guest={editingGuest}
          onSubmit={(data) => {
            if (editingGuest) {
              updateGuest(editingGuest.id, data);
            } else {
              addGuest(data);
            }
            setIsGuestModalOpen(false);
            setEditingGuest(null);
          }}
          onCancel={() => { setIsGuestModalOpen(false); setEditingGuest(null); }}
        />
      </Modal>
    </div>
  );
}

function BudgetItemForm({ 
  item, 
  onSubmit, 
  onCancel 
}: { 
  item: BudgetItem | null; 
  onSubmit: (data: any) => void; 
  onCancel: () => void;
}) {
  const [formData, setFormData] = useState({
    name: item?.name || '',
    category: item?.category || 'Venue',
    estimated: item?.estimated || 0,
    actual: item?.actual || 0,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="text-[10px] text-stone-400 uppercase tracking-widest block mb-1">Item Name</label>
        <input 
          type="text" 
          required
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          className="w-full bg-stone-50 border-none rounded-xl px-4 py-3 focus:ring-0 text-stone-700" 
          placeholder="e.g. Photography Package"
        />
      </div>
      <div>
        <label className="text-[10px] text-stone-400 uppercase tracking-widest block mb-1">Category</label>
        <select 
          value={formData.category}
          onChange={(e) => setFormData({ ...formData, category: e.target.value })}
          className="w-full bg-stone-50 border-none rounded-xl px-4 py-3 focus:ring-0 text-stone-700 cursor-pointer"
        >
          <option value="Venue">Venue</option>
          <option value="Catering">Catering</option>
          <option value="Photography">Photography</option>
          <option value="Florist">Florist</option>
          <option value="Decor">Decor</option>
          <option value="Music">Music</option>
          <option value="Attire">Attire</option>
          <option value="Stationary">Stationary</option>
        </select>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="text-[10px] text-stone-400 uppercase tracking-widest block mb-1">Estimated Cost</label>
          <input 
            type="number" 
            required
            value={formData.estimated}
            onChange={(e) => setFormData({ ...formData, estimated: parseInt(e.target.value) || 0 })}
            className="w-full bg-stone-50 border-none rounded-xl px-4 py-3 focus:ring-0 text-stone-700" 
          />
        </div>
        <div>
          <label className="text-[10px] text-stone-400 uppercase tracking-widest block mb-1">Actual Spent</label>
          <input 
            type="number" 
            value={formData.actual}
            onChange={(e) => setFormData({ ...formData, actual: parseInt(e.target.value) || 0 })}
            className="w-full bg-stone-50 border-none rounded-xl px-4 py-3 focus:ring-0 text-stone-700" 
          />
        </div>
      </div>
      <div className="flex gap-3 pt-4">
        <Button type="button" variant="ghost" className="flex-1" onClick={onCancel}>Cancel</Button>
        <Button type="submit" className="flex-1">{item ? 'Save Changes' : 'Add Item'}</Button>
      </div>
    </form>
  );
}

function VendorForm({ 
  vendor, 
  onSubmit, 
  onCancel 
}: { 
  vendor: Vendor | null; 
  onSubmit: (data: Omit<Vendor, 'id'>) => void; 
  onCancel: () => void;
}) {
  const [formData, setFormData] = useState({
    name: vendor?.name || '',
    type: vendor?.type || 'Florist',
    priceRange: vendor?.priceRange || '$$',
    notes: vendor?.notes || '',
    image: vendor?.image || '',
    pros: vendor?.pros?.join(', ') || '',
    cons: vendor?.cons?.join(', ') || '',
  });

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData(prev => ({ ...prev, image: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) return;
    onSubmit({
      ...formData,
      pros: formData.pros.split(',').map(s => s.trim()).filter(Boolean),
      cons: formData.cons.split(',').map(s => s.trim()).filter(Boolean),
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="mb-6">
        <label className="text-[10px] text-stone-400 uppercase tracking-widest block mb-2">Vendor Portfolio Image</label>
        {formData.image ? (
          <div className="relative rounded-xl overflow-hidden aspect-video w-full border border-stone-100 group">
            <img src={formData.image} className="w-full h-full object-cover" alt="Preview" referrerPolicy="no-referrer" />
            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
              <button 
                type="button" 
                onClick={() => setFormData({ ...formData, image: '' })}
                className="p-2 bg-white text-stone-800 rounded-full hover:bg-stone-50"
              >
                <Trash2 size={20} />
              </button>
            </div>
          </div>
        ) : (
          <label className="flex flex-col items-center justify-center w-full aspect-video border-2 border-dashed border-stone-200 rounded-xl cursor-pointer hover:border-brand/40 hover:bg-brand/5 transition-all text-stone-400">
            <div className="flex flex-col items-center justify-center pt-5 pb-6">
              <Plus size={24} className="mb-2" />
              <p className="text-xs uppercase tracking-widest">Upload Photo / Portfolio</p>
            </div>
            <input type="file" accept="image/*" className="hidden" onChange={handleFileUpload} />
          </label>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="text-[10px] text-stone-400 uppercase tracking-widest block mb-1">Vendor Name</label>
          <input 
            type="text" 
            required
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            className="w-full bg-stone-50 border-none rounded-xl px-4 py-3 focus:ring-0 text-stone-700" 
            placeholder="e.g. Dream Cakes"
          />
        </div>
        <div>
          <label className="text-[10px] text-stone-400 uppercase tracking-widest block mb-1">Service Type</label>
          <select 
            value={formData.type}
            onChange={(e) => setFormData({ ...formData, type: e.target.value })}
            className="w-full bg-stone-50 border-none rounded-xl px-4 py-3 focus:ring-0 text-stone-700 cursor-pointer"
          >
            <option value="Florist">Florist</option>
            <option value="Venue">Venue</option>
            <option value="Photography">Photography</option>
            <option value="Catering">Catering</option>
            <option value="Music">Music</option>
            <option value="Stationary">Stationary</option>
            <option value="Attire">Attire</option>
            <option value="Other">Other</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="text-[10px] text-stone-400 uppercase tracking-widest block mb-1">Price Range</label>
          <select 
            value={formData.priceRange}
            onChange={(e) => setFormData({ ...formData, priceRange: e.target.value as any })}
            className="w-full bg-stone-50 border-none rounded-xl px-4 py-3 focus:ring-0 text-stone-700 cursor-pointer"
          >
            <option value="$">$ (Budget)</option>
            <option value="$$">$$ (Moderate)</option>
            <option value="$$$">$$$ (Premium)</option>
            <option value="$$$$">$$$$ (Luxury)</option>
          </select>
        </div>
        <div>
          <label className="text-[10px] text-stone-400 uppercase tracking-widest block mb-1">Fallback URL (Optional)</label>
          <input 
            type="url" 
            value={formData.image}
            onChange={(e) => setFormData({ ...formData, image: e.target.value })}
            className="w-full bg-stone-50 border-none rounded-xl px-4 py-3 focus:ring-0 text-stone-700" 
            placeholder="https://..."
          />
        </div>
      </div>

      <div>
        <label className="text-[10px] text-stone-400 uppercase tracking-widest block mb-1">Notes</label>
        <textarea 
          rows={2}
          value={formData.notes}
          onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
          className="w-full bg-stone-50 border-none rounded-xl px-4 py-3 focus:ring-0 text-stone-700 resize-none" 
          placeholder="Personal observations..."
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="text-[10px] text-stone-400 uppercase tracking-widest block mb-1">Pros (comma separated)</label>
          <input 
            type="text" 
            value={formData.pros}
            onChange={(e) => setFormData({ ...formData, pros: e.target.value })}
            className="w-full bg-stone-50 border-none rounded-xl px-4 py-3 focus:ring-0 text-stone-700" 
            placeholder="Great taste, affordable..."
          />
        </div>
        <div>
          <label className="text-[10px] text-stone-400 uppercase tracking-widest block mb-1">Cons (comma separated)</label>
          <input 
            type="text" 
            value={formData.cons}
            onChange={(e) => setFormData({ ...formData, cons: e.target.value })}
            className="w-full bg-stone-50 border-none rounded-xl px-4 py-3 focus:ring-0 text-stone-700" 
            placeholder="Slow reply, far away..."
          />
        </div>
      </div>

      <div className="flex gap-3 pt-4">
        <Button type="button" variant="ghost" className="flex-1" onClick={onCancel}>Cancel</Button>
        <Button type="submit" className="flex-1">{vendor ? 'Save Changes' : 'Add Vendor'}</Button>
      </div>
    </form>
  );
}

function TaskForm({ 
  task, 
  categories, 
  onSubmit, 
  onCancel 
}: { 
  task: TaskItem | null; 
  categories: TaskCategory[];
  onSubmit: (data: Omit<TaskItem, 'id'>) => void; 
  onCancel: () => void;
}) {
  const [formData, setFormData] = useState({
    title: task?.title || '',
    category: task?.category || categories[0]?.name || 'Planning',
    completed: task?.completed || false,
    dueDate: task?.dueDate || '',
    image: task?.image || '',
  });

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData(prev => ({ ...prev, image: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim()) return;
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="text-[10px] text-stone-400 uppercase tracking-widest block mb-1">Task Title</label>
        <input 
          type="text" 
          required
          value={formData.title}
          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
          className="w-full bg-stone-50 border-none rounded-xl px-4 py-3 focus:ring-0 text-stone-700" 
          placeholder="e.g. Find a photographer"
        />
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="text-[10px] text-stone-400 uppercase tracking-widest block mb-1">Category</label>
          <select 
            value={formData.category}
            onChange={(e) => setFormData({ ...formData, category: e.target.value })}
            className="w-full bg-stone-50 border-none rounded-xl px-4 py-3 focus:ring-0 text-stone-700 cursor-pointer"
          >
            {categories.map(cat => (
              <option key={cat.id} value={cat.name}>{cat.name}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="text-[10px] text-stone-400 uppercase tracking-widest block mb-1">Due Date</label>
          <input 
            type="date" 
            value={formData.dueDate}
            onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
            className="w-full bg-stone-50 border-none rounded-xl px-4 py-3 focus:ring-0 text-stone-700" 
          />
        </div>
      </div>

      <div>
        <label className="text-[10px] text-stone-400 uppercase tracking-widest block mb-1">
          {formData.category === 'Attire' || formData.category === 'Decor' 
            ? 'Inspiration Image' 
            : 'Image (Optional)'}
        </label>
        
        {formData.image ? (
          <div className="relative rounded-xl overflow-hidden aspect-video w-full border border-stone-100 group">
            <img src={formData.image} className="w-full h-full object-cover" alt="Preview" referrerPolicy="no-referrer" />
            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
              <button 
                type="button" 
                onClick={() => setFormData({ ...formData, image: '' })}
                className="p-2 bg-white text-stone-800 rounded-full hover:bg-stone-50"
              >
                <Trash2 size={20} />
              </button>
            </div>
          </div>
        ) : (
          <label className="flex flex-col items-center justify-center w-full aspect-video border-2 border-dashed border-stone-200 rounded-xl cursor-pointer hover:border-brand/40 hover:bg-brand/5 transition-all text-stone-400">
            <div className="flex flex-col items-center justify-center pt-5 pb-6">
              <Plus size={24} className="mb-2" />
              <p className="text-xs uppercase tracking-widest">Click to upload from device</p>
            </div>
            <input type="file" accept="image/*" className="hidden" onChange={handleFileUpload} />
          </label>
        )}
      </div>

      <div className="flex gap-3 pt-4">
        <Button type="button" variant="ghost" className="flex-1" onClick={onCancel}>Cancel</Button>
        <Button type="submit" className="flex-1">{task ? 'Save Changes' : 'Add Task'}</Button>
      </div>
    </form>
  );
}

function GuestForm({ 
  guest, 
  onSubmit, 
  onCancel 
}: { 
  guest: Guest | null; 
  onSubmit: (data: Omit<Guest, 'id'>) => void; 
  onCancel: () => void;
}) {
  const [formData, setFormData] = useState({
    name: guest?.name || '',
    email: guest?.email || '',
    status: guest?.status || 'invited',
    mealPreference: guest?.mealPreference || 'Standard',
    tableNumber: guest?.tableNumber,
    image: guest?.image || '',
  });

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData(prev => ({ ...prev, image: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) return;
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="flex flex-col items-center justify-center mb-6">
        <div className="relative group">
          <div className="w-24 h-24 rounded-full overflow-hidden bg-stone-100 border-2 border-brand/10 flex items-center justify-center text-stone-300">
            {formData.image ? (
              <img src={formData.image} className="w-full h-full object-cover" alt="Preview" referrerPolicy="no-referrer" />
            ) : (
              <Users size={32} />
            )}
          </div>
          <label className="absolute inset-0 flex items-center justify-center bg-black/40 text-white opacity-0 group-hover:opacity-100 rounded-full cursor-pointer transition-opacity">
            <Plus size={20} />
            <input type="file" accept="image/*" className="hidden" onChange={handleFileUpload} />
          </label>
        </div>
        <p className="text-[10px] text-stone-400 uppercase tracking-widest mt-2">{formData.image ? 'Change Photo' : 'Upload Photo'}</p>
      </div>

      <div>
        <label className="text-[10px] text-stone-400 uppercase tracking-widest block mb-1">Full Name</label>
        <input 
          type="text" 
          required
          value={formData.name}
          onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
          className="w-full bg-stone-50 border-none rounded-xl px-4 py-3 focus:ring-0 text-stone-700" 
          placeholder="e.g. John Doe"
        />
      </div>

      <div>
        <label className="text-[10px] text-stone-400 uppercase tracking-widest block mb-1">Email Address</label>
        <input 
          type="email" 
          value={formData.email}
          onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
          className="w-full bg-stone-50 border-none rounded-xl px-4 py-3 focus:ring-0 text-stone-700" 
          placeholder="john@example.com"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="text-[10px] text-stone-400 uppercase tracking-widest block mb-1">Status</label>
          <select 
            value={formData.status}
            onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value as any }))}
            className="w-full bg-stone-50 border-none rounded-xl px-4 py-3 focus:ring-0 text-stone-700 cursor-pointer"
          >
            <option value="invited">Invited</option>
            <option value="confirmed">Confirmed</option>
            <option value="declined">Declined</option>
          </select>
        </div>
        <div>
          <label className="text-[10px] text-stone-400 uppercase tracking-widest block mb-1">Table Number</label>
          <input 
            type="number" 
            value={formData.tableNumber || ''}
            onChange={(e) => {
              const val = e.target.value;
              setFormData(prev => ({ ...prev, tableNumber: val ? parseInt(val) : undefined }));
            }}
            className="w-full bg-stone-50 border-none rounded-xl px-4 py-3 focus:ring-0 text-stone-700" 
            placeholder="-"
          />
        </div>
      </div>

      <div>
        <label className="text-[10px] text-stone-400 uppercase tracking-widest block mb-1">Meal Preference</label>
        <select 
          value={formData.mealPreference}
          onChange={(e) => setFormData(prev => ({ ...prev, mealPreference: e.target.value as any }))}
          className="w-full bg-stone-50 border-none rounded-xl px-4 py-3 focus:ring-0 text-stone-700 cursor-pointer"
        >
          <option value="Standard">Standard</option>
          <option value="Vegetarian">Vegetarian</option>
          <option value="Vegan">Vegan</option>
          <option value="Gluten-Free">Gluten-Free</option>
        </select>
      </div>

      <div>
        <label className="text-[10px] text-stone-400 uppercase tracking-widest block mb-1">Alternative Image URL</label>
        <input 
          type="url" 
          value={formData.image}
          onChange={(e) => setFormData(prev => ({ ...prev, image: e.target.value }))}
          className="w-full bg-stone-50 border-none rounded-xl px-4 py-3 focus:ring-0 text-stone-700" 
          placeholder="https://..."
        />
      </div>

      <div className="flex gap-3 pt-4">
        <Button type="button" variant="ghost" className="flex-1" onClick={onCancel}>Cancel</Button>
        <Button type="submit" className="flex-1">{guest ? 'Save Changes' : 'Add Guest'}</Button>
      </div>
    </form>
  );
}

function NavButton({ active, onClick, icon: Icon, label }: { active: boolean, onClick: () => void, icon: any, label: string }) {
  return (
    <button 
      onClick={onClick}
      className={`flex items-center gap-3 px-4 py-3 rounded-2xl transition-all duration-200 group ${
        active 
        ? 'bg-brand text-white shadow-md' 
        : 'text-stone-500 hover:bg-stone-100 hover:text-stone-800'
      }`}
    >
      <Icon size={18} className={`${active ? 'text-white' : 'text-stone-400 group-hover:text-stone-600'}`} />
      <span className="font-medium">{label}</span>
      {active && (
        <motion.div 
          layoutId="sidebar-active"
          className="ml-auto w-1 h-4 bg-white/40 rounded-full"
        />
      )}
    </button>
  );
}

function MobileNavButton({ active, onClick, icon: Icon }: { active: boolean, onClick: () => void, icon: any }) {
  return (
    <button 
      onClick={onClick}
      className={`p-3 rounded-2xl transition-all duration-200 ${
        active ? 'bg-brand text-white' : 'text-stone-400'
      }`}
    >
      <Icon size={24} />
    </button>
  );
}

function VendorCard({ 
  vendor, 
  onCompare, 
  isComparing, 
  onContact, 
  onEdit, 
  onDelete, 
  onToggleFavorite 
}: { 
  vendor: Vendor; 
  onCompare?: () => void; 
  isComparing?: boolean; 
  onContact?: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
  onToggleFavorite?: () => void;
  key?: any;
}) {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="group"
    >
      <div className={`bg-white rounded-[32px] overflow-hidden shadow-[0px_4px_20px_rgba(0,0,0,0.05)] border transition-all duration-300 ${isComparing ? 'border-brand ring-4 ring-brand/10' : 'border-black/5'}`}>
        <div className="relative h-64 overflow-hidden">
          <img 
            src={vendor.image} 
            alt={vendor.name} 
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
            referrerPolicy="no-referrer"
          />
          <div className="absolute top-4 right-4 flex gap-2">
            <button 
              onClick={(e) => { e.stopPropagation(); onToggleFavorite?.(); }}
              className={`p-2 rounded-full backdrop-blur-md transition-colors ${
                vendor.isFavorite ? 'bg-red-500 text-white' : 'bg-white/80 text-red-500 hover:bg-red-50'
              }`}
            >
              <Heart size={16} fill={vendor.isFavorite ? "currentColor" : "none"} />
            </button>
            {onCompare && (
              <button 
                onClick={(e) => { e.stopPropagation(); onCompare(); }}
                className={`p-2 rounded-full backdrop-blur-md transition-colors ${
                  isComparing ? 'bg-brand text-white' : 'bg-white/80 text-brand'
                }`}
              >
                <Plus size={16} className={isComparing ? 'rotate-45' : ''} />
              </button>
            )}
            {vendor.featured && (
              <span className="bg-white/90 backdrop-blur px-3 py-1 rounded-full text-[10px] font-bold text-brand uppercase tracking-tighter shadow-sm">
                Featured
              </span>
            )}
          </div>
          
          <div className="absolute bottom-4 left-4 flex gap-1">
            <button 
              onClick={(e) => { e.stopPropagation(); onEdit?.(); }}
              className="p-2 rounded-full bg-white/80 backdrop-blur text-stone-600 hover:text-brand transition-colors"
            >
              <Edit size={14} />
            </button>
            <button 
              onClick={(e) => { e.stopPropagation(); onDelete?.(); }}
              className="p-2 rounded-full bg-white/80 backdrop-blur text-stone-600 hover:text-red-500 transition-colors"
            >
              <Trash2 size={14} />
            </button>
          </div>
        </div>
        <div className="p-6">
          <div className="flex justify-between items-start mb-2">
            <h4 className="text-xl font-serif text-brand font-semibold capitalize">{vendor.name}</h4>
            <div className="flex flex-col items-end gap-1">
              <span className="text-stone-400 text-sm font-medium">{vendor.priceRange}</span>
              <div className="flex items-center gap-1 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-100">
                <Star size={10} fill="#FFB800" stroke="none" />
                <span className="text-[10px] items-center font-bold text-amber-700">{vendor.rating}</span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2 mb-6">
            <Award size={14} className="text-brand" />
            <span className="text-xs text-stone-500 uppercase tracking-widest">{vendor.type}</span>
          </div>
          <div className="flex gap-2">
             <Button className="flex-1" size="sm" onClick={onContact}>Contact Vendor</Button>
             <Button variant="secondary" size="sm" className="px-3"><ExternalLink size={16} /></Button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
