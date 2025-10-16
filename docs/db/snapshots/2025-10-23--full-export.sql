--
-- PostgreSQL database dump
--

-- Dumped from database version 15.3 (Supabase build)
-- Dumped by pg_dump version 15.3
--
-- Dump completed on 2025-10-23 08:10:00 UTC

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: pl_site; Type: SCHEMA; Schema: -; Owner: postgres
--

CREATE SCHEMA IF NOT EXISTS pl_site;

COMMENT ON SCHEMA pl_site IS 'Dynamic tables for Paula Livingstone site';

SET search_path = pl_site, pg_catalog;

--
-- Name: schema_version; Type: TABLE; Schema: pl_site; Owner: postgres
--

CREATE TABLE IF NOT EXISTS schema_version (
    id integer NOT NULL,
    version text NOT NULL,
    updated_at timestamptz DEFAULT timezone('utc'::text, now())
);

ALTER TABLE schema_version OWNER TO postgres;

--
-- Name: schema_version schema_version_pkey; Type: CONSTRAINT; Schema: pl_site; Owner: postgres
--

ALTER TABLE ONLY schema_version
    ADD CONSTRAINT schema_version_pkey PRIMARY KEY (id);

--
-- Data for Name: schema_version; Type: TABLE DATA; Schema: pl_site; Owner: postgres
--

INSERT INTO schema_version (id, version, updated_at) VALUES (1, '2025-10-14T1830', '2025-10-21 08:57:03+00')
    ON CONFLICT (id) DO UPDATE SET version = EXCLUDED.version, updated_at = EXCLUDED.updated_at;

--
-- Name: comments; Type: TABLE; Schema: pl_site; Owner: postgres
--

CREATE TABLE IF NOT EXISTS comments (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    post_slug text NOT NULL,
    name text NOT NULL,
    email text,
    body text NOT NULL,
    created_at timestamptz DEFAULT timezone('utc'::text, now()) NOT NULL,
    approved boolean DEFAULT false NOT NULL
);

ALTER TABLE comments OWNER TO postgres;

--
-- Name: comments ix_comments_post_slug_created_at; Type: INDEX; Schema: pl_site; Owner: postgres
--

CREATE INDEX IF NOT EXISTS ix_comments_post_slug_created_at ON comments USING btree (post_slug, created_at DESC);

--
-- Name: contact_messages; Type: TABLE; Schema: pl_site; Owner: postgres
--

CREATE TABLE IF NOT EXISTS contact_messages (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    name text NOT NULL,
    email text NOT NULL,
    subject text,
    body text NOT NULL,
    created_at timestamptz DEFAULT timezone('utc'::text, now()) NOT NULL,
    handled boolean DEFAULT false NOT NULL
);

ALTER TABLE contact_messages OWNER TO postgres;

--
-- Name: contact_messages ix_contact_messages_created_at; Type: INDEX; Schema: pl_site; Owner: postgres
--

CREATE INDEX IF NOT EXISTS ix_contact_messages_created_at ON contact_messages USING btree (created_at DESC);

--
-- Name: comments comments_rls; Type: POLICY; Schema: pl_site; Owner: postgres
--

ALTER TABLE comments ENABLE ROW LEVEL SECURITY;
CREATE POLICY allow_service_writes ON comments FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY allow_public_reads ON comments FOR SELECT USING (approved = true);

--
-- Name: contact_messages contact_messages_rls; Type: POLICY; Schema: pl_site; Owner: postgres
--

ALTER TABLE contact_messages ENABLE ROW LEVEL SECURITY;
CREATE POLICY allow_service_writes ON contact_messages FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY block_public_reads ON contact_messages FOR SELECT USING (false);

RESET ALL;

--
-- PostgreSQL database dump complete
--
