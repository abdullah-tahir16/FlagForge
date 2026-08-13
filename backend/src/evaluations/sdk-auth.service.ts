import { Injectable, UnauthorizedException } from "@nestjs/common";
import { SdkKeysService } from "../sdk-keys/sdk-keys.service";
import { SdkEvaluationContext } from "./sdk-evaluation-context";

export const sdkKeyHeaderName = "x-flagforge-key";

@Injectable()
export class SdkAuthService {
  constructor(private readonly sdkKeysService: SdkKeysService) {}

  async authenticate(headerValue: string | string[] | undefined): Promise<SdkEvaluationContext> {
    const secret = Array.isArray(headerValue) ? headerValue[0] : headerValue;

    if (!secret) {
      throw new UnauthorizedException("SDK key is required");
    }

    const sdkKey = await this.sdkKeysService.findActiveBySecret(secret);

    if (!sdkKey?.environment?.project) {
      throw new UnauthorizedException("SDK key is invalid");
    }

    const usedSdkKey = await this.sdkKeysService.markUsed(sdkKey);

    return {
      environment: sdkKey.environment,
      sdkKey: usedSdkKey
    };
  }
}
