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


export function Login() {
  const [isLoading, setIsLoading] = React.useState(false);
  
  const [usernameInputValue, setUsernameInputValue] = React.useState('');
  const [passwordInputValue, setPasswordInputValue] = React.useState('');
  
  const [isUsernameInvalid, setIsUsernameInvalid] = React.useState(false);
  const [isPasswordInvalid, setIsPasswordInvalid] = React.useState(false);
  const [showPassword, setShowPassword] = React.useState(false);
  const handleState = () => {
    setShowPassword((showState) => {
      return !showState;
    });
  };

  async function handleSubmit() {
    setIsLoading(true)
    
    setIsPasswordInvalid(false);
    setIsUsernameInvalid(false);
    if(!usernameInputValue || !passwordInputValue) {
      if(!usernameInputValue) setIsUsernameInvalid(true);
      if(!passwordInputValue) setIsPasswordInvalid(true);
      setIsLoading(false);
      return;
    }
    
    await performLoginCallout(usernameInputValue, passwordInputValue);
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
      if(response.ok){
        router.push('/')
      } else {
        // setLoginError(data);
      }
    } catch (error) {
      console.error(error);
    }
  }

  return (
      <VStack>
        <Heading>Login to your account</Heading>
        <HStack space="lg">
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
              Cannot be blank.
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
              Must be at least 6 characters.
            </FormControlHelperText>
          </FormControlHelper>
          <FormControlError>
            <FormControlErrorIcon as={AlertCircleIcon} className="text-red-500" />
            <FormControlErrorText className="text-red-500">
              Cannot be blank.
            </FormControlErrorText>
          </FormControlError>
        </FormControl>
        
        <Button
          className="w-fit self-end mt-4"
          size="sm"
          variant="outline"
          onPress={handleSubmit}
        >
          {isLoading && <ButtonSpinner color="gray" />}
          <ButtonText>Login</ButtonText>
        </Button>
      </VStack>
  );
}
