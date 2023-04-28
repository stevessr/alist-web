import {
  Alert,
  AlertDescription,
  AlertIcon,
  AlertTitle,
  Badge,
  Button,
  FormControl,
  FormHelperText,
  FormLabel,
  Heading,
  HStack,
  Input,
  SimpleGrid,
  VStack,
  Text,
} from "@hope-ui/solid"
import { createSignal, For, JSXElement, onCleanup, Show } from "solid-js"
import { LinkWithBase } from "~/components"
import { useFetch, useManageTitle, useRouter, useT } from "~/hooks"
import { setMe, me, getSettingBool } from "~/store"
import { PEmptyResp, UserMethods, UserPermissions } from "~/types"
import { handleResp, notify, r } from "~/utils"

const PermissionBadge = (props: { can: boolean; children: JSXElement }) => {
  return (
    <Badge colorScheme={props.can ? "success" : "danger"}>
      {props.children}
    </Badge>
  )
}

const Profile = () => {
  const t = useT()
  useManageTitle("manage.sidemenu.profile")
  const { to, searchParams } = useRouter()
  const [username, setUsername] = createSignal(me().username)
  const [password, setPassword] = createSignal("")
  const [loading, save] = useFetch(
    (ssoID?: boolean): PEmptyResp =>
      r.post("/me/update", {
        username: ssoID ? me().username : username(),
        password: ssoID ? "" : password(),
        sso_id: me().sso_id,
      })
  )
  const saveMe = async (ssoID?: boolean) => {
    const resp = await save(ssoID)
    handleResp(resp, () => {
      setMe({ ...me(), username: username() })
      if (!ssoID) {
        notify.success(t("users.update_profile_success"))
        to(`/@login?redirect=${encodeURIComponent(location.pathname)}`)
      } else {
        to("")
      }
    })
  }
  function messageEvent(event: MessageEvent) {
    const data = event.data
    if (data.sso_id) {
      setMe({ ...me(), sso_id: data.sso_id })
      saveMe(true)
    }
  }
  window.addEventListener("message", messageEvent)
  onCleanup(() => {
    window.removeEventListener("message", messageEvent)
  })
  return (
    <VStack w="$full" spacing="$4" alignItems="start">
      <Show
        when={!UserMethods.is_guest(me())}
        fallback={
          <>
            <Alert
              status="warning"
              flexDirection={{
                "@initial": "column",
                "@lg": "row",
              }}
            >
              <AlertIcon mr="$2_5" />
              //<AlertTitle mr="$2_5">{t("users.guest-tips")}</AlertTitle>
              <AlertTitle mr="$2_5">{t("已关闭")}</AlertTitle>
              <AlertDescription>{t("users.modify_nothing")}</AlertDescription>
            </Alert>
            <HStack spacing="$2">
              <Text>{t("global.have_account")}</Text>
              <Text
                color="$info9"
                as={LinkWithBase}
                href={`/@login?redirect=${encodeURIComponent(
                  location.pathname
                )}`}
              >
                {t("global.go_login")}
              </Text>
              {/* 图片内容可以自己换或者不要都行 */}
              <img src="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTI1MiIgaGVpZ2h0PSIxMjUyIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZlcnNpb249IjEuMSI+CiA8Zz4KICA8ZyBpZD0iIzcwYzZiZWZmIj4KICAgPHBhdGggaWQ9InN2Z18yIiBkPSJtNjM0LjM3LDEzOC4zOGMxMS44OCwtMS4zNiAyNC4yNSwxLjMgMzQuMTgsOC4wOWMxNC45Niw5LjY2IDI1LjU1LDI0LjQxIDM0LjQ5LDM5LjUxYzQwLjU5LDY4LjAzIDgxLjQ1LDEzNS45MSAxMjIuMDIsMjAzLjk2YzU0LjAyLDkwLjk5IDEwOC4wNiwxODEuOTcgMTYxLjk0LDI3My4wNmMzNy4yOCw2MyA3NC42NSwxMjUuOTYgMTEyLjE4LDE4OC44MmMyNC43Miw0MS45OSA1MC4yMSw4My41NCA3My44NCwxMjYuMTZjMTAuMTgsMTcuODQgMTUuNzcsMzguNDQgMTQuOTMsNTkuMDNjLTAuNTksMTUuOTIgLTMuNDgsMzIuMjggLTExLjg0LDQ2LjA4Yy0xMS43MywxOS40NiAtMzEuMzksMzMuMiAtNTIuNzEsNDAuMzZjLTExLjM3LDQuMDkgLTIzLjMsNi44NyAtMzUuNDMsNi44OWMtMTMyLjMyLC0wLjA1IC0yNjQuNjQsMC4wNCAtMzk2Ljk1LDAuMDNjLTExLjM4LC0wLjI5IC0yMi45NSwtMS42IC0zMy42MywtNS43MmMtNy44MSwtMy4zMyAtMTUuNSwtNy40MyAtMjEuNjEsLTEzLjQyYy0xMC40MywtMTAuMzIgLTE3LjE5LC0yNC45NiAtMTUuMzgsLTM5LjgzYzAuOTQsLTEwLjM5IDMuNDgsLTIwLjY0IDcuNzYsLTMwLjE2YzQuMTUsLTkuNzcgOS45OSwtMTguNjcgMTUuMDYsLTI3Ljk3YzIyLjEzLC0zOS40NyA0NS4zMSwtNzguMzUgNjkuNDIsLTExNi42NWM3LjcyLC0xMi4wNSAxNC40NCwtMjUuMDcgMjUuMTIsLTM0Ljg3YzExLjM1LC0xMC4zOSAyNS42LC0xOC41NCA0MS4yMSwtMTkuNmMxMi41NSwtMC41MiAyNC44OSwzLjgyIDM1LjM1LDEwLjU1YzExLjgsNi45MiAyMS4wOSwxOC40NCAyNC4yLDMxLjg4YzQuNDksMTcuMDEgLTAuMzQsMzQuODggLTcuNTUsNTAuNDJjLTguMDksMTcuNjUgLTE5LjYyLDMzLjY3IC0yNS44MSw1Mi4xOGMtMS4xMyw0LjIxIC0yLjY2LDkuNTIgMC40OCwxMy4yM2MzLjE5LDMgNy42Miw0LjE4IDExLjc3LDUuMjJjMTIsMi42NyAyNC4zOCwxLjk4IDM2LjU5LDIuMDZjNDUsLTAuMDEgOTAsMCAxMzUsMGM4LjkxLC0wLjE1IDE3LjgzLDAuMyAyNi43NCwtMC4yMmM2LjQzLC0wLjc0IDEzLjQ0LC0xLjc5IDE4LjQ0LC02LjI4YzMuMywtMi45MiAzLjcxLC03Ljg1IDIuNDYsLTExLjg1Yy0yLjc0LC04Ljg2IC03LjQ2LC0xNi45MyAtMTIuMTIsLTI0Ljg5Yy0xMTkuOTksLTIwNC45MSAtMjM5LjMxLC00MTAuMjIgLTM2MC41NiwtNjE0LjRjLTMuOTYsLTYuNTYgLTcuMzYsLTEzLjY4IC0xMy4wMywtMTguOThjLTIuOCwtMi42OSAtNi45NSwtNC4yMiAtMTAuNzcsLTMuMTFjLTMuMjUsMS4xNyAtNS40NSw0LjAzIC03LjYxLDYuNTdjLTUuMzQsNi44MSAtMTAuMTIsMTQuMDYgLTE0LjUxLDIxLjUyYy0yMC44OSwzMy45NSAtNDAuODgsNjguNDQgLTYxLjM1LDEwMi42NGMtMTE3LjksMTk4LjQzIC0yMzUuODIsMzk2Ljg1IC0zNTMuNzEsNTk1LjI5Yy03LjMxLDEzLjQ2IC0xNS4wOSwyNi42NyAtMjMuNTcsMzkuNDNjLTcuNDUsMTAuOTYgLTE2LjQ5LDIxLjIzIC0yOC4xNCwyNy44M2MtMTMuNzMsNy45NCAtMzAuNjksMTEuMDkgLTQ2LjA4LDYuNTRjLTExLjIzLC0zLjQ3IC0yMi4wOSwtOS4xMiAtMzAuMTMsLTE3Ljg0Yy0xMC4xOCwtMTAuMDggLTE0LjY5LC0yNC44MyAtMTQuMTcsLTM4Ljk0YzAuNTIsLTE0Ljg2IDUuNDksLTI5LjM0IDEyLjk4LC00Mi4xYzcxLjU4LC0xMjEuNTkgMTQzLjYyLC0yNDIuOTIgMjE1LjkzLC0zNjQuMDljMzcuMiwtNjIuOCA3NC4yMywtMTI1LjY5IDExMS42NCwtMTg4LjM2YzM3Ljg0LC02My41IDc1Ljc3LC0xMjYuOTQgMTEzLjQ0LC0xOTAuNTRjMjEuMDIsLTM1LjgyIDQyLjE5LC03MS41NiA2NC4yOCwtMTA2Ljc0YzYuNzksLTExLjE1IDE1LjU4LC0yMS4xNSAyNi4xNiwtMjguODVjOC42OCwtNS45MiAxOC40MiwtMTEgMjkuMDUsLTExLjk0eiIgZmlsbD0iIzcwYzZiZSIvPgogIDwvZz4KICA8ZyBpZD0iIzFiYTBkOGZmIj4KICAgPHBhdGggaWQ9InN2Z18zIiBkPSJtNjI4LjM1LDYwOC4zOGMxNy44MywtMi44NyAzNi43MiwxLjM5IDUxLjUsMTEuNzhjMTEuMjIsOC42NiAxOS4wMSwyMS42NCAyMS4yNiwzNS42NWMxLjUzLDEwLjY4IDAuNDksMjEuNzUgLTMuNDQsMzEuODRjLTMuMDIsOC43MyAtNy4zNSwxNi45NCAtMTIuMTcsMjQuODFjLTY4Ljc2LDExNS41OCAtMTM3LjUsMjMxLjE3IC0yMDYuMjcsMzQ2Ljc1Yy04LjgsMTQuNDcgLTE2LjgyLDI5LjQ3IC0yNi45Niw0My4wN2MtNy4zNyw5LjExIC0xNi41OCwxNi44NSAtMjcuMjEsMjEuODljLTIyLjQ3LDExLjk3IC01MS43OSw0LjY3IC02OC44OCwtMTMuMzNjLTguNjYsLTguNjkgLTEzLjc0LC0yMC42MyAtMTQuNCwtMzIuODRjLTAuOTgsLTEyLjY0IDEuODEsLTI1LjQyIDcuNTMsLTM2LjY5YzUuMDMsLTEwLjk2IDEwLjk4LC0yMS40NSAxNy4xOSwtMzEuNzdjMzAuMjIsLTUwLjg0IDYwLjE3LC0xMDEuODQgOTAuMywtMTUyLjczYzQxLjI0LC02OS45OCA4My4xNiwtMTM5LjU1IDEyNC42NiwtMjA5LjM3YzQuNDEsLTcuOTQgOS45MSwtMTUuMjYgMTYuMDksLTIxLjljOC4zMywtOC40NiAxOC45LC0xNS4zIDMwLjgsLTE3LjE2eiIgZmlsbD0iIzFiYTBkOCIvPgogIDwvZz4KIDwvZz4KPC9zdmc+" width="50%" height ="50%"></img>
            </HStack>
          </>
        }
      >
        <Heading>{t("users.update_profile")}</Heading>
        <SimpleGrid gap="$2" columns={{ "@initial": 1, "@md": 2 }}>
          <FormControl>
            <FormLabel for="username">{t("users.change_username")}</FormLabel>
            <Input
              id="username"
              value={username()}
              onInput={(e) => {
                setUsername(e.currentTarget.value)
              }}
            />
          </FormControl>
          <FormControl>
            <FormLabel for="password">{t("users.change_password")}</FormLabel>
            <Input
              id="password"
              type="password"
              placeholder="********"
              value={password()}
              onInput={(e) => {
                setPassword(e.currentTarget.value)
              }}
            />
            <FormHelperText>{t("users.change_password-tips")}</FormHelperText>
          </FormControl>
        </SimpleGrid>
        <HStack spacing="$2">
          <Button loading={loading()} onClick={[saveMe, false]}>
            {t("global.save")}
          </Button>
          <Show when={!me().otp}>
            <Button
              colorScheme="accent"
              onClick={() => {
                to("/stevessrmanage/2fa")
              }}
            >
              {t("users.enable_2fa")}
            </Button>
          </Show>
        </HStack>
      </Show>
      <Show
        when={
          getSettingBool("sso_login_enabled") && !UserMethods.is_guest(me())
        }
      >
        <Heading>{t("users.sso_login")}</Heading>
        <HStack spacing="$2">
          <Show
            when={me().sso_id}
            fallback={
              <Button
                onClick={() => {
                  const url = r.getUri() + "/auth/sso?method=get_sso_id"
                  const popup = window.open(
                    url,
                    "authPopup",
                    "width=500,height=600"
                  )
                }}
              >
                {t("users.connect_sso")}
              </Button>
            }
          >
            <Button
              colorScheme="danger"
              loading={loading()}
              onClick={() => {
                setMe({ ...me(), sso_id: "" })
                saveMe(true)
              }}
            >
              {t("users.disconnect_sso")}
            </Button>
          </Show>
        </HStack>
      </Show>
      <HStack wrap="wrap" gap="$2" mt="$2">
        <For each={UserPermissions}>
          {(item, i) => (
            <PermissionBadge can={UserMethods.can(me(), i())}>
              {t(`users.permissions.${item}`)}
            </PermissionBadge>
          )}
        </For>
      </HStack>
    </VStack>
  )
}

export default Profile
