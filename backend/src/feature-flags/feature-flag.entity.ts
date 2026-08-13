import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn
} from "typeorm";
import { Project } from "../projects/project.entity";
import { EnvironmentFlagConfig } from "./environment-flag-config.entity";
import { FeatureFlagType } from "./feature-flag-type.enum";

@Entity({ name: "feature_flags" })
@Index("UQ_feature_flags_project_key", ["projectId", "key"], { unique: true })
@Index("IDX_feature_flags_project_id", ["projectId"])
export class FeatureFlag {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column({ name: "project_id", type: "uuid" })
  projectId!: string;

  @ManyToOne(() => Project, (project) => project.featureFlags, { onDelete: "CASCADE" })
  @JoinColumn({ name: "project_id" })
  project!: Project;

  @Column({ type: "varchar", length: 160 })
  name!: string;

  @Column({ type: "varchar", length: 120 })
  key!: string;

  @Column({ type: "varchar", length: 24 })
  type!: FeatureFlagType;

  @Column({ type: "text", nullable: true })
  description!: string | null;

  @OneToMany(() => EnvironmentFlagConfig, (config) => config.featureFlag)
  environmentConfigs!: EnvironmentFlagConfig[];

  @CreateDateColumn({ name: "created_at" })
  createdAt!: Date;

  @UpdateDateColumn({ name: "updated_at" })
  updatedAt!: Date;
}
