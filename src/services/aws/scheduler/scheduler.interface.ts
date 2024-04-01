interface ICreateScheduleOption<I> {
  name: string;
  group_name: string;
  schedule_time: string; //yyyy-mm-ddThh:mm:ss

  target: {
    type: 'LAMBDA' | 'SQS';
    arn: string;
    role_arn: string;
    input: I;
    sqs_msg_group_id?: string;
  };
}

export { ICreateScheduleOption };
