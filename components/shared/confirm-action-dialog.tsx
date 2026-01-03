import React from "react";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTrigger,
  DialogTitle,
} from "../ui/dialog";
import { Button } from "../ui/button";
import ApiResponseStatus from "./api-response-status";

type Props = {
  showDialog: boolean;
  setShowDialog: React.Dispatch<React.SetStateAction<boolean>>;
  handleDelete: (event: React.FormEvent<HTMLFormElement>) => void;
  message: string;
  children: React.ReactNode;
  isLoading?: boolean;
  title: string;
  triggerButton: React.ReactNode;
  actionText?: string;
};

const ConfirmActionDialog = ({
  showDialog,
  setShowDialog,
  handleDelete,
  message,
  children,
  isLoading,
  title,
  triggerButton,
  actionText,
}: Props) => {
  return (
    <Dialog open={showDialog} onOpenChange={setShowDialog}>
      <DialogTrigger asChild>{triggerButton}</DialogTrigger>
      <DialogContent>
        <form onSubmit={handleDelete}>
          <DialogHeader>
            <DialogTitle>{title}</DialogTitle>
          </DialogHeader>
          {message && <ApiResponseStatus success={false} message={message} />}

          {children}
          <DialogFooter>
            <DialogClose asChild>
              <Button
                type="button"
                variant={"secondary"}
                onClick={() => setShowDialog(false)}
              >
                Cancel
              </Button>
            </DialogClose>

            <Button type="submit" variant={"destructive"} disabled={isLoading}>
              {actionText}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default ConfirmActionDialog;
