"use client";

import dynamic from "next/dynamic";

const LiveChat = dynamic(() => import("./LiveChat"), { ssr: false });

export default function LiveChatWrapper() {
    return <LiveChat />;
}
