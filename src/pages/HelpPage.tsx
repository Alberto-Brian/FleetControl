// ========================================
// FILE: src/pages/HelpPage.tsx
// ========================================
import React, { useState, useRef, useCallback, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useLicense } from '@/hooks/useLicense';
import {
  Home, Truck, Users, Fuel, Wrench, DollarSign, AlertTriangle,
  FileText, MapPin, Settings, Database, Bell, HelpCircle, Search,
  ChevronRight, Key, Zap, Info, Route,
} from 'lucide-react';

// ─── Types ────────────────────────────────────────────────────────────────────
type HelpBlock =
  | { type: 'text';    text: string }
  | { type: 'list';    items: string[] }
  | { type: 'tip';     text: string }
  | { type: 'warning'; text: string }
  | { type: 'steps';   steps: string[] }
  | { type: 'table';   headers: string[]; rows: string[][] };

interface HelpSection {
  id: string;
  title: string;
  connectedOnly?: boolean;
  content: HelpBlock[];
}

// Map section id → lucide icon
const SECTION_ICONS: Record<string, React.ElementType> = {
  intro:         HelpCircle,
  dashboard:     Home,
  vehicles:      Truck,
  drivers:       Users,
  trips:         Route,
  fuel:          Fuel,
  maintenance:   Wrench,
  expenses:      DollarSign,
  fines:         AlertTriangle,
  reports:       FileText,
  tracking:      MapPin,
  notifications: Bell,
  databases:     Database,
  settings:      Settings,
  license:       Key,
};

