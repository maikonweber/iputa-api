import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
  UnprocessableEntityException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Stripe from 'stripe';
import { eq } from 'drizzle-orm';
import { DrizzleService } from '../../database/drizzle.service';
import { plans, subscriptions, users } from '../../database/schema';
import type { Plan } from '../../database/schema';

@Injectable()
export class StripeService {
  private readonly logger = new Logger(StripeService.name);
  private readonly stripe: InstanceType<typeof Stripe>;

  constructor(
    private readonly configService: ConfigService,
    private readonly drizzle: DrizzleService,
  ) {
    const secretKey = this.configService.get<string>('STRIPE_SECRET_KEY', '');
    if (secretKey.startsWith('pk_')) {
      this.logger.warn(
        'STRIPE_SECRET_KEY starts with pk_: use the secret key (sk_...) from Stripe Dashboard, not the publishable key.',
      );
    }
    this.stripe = new Stripe(secretKey);
  }

  /** Price ID from DB column or STRIPE_PRICE_<PLAN_NAME> in .env (e.g. STRIPE_PRICE_PREMIUM). */
  private resolveStripePriceId(plan: Plan): string | null {
    const fromDb = plan.stripePriceId?.trim();
    if (fromDb) return fromDb;
    const envKey = `STRIPE_PRICE_${plan.name.toUpperCase()}`;
    const fromEnv = this.configService.get<string>(envKey, '')?.trim();
    return fromEnv || null;
  }

  async createCheckoutSession(userId: string, profileId: string, planId: string) {
    const plan = await this.drizzle.db.query.plans.findFirst({
      where: eq(plans.id, planId),
    });

    if (!plan) {
      throw new NotFoundException('Plano não encontrado');
    }

    if (plan.name === 'free') {
      throw new BadRequestException('O plano gratuito não requer checkout');
    }

    const stripePriceId = this.resolveStripePriceId(plan);
    if (!stripePriceId) {
      throw new UnprocessableEntityException(
        `Price ID do Stripe não configurado para o plano "${plan.name}". ` +
          `Preencha stripe_price_id na tabela plans ou defina ${`STRIPE_PRICE_${plan.name.toUpperCase()}`} no .env.`,
      );
    }

    const user = await this.drizzle.db.query.users.findFirst({
      where: eq(users.id, userId),
    });

    let customerId = user?.stripeCustomerId;

    if (!customerId) {
      const customer = await this.stripe.customers.create({
        email: user?.email,
        metadata: { userId },
      });
      customerId = customer.id;

      await this.drizzle.db
        .update(users)
        .set({ stripeCustomerId: customerId })
        .where(eq(users.id, userId));
    }

    const appUrl = this.configService.get<string>('APP_URL', 'http://localhost:4000');

    const session = await this.stripe.checkout.sessions.create({
      customer: customerId,
      mode: 'subscription',
      line_items: [{ price: stripePriceId, quantity: 1 }],
      metadata: { profileId, planId, userId },
      success_url: `${appUrl}/subscription/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${appUrl}/subscription/cancel`,
    });

    return { url: session.url, sessionId: session.id };
  }

  async handleWebhookEvent(payload: Buffer, signature: string) {
    const webhookSecret = this.configService.get<string>('STRIPE_WEBHOOK_SECRET', '');

    let event: any;
    try {
      event = this.stripe.webhooks.constructEvent(payload, signature, webhookSecret);
    } catch (err) {
      this.logger.error('Webhook signature verification failed', err);
      throw err;
    }

    switch (event.type) {
      case 'checkout.session.completed':
        await this.onCheckoutCompleted(event.data.object);
        break;
      case 'customer.subscription.updated':
        await this.onSubscriptionUpdated(event.data.object);
        break;
      case 'customer.subscription.deleted':
        await this.onSubscriptionDeleted(event.data.object);
        break;
      default:
        this.logger.log(`Unhandled event type: ${event.type}`);
    }
  }

  private async onCheckoutCompleted(session: any) {
    const { profileId, planId } = session.metadata ?? {};
    if (!profileId || !planId) return;

    const stripeSubscriptionId =
      typeof session.subscription === 'string'
        ? session.subscription
        : session.subscription?.id;

    if (!stripeSubscriptionId) return;

    const plan = await this.drizzle.db.query.plans.findFirst({
      where: eq(plans.id, planId),
    });

    const now = new Date();
    const endDate = new Date(now);
    endDate.setDate(now.getDate() + (plan?.durationDays ?? 30));

    await this.drizzle.db.insert(subscriptions).values({
      profileId,
      planId,
      startDate: now,
      endDate,
      active: true,
      stripeSubscriptionId,
    });

    this.logger.log(`Subscription created for profile ${profileId}, plan ${planId}`);
  }

  private async onSubscriptionUpdated(sub: any) {
    const active = sub.status === 'active';

    await this.drizzle.db
      .update(subscriptions)
      .set({ active })
      .where(eq(subscriptions.stripeSubscriptionId, sub.id));

    this.logger.log(`Subscription ${sub.id} updated: active=${active}`);
  }

  private async onSubscriptionDeleted(sub: any) {
    await this.drizzle.db
      .update(subscriptions)
      .set({ active: false })
      .where(eq(subscriptions.stripeSubscriptionId, sub.id));

    this.logger.log(`Subscription ${sub.id} cancelled`);
  }
}
