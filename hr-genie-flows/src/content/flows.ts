import type { Flow } from "../engine/types";
import { scenarios as crecheScenarios } from "./creche/scenarios";
import { workflow as crecheWorkflow } from "./creche/workflow";
import { scenarios as leaveScenarios } from "./leave/scenarios";
import { workflow as leaveWorkflow } from "./leave/workflow";
import { scenarios as mediclaimScenarios } from "./mediclaim/scenarios";
import { workflow as mediclaimWorkflow } from "./mediclaim/workflow";

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
  {
    id: "mediclaim",
    title: "Mediclaim Card",
    topic: "Mediclaim · Card retrieval",
    workflow: mediclaimWorkflow,
    scenarios: mediclaimScenarios,
  },
];
