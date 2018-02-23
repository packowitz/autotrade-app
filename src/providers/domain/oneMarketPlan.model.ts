import {PlanStep} from "./planStep.model";

export class OneMarketPlan {
  status: string;
  symbol: string;
  minProfit: number;
  startCurrency: string;
  startAmount: number;
  balance: number;
  autoRestart: boolean;
  startDate: string;
  finishDate: string;
  steps: PlanStep[];
}
