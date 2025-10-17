<template>
  <ClientOnly>
    <TabsIndicator
      data-slot="tabs-indicator"
      v-bind="{ ...forwarded, ...$attrs }"
      :class="styles({ class: props.class })"
    >
      <slot>
        <div class="h-full w-full rounded-md bg-primary" />
      </slot>
    </TabsIndicator>
  </ClientOnly>
</template>

<script lang="ts" setup>
  import { TabsIndicator } from "reka-ui";
  import type { TabsIndicatorProps } from "reka-ui";
  import type { HTMLAttributes } from "vue";

  defineOptions({ inheritAttrs: false });

  const props = defineProps<
    TabsIndicatorProps & {
      /** Custom class(es) to add to parent element */
      class?: HTMLAttributes["class"];
    }
  >();
  const forwarded = reactiveOmit(props, "class");
  const styles = tv({
    base: "absolute bottom-0 left-0 h-[3px] w-(--reka-tabs-indicator-size) translate-x-(--reka-tabs-indicator-position) rounded-full px-1 transition-[width,transform] duration-300",
  });
</script>
