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
import { Organization } from "../organizations/organization.entity";
import { RefreshSession } from "../auth/refresh-session.entity";
import { UserRole } from "./user-role.enum";

@Entity({ name: "users" })
export class User {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Index({ unique: true })
  @Column({ type: "varchar", length: 320 })
  email!: string;

  @Column({ name: "password_hash", type: "varchar", length: 255 })
  passwordHash!: string;

  @Column({ name: "first_name", type: "varchar", length: 120 })
  firstName!: string;

  @Column({ name: "last_name", type: "varchar", length: 120 })
  lastName!: string;

  @Column({ name: "organization_id", type: "uuid" })
  organizationId!: string;

  @ManyToOne(() => Organization, (organization) => organization.users, { onDelete: "CASCADE" })
  @JoinColumn({ name: "organization_id" })
  organization!: Organization;

  @Column({ type: "enum", enum: UserRole, default: UserRole.Owner })
  role!: UserRole;

  @OneToMany(() => RefreshSession, (refreshSession) => refreshSession.user)
  refreshSessions!: RefreshSession[];

  @CreateDateColumn({ name: "created_at" })
  createdAt!: Date;

  @UpdateDateColumn({ name: "updated_at" })
  updatedAt!: Date;
}
