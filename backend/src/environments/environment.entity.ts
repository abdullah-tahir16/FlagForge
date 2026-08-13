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
import { EnvironmentFlagConfig } from "../feature-flags/environment-flag-config.entity";
import { Project } from "../projects/project.entity";
import { SdkKey } from "../sdk-keys/sdk-key.entity";

@Entity({ name: "environments" })
@Index("UQ_environments_project_key", ["projectId", "key"], { unique: true })
@Index("IDX_environments_project_sort_order", ["projectId", "sortOrder"])
export class Environment {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column({ name: "project_id", type: "uuid" })
  projectId!: string;

  @ManyToOne(() => Project, (project) => project.environments, { onDelete: "CASCADE" })
  @JoinColumn({ name: "project_id" })
  project!: Project;

  @OneToMany(() => EnvironmentFlagConfig, (config) => config.environment)
  flagConfigs!: EnvironmentFlagConfig[];

  @OneToMany(() => SdkKey, (sdkKey) => sdkKey.environment)
  sdkKeys!: SdkKey[];

  @Column({ type: "varchar", length: 120 })
  name!: string;

  @Column({ type: "varchar", length: 80 })
  key!: string;

  @Column({ name: "sort_order", type: "integer" })
  sortOrder!: number;

  @CreateDateColumn({ name: "created_at" })
  createdAt!: Date;

  @UpdateDateColumn({ name: "updated_at" })
  updatedAt!: Date;
}
