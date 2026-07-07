import React from "react";
import DragWindowRegion from "@/components/DragWindowRegion";
import { useLicense } from "@/hooks/useLicense";

export default function BaseLayout({ children }: { children: React.ReactNode }) {
    const { license } = useLicense();
    const isMapMode = license?.isValid && license.mode === 'connected';

    return (
        <div className="flex flex-col h-screen overflow-hidden">
            <DragWindowRegion title="FleetControl" dark={isMapMode} />
            <main className="flex-1 overflow-hidden">{children}</main>
        </div>
    );
}
