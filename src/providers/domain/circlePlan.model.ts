export class CirclePlan {
  status: string;
  activeStep: number;
  activeOrderId: number;
  startCurrency: string;
  startAmount: number;
  finishAmount: number;
  risk: string;
  treshold: number;
  cancelOnTreshold: boolean;
  startDate: string;
  finishDate: string;
  steps: CirclePlanStep[];
}

export class CirclePlanStep {
  step: number;
  orderId: number;
  status: string;
  symbol: string;
  side: string;
  price: number;
  inCurrency: string;
  inAmount: number;
  outCurrency: string;
  outAmount: number;
  startDate: string;
  finishDate: string;
}
