import React from "react";
import DragWindowRegion from "@/components/DragWindowRegion";
import { Toaster } from "@/components/ui/toaster";

export default function BaseLayout({ children }: { children: React.ReactNode }) {
    return (
        <div className="flex flex-col h-screen overflow-hidden">
            <DragWindowRegion title="FleetFlow"/>
            <main className="flex-1 overflow-hidden">{children}</main>
            <Toaster/>
        </div>
    );
}