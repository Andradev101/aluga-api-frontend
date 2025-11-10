import {
  Avatar,
  AvatarBadge,
  AvatarFallbackText
} from '@/components/ui/avatar';
import { HStack } from "@/components/ui/hstack";
import {
  ChevronDownIcon,
  CloseCircleIcon,
  EditIcon,
  Icon,
  StarIcon
} from "@/components/ui/icon";
import { Menu, MenuItem, MenuItemLabel, MenuSeparator } from "@/components/ui/menu";
import { Pressable } from "@/components/ui/pressable";
import { Text } from "@/components/ui/text";
import { router } from 'expo-router';


interface Dependencies {
  userData: any
  logout: any
}

export function UserNav({ userData, logout }: Dependencies) {
  return (
    <HStack className='justify-between bg-primary-500'>
      <Pressable
        onPress={() => router.push("/homepage")}
        className="p-4 bg-primary-500"
      >
        <Text className="text-typography-0">Logo</Text>
      </Pressable>

      <Menu
          placement="bottom right"
          offset={5}
          disabledKeys={["Welcome"]}
          trigger={({ ...triggerProps }) => {
            return (
              <Pressable {...triggerProps}
                className="p-4 bg-primary-500"
              >
                <HStack space="md" reversed={false}>
                  <Avatar size="sm">
                    <AvatarFallbackText>{userData?.token_content?.userName}</AvatarFallbackText>
                    <AvatarBadge />
                  </Avatar>
                  <Text className="text-typography-0">{(userData?.token_content?.userName)}</Text>
                  <Icon as={ChevronDownIcon} size="lg" className="text-typography-0"/>
                </HStack>
              </Pressable>
            );
          }}
        >
      {
        userData?.token_content?.role === "sysAdmin" &&
        <>
          <MenuItem key="Admin Page" textValue="Admin Page" onPress={() => router.push("/admin")}>
            <Icon as={StarIcon} size="sm" className="mr-2" />
            <MenuItemLabel size="sm">Admin Page</MenuItemLabel>
          </MenuItem>
          <MenuSeparator />
        </>
      }
        <MenuItem key="My Profile" textValue="My Profile" onPress={() => {router.push("/self")}}>
          <Icon as={EditIcon} size="sm" className="mr-2" />
          <MenuItemLabel size="sm">My Profile</MenuItemLabel>
        </MenuItem>
        <MenuSeparator />
        <MenuItem key="Logout" textValue="Logout" onPress={() => logout()}>
          <Icon as={CloseCircleIcon} size="sm" className="mr-2" />
          <MenuItemLabel size="sm">Logout</MenuItemLabel>
        </MenuItem>
      </Menu>
    </HStack>
  );
}
