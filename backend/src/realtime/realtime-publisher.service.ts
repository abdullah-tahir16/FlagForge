import { Injectable, Logger } from "@nestjs/common";
import { randomUUID } from "crypto";
import { AuthenticatedUser } from "../auth/authenticated-user";
import type { PublishConfigurationChangedInput, RealtimeEvent } from "./realtime-event.type";
import { RealtimeEventType } from "./realtime-event.type";

interface RealtimeSubscriber {
  id: string;
  organizationId: string;
  send: (frame: string) => void;
}

@Injectable()
export class RealtimePublisherService {
  private readonly logger = new Logger(RealtimePublisherService.name);
  private readonly subscribers = new Map<string, RealtimeSubscriber>();

  subscribe(user: AuthenticatedUser, send: (frame: string) => void): { id: string; unsubscribe: () => void } {
    const id = randomUUID();
    this.subscribers.set(id, {
      id,
      organizationId: user.organizationId,
      send
    });

    return {
      id,
      unsubscribe: () => this.subscribers.delete(id)
    };
  }

  publishConfigurationChanged(input: PublishConfigurationChangedInput): void {
    const event: RealtimeEvent = {
      action: input.action,
      environmentIds: input.environmentIds ?? [],
      id: randomUUID(),
      occurredAt: new Date().toISOString(),
      organizationId: input.organizationId,
      projectId: input.projectId,
      resourceId: input.resourceId,
      resourceType: input.resourceType,
      type: RealtimeEventType.ConfigurationChanged
    };

    this.publish(event);
  }

  publish(event: RealtimeEvent): void {
    const frame = this.formatEvent(event);

    for (const subscriber of this.subscribers.values()) {
      if (subscriber.organizationId !== event.organizationId) {
        continue;
      }

      try {
        subscriber.send(frame);
      } catch (error) {
        this.logger.warn(`Realtime subscriber ${subscriber.id} failed: ${error instanceof Error ? error.message : String(error)}`);
      }
    }
  }

  createHeartbeatFrame(): string {
    return ": heartbeat\n\n";
  }

  getSubscriberCount(): number {
    return this.subscribers.size;
  }

  private formatEvent(event: RealtimeEvent): string {
    return [`id: ${event.id}`, `event: ${event.type}`, `data: ${JSON.stringify(event)}`, "", ""].join("\n");
  }
}
