CREATE TABLE "videos" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"profile_id" uuid NOT NULL,
	"url" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "stories" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"profile_id" uuid NOT NULL,
	"media_url" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"expires_at" timestamp with time zone NOT NULL
);
--> statement-breakpoint
ALTER TABLE "profiles" ADD COLUMN "address" text;--> statement-breakpoint
ALTER TABLE "profiles" ADD COLUMN "postal_code" text;--> statement-breakpoint
ALTER TABLE "profiles" ADD COLUMN "latitude" numeric(10, 7);--> statement-breakpoint
ALTER TABLE "profiles" ADD COLUMN "longitude" numeric(10, 7);--> statement-breakpoint
ALTER TABLE "plans" ADD COLUMN "max_photos" integer;--> statement-breakpoint
ALTER TABLE "plans" ADD COLUMN "max_videos" integer;--> statement-breakpoint
ALTER TABLE "plans" ADD COLUMN "max_stories" integer;--> statement-breakpoint
ALTER TABLE "videos" ADD CONSTRAINT "videos_profile_id_profiles_id_fk" FOREIGN KEY ("profile_id") REFERENCES "public"."profiles"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "stories" ADD CONSTRAINT "stories_profile_id_profiles_id_fk" FOREIGN KEY ("profile_id") REFERENCES "public"."profiles"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "videos_profile_idx" ON "videos" USING btree ("profile_id");--> statement-breakpoint
CREATE INDEX "stories_profile_idx" ON "stories" USING btree ("profile_id");--> statement-breakpoint
CREATE INDEX "stories_expires_idx" ON "stories" USING btree ("expires_at");--> statement-breakpoint
CREATE UNIQUE INDEX "profiles_user_id_unique" ON "profiles" USING btree ("user_id");