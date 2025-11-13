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
import { useAuth } from '@/hooks/useAuth';
import { router, Link as RouterLink } from 'expo-router';
import React from 'react';
import { Text } from 'react-native';



export function Login() {
  const { login } = useAuth()
  
  const [isLoading, setIsLoading] = React.useState(false);
  
  const [usernameInputValue, setUsernameInputValue] = React.useState('');
  const [passwordInputValue, setPasswordInputValue] = React.useState('');
  
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
    let loginRes = await login(usernameInputValue, passwordInputValue);
    let loginResBody = await loginRes.response.json()
    if(loginRes.ok){
      //awaits for the userData value in a useEffect hook to return to perform the router push
      router.push("/homepage")
    } else {
      console.log(loginResBody)
      setIsLoginError(true)
      setLoginErrorMsg(loginResBody?.detail? loginResBody?.detail : "An unexpected error occurred.");
    }
    setIsLoading(false)
  };

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
