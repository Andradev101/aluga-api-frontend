import {
  AlertDialog,
  AlertDialogBackdrop,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogHeader
} from '@/components/ui/alert-dialog';
import { Box } from '@/components/ui/box';
import { Button, ButtonGroup, ButtonText } from '@/components/ui/button';
import { Heading } from '@/components/ui/heading';
import { Icon, TrashIcon } from '@/components/ui/icon';
import React from 'react';

interface AlertComponentProps {
  content: any;
  children: (openAlert: () => void) => React.ReactNode;
}

export function AlertComponent({ content, children }: AlertComponentProps) {
  const [showAlertDialog, setShowAlertDialog] = React.useState(false);
  const handleOpen = () => setShowAlertDialog(true);
  const handleClose = () => setShowAlertDialog(false);
  
  async function handleDeleteUser(payload: any) {
    let res = await performDeleteUserCallout(payload)
    if(res.ok) {
      console.log(await res.json())
    }
  }
  return (
    <>
      {children(handleOpen)}

      <AlertDialog isOpen={showAlertDialog} onClose={handleClose}>
        <AlertDialogBackdrop />
        <AlertDialogContent className="w-full max-w-[415px] gap-2">
          <Box className="h-[52px] w-[52px] bg-background-error items-center place-self-center justify-center">
            <Icon as={TrashIcon} size="lg" className="stroke-error-500" />
          </Box>

          <AlertDialogHeader className="gap-2">
            <Heading size="md" className="place-self-center">Delete {content.userName} user account?</Heading>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <ButtonGroup flexDirection="column" className="w-full gap-2">
              <Button
                size="xl"
                action="negative"
                onPress={() => handleDeleteUser(content)}
              >
                <ButtonText>Delete</ButtonText>
              </Button>
              <Button
                variant="solid"
                action="secondary"
                onPress={handleClose}
                size="xl"
              >
                <ButtonText>Cancel</ButtonText>
              </Button>
            </ButtonGroup>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

async function performDeleteUserCallout(payload:any) {
  const url = `${process.env.EXPO_PUBLIC_API_URL}/users/${payload.userName}`;
  const options = {
    method: 'DELETE',
    credentials: 'include' as RequestCredentials,
    headers: {'content-type': 'application/json'},
  };
  let response = await fetch(url, options);
  return response
}