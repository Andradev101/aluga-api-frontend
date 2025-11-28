import {
  AlertDialog,
  AlertDialogBackdrop,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogHeader
} from '@/components/ui/alert-dialog';
import { Box } from '@/components/ui/box';
import { Button, ButtonGroup, ButtonSpinner, ButtonText } from '@/components/ui/button';
import { Heading } from '@/components/ui/heading';
import { Icon, InfoIcon, TrashIcon } from '@/components/ui/icon';
import React from 'react';
import { Alert, AlertIcon, AlertText } from './ui/alert';


interface AlertComponentProps {
  content: any;
  children: (openAlert: () => void) => React.ReactNode;
  onCloseCallback?: () => void
}

export function AlertComponent({ content, children, onCloseCallback}: AlertComponentProps) {
  const [showAlertDialog, setShowAlertDialog] = React.useState(false);
  const [actionTaken, setActionTaken] = React.useState(false);
  const handleOpen = () => setShowAlertDialog(true);
  function handleClose() {
    setShowAlertDialog(false)
    setIsLoading(false)
    setShowIntegrationFeedback("")
    if(onCloseCallback && actionTaken) onCloseCallback()
  }

  const [isLoading, setIsLoading] = React.useState(false);
  const [showIntegrationFeedback, setShowIntegrationFeedback] = React.useState("");

  async function handleDeleteUser(payload: any) {
    setIsLoading(true)
    let res = await performDeleteUserCallout(payload)
    let resBody = await res.json()
    if(res.ok) {
      setActionTaken(true)
      setShowIntegrationFeedback(resBody.message)
    } else {
      setShowIntegrationFeedback("ERROR: " + resBody.detail)
    }
    setIsLoading(false)
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
          { showIntegrationFeedback !== "" &&
            <Alert action={showIntegrationFeedback.toLowerCase().includes("error") ? "error": "success"} variant="solid">
            <AlertIcon as={InfoIcon} />
            <AlertText>{showIntegrationFeedback !== null ? showIntegrationFeedback : "Unexpected error"}</AlertText>
          </Alert>}
          <AlertDialogHeader className="gap-2">
            <Heading size="md" className="place-self-center">Delete {content.userName} user account?</Heading>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <ButtonGroup flexDirection="column" className="w-full gap-2">
              <Button
                size="xl"
                action="negative"
                onPress={() => handleDeleteUser(content)}
                isDisabled={isLoading}
              >
                <ButtonText>Delete</ButtonText>
                {isLoading && <ButtonSpinner size="small" color="white"/>}
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