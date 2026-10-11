/**
 * ======================================================
 * PUBLIC PORTFOLIO DATA HOOK
 * ======================================================
 *
 * Loads public portfolio data from Supabase.
 *
 * Loading strategy:
 *
 * 1. Critical:
 *    - profile
 *    - site settings
 *    - projects
 *    - project images
 *
 * 2. Secondary:
 *    - skills
 *    - experience
 *    - education
 *    - certificates
 *    - services
 *    - social links
 *
 * 3. Background:
 *    - approved comments
 *
 * Performance goal:
 * Make the first screen visible faster.
 *
 * ======================================================
 */

import { useEffect, useState } from "react";

import { configured, supabase } from "../lib/supabase.js";

import { preview } from "../data/preview.js";

import { readPublic, readSingleton } from "../lib/api.js";

export function usePortfolio() {
  const [state, setState] = useState({
    data: configured ? null : preview,

    loading: configured,

    error: "",
  });

  useEffect(() => {
    if (!configured) return;

    let active = true;

    const controller = new AbortController();

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
          profile,

          site_settings: settings,

          ...Object.fromEntries(
            criticalTables.map((name, index) => [name, criticalResults[index]]),
          ),

          // placeholders

          skills: [],

          experience: [],

          education: [],

          certificates: [],

          services: [],

          social_links: [],

          comments: [],
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
              secondaryTables.map((name, index) => [name, secondaryResults[index]]),
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

              comments: comments || [],
            },
          }));
        }
      } catch (error) {
        if (!active) return;

        setState({
          data: null,

          loading: false,

          error: error.message || "Failed loading portfolio.",
        });
      }
    }

    loadPortfolio();

    return () => {
      active = false;

      controller.abort();
    };
  }, []);

  return state;
}
