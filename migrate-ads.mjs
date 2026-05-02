import { neon } from "@neondatabase/serverless";

const sql = neon(
  "postgresql://neondb_owner:npg_h3unW6kwCBpM@ep-rough-darkness-alotfcg2-pooler.c-3.eu-central-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require"
);

async function main() {
  // Create enum if not exists
  await sql`
    DO $$ BEGIN
      CREATE TYPE ad_position AS ENUM (
        'header_banner', 'sidebar_top', 'sidebar_bottom',
        'article_top', 'article_middle', 'article_bottom', 'footer_banner'
      );
    EXCEPTION WHEN duplicate_object THEN NULL;
    END $$;
  `;

  // Create ads table if not exists
  await sql`
    CREATE TABLE IF NOT EXISTS ads (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      title VARCHAR(200) NOT NULL,
      position ad_position NOT NULL,
      image_url TEXT,
      link_url TEXT,
      advertiser VARCHAR(200),
      is_active BOOLEAN NOT NULL DEFAULT true,
      impressions INTEGER NOT NULL DEFAULT 0,
      clicks INTEGER NOT NULL DEFAULT 0,
      start_date TIMESTAMP,
      end_date TIMESTAMP,
      created_at TIMESTAMP NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMP NOT NULL DEFAULT NOW()
    )
  `;

  console.log("Migration complete: ads table created");
}

main().catch(console.error);
