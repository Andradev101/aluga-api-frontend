import * as Storage from '@/components/secureStorage';
import { Button, ButtonSpinner, ButtonText } from '@/components/ui/button';
import {
  FormControl,
  FormControlError,
  FormControlErrorIcon,
  FormControlErrorText,
  FormControlHelper,
  FormControlHelperText,
  FormControlLabel,
  FormControlLabelText
} from '@/components/ui/form-control';
import { Heading } from '@/components/ui/heading';
import { HStack } from '@/components/ui/hstack';
import { AlertCircleIcon, EyeIcon, EyeOffIcon } from '@/components/ui/icon';
import { Input, InputField, InputIcon, InputSlot } from '@/components/ui/input';
import { LinkText } from '@/components/ui/link';
import { VStack } from '@/components/ui/vstack';
import { router, Link as RouterLink } from 'expo-router';
import React from 'react';
import { Text } from 'react-native';


export function Login() {
  const [isLoading, setIsLoading] = React.useState(false);
  
  const [usernameInputValue, setUsernameInputValue] = React.useState('maria_lee');
  const [passwordInputValue, setPasswordInputValue] = React.useState('Admin!234');
  
  const [isUsernameInvalid, setIsUsernameInvalid] = React.useState(false);
  const [isPasswordInvalid, setIsPasswordInvalid] = React.useState(false);
  const [showPassword, setShowPassword] = React.useState(false);
  
  const [isLoginError, setIsLoginError] = React.useState(false);
  const [loginErrorMsg, setLoginErrorMsg] = React.useState("");
  
  const handleState = () => {
    setShowPassword((showState) => {
      return !showState;
    });
  };

  async function handleSubmit() {
    
    setIsLoading(true);
    setIsLoginError(false);
    setLoginErrorMsg("");
    setIsPasswordInvalid(false);
    setIsUsernameInvalid(false);

    if(!usernameInputValue || !passwordInputValue) {
      if(!usernameInputValue) setIsUsernameInvalid(true);
      if(!passwordInputValue) setIsPasswordInvalid(true);
      setIsLoading(false);
      return;
    }
    
    let loginRes = await performLoginCallout(usernameInputValue, passwordInputValue);
    await performGetCredentials();
    if(loginRes) router.push('/homepage')
    setIsLoading(false)
  };

  async function performLoginCallout(username: string, password: string) {
    const url = `${process.env.EXPO_PUBLIC_API_URL}/login`;
    
    const options = {
      method: 'POST',
      credentials: 'include' as RequestCredentials,
      headers: {'content-type': 'application/json'},
      body: JSON.stringify({userName: username, password: password})
    };

    try {
      const response = await fetch(url, options);
      const data = await response.json();
      console.log(response);
      console.log(data);
      if(!response.ok){
        setIsLoginError(true)
        setLoginErrorMsg(data.detail? data.detail : "An unexpected error occurred.");
        return false;
      }
      return true;
    } catch (error) {
      console.error(error);
      return false;
    }
  }

  async function performGetCredentials() {
    const url = `${process.env.EXPO_PUBLIC_API_URL}/credentials`;
    
    const options = {
      method: 'GET',
      credentials: 'include' as RequestCredentials,
      headers: {'content-type': 'application/json'},
    };

    try {
      const response = await fetch(url, options);
      const data = await response.json();
      console.log(response);
      console.log(data);
      if(response.ok){
        await Storage.save("user_role", data.token_content.role);
      }
    } catch (error) {
      console.error(error);
    }
  }

  return (
      <VStack>
        <Heading>Login to your account</Heading>
        <HStack space="xs">
          <Heading size={"xs"}>Don&apos;t have an account?</Heading>
          <RouterLink href="/signup">
            <LinkText size="xs">Sign up</LinkText>
          </RouterLink>
        </HStack>
        <FormControl
          isInvalid = {isUsernameInvalid}
          isDisabled={false}
          isReadOnly={false}
          isRequired={true}
        >
          <FormControlLabel >
            <FormControlLabelText>Username</FormControlLabelText>
          </FormControlLabel>
          <Input className="my-1">
            <InputField
              type="text"
              placeholder="username"
              value={usernameInputValue}
              onChangeText={(text) => setUsernameInputValue(text)}
            />
          </Input>
          <FormControlHelper>
            <FormControlHelperText>
              Your username.
            </FormControlHelperText>
          </FormControlHelper>
          <FormControlError>
            <FormControlErrorIcon as={AlertCircleIcon} className="text-red-500" />
            <FormControlErrorText className="text-red-500">
              <Text>{loginErrorMsg}</Text>
            </FormControlErrorText>
            <FormControlErrorIcon as={AlertCircleIcon} className="text-red-500" />
            <FormControlErrorText className="text-red-500">
              Invalid.
            </FormControlErrorText>
          </FormControlError>
        </FormControl>

        <FormControl
          isInvalid={isPasswordInvalid}
          isDisabled={false}
          isReadOnly={false}
          isRequired={true}
        >
          <FormControlLabel >
            <FormControlLabelText>Password</FormControlLabelText>
          </FormControlLabel>
          <Input className="my-1">
            <InputField
              type={showPassword ? 'text' : 'password'}
              placeholder="password"
              value={passwordInputValue}
              onChangeText={(text) => setPasswordInputValue(text)
              }
            />
            <InputSlot className="pr-3" onPress={handleState}>
                <InputIcon as={showPassword ? EyeIcon : EyeOffIcon} />
            </InputSlot>
          </Input>
          <FormControlHelper>
            <FormControlHelperText>
              Must be at least 8 characters 1 special character and 1 number.
            </FormControlHelperText>
          </FormControlHelper>
          <FormControlError>
            <FormControlErrorIcon as={AlertCircleIcon} className="text-red-500" />
            <FormControlErrorText className="text-red-500">
              Cannot be blank.
            </FormControlErrorText>
          </FormControlError>
        </FormControl>
        
        <FormControl
        isInvalid = {isLoginError}
        isDisabled={false}
        isReadOnly={false}
        isRequired={true}> 
          <FormControlError>
            <FormControlErrorIcon as={AlertCircleIcon} className="text-red-500" />
            <FormControlErrorText className="text-red-500">
              <Text>{loginErrorMsg}</Text>
            </FormControlErrorText>
          </FormControlError>
        </FormControl>

        <Button
          className="w-fit self-end mt-4"
          size="sm"
          variant="outline"
          onPress={handleSubmit}
        >
          <ButtonText>Login</ButtonText>
          {isLoading && <ButtonSpinner color="gray" />}
        </Button>
      </VStack>
  );
}
