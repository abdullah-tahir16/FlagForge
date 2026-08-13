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
import { Environment } from "../environments/environment.entity";
import { FeatureFlag } from "../feature-flags/feature-flag.entity";
import { Organization } from "../organizations/organization.entity";

@Entity({ name: "projects" })
@Index("UQ_projects_organization_key", ["organizationId", "key"], { unique: true })
export class Project {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column({ name: "organization_id", type: "uuid" })
  organizationId!: string;

  @ManyToOne(() => Organization, (organization) => organization.projects, { onDelete: "CASCADE" })
  @JoinColumn({ name: "organization_id" })
  organization!: Organization;

  @Column({ type: "varchar", length: 160 })
  name!: string;

  @Column({ type: "varchar", length: 120 })
  key!: string;

  @Column({ type: "text", nullable: true })
  description!: string | null;

  @OneToMany(() => Environment, (environment) => environment.project)
  environments!: Environment[];

  @OneToMany(() => FeatureFlag, (featureFlag) => featureFlag.project)
  featureFlags!: FeatureFlag[];

  @CreateDateColumn({ name: "created_at" })
  createdAt!: Date;

  @UpdateDateColumn({ name: "updated_at" })
  updatedAt!: Date;
}
