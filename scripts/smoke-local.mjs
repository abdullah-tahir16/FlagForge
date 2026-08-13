const apiUrl = process.env.FLAGFORGE_API_URL ?? "http://localhost:3001/api/v1";
const frontendUrl = process.env.FLAGFORGE_FRONTEND_URL ?? "http://localhost:5174";
const email = process.env.FLAGFORGE_DEMO_EMAIL ?? "user@example.com";
const password = process.env.FLAGFORGE_DEMO_PASSWORD ?? "password123";
const sdkKey = process.env.FLAGFORGE_DEMO_SDK_KEY ?? "ff_development_sk_local_demo_key";

const fail = (message) => {
  console.error(`Smoke check failed: ${message}`);
  process.exit(1);
};

const requestJson = async (url, options = {}) => {
  let response;

  try {
    response = await fetch(url, options);
  } catch (error) {
    fail(`${url} is unavailable (${error instanceof Error ? error.message : String(error)})`);
  }

  const body = await response.text();

  if (!response.ok) {
    fail(`${url} returned ${response.status}: ${body}`);
  }

  try {
    return body ? JSON.parse(body) : null;
  } catch {
    fail(`${url} did not return valid JSON: ${body}`);
  }
};

const requestOk = async (url) => {
  try {
    const response = await fetch(url);

    if (!response.ok) {
      fail(`${url} returned ${response.status}`);
    }
  } catch (error) {
    fail(`${url} is unavailable (${error instanceof Error ? error.message : String(error)})`);
  }
};

const main = async () => {
  const health = await requestJson(`${apiUrl}/health`);

  if (health?.status !== "ok") {
    fail(`health response was unexpected: ${JSON.stringify(health)}`);
  }

  await requestOk(frontendUrl);

  const session = await requestJson(`${apiUrl}/auth/login`, {
    body: JSON.stringify({ email, password }),
    headers: { "Content-Type": "application/json" },
    method: "POST"
  });

  if (!session?.accessToken) {
    fail("login did not return an access token; run the demo seed before smoke checks");
  }

  const authHeaders = { Authorization: `Bearer ${session.accessToken}` };
  const projects = await requestJson(`${apiUrl}/projects`, { headers: authHeaders });
  const project = Array.isArray(projects) ? projects.find((item) => item.key === "checkout-platform") ?? projects[0] : null;

  if (!project?.id) {
    fail("no project is available for the seeded demo user");
  }

  const evaluation = await requestJson(`${apiUrl}/sdk/evaluate/new-checkout`, {
    body: JSON.stringify({
      country: "IT",
      plan: "premium",
      userId: "flagforge-smoke-user"
    }),
    headers: {
      "Content-Type": "application/json",
      "X-FlagForge-Key": sdkKey
    },
    method: "POST"
  });

  if (typeof evaluation?.value !== "boolean" || typeof evaluation?.reason !== "string") {
    fail(`evaluation response was unexpected: ${JSON.stringify(evaluation)}`);
  }

  const analytics = await requestJson(`${apiUrl}/projects/${project.id}/analytics/overview?range=24h`, {
    headers: authHeaders
  });

  if (typeof analytics?.totalEvaluations !== "number") {
    fail(`analytics overview response was unexpected: ${JSON.stringify(analytics)}`);
  }

  console.log(
    JSON.stringify(
      {
        analyticsTotalEvaluations: analytics.totalEvaluations,
        apiUrl,
        evaluation: {
          reason: evaluation.reason,
          value: evaluation.value
        },
        frontendUrl,
        projectId: project.id,
        status: "ok"
      },
      null,
      2
    )
  );
};

await main();
