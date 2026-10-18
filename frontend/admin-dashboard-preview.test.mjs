import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
const page=readFileSync(new URL("./admin-dashboard-preview.html",import.meta.url),"utf8");
const edge=readFileSync(new URL("../backend/edge/admin-read/index.ts",import.meta.url),"utf8");
test("admin API requires JWT and confirmed app_admins membership",()=>{
 assert.ok(edge.includes("/auth/v1/user"));
 assert.ok(edge.includes("/rest/v1/app_admins?user_id="));
 assert.ok(edge.includes("if(!identity)return reply(403"));
 assert.ok(edge.includes("verify")===false || edge.includes("Bearer"));
});
test("admin API does not expose write actions",()=>{
 assert.ok(edge.includes('req.method!=="GET"'));
 assert.ok(!edge.includes('"Access-Control-Allow-Origin":"*"'));
 assert.ok(edge.includes("&limit=50"));
});
test("admin UI exposes no service-role key or unsafe record injection",()=>{
 assert.ok(page.includes("grant_type=password"));
 assert.ok(page.includes('adminGet("me")'));
 assert.ok(!page.includes("SUPABASE_SERVICE_ROLE_KEY"));
 assert.ok(!page.includes("localStorage"));
 assert.ok(!page.includes(".innerHTML="));
 assert.ok(page.includes("textContent="));
});
