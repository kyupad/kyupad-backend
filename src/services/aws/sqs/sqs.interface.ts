interface ICreateQueueOption<I> {
  message_group_id: string;
  message_body: I;
  message_deduplication_id: string;
  queue_url: string;
}

export { ICreateQueueOption };
