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
import { TargetingComparisonValue } from "../targeting-rules/targeting-rule-comparison-value";
import { TargetingRuleOperator } from "../targeting-rules/targeting-rule-operator.enum";
import { Segment } from "./segment.entity";

@Entity({ name: "segment_conditions" })
@Index("IDX_segment_conditions_segment_order", ["segmentId", "sortOrder"])
export class SegmentCondition {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column({ name: "segment_id", type: "uuid" })
  segmentId!: string;

  @ManyToOne(() => Segment, (segment) => segment.conditions, { onDelete: "CASCADE" })
  @JoinColumn({ name: "segment_id" })
  segment!: Segment;

  @Column({ length: 80, type: "varchar" })
  attribute!: string;

  @Column({ enum: TargetingRuleOperator, type: "enum" })
  operator!: TargetingRuleOperator;

  @Column({ name: "comparison_value", type: "jsonb" })
  comparisonValue!: TargetingComparisonValue;

  @Column({ name: "sort_order", type: "integer" })
  sortOrder!: number;

  @CreateDateColumn({ name: "created_at" })
  createdAt!: Date;

  @UpdateDateColumn({ name: "updated_at" })
  updatedAt!: Date;
}
