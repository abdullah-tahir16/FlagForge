import { CommandHandler, ICommandHandler, IQueryHandler, QueryHandler } from "@nestjs/cqrs";
import { TargetingRuleResponse } from "./dto/targeting-rule-response.dto";
import {
  CreateTargetingRuleCommand,
  DeleteTargetingRuleCommand,
  ListTargetingRulesQuery,
  ReorderTargetingRulesCommand,
  UpdateTargetingRuleCommand
} from "./targeting-rules.messages";
import { TargetingRulesService } from "./targeting-rules.service";

@QueryHandler(ListTargetingRulesQuery)
export class ListTargetingRulesHandler implements IQueryHandler<ListTargetingRulesQuery, TargetingRuleResponse[]> {
  constructor(private readonly targetingRulesService: TargetingRulesService) {}

  execute(query: ListTargetingRulesQuery): Promise<TargetingRuleResponse[]> {
    return this.targetingRulesService.findAll(query.user, query.projectId, query.flagId, query.environmentId);
  }
}

@CommandHandler(CreateTargetingRuleCommand)
export class CreateTargetingRuleHandler implements ICommandHandler<CreateTargetingRuleCommand, TargetingRuleResponse> {
  constructor(private readonly targetingRulesService: TargetingRulesService) {}

  execute(command: CreateTargetingRuleCommand): Promise<TargetingRuleResponse> {
    return this.targetingRulesService.create(
      command.user,
      command.projectId,
      command.flagId,
      command.environmentId,
      command.dto,
      command.auditContext
    );
  }
}

@CommandHandler(UpdateTargetingRuleCommand)
export class UpdateTargetingRuleHandler implements ICommandHandler<UpdateTargetingRuleCommand, TargetingRuleResponse> {
  constructor(private readonly targetingRulesService: TargetingRulesService) {}

  execute(command: UpdateTargetingRuleCommand): Promise<TargetingRuleResponse> {
    return this.targetingRulesService.update(
      command.user,
      command.projectId,
      command.flagId,
      command.environmentId,
      command.ruleId,
      command.dto,
      command.auditContext
    );
  }
}

@CommandHandler(DeleteTargetingRuleCommand)
export class DeleteTargetingRuleHandler implements ICommandHandler<DeleteTargetingRuleCommand, void> {
  constructor(private readonly targetingRulesService: TargetingRulesService) {}

  execute(command: DeleteTargetingRuleCommand): Promise<void> {
    return this.targetingRulesService.remove(
      command.user,
      command.projectId,
      command.flagId,
      command.environmentId,
      command.ruleId,
      command.auditContext
    );
  }
}

@CommandHandler(ReorderTargetingRulesCommand)
export class ReorderTargetingRulesHandler implements ICommandHandler<ReorderTargetingRulesCommand, TargetingRuleResponse[]> {
  constructor(private readonly targetingRulesService: TargetingRulesService) {}

  execute(command: ReorderTargetingRulesCommand): Promise<TargetingRuleResponse[]> {
    return this.targetingRulesService.reorder(
      command.user,
      command.projectId,
      command.flagId,
      command.environmentId,
      command.dto,
      command.auditContext
    );
  }
}

export const targetingRuleHandlers = [
  ListTargetingRulesHandler,
  CreateTargetingRuleHandler,
  UpdateTargetingRuleHandler,
  DeleteTargetingRuleHandler,
  ReorderTargetingRulesHandler
];
