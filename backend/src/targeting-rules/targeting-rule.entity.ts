import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn
} from "typeorm";
import { EnvironmentFlagConfig } from "../feature-flags/environment-flag-config.entity";
import { Segment } from "../segments/segment.entity";
import type { TargetingComparisonValue } from "./targeting-rule-comparison-value";
import { TargetingRuleOperator } from "./targeting-rule-operator.enum";
import { TargetingRuleSource } from "./targeting-rule-source.enum";

@Entity({ name: "targeting_rules" })
@Index("IDX_targeting_rules_environment_config_order", ["environmentFlagConfigId", "sortOrder"])
export class TargetingRule {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column({ name: "environment_flag_config_id", type: "uuid" })
  environmentFlagConfigId!: string;

  @ManyToOne(() => EnvironmentFlagConfig, { onDelete: "CASCADE" })
  @JoinColumn({ name: "environment_flag_config_id" })
  environmentFlagConfig!: EnvironmentFlagConfig;

  @Column({ enum: TargetingRuleSource, type: "enum", default: TargetingRuleSource.Attribute })
  source!: TargetingRuleSource;

  @Column({ nullable: true, length: 80, type: "varchar" })
  attribute!: string | null;

  @Column({ enum: TargetingRuleOperator, nullable: true, type: "enum" })
  operator!: TargetingRuleOperator | null;

  @Column({ name: "comparison_value", nullable: true, type: "jsonb" })
  comparisonValue!: TargetingComparisonValue | null;

  @Column({ name: "segment_id", nullable: true, type: "uuid" })
  segmentId!: string | null;

  @ManyToOne(() => Segment, { onDelete: "RESTRICT", nullable: true })
  @JoinColumn({ name: "segment_id" })
  segment!: Segment | null;

  @Column({ name: "result_value", type: "boolean" })
  resultValue!: boolean;

  @Column({ name: "sort_order", type: "integer" })
  sortOrder!: number;

  @CreateDateColumn({ name: "created_at" })
  createdAt!: Date;

  @UpdateDateColumn({ name: "updated_at" })
  updatedAt!: Date;
}
