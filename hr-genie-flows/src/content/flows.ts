import type { Flow } from "../engine/types";
import { scenarios as crecheScenarios } from "./creche/scenarios";
import { workflow as crecheWorkflow } from "./creche/workflow";
import { scenarios as leaveScenarios } from "./leave/scenarios";
import { workflow as leaveWorkflow } from "./leave/workflow";

export const flows: Flow[] = [
  {
    id: "creche",
    title: "Creche Reimbursement",
    topic: "Creche Reimbursement",
    workflow: crecheWorkflow,
    scenarios: crecheScenarios,
  },
  {
    id: "leave",
    title: "Apply Leave",
    topic: "FTC Leaves · Apply Leave",
    workflow: leaveWorkflow,
    scenarios: leaveScenarios,
  },
];
