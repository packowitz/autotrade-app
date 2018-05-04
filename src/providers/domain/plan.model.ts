import {PlanConfig} from "./planConfig.model";

export class Plan {
  id: number;
  type: string;
  status: string;
  config: PlanConfig;
  description: string;
  startDate: string;
  lastActionDate: string;
  finishDate: string;
  balance: number;
  balancePerc: number;
  runsDone: number;
}
