import ModalComponent from "@/components/modal";
import { Card } from "@/components/ui/card";
import { Heading } from '@/components/ui/heading';
import { RepeatIcon, SearchIcon, TrashIcon } from '@/components/ui/icon';
import { Input, InputField, InputIcon, InputSlot } from '@/components/ui/input';
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
import { router } from "expo-router";
import { CircleAlert, EditIcon } from "lucide-react-native";
import React, { useEffect } from "react";
import { Platform, ScrollView } from "react-native";
import { AlertComponent } from "./alert";
import { Alert, AlertIcon } from "./ui/alert";
import { Button, ButtonIcon, ButtonSpinner, ButtonText } from "./ui/button";
import { Center } from "./ui/center";
import { HStack } from "./ui/hstack";
import { Text } from "./ui/text";


export function ManageUsers() {

  useEffect(() => {
    const fetchAndCall = async () => {
      try {
        performUsersCallout();
      } catch (error) {
        console.error("Error fetching user data:", error);
      }
    };

    fetchAndCall();
  }, []);

  const [payloadBody, setpayloadBody] = React.useState("asad");
  const [tableHeadFields, setTableHeadFields] = React.useState({});
  const [tableBodyRows, setTableBodyRows] = React.useState([])
  const [filteredTableRows, setFilteredTableRows] = React.useState([])
  const [filterValue, setFilterValue] = React.useState("");
  const [renderTable, setRenderTable] = React.useState(false);
  const [isIntegrationLoading, setIsIntegrationLoading] = React.useState(false);
  const [isIntegrationExceptionState, setIsIntegrationExceptionState] = React.useState(false);
  
  useEffect(() => {
      if (!filterValue) {
        setFilteredTableRows(tableBodyRows);
      } else {
        const lower = filterValue.toLowerCase()
        const filtered = (tableBodyRows as any).filter((user: { userName: string; }) =>
          user.userName?.toLowerCase().includes(lower)
        );
        // console.log(filtered)
        setFilteredTableRows(filtered);
      }
    }, [filterValue]
    // [filteredTableRows, tableBodyRows]
  );
  async function performUsersCallout() {
    console.log("aaaa");
    
    setFilterValue("");
        console.log("bbbb");

    setIsIntegrationExceptionState(false);
    setRenderTable(false);
    setTableBodyRows([]);
    setFilteredTableRows([]);
    setIsIntegrationLoading(true);
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
        console.log("OK");
        console.log(Object.keys(data[0]));
        setTableHeadFields(Object.keys(data[0]));
        setTableBodyRows(data);
      } else {
        setIsIntegrationExceptionState(true)
      }
    } catch (error) {
      setIsIntegrationExceptionState(true)
      console.log(error);
    } finally {
      setIsIntegrationLoading(false)
      setRenderTable(true);
    }
  }

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
  function defineTableBody(tableData: any) {
    return (
      <>
        {tableData.map((item: any, index: any) => (
          <TableRow key={item.userName+index}>
            {/* <TableData className='w-[150px]'>{item.id}</TableData> */}
            <TableData className={Platform.OS !== "web"?" p-2 w-[160px]":" p-2"}>{item.userName}</TableData>
            {/* <TableData className='w-[150px]'>{item.password}</TableData> */}
            <TableData className={Platform.OS !== "web"?" p-2 w-[120px]":" p-2"}>{item.role}</TableData>
            <TableData className={Platform.OS !== "web"?" p-2 w-[100px]":" p-2"}>
              <ModalComponent content={item} buttonName="Informações pessoais" variant="admin" onCloseCallback={() => {console.log("Modal closed for user:", item.userName);performUsersCallout();}}>
                  {(openAlert) => (
                      <Button className="w-full" variant="solid" onPress={openAlert}>
                          <ButtonIcon as={EditIcon} size="xl"></ButtonIcon>
                      </Button>

                  )}
              </ModalComponent>
            </TableData>
            <TableData className={Platform.OS !== "web"?" p-2 w-[75px]":" p-2"}>
              <AlertComponent content={item} onCloseCallback={()=> {performUsersCallout()}}>
                {(openAlert) => (
                  <Button className="w-full" variant="solid" action="negative" onPress={openAlert} >
                    <ButtonIcon as={TrashIcon} size="xl" />
                  </Button>
                )}
              </AlertComponent>
            </TableData>
            {/* <TableData className='w-[150px]'>{item.birthDate}</TableData> */}
            {/* <TableData className="w-[250px]">{item.emailAddress}</TableData> */}
            {/* <TableData className="w-[250px]">{item.phoneNumber}</TableData> */}
            {/* <TableData className='w-[150px]'>{item.firstName }</TableData> */}
            {/* <TableData className='w-[150px]'>{item.lastName}</TableData> */}
            {/* <TableData className='w-[150px]'>{item.address}</TableData> */}
          </TableRow>
        ))}
      </>
    );
  }
  return (
    <>
    <Card size="sm" variant="outline">
      <VStack space="2xl">
        <Center>
          <Heading>Gerenciamento de usuários</Heading>
        </Center>
        <HStack className="w-full">
          <Input className="flex-1">
            <InputSlot className="pl-3">
              <InputIcon as={SearchIcon} />
            </InputSlot>
            <InputField placeholder="busca por nome de usuário" value={filterValue} onChangeText={setFilterValue}/>
          </Input>
          <Button onPress={performUsersCallout}>
            {isIntegrationLoading ? <ButtonSpinner color="white" /> : <ButtonIcon as={RepeatIcon}></ButtonIcon>}
          </Button>
        </HStack>
        {!renderTable && <Spinner size="large" color="grey" />}
        <ScrollView className="max-h-[60vh]">
          <Table className="w-full">
            <TableHeader>
              {/* <TableRow className="w-full">
                  {renderTable && defineTableHead(tableHeadFields)}
                </TableRow> */}
            </TableHeader>
              {filterValue && <TableBody className="w-full">{renderTable && defineTableBody(filteredTableRows)}</TableBody>}
              {!filterValue && <TableBody className="w-full">{renderTable && defineTableBody(tableBodyRows)}</TableBody>}
          </Table>
        </ScrollView>
        { isIntegrationExceptionState &&
          <Alert variant="solid" action="error" className="w-full">
            <AlertIcon as={CircleAlert}></AlertIcon>
              <Text>An unexpected error occurred. Refresh the page.</Text>
          </Alert>
        }
      </VStack>
    </Card>

    <Card>
      <Center>
        <Heading size="2xl">Ir para:</Heading>
      <HStack space="md" className="flex-row flex flex-wrap">
        <Button size="md" onPress={() => {router.push("/explorer")}}>
        <ButtonText>
          Página inicial
        </ButtonText>
      </Button>
      <Button size="md" onPress={() => {router.push("/explorer")}}>
        <ButtonText>
          Hotéis
        </ButtonText>
      </Button>
      <Button size="md" onPress={() => {router.push("/explorer")}}>
        <ButtonText>
          Reservas
        </ButtonText>
      </Button>
      <Button size="md" onPress={() => {router.push("/explorer")}}>
        <ButtonText>
          Reviews
        </ButtonText>
      </Button>
      </HStack>
      </Center>
    </Card>
    </>
  );
}
