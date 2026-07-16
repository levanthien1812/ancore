import React from "react";
import { Alert, AlertDescription } from "../ui/alert";
import { AlertCircleIcon } from "lucide-react";
import { ActionState } from "@/lib/type";

type AlertMessageType = {
  data: ActionState;
};

const AlertMessage = ({ data }: AlertMessageType) => {
  return (
    <>
      <AlertSuccessMessage data={data} />
      <AlertErrorMessage data={data} />
    </>
  );
};

export default AlertMessage;

type AlertSuccessMessageProps = {
  data: ActionState;
};

export const AlertSuccessMessage = ({ data }: AlertSuccessMessageProps) => {
  return (
    <>
      {data.success && data.message && (
        <Alert variant="success">
          <AlertCircleIcon />
          <AlertDescription>{data.message}</AlertDescription>
        </Alert>
      )}
    </>
  );
};

export const AlertErrorMessage = ({ data }: AlertSuccessMessageProps) => {
  return (
    <>
      {!data.success && data.message && (
        <Alert variant="destructive">
          <AlertCircleIcon />
          <AlertDescription>{data.message}</AlertDescription>
        </Alert>
      )}
    </>
  );
};
