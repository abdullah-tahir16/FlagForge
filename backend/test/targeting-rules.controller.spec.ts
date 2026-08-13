import { CommandBus, QueryBus } from "@nestjs/cqrs";
import { TargetingRuleOperator } from "../src/targeting-rules/targeting-rule-operator.enum";
import { TargetingRulesController } from "../src/targeting-rules/targeting-rules.controller";
import {
  CreateTargetingRuleCommand,
  DeleteTargetingRuleCommand,
  ListTargetingRulesQuery,
  ReorderTargetingRulesCommand,
  UpdateTargetingRuleCommand
} from "../src/targeting-rules/targeting-rules.messages";
import { UserRole } from "../src/users/user-role.enum";

describe("TargetingRulesController", () => {
  const user = {
    email: "user@example.com",
    id: "user-1",
    organizationId: "org-1",
    role: UserRole.Owner
  };
  const request = {
    headers: { "x-forwarded-for": "203.0.113.9, 198.51.100.1" },
    ip: "127.0.0.1",
    socket: { remoteAddress: "127.0.0.1" }
  };
  const response = {
    attribute: "country",
    comparisonValue: "IT",
    createdAt: new Date("2026-08-13T00:00:00.000Z"),
    environmentFlagConfigId: "config-1",
    id: "rule-1",
    operator: TargetingRuleOperator.Equals,
    resultValue: true,
    sortOrder: 1,
    updatedAt: new Date("2026-08-13T00:00:00.000Z")
  };

  const createController = () => {
    const commandBus = { execute: jest.fn(async () => response) };
    const queryBus = { execute: jest.fn(async () => [response]) };
    const controller = new TargetingRulesController(commandBus as unknown as CommandBus, queryBus as unknown as QueryBus);

    return { commandBus, controller, queryBus };
  };

  it("routes list, create, update, reorder, and delete commands", async () => {
    const { commandBus, controller, queryBus } = createController();
    const dto = {
      attribute: "country",
      comparisonValue: "IT",
      operator: TargetingRuleOperator.Equals,
      resultValue: true
    };

    await expect(controller.findAll(user, "project-1", "flag-1", "environment-1")).resolves.toEqual([response]);
    await expect(controller.create(user, "project-1", "flag-1", "environment-1", dto, request as never)).resolves.toEqual(response);
    await expect(controller.update(user, "project-1", "flag-1", "environment-1", "rule-1", dto, request as never)).resolves.toEqual(response);
    await expect(controller.reorder(user, "project-1", "flag-1", "environment-1", { ruleIds: ["rule-1"] }, request as never)).resolves.toEqual(response);
    await expect(controller.remove(user, "project-1", "flag-1", "environment-1", "rule-1", request as never)).resolves.toEqual(response);

    const queryCalls = queryBus.execute.mock.calls as unknown[][];
    const commandCalls = commandBus.execute.mock.calls as unknown[][];

    expect(queryCalls[0][0]).toBeInstanceOf(ListTargetingRulesQuery);
    expect(commandCalls[0][0]).toBeInstanceOf(CreateTargetingRuleCommand);
    expect(commandCalls[1][0]).toBeInstanceOf(UpdateTargetingRuleCommand);
    expect(commandCalls[2][0]).toBeInstanceOf(ReorderTargetingRulesCommand);
    expect(commandCalls[3][0]).toBeInstanceOf(DeleteTargetingRuleCommand);
    expect(commandCalls[0][0]).toMatchObject({ auditContext: { ipAddress: "203.0.113.9" } });
  });
});
