import { FormControl, FormControlError, FormControlErrorIcon, FormControlErrorText, FormControlHelper, FormControlHelperText, FormControlLabel, FormControlLabelText } from '@/components-old/ui/form-control';
import { Button, ButtonSpinner, ButtonText } from '@/components/ui/button';
import { Heading } from '@/components/ui/heading';
import { HStack } from '@/components/ui/hstack';
import { AlertCircleIcon, EyeIcon, EyeOffIcon } from '@/components/ui/icon';
import { Input, InputField, InputIcon, InputSlot } from '@/components/ui/input';
import { LinkText } from '@/components/ui/link';
import { Spinner } from '@/components/ui/spinner';
import { VStack } from '@/components/ui/vstack';
import { Link as RouterLink } from 'expo-router';
import React, { useEffect } from 'react';
import { DatePicker } from './datepicker';

type UserSchemaValue = {
  value: string;
  isTouched: boolean;
  invalidStateMsg?: string;
};

type UserSchema = {
  [key: string]: UserSchemaValue;
};

export function Signup() {
  useEffect(() => {
    handleGetUserSchema()
  }, []);

  const [isIntegrationLoading, setIsIntegrationLoading] = React.useState(false);
  const [isUserSchemaReady, setIsUserSchemaReady] = React.useState(false);
  const [userSchemaInfo, setUserSchemaInfo] = React.useState({});
  const [userSchema, setUserSchema] = React.useState<UserSchema>({});
  // const [form, setForm] = React.useState({
  //   userName: { value: '', isTouched: false },
  //   password: { value: '', isTouched: false },
  //   birthDate: { value: new Date(), isTouched: false },
  //   emailAddress: { value: '', isTouched: false },
  //   phoneNumber: { value: '', isTouched: false },
  //   firstName: { value: '', isTouched: false },
  //   lastName: { value: '', isTouched: false },
  //   address: { value: '', isTouched: false },
  // });

  const [showPassword, setShowPassword] = React.useState(false);
  const handleState = () => {
    setShowPassword((showState) => {
      return !showState;
    });
  };

  async function handleSubmit() {
    setIsIntegrationLoading(true)
    let invalidState = false;
    for (const [key, fieldProps] of Object.entries(userSchema)) {
      console.log(key, [fieldProps.value, fieldProps.isTouched]); 
      if (!fieldProps.value) {
        setUserSchema((prev) => ({
          ...prev,
          [key]: { ...prev[key],  isTouched: true },
        }))
        setIsIntegrationLoading(false)
        invalidState = true;
      }
    }
    if(invalidState) return;
    
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
    setIsIntegrationLoading(false)
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
        data.detail.forEach((element: any) => {
          console.log(element.loc[1])
          setUserSchema((prev) => ({
              ...prev,
              [element.loc[1]]: { ...prev[element.loc[1]],  invalidStateMsg: element.msg},
            }))
          setUserSchema((prev) => ({
              ...prev,
              [element.loc[1]]: { ...prev[element.loc[1]],  isTouched: true},
            }))
        });
        // for (const [key, fieldProps] of Object.entries(userSchema)) {
        //   console.log(key, [fieldProps.value, fieldProps.isTouched]); 
        //   if (!fieldProps.value) {
        //     setUserSchema((prev) => ({
        //       ...prev,
        //       [key]: { ...prev[key],  isTouched: true},
        //     }))
        //     setIsIntegrationLoading(false)
        //   }
        // }
      }
    } catch (error) {
      console.error("AAAAAAAAAAAAAA");
      console.log(error);
    }
  }

  function checkFieldValidity(obj:any) {
    if(obj.isTouched && obj.invalidStateMsg) return true
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
          
          //super important, imposes field behavior for every form field
          let userSchemaForm:any = {};
          userSchemaFields.map((field)=>{ if(field === "birthdate"){
            return userSchemaForm[field] = { value: new Date(), isTouched: false, invalidStateMsg: "" };
            } else {
              return userSchemaForm[field] = { value: "", isTouched: false, invalidStateMsg: "" };
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
      
      {!isUserSchemaReady && <Spinner size="large" color="grey" />}
      
      { isUserSchemaReady &&
        Object.entries(userSchema).map(([key, value])=>{
          const meta = (userSchemaInfo as any)[key]; //god forbid typing
          console.log(key, userSchema[key])
          // console.log(meta)
          if(key === "birthDate") {
            // console.log("birthDate", userSchema[key].value)
            return(
              <>
                <FormControl isInvalid={checkFieldValidity(userSchema[key])} isRequired size="lg">
                  <FormControlLabel>
                    <FormControlLabelText>Birth Date</FormControlLabelText>
                  </FormControlLabel>
                    <DatePicker date={!userSchema[key].value ? new Date() : new Date(userSchema[key].value)} onDateChange={handleDateChange} />
                  <FormControlHelper>
                    <FormControlHelperText>Your birth date.</FormControlHelperText>
                  </FormControlHelper>
                </FormControl>
              </>
            )
          } else{
            return (
              <FormControl isInvalid={userSchema[key].invalidStateMsg !== "" || (userSchema[key].isTouched && userSchema[key].value === "")} isRequired key={key} size="lg">
                <FormControlLabel>
                  <FormControlLabelText>{meta.title}</FormControlLabelText>
                </FormControlLabel>
                <Input>
                  <InputField
                    // type={meta.format}
                    type={meta.format === "password" ? (showPassword ? 'text' : meta.format) : meta.format}
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
                  {
                    meta.format === "password" &&
                    <InputSlot className="pr-3" onPress={handleState}>
                      <InputIcon as={showPassword ? EyeIcon : EyeOffIcon} />
                    </InputSlot>
                  }
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
                    {userSchema[key].invalidStateMsg === "" ?"Field cannot be blank." : userSchema[key].invalidStateMsg}
                  </FormControlErrorText>
                </FormControlError>
              </FormControl>
            );
          }
        })
      }
      { isUserSchemaReady &&
        <Button
          className="w-fit self-end mt-4"
          size="sm"
          variant="solid"
          action="positive"
          onPress={handleSubmit}
        >
          {isIntegrationLoading && <ButtonSpinner color="gray" />}
          <ButtonText >Register</ButtonText>
        </Button>
      }
    </VStack>
  );
}
