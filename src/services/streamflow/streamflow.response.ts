class MyStreamFlowStream {
  stream_id: string;

  name: string;

  sender: string;

  recipient: string;

  token: string;

  period: number;

  amount_per_period: number;

  total_amount: number;

  start_at: string;

  end_at: string;

  cliff_at: string;

  cliff_amount: number;

  released_amount?: number;

  available_amount?: number;

  withdrawn_amount?: number;

  last_withdrawn_at?: string;

  fee: number;

  deposit: number;

  cancelable_by_sender: boolean;

  cancelable_by_recipient: boolean;

  automatic_withdrawal: boolean;

  transferableBySender: boolean;

  transferable_by_recipient: boolean;

  created_at: string;

  is_cliff?: boolean;
}

export { MyStreamFlowStream };
