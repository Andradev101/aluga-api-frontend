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
import { Link as RouterLink } from 'expo-router';
import React from 'react';
import { DatePicker } from './datepicker';

export function Signup() {
  const [isLoading, setIsLoading] = React.useState(false);
  const [showDatePicker, setShowDatePicker] = React.useState(false);

  const [form, setForm] = React.useState({
    username: { value: '', isTouched: false },
    password: { value: '', isTouched: false },
    birthDate: { value: new Date(), isTouched: false },
    email: { value: '', isTouched: false },
    phone: { value: '', isTouched: false },
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

  function handleSubmit() {
    setIsLoading(true)
    
    for (const [key, fieldProps] of Object.entries(form)) {
      // console.log(key, [fieldProps.value, fieldProps.isTouched]);
      if (!fieldProps.value) {
        setIsLoading(false)
        return;
      }
      
    }
    let body = JSON.stringify({
        "userName": form.username.value,
        "password": form.password.value,
        "role": "customer",
        "birthDate": form.birthDate.value,
        "emailAddress": form.email.value,
        "phoneNumber": form.phone.value,
        "firstName": form.firstName.value,
        "lastName": form.lastName.value,
        "address": form.address.value
      })
    console.log(body)
    performRegisterCallout(body)
    setIsLoading(false)
  };

  async function performRegisterCallout(payload: any) {
    const url = 'https://192.168.0.9:8000/users';
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

  const handleDateChange = (newDate: Date) => {
    setForm((prev) => ({
      ...prev,
      birthDate: { value: newDate, isTouched: true },
    }));
  };

  return (
        <VStack>
          <Heading>Create a new account</Heading>
          <HStack space="xs">
            <Heading size={"xs"}>Already have have an account?</Heading>
            <RouterLink href="/login">
              <LinkText size="xs">Login</LinkText>
            </RouterLink>
          </HStack>

          {/* Username */}
          <FormControl isInvalid={checkBlankField(form.username)} isRequired>
            <FormControlLabel>
              <FormControlLabelText>Username</FormControlLabelText>
            </FormControlLabel>
            <Input className="my-1">
              <InputField
                type="text"
                placeholder="username"
                value={form.username.value}
                onChangeText={(text) =>
                  setForm(prev => ({
                    ...prev,
                    username: { ...prev.username, value: text }
                  }))
                }
                onBlur={() =>
                  setForm(prev => ({
                    ...prev,
                    username: { ...prev.username, isTouched: true }
                  }))
                }
              />
            </Input>
            <FormControlHelper>
              <FormControlHelperText>Your username.</FormControlHelperText>
            </FormControlHelper>
            <FormControlError>
              <FormControlErrorIcon as={AlertCircleIcon} className="text-red-500" />
              <FormControlErrorText className="text-red-500">Cannot be blank.</FormControlErrorText>
            </FormControlError>
          </FormControl>

          {/* Password */}
          <FormControl isInvalid={checkBlankField(form.password)} isRequired>
            <FormControlLabel>
              <FormControlLabelText>Password</FormControlLabelText>
            </FormControlLabel>
            <Input className="my-1">
              <InputField
                type={showPassword ? 'text' : 'password'}
                placeholder="password"
                value={form.password.value}
                onChangeText={(text) =>
                  setForm(prev => ({
                    ...prev,
                    password: { ...prev.password, value: text }}))}
                onBlur={() =>
                  setForm(prev => ({
                    ...prev,
                    password: { ...prev.password, isTouched: true }}))}
              />
              <InputSlot className="pr-3" onPress={handleState}>
                  <InputIcon as={showPassword ? EyeIcon : EyeOffIcon} />
              </InputSlot>
            </Input>
            {/* <Input className="my-1">
              <InputField
                type="password"
                placeholder="password"
                value={form.password.value}
                onChangeText={(text) =>
                  setForm(prev => ({
                    ...prev,
                    password: { ...prev.password, value: text }
                  }))
                }
                onBlur={() =>
                  setForm(prev => ({
                    ...prev,
                    password: { ...prev.password, isTouched: true }
                  }))
                }
              />
            </Input> */}
            <FormControlHelper>
              <FormControlHelperText>Your password.</FormControlHelperText>
            </FormControlHelper>
            <FormControlError>
              <FormControlErrorIcon as={AlertCircleIcon} className="text-red-500" />
              <FormControlErrorText className="text-red-500">Cannot be blank.</FormControlErrorText>
            </FormControlError>
          </FormControl>

          {/* Birth Date */}
          {/* <P>{JSON.stringify(form.birthDate.value)}</P> */}
          <FormControl isInvalid={checkBlankField(form.birthDate)} isRequired>
            <FormControlLabel>
              <FormControlLabelText>Birth Date</FormControlLabelText>
            </FormControlLabel>
              <DatePicker date={form.birthDate.value} onDateChange={handleDateChange} />
            <FormControlHelper>
              <FormControlHelperText>Your birth date.</FormControlHelperText>
            </FormControlHelper>
            <FormControlError>
              <FormControlErrorIcon as={AlertCircleIcon} className="text-red-500" />
              <FormControlErrorText className="text-red-500">Cannot be blank.</FormControlErrorText>
            </FormControlError>
          </FormControl>

          {/* Email */}
          <FormControl isInvalid={checkBlankField(form.email)} isRequired>
            <FormControlLabel>
              <FormControlLabelText>Email</FormControlLabelText>
            </FormControlLabel>
            <Input className="my-1">
              <InputField
                type="text"
                placeholder="email@example.com"
                value={form.email.value}
                onChangeText={(text) =>
                  setForm(prev => ({
                    ...prev,
                    email: { ...prev.email, value: text }
                  }))
                }
                onBlur={() =>
                  setForm(prev => ({
                    ...prev,
                    email: { ...prev.email, isTouched: true }
                  }))
                }
              />
            </Input>
            <FormControlHelper>
              <FormControlHelperText>Your email address.</FormControlHelperText>
            </FormControlHelper>
            <FormControlError>
              <FormControlErrorIcon as={AlertCircleIcon} className="text-red-500" />
              <FormControlErrorText className="text-red-500">Cannot be blank.</FormControlErrorText>
            </FormControlError>
          </FormControl>

          {/* Phone */}
          <FormControl isInvalid={checkBlankField(form.phone)} isRequired>
            <FormControlLabel>
              <FormControlLabelText>Phone</FormControlLabelText>
            </FormControlLabel>
            <Input className="my-1">
              <InputField
                type="text"
                placeholder="+1-123-456-7890"
                value={form.phone.value}
                onChangeText={(text) =>
                  setForm(prev => ({
                    ...prev,
                    phone: { ...prev.phone, value: text }
                  }))
                }
                onBlur={() =>
                  setForm(prev => ({
                    ...prev,
                    phone: { ...prev.phone, isTouched: true }
                  }))
                }
              />
            </Input>
            <FormControlHelper>
              <FormControlHelperText>Your phone number.</FormControlHelperText>
            </FormControlHelper>
            <FormControlError>
              <FormControlErrorIcon as={AlertCircleIcon} className="text-red-500" />
              <FormControlErrorText className="text-red-500">Cannot be blank.</FormControlErrorText>
            </FormControlError>
          </FormControl>

          {/* First Name */}
          <FormControl isInvalid={checkBlankField(form.firstName)} isRequired>
            <FormControlLabel>
              <FormControlLabelText>First Name</FormControlLabelText>
            </FormControlLabel>
            <Input className="my-1">
              <InputField
                type="text"
                placeholder="John"
                value={form.firstName.value}
                onChangeText={(text) =>
                  setForm(prev => ({
                    ...prev,
                    firstName: { ...prev.firstName, value: text }
                  }))
                }
                onBlur={() =>
                  setForm(prev => ({
                    ...prev,
                    firstName: { ...prev.firstName, isTouched: true }
                  }))
                }
              />
            </Input>
            <FormControlHelper>
              <FormControlHelperText>Your first name.</FormControlHelperText>
            </FormControlHelper>
            <FormControlError>
              <FormControlErrorIcon as={AlertCircleIcon} className="text-red-500" />
              <FormControlErrorText className="text-red-500">Cannot be blank.</FormControlErrorText>
            </FormControlError>
          </FormControl>

          {/* Last Name */}
          <FormControl isInvalid={checkBlankField(form.lastName)} isRequired>
            <FormControlLabel>
              <FormControlLabelText>Last Name</FormControlLabelText>
            </FormControlLabel>
            <Input className="my-1">
              <InputField
                type="text"
                placeholder="Doe"
                value={form.lastName.value}
                onChangeText={(text) =>
                  setForm(prev => ({
                    ...prev,
                    lastName: { ...prev.lastName, value: text }
                  }))
                }
                onBlur={() =>
                  setForm(prev => ({
                    ...prev,
                    lastName: { ...prev.lastName, isTouched: true }
                  }))
                }
              />
            </Input>
            <FormControlHelper>
              <FormControlHelperText>Your last name.</FormControlHelperText>
            </FormControlHelper>
            <FormControlError>
              <FormControlErrorIcon as={AlertCircleIcon} className="text-red-500" />
              <FormControlErrorText className="text-red-500">Cannot be blank.</FormControlErrorText>
            </FormControlError>
          </FormControl>

          {/* Address */}
          <FormControl isInvalid={checkBlankField(form.address)} isRequired>
            <FormControlLabel>
              <FormControlLabelText>Address</FormControlLabelText>
            </FormControlLabel>
            <Input className="my-1">
              <InputField
                type="text"
                placeholder="123 Main St"
                value={form.address.value}
                onChangeText={(text) =>
                  setForm(prev => ({
                    ...prev,
                    address: { ...prev.address, value: text }
                  }))
                }
                onBlur={() =>
                  setForm(prev => ({
                    ...prev,
                    address: { ...prev.address, isTouched: true }
                  }))
                }
              />
            </Input>
            <FormControlHelper>
              <FormControlHelperText>Your full address.</FormControlHelperText>
            </FormControlHelper>
            <FormControlError>
              <FormControlErrorIcon as={AlertCircleIcon} className="text-red-500" />
              <FormControlErrorText className="text-red-500">Cannot be blank.</FormControlErrorText>
            </FormControlError>
          </FormControl>

        
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
