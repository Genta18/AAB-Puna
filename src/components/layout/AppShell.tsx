"use client";

import { ReactNode, useState } from "react";
import { Header } from "./Header";
import { Sidebar } from "./Sidebar";
import type { SidebarItemData } from "./sidebarItems";
import { ChatBot } from "@/components/chat/ChatBot";

interface AppShellProps {
  sidebarItems: SidebarItemData[];
  children: ReactNode;
  suffix?: string;
  rightExtras?: ReactNode;
}

export function AppShell({ sidebarItems, children, suffix, rightExtras }: AppShellProps) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Header
        suffix={suffix}
        rightExtras={rightExtras}
        onHamburger={() => setOpen((o) => !o)}
      />
      <div className="app-layout">
        <Sidebar items={sidebarItems} open={open} />
        <main className="main-content">{children}</main>
      </div>
      <ChatBot />
    </>
  );
}
