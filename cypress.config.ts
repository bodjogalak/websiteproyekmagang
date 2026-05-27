import { defineConfig } from "cypress";
import * as dotenv from 'dotenv';

// Tell dotenv to read your root .env file
dotenv.config();

export default defineConfig({
  allowCypressEnv: true,

  e2e: {
    setupNodeEvents(on, config) {
      config.env = {
        ...config.env,
        ADMIN_EMAIL: process.env.ADMIN_INITIAL_EMAIL,
        ADMIN_PASSWORD: process.env.ADMIN_INITIAL_PASSWORD,
        USER_EMAIL: process.env.USER_EMAIL,
        USER_PASSWORD: process.env.USER_PASSWORD,
      };

      return config;
    },
  },
});
