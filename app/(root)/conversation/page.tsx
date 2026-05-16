import React from "react";
import ConversationHistory from "@/components/conversations/conversation-history";
import NewConversation from "@/components/conversations/new-conversation";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const ConversationSelfTalkPage = () => {
  return (
    <div className="w-full max-w-[520px] mx-auto py-2 px-2 sm:px-4 flex flex-col h-full">
      <Tabs defaultValue="start" className="h-full flex flex-col">
        <TabsList className="mx-auto sticky">
          <TabsTrigger value="start" className="text-sm">
            Generate
          </TabsTrigger>
          <TabsTrigger value="history" className="text-sm">
            History
          </TabsTrigger>
        </TabsList>
        <TabsContent value="start" className="flex-1">
          <NewConversation />
        </TabsContent>
        <TabsContent value="history" className="flex-1">
          <ConversationHistory />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ConversationSelfTalkPage;
