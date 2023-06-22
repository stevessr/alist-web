import {
  Badge,
  createDisclosure,
  HStack,
  Icon,
  IconButton,
  Input,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalHeader,
  ModalOverlay,
  Text,
  VStack,
} from "@hope-ui/solid"
import { BsSearch } from "solid-icons/bs"
import { createSignal, For, Match, onCleanup, Show, Switch } from "solid-js"
import { FullLoading, LinkWithBase, Paginator } from "~/components"
import { useFetch, usePath, useRouter, useT } from "~/hooks"
import { getMainColor, me, password } from "~/store"
import { SearchNode } from "~/types"
import {
  bus,
  fsSearch,
  getFileSize,
  handleResp,
  hoverColor,
  pathJoin,
} from "~/utils"
import { isMac } from "~/utils/compatibility"
import { getIconByObj } from "~/utils/icon"

const SearchResult = (props: SearchNode) => {
  const { setPathAs } = usePath()
  return (
    <HStack
      w="$full"
      borderBottom={`1px solid ${hoverColor()}`}
      _hover={{
        bgColor: hoverColor(),
      }}
      rounded="$md"
      cursor="pointer"
      px="$2"
      as={LinkWithBase}
      href={props.path}
      encode
      onMouseEnter={() => {
        setPathAs(props.path, props.is_dir)
      }}
    >
      <Icon
        class="icon"
        boxSize="$6"
        color={getMainColor()}
        as={getIconByObj(props)}
        mr="$1"
      />
      <VStack flex={1} p="$1" spacing="$1" w="$full" alignItems="start">
        <Text
          css={{
            wordBreak: "break-all",
          }}
        >
          {props.name}
          <Show when={props.size > 0 || !props.is_dir}>
            <Badge colorScheme="info" ml="$2">
              {getFileSize(props.size)}
            </Badge>
          </Show>
        </Text>
        <Text
          color="$neutral10"
          size="xs"
          css={{
            wordBreak: "break-all",
          }}
        >
          {props.parent}
        </Text>
      </VStack>
    </HStack>
  )
}

const Search = () => {
  const { isOpen, onOpen, onClose, onToggle } = createDisclosure()
  const t = useT()
  const handler = (name: string) => {
    if (name === "search") {
      onOpen()
    }
  }
  bus.on("tool", handler)
  const searchEvent = (e: KeyboardEvent) => {
    if ((e.ctrlKey || (isMac && e.metaKey)) && e.key.toLowerCase() === "k") {
      e.preventDefault()
      onToggle()
    }
  }
  document.addEventListener("keydown", searchEvent)
  onCleanup(() => {
    bus.off("tool", handler)
    document.removeEventListener("keydown", searchEvent)
  })
  const [keywords, setKeywords] = createSignal("")
  const { pathname } = useRouter()
  const [loading, searchReq] = useFetch(fsSearch)
  const [data, setData] = createSignal({
    content: [] as SearchNode[],
    total: 0,
  })

  const search = async (page = 1) => {
    if (loading()) return
    setData({
      content: [],
      total: 0,
    })
    const resp = await searchReq(pathname(), keywords(), password(), page)
    handleResp(resp, (data) => {
      const content = data.content
      if (!content) {
        return
      }
      content.forEach((node) => {
        if (me().base_path && node.parent.startsWith(me().base_path)) {
          const pattern = new RegExp("^" + me().base_path)
          node.parent = node.parent.replace(pattern, "") || "/"
          if (!node.parent.startsWith("/")) {
            node.parent = "/" + node.parent
          }
        }
        node.path = pathJoin(node.parent, node.name)
      })
      setData(data)
    })
  }
  return (
    <Modal
      // blockScrollOnMount={false}
      opened={isOpen()}
      onClose={onClose}
      closeOnEsc={false}
      size={{
        "@initial": "sm",
        "@sm": "lg",
        "@md": "2xl",
      }}
      initialFocus="#search-input"
      scrollBehavior="inside"
    >
      <ModalOverlay bg="$blackAlpha5" />
      <ModalContent mx="$2">
        <ModalCloseButton />
        <ModalHeader>{t("home.search.search")}</ModalHeader>
        <ModalBody>
          <VStack w="$full" spacing="$2">
            <HStack w="$full" spacing="$2">
              <Input
                id="search-input"
                value={keywords()}
                onInput={(e) => {
                  setKeywords(e.currentTarget.value)
                }}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && keywords().length !== 0) {
                    search()
                  }
                }}
              />
              <IconButton
                aria-label="search"
                icon={<BsSearch />}
                onClick={() => search()}
                loading={loading()}
                disabled={keywords().length === 0}
              />
            </HStack>
            <Switch>
              <Match when={loading()}>
                <FullLoading />
              </Match>
              <Match when={data().content.length === 0}>
                <Text size="2xl" my="$8">
                  {t("home.search.no_result")}
                </Text>
              </Match>
            </Switch>
            <VStack w="$full">
              <For each={data().content}>
                {(item) => <SearchResult {...item} />}
              </For>
            </VStack>
            <Show when={data().total > 0}>
              <Paginator
                total={data().total}
                defaultPageSize={100}
                onChange={(page) => {
                  search(page)
                }}
              />
            </Show>
          </VStack>
        </ModalBody>
      </ModalContent>
    </Modal>
  )
}

export { Search }
