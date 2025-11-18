import { Alert, AlertIcon, AlertText } from "@/components/ui/alert";
import { Button, ButtonSpinner, ButtonText } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  FormControl,
  FormControlError,
  FormControlErrorText,
  FormControlHelper,
  FormControlHelperText,
  FormControlLabel,
  FormControlLabelText,
} from "@/components/ui/form-control";
import { Heading } from "@/components/ui/heading";
import { HStack } from "@/components/ui/hstack";
import { EyeIcon, EyeOffIcon, InfoIcon } from "@/components/ui/icon";
import { Input, InputField, InputIcon, InputSlot } from "@/components/ui/input";
import { LinkText } from "@/components/ui/link";
import { Spinner } from "@/components/ui/spinner";
import { VStack } from "@/components/ui/vstack";
import { router, Link as RouterLink } from "expo-router";
import React, { useEffect } from "react";
import { DatePicker } from "./datepicker";


type UserSchemaValue = {
  value: string | Date;
  isTouched: boolean;
  invalidStateMsg?: string;
};

type UserSchema = {
  [key: string]: UserSchemaValue;
};

export function Signup() {
  useEffect(() => {
    handleGetUserSchema();
  }, []);
  const [feedbackMessage, setFeedbackMessage] = React.useState("");
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
    setFeedbackMessage("")
    setIsIntegrationLoading(true);
    let invalidState = false;
    for (const [key, fieldProps] of Object.entries(userSchema)) {
      if (!fieldProps.value) {
        setUserSchema((prev) => ({
          ...prev,
          [key]: { ...prev[key], isTouched: true },
        }));
        setIsIntegrationLoading(false);
        invalidState = true;
      }
    }
    if (invalidState) return;

    let body = JSON.stringify({
      userName: userSchema.userName.value,
      password: userSchema.password.value,
      // role: "customer",
      birthDate: userSchema.birthDate.value,
      emailAddress: userSchema.emailAddress.value,
      phoneNumber: userSchema.phoneNumber.value,
      firstName: userSchema.firstName.value,
      lastName: userSchema.lastName.value,
      address: userSchema.address.value,
    });
    await performRegisterCallout(body);
    setIsIntegrationLoading(false);
  }

  async function performRegisterCallout(payload: any) {
    const url = `${process.env.EXPO_PUBLIC_API_URL}/users`;
    const options = {
      method: "POST",
      credentials: "include" as RequestCredentials,
      headers: { "content-type": "application/json" },
      body: payload,
    };

    try {
      const response = await fetch(url, options);
      const data = await response.json();
      if (response.ok) {
        const msg = data.message || "All good! User Created!";
        setFeedbackMessage(msg);
        setTimeout(() => {
          router.push("/login");
        }, 3000);
      } else {
        if (Array.isArray(data.detail)) {
          data.detail.forEach((element: any) => {
            setUserSchema((prev) => ({
              ...prev,
              [element.loc[1]]: {
                ...prev[element.loc[1]],
                invalidStateMsg: element.msg,
              },
            }));
            setUserSchema((prev) => ({
              ...prev,
              [element.loc[1]]: { ...prev[element.loc[1]], isTouched: true },
            }));
          });
          setFeedbackMessage("error: Please correct the errors above.");
        } else {
          setFeedbackMessage(`error: ${data.detail || "Signup failed."}`);
        }
      }
    } catch (error) {
      setFeedbackMessage("error: Network error, please try again.");
    }
  }

  function checkFieldValidity(obj: any) {
    if (obj.isTouched && obj.invalidStateMsg) return true;
    return false;
  }

  const handleDateChange = (updatedDate: Date) => {
    if (updatedDate && !isNaN(updatedDate.getTime())) {
      setUserSchema((prev) => ({
        ...prev,
        birthDate: {
          value: updatedDate.toISOString().split("T")[0],
          isTouched: true,
        },
      }));
    }
  };

  async function handleGetUserSchema() {
    const url = `${process.env.EXPO_PUBLIC_API_URL}/openapi.json`;
    const options = {
      method: "GET",
      credentials: "include" as RequestCredentials,
      headers: { "content-type": "application/json" },
    };

    try {
      const response = await fetch(url, options);
      const data = await response.json();
      if (response.ok) {
        let userSchemaFields = Object.keys(
          data.components.schemas.UserSignup.properties
        );

        //super important, imposes field behavior for every form field
        let userSchemaForm: any = {};
        userSchemaFields.map((field) => {
          if (field === "birthDate") {
            return (userSchemaForm[field] = {
              value: "1990-01-01",
              isTouched: false,
              invalidStateMsg: "",
            });
          } else {
            return (userSchemaForm[field] = {
              value: "",
              isTouched: false,
              invalidStateMsg: "",
            });
          }
        });

        setUserSchema(userSchemaForm);

        setUserSchemaInfo(data.components.schemas.UserSignup.properties);
        setIsUserSchemaReady(true);
      } else {
      }
    } catch (error) {
      // Silently handle error
    }
  }
  return (
    <Card size="lg" variant="outline" className="m-3">
      <VStack>
        <Heading>Create a new account</Heading>
        <HStack space="xs">
          <Heading size={"xs"}>Already have have an account?</Heading>
          <RouterLink href="/login">
            <LinkText size="xs">Login</LinkText>
          </RouterLink>
        </HStack>

        {!isUserSchemaReady && <Spinner size="large" color="grey" />}

        {isUserSchemaReady &&
          Object.entries(userSchema).map(([key, value]) => {
            const meta = (userSchemaInfo as any)[key]; //god forbid typing

            // console.log(meta)
            if (key === "birthDate") {
              // console.log("birthDate", userSchema[key].value)
              return (
                <>
                  <FormControl
                    isInvalid={checkFieldValidity(userSchema[key])}
                    isRequired
                    size="lg"
                  >
                    <FormControlLabel>
                      <FormControlLabelText>Birth Date</FormControlLabelText>
                    </FormControlLabel>
                    <DatePicker
                      date={
                        userSchema[key].value
                          ? new Date(userSchema[key].value)
                          : new Date("1990-01-01")
                      }
                      onDateChange={handleDateChange}
                    />
                    <FormControlError>
                      <FormControlErrorText className="text-red-500">
                        <Alert action="error" variant="solid" className="p-1">
                          <AlertIcon as={InfoIcon} size="sm" />
                          <AlertText size="xs">
                            {userSchema[key].invalidStateMsg === ""
                              ? "Field cannot be blank."
                              : userSchema[key].invalidStateMsg}
                          </AlertText>
                        </Alert>
                      </FormControlErrorText>
                    </FormControlError>
                    <FormControlHelper>
                      <FormControlHelperText>
                        <Alert action="muted" variant="solid" className="p-1">
                          <AlertIcon as={InfoIcon} size="sm" />
                          <AlertText size="xs">{meta.description}</AlertText>
                        </Alert>
                      </FormControlHelperText>
                    </FormControlHelper>
                  </FormControl>
                </>
              );
            } else {
              return (
                <FormControl
                  isInvalid={
                    userSchema[key].invalidStateMsg !== "" ||
                    (userSchema[key].isTouched && userSchema[key].value === "")
                  }
                  isRequired
                  key={key}
                  size="lg"
                >
                  <FormControlLabel>
                    <FormControlLabelText>{meta.title}</FormControlLabelText>
                  </FormControlLabel>
                  <Input>
                    <InputField
                      // type={meta.format}
                      type={
                        meta.format === "password"
                          ? showPassword
                            ? "text"
                            : meta.format
                          : meta.format
                      }
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
                    {meta.format === "password" && (
                      <InputSlot className="pr-3" onPress={handleState}>
                        <InputIcon as={showPassword ? EyeIcon : EyeOffIcon} />
                      </InputSlot>
                    )}
                  </Input>
                  <FormControlError>
                    <FormControlErrorText className="text-red-500">
                      <Alert action="error" variant="solid" className="p-1">
                        <AlertIcon as={InfoIcon} size="sm" />
                        <AlertText size="xs">
                          {userSchema[key].invalidStateMsg === ""
                            ? "Field cannot be blank."
                            : userSchema[key].invalidStateMsg}
                        </AlertText>
                      </Alert>
                    </FormControlErrorText>
                  </FormControlError>
                  <FormControlHelper>
                    <FormControlHelperText>
                      <Alert action="muted" variant="solid" className="p-1">
                        <AlertIcon as={InfoIcon} size="sm" />
                        <AlertText size="xs">{meta.description}</AlertText>
                      </Alert>
                    </FormControlHelperText>
                  </FormControlHelper>
                </FormControl>
              );
            }
          })}
          {feedbackMessage !== "" && (
            <Alert
              action={feedbackMessage.toLowerCase().includes("error") ? "error" : "success"}
              variant="solid"
              className="p-2 w-full"
            >
              <AlertIcon as={InfoIcon} size="sm" />
              <AlertText size="sm">
                {feedbackMessage}
                {!feedbackMessage.toLowerCase().includes("error") && " — redirecting in 3s… " } 
                {!feedbackMessage.toLowerCase().includes("error") && <ButtonSpinner color="green" />}
              </AlertText>
            </Alert>
          )}
        {isUserSchemaReady && (
          <Button
            className="w-full self-end mt-4"
            size="xl"
            variant="solid"
            action="positive"
            onPress={handleSubmit}
          >
            <ButtonText>Register</ButtonText>
            {isIntegrationLoading && <ButtonSpinner color="gray" />}
          </Button>
        )}
      </VStack>
    </Card>
  );
}
