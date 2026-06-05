import {
  Button,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  Progress,
  ProgressIndicator,
  Text,
  VStack,
} from "@hope-ui/solid"
import { createSignal, onCleanup, Show } from "solid-js"
import { useT } from "~/hooks"
import { r, notify, handleResp } from "~/utils"

export type StrmGenerateButtonProps = {
  path: string
  size?: "xs" | "sm" | "md" | "lg"
  colorScheme?: string
}

type TaskInfo = { id: string; progress: number; state: number; error: string }

export const StrmGenerateButton = (props: StrmGenerateButtonProps) => {
  const t = useT()
  const [opened, setOpened] = createSignal(false)
  const [progress, setProgress] = createSignal(0)
  const [running, setRunning] = createSignal(false)
  const [err, setErr] = createSignal("")
  let timer: ReturnType<typeof setInterval> | undefined

  const stop = () => {
    if (timer) {
      clearInterval(timer)
      timer = undefined
    }
  }
  onCleanup(stop)

  const poll = (tid: string) => {
    stop()
    timer = setInterval(async () => {
      const resp = await r.post(`/admin/task/strm_generate/info?tid=${tid}`)
      handleResp(resp, (info: TaskInfo) => {
        if (info.error) {
          stop()
          setRunning(false)
          setErr(info.error)
          return
        }
        setProgress(Math.floor(info.progress))
        if (info.progress >= 100) {
          stop()
          setRunning(false)
          notify.success(t("global.generate_strm_done"))
        }
      })
    }, 1000)
  }

  const start = async () => {
    setOpened(true)
    setRunning(true)
    setProgress(0)
    setErr("")
    const resp = await r.post("/admin/strm/generate", { path: props.path })
    handleResp(resp, (data: { task: TaskInfo }) => {
      notify.info(t("global.generate_strm_start"))
      poll(data.task.id)
    })
    if ((resp as any).code !== 200) {
      setRunning(false)
    }
  }

  const close = () => {
    stop()
    setOpened(false)
  }

  return (
    <>
      <Button
        size={props.size ?? "sm"}
        colorScheme={(props.colorScheme as any) ?? "accent"}
        onClick={start}
      >
        {t("global.generate_strm")}
      </Button>
      <Modal opened={opened()} onClose={close} blockScrollOnMount={false}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>{t("global.generate_strm")}</ModalHeader>
          <ModalBody>
            <VStack spacing="$3" alignItems="stretch" py="$2">
              <Progress value={progress()} trackColor="$neutral4">
                <ProgressIndicator color="$success9" />
              </Progress>
              <Text>
                <Show
                  when={!err()}
                  fallback={t("global.generate_strm_failed") + ": " + err()}
                >
                  {running()
                    ? t("global.generate_strm_progress") +
                      " " +
                      progress() +
                      "%"
                    : t("global.generate_strm_done")}
                </Show>
              </Text>
            </VStack>
          </ModalBody>
          <ModalFooter>
            <Button colorScheme="neutral" onClick={close}>
              {t("global.close")}
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  )
}
