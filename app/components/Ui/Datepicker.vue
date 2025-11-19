<template>
  <ClientOnly>
    <VDatePicker
      ref="datepickerRef"
      :trim-weeks="props.trimWeeks || true"
      :is-dark="$colorMode.value == 'dark'"
      v-bind="$attrs"
    >
      <template v-for="(_, slot) in $slots" #[slot]="scope">
        <slot :name="slot" v-bind="scope" />
      </template>
    </VDatePicker>
  </ClientOnly>
</template>

<script lang="ts" setup>
  import type { Calendar, DatePicker } from "v-calendar";

  defineOptions({ inheritAttrs: false });

  const datepickerRef = useTemplateRef("datepickerRef");

  // @ts-expect-error - This is a hacky way to get the props from the Calendar and DatePicker components
  interface Props
    extends /* @vue-ignore */ Partial<InstanceType<typeof Calendar>["$props"]>,
      /* @vue-ignore */ Omit<Partial<InstanceType<typeof DatePicker>["$props"]>, "attributes"> {}

  const props = defineProps<Props & { trimWeeks?: boolean }>();
  defineExpose({ datepickerRef });
</script>
