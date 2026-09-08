import React from "react";
import { Alert, AlertDescription } from "../ui/alert";
import { AlertCircleIcon } from "lucide-react";
import { ActionState } from "@/lib/type";

type AlertMessageType = {
  data: ActionState;
  children?: React.ReactNode;
};

const AlertMessage = ({ data, children }: AlertMessageType) => {
  return (
    <>
      <AlertSuccessMessage data={data}>{children}</AlertSuccessMessage>
      <AlertErrorMessage data={data}>{children}</AlertErrorMessage>
    </>
  );
};

export default AlertMessage;

type AlertSuccessMessageProps = {
  data: ActionState;
  children?: React.ReactNode;
};

export const AlertSuccessMessage = ({
  data,
  children,
}: AlertSuccessMessageProps) => {
  return (
    <>
      {data.success && data.message && (
        <Alert variant="success">
          <AlertCircleIcon />
          <AlertDescription>
            {data.message}
            {children}
          </AlertDescription>
        </Alert>
      )}
    </>
  );
};

export const AlertErrorMessage = ({
  data,
  children,
}: AlertSuccessMessageProps) => {
  return (
    <>
      {!data.success && data.message && (
        <Alert variant="destructive">
          <AlertCircleIcon />
          <AlertDescription>
            {data.message}
            {children}
          </AlertDescription>
        </Alert>
      )}
    </>
  );
};



