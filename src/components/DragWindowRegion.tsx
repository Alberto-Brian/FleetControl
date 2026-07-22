import { closeWindow, maximizeWindow, minimizeWindow } from "@/helpers/window-helpers";
import React, { useState, useEffect, type ReactNode } from "react";

interface DragWindowRegionProps {
    title?:        ReactNode;
    dark?:         boolean;
    leftContent?:  ReactNode;
    rightContent?: ReactNode;
}

function WinBtn({
    title, onClick, closeBtn = false, dark = false, children,
}: {
    title: string; onClick: () => void; closeBtn?: boolean; dark?: boolean; children: ReactNode;
}) {
    const [hovered, setHovered] = useState(false);

    const bg = hovered
        ? closeBtn
            ? 'rgba(196,43,28,0.95)'
            : dark ? 'rgba(255,255,255,0.10)' : 'rgba(0,0,0,0.07)'
        : 'transparent';

    const color = hovered
        ? closeBtn ? '#fff' : dark ? 'rgba(255,255,255,0.9)' : 'rgba(0,0,0,0.75)'
        : dark ? 'rgba(255,255,255,0.50)' : 'rgba(0,0,0,0.45)';

    return (
        <button
            type="button"
            title={title}
            onMouseEnter={() => setHovered(true)}
            onMouseLeave={() => setHovered(false)}
            onClick={onClick}
            style={{
                width: 42, height: '100%', minHeight: 28,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                background: bg, color,
                border: 'none', cursor: 'default',
                borderRadius: closeBtn ? '0 4px 4px 0' : 0,
                transition: 'background 0.12s, color 0.12s',
                flexShrink: 0,
            }}
        >
            {children}
        </button>
    );
}

export default function DragWindowRegion({
    title,
    dark = false,
    leftContent,
    rightContent,
}: DragWindowRegionProps) {
    // Detecta o tema actual e actualiza quando muda
    const [isSystemDark, setIsSystemDark] = useState(() =>
        document.documentElement.classList.contains('dark')
    );

    useEffect(() => {
        const observer = new MutationObserver(() => {
            setIsSystemDark(document.documentElement.classList.contains('dark'));
        });
        observer.observe(document.documentElement, { attributeFilter: ['class'] });
        return () => observer.disconnect();
    }, []);

    // Em modo conectado (dark=true) força sempre dark; caso contrário segue o tema
    const effectiveDark = dark || isSystemDark;

    const bg    = effectiveDark ? 'rgba(6,10,22,0.98)'      : 'rgba(228,231,240,0.98)';
    const color = effectiveDark ? 'rgba(255,255,255,0.55)'  : 'rgba(0,0,0,0.5)';

    return (
        <div
            id="drag-window-region"
            className="flex w-screen flex-row-reverse items-stretch select-none"
            style={{ background: bg }}
        >
            {/* Botões de janela — direita */}
            <div className="flex items-stretch flex-shrink-0">
                <WinBtn title="Minimize" onClick={minimizeWindow} dark={effectiveDark}>
                    <svg width="11" height="11" viewBox="0 0 12 12" aria-hidden>
                        <rect fill="currentColor" width="10" height="1" x="1" y="6" />
                    </svg>
                </WinBtn>
                <WinBtn title="Maximize" onClick={maximizeWindow} dark={effectiveDark}>
                    <svg width="11" height="11" viewBox="0 0 12 12" aria-hidden>
                        <rect width="9" height="9" x="1.5" y="1.5" fill="none" stroke="currentColor" strokeWidth="1.1" />
                    </svg>
                </WinBtn>
                <WinBtn title="Close" onClick={closeWindow} closeBtn dark={effectiveDark}>
                    <svg width="11" height="11" viewBox="0 0 12 12" aria-hidden>
                        <polygon fill="currentColor" fillRule="evenodd"
                            points="11 1.576 6.583 6 11 10.424 10.424 11 6 6.583 1.576 11 1 10.424 5.417 6 1 1.576 1.576 1 6 5.417 10.424 1" />
                    </svg>
                </WinBtn>
            </div>

            {/* Conteúdo direito — imediatamente à esquerda dos botões */}
            {rightContent && (
                <div
                    className="flex items-center flex-shrink-0"
                    style={{ paddingLeft: 12, paddingRight: 12 }}
                >
                    {rightContent}
                </div>
            )}

            {/* Área arrastável */}
            <div className="draglayer w-full" />

            {/* Conteúdo esquerdo: título sempre visível; leftContent usado quando não há título */}
            {title ? (
                <div
                    className="flex flex-1 items-center whitespace-nowrap px-3"
                    style={{ fontSize: 12, color, fontWeight: 500 }}
                >
                    {String(title)}
                </div>
            ) : effectiveDark && leftContent ? (
                <div className="flex items-center flex-shrink-0">{leftContent}</div>
            ) : null}
        </div>
    );
}
