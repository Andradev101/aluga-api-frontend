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

// 1. Tipagem atualizada para incluir o prop de callback da edição
interface ModalProps {
  content: any;
  onEditComplete: (updatedUser: any) => Promise<boolean>;
}

// 2. Recebendo o novo prop 'onEditComplete'
export default function ModalComponent({ content, onEditComplete }: ModalProps) {
  const [isFormEditable, setIsFormEditable] = useState(false);
  const [modalTitle, setModalTitle] = useState("");
  const [showModal, setModalVisible] = useState(false);

  // Usamos o content original para resetar/backup
  const backupContent = content;

  // Inicializa o estado do formulário com base no content (agora no estado para ser editável)
  const [form, setForm] = React.useState({
    userName: { value: content.userName, isTouched: false },
    password: { value: content.password, isTouched: false },
    birthDate: { value: content.birthDate, isTouched: false },
    emailAddress: { value: content.emailAddress, isTouched: false },
    phoneNumber: { value: content.phoneNumber, isTouched: false },
    firstName: { value: content.firstName, isTouched: false },
    lastName: { value: content.lastName, isTouched: false },
    address: { value: content.address, isTouched: false },
  });

  type FormField = keyof typeof form;
  const fields: FormField[] = Object.keys(form) as FormField[];

  // open close modal
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

  // states
  function handleEditState() {
    setModalTitle(`Edit user`)
    setModalEditable(true)
  }
  function handleCancelEditState() {
    setModalTitle(`User Details`)
    setModalEditable(false)
    resetFields()
  }

  // 3. NOVO: Função para extrair dados e chamar a API do pai
  async function handleEditUser() {
    // 1. Extrair apenas os valores atuais do formulário
    const updatedData = fields.reduce((acc, field) => {
      // Ignora a senha se ela não foi tocada (assumindo que a API só deve aceitar o novo valor)
      // Se a API requer que todos os campos sejam enviados, remova este if/else
      if (field === 'password' && !form[field].isTouched) {
        return acc;
      }
      acc[field] = form[field].value;
      return acc;
    }, {} as any);

    // 2. Adicionar o ID do usuário (necessário para a rota de atualização na API)
    updatedData.id = backupContent.id;

    console.log("Enviando dados para a API:", updatedData);

    // 3. Chamar a função de callback fornecida pelo componente pai
    const success = await onEditComplete(updatedData);

    // 4. Se a API retornar sucesso, fechar o modal e reverter o estado.
    if (success) {
      handleCloseModal();
    }
  }

  // helpers
  function resetFields() {
    // Cria um novo objeto de estado com base nos dados de backup
    const newFormState = fields.reduce((acc, field) => {
      acc[field] = { value: backupContent[field], isTouched: false };
      return acc;
    }, {} as typeof form);

    setForm(newFormState);
  }
  function setModalEditable(value: boolean) {
    setIsFormEditable(value)
  }
  // A função logForm agora não é mais necessária, pois foi substituída por handleEditUser
  // function logForm(){ console.log(form) }

  return (
    <SafeAreaProvider>
      <SafeAreaView>
        <Button onPress={handleOpenModal}>
          <ButtonText>Details</ButtonText>
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
            <ModalCloseButton onPress={handleCloseModal}>
              <Icon as={CloseIcon} />
            </ModalCloseButton>
          </ModalHeader>
          <ModalBody>
            {fields.map((field, index) => (
              <React.Fragment key={`fragment-${index}`}>
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
                      setForm(prev => ({
                        ...prev,
                        [field]: { ...prev[field], value: text }
                      }))}
                    onBlur={() =>
                      setForm(prev => ({
                        ...prev,
                        [field]: { ...prev[field], isTouched: true }
                      }))}
                  />
                </Input>
              </React.Fragment>
            ))}
          </ModalBody>
          <ModalFooter>

            <ButtonGroup flexDirection="row">
              {/* Botão EDITAR (Visível apenas em modo de visualização) */}
              {!isFormEditable && (
                <Button
                  variant="outline"
                  action="primary"
                  onPress={handleEditState} // Chamada para habilitar a edição
                >
                  <ButtonText>Edit</ButtonText>
                </Button>
              )}

              {/* Botão SALVAR (Visível apenas em modo de edição) */}
              {isFormEditable && (
                <Button
                  action="positive" // Cor de sucesso para salvar
                  onPress={handleEditUser} // Chamada para enviar os dados editados
                >
                  <ButtonText>Save</ButtonText>
                </Button>
              )}

              {/* Botão CANCELAR (Visível apenas em modo de edição) */}
              {isFormEditable && (
                <Button
                  action="negative"
                  onPress={handleCancelEditState} // Chamada para cancelar e resetar campos
                >
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