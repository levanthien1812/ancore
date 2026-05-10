import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import TalkHistory from "@/components/talk/talk-history";
import TalkInterface from "@/components/talk/talk-interface";

const TalkPage = () => {
  return (
    <div className="w-full max-w-[500px] mx-auto py-2 px-2 sm:px-4 md:px-0 h-full">
      <Tabs defaultValue="chat" className="h-full flex flex-col gap-4">
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
          <TalkInterface />
        </TabsContent>

        <TabsContent value="history" className="flex-1 overflow-hidden">
          <TalkHistory />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default TalkPage;
