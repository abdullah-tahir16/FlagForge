import { Environment } from "../environments/environment.entity";
import { SdkKey } from "../sdk-keys/sdk-key.entity";

export interface SdkEvaluationContext {
  environment: Environment;
  sdkKey: SdkKey;
}
