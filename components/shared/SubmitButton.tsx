"use client";

import { useFormStatus } from "react-dom";
import { Loader2 } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "../ui/button";

interface Props {
  text: string;
  classname?: string;
  variant?:
    | "default"
    | "destructive"
    | "outline"
    | "secondary"
    | "ghost"
    | "link"
    | null
    | undefined;
}

const SubmitButton = ({ text, classname, variant }: Props) => {
  const { pending } = useFormStatus();

  return (
    <>
      {pending ? (
        <Button disabled className={cn("w-fit", classname)} variant={variant}>
          <Loader2 className="mr-2 size-4 animate-spin" />
          Please Wait...
        </Button>
      ) : (
        <Button
          className={cn("w-fit cursor-pointer", classname)}
          variant={variant}
          type="submit"
        >
          {text}
        </Button>
      )}
    </>
  );
};

export default SubmitButton;
