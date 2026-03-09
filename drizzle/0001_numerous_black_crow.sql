ALTER TABLE "profiles" ADD COLUMN "telegram" text;--> statement-breakpoint
ALTER TABLE "profiles" ADD COLUMN "skin_color" text;--> statement-breakpoint
ALTER TABLE "profiles" ADD COLUMN "hair_color" text;--> statement-breakpoint
ALTER TABLE "profiles" ADD COLUMN "eye_color" text;--> statement-breakpoint
ALTER TABLE "profiles" ADD COLUMN "body_type" text;--> statement-breakpoint
ALTER TABLE "profiles" ADD COLUMN "height" integer;--> statement-breakpoint
ALTER TABLE "profiles" ADD COLUMN "weight" integer;--> statement-breakpoint
ALTER TABLE "profiles" ADD COLUMN "ethnicity" text;--> statement-breakpoint
ALTER TABLE "profiles" ADD COLUMN "has_place" boolean DEFAULT false;--> statement-breakpoint
ALTER TABLE "profiles" ADD COLUMN "attends_hotels" boolean DEFAULT true;--> statement-breakpoint
ALTER TABLE "profiles" ADD COLUMN "attends_homes" boolean DEFAULT true;--> statement-breakpoint
ALTER TABLE "profiles" ADD COLUMN "price_night" numeric(10, 2);--> statement-breakpoint
CREATE INDEX "profiles_skin_color_idx" ON "profiles" USING btree ("skin_color");--> statement-breakpoint
CREATE INDEX "profiles_body_type_idx" ON "profiles" USING btree ("body_type");