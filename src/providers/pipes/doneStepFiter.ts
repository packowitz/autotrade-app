import {Pipe} from "@angular/core";
import {PlanStep} from "../domain/planStep.model";

@Pipe({
  name: "filterDoneSteps"
})
export class DoneStepFiter {
  transform(array: Array<PlanStep>): Array<PlanStep> {
    return array.filter(step => step.status == 'DONE');
  }
}
