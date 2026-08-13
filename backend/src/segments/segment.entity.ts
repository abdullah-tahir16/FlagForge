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
import { SegmentMatchMode } from "./segment-match-mode.enum";
import { SegmentCondition } from "./segment-condition.entity";

@Entity({ name: "segments" })
@Index("UQ_segments_project_key", ["projectId", "key"], { unique: true })
@Index("IDX_segments_project_id", ["projectId"])
export class Segment {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column({ name: "project_id", type: "uuid" })
  projectId!: string;

  @ManyToOne(() => Project, (project) => project.segments, { onDelete: "CASCADE" })
  @JoinColumn({ name: "project_id" })
  project!: Project;

  @Column({ type: "varchar", length: 160 })
  name!: string;

  @Column({ type: "varchar", length: 120 })
  key!: string;

  @Column({ type: "text", nullable: true })
  description!: string | null;

  @Column({ enum: SegmentMatchMode, name: "match_mode", type: "enum" })
  matchMode!: SegmentMatchMode;

  @OneToMany(() => SegmentCondition, (condition) => condition.segment)
  conditions!: SegmentCondition[];

  @CreateDateColumn({ name: "created_at" })
  createdAt!: Date;

  @UpdateDateColumn({ name: "updated_at" })
  updatedAt!: Date;
}
