import { apiClient } from "../App";
import type {
  CreateSegmentConditionRequestDto,
  CreateSegmentRequestDto,
  ReorderSegmentConditionsRequestDto,
  SegmentListParamsDto,
  SegmentListResponseDto,
  SegmentResponseDto,
  UpdateSegmentConditionRequestDto,
  UpdateSegmentRequestDto
} from "./types";

const getSegmentsPath = (projectId: string) => `/projects/${projectId}/segments`;
const getSegmentPath = (projectId: string, segmentId: string) => `${getSegmentsPath(projectId)}/${segmentId}`;

export const getSegments = async (projectId: string, params: SegmentListParamsDto = {}): Promise<SegmentListResponseDto> => {
  const response = await apiClient.get<SegmentListResponseDto>(getSegmentsPath(projectId), { params });

  return response.data;
};

export const getSegmentOptions = async (projectId: string): Promise<SegmentResponseDto[]> => {
  const response = await apiClient.get<SegmentResponseDto[]>(`${getSegmentsPath(projectId)}/options`);

  return response.data;
};

export const getSegment = async (projectId: string, segmentId: string): Promise<SegmentResponseDto> => {
  const response = await apiClient.get<SegmentResponseDto>(getSegmentPath(projectId, segmentId));

  return response.data;
};

export const createSegment = async (projectId: string, input: CreateSegmentRequestDto): Promise<SegmentResponseDto> => {
  const response = await apiClient.post<SegmentResponseDto>(getSegmentsPath(projectId), input);

  return response.data;
};

export const updateSegment = async (
  projectId: string,
  segmentId: string,
  input: UpdateSegmentRequestDto
): Promise<SegmentResponseDto> => {
  const response = await apiClient.patch<SegmentResponseDto>(getSegmentPath(projectId, segmentId), input);

  return response.data;
};

export const deleteSegment = async (projectId: string, segmentId: string): Promise<void> => {
  await apiClient.delete(getSegmentPath(projectId, segmentId));
};

export const createSegmentCondition = async (
  projectId: string,
  segmentId: string,
  input: CreateSegmentConditionRequestDto
): Promise<SegmentResponseDto> => {
  const response = await apiClient.post<SegmentResponseDto>(`${getSegmentPath(projectId, segmentId)}/conditions`, input);

  return response.data;
};

export const updateSegmentCondition = async (
  projectId: string,
  segmentId: string,
  conditionId: string,
  input: UpdateSegmentConditionRequestDto
): Promise<SegmentResponseDto> => {
  const response = await apiClient.patch<SegmentResponseDto>(
    `${getSegmentPath(projectId, segmentId)}/conditions/${conditionId}`,
    input
  );

  return response.data;
};

export const deleteSegmentCondition = async (
  projectId: string,
  segmentId: string,
  conditionId: string
): Promise<SegmentResponseDto> => {
  const response = await apiClient.delete<SegmentResponseDto>(`${getSegmentPath(projectId, segmentId)}/conditions/${conditionId}`);

  return response.data;
};

export const reorderSegmentConditions = async (
  projectId: string,
  segmentId: string,
  input: ReorderSegmentConditionsRequestDto
): Promise<SegmentResponseDto> => {
  const response = await apiClient.post<SegmentResponseDto>(`${getSegmentPath(projectId, segmentId)}/conditions/reorder`, input);

  return response.data;
};
