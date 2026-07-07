import { closeWindow, maximizeWindow, minimizeWindow } from "@/helpers/window-helpers";
import React, { type ReactNode } from "react";

interface DragWindowRegionProps {
    title?: ReactNode;
    dark?:  boolean;  // true em modo mapa (fundo escuro, botões brancos)
}

export default function DragWindowRegion({ title, dark = false }: DragWindowRegionProps) {
    const btnBase = `p-2 transition-colors`;
    const btnStyle = dark
        ? { color: 'rgba(255,255,255,0.55)' }
        : {};
    const hoverClose = dark ? 'hover:bg-red-600/70' : 'hover:bg-red-300';
    const hoverOther = dark ? 'hover:bg-white/10'   : 'hover:bg-slate-300';

    return (
        <div
            id="drag-window-region"
            className="flex w-screen flex-row-reverse items-stretch"
            style={dark ? { background: 'rgba(10,17,32,0.97)', borderBottom: '1px solid rgba(255,255,255,0.06)' } : {}}
        >
            <div className="flex">
                <button
                    title="Minimize"
                    type="button"
                    className={`${btnBase} ${hoverOther}`}
                    style={btnStyle}
                    onClick={minimizeWindow}
                >
                    <svg aria-hidden="true" role="img" width="12" height="12" viewBox="0 0 12 12">
                        <rect fill="currentColor" width="10" height="1" x="1" y="6" />
                    </svg>
                </button>
                <button
                    title="Maximize"
                    type="button"
                    className={`${btnBase} ${hoverOther}`}
                    style={btnStyle}
                    onClick={maximizeWindow}
                >
                    <svg aria-hidden="true" role="img" width="12" height="12" viewBox="0 0 12 12">
                        <rect width="9" height="9" x="1.5" y="1.5" fill="none" stroke="currentColor" />
                    </svg>
                </button>
                <button
                    type="button"
                    title="Close"
                    className={`${btnBase} ${hoverClose}`}
                    style={btnStyle}
                    onClick={closeWindow}
                >
                    <svg aria-hidden="true" role="img" width="12" height="12" viewBox="0 0 12 12">
                        <polygon
                            fill="currentColor"
                            fillRule="evenodd"
                            points="11 1.576 6.583 6 11 10.424 10.424 11 6 6.583 1.576 11 1 10.424 5.417 6 1 1.576 1.576 1 6 5.417 10.424 1"
                        />
                    </svg>
                </button>
            </div>
            <div className="draglayer w-full" />
            {title && !dark && (
                <div className="flex flex-1 items-center justify-center whitespace-nowrap p-2 text-xs text-gray-400 select-none">
                    {title}
                </div>
            )}
        </div>
    );
}
