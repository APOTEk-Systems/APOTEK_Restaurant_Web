import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { ButtonHTMLAttributes, forwardRef } from "react";

export interface ConfirmDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title?: string;
  description?: string;
  confirmText?: string;
  cancelText?: string;
  variant?: "default" | "destructive";
  onConfirm: () => void;
  isLoading?: boolean;
}

export const ConfirmDialog = forwardRef<HTMLButtonElement, ConfirmDialogProps>(
  (
    {
      open,
      onOpenChange,
      title = "Confirm Action",
      description = "Are you sure you want to proceed? This action cannot be undone.",
      confirmText = "Confirm",
      cancelText = "Cancel",
      variant = "default",
      onConfirm,
      isLoading = false,
    },
    ref
  ) => {
    return (
      <AlertDialog open={open} onOpenChange={onOpenChange}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{title}</AlertDialogTitle>
            <AlertDialogDescription>{description}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isLoading}>{cancelText}</AlertDialogCancel>
            <AlertDialogAction
              ref={ref}
              onClick={(e) => {
                e.preventDefault();
                onConfirm();
              }}
              disabled={isLoading}
              className={
                variant === "destructive"
                  ? "bg-destructive text-destructive-foreground hover:bg-destructive/90"
                  : undefined
              }
            >
              {isLoading ? "Loading..." : confirmText}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    );
  }
);

ConfirmDialog.displayName = "ConfirmDialog";