import { CommandHandler, ICommandHandler, IQueryHandler, QueryHandler } from "@nestjs/cqrs";
import type { SegmentListResponse, SegmentResponse } from "./dto/segment-response.dto";
import {
  CreateSegmentCommand,
  CreateSegmentConditionCommand,
  DeleteSegmentCommand,
  DeleteSegmentConditionCommand,
  GetSegmentQuery,
  ListSegmentOptionsQuery,
  ListSegmentsQuery,
  ReorderSegmentConditionsCommand,
  UpdateSegmentCommand,
  UpdateSegmentConditionCommand
} from "./segments.messages";
import { SegmentsService } from "./segments.service";

@QueryHandler(ListSegmentsQuery)
export class ListSegmentsHandler implements IQueryHandler<ListSegmentsQuery, SegmentListResponse> {
  constructor(private readonly segmentsService: SegmentsService) {}

  execute(query: ListSegmentsQuery): Promise<SegmentListResponse> {
    return this.segmentsService.findAll(query.user, query.projectId, query.filters);
  }
}

@QueryHandler(ListSegmentOptionsQuery)
export class ListSegmentOptionsHandler implements IQueryHandler<ListSegmentOptionsQuery, SegmentResponse[]> {
  constructor(private readonly segmentsService: SegmentsService) {}

  execute(query: ListSegmentOptionsQuery): Promise<SegmentResponse[]> {
    return this.segmentsService.findOptions(query.user, query.projectId);
  }
}

@QueryHandler(GetSegmentQuery)
export class GetSegmentHandler implements IQueryHandler<GetSegmentQuery, SegmentResponse> {
  constructor(private readonly segmentsService: SegmentsService) {}

  execute(query: GetSegmentQuery): Promise<SegmentResponse> {
    return this.segmentsService.findOne(query.user, query.projectId, query.segmentId);
  }
}

@CommandHandler(CreateSegmentCommand)
export class CreateSegmentHandler implements ICommandHandler<CreateSegmentCommand, SegmentResponse> {
  constructor(private readonly segmentsService: SegmentsService) {}

  execute(command: CreateSegmentCommand): Promise<SegmentResponse> {
    return this.segmentsService.create(command.user, command.projectId, command.dto, command.auditContext);
  }
}

@CommandHandler(UpdateSegmentCommand)
export class UpdateSegmentHandler implements ICommandHandler<UpdateSegmentCommand, SegmentResponse> {
  constructor(private readonly segmentsService: SegmentsService) {}

  execute(command: UpdateSegmentCommand): Promise<SegmentResponse> {
    return this.segmentsService.update(command.user, command.projectId, command.segmentId, command.dto, command.auditContext);
  }
}

@CommandHandler(DeleteSegmentCommand)
export class DeleteSegmentHandler implements ICommandHandler<DeleteSegmentCommand, void> {
  constructor(private readonly segmentsService: SegmentsService) {}

  execute(command: DeleteSegmentCommand): Promise<void> {
    return this.segmentsService.remove(command.user, command.projectId, command.segmentId, command.auditContext);
  }
}

@CommandHandler(CreateSegmentConditionCommand)
export class CreateSegmentConditionHandler implements ICommandHandler<CreateSegmentConditionCommand, SegmentResponse> {
  constructor(private readonly segmentsService: SegmentsService) {}

  execute(command: CreateSegmentConditionCommand): Promise<SegmentResponse> {
    return this.segmentsService.createCondition(
      command.user,
      command.projectId,
      command.segmentId,
      command.dto,
      command.auditContext
    );
  }
}

@CommandHandler(UpdateSegmentConditionCommand)
export class UpdateSegmentConditionHandler implements ICommandHandler<UpdateSegmentConditionCommand, SegmentResponse> {
  constructor(private readonly segmentsService: SegmentsService) {}

  execute(command: UpdateSegmentConditionCommand): Promise<SegmentResponse> {
    return this.segmentsService.updateCondition(
      command.user,
      command.projectId,
      command.segmentId,
      command.conditionId,
      command.dto,
      command.auditContext
    );
  }
}

@CommandHandler(DeleteSegmentConditionCommand)
export class DeleteSegmentConditionHandler implements ICommandHandler<DeleteSegmentConditionCommand, SegmentResponse> {
  constructor(private readonly segmentsService: SegmentsService) {}

  execute(command: DeleteSegmentConditionCommand): Promise<SegmentResponse> {
    return this.segmentsService.removeCondition(
      command.user,
      command.projectId,
      command.segmentId,
      command.conditionId,
      command.auditContext
    );
  }
}

@CommandHandler(ReorderSegmentConditionsCommand)
export class ReorderSegmentConditionsHandler implements ICommandHandler<ReorderSegmentConditionsCommand, SegmentResponse> {
  constructor(private readonly segmentsService: SegmentsService) {}

  execute(command: ReorderSegmentConditionsCommand): Promise<SegmentResponse> {
    return this.segmentsService.reorderConditions(
      command.user,
      command.projectId,
      command.segmentId,
      command.dto,
      command.auditContext
    );
  }
}

export const segmentHandlers = [
  ListSegmentsHandler,
  ListSegmentOptionsHandler,
  GetSegmentHandler,
  CreateSegmentHandler,
  UpdateSegmentHandler,
  DeleteSegmentHandler,
  CreateSegmentConditionHandler,
  UpdateSegmentConditionHandler,
  DeleteSegmentConditionHandler,
  ReorderSegmentConditionsHandler
];
