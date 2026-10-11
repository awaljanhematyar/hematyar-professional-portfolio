/**
 * ======================================================
 * PUBLIC PORTFOLIO DATA HOOK
 * ======================================================
 *
 * Loads public portfolio data from Supabase.
 *
 * Strategy:
 *
 * 1. Show local preview instantly
 *
 * 2. Load critical database data:
 *    - profile
 *    - site settings
 *    - projects
 *    - project images
 *
 * 3. Load secondary data:
 *    - skills
 *    - experience
 *    - education
 *    - certificates
 *    - services
 *    - social links
 *
 * 4. Load comments in background
 *
 * ======================================================
 */

import { useEffect, useState } from "react";

import { configured, supabase } from "../lib/supabase.js";

import { preview } from "../data/preview.js";

import { readPublic, readSingleton } from "../lib/api.js";

export function usePortfolio() {
  const [state, setState] = useState({
    // Show preview immediately

    data: preview,

    loading: false,

    error: "",
  });

  useEffect(() => {
    // If Supabase is not configured,
    // keep showing preview.

    if (!configured) return;

    let active = true;

    async function loadPortfolio() {
      try {
        /*
        ==========================================
        STEP 1
        CRITICAL DATA
        ==========================================
        */

        const criticalTables = ["projects", "project_images"];

        const [profile, settings, ...criticalResults] = await Promise.all([
          readSingleton("profiles"),

          readSingleton("site_settings"),

          ...criticalTables.map(readPublic),
        ]);

        if (!active) return;

        const criticalData = {
          ...preview,

          profile: profile || preview.profile,

          site_settings: settings || preview.site_settings,

          ...Object.fromEntries(
            criticalTables.map((name, index) => [
              name,

              criticalResults[index] || preview[name],
            ]),
          ),
        };

        setState({
          data: criticalData,

          loading: false,

          error: "",
        });

        /*
        ==========================================
        STEP 2
        SECONDARY DATA
        ==========================================
        */

        const secondaryTables = [
          "skills",

          "experience",

          "education",

          "certificates",

          "services",

          "social_links",
        ];

        const secondaryResults = await Promise.all(secondaryTables.map(readPublic));

        if (!active) return;

        setState((previous) => ({
          ...previous,

          data: {
            ...previous.data,

            ...Object.fromEntries(
              secondaryTables.map((name, index) => [
                name,

                secondaryResults[index] || preview[name],
              ]),
            ),
          },
        }));

        /*
        ==========================================
        STEP 3
        COMMENTS
        ==========================================
        */

        const {
          data: comments,

          error,
        } = await supabase.rpc("get_approved_comments");

        if (!error && active) {
          setState((previous) => ({
            ...previous,

            data: {
              ...previous.data,

              comments: comments || preview.comments,
            },
          }));
        }
      } catch (error) {
        if (!active) return;

        // Keep preview instead of blank page

        setState({
          data: preview,

          loading: false,

          error: error.message || "Failed loading portfolio.",
        });
      }
    }

    loadPortfolio();

    return () => {
      active = false;
    };
  }, []);

  return state;
}
