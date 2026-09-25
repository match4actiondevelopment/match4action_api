jest.mock("https", () => ({
  request: jest.fn(),
}));

const https = require("https");
const { EventEmitter } = require("events");
const {
  prepareEmail,
  sendEmail,
} = require("../services/notificationEmail");

const record = {
  organisationId: "owner",
  initiativeId: "role",
  volunteerName: "Volunteer",
  volunteerEmail: "person@example.org",
  roleName: "Mentor",
  appliedAt: new Date("2026-09-25T12:00:00Z"),
};

beforeEach(() => {
  process.env.EMAIL_MODE = "test";
  process.env.VERCEL_ENV = "preview";
  process.env.EMAIL_FROM = "sender@example.org";
  process.env.RESEND_API_KEY = "not-a-real-key";
  process.env.EMAIL_TEST_TO = "test@example.org";
  process.env.NOTIFICATION_WEB_URL =
    "https://staging.example.org";
  process.env.ORG_NOTIFICATION_EMAILS =
    JSON.stringify({
      owner: ["org@example.org"],
    });
});

test("test mode redirects recipients and labels the message", () => {
  const result = prepareEmail(record);

  expect(result.intendedRecipients).toEqual([
    "org@example.org",
  ]);
  expect(result.payload.to).toEqual([
    "test@example.org",
  ]);
  expect(result.payload.subject).toMatch(
    /^\[STAGING TEST\]/
  );
  expect(result.payload.text).toContain(
    "2026-09-25T12:00:00.000Z"
  );
});

test("live sending is blocked in Vercel preview", () => {
  process.env.EMAIL_MODE = "live";

  expect(() => prepareEmail(record)).toThrow(
    "LIVE_EMAIL_BLOCKED_IN_PREVIEW"
  );
});

test.each([
  [
    "EMAIL_MODE",
    "disabled",
    "EMAIL_DISABLED",
  ],
  [
    "RESEND_API_KEY",
    "",
    "EMAIL_PROVIDER_NOT_CONFIGURED",
  ],
  [
    "EMAIL_FROM",
    "bad",
    "INVALID_SENDER",
  ],
  [
    "ORG_NOTIFICATION_EMAILS",
    "bad-json",
    "INVALID_RECIPIENT_CONFIGURATION",
  ],
  [
    "ORG_NOTIFICATION_EMAILS",
    "{}",
    "MISSING_OR_INVALID_ORGANISATION_RECIPIENT",
  ],
  [
    "ORG_NOTIFICATION_EMAILS",
    '{"owner":["bad"]}',
    "MISSING_OR_INVALID_ORGANISATION_RECIPIENT",
  ],
  [
    "EMAIL_TEST_TO",
    "",
    "INVALID_TEST_RECIPIENT",
  ],
  [
    "NOTIFICATION_WEB_URL",
    "http://example.org",
    "INVALID_PLATFORM_URL",
  ],
])(
  "rejects invalid configuration %s",
  (key, value, reason) => {
    process.env[key] = value;

    expect(() => prepareEmail(record)).toThrow(
      reason
    );
  }
);

test("does not guess missing volunteer details", () => {
  expect(() =>
    prepareEmail({
      ...record,
      volunteerEmail: "",
    })
  ).toThrow("MISSING_VOLUNTEER_DETAILS");
});

test("user content stays in plain text", () => {
  const result = prepareEmail({
    ...record,
    volunteerName: "<script>bad()</script>",
    roleName: "Role\r\nInjected",
  });

  expect(result.payload.html).toBeUndefined();
  expect(result.payload.subject).not.toMatch(
    /[\r\n]/
  );
});

function mockProvider(status, body) {
  const outgoing = new EventEmitter();
  outgoing.destroy = jest.fn();

  https.request.mockImplementation(
    (_url, _options, callback) => {
      outgoing.end = jest.fn(() => {
        const incoming = new EventEmitter();

        incoming.setEncoding = jest.fn();
        incoming.statusCode = status;

        callback(incoming);

        incoming.emit("data", body);
        incoming.emit("end");
        outgoing.emit("close");
      });

      return outgoing;
    }
  );

  return outgoing;
}

test("request uses the stable key and exact payload", async () => {
  const outgoing = mockProvider(
    200,
    '{"id":"email-1"}'
  );
  const payload = prepareEmail(record).payload;

  await expect(
    sendEmail(payload, "application-123")
  ).resolves.toBe("email-1");

  expect(
    https.request.mock.calls[0][0]
  ).toBe("https://api.resend.com/emails");

  expect(
    https.request.mock.calls[0][1].headers[
      "Idempotency-Key"
    ]
  ).toBe("application-123");

  expect(
    JSON.parse(outgoing.end.mock.calls[0][0])
  ).toEqual(payload);
});

test("provider errors are sanitized", async () => {
  mockProvider(
    503,
    '{"message":"private provider details"}'
  );

  await expect(
    sendEmail(
      prepareEmail(record).payload,
      "application-123"
    )
  ).rejects.toThrow("EMAIL_PROVIDER_HTTP_503");
});

test("invalid response is not treated as sent", async () => {
  mockProvider(200, "{}");

  await expect(
    sendEmail(
      prepareEmail(record).payload,
      "application-123"
    )
  ).rejects.toThrow(
    "INVALID_EMAIL_PROVIDER_RESPONSE"
  );
});