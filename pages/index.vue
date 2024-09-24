<script setup lang="ts">
import { toTypedSchema } from '@vee-validate/zod';
import axios from 'axios';
import { useForm } from 'vee-validate';
import { z } from 'zod';
import { cn } from '../lib/utils.js';
import { Check, ChevronsUpDown } from 'lucide-vue-next';

const page = ref(1);
const query = ref('');
const tag = ref('story');

const news = ref<
  {
    title: string;
    author: string;
    url: string;
    story_text: string;
    objectID: string;
  }[]
>([]);

// const toFirstPage = () => {
//   page.value = 0;
// };
const formSchema = toTypedSchema(
  z.object({
    tag: z.string().optional(),
    query: z.string().optional(),
  })
);

const { handleSubmit, setFieldValue, values } = useForm({
  validationSchema: formSchema,
});

const onSubmit = handleSubmit((values) => {
  console.log(values);

  if (values.query) {
    query.value = values.query;
    page.value = 1;
  }

  if (values.tag) {
    tag.value = values.tag;
    page.value = 1;
  }
});

const toNextPage = () => {
  page.value++;
};

const toPrevPage = () => {
  page.value--;
};

const toSpecificPage = (event: Event) => {
  const value = (event.target as HTMLInputElement).value;
  console.log(value);

  page.value = Number.parseInt(value);
};

const tags = [
  { label: 'Story', value: 'story' },
  { label: 'Comment', value: 'comment' },
  { label: 'Poll', value: 'poll' },
  { label: 'Poll Option', value: 'pollopt' },
  { label: 'Show Hacker New', value: 'show_hn' },
  { label: 'Ask Hacker New', value: 'ask_hn' },
];

watchEffect(async () => {
  const { data } = await axios.get(
    `https://hn.algolia.com/api/v1/search_by_date?tags=${tag.value}&page=${page.value}&query=${query.value}`
  );

  news.value = data.hits;

  console.log(data.hits);
});

const open = ref(false);
</script>

<template>
  <div class="flex flex-col gap-5 justify-center items-center">
    <h1 class="text-3xl font-semibold">News app</h1>

    <div class="grid grid-cols-4 gap-4">
      <form @submit.prevent="onSubmit">
        <FormField name="tag">
          <FormItem class="grid items-center grid-cols-4 gap-4">
            <FormLabel class="text-right">Tag</FormLabel>
            <FormControl>
              <Popover v-model="open" class="col-span-3">
                <PopoverTrigger as-child>
                  <FormControl>
                    <Button
                      variant="outline"
                      role="combobox"
                      :class="
                        cn(
                          'w-[200px] justify-between',
                          !values.tag && 'text-muted-foreground'
                        )
                      "
                    >
                      {{
                        values.tag
                          ? tags.find((tag) => tag.value === values.tag)?.label
                          : 'Select tag...'
                      }}
                      <ChevronsUpDown
                        class="ml-2 h-4 w-4 shrink-0 opacity-50"
                      />
                    </Button>
                  </FormControl>
                </PopoverTrigger>
                <PopoverContent class="w-[200px] p-0">
                  <Command>
                    <CommandInput placeholder="Search tag..." />
                    <CommandEmpty>Nothing found.</CommandEmpty>
                    <CommandList>
                      <CommandGroup>
                        <CommandItem
                          v-for="tag in tags"
                          :key="tag.value"
                          :value="tag.label"
                          @select="
                            () => {
                              setFieldValue('tag', tag.value);
                            }
                          "
                        >
                          <Check
                            :class="
                              cn(
                                'mr-2 h-4 w-4',
                                tag.value === values.tag
                                  ? 'opacity-100'
                                  : 'opacity-0'
                              )
                            "
                          />
                          {{ tag.label }}
                        </CommandItem>
                      </CommandGroup>
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>
            </FormControl>
            <FormMessage />
          </FormItem>
        </FormField>
        <FormField v-slot="{ componentField }" name="query">
          <FormItem class="grid items-center grid-cols-4 gap-4">
            <FormLabel class="text-right">Query</FormLabel>
            <FormControl class="col-span-3">
              <Input type="text" v-bind="componentField" />
            </FormControl>
          </FormItem>
        </FormField>

        <div class="flex justify-end mt-2">
          <Button type="submit">Filter</Button>
        </div>

        <Separator orientation="vertical"></Separator>
      </form>

      <div class="col-span-3">
        <ScrollArea class="h-[70vh] w-full">
          <div class="p-4 flex flex-col gap-4">
            <div v-for="item in news" :key="item.objectID">
              <Card class="w-full">
                <CardHeader>
                  <CardTitle>
                    {{ item.title }}
                  </CardTitle>
                  <CardDescription>{{ item.author }}</CardDescription>
                </CardHeader>
                <CardContent>
                  <template v-if="item.story_text">
                    <div>
                      Content:
                      <span v-html="item.story_text"></span>
                    </div>
                  </template>
                  <template v-if="item.url">
                    <div>
                      URL: <a :href="item.url"> {{ item.url }} </a>
                    </div>
                  </template>
                </CardContent>
                <CardFooter class="flex justify-end px-6 pb-6">
                  <NuxtLink :to="`${item.objectID}`">
                    <Button>View Detail</Button>
                  </NuxtLink>
                </CardFooter>
              </Card>
            </div>
          </div>
        </ScrollArea>
      </div>
    </div>

    <Pagination :total="200" :sibling-count="1" show-edges :default-page="1">
      <PaginationList v-slot="{ items }" class="flex items-center gap-1">
        <!-- <PaginationFirst @click="toFirstPage" /> -->
        <PaginationPrev @click="toPrevPage" />
        <Input v-model="page" class="w-10 text-center font-semibold" />

        <PaginationNext @click="toNextPage" />
        <!-- <PaginationLast /> -->
      </PaginationList>
    </Pagination>
  </div>
</template>
