// app/users.tsx

import ModalComponent from "@/components/modal";
import { Spinner } from "@/components/ui/spinner";
import {
  Table,
  TableBody,
  TableData,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { VStack } from "@/components/ui/vstack";
import React, { useEffect } from "react";
import { ScrollView } from "react-native";

export default function HomeScreen() {
  // Estados existentes...
  const [tableHeadFields, setTableHeadFields] = React.useState({});
  const [tableBodyRows, setTableBodyRows] = React.useState({});
  const [renderTable, setRenderTable] = React.useState(false);

  // 1. Função para buscar a lista de usuários
  async function performUsersCallout() {
    const url = `${process.env.EXPO_PUBLIC_API_URL}/users`;

    const options = {
      method: "GET",
      credentials: "include" as RequestCredentials,
      headers: { "content-type": "application/json" },
    };

    try {
      const response = await fetch(url, options);
      const data = await response.json();

      if (response.ok) {
        // Assumindo que 'data' é um array de objetos de usuários
        setTableHeadFields(Object.keys(data[0]));
        setTableBodyRows(data);
        setRenderTable(true);
      } else {
        console.error("Erro ao buscar usuários:", data);
        // setLoginError(data);
      }
    } catch (error) {
      console.error("Erro de rede ao buscar usuários:", error);
    }
  }

  // 2. NOVO: Função para atualizar um usuário (Chamada pelo Modal)
  async function updateUserCallout(updatedUser: any) {
    // É crucial que o objeto 'updatedUser' contenha o 'id' do usuário
    const userId = updatedUser.id;

    if (!userId) {
      console.error("ID do usuário não fornecido para atualização.");
      return false;
    }

    const url = `${process.env.EXPO_PUBLIC_API_URL}/users/${userId}`;

    // Prepara o corpo com os dados editáveis
    const body = JSON.stringify(updatedUser);

    const options = {
      method: "PUT", // Ou 'PATCH', dependendo da sua API
      credentials: "include" as RequestCredentials,
      headers: { "content-type": "application/json" },
      body: body,
    };

    try {
      const response = await fetch(url, options);

      if (response.ok) {
        console.log(`Usuário ${userId} atualizado com sucesso!`);
        // Recarrega a lista para refletir as mudanças na tabela
        performUsersCallout();
        return true;
      } else {
        const data = await response.json();
        console.error("Erro na atualização do usuário:", data);
        return false;
      }
    } catch (error) {
      console.error("Erro de rede/API ao atualizar usuário:", error);
      return false;
    }
  }


  useEffect(() => {
    performUsersCallout()
  }, []);

  // A variável payloadBody foi mantida, mas não está sendo usada de forma clara, 
  // então não foi removida, mas foi simplificada.
  const [payloadBody, setpayloadBody] = React.useState(null);

  // ... (defineTableHead, defineTableBody)

  function defineTableHead(possibleFields: any) {
    console.log(possibleFields);
    return (
      <>
        {possibleFields.map((item: any, index: any) => (
          <TableHead key={index}>{item}</TableHead>
        ))}
      </>
    );
  }

  // 3. Modificação em defineTableBody para passar a função de edição
  function defineTableBody(tableData: any) {
    return (
      <>
        {tableData.map((item: any, index: any) => (
          <TableRow key={index}>
            <TableData className="min-w-[100px]">{item.userName}</TableData>
            <TableData className="min-w-[100px]">{item.role}</TableData>
            <TableData className="min-w-[100px]">
              <ModalComponent
                content={item}
                onEditComplete={updateUserCallout} // <-- NOVO PROP PASSADO
              />
            </TableData>
          </TableRow>
        ))}
      </>
    );
  }

  return (
    <VStack>
      <ScrollView>
        <Table className="w-full">
          <TableHeader>
            {/* O cabeçalho da tabela (comentado no original) */}
            {/* <TableRow className="w-full">
                {renderTable && defineTableHead(tableHeadFields)}
              </TableRow> */}
          </TableHeader>
          {!renderTable && <Spinner size="large" color="grey" />}
          <TableBody>{renderTable && defineTableBody(tableBodyRows)}</TableBody>
        </Table>
      </ScrollView>
    </VStack>
  );
}