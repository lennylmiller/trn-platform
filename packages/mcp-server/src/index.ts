#!/usr/bin/env node
/**
 * TRN Platform MCP Server — stdio entry point.
 *
 * Loads .env from the repo root, then starts the MCP server
 * communicating over stdin/stdout.
 */
import { config } from 'dotenv';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { createServer } from './server.js';

// Load .env from repo root (or path specified by DOTENV_CONFIG_PATH)
config({ path: process.env.DOTENV_CONFIG_PATH ?? '.env' });

const server = createServer();
const transport = new StdioServerTransport();
await server.connect(transport);
