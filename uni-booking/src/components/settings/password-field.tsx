"use client";

import { Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { UseFormRegister } from "react-hook-form";
import type { PasswordFormData } from "@/components/settings/settings-schemas";

export function PasswordField({
  id,
  label,
  placeholder,
  visible,
  onToggleVisible,
  errorMessage,
  registration,
}: {
  id: keyof PasswordFormData;
  label: string;
  placeholder: string;
  visible: boolean;
  onToggleVisible: () => void;
  errorMessage?: string;
  registration: UseFormRegister<PasswordFormData>;
}) {
  return (
    <div className='space-y-2'>
      <Label htmlFor={id}>{label}</Label>
      <div className='relative'>
        <Input
          id={id}
          type={visible ? "text" : "password"}
          placeholder={placeholder}
          {...registration(id)}
        />
        <Button
          type='button'
          variant='ghost'
          size='sm'
          className='absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent'
          onClick={onToggleVisible}
        >
          {visible ? (
            <EyeOff className='h-4 w-4 text-muted-foreground' />
          ) : (
            <Eye className='h-4 w-4 text-muted-foreground' />
          )}
          <span className='sr-only'>
            {visible ? "Hide password" : "Show password"}
          </span>
        </Button>
      </div>
      {errorMessage ? (
        <p className='text-sm text-destructive'>{errorMessage}</p>
      ) : null}
    </div>
  );
}
