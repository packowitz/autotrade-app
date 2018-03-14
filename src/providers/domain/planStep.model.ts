export class PlanStep {
  id: number;
  step: number;
  status: string;
  symbol: string;
  side: string;
  price: number;
  inCurrency: string;
  inAmount: number;
  inFilled: number;
  outCurrency: string;
  outAmount: number;
  orderAltcoinQty: number;
  orderBasecoinQty: number;
  startDate: string;
  finishDate: string;
}
