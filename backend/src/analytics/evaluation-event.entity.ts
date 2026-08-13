import { Column, Entity, Index, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { Environment } from "../environments/environment.entity";
import { EvaluationReason } from "../evaluations/dto/evaluation-response.dto";
import { Project } from "../projects/project.entity";
import { SdkKey } from "../sdk-keys/sdk-key.entity";
import { EvaluationEventType } from "./evaluation-event-type.enum";

@Entity({ name: "evaluation_events" })
@Index("IDX_evaluation_events_project_occurred_at", ["projectId", "occurredAt"])
@Index("IDX_evaluation_events_environment_occurred_at", ["environmentId", "occurredAt"])
@Index("IDX_evaluation_events_project_flag_occurred_at", ["projectId", "flagKey", "occurredAt"])
@Index("IDX_evaluation_events_sdk_key_id", ["sdkKeyId"])
export class EvaluationEvent {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column({ name: "organization_id", type: "uuid" })
  organizationId!: string;

  @Column({ name: "project_id", type: "uuid" })
  projectId!: string;

  @ManyToOne(() => Project, { onDelete: "CASCADE" })
  @JoinColumn({ name: "project_id" })
  project!: Project;

  @Column({ name: "environment_id", type: "uuid" })
  environmentId!: string;

  @ManyToOne(() => Environment, { onDelete: "CASCADE" })
  @JoinColumn({ name: "environment_id" })
  environment!: Environment;

  @Column({ name: "sdk_key_id", type: "uuid" })
  sdkKeyId!: string;

  @ManyToOne(() => SdkKey, { onDelete: "CASCADE" })
  @JoinColumn({ name: "sdk_key_id" })
  sdkKey!: SdkKey;

  @Column({ length: 120, name: "flag_key", type: "varchar" })
  flagKey!: string;

  @Column({ type: "boolean" })
  value!: boolean;

  @Column({ length: 80, type: "varchar" })
  reason!: EvaluationReason;

  @Column({ enum: EvaluationEventType, name: "evaluation_type", type: "enum" })
  evaluationType!: EvaluationEventType;

  @Column({ name: "occurred_at", type: "timestamp" })
  occurredAt!: Date;
}
