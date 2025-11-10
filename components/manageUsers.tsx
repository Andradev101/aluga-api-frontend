import ModalComponent from "@/components/modal";
import { SearchIcon } from '@/components/ui/icon';
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
import { useAuthContext } from "@/context/AuthContext";
import { useAuth } from "@/hooks/useAuth";
import React, { useEffect } from "react";
import { ScrollView } from "react-native";

export function ManageUsers() {
  //protected route user data
  const { isAuthenticated, userData, loading } = useAuthContext();
  const { fetchUserData } = useAuth();

  useEffect(() => {
    const fetchAndCall = async () => {
      try {
        await fetchUserData();
        performUsersCallout();
      } catch (error) {
        console.error("Error fetching user data:", error);
      }
    };

    fetchAndCall();
  }, [isAuthenticated, userData, loading]);

  const [payloadBody, setpayloadBody] = React.useState("asad");
  const [tableHeadFields, setTableHeadFields] = React.useState({});
  const [tableBodyRows, setTableBodyRows] = React.useState({});
  const [renderTable, setRenderTable] = React.useState(false);

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
      console.log(response);
      console.log(data);
      if (response.ok) {
        console.log("OK");
        console.log(Object.keys(data[0]));
        setTableHeadFields(Object.keys(data[0]));
        setTableBodyRows(data);
        setRenderTable(true);
      } else {
        // setLoginError(data);
      }
    } catch (error) {
      console.log(error);
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
          <TableRow key={item.userName}>
            {/* <TableData className='w-[150px]'>{item.id}</TableData> */}
            <TableData className="min-w-[100px]">{item.userName}</TableData>
            {/* <TableData className='w-[150px]'>{item.password}</TableData> */}
            <TableData className="min-w-[100px]">{item.role}</TableData>
            <TableData className="min-w-[100px]">
              <ModalComponent content={item} buttonName="Details" variant="admin" />
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
    <VStack>
      <Input>
        <InputSlot className="pl-3">
          <InputIcon as={SearchIcon} />
        </InputSlot>
        <InputField placeholder="Search user by username" />
      </Input>
      {!renderTable && <Spinner size="large" color="grey" />}
      <ScrollView>
        <Table className="w-full">
          <TableHeader>
            {/* <TableRow className="w-full">
                {renderTable && defineTableHead(tableHeadFields)}
              </TableRow> */}
          </TableHeader>
          <TableBody className="w-full">{renderTable && defineTableBody(tableBodyRows)}</TableBody>
        </Table>
      </ScrollView>
    </VStack>
  );
}
