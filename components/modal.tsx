import { Alert, AlertIcon, AlertText } from "@/components/ui/alert";
import {
  Button,
  ButtonGroup,
  ButtonSpinner,
  ButtonText,
} from "@/components/ui/button";
import { Heading } from "@/components/ui/heading";
import { CloseIcon, Icon, InfoIcon } from "@/components/ui/icon";
import { Input, InputField } from "@/components/ui/input";
import {
  Modal,
  ModalBackdrop,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
} from "@/components/ui/modal";
import { Text } from "@/components/ui/text";
import React, { useState } from "react";
import { Platform } from "react-native";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";

export default function ModalComponent({
  content,
  buttonName,
  variant,
}: {
  content: any;
  buttonName: string;
  variant: "admin" | "self";
}) {
  const [isFormEditable, setIsFormEditable] = useState(false);
  const [isIntegrationLoading, setIsIntegrationLoading] = useState(false);
  const [updateUserCalloutLoadingMessage, setUpdateUserCalloutLoadingMessage] =
    useState("");
  const [modalTitle, setModalTitle] = useState("");
  const [showModal, setModalVisible] = useState(false);
  let backupContent = content;
  //this could be done using a context-based backend callout
  const formFieldsByVariant: Record<"admin" | "self", string[]> = {
    admin: [
      "userName",
      "password",
      "birthDate",
      "emailAddress",
      "phoneNumber",
      "firstName",
      "lastName",
      "address",
    ],
    self: ["emailAddress", "phoneNumber"],
  };
  // console.log("Modal variant:", variant);
  // const initialForm = formFieldsByVariant[variant].reduce(
  //   (acc, key) => {
  //     acc[key] = { value: content[key] ?? "", isTouched: false };
  //     return acc;
  //   },
  //   {} as Record<string, { value: any; isTouched: boolean }>
  // );
  const [form, setForm] = React.useState(() => {
    const variantFields =
      formFieldsByVariant[variant] ?? formFieldsByVariant["admin"];
    return variantFields.reduce((acc, key) => {
      acc[key] = { value: content[key] ?? "", isTouched: false };
      return acc;
    }, {} as Record<string, { value: any; isTouched: boolean }>);
  });
  type FormField = keyof typeof form;
  const fields: FormField[] = Object.keys(form) as FormField[];

  async function handleUpdateUserCallout() {
    setIsIntegrationLoading(true);

    const processResponse = async (res: Response) => {
      const body = await res.json();

      if (res.ok) {
        setUpdateUserCalloutLoadingMessage(body.message);
      } else {
        const errors = body.detail?.map((x: any) => x.loc?.[0]) ?? [];
        setUpdateUserCalloutLoadingMessage(
          `ERROR: Please check these fields: [${errors.join(", ")}]`
        );
      }
    };

    try {
      let res;
      if (variant === "self") res = await performUpdateUserSelfInfoCallout(form);
      else res = await performUpdateUserInfoCallout(form);
      await processResponse(res);
    } catch (error) {
      console.error(error);
      setUpdateUserCalloutLoadingMessage("An unexpected error occurred.");
    } finally {
      setIsIntegrationLoading(false);
    }
  }

  //open close modal
  function handleOpenModal() {
    setModalVisible(true);
    setModalEditable(false);
    setModalTitle(`User Details`);
  }
  function handleCloseModal() {
    setModalVisible(false);
    setModalEditable(false);
    setIsIntegrationLoading(false);
    setUpdateUserCalloutLoadingMessage("");
    setModalTitle(`User Details`);
    resetFields();
  }

  //states
  function handleEditState() {
    setModalTitle(`Edit user`);
    setModalEditable(true);
  }

  function handleRemoveAction() {
    //
  }
  function handleCancelEditState() {
    setModalEditable(false);
    setIsIntegrationLoading(false);
    setUpdateUserCalloutLoadingMessage("");
    setModalTitle(`User Details`);
    resetFields();
  }

  //helpers
  function resetFields() {
    fields.map((field) => {
      form[field].value = backupContent[field];
    });
  }
  function setModalEditable(value: boolean) {
    setIsFormEditable(value);
  }
  function logForm() {
    console.log(form);
  }
  return (
    <SafeAreaProvider>
      <SafeAreaView>
        <Button onPress={handleOpenModal}>
          <ButtonText>{buttonName ? buttonName : "Details"}</ButtonText>
        </Button>
      </SafeAreaView>

      <Modal
        isOpen={showModal}
        onClose={handleCloseModal}
        size={Platform.OS === "web" ? "md" : "full"}
      >
        <ModalBackdrop />
        <ModalContent>
          <ModalHeader>
            <Heading size="2xl">{modalTitle}</Heading>
            <ModalCloseButton>
              <Icon as={CloseIcon} />
            </ModalCloseButton>
          </ModalHeader>
          <ModalBody>
            {!!updateUserCalloutLoadingMessage && (
              <Alert
                action={
                  updateUserCalloutLoadingMessage
                    .toLowerCase()
                    .includes("error")
                    ? "error"
                    : "success"
                }
                variant="solid"
              >
                <AlertIcon as={InfoIcon} />
                <AlertText>{updateUserCalloutLoadingMessage}</AlertText>
              </Alert>
            )}
            {fields.map((field, index) => (
              <>
                <Text key={`text-${index}`}>{field}</Text>
                <Input
                  key={`input-${index}`}
                  variant="outline"
                  size="sm"
                  className="w-full"
                  isDisabled={!isFormEditable}
                  isInvalid={false}
                  isReadOnly={false}
                >
                  <InputField
                    key={`inputfield-${index}`}
                    value={form[field].value}
                    onChangeText={(text) =>
                      setForm((prev) => ({
                        ...prev,
                        [field]: { ...prev[field], value: text },
                      }))
                    }
                    onBlur={() =>
                      setForm((prev) => ({
                        ...prev,
                        [field]: { ...prev[field], isTouched: true },
                      }))
                    }
                  ></InputField>
                </Input>
              </>
            ))}
          </ModalBody>
          <ModalFooter>
            <ButtonGroup flexDirection="column" className="w-full">
              {!isFormEditable && (
                <Button
                  variant="outline"
                  action="primary"
                  onPress={handleEditState}
                >
                  <ButtonText>Edit</ButtonText>
                </Button>
              )}

              {/* { !isFormEditable && <Button
              variant="solid"
              action="negative">
                <ButtonText onPress={handleRemoveAction}>Remove</ButtonText>
              </Button> } */}

              {isFormEditable && (
                <Button onPress={handleUpdateUserCallout} action="primary">
                  <ButtonText>Update</ButtonText>
                  {isIntegrationLoading && <ButtonSpinner />}
                </Button>
              )}

              {isFormEditable && (
                <Button onPress={handleCancelEditState} action="negative">
                  <ButtonText>Cancel</ButtonText>
                </Button>
              )}
            </ButtonGroup>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </SafeAreaProvider>
  );
}

async function performUpdateUserSelfInfoCallout(payload: any) {
  let body: any = {};
  Object.keys(payload).forEach((element) => {
    body[element] = payload[element].value;
  });

  const url = `${process.env.EXPO_PUBLIC_API_URL}/users/me`;
  const options = {
    method: "PUT",
    credentials: "include" as RequestCredentials,
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body),
  };
  let response = await fetch(url, options);
  return response;
}

async function performUpdateUserInfoCallout(payload: any) {
  let body: any = {};
  Object.keys(payload).forEach((element) => {
    body[element] = payload[element].value;
  });

  const url = `${process.env.EXPO_PUBLIC_API_URL}/users/${body.userName}`;
  const options = {
    method: "PUT",
    credentials: "include" as RequestCredentials,
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body),
  };
  let response = await fetch(url, options);
  return response;
}
