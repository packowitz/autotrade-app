import {PlanStep} from "./planStep.model";

export class PathPlan {
  status: string;
  maxSteps: number;
  startCurrency: string;
  startAmount: number;
  destCurrency: string;
  destAmount: number;
  autoRestart: boolean;
  startDate: string;
  finishDate: string;
  steps: PlanStep[];

  //ui controls
  showSteps?: boolean;
}
