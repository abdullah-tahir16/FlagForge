import { Body, Controller, Headers, HttpCode, Param, Post } from "@nestjs/common";
import { ApiHeader, ApiOperation, ApiResponse, ApiTags } from "@nestjs/swagger";
import { SdkEvaluationRequest } from "./dto/evaluation-request.dto";
import { AllEvaluationsResponse, SingleEvaluationResponse } from "./dto/evaluation-response.dto";
import { EvaluationsService } from "./evaluations.service";
import { SdkAuthService, sdkKeyHeaderName } from "./sdk-auth.service";

@ApiTags("evaluations")
@ApiHeader({
  description: "SDK key used to authenticate the evaluation request",
  name: sdkKeyHeaderName,
  required: true
})
@Controller("sdk")
export class EvaluationsController {
  constructor(
    private readonly evaluationsService: EvaluationsService,
    private readonly sdkAuthService: SdkAuthService
  ) {}

  @ApiOperation({ summary: "Evaluate every feature flag in the SDK key's environment for the given evaluation context" })
  @ApiResponse({
    description: "Evaluation results for all flags, including each flag's value and evaluation reason",
    status: 200
  })
  @Post("evaluate")
  @HttpCode(200)
  async evaluateAll(
    @Headers(sdkKeyHeaderName) sdkKey: string | string[] | undefined,
    @Body() evaluationContext: SdkEvaluationRequest = {}
  ): Promise<AllEvaluationsResponse> {
    const context = await this.sdkAuthService.authenticate(sdkKey);

    return this.evaluationsService.evaluateAll(context, evaluationContext);
  }

  @ApiOperation({ summary: "Evaluate a single feature flag by key for the given evaluation context" })
  @ApiResponse({
    description: "Evaluation result for the requested flag, including its value and evaluation reason",
    status: 200
  })
  @Post("evaluate/:flagKey")
  @HttpCode(200)
  async evaluateOne(
    @Headers(sdkKeyHeaderName) sdkKey: string | string[] | undefined,
    @Param("flagKey") flagKey: string,
    @Body() evaluationContext: SdkEvaluationRequest = {}
  ): Promise<SingleEvaluationResponse> {
    const context = await this.sdkAuthService.authenticate(sdkKey);

    return this.evaluationsService.evaluateOne(context, flagKey, evaluationContext);
  }
}
