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
import { Environment } from "../environments/environment.entity";
import { FeatureFlag } from "./feature-flag.entity";

@Entity({ name: "environment_flag_configs" })
@Index("UQ_environment_flag_configs_flag_environment", ["featureFlagId", "environmentId"], { unique: true })
@Index("IDX_environment_flag_configs_environment_id", ["environmentId"])
export class EnvironmentFlagConfig {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column({ name: "feature_flag_id", type: "uuid" })
  featureFlagId!: string;

  @ManyToOne(() => FeatureFlag, (featureFlag) => featureFlag.environmentConfigs, { onDelete: "CASCADE" })
  @JoinColumn({ name: "feature_flag_id" })
  featureFlag!: FeatureFlag;

  @Column({ name: "environment_id", type: "uuid" })
  environmentId!: string;

  @ManyToOne(() => Environment, (environment) => environment.flagConfigs, { onDelete: "CASCADE" })
  @JoinColumn({ name: "environment_id" })
  environment!: Environment;

  @Column({ type: "boolean", default: false })
  enabled!: boolean;

  @Column({ type: "boolean", default: false })
  value!: boolean;

  @CreateDateColumn({ name: "created_at" })
  createdAt!: Date;

  @UpdateDateColumn({ name: "updated_at" })
  updatedAt!: Date;
}
