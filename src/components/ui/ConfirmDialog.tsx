'use client';

import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button3 } from '@/ui/components/Button3';
import { FeatherAlertTriangle } from '@subframe/core';

interface ConfirmDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  description: string;
}

export const ConfirmDialog = ({ isOpen, onClose, onConfirm, title, description }: ConfirmDialogProps) => {
  if (!isOpen) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 flex-none items-center justify-center rounded-full bg-destructive-100">
                <FeatherAlertTriangle className="h-6 w-6 text-destructive-600" />
            </div>
            <DialogTitle>{title}</DialogTitle>
          </div>
        </DialogHeader>
        <DialogDescription className="py-2 pl-[52px]">
          {description}
        </DialogDescription>
        <DialogFooter className="pl-[52px]">
          <Button3 variant="neutral-secondary" onClick={onClose}>
            Cancel
          </Button3>
          <Button3 variant="destructive-primary" onClick={onConfirm}>
            Delete
          </Button3>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}; 