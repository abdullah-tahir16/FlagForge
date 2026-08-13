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
import type { TargetingComparisonValue } from "./targeting-rule-comparison-value";
import { TargetingRuleOperator } from "./targeting-rule-operator.enum";

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

  @Column({ length: 80, type: "varchar" })
  attribute!: string;

  @Column({ enum: TargetingRuleOperator, type: "enum" })
  operator!: TargetingRuleOperator;

  @Column({ name: "comparison_value", type: "jsonb" })
  comparisonValue!: TargetingComparisonValue;

  @Column({ name: "result_value", type: "boolean" })
  resultValue!: boolean;

  @Column({ name: "sort_order", type: "integer" })
  sortOrder!: number;

  @CreateDateColumn({ name: "created_at" })
  createdAt!: Date;

  @UpdateDateColumn({ name: "updated_at" })
  updatedAt!: Date;
}
