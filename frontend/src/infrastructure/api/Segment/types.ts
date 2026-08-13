import type {
  CreateSegmentConditionInput,
  CreateSegmentInput,
  ReorderSegmentConditionsInput,
  Segment,
  SegmentList,
  SegmentListParams,
  UpdateSegmentConditionInput,
  UpdateSegmentInput
} from "../../../core/types/Segment";

export type CreateSegmentRequestDto = CreateSegmentInput;
export type CreateSegmentConditionRequestDto = CreateSegmentConditionInput;
export type ReorderSegmentConditionsRequestDto = ReorderSegmentConditionsInput;
export type SegmentListParamsDto = SegmentListParams;
export type SegmentListResponseDto = SegmentList;
export type SegmentResponseDto = Segment;
export type UpdateSegmentConditionRequestDto = UpdateSegmentConditionInput;
export type UpdateSegmentRequestDto = UpdateSegmentInput;
