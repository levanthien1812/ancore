import React from "react";
import { Alert, AlertDescription, AlertTitle } from "../ui/alert";
import { ActionState } from "@/lib/type";
import { AlertCircleIcon, CheckCircle2Icon } from "lucide-react";

type Props = ActionState & { description?: string };

const ApiResponseStatus = (state: Props) => {
  return (
    <Alert variant={state.success ? "default" : "destructive"}>
      {state.success ? <CheckCircle2Icon /> : <AlertCircleIcon />}
      <AlertTitle>{state.message}</AlertTitle>
      {state.description && (
        <AlertDescription>{state.description}</AlertDescription>
      )}
    </Alert>
  );
};

export default ApiResponseStatus;
