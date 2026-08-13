import { Controller, Headers, HttpCode, Param, Post } from "@nestjs/common";
import { AllEvaluationsResponse, SingleEvaluationResponse } from "./dto/evaluation-response.dto";
import { EvaluationsService } from "./evaluations.service";
import { SdkAuthService, sdkKeyHeaderName } from "./sdk-auth.service";

@Controller("sdk")
export class EvaluationsController {
  constructor(
    private readonly evaluationsService: EvaluationsService,
    private readonly sdkAuthService: SdkAuthService
  ) {}

  @Post("evaluate")
  @HttpCode(200)
  async evaluateAll(@Headers(sdkKeyHeaderName) sdkKey: string | string[] | undefined): Promise<AllEvaluationsResponse> {
    const context = await this.sdkAuthService.authenticate(sdkKey);

    return this.evaluationsService.evaluateAll(context);
  }

  @Post("evaluate/:flagKey")
  @HttpCode(200)
  async evaluateOne(
    @Headers(sdkKeyHeaderName) sdkKey: string | string[] | undefined,
    @Param("flagKey") flagKey: string
  ): Promise<SingleEvaluationResponse> {
    const context = await this.sdkAuthService.authenticate(sdkKey);

    return this.evaluationsService.evaluateOne(context, flagKey);
  }
}
