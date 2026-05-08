/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  CircleCheck, 
  Circle, 
  Plus, 
  Trash2, 
  DollarSign, 
  Calendar, 
  ChevronRight, 
  Heart, 
  LayoutDashboard, 
  CheckSquare, 
  Users, 
  Image as ImageIcon 
} from 'lucide-react';

export function Button({ 
  children, 
  variant = 'primary', 
  size = 'md', 
  className = '', 
  ...props 
}: {
  children?: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
} & React.ButtonHTMLAttributes<HTMLButtonElement>) {
  const baseStyles = 'inline-flex items-center justify-center rounded-full font-medium transition-all duration-200 active:scale-95 disabled:opacity-50';
  
  const variants = {
    primary: 'bg-[#5A5A40] text-white hover:bg-[#4A4A35] shadow-sm',
    secondary: 'bg-[#F5F5F0] text-[#5A5A40] hover:bg-[#EBEBE5]',
    outline: 'border border-[#5A5A40] text-[#5A5A40] hover:bg-[#5A5A40] hover:text-white',
    ghost: 'text-[#5A5A40] hover:bg-[#F5F5F0]'
  };
  
  const sizes = {
    sm: 'px-3 py-1.5 text-xs',
    md: 'px-6 py-2.5 text-sm',
    lg: 'px-8 py-3 text-base'
  };

  return (
    <button 
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}

export function Card({ children, className = '', id }: { children: React.ReactNode; className?: string; id?: string; key?: React.Key }) {
  return (
    <div id={id} className={`bg-white rounded-[32px] p-6 shadow-[0px_4px_20px_rgba(0,0,0,0.05)] border border-black/5 ${className}`}>
      {children}
    </div>
  );
}

export function StatCard({ label, value, icon: Icon, color = 'bg-[#5A5A40]' }: { label: string; value: string; icon: any; color?: string }) {
  return (
    <Card className="flex items-center gap-4">
      <div className={`p-3 rounded-2xl ${color} bg-opacity-10 text-${color.replace('bg-', '')}`}>
        <Icon size={24} className={color === 'bg-[#5A5A40]' ? 'text-[#5A5A40]' : ''} />
      </div>
      <div>
        <p className="text-xs font-semibold uppercase tracking-wider text-black/40">{label}</p>
        <p className="text-2xl font-serif font-light text-[#1A1A1A]">{value}</p>
      </div>
    </Card>
  );
}

export function Modal({ isOpen, onClose, title, children }: { isOpen: boolean; onClose: () => void; title: string; children: React.ReactNode }) {
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="relative bg-white rounded-[32px] shadow-2xl w-full max-w-md overflow-hidden"
          >
            <div className="p-8">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-2xl font-serif text-brand font-bold">{title}</h3>
                <button onClick={onClose} className="p-2 hover:bg-stone-100 rounded-full transition-colors">
                  <Plus size={20} className="rotate-45 text-stone-400" />
                </button>
              </div>
              {children}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
