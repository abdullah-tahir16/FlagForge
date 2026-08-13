import { randomBytes, createHash } from "node:crypto";
import { Injectable } from "@nestjs/common";
import { Environment } from "../environments/environment.entity";

@Injectable()
export class SdkKeySecretService {
  generate(environment: Environment): string {
    const environmentKey = environment.key.replace(/[^a-z0-9]/gi, "").toLowerCase() || "env";
    return `ff_${environmentKey}_sk_${randomBytes(24).toString("base64url")}`;
  }

  hash(secret: string): string {
    return createHash("sha256").update(secret).digest("hex");
  }

  prefix(secret: string): string {
    return secret.slice(0, 20);
  }
}
