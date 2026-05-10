"use client";
import React, { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import TalkHistory from "@/components/talk/talk-history";
import TalkInterface from "@/components/talk/talk-interface";
import { Message } from "@/lib/type";

const TalkPage = () => {
  const [activeTab, setActiveTab] = useState("chat");
  const [selectedMessages, setSelectedMessages] = useState<Message[] | null>(
    null,
  );
  const [activeSessionId, setActiveSessionId] = useState<string | undefined>();
  const [sessionKey, setSessionKey] = useState(0);

  const handleContinueSession = (sessionId: string, messages: Message[]) => {
    setSelectedMessages(messages);
    setActiveSessionId(sessionId);
    setSessionKey((prev) => prev + 1); // Force TalkInterface to re-mount with new messages
    setActiveTab("chat");
  };

  return (
    <div className="w-full max-w-[500px] mx-auto py-2 px-2 sm:px-4 md:px-0 h-full">
      <Tabs
        value={activeTab}
        onValueChange={setActiveTab}
        className="h-full flex flex-col gap-4"
      >
        <TabsList className="mx-auto">
          <TabsTrigger value="chat" className="text-sm">
            Tutor Chat
          </TabsTrigger>
          <TabsTrigger value="history" className="text-sm">
            Talk History
          </TabsTrigger>
        </TabsList>

        <TabsContent
          value="chat"
          className="flex-1 flex flex-col gap-4 min-h-0"
        >
          <TalkInterface
            key={sessionKey}
            initialMessages={selectedMessages || undefined}
            sessionId={activeSessionId}
          />
        </TabsContent>

        <TabsContent value="history" className="flex-1 overflow-hidden">
          <TalkHistory onContinue={handleContinueSession} />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default TalkPage;
