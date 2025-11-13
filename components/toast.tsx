import { Button, ButtonText } from '@/components/ui/button';
import {
  Toast,
  ToastDescription,
  ToastTitle,
  useToast,
} from '@/components/ui/toast';
import React from 'react';

export function ToastComponent() {
  const toast = useToast();
  const [toastId, setToastId] = React.useState("");
  const handleToast = () => {
    if (!toast.isActive(toastId)) {
      showNewToast();
      
    }
  };
  const showNewToast = () => {
    const newId = Math.random();
    setToastId(String(newId));
    toast.show({
      id: String(newId),
      placement: 'bottom',
      duration: 3000,
      render: ({ id }) => {
        const uniqueToastId = 'toast-' + id;
        return (
          <Toast nativeID={uniqueToastId} action="warning" variant="solid">
            <ToastTitle>Hello!</ToastTitle>
            <ToastDescription>
              This is a customized toast message.
            </ToastDescription>
          </Toast>
        );
      },
    });
  };
  return (
    <Button onPress={handleToast}>
      <ButtonText>Press Me</ButtonText>
    </Button>
  );
}
