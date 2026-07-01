import { useEffect, useState } from "react";
import { Lightbulb } from "lucide-react";
import { Badge } from "../ui/badge";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../ui/dialog";
import Link from "next/link";
// Do not try to optimize these imports by moving them to the top level, otherwise it will break the video loading
// Instead of importing the videos directly, we will load them dynamically when the component is mounted to avoid increasing the initial bundle size
// import copyWordCambridge from "@/public/videos/copy-word-cambridge.mp4";
// import pasteWordCambridge from "@/public/videos/paste-word-cambridge.mp4";

const TIPS_SEEN_KEY = "ancore_paste_tips_seen";

const PasteWordTips = () => {
  const [hasSeenTips, setHasSeenTips] = useState(
    !!localStorage.getItem(TIPS_SEEN_KEY),
  );

  const handleMarkAsSeen = () => {
    localStorage.setItem(TIPS_SEEN_KEY, "true");
    setHasSeenTips(true);
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Badge
          variant="outline"
          className="flex items-center gap-1 h-fit bg-yellow-50 cursor-pointer border-yellow-200 text-yellow-800 hover:bg-yellow-100 relative overflow-visible"
          title="Tips"
        >
          {!hasSeenTips && (
            <span className="absolute -top-1 -right-1 flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-yellow-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-yellow-500"></span>
            </span>
          )}
          <Lightbulb width={14} height={14} className="text-yellow-500" />
          {!hasSeenTips && <span>Tips</span>}
        </Badge>
      </DialogTrigger>
      <DialogContent className="w-full">
        <DialogHeader>
          <DialogTitle className="text-lg font-semibold">
            How to Paste Words
          </DialogTitle>
          <DialogDescription className="text-sm text-muted-foreground">
            Ancore supports pasting Cambridge words directly from your
            clipboard. This is a quick and easy way to add new words to your
            vocabulary list without having to type them out manually.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 max-h-[500px] overflow-y-auto custom-scrollbar p-2">
          <div>
            <h4 className="font-medium">1. Copy a Word</h4>
            <p className="text-sm text-muted-foreground">
              Select and copy a word from{" "}
              <Link
                href="https://dictionary.cambridge.org/"
                target="_blank"
                className="underline text-primary"
              >
                Cambridge dictionary
              </Link>
            </p>
            <video
              src={"/videos/copy-word-cambridge.mp4"}
              controls
              className="w-full mt-2"
            />
          </div>
          <div>
            <h4 className="font-medium">2. Paste the Word</h4>
            <p className="text-sm text-muted-foreground">
              Paste the copied word into the input field.
            </p>
            <video
              src={"/videos/paste-word-cambridge.mp4"}
              controls
              className="w-full mt-2"
            />
          </div>
          <div>
            <h4 className="font-medium">3. Review and Save</h4>
            <p className="text-sm text-muted-foreground">
              Review the word details and click &quot;Save&quot; to add it to
              your vocabulary list.
            </p>
          </div>
        </div>
        <DialogFooter>
          <DialogClose className="ml-auto" onClick={handleMarkAsSeen}>
            Got it!
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default PasteWordTips;
