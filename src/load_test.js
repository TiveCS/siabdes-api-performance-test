import { check, fail, sleep } from "k6";
import { loginUsecase } from "./usecases/auth.js";
import { createJournalUsecase } from "./usecases/journals.js";
import { UNIT_IDENTIFIER, UNIT_PASSWORD } from "./data/index.js";
import { randomIntBetween } from "./lib/util.js";
import {
  createEmployeeUsecase,
  createPph21TaxUsecase,
} from "./usecases/pph21.js";
import { createPpnTaxUsecase } from "./usecases/ppn.js";

export const options = {
  stages: [
    { duration: "2m", target: 54 }, // 10% of 540 users
    { duration: "3m", target: 162 }, // 30% of 540 users
    { duration: "3m", target: 270 }, // 50% of 540 users
    { duration: "3m", target: 378 }, // 70% of 540 users (peak of normal usage)
    { duration: "2m", target: 0 },
  ],
  thresholds: {
    // 90% of requests must finish within 2 seconds.
    http_req_duration: ["p(90) < 2000"],

    // Error rate must be lower than 5%.
    http_req_failed: ["rate<0.05"],

    // 95% of request's checks must be successful.
    checks: ["rate>0.95"],
  },
};

// The function that defines VU logic.
//
// See https://grafana.com/docs/k6/latest/examples/get-started-with-k6/ to learn more
// about authoring k6 scripts.
//
export default function () {
  /**
   * Scenario idea:
   * Assuming unit is already registered, which covered in smoke-test.js
   *
   * 1. All users login on same username and password, so the data populated by load-test.js can be reused.
   * 2. Add new transactions of general journal for laba rugi (8 times)
   * 3. Add new transactions of general journal for posisi keuangan (8 times)
   * 4. Add new employee
   * 5. Add new pph21 taxes of that employee (12 times, each month)
   * 6. Add new ppn taxes (4 times)
   */

  const loginResponse = loginUsecase(UNIT_IDENTIFIER, UNIT_PASSWORD);

  const loginCheck = check(loginResponse, {
    "status is 201": (r) => r.status === 201,
  });

  if (!loginCheck) {
    fail(`Failed to login (status: ${loginResponse.status})`);
  }

  const { user, backendTokens } = loginResponse.json()["data"];

  sleep(2);

  for (let j = 0; j < 2; j++) {
    // j = 0 for laba rugi, j = 1 for posisi keuangan
    // Add new transactions of general journal for laba rugi (8 times)
    for (let i = 0; i < 8; i++) {
      const journalResponse = createJournalUsecase(
        user.unitId,
        backendTokens.accessToken,
        j === 1
      );

      const journalCheck = check(journalResponse, {
        "status is 201": (r) => r.status === 201,
      });

      if (!journalCheck) {
        console.log(
          `Failed to create journal ${i + 1} (status: ${
            journalResponse.status
          })`
        );
      }

      // Sleep for a random duration between 15-20 seconds
      // Simulate user interaction to input journal data
      sleep(randomIntBetween(8, 15));
    }
  }

  sleep(2);

  // Add an employee as permanent employee
  const employeeResponse = createEmployeeUsecase(
    user.unitId,
    backendTokens.accessToken
  );

  const employeeCheck = check(employeeResponse, {
    "status is 201": (r) => r.status === 201,
  });

  const { id: employeeId } = employeeResponse.json()["data"];

  if (!employeeCheck) {
    fail(`Failed to add employee (status: ${employeeResponse.status})`);
  }

  sleep(2);

  // Add new pph21 taxes of that employee (12 times, each month)
  for (let i = 0; i < 12; i++) {
    const pph21Response = createPph21TaxUsecase(
      backendTokens.accessToken,
      employeeId,
      i + 1
    );

    const pph21Check = check(pph21Response, {
      "status is 201": (r) => r.status === 201,
    });

    if (!pph21Check) {
      console.log(
        `Failed to create PPH21 tax ${i + 1} (status: ${pph21Response.status})`
      );
    }

    sleep(randomIntBetween(8, 15));
  }

  sleep(2);

  // Add new ppn taxes (4 times)
  for (let i = 0; i < 4; i++) {
    // Create PPN tax
    const ppnResponse = createPpnTaxUsecase(
      user.unitId,
      backendTokens.accessToken
    );

    const ppnCheck = check(ppnResponse, {
      "status is 201": (r) => r.status === 201,
    });

    if (!ppnCheck) {
      console.log(
        `Failed to create PPN tax ${i + 1} (status: ${ppnResponse.status})`
      );
    }

    sleep(randomIntBetween(5, 12));
  }
}
