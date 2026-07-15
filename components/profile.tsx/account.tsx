import React from "react";
import { useFormContext } from "react-hook-form";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "../ui/button";
import { Separator } from "../ui/separator";
import { useMutation } from "@tanstack/react-query";
import { checkCurrentPassword } from "@/lib/actions/user.actions";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../ui/dialog";
import Image from "next/image";
import { useCurrentUser } from "@/lib/hooks/use-current-user";

const Account = () => {
  const { register, watch } = useFormContext();
  const { data: user } = useCurrentUser();
  const [isChangingPassword, setIsChangingPassword] = React.useState(false);
  const [isCorrectPassword, setIsCorrectPassword] = React.useState(false);
  const [isChecked, setIsChecked] = React.useState(false);
  const [previewImage, setPreviewImage] = React.useState<string | undefined>(
    user!.image || "",
  );

  const email = watch("email");

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setPreviewImage(URL.createObjectURL(file));
  };

  const { mutate: checkPassword, isPending: isVerifyingPassword } = useMutation(
    {
      mutationFn: (password: string) => checkCurrentPassword(password),
      mutationKey: ["checkCurrentPassword"],
      onSuccess: (data) => {
        setIsCorrectPassword(Boolean(data.isPasswordValid));
      },
      onSettled: () => {
        setIsChecked(true);
      },
    },
  );

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle>Account</CardTitle>
        <CardDescription>
          Update your account and email preferences
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid gap-1.5">
          <Label htmlFor="name">Name</Label>
          <Input id="name" type="text" {...register("name")} />
        </div>
        <div className="grid gap-1.5">
          <Label htmlFor="email">Email</Label>
          <Input id="email" type="email" {...register("email")} />
          {email !== user!.email && (
            <p className="text-xs text-muted-foreground italic text-end">
              You need to verify your new email address the next time you log in
            </p>
          )}
        </div>
        <div className="grid gap-1.5">
          <Label htmlFor="image">Image</Label>
          <Input
            id="image"
            type="file"
            {...register("image")}
            accept="image/*"
            onChange={handleImageChange}
          />
          {previewImage && (
            <Dialog>
              <DialogTrigger asChild>
                <Button variant={"link"} className="w-fit ms-auto">
                  See preview
                </Button>
              </DialogTrigger>
              <DialogContent className="w-fit">
                <DialogHeader>
                  <DialogTitle>Preview</DialogTitle>
                </DialogHeader>
                <Image
                  src={previewImage}
                  width={200}
                  height={200}
                  alt="Preview"
                  className="rounded-lg"
                />
              </DialogContent>
            </Dialog>
          )}
        </div>
        <Separator />
        {isChangingPassword ? (
          <>
            <p className="text-md">Change your password</p>
            <div className="grid gap-1.5">
              <Label htmlFor="password">Current Password</Label>
              <Input
                id="password"
                type="password"
                {...register("password")}
                onBlur={(e) => {
                  if (e.target.value.length < 1) return;
                  checkPassword(e.target.value);
                }}
              />
              {isVerifyingPassword && (
                <p className="text-end italic text-xs text-muted-foreground">
                  Verifying...
                </p>
              )}{" "}
              {isChecked && (
                <>
                  {isCorrectPassword ? (
                    <p className="text-end italic text-xs text-green-500">
                      Correct password
                    </p>
                  ) : (
                    <p className="text-end italic text-xs text-red-500">
                      Incorrect password
                    </p>
                  )}
                </>
              )}
            </div>

            <div className="grid gap-1.5">
              <Label htmlFor="newPassword">New Password</Label>
              <Input
                id="newPassword"
                type="password"
                {...register("newPassword")}
              />
            </div>
            <div className="grid gap-1.5">
              <Label htmlFor="confirmNewPassword">Confirm New Password</Label>
              <Input
                id="confirmNewPassword"
                type="password"
                {...register("confirmNewPassword")}
              />
            </div>
          </>
        ) : (
          <Button
            type="button"
            variant={"secondary"}
            onClick={() => setIsChangingPassword(true)}
          >
            Change password
          </Button>
        )}
      </CardContent>
    </Card>
  );
};

export default Account;
