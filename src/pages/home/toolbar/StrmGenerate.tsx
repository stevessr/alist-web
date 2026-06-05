import { Show } from "solid-js"
import { useRouter } from "~/hooks"
import { me, objStore } from "~/store"
import { StrmGenerateButton } from "~/pages/manage/storages/StrmGenerate"

export const ToolbarStrmGenerate = () => {
  const { pathname } = useRouter()
  const isAdmin = () => (me().role || []).includes(2)
  const isStrm = () => objStore.provider === "Strm"
  return (
    <Show when={isAdmin() && isStrm()}>
      <StrmGenerateButton path={pathname()} />
    </Show>
  )
}
