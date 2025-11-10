import { Button, ButtonGroup, ButtonText } from '@/components/ui/button';
import { Heading } from '@/components/ui/heading';
import { CloseIcon, Icon } from '@/components/ui/icon';
import { Input, InputField } from '@/components/ui/input';
import {
  Modal,
  ModalBackdrop,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
} from '@/components/ui/modal';
import { Text } from '@/components/ui/text';
import React, { useState } from 'react';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';


export default function ModalComponent({ content, buttonName, variant }: { content: any, buttonName: string, variant: "admin" | "self" }) {
  const [isFormEditable, setIsFormEditable] = useState(false);
  const [modalTitle, setModalTitle] = useState("");
  const [showModal, setModalVisible] = useState(false);
  let backupContent = content;
  //this could be done using a context-based backend callout
  const formFieldsByVariant: Record<"admin" | "self", string[]> = {
    admin: [ "userName", "password", "birthDate", "emailAddress", "phoneNumber", "firstName", "lastName", "address"],
    self: ["emailAddress", "phoneNumber"]
  };
  console.log("Modal variant:", variant);
  // const initialForm = formFieldsByVariant[variant].reduce(
  //   (acc, key) => {
  //     acc[key] = { value: content[key] ?? "", isTouched: false };
  //     return acc;
  //   },
  //   {} as Record<string, { value: any; isTouched: boolean }>
  // );
  const [form, setForm] = React.useState(() => {
    const variantFields = formFieldsByVariant[variant] ?? formFieldsByVariant["admin"];
    return variantFields.reduce((acc, key) => {
      acc[key] = { value: content[key] ?? "", isTouched: false };
      return acc;
    }, {} as Record<string, { value: any; isTouched: boolean }>);
  });
  type FormField = keyof typeof form;
  const fields: FormField[] = Object.keys(form) as FormField[];

  //open close modal
  function handleOpenModal() {
    setModalVisible(true)
    setModalEditable(false)
    setModalTitle(`User Details`)
  }
  function handleCloseModal() {
    setModalVisible(false)
    setModalEditable(false)
    setModalTitle(`User Details`)
    resetFields()
  }

  //states
  function handleEditState() {
    setModalTitle(`Edit user`)
    setModalEditable(true)
  }
  function handleCancelEditState() {
    setModalTitle(`User Details`)
    setModalEditable(false)
    resetFields()
  }

  //helpers
  function resetFields(){
   fields.map((field) => {
      form[field].value = backupContent[field]
    })
  }
  function setModalEditable(value:boolean){
    setIsFormEditable(value)
  }
  function logForm(){
    console.log(form)
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
        size="sm"
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
            {fields.map((field, index) => (
              <>
                <Text key={`text-${index}`}>{field}</Text>
                <Input key={`input-${index}`}
                  variant="outline"
                  size="sm"
                  className="w-full"
                  isDisabled={!isFormEditable}
                  isInvalid={false}
                  isReadOnly={false}
                >
                  <InputField key={`inputfield-${index}`}
                    value={form[field].value}
                    onChangeText={(text) =>
                      setForm(prev => ({
                        ...prev,
                        [field]: { ...prev[field], value: text }}))}
                    onBlur={() =>
                      setForm(prev => ({
                        ...prev,
                        [field]: { ...prev[field], isTouched: true }}))}
                  ></InputField>
                </Input>
              </>
            ))}
          </ModalBody>
          <ModalFooter>
            
            <ButtonGroup flexDirection="row">
              { !isFormEditable && <Button
              variant="outline"
              action="primary">
                <ButtonText onPress={handleEditState}>Edit</ButtonText>
              </Button> }
              
              { isFormEditable && <Button
              action="secondary">
                <ButtonText onPress={logForm}>Log</ButtonText>
              </Button> }
              
              { isFormEditable && <Button
              action="primary">
                <ButtonText onPress={logForm}>Update</ButtonText>
              </Button> }
              
              { isFormEditable && <Button
              action="negative">
                <ButtonText onPress={handleCancelEditState}>Cancel</ButtonText>
              </Button> }
            </ButtonGroup>
            
          </ModalFooter>
        </ModalContent>
      </Modal>
    </SafeAreaProvider>
  );
}
