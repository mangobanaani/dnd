"use client";

import { createContext, useContext, useState, ReactNode } from 'react';
import { Modal } from './modal';
import { Button } from './button';

interface ConfirmOptions {
  title?: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  confirmVariant?: 'primary' | 'danger';
}

interface ConfirmDialogContextType {
  confirm: (options: ConfirmOptions) => Promise<boolean>;
}

const ConfirmDialogContext = createContext<ConfirmDialogContextType | undefined>(undefined);

export function ConfirmDialogProvider({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const [options, setOptions] = useState<ConfirmOptions | null>(null);
  const [resolvePromise, setResolvePromise] = useState<((value: boolean) => void) | null>(null);

  const confirm = (opts: ConfirmOptions): Promise<boolean> => {
    setOptions(opts);
    setIsOpen(true);

    return new Promise<boolean>((resolve) => {
      setResolvePromise(() => resolve);
    });
  };

  const handleConfirm = () => {
    if (resolvePromise) {
      resolvePromise(true);
    }
    setIsOpen(false);
    setOptions(null);
    setResolvePromise(null);
  };

  const handleCancel = () => {
    if (resolvePromise) {
      resolvePromise(false);
    }
    setIsOpen(false);
    setOptions(null);
    setResolvePromise(null);
  };

  return (
    <ConfirmDialogContext.Provider value={{ confirm }}>
      {children}
      {options && (
        <Modal
          isOpen={isOpen}
          onClose={handleCancel}
          title={options.title || 'Confirm Action'}
        >
          <div className="space-y-6">
            <p className="text-[#fafafa]">{options.message}</p>
            <div className="flex gap-3 justify-end">
              <Button
                variant="secondary"
                onClick={handleCancel}
              >
                {options.cancelLabel || 'Cancel'}
              </Button>
              <Button
                variant={options.confirmVariant || 'primary'}
                onClick={handleConfirm}
              >
                {options.confirmLabel || 'Confirm'}
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </ConfirmDialogContext.Provider>
  );
}

export function useConfirm() {
  const context = useContext(ConfirmDialogContext);
  if (!context) {
    throw new Error('useConfirm must be used within a ConfirmDialogProvider');
  }
  return context;
}
