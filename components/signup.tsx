import { FormControl, FormControlError, FormControlErrorIcon, FormControlErrorText, FormControlHelper, FormControlHelperText, FormControlLabel, FormControlLabelText } from '@/components-old/ui/form-control';
import { Button, ButtonSpinner, ButtonText } from '@/components/ui/button';
import { Heading } from '@/components/ui/heading';
import { HStack } from '@/components/ui/hstack';
import { AlertCircleIcon } from '@/components/ui/icon';
import { Input, InputField } from '@/components/ui/input';
import { LinkText } from '@/components/ui/link';
import { VStack } from '@/components/ui/vstack';
import { Link as RouterLink } from 'expo-router';
import React from 'react';
import { DatePicker } from './datepicker';

type UserSchemaValue = {
  value: string;
  isTouched: boolean;
};

type UserSchema = {
  [key: string]: UserSchemaValue;
};

export function Signup() {
  const [isLoading, setIsLoading] = React.useState(false);
  const [showDatePicker, setShowDatePicker] = React.useState(false);
  

  const [isUserSchemaReady, setIsUserSchemaReady] = React.useState(false);
  const [userSchemaInfo, setUserSchemaInfo] = React.useState({});
  const [userSchema, setUserSchema] = React.useState<UserSchema>({});
  const [form, setForm] = React.useState({
    userName: { value: '', isTouched: false },
    password: { value: '', isTouched: false },
    birthDate: { value: new Date(), isTouched: false },
    emailAddress: { value: '', isTouched: false },
    phoneNumber: { value: '', isTouched: false },
    firstName: { value: '', isTouched: false },
    lastName: { value: '', isTouched: false },
    address: { value: '', isTouched: false },
  });

  const [showPassword, setShowPassword] = React.useState(false);
  const handleState = () => {
    setShowPassword((showState) => {
      return !showState;
    });
  };

  async function handleSubmit() {
    setIsLoading(true)
    for (const [key, fieldProps] of Object.entries(userSchema)) {
      // console.log(key, [fieldProps.value, fieldProps.isTouched]);
      if (!fieldProps.value) {
        setIsLoading(false)
        return;
      }
      
    }
    let body = JSON.stringify({
        "userName": userSchema.userName.value,
        "password": userSchema.password.value,
        "role": "customer",
        "birthDate": userSchema.birthDate.value,
        "emailAddress": userSchema.emailAddress.value,
        "phoneNumber": userSchema.phoneNumber.value,
        "firstName": userSchema.firstName.value,
        "lastName": userSchema.lastName.value,
        "address": userSchema.address.value
      })
    await performRegisterCallout(body)
    setIsLoading(false)
  };

  async function performRegisterCallout(payload: any) {
    console.log("payload", payload)
    const url = `${process.env.EXPO_PUBLIC_API_URL}/users`;
    const options = {
      method: 'POST',
      credentials: 'include' as RequestCredentials,
      headers: {'content-type': 'application/json'},
      body: payload
    };

    try {
      const response = await fetch(url, options);
      const data = await response.json();
      if(response.ok){
        console.log("OK");
      } else {
        console.log(data);
        console.log(data.detail);
      }
    } catch (error) {
      console.error("AAAAAAAAAAAAAA");
      console.log(error);
    }
  }

  function checkBlankField(obj:any) {
    if(!obj.value && obj.isTouched ) return true
    return false
  }

  const handleDateChange = (updatedDate: Date) => {
    setUserSchema((prev) => ({
      ...prev,
      birthDate: { value: updatedDate.toISOString(), isTouched: true },
    }));
  };
  
  async function handleGetUserSchema(){
  const url = `${process.env.EXPO_PUBLIC_API_URL}/openapi.json`;
      const options = {
        method: 'GET',
        credentials: 'include' as RequestCredentials,
        headers: {'content-type': 'application/json'},
      };

      try {
        const response = await fetch(url, options);
        const data = await response.json();
        if(response.ok){
          console.log("OK");
          
          let userSchemaFields = Object.keys(data.components.schemas.UserSignup.properties);
          let userSchemaForm:any = {};
          userSchemaFields.map((field)=>{ if(field === "birthdate"){
            return userSchemaForm[field] = { value: new Date(), isTouched: false };
            } else {
              return userSchemaForm[field] = { value: "", isTouched: false };
            }
          })
          setUserSchema(userSchemaForm)
          console.log(data.components.schemas.UserSignup.properties)
          setUserSchemaInfo(data.components.schemas.UserSignup.properties)
          setIsUserSchemaReady(true)
        } else {
        }
      } catch (error) {
        console.log(error);
      }
    }
  return (
    <VStack>
      <Heading>Create a new account</Heading>
      <HStack space="xs">
        <Heading size={"xs"}>Already have have an account?</Heading>
        <RouterLink href="/login">
          <LinkText size="xs">Login</LinkText>
        </RouterLink>
      </HStack>
      <Button onPress={handleGetUserSchema}></Button>
      { isUserSchemaReady &&
        Object.entries(userSchema).map(([key, value])=>{
          const meta = (userSchemaInfo as any)[key]; //god forbid typing
          console.log(key, userSchema[key])
          if(key === "birthDate") {
            console.log("birthDate", userSchema[key].value)
            return(
              <>
                <FormControl isInvalid={checkBlankField(userSchema[key])} isRequired>
                  <FormControlLabel>
                    <FormControlLabelText>Birth Date</FormControlLabelText>
                  </FormControlLabel>
                    <DatePicker date={new Date()} onDateChange={handleDateChange} />
                  <FormControlHelper>
                    <FormControlHelperText>Your birth date.</FormControlHelperText>
                  </FormControlHelper>
                  <FormControlError>
                    <FormControlErrorIcon as={AlertCircleIcon} className="text-red-500" />
                    <FormControlErrorText className="text-red-500">Cannot be blank.</FormControlErrorText>
                  </FormControlError>
                </FormControl>
              </>
            )
          } else{
            return (
              <FormControl isInvalid={checkBlankField(userSchema[key])} isRequired key={key}>
                <FormControlLabel>
                  <FormControlLabelText>{meta.title}</FormControlLabelText>
                </FormControlLabel>
                <Input>
                  <InputField
                    type={meta.format}
                    value={userSchema[key].value}
                    onChangeText={(text) =>
                      setUserSchema((prev) => ({
                        ...prev,
                        [key]: { ...prev[key], value: text },
                      }))
                    }
                    onBlur={() =>
                      setUserSchema((prev) => ({
                        ...prev,
                        [key]: { ...prev[key], isTouched: true },
                      }))
                    }

                  />
                </Input>
                <FormControlHelper>
                  <FormControlHelperText>{meta.description}</FormControlHelperText>
                </FormControlHelper>
                <FormControlError>
                  <FormControlErrorIcon
                    as={AlertCircleIcon}
                    className="text-red-500"
                  />
                  <FormControlErrorText className="text-red-500">
                    Cannot be blank.
                  </FormControlErrorText>
                </FormControlError>
              </FormControl>
            );
          }
        })
      }
      <Button
        className="w-fit self-end mt-4"
        size="sm"
        variant="outline"
        onPress={handleSubmit}
      >
        {isLoading && <ButtonSpinner color="gray" />}
        <ButtonText>Register</ButtonText>
      </Button>
    </VStack>
  );
}
