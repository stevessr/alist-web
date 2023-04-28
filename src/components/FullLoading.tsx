import { Center, ElementType, Spinner, SpinnerProps } from "@hope-ui/solid"
import { JSXElement, mergeProps, Show } from "solid-js"
import { getMainColor } from "~/store"
export const FullScreenLoading = () => {
  return (
    <Center h="100vh">
      <Spinner
        thickness="4px"
        speed="0.65s"
        //主页圆形加载蓝色条
        emptyColor="$neutral4"
        //color="tomato"
        color={getMainColor()}
        size="xl"
      />
    </Center>
  )
}

export const FullLoading = (props: {
  py?: string
  size?: string
  thickness?: number
  ref?: any
}) => {
  const merged = mergeProps(
    {
      py: "$8",
      size: "xl",
      thickness: 4,
    },
    props
  )
  return (
    <Center ref={props.ref} h="$full" w="$full" py={merged.py}>
      <Spinner
        thickness={`${merged.thickness}px`}
        speed="0.65s"
        //目录白色条
        emptyColor="$neutral4"
        //color="tomato"
        color={getMainColor()}
        size={merged.size as any}
      />
    </Center>
  )
}

export const MaybeLoading = (props: {
  children?: JSXElement
  loading: boolean
}) => {
  return (
    <Show when={!props.loading} fallback={<FullLoading />}>
      {props.children}
    </Show>
  )
}

export const CenterLoading = <C extends ElementType = "div">(
  props: SpinnerProps<C>
) => {
  return (
    <Center w="$full" h="$full">
      {/* 左上角logo加载颜色 */}
      <Spinner color={getMainColor()} {...props} />
    </Center>
  )
}
