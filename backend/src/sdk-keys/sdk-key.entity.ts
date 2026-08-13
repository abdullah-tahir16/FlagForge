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

@Entity({ name: "sdk_keys" })
@Index("IDX_sdk_keys_environment_id", ["environmentId"])
@Index("UQ_sdk_keys_key_hash", ["keyHash"], { unique: true })
export class SdkKey {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column({ name: "environment_id", type: "uuid" })
  environmentId!: string;

  @ManyToOne(() => Environment, (environment) => environment.sdkKeys, { onDelete: "CASCADE" })
  @JoinColumn({ name: "environment_id" })
  environment!: Environment;

  @Column({ type: "varchar", length: 120 })
  name!: string;

  @Column({ name: "key_hash", type: "varchar", length: 64 })
  keyHash!: string;

  @Column({ name: "key_prefix", type: "varchar", length: 32 })
  keyPrefix!: string;

  @Column({ name: "last_used_at", nullable: true, type: "timestamp" })
  lastUsedAt!: Date | null;

  @Column({ name: "revoked_at", nullable: true, type: "timestamp" })
  revokedAt!: Date | null;

  @CreateDateColumn({ name: "created_at" })
  createdAt!: Date;

  @UpdateDateColumn({ name: "updated_at" })
  updatedAt!: Date;
}