// ─── Block Renderer ────────────────────────────────────────────────────────────
function renderBlock(block: HelpBlock, idx: number) {
  switch (block.type) {
    case 'text':
      return (
        <p key={idx} className="text-sm leading-relaxed" style={{ color: 'var(--ui-t72)' }}>
          {block.text}
        </p>
      );
    case 'list':
      return (
        <ul key={idx} className="space-y-1.5">
          {block.items.map((item, i) => (
            <li key={i} className="flex items-start gap-2 text-sm" style={{ color: 'var(--ui-t68)' }}>
              <ChevronRight className="w-3.5 h-3.5 mt-0.5 shrink-0" style={{ color: 'var(--ui-t25)' }} />
              <span>{item}</span>
            </li>
          ))}
        </ul>
      );
    case 'steps':
      return (
        <ol key={idx} className="space-y-2.5">
          {block.steps.map((step, i) => (
            <li key={i} className="flex items-start gap-3 text-sm" style={{ color: 'var(--ui-t68)' }}>
              <span
                className="flex-shrink-0 w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold mt-0.5"
                style={{ background: 'var(--ui-b10)', color: 'var(--ui-t55)' }}
              >
                {i + 1}
              </span>
              <span>{step}</span>
            </li>
          ))}
        </ol>
      );
    case 'tip':
      return (
        <div
          key={idx}
          className="flex gap-2.5 rounded-lg px-3.5 py-3"
          style={{ background: 'rgba(74,222,128,0.07)', border: '1px solid rgba(74,222,128,0.15)' }}
        >
          <Zap className="w-3.5 h-3.5 mt-0.5 shrink-0" style={{ color: '#4ade80' }} />
          <p className="text-xs leading-relaxed" style={{ color: 'var(--ui-t68)' }}>{block.text}</p>
        </div>
      );
    case 'warning':
      return (
        <div
          key={idx}
          className="flex gap-2.5 rounded-lg px-3.5 py-3"
          style={{ background: 'rgba(251,191,36,0.07)', border: '1px solid rgba(251,191,36,0.15)' }}
        >
          <AlertTriangle className="w-3.5 h-3.5 mt-0.5 shrink-0" style={{ color: '#fbbf24' }} />
          <p className="text-xs leading-relaxed" style={{ color: 'var(--ui-t68)' }}>{block.text}</p>
        </div>
      );
    case 'table':
      return (
        <div
          key={idx}
          className="overflow-x-auto rounded-lg"
          style={{ border: '1px solid var(--ui-b07)' }}
        >
          <table className="w-full text-xs">
            <thead>
              <tr style={{ background: 'var(--ui-b04)', borderBottom: '1px solid var(--ui-b07)' }}>
                {block.headers.map((h, i) => (
                  <th key={i} className="text-left px-3 py-2 font-semibold" style={{ color: 'var(--ui-t45)' }}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {block.rows.map((row, ri) => (
                <tr
                  key={ri}
                  style={{ borderBottom: ri < block.rows.length - 1 ? '1px solid var(--ui-b04)' : 'none' }}
                >
                  {row.map((cell, ci) => (
                    <td
                      key={ci}
                      className="px-3 py-2"
                      style={{ color: ci === 0 ? 'var(--ui-t82)' : 'var(--ui-t58)' }}
                    >
                      {ci === 0 ? <strong>{cell}</strong> : cell}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );
    default:
      return null;
  }
}

// ─── Section Card ─────────────────────────────────────────────────────────────
function SectionCard({ section, connectedOnlyLabel }: { section: HelpSection; connectedOnlyLabel: string }) {
  const Icon = SECTION_ICONS[section.id] ?? HelpCircle;
  return (
    <div id={`help-${section.id}`} className="scroll-mt-2">
      <div className="flex items-start gap-3 mb-4">
        <div
          className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
          style={{ background: 'var(--ui-b07)' }}
        >
          <Icon className="w-4 h-4" style={{ color: 'var(--ui-t55)' }} />
        </div>
        <div className="flex-1 min-w-0">
          <h2 className="text-sm font-semibold leading-snug" style={{ color: 'var(--ui-t90)' }}>
            {section.title}
          </h2>
          {section.connectedOnly && (
            <span
              className="inline-block mt-1 text-xs px-1.5 py-0.5 rounded"
              style={{ background: 'rgba(96,165,250,0.12)', color: '#60a5fa' }}
            >
              {connectedOnlyLabel}
            </span>
          )}
        </div>
      </div>
      <div className="space-y-3">
        {section.content.map((block, i) => renderBlock(block, i))}
      </div>
    </div>
  );
}

// ─── Help Page ────────────────────────────────────────────────────────────────
export default function HelpPage() {
  const { t } = useTranslation('help');
  const { license } = useLicense();
  const isConnected = license?.mode === 'connected';
  const [search, setSearch] = useState('');
  const [activeId, setActiveId] = useState('intro');
  const contentRef = useRef<HTMLDivElement>(null);
  const navRef     = useRef<HTMLElement>(null);

  const allSections = t('sections', { returnObjects: true }) as HelpSection[];

  const visibleSections = allSections.filter(s => {
    if (s.connectedOnly && !isConnected) return false;
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return (
      s.title.toLowerCase().includes(q) ||
      s.content.some(b => {
        if (b.type === 'text')    return b.text.toLowerCase().includes(q);
        if (b.type === 'list')    return b.items.some(i => i.toLowerCase().includes(q));
        if (b.type === 'steps')   return b.steps.some(s => s.toLowerCase().includes(q));
        if (b.type === 'tip' || b.type === 'warning') return b.text.toLowerCase().includes(q);
        if (b.type === 'table')   return b.rows.some(r => r.some(c => c.toLowerCase().includes(q)));
        return false;
      })
    );
  });

  // Scroll-spy: activa o item do menu cuja secção está mais ao centro da área de conteúdo
  useEffect(() => {
    if (search.trim() || !contentRef.current) return;
    const root = contentRef.current;

    function onScroll() {
      const rootRect = root.getBoundingClientRect();
      const centerY  = rootRect.top + rootRect.height * 0.5;
      let bestId   = visibleSections[0]?.id;
      // Última secção cujo topo passou o centro — é a que o utilizador está a ler
      for (const s of visibleSections) {
        const el = document.getElementById(`help-${s.id}`);
        if (!el) continue;
        if (el.getBoundingClientRect().top <= centerY) bestId = s.id;
      }
      if (bestId) setActiveId(bestId);
    }

    root.addEventListener('scroll', onScroll, { passive: true });
    onScroll(); // estado inicial
    return () => root.removeEventListener('scroll', onScroll);
  }, [visibleSections, search]);

  // Keep the active TOC item visible in the sidebar nav
  useEffect(() => {
    if (!navRef.current) return;
    const btn = navRef.current.querySelector<HTMLElement>(`[data-section="${activeId}"]`);
    btn?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }, [activeId]);

  const scrollTo = useCallback((id: string) => {
    setActiveId(id);
    const el = document.getElementById(`help-${id}`);
    if (el && contentRef.current) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, []);

  const connectedOnlyLabel = t('connectedOnly');
  const searchPlaceholder  = t('search.placeholder');
  const noResultsPrefix    = t('noResults');
  const footerText         = t('footer');

  return (
    <div className="flex h-full overflow-hidden">

      {/* ── TOC Sidebar ── */}
      <div
        className="w-52 flex-shrink-0 flex flex-col overflow-hidden"
        style={{ borderRight: '1px solid var(--ui-b06)' }}
      >
        <div className="p-2.5" style={{ borderBottom: '1px solid var(--ui-b06)' }}>
          <div className="relative">
            <Search
              className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 pointer-events-none"
              style={{ color: 'var(--ui-t28)' }}
            />
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder={searchPlaceholder}
              className="w-full rounded-lg pl-8 pr-3 py-1.5 text-xs outline-none"
              style={{
                background: 'var(--ui-b05)',
                border: '1px solid var(--ui-b07)',
                color: 'var(--ui-t85)',
              }}
            />
          </div>
        </div>

        <nav ref={navRef} className="flex-1 overflow-y-auto py-1.5 space-y-0.5 px-1.5">
          {visibleSections.map(s => {
            const Icon = SECTION_ICONS[s.id] ?? HelpCircle;
            const isActive = activeId === s.id && !search;
            return (
              <button
                key={s.id}
                data-section={s.id}
                onClick={() => scrollTo(s.id)}
                className="w-full flex items-center gap-2 px-2.5 py-1.5 text-xs text-left rounded-lg transition-colors"
                style={{
                  background:  isActive ? 'var(--ui-b08)' : 'transparent',
                  color:       isActive ? 'var(--ui-t90)' : 'var(--ui-t45)',
                  fontWeight:  isActive ? 500 : 400,
                }}
                onMouseEnter={e => {
                  if (!isActive) (e.currentTarget as HTMLButtonElement).style.background = 'var(--ui-b04)';
                }}
                onMouseLeave={e => {
                  if (!isActive) (e.currentTarget as HTMLButtonElement).style.background = 'transparent';
                }}
              >
                <Icon className="w-3.5 h-3.5 shrink-0" />
                <span className="truncate leading-snug">{s.title}</span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* ── Content ── */}
      <div ref={contentRef} className="flex-1 overflow-y-auto">
        <div className="max-w-2xl px-8 py-6 space-y-10">
          {visibleSections.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 gap-3">
              <HelpCircle className="w-9 h-9" style={{ color: 'var(--ui-t15)' }} />
              <p className="text-sm" style={{ color: 'var(--ui-t35)' }}>
                {noResultsPrefix} <em>"{search}"</em>
              </p>
            </div>
          ) : (
            visibleSections.map((section, i) => (
              <React.Fragment key={section.id}>
                <SectionCard section={section} connectedOnlyLabel={connectedOnlyLabel} />
                {i < visibleSections.length - 1 && (
                  <hr style={{ borderColor: 'var(--ui-b05)' }} />
                )}
              </React.Fragment>
            ))
          )}

          <div className="pt-2 pb-6 flex items-center gap-2" style={{ color: 'var(--ui-t20)' }}>
            <Info className="w-3.5 h-3.5 shrink-0" />
            <span className="text-xs">{footerText}</span>
          </div>
        </div>
      </div>

    </div>
  );
}
